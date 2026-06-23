const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'synctune_super_secret_key';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'SyncTune API is running!' });
});

app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, auth_provider, photo } = req.body;
    
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        // Hash password
        let hashedPassword = password;
        if (password && auth_provider !== 'Google' && auth_provider !== 'Apple') {
            hashedPassword = await bcrypt.hash(password, 10);
        } else if (!password) {
             hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
        }

        // Insert into users
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([{ name, email, password: hashedPassword, auth_provider: auth_provider || 'local', photo: photo || null }])
            .select()
            .single();

        if (userError) {
            if (userError.code === '23505') {
                return res.status(409).json({ error: 'Email already exists' });
            }
            console.error('Insert error:', userError);
            return res.status(500).json({ error: 'Database error: ' + userError.message });
        }
        
        // Log activity
        await supabase
            .from('activity')
            .insert([{ user_id: userData.id, action: 'REGISTER', details: 'User registered account' }]);

        // Generate Token
        const token = jwt.sign({ id: userData.id, email: userData.email, name: userData.name }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ message: 'User created successfully', token, user: userData });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error || !user) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        // Log activity
        await supabase
            .from('activity')
            .insert([{ user_id: user.id, action: 'LOGIN', details: 'User logged in' }]);

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, photo: user.photo } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: 'Email and new password required' });

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const { data, error } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('email', email)
            .select();
        
        if (error || !data || data.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }
        
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/auth/check-user', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('name')
            .eq('email', email)
            .single();
        
        if (error || !user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ exists: true, name: user.name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/projects/:userIdentifier', async (req, res) => {
    const { userIdentifier } = req.params;
    try {
        let userId = userIdentifier;
        if (userIdentifier.includes('@')) {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('email', userIdentifier)
                .single();
            if (userError || !userData) {
                return res.status(404).json({ error: 'User not found' });
            }
            userId = userData.id;
        }

        const { data, error } = await supabase
            .from('activity')
            .select('*')
            .eq('user_id', userId)
            .eq('action', 'CREATE_PROJECT')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Fetch projects error:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        const projects = data.map(item => {
            try {
                return JSON.parse(item.details);
            } catch (e) {
                return null;
            }
        }).filter(p => p !== null);
        
        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/projects', async (req, res) => {
    const { userId, email, project } = req.body;
    if (!userId && !email) return res.status(400).json({ error: 'User ID or Email is required' });
    if (!project) return res.status(400).json({ error: 'Project details required' });
    
    try {
        let targetUserId = userId;
        if (!targetUserId && email) {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();
            if (userError || !userData) {
                return res.status(404).json({ error: 'User not found' });
            }
            targetUserId = userData.id;
        }

        // Fetch existing CREATE_PROJECT activities to check if project exists
        const { data: existingActivities, error: fetchError } = await supabase
            .from('activity')
            .select('*')
            .eq('user_id', targetUserId)
            .eq('action', 'CREATE_PROJECT');

        let existingRowId = null;
        if (existingActivities && !fetchError) {
            for (const act of existingActivities) {
                try {
                    const parsed = JSON.parse(act.details);
                    if (parsed && (parsed.id === project.id || parsed.name === project.name)) {
                        existingRowId = act.id;
                        break;
                    }
                } catch (e) {}
            }
        }

        let resultData, dbError;
        if (existingRowId) {
            // Update existing activity row
            const { data, error } = await supabase
                .from('activity')
                .update({ details: JSON.stringify(project) })
                .eq('id', existingRowId)
                .select();
            resultData = data;
            dbError = error;
        } else {
            // Insert new activity row
            const { data, error } = await supabase
                .from('activity')
                .insert([{ user_id: targetUserId, action: 'CREATE_PROJECT', details: JSON.stringify(project) }])
                .select();
            resultData = data;
            dbError = error;
        }
            
        if (dbError) {
            console.error('Save project error:', dbError);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(200).json({ message: 'Project saved successfully', project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
