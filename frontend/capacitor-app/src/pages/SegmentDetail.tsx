import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MobileLayout,
  GradientButton,
  GlassCard,
  MoodChip,
  EnergyBadge } from
'../components/SharedComponents';
import { ArrowLeft, Play, RefreshCw, SlidersHorizontal } from 'lucide-react';
export default function SegmentDetail() {
  const navigate = useNavigate();
  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-bold text-white">Segment 1</h1>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Segment Preview */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 mb-6">
          <img
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600&auto=format&fit=crop"
            alt="Segment preview"
            className="w-full h-full object-cover opacity-70" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Play size={24} className="text-white ml-1" fill="currentColor" />
            </button>
          </div>
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-white">
            0:00 — 0:45
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-text-secondary text-xs mb-2">
              Detected Mood
            </span>
            <MoodChip mood="Calm" />
          </GlassCard>
          <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-text-secondary text-xs mb-2">
              Energy Level
            </span>
            <EnergyBadge level="Low" />
          </GlassCard>
        </div>

        <h3 className="font-display font-bold text-white mb-4">
          Assigned Track
        </h3>

        <GlassCard className="p-4 flex items-center gap-4 mb-6 border-accent-purple bg-accent-purple/5">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
            <img
              src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop"
              alt="Track"
              className="w-full h-full object-cover" />
            
            <div className="absolute inset-0 bg-accent-purple/20 mix-blend-overlay" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white text-sm truncate">
              Echoes of Silence
            </h4>
            <p className="text-text-secondary text-xs truncate">Lumina Audio</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/80">
                65 BPM
              </span>
              <span className="text-[10px] text-accent-cyan font-medium">
                98% Match
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="mt-auto pt-6 space-y-3">
        <GradientButton
          onClick={() => navigate('/segment-editor')}
          icon={SlidersHorizontal}
          className="w-full">
          
          Edit Segment Audio
        </GradientButton>
        <button
          onClick={() => navigate('/multi-track')}
          className="w-full py-3.5 flex items-center justify-center gap-2 text-text-secondary hover:text-white transition-colors font-medium text-sm">
          
          <RefreshCw size={18} />
          Change Track
        </button>
      </div>
    </MobileLayout>);

}