import React, { useState, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileLayout, GradientButton } from '../components/SharedComponents';
import { ArrowLeft, Search, CheckCircle2 } from 'lucide-react';
export default function VideoPicker() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<number | null>(2);
  const videos = [
  {
    id: 1,
    duration: '0:45',
    size: '12 MB',
    date: 'Today',
    img: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 2,
    duration: '2:15',
    size: '45 MB',
    date: 'Yesterday',
    img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 3,
    duration: '1:10',
    size: '28 MB',
    date: 'Yesterday',
    img: 'https://images.unsplash.com/photo-1516280440502-62f542981c26?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 4,
    duration: '0:30',
    size: '8 MB',
    date: 'Oct 12',
    img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 5,
    duration: '3:45',
    size: '112 MB',
    date: 'Oct 10',
    img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 6,
    duration: '0:15',
    size: '4 MB',
    date: 'Oct 08',
    img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 7,
    duration: '1:20',
    size: '32 MB',
    date: 'Oct 05',
    img: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 8,
    duration: '5:00',
    size: '180 MB',
    date: 'Oct 01',
    img: 'https://images.unsplash.com/photo-1578022761797-b8636ac1773c?q=80&w=300&auto=format&fit=crop'
  }];

  return (
    <MobileLayout hideNav className="flex flex-col relative pb-24">
      <div className="sticky top-0 z-20 bg-dark-bg/80 backdrop-blur-xl px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-xl font-bold text-white">
            Select Video
          </h1>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-secondary" />
          </div>
          <input
            type="text"
            placeholder="Search files..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-purple transition-all" />
          
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-3">
          {videos.map((video, index) =>
          <motion.div
            key={video.id}
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: index * 0.05
            }}
            onClick={() => setSelectedId(video.id)}
            className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedId === video.id ? 'border-accent-cyan shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-transparent'}`}>
            
              <img
              src={video.img}
              alt="Video thumbnail"
              className="w-full h-full object-cover" />
            
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                <div>
                  <div className="text-[10px] font-medium text-white bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm inline-block mb-1">
                    {video.duration}
                  </div>
                  <div className="text-[9px] text-white/70">{video.size}</div>
                </div>
              </div>

              {selectedId === video.id &&
            <div className="absolute top-2 right-2 w-6 h-6 bg-accent-cyan rounded-full flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-dark-bg" />
                </div>
            }
            </motion.div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-[390px] p-6 bg-dark-bg/90 backdrop-blur-xl border-t border-white/10 z-20">
        <GradientButton
          onClick={() => navigate('/video-preview')}
          className="w-full"
          disabled={!selectedId}>
          
          Select Video
        </GradientButton>
      </div>
    </MobileLayout>);

}