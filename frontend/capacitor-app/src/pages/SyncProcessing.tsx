import React, { useEffect, useState, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileLayout, AILoader } from '../components/SharedComponents';
export default function SyncProcessing() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => navigate('/sync-result'), 500);
          return 100;
        }
        return prev + 1;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [navigate]);
  return (
    <MobileLayout
      hideNav
      className="flex flex-col items-center justify-center relative">
      
      {/* Decorative animated timeline background */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none flex flex-col justify-center gap-8">
        <motion.div
          animate={{
            x: [-390, 390]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="h-4 w-[200%] bg-gradient-to-r from-transparent via-accent-purple to-transparent" />
        
        <motion.div
          animate={{
            x: [390, -390]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="h-4 w-[200%] bg-gradient-to-r from-transparent via-accent-cyan to-transparent" />
        
      </div>

      <div className="relative z-10 w-full px-8 flex flex-col items-center">
        <AILoader text="Aligning music with scenes..." />

        <div className="w-full max-w-[240px] mt-16">
          <div className="flex justify-between text-xs font-medium text-text-secondary mb-2">
            <span>Syncing Audio</span>
            <span className="text-accent-cyan">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div
              className="h-full bg-gradient-accent"
              style={{
                width: `${progress}%`
              }}
              layout />
            
          </div>
        </div>
      </div>
    </MobileLayout>);

}