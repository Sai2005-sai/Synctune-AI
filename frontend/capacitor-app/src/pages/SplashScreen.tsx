import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileLayout } from '../components/SharedComponents';
import { useAuth } from '../context/AuthContext';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
         navigate('/home');
      } else {
         navigate('/onboarding-1');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate, user]);
  return (
    <MobileLayout
      hideNav
      className="flex flex-col items-center justify-center relative">
      
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-purple/20 via-dark-bg to-dark-bg" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-32 h-32 flex items-center justify-center mb-6">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 rounded-full bg-gradient-accent blur-xl opacity-50" />
          
          <div className="relative w-24 h-24 bg-dark-surface rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-accent opacity-20" />
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%">
                  
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
              <path d="M12 2v20" strokeDasharray="2 4" opacity="0.5" />
            </svg>
          </div>
        </div>

        <motion.h1
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.3
          }}
          className="font-display text-4xl font-bold text-white mb-2 tracking-tight">
          
          SyncTune{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-cyan">
            AI
          </span>
        </motion.h1>

        <motion.p
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          transition={{
            delay: 0.6
          }}
          className="text-text-secondary text-sm font-medium tracking-wide">
          
          AI-Powered Music for Your Videos
        </motion.p>
      </div>
    </MobileLayout>);

}