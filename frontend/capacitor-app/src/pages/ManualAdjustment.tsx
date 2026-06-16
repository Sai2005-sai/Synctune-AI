import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MobileLayout,
  GradientButton,
  GlassCard } from
'../components/SharedComponents';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
export default function ManualAdjustment() {
  const navigate = useNavigate();
  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-xl font-bold text-white">
            Fine Tune
          </h1>
        </div>
        <button className="text-text-secondary hover:text-white transition-colors flex items-center gap-1 text-sm font-medium">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Mini Video Preview */}
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 mb-8 relative">
          <img
            src="https://images.unsplash.com/photo-1516280440502-62f542981c26?q=80&w=600&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-80" />
          
          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
            <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Play
                size={14}
                className="text-white ml-0.5"
                fill="currentColor" />
              
            </button>
            <div className="flex-1 h-1 bg-white/30 rounded-full">
              <div className="w-[45%] h-full bg-accent-cyan rounded-full" />
            </div>
          </div>
        </div>

        <h3 className="text-sm font-medium text-white mb-4">
          Drag handles to adjust timing
        </h3>

        {/* Large Editor Timeline */}
        <div className="relative w-full h-40 bg-dark-surface rounded-xl border border-white/10 overflow-hidden mb-8">
          {/* Time markers */}
          <div className="absolute top-0 w-full h-6 border-b border-white/10 flex justify-between px-2 text-[10px] text-text-secondary items-center bg-white/5">
            <span>0:00</span>
            <span>0:30</span>
            <span>1:00</span>
            <span>1:30</span>
            <span>2:00</span>
          </div>

          {/* Tracks area */}
          <div className="absolute top-6 bottom-0 w-full flex items-center px-4">
            {/* Segment 1 */}
            <div className="h-16 w-[33%] bg-accent-purple/40 border border-accent-purple rounded-l-lg relative group">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">Seg 1</span>
              </div>
              {/* Drag Handle Right */}
              <div className="absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize flex items-center justify-center z-10">
                <div className="w-1.5 h-8 bg-white rounded-full shadow-md" />
              </div>
            </div>

            {/* Segment 2 */}
            <div className="h-16 w-[33%] bg-accent-cyan/40 border-y border-accent-cyan relative group">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">Seg 2</span>
              </div>
              {/* Drag Handle Right */}
              <div className="absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize flex items-center justify-center z-10">
                <div className="w-1.5 h-8 bg-white rounded-full shadow-md" />
              </div>
            </div>

            {/* Segment 3 */}
            <div className="h-16 w-[34%] bg-accent-purple/40 border border-accent-purple rounded-r-lg relative group">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">Seg 3</span>
              </div>
            </div>

            {/* Playhead */}
            <div className="absolute top-0 bottom-0 left-[45%] w-0.5 bg-white z-20">
              <div className="absolute -top-2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white" />
            </div>
          </div>
        </div>

        {/* Selected Segment Info */}
        <GlassCard className="p-4 border-accent-cyan/30 bg-accent-cyan/5">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-white">Segment 2</h4>
            <span className="text-xs font-medium text-accent-cyan">
              0:45 - 1:30
            </span>
          </div>
          <p className="text-xs text-text-secondary mb-3">
            Track: Rising Sun (120 BPM)
          </p>
          <div className="flex gap-2">
            <button className="flex-1 py-1.5 bg-white/10 rounded text-xs font-medium text-white hover:bg-white/20">
              Fade In
            </button>
            <button className="flex-1 py-1.5 bg-white/10 rounded text-xs font-medium text-white hover:bg-white/20">
              Fade Out
            </button>
          </div>
        </GlassCard>
      </div>

      <div className="mt-auto pt-6">
        <GradientButton
          onClick={() => navigate('/sync-result')}
          className="w-full">
          
          Apply Changes
        </GradientButton>
      </div>
    </MobileLayout>);

}