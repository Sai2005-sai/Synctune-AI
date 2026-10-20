import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileLayout, ProgressSteps, GlassCard } from '../components/SharedComponents';
import { ArrowLeft, Play, Pause } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createAudioPlayer, stopAllGlobalAudio } from '../engine/audioPlayer';
import { ALL_TRACKS } from '../data/musicLibrary';

const FILTERS = ['Best Match', 'Energetic', 'Calm', 'Cinematic', 'Happy', 'Sad'];

export default function RecommendedTracks() {
  const navigate = useNavigate();
  const { matchedTracks, selectedTrackId, selectTrack } = useApp();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('Best Match');
  const playerRef = React.useRef(createAudioPlayer());

  const displayed = activeFilter === 'Best Match'
    ? matchedTracks
    : ALL_TRACKS.filter(t => t.mood?.toLowerCase() === activeFilter.toLowerCase())
        .map((t, idx) => ({ ...t, matchScore: Math.max(75, 96 - idx * 3) }));

  const handlePlay = (track: any) => {
    if (playingId === track.id) {
      playerRef.current.pause();
      setPlayingId(null);
      return;
    }
    const uri = typeof track.asset === 'string' ? track.asset : '';
    if (!uri) {
      console.warn('No audio URI for track:', track.title);
      return;
    }
    playerRef.current.play(uri).then(() => {
      setPlayingId(track.id);
      playerRef.current.setOnEnded(() => setPlayingId(null));
    }).catch(err => {
      console.warn('Audio playback error:', err);
      setPlayingId(null);
    });
  };

  const stopAndNavigate = async (path: string) => {
    try {
      await playerRef.current.stop();
    } catch {}
    stopAllGlobalAudio();
    setPlayingId(null);
    navigate(path);
  };

  React.useEffect(() => {
    return () => {
      try {
        playerRef.current.dispose();
      } catch {}
      stopAllGlobalAudio();
    };
  }, []);

  if (matchedTracks.length === 0) {
    return (
      <MobileLayout hideNav className="flex flex-col items-center justify-center px-6 pb-20">
        <p className="text-text-secondary mb-4">No tracks found. Please run analysis first.</p>
        <button onClick={() => stopAndNavigate('/upload')} className="text-accent-cyan underline">Go to Upload</button>
      </MobileLayout>
    );
  }

  const playingTrack = displayed.find(t => t.id === playingId) || matchedTracks.find(t => t.id === playingId);

  return (
    <MobileLayout hideNav className="flex flex-col relative pb-32">
      <div className="sticky top-0 z-20 bg-dark-bg/90 backdrop-blur-xl px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => stopAndNavigate(-1 as any)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-display text-xl font-bold text-white">Recommended</h1>
          </div>
          <div className="text-xs font-bold text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded-full border border-accent-cyan/20">
            {matchedTracks.length} tracks
          </div>
        </div>
        <ProgressSteps currentStep={4} totalSteps={5} />
        <div className="flex gap-2 overflow-x-auto pb-2 mt-4 no-scrollbar -mx-6 px-6">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === f ? 'bg-white text-dark-bg font-bold' : 'bg-white/5 border border-white/10 text-text-secondary hover:text-white'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {displayed.map((track, i) => (
          <motion.div key={track.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard className={`p-3 flex items-center gap-4 transition-all ${selectedTrackId === track.id ? 'border-accent-purple bg-accent-purple/10' : ''}`}>
              <button
                className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-accent-purple/20 flex items-center justify-center group active:scale-95 transition-transform"
                onClick={() => handlePlay(track)}>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                  {playingId === track.id
                    ? <Pause size={22} className="text-white" fill="currentColor" />
                    : <Play size={22} className="text-white ml-0.5" fill="currentColor" />}
                </div>
                <span className="text-2xl">{track.mood === 'happy' ? '☀️' : track.mood === 'sad' ? '🌧' : track.mood === 'energetic' ? '⚡' : track.mood === 'cinematic' ? '🎬' : '🎵'}</span>
              </button>

              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => {
                selectTrack(track.id);
                stopAndNavigate('/track-details');
              }}>
                <h3 className="font-medium text-white text-sm truncate">{track.title}</h3>
                <p className="text-text-secondary text-xs truncate capitalize">{track.mood}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/80 font-medium">{track.bpm} BPM</span>
                  <span className="text-[10px] text-text-secondary capitalize">{track.mood}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="text-[10px] font-bold text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded-full border border-accent-cyan/20">
                  {Math.round(track.matchScore)}% Match
                </div>
                <button onClick={() => {
                  selectTrack(track.id);
                  stopAndNavigate('/preview');
                }}
                  className="bg-gradient-accent text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:scale-105 active:scale-95 transition-transform">
                  Apply
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Mini player */}
      {playingTrack && (
        <div className="fixed bottom-0 inset-x-0 w-full max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto bg-dark-surface/95 backdrop-blur-xl border-t border-white/10 p-4 pb-8 z-30 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center shrink-0">
              <div className="flex gap-1 items-end h-4">
                {[1, 2, 3].map(b => (
                  <div key={b} className="w-1 rounded-full animate-bounce"
                    style={{ height: `${40 + b * 20}%`, backgroundColor: b === 1 ? '#8B5CF6' : b === 2 ? '#3B82F6' : '#06B6D4', animationDelay: `${b * 0.15}s` }} />
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white text-sm font-semibold truncate">{playingTrack.title}</h4>
              <p className="text-text-secondary text-xs truncate capitalize">{playingTrack.mood} &bull; {playingTrack.bpm} BPM</p>
            </div>
            <button onClick={() => handlePlay(playingTrack)}
              className="w-10 h-10 rounded-full bg-white text-dark-bg flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform shadow-lg">
              <Pause size={18} fill="currentColor" />
            </button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}