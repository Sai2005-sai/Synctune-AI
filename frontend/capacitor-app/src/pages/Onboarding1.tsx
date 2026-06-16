import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileLayout, GradientButton } from '../components/SharedComponents';
import { Sparkles } from 'lucide-react';
export default function Onboarding1() {
  const navigate = useNavigate();
  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-12">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{
            scale: 0.9,
            opacity: 0
          }}
          animate={{
            scale: 1,
            opacity: 1
          }}
          transition={{
            duration: 0.5
          }}
          className="relative w-full aspect-square max-w-[280px] mb-12">
          
          <div className="absolute inset-0 bg-gradient-accent rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="relative w-full h-full glass-card rounded-[40px] flex items-center justify-center border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
            <div className="relative z-10 flex flex-col items-center">
              <Sparkles className="w-16 h-16 text-accent-cyan mb-4" />
              <div className="flex gap-2">
                <div className="w-2 h-12 bg-accent-purple rounded-full animate-[bounce_1s_infinite]" />
                <div className="w-2 h-20 bg-accent-blue rounded-full animate-[bounce_1.2s_infinite]" />
                <div className="w-2 h-16 bg-accent-cyan rounded-full animate-[bounce_0.8s_infinite]" />
                <div className="w-2 h-8 bg-accent-purple rounded-full animate-[bounce_1.5s_infinite]" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{
            y: 20,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            delay: 0.2
          }}
          className="text-center">
          
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            AI Music for
            <br />
            Your Videos
          </h2>
          <p className="text-text-secondary text-base leading-relaxed px-4">
            Instantly generate and sync the perfect background music tailored to
            your video's mood and energy.
          </p>
        </motion.div>
      </div>

      <div className="mt-auto pt-8 flex flex-col items-center gap-6">
        <div className="flex gap-2">
          <div className="w-6 h-1.5 rounded-full bg-gradient-accent" />
          <div className="w-2 h-1.5 rounded-full bg-white/20" />
        </div>

        <GradientButton
          onClick={() => navigate('/onboarding-2')}
          className="w-full">
          
          Next
        </GradientButton>

        <button
          onClick={() => navigate('/sign-in')}
          className="text-text-secondary text-sm font-medium hover:text-white transition-colors">
          
          Skip
        </button>
      </div>
    </MobileLayout>);

}