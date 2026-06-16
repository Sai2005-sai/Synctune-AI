import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileLayout, GradientButton } from '../components/SharedComponents';
import { ArrowLeft, UploadCloud, FileVideo, Clock, HardDrive } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function UploadVideo() {
  const navigate = useNavigate();
  const { setVideo } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file (MP4, MOV, AVI, MKV).');
      return;
    }
    const url = URL.createObjectURL(file);
    // Get duration via HTMLVideoElement
    const vid = document.createElement('video');
    vid.preload = 'metadata';
    vid.onloadedmetadata = () => {
      setVideo({ url, name: file.name, size: file.size, duration: vid.duration });
      navigate('/video-preview');
    };
    vid.onerror = () => {
      setVideo({ url, name: file.name, size: file.size, duration: 15 });
      navigate('/video-preview');
    };
    vid.src = url;
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-bold text-white">Upload Video</h1>
      </div>

      <input ref={inputRef} type="file" accept="video/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col">
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-[4/5] rounded-3xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-accent-purple hover:bg-white/10 transition-all group">
          <div className="w-20 h-20 rounded-full bg-gradient-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <UploadCloud size={40} className="text-accent-cyan" />
          </div>
          <h2 className="font-display font-bold text-xl text-white mb-2 text-center">
            Tap to upload or drag &amp; drop
          </h2>
          <p className="text-text-secondary text-sm text-center mb-8">
            Select a video from your device
          </p>
          <div className="w-full space-y-3">
            {[
              { Icon: FileVideo, label: 'Formats', value: 'MP4, MOV, AVI, MKV' },
              { Icon: HardDrive, label: 'Max Size', value: '500 MB' },
              { Icon: Clock, label: 'Max Duration', value: '10 Minutes' },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between text-xs text-text-secondary bg-dark-surface/50 px-4 py-2.5 rounded-lg">
                <span className="flex items-center gap-2"><Icon size={14} /> {label}</span>
                <span className="text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="mt-auto pt-6">
        <GradientButton onClick={() => inputRef.current?.click()} className="w-full">
          Browse Files
        </GradientButton>
      </div>
    </MobileLayout>
  );
}