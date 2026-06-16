import React, { useState, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MobileLayout,
  GradientButton,
  OutlinedButton,
  WaveformVisualizer } from
'../components/SharedComponents';
import { ArrowLeft, Play, Pause, Heart, Share2, Plus } from 'lucide-react';
export default function TrackDetails() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);
  return (
    <MobileLayout hideNav className="flex flex-col relative">
      {/* Background blur */}
      <div className="absolute inset-0 h-[50vh] bg-[url('https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-3xl" />

      <div className="relative z-10 flex flex-col min-h-screen px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-sm font-medium text-white/80 uppercase tracking-widest">
            Now Playing
          </h1>
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <Heart size={18} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="w-64 h-64 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 mb-8 relative group">
            <img
              src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop"
              alt="Album Art"
              className="w-full h-full object-cover" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="text-center mb-8 w-full">
            <h2 className="font-display text-2xl font-bold text-white mb-1">
              Echoes of Silence
            </h2>
            <p className="text-text-secondary text-base">Lumina Audio</p>
          </div>

          <div className="w-full mb-8">
            <WaveformVisualizer playing={isPlaying} />
            <div className="flex justify-between text-xs text-text-secondary mt-2 font-medium">
              <span>1:05</span>
              <span>2:45</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 mb-10 w-full">
            <button className="text-white/70 hover:text-white transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                
                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                <line x1="5" y1="19" x2="5" y2="5"></line>
              </svg>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 rounded-full bg-gradient-accent flex items-center justify-center text-white shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-105 transition-transform">
              
              {isPlaying ?
              <Pause size={32} fill="currentColor" /> :

              <Play size={32} className="ml-2" fill="currentColor" />
              }
            </button>

            <button className="text-white/70 hover:text-white transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                <line x1="19" y1="5" x2="19" y2="19"></line>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 w-full mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
              <div className="text-[10px] text-text-secondary mb-1">BPM</div>
              <div className="text-sm font-bold text-white">65</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
              <div className="text-[10px] text-text-secondary mb-1">Key</div>
              <div className="text-sm font-bold text-white">C Min</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
              <div className="text-[10px] text-text-secondary mb-1">Genre</div>
              <div className="text-sm font-bold text-white text-xs truncate">
                Ambient
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
              <div className="text-[10px] text-text-secondary mb-1">Match</div>
              <div className="text-sm font-bold text-accent-cyan">98%</div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mt-auto">
          <GradientButton
            onClick={() => navigate('/variation-plan')}
            className="w-full">
            
            Apply to Video
          </GradientButton>
          <OutlinedButton icon={Plus} className="w-full">
            Add to Queue
          </OutlinedButton>
        </div>
      </div>
    </MobileLayout>);

}