import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MobileLayout,
  GradientButton,
  GlassCard } from
'../components/SharedComponents';
import { ArrowLeft, Bot } from 'lucide-react';
export default function InsightsScreen() {
  const navigate = useNavigate();
  const insights = [
  {
    text: 'Your video has a melancholic tone with slow camera movements. The dark color palette suggests a somber or reflective mood.',
    delay: 0.1
  },
  {
    text: 'I detected 4 distinct scene transitions. The pacing is relatively slow, with an average of 33 seconds per scene.',
    delay: 0.3
  },
  {
    text: 'Based on this analysis, I recommend music styles like Ambient, Slow Piano, or Cinematic Strings to match the visual weight.',
    delay: 0.5,
    highlight: true
  }];

  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-bold text-white">
          AI Insights
        </h1>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-accent p-[2px] shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <div className="w-full h-full bg-dark-bg rounded-full flex items-center justify-center">
              <Bot size={28} className="text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {insights.map((insight, index) =>
          <motion.div
            key={index}
            initial={{
              opacity: 0,
              x: -20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              delay: insight.delay,
              duration: 0.5
            }}>
            
              <GlassCard
              className={`p-5 relative overflow-hidden ${insight.highlight ? 'border-accent-cyan/50 bg-accent-cyan/5' : ''}`}>
              
                {insight.highlight &&
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-cyan" />
              }
                {!insight.highlight &&
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20" />
              }
                <p className="text-sm text-white/90 leading-relaxed pl-2">
                  {insight.text}
                </p>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10">
        <GradientButton
          onClick={() => navigate('/recommended-tracks')}
          className="w-full">
          
          Continue to Music
        </GradientButton>
      </div>
    </MobileLayout>);

}