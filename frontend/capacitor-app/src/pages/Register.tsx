import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MobileLayout, GradientButton } from '../components/SharedComponents';
import { Mail, Lock, User, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, auth_provider: 'local' })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || 'Registration failed');
        if (data.error === 'Email already exists') navigate('/sign-in');
        return;
      }
      
      // Successfully registered via backend
      localStorage.setItem('synctune_token', data.token);
      login(email, name);
      navigate('/home');
    } catch (err) {
      console.error(err);
      alert('Network error - Is the backend running?');
    }
  };
  // Simple password strength
  const strength =
  password.length === 0 ?
  0 :
  password.length < 6 ?
  1 :
  password.length < 10 ?
  2 :
  3;
  const strengthColors = [
  'bg-white/10',
  'bg-status-error',
  'bg-status-warning',
  'bg-status-success'];

  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-8">
      <div className="flex flex-col items-center mb-8 mt-4">
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Create Account
        </h1>
        <p className="text-text-secondary text-sm">Join SyncTune AI today</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary ml-1">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-text-secondary" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all"
              required />
            
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary ml-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-text-secondary" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all"
              required />
            
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary ml-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-text-secondary" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all"
              required />
            
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-white">
              
              {showPassword ?
              <EyeOff className="h-5 w-5" /> :

              <Eye className="h-5 w-5" />
              }
            </button>
          </div>

          {/* Password Strength Indicator */}
          <div className="flex gap-1 mt-2 px-1">
            <div
              className={`h-1 flex-1 rounded-full transition-colors ${strength >= 1 ? strengthColors[strength] : 'bg-white/10'}`} />
            
            <div
              className={`h-1 flex-1 rounded-full transition-colors ${strength >= 2 ? strengthColors[strength] : 'bg-white/10'}`} />
            
            <div
              className={`h-1 flex-1 rounded-full transition-colors ${strength >= 3 ? strengthColors[strength] : 'bg-white/10'}`} />
            
          </div>
          <p className="text-xs text-text-secondary text-right mt-1">
            {strength === 0 ?
            '' :
            strength === 1 ?
            'Weak' :
            strength === 2 ?
            'Good' :
            'Strong'}
          </p>
        </div>

        <label className="flex items-start gap-3 mt-4 cursor-pointer group">
          <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 rounded border border-white/20 bg-white/5 group-hover:border-accent-purple transition-colors">
            <input type="checkbox" className="peer sr-only" required />
            <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
            <div className="absolute inset-0 rounded bg-gradient-accent opacity-0 peer-checked:opacity-100 -z-10 transition-opacity" />
          </div>
          <span className="text-sm text-text-secondary leading-tight">
            I agree to the{' '}
            <a href="#" className="text-white hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-white hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>

        <GradientButton type="submit" className="w-full mt-6">
          Create Account
        </GradientButton>
      </form>

      <div className="mt-auto pt-8 text-center">
        <p className="text-text-secondary text-sm">
          Already have an account?{' '}
          <Link
            to="/sign-in"
            className="text-white font-medium hover:underline">
            
            Sign In
          </Link>
        </p>
      </div>
    </MobileLayout>);

}