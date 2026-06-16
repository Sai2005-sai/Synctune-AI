import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MobileLayout,
  GradientButton,
  GlassCard } from
'../components/SharedComponents';
import { ScanSearch, AudioLines, Share2 } from 'lucide-react';
export default function Onboarding2() {
  const navigate = useNavigate();
  const features = [
  {
    icon: ScanSearch,
    title: 'Analyze',
    desc: 'AI detects mood, energy, and scenes',
    color: 'text-accent-purple',
    bg: 'bg-accent-purple/10'
  },
  {
    icon: AudioLines,
    title: 'Sync',
    desc: 'Perfect music alignment with cuts',
    color: 'text-accent-blue',
    bg: 'bg-accent-blue/10'
  },
  {
    icon: Share2,
    title: 'Export',
    desc: 'Share in any format instantly',
    color: 'text-accent-cyan',
    bg: 'bg-accent-cyan/10'
  }];

  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-12">
      <div className="flex-1 flex flex-col">
        <motion.div
          initial={{
            y: 20,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          className="text-center mb-10 mt-8">
          
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            How it Works
          </h2>
          <p className="text-text-secondary text-base">
            Three simple steps to professional audio
          </p>
        </motion.div>

        <div className="space-y-4">
          {features.map((feature, index) =>
          <motion.div
            key={index}
            initial={{
              x: 50,
              opacity: 0
            }}
            animate={{
              x: 0,
              opacity: 1
            }}
            transition={{
              delay: index * 0.15
            }}>
            
              <GlassCard className="flex items-center gap-4 p-5">
                <div
                className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center shrink-0`}>
                
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-sm">{feature.desc}</p>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-8 flex flex-col items-center gap-6">
        <div className="flex gap-2">
          <div className="w-2 h-1.5 rounded-full bg-white/20" />
          <div className="w-6 h-1.5 rounded-full bg-gradient-accent" />
        </div>

        <GradientButton onClick={() => navigate('/sign-in')} className="w-full">
          Get Started
        </GradientButton>
      </div>
    </MobileLayout>);

}