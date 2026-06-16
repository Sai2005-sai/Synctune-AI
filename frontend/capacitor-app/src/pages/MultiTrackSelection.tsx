import React, { useState, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MobileLayout,
  GradientButton,
  GlassCard,
  MoodChip } from
'../components/SharedComponents';
import { ArrowLeft, Check, Search } from 'lucide-react';
export default function MultiTrackSelection() {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 3]);
  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  const tracks = [
  {
    id: 1,
    title: 'Echoes of Silence',
    artist: 'Lumina Audio',
    bpm: 65,
    mood: 'Calm',
    img: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Midnight Rain',
    artist: 'Aura Sound',
    bpm: 72,
    mood: 'Sad',
    img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Rising Sun',
    artist: 'Cinematic Scores',
    bpm: 120,
    mood: 'Energetic',
    img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 4,
    title: 'Deep Ocean',
    artist: 'Waveform',
    bpm: 68,
    mood: 'Cinematic',
    img: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 5,
    title: 'Summer Breeze',
    artist: 'Pop Works',
    bpm: 115,
    mood: 'Happy',
    img: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 6,
    title: 'Neon Nights',
    artist: 'Synthwave',
    bpm: 130,
    mood: 'Energetic',
    img: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=200&auto=format&fit=crop'
  }];

  return (
    <MobileLayout hideNav className="flex flex-col relative pb-24">
      <div className="sticky top-0 z-20 bg-dark-bg/90 backdrop-blur-xl px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
              
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-display text-xl font-bold text-white">
              Select Tracks
            </h1>
          </div>
          <div className="bg-accent-purple/20 text-accent-purple px-3 py-1 rounded-full text-sm font-bold border border-accent-purple/30">
            {selectedIds.length} Selected
          </div>
        </div>

        <p className="text-text-secondary text-sm mb-4">
          Select multiple tracks to create variations for different segments of
          your video.
        </p>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-secondary" />
          </div>
          <input
            type="text"
            placeholder="Search tracks..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-purple transition-all" />
          
        </div>
      </div>

      <div className="p-6 space-y-3">
        {tracks.map((track, i) => {
          const isSelected = selectedIds.includes(track.id);
          return (
            <motion.div
              key={track.id}
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: i * 0.05
              }}
              onClick={() => toggleSelection(track.id)}>
              
              <GlassCard
                className={`p-3 flex items-center gap-4 transition-all cursor-pointer ${isSelected ? 'border-accent-cyan bg-accent-cyan/5 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : ''}`}>
                
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={track.img}
                    alt={track.title}
                    className="w-full h-full object-cover" />
                  
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-sm truncate">
                    {track.title}
                  </h3>
                  <p className="text-text-secondary text-xs truncate">
                    {track.artist}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/80">
                      {track.bpm} BPM
                    </span>
                    <MoodChip mood={track.mood} />
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-accent-cyan border-accent-cyan' : 'border-white/20 bg-white/5'}`}>
                  
                  {isSelected &&
                  <Check size={14} className="text-dark-bg font-bold" />
                  }
                </div>
              </GlassCard>
            </motion.div>);

        })}
      </div>

      <div className="fixed bottom-0 w-full max-w-[390px] p-6 bg-dark-bg/90 backdrop-blur-xl border-t border-white/10 z-20">
        <GradientButton
          onClick={() => navigate('/variation-plan')}
          className="w-full"
          disabled={selectedIds.length === 0}>
          
          Continue with {selectedIds.length} tracks
        </GradientButton>
      </div>
    </MobileLayout>);

}