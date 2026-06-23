import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  MobileLayout,
  GradientButton,
  OutlinedButton,
  ProgressSteps,
  WaveformVisualizer,
} from '../components/SharedComponents';
import {
  ArrowLeft,
  Play,
  Pause,
  Maximize2,
  Volume2,
  Edit2,
  Link2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createAudioPlayer } from '../engine/audioPlayer';
import { ALL_TRACKS } from '../data/musicLibrary';

export default function PreviewScreen() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const { video, matchedTracks, selectedTrackId, segmentAssignments, linkLocalVideo } = useApp();

  const isFallbackVideo = video?.url?.includes('mov_bbb.mp4') || false;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLinkLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      linkLocalVideo(localUrl);
    }
  };
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioPlayerRef = useRef(createAudioPlayer());

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Redirect if no video
  if (!video) { return <Navigate to="/upload" replace />; }

  // Find selected track
  const selectedTrack = matchedTracks.find(t => t.id === selectedTrackId)
    || ALL_TRACKS.find(t => t.id === selectedTrackId)
    || matchedTracks[0];

  // Format mm:ss
  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  const isLongVideo = duration > 300;
  
  // Find currently active track based on time
  const currentAssignment = isLongVideo 
    ? segmentAssignments.find(a => currentTime >= a.segment.startTime && currentTime <= a.segment.endTime) 
    : null;
  const activeTrack = (isLongVideo && currentAssignment) ? currentAssignment.track : selectedTrack;
  const activeTrackTitle = activeTrack ? activeTrack.title : 'No track selected';
  const activeTrackMood = activeTrack ? activeTrack.mood : '';

  // Track changes during playback for long videos
  useEffect(() => {
    if (isPlaying && isLongVideo && currentAssignment && currentAssignment.track.id !== playingTrackIdRef.current) {
      playingTrackIdRef.current = currentAssignment.track.id;
      if (typeof currentAssignment.track.asset === 'string') {
        // audioStartTime is the offset in the track, but we'll just start from current time for simplicity or use the assignment's offset
        audioPlayerRef.current.play(currentAssignment.track.asset, currentAssignment.audioStartTime + (currentTime - currentAssignment.segment.startTime), 0.85).catch(() => {});
      }
    }
  }, [currentTime, isPlaying, isLongVideo, currentAssignment]);

  const playingTrackIdRef = useRef<string | null>(null);

  // Sync video time display
  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };
  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  // Toggle play/pause for both video and audio together
  const togglePlay = async () => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isPlaying) {
      vid.pause();
      await audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        if (activeTrack?.asset && typeof activeTrack.asset === 'string') {
          playingTrackIdRef.current = activeTrack.id;
          let offset = vid.currentTime;
          if (isLongVideo && currentAssignment) {
             offset = currentAssignment.audioStartTime + (vid.currentTime - currentAssignment.segment.startTime);
          } else if (!isLongVideo && segmentAssignments.length > 0) {
             offset = segmentAssignments[0].audioStartTime + vid.currentTime;
          }
          await audioPlayerRef.current.play(activeTrack.asset, offset, 0.85);
        }
        await vid.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Playback error:', err);
        try { await vid.play(); setIsPlaying(true); } catch {}
      }
    }
  };

  // Seek handler
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newTime = ratio * duration;
    if (videoRef.current) videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    
    if (isPlaying) {
      const newAssignment = isLongVideo ? segmentAssignments.find(a => newTime >= a.segment.startTime && newTime <= a.segment.endTime) : null;
      const newTrack = (isLongVideo && newAssignment) ? newAssignment.track : selectedTrack;
      if (newTrack?.asset && typeof newTrack.asset === 'string') {
        playingTrackIdRef.current = newTrack.id;
        let offset = newTime;
        if (isLongVideo && newAssignment) {
          offset = newAssignment.audioStartTime + (newTime - newAssignment.segment.startTime);
        } else if (!isLongVideo && segmentAssignments.length > 0) {
          offset = segmentAssignments[0].audioStartTime + newTime;
        }
        audioPlayerRef.current.play(newTrack.asset, offset, 0.85).catch(() => {});
      }
    }
  };

  // Video ended
  const handleEnded = async () => {
    await audioPlayerRef.current.stop();
    setIsPlaying(false);
    setCurrentTime(0);
    playingTrackIdRef.current = null;
  };

  // Fullscreen
  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen();
    }
  };

  // Cleanup on unmount & reload on URL change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [video.url]);

  useEffect(() => {
    return () => { audioPlayerRef.current.dispose(); };
  }, []);

  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={async () => { await audioPlayerRef.current.stop(); navigate(-1); }}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-bold text-white">Preview</h1>
      </div>

      <ProgressSteps currentStep={5} totalSteps={5} />

      <div className="mt-6 flex-1 flex flex-col">
        {/* Video Player */}
        <div className="relative w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-6"
          style={{ aspectRatio: '16/9' }}>
          <video
            key={video.url}
            ref={videoRef}
            src={video.url}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            playsInline
            muted={true}
          />

          {isFallbackVideo && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-20">
              <AlertCircle size={28} className="text-accent-cyan mb-2" />
              <p className="text-white text-xs font-semibold mb-1">Media Offline on Web</p>
              <p className="text-text-secondary text-[10px] max-w-[240px] leading-relaxed mb-3">
                This project's video file is stored locally on your mobile phone.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan text-xs font-semibold hover:bg-accent-cyan/35 transition-colors"
              >
                <Link2 size={12} />
                Link Local Video File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleLinkLocalFile}
                className="hidden"
              />
            </div>
          )}

          {/* Fullscreen button */}
          <button
            onClick={handleFullscreen}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors z-30">
            <Maximize2 size={14} />
          </button>

          {/* Controls Overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-10">
            {/* Play/Pause */}
            <div className="flex items-center justify-center mb-3">
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-gradient-accent flex items-center justify-center text-white hover:scale-105 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                {isPlaying
                  ? <Pause size={24} fill="currentColor" />
                  : <Play size={24} className="ml-1" fill="currentColor" />}
              </button>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white font-medium w-8 text-right">{fmt(currentTime)}</span>
              <div
                className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer"
                onClick={handleSeek}>
                <div
                  className="h-full bg-accent-cyan rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] text-white/70 font-medium w-8">{fmt(duration)}</span>
            </div>
          </div>
        </div>

        {/* Audio Track Info */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-accent-cyan" />
              <span className="text-xs font-medium text-white truncate">
                {activeTrackTitle}
              </span>
            </div>
            {activeTrack && (
              <span className="text-[10px] font-bold text-accent-purple bg-accent-purple/10 px-2 py-0.5 rounded-full border border-accent-purple/20 capitalize">
                {activeTrackMood}
              </span>
            )}
          </div>
          <WaveformVisualizer playing={isPlaying} />
        </div>

        {/* No track warning */}
        {!activeTrack && (
          <div className="mt-3 text-xs text-center text-status-warning">
            No track selected — go back and pick one from Recommended Tracks
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <GradientButton onClick={async () => {
          if (videoRef.current) videoRef.current.pause();
          await audioPlayerRef.current.stop();
          setIsPlaying(false);
          navigate('/export-settings');
        }} className="w-full">
          Export Video
        </GradientButton>
        <OutlinedButton onClick={() => { 
          audioPlayerRef.current.stop(); 
          if (isLongVideo) {
            navigate('/audio-variation-plan');
          } else {
            navigate(-1); 
          }
        }} icon={Edit2} className="w-full">
          {isLongVideo ? 'Edit Segments' : 'Change Track'}
        </OutlinedButton>
      </div>
    </MobileLayout>
  );
}