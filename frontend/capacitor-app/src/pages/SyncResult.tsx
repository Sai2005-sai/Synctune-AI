import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MobileLayout,
  GradientButton,
  OutlinedButton,
  ProgressSteps,
  GlassCard } from
'../components/SharedComponents';
import { ArrowLeft, CheckCircle2, Play, Sliders } from 'lucide-react';
export default function SyncResult() {
  const navigate = useNavigate();
  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-bold text-white flex items-center gap-2">
          Sync Complete{' '}
          <CheckCircle2 size={20} className="text-status-success" />
        </h1>
      </div>

      <ProgressSteps currentStep={4} totalSteps={5} />

      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="mt-8 flex-1 flex flex-col">
        
        <GlassCard className="p-6 mb-8 flex flex-col items-center text-center border-accent-cyan/30 bg-accent-cyan/5">
          <div className="w-16 h-16 rounded-full bg-accent-cyan/20 flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-accent-cyan" />
          </div>
          <h2 className="font-display text-lg font-bold text-white mb-2">
            Perfectly Aligned!
          </h2>
          <p className="text-sm text-text-secondary">
            AI has successfully synced 3 audio tracks to match your video's
            scene transitions and energy flow.
          </p>
        </GlassCard>

        <h3 className="font-display font-bold text-white mb-4">
          Final Timeline
        </h3>

        <div className="relative w-full h-32 bg-dark-surface rounded-xl border border-white/10 overflow-hidden mb-2 shadow-lg">
          {/* Video Track */}
          <div className="absolute top-0 w-full h-1/2 border-b border-white/10 flex">
            <div className="h-full w-1/3 border-r border-white/10 relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=200&auto=format&fit=crop"
                className="w-full h-full object-cover opacity-50" />
              
            </div>
            <div className="h-full w-1/3 border-r border-white/10 relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1516280440502-62f542981c26?q=80&w=200&auto=format&fit=crop"
                className="w-full h-full object-cover opacity-50" />
              
            </div>
            <div className="h-full w-1/3 relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=200&auto=format&fit=crop"
                className="w-full h-full object-cover opacity-50" />
              
            </div>
          </div>

          {/* Audio Track */}
          <div className="absolute bottom-0 w-full h-1/2 flex">
            <div className="h-full w-1/3 bg-accent-purple/80 border-r border-dark-bg flex items-center justify-center relative">
              <span className="text-[10px] font-bold text-white truncate px-2">
                Echoes...
              </span>
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/40 to-transparent" />
            </div>
            <div className="h-full w-1/3 bg-accent-cyan/80 border-r border-dark-bg flex items-center justify-center relative">
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/40 to-transparent" />
              <span className="text-[10px] font-bold text-dark-bg truncate px-2">
                Rising Sun
              </span>
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/40 to-transparent" />
            </div>
            <div className="h-full w-1/3 bg-accent-purple/80 flex items-center justify-center relative">
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/40 to-transparent" />
              <span className="text-[10px] font-bold text-white truncate px-2">
                Echoes...
              </span>
            </div>
          </div>

          {/* Playhead */}
          <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-white z-10 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        </div>

        <div className="flex justify-between text-xs text-text-secondary font-medium px-1">
          <span>0:00</span>
          <span>2:15</span>
        </div>
      </motion.div>

      <div className="mt-auto pt-6 space-y-3">
        <GradientButton
          onClick={() => navigate('/preview')}
          icon={Play}
          className="w-full">
          
          Preview Final Video
        </GradientButton>
        <OutlinedButton
          onClick={() => navigate('/manual-adjust')}
          icon={Sliders}
          className="w-full">
          
          Manual Adjustments
        </OutlinedButton>
      </div>
    </MobileLayout>);

}