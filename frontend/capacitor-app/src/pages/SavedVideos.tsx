import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileLayout } from '../components/SharedComponents';
import { ArrowLeft, Play, MoreHorizontal } from 'lucide-react';
export default function SavedVideos() {
  const navigate = useNavigate();
  const videos = [
  {
    id: 1,
    name: 'Summer Vlog Final',
    duration: '2:45',
    size: '124 MB',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Drone Cinematic',
    duration: '1:12',
    size: '65 MB',
    img: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Cafe B-Roll',
    duration: '3:20',
    size: '156 MB',
    img: 'https://images.unsplash.com/photo-1445116572660-236099ce4fd5?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 4,
    name: 'Travel Intro',
    duration: '0:30',
    size: '22 MB',
    img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=300&auto=format&fit=crop'
  }];

  return (
    <MobileLayout hideNav className="flex flex-col relative">
      <div className="sticky top-0 z-20 bg-dark-bg/90 backdrop-blur-xl px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-xl font-bold text-white">
            Saved Videos
          </h1>
        </div>
      </div>

      <div className="p-6">
        <p className="text-xs text-text-secondary mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
          Long press on a video for more options
        </p>

        <div className="grid grid-cols-2 gap-4">
          {videos.map((video, i) =>
          <motion.div
            key={video.id}
            initial={{
              opacity: 0,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            transition={{
              delay: i * 0.1
            }}
            className="group">
            
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-white/10 mb-2 bg-dark-surface">
                <img
                src={video.img}
                alt={video.name}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Play
                    size={16}
                    className="text-white ml-0.5"
                    fill="currentColor" />
                  
                  </div>
                </div>

                <div className="absolute top-2 right-2">
                  <button className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white">
                    <MoreHorizontal size={14} />
                  </button>
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                  <div className="text-[10px] font-medium text-white bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    {video.duration}
                  </div>
                  <div className="text-[9px] text-white/70">{video.size}</div>
                </div>
              </div>

              <h3 className="text-sm font-medium text-white truncate px-1">
                {video.name}
              </h3>
            </motion.div>
          )}
        </div>
      </div>
    </MobileLayout>);

}