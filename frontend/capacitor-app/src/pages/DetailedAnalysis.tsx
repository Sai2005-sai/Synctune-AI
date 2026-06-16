import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileLayout, GlassCard } from '../components/SharedComponents';
import {
  ArrowLeft,
  Sun,
  Activity,
  Scissors,
  Palette,
  Clock } from
'lucide-react';
export default function DetailedAnalysis() {
  const navigate = useNavigate();
  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-bold text-white">
          Detailed Analysis
        </h1>
      </div>

      <div className="space-y-4 pb-8">
        <motion.div
          initial={{
            opacity: 0,
            y: 10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.1
          }}>
          
          <GlassCard className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Sun size={16} className="text-yellow-400" />
              </div>
              <h3 className="font-medium text-white">Brightness Profile</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-text-secondary">
                <span>Dark</span>
                <span>Avg: 34%</span>
                <span>Bright</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                <div className="h-full bg-gradient-to-r from-gray-800 via-gray-500 to-white w-[34%]" />
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Predominantly low-key lighting detected.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.2
          }}>
          
          <GlassCard className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                <Activity size={16} className="text-accent-blue" />
              </div>
              <h3 className="font-medium text-white">Motion Intensity</h3>
            </div>
            <div className="h-16 w-full flex items-end gap-1">
              {[20, 30, 40, 25, 15, 10, 5, 15, 35, 50, 45, 30, 20, 15, 10].map(
                (h, i) =>
                <div
                  key={i}
                  className="flex-1 bg-accent-blue/50 rounded-t-sm"
                  style={{
                    height: `${h}%`
                  }} />


              )}
            </div>
            <div className="flex justify-between text-[10px] text-text-secondary mt-2">
              <span>0:00</span>
              <span>Slow camera movements</span>
              <span>2:15</span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.3
          }}>
          
          <GlassCard className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center">
                <Scissors size={16} className="text-accent-purple" />
              </div>
              <div className="flex-1 flex justify-between items-center">
                <h3 className="font-medium text-white">Scene Cuts</h3>
                <span className="text-xl font-bold text-white">4</span>
              </div>
            </div>
            <div className="relative h-2 w-full bg-white/5 rounded-full mt-4">
              <div className="absolute top-1/2 -translate-y-1/2 left-[20%] w-1 h-4 bg-accent-purple rounded-full" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[45%] w-1 h-4 bg-accent-purple rounded-full" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[70%] w-1 h-4 bg-accent-purple rounded-full" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[85%] w-1 h-4 bg-accent-purple rounded-full" />
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.4
            }}>
            
            <GlassCard className="p-4 h-full">
              <div className="flex items-center gap-2 mb-3">
                <Palette size={14} className="text-text-secondary" />
                <h3 className="text-xs font-medium text-text-secondary uppercase">
                  Color Palette
                </h3>
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-[#1A2B3C] border border-white/10" />
                <div className="w-6 h-6 rounded-full bg-[#2C3E50] border border-white/10" />
                <div className="w-6 h-6 rounded-full bg-[#4A5568] border border-white/10" />
                <div className="w-6 h-6 rounded-full bg-[#718096] border border-white/10" />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.5
            }}>
            
            <GlassCard className="p-4 h-full">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="text-text-secondary" />
                <h3 className="text-xs font-medium text-text-secondary uppercase">
                  Duration
                </h3>
              </div>
              <div className="text-xl font-bold text-white">2:15</div>
              <div className="text-[10px] text-text-secondary mt-1">
                135 seconds total
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </MobileLayout>);

}