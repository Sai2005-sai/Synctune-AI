import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MobileLayout,
  GradientButton,
  OutlinedButton,
  GlassCard } from
'../components/SharedComponents';
import {
  Check,
  Download,
  Share2,
  Home } from
'lucide-react';

export default function ExportSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const videoUrl = state?.videoUrl;
  const [isProcessing, setIsProcessing] = useState(false);

  const handleShare = async () => {
    if (!videoUrl) {
      alert('Video URL not found.');
      return;
    }
    setIsProcessing(true);
    try {
      // 1. If running inside our React Native mobile app:
      if ((window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SHARE_VIDEO',
          videoUrl
        }));
        return;
      }

      // 2. Web browser fallback
      if (navigator.share && navigator.canShare) {
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const file = new File([blob], 'synctune_exported_video.mp4', { type: 'video/mp4' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'SyncTune Exported Video',
          });
          return;
        }
      }
      
      // Fallback if web share not supported: download file
      handleDownload();
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.warn('Share fallback:', e);
        handleDownload();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!videoUrl) return;
    setIsProcessing(true);
    try {
      // 1. If running inside our React Native mobile app:
      if ((window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SAVE_TO_DEVICE',
          videoUrl
        }));
        return;
      }

      // 2. Web browser direct download
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `synctune_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      alert('Failed to save video.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MobileLayout
      hideNav
      className="flex flex-col px-6 py-8 pb-16 relative overflow-hidden">
      
      {/* Confetti / Glow background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-status-success/20 to-transparent blur-3xl pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 pt-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="relative mb-6">
          <div className="absolute inset-0 bg-status-success blur-xl opacity-40 rounded-full animate-pulse" />
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-status-success to-emerald-700 flex items-center justify-center border-4 border-dark-bg shadow-2xl relative z-10">
            <Check size={40} className="text-white" strokeWidth={3} />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-white mb-1.5">
            Export Complete!
          </h1>
          <p className="text-text-secondary text-xs">
            Your video is ready to be saved and shared.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full">
          <GlassCard className="p-3 flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-lg bg-black overflow-hidden shrink-0">
              <img
                src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=200&auto=format&fit=crop"
                crossOrigin="anonymous"
                className="w-full h-full object-cover opacity-80"
                alt="Thumbnail" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white text-sm truncate">
                synctune_exported_video.mp4
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                <span>1080p</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-status-success font-medium">Ready</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Action Buttons lifted safely above bottom navigation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full space-y-3 pb-8">
          <GradientButton icon={Download} className="w-full shadow-lg" onClick={handleDownload} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Save to Device'}
          </GradientButton>
          <OutlinedButton icon={Share2} className="w-full" onClick={handleShare} disabled={isProcessing}>
            {isProcessing ? 'Preparing...' : 'Share Video'}
          </OutlinedButton>
        </motion.div>
      </div>

      <div className="mt-auto pb-8 flex justify-center">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm font-medium py-2 px-4 rounded-full active:scale-95">
          <Home size={16} /> Back to Home
        </button>
      </div>
    </MobileLayout>
  );
}