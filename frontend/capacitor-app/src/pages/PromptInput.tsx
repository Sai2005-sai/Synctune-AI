import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileLayout, GradientButton, ProgressSteps } from '../components/SharedComponents';
import { ArrowLeft, Sparkles, Wand2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SUGGESTIONS = ['Upbeat Pop', 'Lo-fi Chill', 'Epic Cinematic', 'Acoustic Warm', 'Electronic Dance', 'Dark Ambient'];

export default function PromptInput() {
  const navigate = useNavigate();
  const { prompt, setPrompt, runAnalysis, video } = useApp();

  if (!video) { navigate('/upload'); return null; }

  const handleAnalyze = async () => {
    navigate('/analyze-loading');
    await runAnalysis();
    navigate('/analysis-summary');
  };

  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-6 pb-16">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-bold text-white">Music Style</h1>
      </div>

      <ProgressSteps currentStep={2} totalSteps={5} />

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex-1 flex flex-col">
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 bg-gradient-accent rounded-full blur-xl opacity-30 animate-pulse" />
            <div className="relative w-full h-full bg-dark-surface border border-white/10 rounded-2xl flex items-center justify-center shadow-xl rotate-3">
              <Wand2 size={32} className="text-accent-cyan" />
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <label className="text-sm font-medium text-white flex items-center gap-2">
            Describe your desired music style{' '}
            <span className="text-text-secondary font-normal text-xs">(optional)</span>
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g., Cinematic orchestral with soft piano building up to an epic climax..."
              className="w-full h-28 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all resize-none text-sm"
            />
            <div className="absolute bottom-3 right-3">
              <Sparkles size={16} className="text-accent-purple opacity-50" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-text-secondary mb-2.5 block">Quick Suggestions</label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => setPrompt(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  prompt === s
                    ? 'bg-accent-purple/20 border border-accent-purple/50 text-accent-purple font-semibold'
                    : 'bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:border-accent-cyan'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Lifted bottom button area with generous Android safe spacing */}
      <div className="mt-auto pt-6 pb-14 flex flex-col items-center gap-3">
        <GradientButton onClick={handleAnalyze} className="w-full shadow-lg">
          Analyze Video
        </GradientButton>
        <button
          onClick={handleAnalyze}
          className="text-text-secondary text-sm font-semibold hover:text-white transition-colors py-2 px-4 rounded-full active:scale-95">
          Skip — Let AI Decide
        </button>
      </div>
    </MobileLayout>
  );
}