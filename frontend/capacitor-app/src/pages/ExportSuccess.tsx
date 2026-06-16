import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
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
  Home,
  Instagram,
  Twitter,
  Youtube } from
'lucide-react';

export default function ExportSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const videoUrl = state?.videoUrl;
  const [isProcessing, setIsProcessing] = useState(false);

  const getBase64Data = async () => {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const base64Str = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // strip data URI header
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      return base64Str;
  };

  const handleShare = async () => {
    if (!videoUrl) {
      alert('Video URL not found.');
      return;
    }
    setIsProcessing(true);
    try {
      if (Capacitor.isNativePlatform()) {
          const base64Data = await getBase64Data();
          const fileName = `synctune_${Date.now()}.mp4`;
          
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache
          });
          
          await Share.share({
            title: 'SyncTune Exported Video',
            url: savedFile.uri,
            dialogTitle: 'Share your video'
          });
      } else {
          const response = await fetch(videoUrl);
          const blob = await response.blob();
          const file = new File([blob], 'synctune_exported_video.mp4', { type: 'video/mp4' });
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'SyncTune Exported Video',
            });
          } else {
            alert('File sharing is not supported on this browser/device.');
          }
      }
    } catch (e) {
      console.error(e);
      alert('Failed to share video.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!videoUrl) return;
    setIsProcessing(true);
    try {
      if (Capacitor.isNativePlatform()) {
          const base64Data = await getBase64Data();
          const fileName = `synctune_${Date.now()}.mp4`;
          
          await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Documents
          });
          alert(`Success! Video saved to your phone's Documents folder as ${fileName}`);
      } else {
          const a = document.createElement('a');
          a.href = videoUrl;
          a.download = `synctune_${Date.now()}.mp4`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
      }
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
      className="flex flex-col px-6 py-12 relative overflow-hidden">
      
      {/* Confetti / Glow background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-status-success/20 to-transparent blur-3xl pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <motion.div
          initial={{
            scale: 0,
            opacity: 0
          }}
          animate={{
            scale: 1,
            opacity: 1
          }}
          transition={{
            type: 'spring',
            bounce: 0.5
          }}
          className="relative mb-8">
          
          <div className="absolute inset-0 bg-status-success blur-xl opacity-40 rounded-full animate-pulse" />
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-status-success to-emerald-700 flex items-center justify-center border-4 border-dark-bg shadow-2xl relative z-10">
            <Check size={48} className="text-white" strokeWidth={3} />
          </div>
        </motion.div>

        <motion.div
          initial={{
            y: 20,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            delay: 0.2
          }}
          className="text-center mb-10">
          
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Export Complete!
          </h1>
          <p className="text-text-secondary text-sm">
            Your video is ready to be shared with the world.
          </p>
        </motion.div>

        <motion.div
          initial={{
            y: 20,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            delay: 0.3
          }}
          className="w-full">
          
          <GlassCard className="p-4 flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-lg bg-black overflow-hidden shrink-0">
              <img
                src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=200&auto=format&fit=crop"
                crossOrigin="anonymous"
                className="w-full h-full object-cover opacity-80" />
              
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white text-sm truncate">
                synctune_exported_video.mp4
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                <span>65 MB</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>1080p</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{
            y: 20,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            delay: 0.4
          }}
          className="w-full space-y-3">
          
          <GradientButton icon={Download} className="w-full" onClick={handleDownload} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Save to Device'}
          </GradientButton>
          <OutlinedButton icon={Share2} className="w-full" onClick={handleShare} disabled={isProcessing}>
            {isProcessing ? 'Preparing...' : 'Share Video'}
          </OutlinedButton>
        </motion.div>

        <motion.div
          initial={{
            y: 20,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            delay: 0.5
          }}
          className="mt-8 w-full">
          
          <p className="text-xs text-center text-text-secondary mb-4 uppercase tracking-wider font-medium">
            Quick Share
          </p>
          <div className="flex justify-center gap-4">
            <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#E1306C] hover:border-[#E1306C] transition-all">
              <Instagram size={20} />
            </button>
            <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-black hover:border-white/30 transition-all">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor">
                
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </button>
            <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#FF0000] hover:border-[#FF0000] transition-all">
              <Youtube size={20} />
            </button>
            <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#1DA1F2] hover:border-[#1DA1F2] transition-all">
              <Twitter size={20} />
            </button>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm font-medium">
          
          <Home size={16} /> Back to Home
        </button>
      </div>
    </MobileLayout>);

}