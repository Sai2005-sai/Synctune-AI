import React, { useEffect, useState, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileLayout } from '../components/SharedComponents';
import { DownloadCloud } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportVideoWithBGM } from '../engine/audioExportEngine';

export default function ExportProcessing() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const { video, matchedTracks, selectedTrackId, segmentAssignments } = useApp();

  useEffect(() => {
    let isCancelled = false;

    const runExport = async () => {
      if (!video) { navigate('/home'); return; }

      try {
        const isLongVideo = (video?.duration ?? 0) > 300;
        const selectedTrack = matchedTracks.find(t => t.id === selectedTrackId) ?? matchedTracks[0];

        const opts: any = {
          videoUri: video.url,
          videoDuration: video.duration || 0,
          outputFileName: 'synctune_exported_video.mp4',
          onProgress: (p: number) => {
            if (!isCancelled) setProgress(p);
          }
        };

        if (isLongVideo && segmentAssignments.length > 0) {
           opts.segments = segmentAssignments.map(a => ({
             trackUri: a.track.asset as string,
             start: a.segment.startTime,
             end: a.segment.endTime,
             offset: a.audioStartTime
           }));
        } else if (selectedTrack) {
           opts.audioUri = selectedTrack.asset as string;
           if (segmentAssignments.length > 0) {
             opts.audioOffset = segmentAssignments[0].audioStartTime;
           }
        }

        // We use Math.max to prevent it returning immediately if ffmpeg gives 100% too fast
        setProgress(5);
        const url = await exportVideoWithBGM(opts);
        
        if (!isCancelled) {
          setProgress(100);
          setTimeout(() => navigate('/export-success', { state: { videoUrl: url } }), 500);
        }
      } catch (err) {
        console.error('Export failed:', err);
        if (!isCancelled) {
          alert('Export failed due to FFmpeg error. Check console.');
          navigate(-1);
        }
      }
    };

    runExport();

    return () => { isCancelled = true; };
  }, [navigate, video, matchedTracks, selectedTrackId, segmentAssignments]);
  return (
    <MobileLayout
      hideNav
      className="flex flex-col items-center justify-center relative">
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-cyan/10 via-dark-bg to-dark-bg" />

      <div className="relative z-10 w-full px-8 flex flex-col items-center">
        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 rounded-full bg-accent-cyan blur-xl" />
          
          <div className="relative w-20 h-20 bg-dark-surface rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl">
            <DownloadCloud size={36} className="text-accent-cyan" />
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-white mb-2">
          Exporting Video
        </h2>
        <p className="text-text-secondary text-sm mb-12 text-center">
          Rendering audio tracks and applying
          <br />
          final adjustments...
        </p>

        <div className="w-full max-w-[280px]">
          <div className="flex justify-between text-sm font-bold text-white mb-3">
            <span>{Math.floor(progress)}%</span>
            <span className="text-text-secondary font-medium text-xs mt-0.5">
              Est. time: {Math.max(1, Math.floor((100 - progress) / 10))}s
            </span>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
            <motion.div
              className="h-full bg-gradient-accent rounded-full relative overflow-hidden"
              style={{
                width: `${progress}%`
              }}
              layout>
              
              <motion.div
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
              
            </motion.div>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-16 text-text-secondary text-sm font-medium hover:text-white transition-colors">
          
          Cancel Export
        </button>
      </div>
    </MobileLayout>);

}