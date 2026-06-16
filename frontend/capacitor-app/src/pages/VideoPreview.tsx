import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileLayout, GradientButton, OutlinedButton, ProgressSteps } from '../components/SharedComponents';
import { ArrowLeft, Play, Clock, HardDrive, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function VideoPreview() {
  const navigate = useNavigate();
  const { video } = useApp();

  if (!video) { navigate('/upload'); return null; }

  const fmt = (s: number) => `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
  const fmtMB = (b: number) => `${(b / 1048576).toFixed(1)} MB`;

  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-bold text-white">Video Preview</h1>
      </div>

      <ProgressSteps currentStep={1} totalSteps={5} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex-1 flex flex-col gap-6">
        {/* Video player */}
        <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
          <video
            src={video.url}
            controls
            className="w-full max-h-[50vh] object-contain"
            style={{ display: 'block' }}
          />
        </div>

        {/* Metadata */}
        <div className="glass-card rounded-2xl p-4 space-y-3">
          <h3 className="font-medium text-white text-sm truncate">{video.name}</h3>
          <div className="flex flex-wrap gap-2">
            {video.duration && (
              <span className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-white">
                <Clock size={12} /> {fmt(video.duration)}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-white">
              <HardDrive size={12} /> {fmtMB(video.size)}
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-status-success/10 border border-status-success/30 px-3 py-1.5 rounded-full text-status-success">
              <CheckCircle2 size={12} /> Ready
            </span>
          </div>
        </div>
      </motion.div>

      <div className="mt-6 space-y-3">
        <GradientButton onClick={() => navigate('/prompt-input')} className="w-full">
          Continue →
        </GradientButton>
        <OutlinedButton onClick={() => navigate('/upload')} className="w-full">
          Change Video
        </OutlinedButton>
      </div>
    </MobileLayout>
  );
}