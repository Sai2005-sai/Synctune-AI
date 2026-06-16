import React, { useState, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout, GlassCard } from '../components/SharedComponents';
import { ArrowLeft, Play, Pause, Columns, Layers } from 'lucide-react';
export default function CompareView() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'split' | 'overlay'>('split');
  const [playing, setPlaying] = useState<'none' | 'original' | 'synctune'>(
    'none'
  );
  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-xl font-bold text-white">Compare</h1>
        </div>

        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
          <button
            onClick={() => setViewMode('split')}
            className={`p-1.5 rounded ${viewMode === 'split' ? 'bg-white/20 text-white' : 'text-text-secondary'}`}>
            
            <Columns size={16} />
          </button>
          <button
            onClick={() => setViewMode('overlay')}
            className={`p-1.5 rounded ${viewMode === 'overlay' ? 'bg-white/20 text-white' : 'text-text-secondary'}`}>
            
            <Layers size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* Original Video */}
        <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black">
          <img
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-80" />
          

          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold text-white border border-white/10">
            Original Audio
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <button
              onClick={() =>
              setPlaying(playing === 'original' ? 'none' : 'original')
              }
              className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:scale-105 transition-transform">
              
              {playing === 'original' ?
              <Pause size={24} className="text-white" fill="currentColor" /> :

              <Play
                size={24}
                className="text-white ml-1"
                fill="currentColor" />

              }
            </button>
          </div>

          {playing === 'original' &&
          <div className="absolute bottom-0 w-full h-1 bg-white/20">
              <div className="h-full bg-white w-1/3" />
            </div>
          }
        </div>

        {/* SyncTune Video */}
        <div className="flex-1 relative rounded-2xl overflow-hidden border-2 border-accent-cyan/50 bg-black shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <img
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-90" />
          

          <div className="absolute top-3 left-3 bg-gradient-accent px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-lg">
            With SyncTune AI
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <button
              onClick={() =>
              setPlaying(playing === 'synctune' ? 'none' : 'synctune')
              }
              className="w-14 h-14 rounded-full bg-gradient-accent flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
              
              {playing === 'synctune' ?
              <Pause size={24} className="text-white" fill="currentColor" /> :

              <Play
                size={24}
                className="text-white ml-1"
                fill="currentColor" />

              }
            </button>
          </div>

          {playing === 'synctune' &&
          <div className="absolute bottom-0 w-full h-1 bg-white/20">
              <div className="h-full bg-accent-cyan w-1/3" />
            </div>
          }
        </div>
      </div>

      <div className="mt-6">
        <GlassCard className="p-4 text-center">
          <p className="text-sm text-white/90">
            Hear the difference! The AI-synced version matches the mood
            perfectly and transitions audio exactly when the scene cuts.
          </p>
        </GlassCard>
      </div>
    </MobileLayout>);

}