import React, { useState, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MobileLayout,
  GradientButton,
  GlassCard } from
'../components/SharedComponents';
import { ArrowLeft, Volume2, Sliders } from 'lucide-react';
export default function SegmentEditor() {
  const navigate = useNavigate();
  const [volume, setVolume] = useState(80);
  const [fadeIn, setFadeIn] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-bold text-white">
          Edit Audio
        </h1>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Zoomed Timeline */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-text-secondary mb-2">
            <span>0:00</span>
            <span className="text-white font-medium">Segment 1</span>
            <span>0:45</span>
          </div>
          <div className="relative w-full h-32 bg-dark-surface rounded-xl border border-white/10 overflow-hidden">
            {/* Waveform representation */}
            <div className="absolute inset-0 flex items-center px-4 gap-1 opacity-50">
              {Array.from({
                length: 40
              }).map((_, i) =>
              <div
                key={i}
                className="flex-1 bg-accent-purple rounded-full"
                style={{
                  height: `${Math.max(10, Math.random() * 80)}%`
                }} />

              )}
            </div>

            {/* Fade overlays */}
            {fadeIn &&
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-dark-surface to-transparent z-10" />
            }
            {fadeOut &&
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-dark-surface to-transparent z-10" />
            }

            {/* Playhead */}
            <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-accent-cyan z-20 shadow-[0_0_10px_rgba(6,182,212,0.8)]">
              <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 rounded-full bg-accent-cyan" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white font-medium">
                <Volume2 size={18} />
                <span>Volume</span>
              </div>
              <span className="text-accent-cyan font-bold">{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-cyan" />
            
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2 text-white font-medium mb-4">
              <Sliders size={18} />
              <span>Transitions</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white">Fade In</div>
                  <div className="text-xs text-text-secondary">
                    Smooth volume increase at start
                  </div>
                </div>
                <button
                  onClick={() => setFadeIn(!fadeIn)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${fadeIn ? 'bg-accent-cyan' : 'bg-white/20'}`}>
                  
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${fadeIn ? 'left-7' : 'left-1'}`} />
                  
                </button>
              </div>

              <div className="h-px w-full bg-white/10" />

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white">Fade Out</div>
                  <div className="text-xs text-text-secondary">
                    Smooth volume decrease at end
                  </div>
                </div>
                <button
                  onClick={() => setFadeOut(!fadeOut)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${fadeOut ? 'bg-accent-cyan' : 'bg-white/20'}`}>
                  
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${fadeOut ? 'left-7' : 'left-1'}`} />
                  
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <GradientButton
          onClick={() => navigate('/variation-plan')}
          className="w-full">
          
          Save Changes
        </GradientButton>
      </div>
    </MobileLayout>);

}