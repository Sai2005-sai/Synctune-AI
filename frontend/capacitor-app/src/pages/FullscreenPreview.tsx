import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
export default function FullscreenPreview() {
  const navigate = useNavigate();
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const toggleControls = () => {
    setShowControls(!showControls);
  };
  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
      onClick={toggleControls}>
      
      {/* Video Content */}
      <img
        src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop"
        alt="Fullscreen video"
        className="w-full h-full object-contain" />
      

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls &&
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          className="absolute inset-0 flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}>
          
            {/* Top Bar */}
            <div className="bg-gradient-to-b from-black/80 to-transparent p-6 flex justify-end">
              <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              
                <X size={24} />
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent p-8 pt-20">
              <div className="flex items-center justify-center gap-8 mb-8">
                <button className="text-white hover:text-accent-cyan transition-colors">
                  <SkipBack size={28} fill="currentColor" />
                </button>
                <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 hover:bg-white/30 transition-colors">
                
                  {isPlaying ?
                <Pause size={32} fill="currentColor" /> :

                <Play size={32} className="ml-1" fill="currentColor" />
                }
                </button>
                <button className="text-white hover:text-accent-cyan transition-colors">
                  <SkipForward size={28} fill="currentColor" />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-white font-medium">0:45</span>
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                  <div className="w-[35%] h-full bg-accent-cyan rounded-full relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
                  </div>
                </div>
                <span className="text-xs text-white/70 font-medium">2:15</span>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}