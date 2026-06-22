import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MobileLayout,
  GradientButton,
  OutlinedButton } from
'../components/SharedComponents';
import { Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import emailjs from '@emailjs/browser';
import { API_URL } from '../config';

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const safeAlert = (msg: string) => {
    console.log("[Alert]", msg);
    if (typeof window !== 'undefined' && !window.navigator.webdriver) {
      alert(msg);
    }
  };

  // Forgot password state
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error === 'Account not found') {
          if (window.confirm('Account not found! Would you like to register?')) {
            navigate('/register');
          }
        } else {
          alert(data.error || 'Login failed');
        }
        return;
      }
      
      localStorage.setItem('synctune_token', data.token);
      login(data.user.email, data.user.name);
      navigate('/home');
    } catch (err) {
      console.error(err);
      alert('Network error - Is the backend running?');
    }
  };

  // OAuth state
  const [oauthProvider, setOauthProvider] = useState<string | null>(null);
  const [customOauthEmail, setCustomOauthEmail] = useState('');
  const [showCustomOauthInput, setShowCustomOauthInput] = useState(false);

  const handleOAuthLogin = (provider: string, email: string, name: string, photo?: string) => {
    registerOAuthUser(email, name, provider, photo);
    login(email, name, photo);
    navigate('/home');
  };

  const handleOAuthClick = (provider: string) => {
    setOauthProvider(provider);
    setShowCustomOauthInput(false);
    setCustomOauthEmail('');
  };

  const registerOAuthUser = async (email: string, name: string, provider: string, photo?: string) => {
    try {
      await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, auth_provider: provider, photo })
      });
      // We don't block login on error, because if it's "Email already exists", it just means they are a returning OAuth user.
    } catch (e) {
      console.error(e);
    }
  };

  const handleRealGoogleLoginSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        const decoded: any = jwtDecode(credentialResponse.credential);
        const { email, name, picture } = decoded;
        registerOAuthUser(email, name, 'Google', picture);
        login(email, name, picture);
        navigate('/home');
      } catch (error) {
        console.error("Error decoding Google JWT:", error);
      }
    }
  };

  const handleCustomOAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (oauthProvider && customOauthEmail) {
      const name = customOauthEmail.split('@')[0];
      handleOAuthLogin(oauthProvider, customOauthEmail, name);
    }
  };

  const [generatedOtp, setGeneratedOtp] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      
      if (!response.ok) {
        safeAlert('Email not found in our system!');
        return;
      }
      
      const userData = await response.json();
      
      // Generate a real 4-digit random OTP
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(otpCode);
      (window as any).generatedOtp = otpCode; // Expose to window for Selenium testing
      
      try {
        // Replace these with your actual EmailJS credentials
        const EMAILJS_SERVICE_ID = "service_jehqf1q";
        const EMAILJS_TEMPLATE_ID = "template_phl80e7";
        const EMAILJS_PUBLIC_KEY = "PSjw0Qim_VvXUfAMD";

        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            to_email: forgotEmail,
            to_name: userData.name,
            otp_code: otpCode
          },
          { publicKey: EMAILJS_PUBLIC_KEY }
        );
        
        safeAlert(`Real OTP successfully sent to ${forgotEmail}! Check your inbox.`);
        setOtpSent(true);
      } catch (err: any) {
        console.error("Failed to send email:", err);
        // Fallback for offline testing or limit issues: expose it clearly
        safeAlert(`OTP code is: ${otpCode} (EmailJS error fallback)`);
        setOtpSent(true);
      }
    } catch (err) {
      console.error(err);
      safeAlert('Network error - Is the backend running?');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedOtp) {
      safeAlert('Invalid OTP!');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, newPassword })
      });
      
      const data = await response.json();
      if (!response.ok) {
        safeAlert(data.error || 'Password reset failed');
        return;
      }
      
      safeAlert('Password reset successfully! Please sign in.');
      setShowForgotPwd(false);
      setOtpSent(false);
      setOtp('');
      setNewPassword('');
      setGeneratedOtp('');
    } catch (err) {
      console.error(err);
      safeAlert('Network error - Is the backend running?');
    }
  };

  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-12 relative">
      <div className="flex flex-col items-center mb-10 mt-8">
        <div className="w-16 h-16 bg-dark-surface rounded-2xl border border-white/10 flex items-center justify-center shadow-lg mb-6">
          <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-dark-bg flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-accent-cyan" />
            </div>
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-text-secondary text-sm">
          Sign in to continue to SyncTune AI
        </p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-5">
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
              placeholder="Enter your password"
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
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowForgotPwd(true)}
            className="text-sm text-accent-cyan font-medium hover:underline">
            Forgot Password?
          </button>
        </div>

        <GradientButton type="submit" className="w-full mt-2">
          Sign In
        </GradientButton>
      </form>


      <div className="mt-auto pt-8 text-center">
        <p className="text-text-secondary text-sm">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-white font-medium hover:underline">
            
            Register
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPwd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-dark-surface border border-white/10 rounded-2xl p-6 w-full max-w-sm relative"
            >
              <button
                onClick={() => setShowForgotPwd(false)}
                className="absolute top-4 right-4 text-text-secondary hover:text-white"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-xl font-bold text-white mb-2">Reset Password</h2>
              
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <p className="text-sm text-text-secondary mb-4">Enter your registered email address to receive an OTP.</p>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-purple"
                    required
                  />
                  <GradientButton type="submit" className="w-full">Send OTP</GradientButton>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <p className="text-sm text-text-secondary mb-4">Enter the OTP sent to your email and your new password.</p>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-purple"
                    required
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-purple"
                    required
                    minLength={6}
                  />
                  <GradientButton type="submit" className="w-full">Reset Password</GradientButton>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* OAuth Account Selection Modal */}
        {oauthProvider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-dark-surface border border-white/10 rounded-2xl p-6 w-full max-w-sm relative flex flex-col"
            >
              <button
                onClick={() => setOauthProvider(null)}
                className="absolute top-4 right-4 text-text-secondary hover:text-white"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                {oauthProvider === 'Google' ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.34-.85 3.73-.78 1.52.03 2.73.65 3.48 1.76-2.97 1.7-2.48 5.75.46 6.95-.73 1.83-1.63 3.42-2.75 4.24zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                )}
                <h2 className="text-xl font-bold text-white">Sign in with {oauthProvider}</h2>
              </div>
              
              {!showCustomOauthInput ? (
                <div className="space-y-2">
                  <p className="text-sm text-text-secondary mb-4">Choose an account</p>
                  
                  <button 
                    onClick={() => handleOAuthLogin(oauthProvider, `alex.morgan@${oauthProvider.toLowerCase()}.com`, 'Alex Morgan')}
                    className="w-full flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-accent-purple/50 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center text-white font-bold text-lg">A</div>
                    <div>
                      <div className="text-white font-medium">Alex Morgan</div>
                      <div className="text-text-secondary text-xs">alex.morgan@{oauthProvider.toLowerCase()}.com</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleOAuthLogin(oauthProvider, `sarah.j@${oauthProvider.toLowerCase()}.com`, 'Sarah Jenkins')}
                    className="w-full flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-accent-purple/50 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-white font-bold text-lg">S</div>
                    <div>
                      <div className="text-white font-medium">Sarah Jenkins</div>
                      <div className="text-text-secondary text-xs">sarah.j@{oauthProvider.toLowerCase()}.com</div>
                    </div>
                  </button>

                  <div className="my-4 h-px bg-white/10 w-full" />
                  
                  <button 
                    onClick={() => setShowCustomOauthInput(true)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-text-secondary group-hover:text-white transition-colors">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <div className="text-white font-medium text-sm group-hover:text-accent-cyan transition-colors">Use another account</div>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomOAuthSubmit} className="space-y-4">
                  <p className="text-sm text-text-secondary mb-4">Enter the email address you use with {oauthProvider}.</p>
                  <input
                    type="email"
                    value={customOauthEmail}
                    onChange={(e) => setCustomOauthEmail(e.target.value)}
                    placeholder="Email or phone"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-purple"
                    required
                  />
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowCustomOauthInput(false)} className="flex-1 py-3 text-sm font-medium text-white bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                      Back
                    </button>
                    <GradientButton type="submit" className="flex-1">
                      Next
                    </GradientButton>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileLayout>);

}