import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MobileLayout,
  GradientButton,
  OutlinedButton,
  ProgressSteps,
  GlassCard } from
'../components/SharedComponents';
import { ArrowLeft, Edit2, Play } from 'lucide-react';
export default function AudioVariationPlan() {
  const navigate = useNavigate();
  const segments = [
  {
    id: 1,
    start: '0:00',
    end: '0:45',
    duration: '45s',
    track: 'Echoes of Silence',
    color: 'bg-accent-purple',
    width: '33%'
  },
  {
    id: 2,
    start: '0:45',
    end: '1:30',
    duration: '45s',
    track: 'Rising Sun',
    color: 'bg-accent-cyan',
    width: '33%'
  },
  {
    id: 3,
    start: '1:30',
    end: '2:15',
    duration: '45s',
    track: 'Echoes of Silence',
    color: 'bg-accent-purple',
    width: '34%'
  }];

  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-bold text-white">
          Audio Variation
        </h1>
      </div>

      <ProgressSteps currentStep={4} totalSteps={5} />

      <div className="mt-8 flex-1 flex flex-col">
        <div className="mb-8">
          <h2 className="text-sm font-medium text-text-secondary mb-4">
            AI Generated Timeline Plan
          </h2>

          {/* Timeline Visual */}
          <div className="relative w-full h-24 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex mb-2">
            {segments.map((seg, i) =>
            <div
              key={seg.id}
              className={`h-full ${seg.color} relative group cursor-pointer border-r border-dark-bg last:border-r-0`}
              style={{
                width: seg.width,
                opacity: 0.8
              }}
              onClick={() => navigate('/segment-detail')}>
              
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <Play size={20} className="text-white" fill="currentColor" />
                </div>
                <div className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">
                  Seg {seg.id}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between text-xs text-text-secondary font-medium px-1">
            <span>0:00</span>
            <span>2:15</span>
          </div>
        </div>

        <h3 className="font-display font-bold text-white mb-4">
          Segment Details
        </h3>
        <div className="space-y-3 mb-8">
          {segments.map((seg, i) =>
          <motion.div
            key={seg.id}
            initial={{
              opacity: 0,
              x: -20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              delay: i * 0.1
            }}>
            
              <GlassCard
              className="p-4 flex items-center gap-4"
              onClick={() => navigate('/segment-detail')}>
              
                <div className={`w-3 h-12 rounded-full ${seg.color}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-white text-sm">
                      Segment {seg.id}
                    </h4>
                    <span className="text-xs text-text-secondary bg-white/5 px-2 py-0.5 rounded">
                      {seg.start} - {seg.end}
                    </span>
                  </div>
                  <p className="text-accent-cyan text-xs font-medium">
                    {seg.track}
                  </p>
                </div>
                <ArrowLeft
                size={16}
                className="text-text-secondary rotate-180" />
              
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-6 space-y-3">
        <GradientButton
          onClick={() => navigate('/sync-processing')}
          className="w-full">
          
          Apply Plan & Sync
        </GradientButton>
        <OutlinedButton
          icon={Edit2}
          onClick={() => navigate('/manual-adjust')}
          className="w-full">
          
          Edit Segments
        </OutlinedButton>
      </div>
    </MobileLayout>);

}