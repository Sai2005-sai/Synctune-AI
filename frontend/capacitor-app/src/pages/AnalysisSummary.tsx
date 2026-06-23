import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MobileLayout, GradientButton, OutlinedButton,
  ProgressSteps, GlassCard, MoodChip, EnergyBadge,
} from '../components/SharedComponents';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

const MOOD_EMOJI: Record<string, string> = {
  happy: '😊', sad: '😢', energetic: '⚡', calm: '🌊', cinematic: '🎬',
};

export default function AnalysisSummary() {
  const navigate = useNavigate();
  const { analysisResult, analysisError, video } = useApp();

  if (!video) { navigate('/home'); return null; }

  // Fallback while result might still be loading
  if (!analysisResult) {
    return (
      <MobileLayout hideNav className="flex flex-col items-center justify-center px-6">
        {analysisError && (
          <div className="glass-card rounded-xl p-4 text-status-warning text-sm mb-6">{analysisError}</div>
        )}
        <p className="text-text-secondary">Analysis in progress…</p>
        <GradientButton onClick={() => navigate('/analyze-loading')} className="mt-6">
          Back to Loading
        </GradientButton>
      </MobileLayout>
    );
  }

  const { classifiedMood, energyLevel, confidence, analysisReasoning } = analysisResult;
  const emoji = MOOD_EMOJI[classifiedMood] ?? '🎵';
  const energyLabel = (energyLevel.charAt(0).toUpperCase() + energyLevel.slice(1)) as 'Low' | 'Medium' | 'High';

  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/prompt-input')}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-bold text-white flex items-center gap-2">
          Analysis Complete <CheckCircle2 size={20} className="text-status-success" />
        </h1>
      </div>

      <ProgressSteps currentStep={3} totalSteps={5} />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="mt-6 flex-1 flex flex-col items-center">

        {/* Mood hero */}
        <div className="w-full text-center mb-8">
          <p className="text-text-secondary text-sm mb-2">AI detected the primary mood as</p>
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-accent-purple blur-xl opacity-30 rounded-full" />
            <div className="relative bg-dark-surface border border-accent-purple/30 px-8 py-4 rounded-full flex items-center gap-3 shadow-lg">
              <span className="text-3xl">{emoji}</span>
              <span className="font-display text-2xl font-bold text-white capitalize">{classifiedMood}</span>
            </div>
          </div>
        </div>

        {/* Energy + Confidence grid */}
        <div className="w-full grid grid-cols-2 gap-4 mb-6">
          <GlassCard className="flex flex-col items-center justify-center p-6 text-center">
            <div className="text-text-secondary text-xs font-medium mb-3 uppercase tracking-wider">Energy Level</div>
            <EnergyBadge level={energyLabel} />
          </GlassCard>
          <GlassCard className="flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-accent-cyan/20 blur-xl rounded-full" />
            <div className="text-text-secondary text-xs font-medium mb-2 uppercase tracking-wider">AI Confidence</div>
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#06B6D4" strokeWidth="3"
                  strokeDasharray={`${confidence}, 100`} />
              </svg>
              <span className="absolute text-sm font-bold text-white">{confidence}%</span>
            </div>
          </GlassCard>
        </div>

        {/* Stats row */}
        <div className="w-full grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Brightness', val: `${(analysisResult.frameMetrics.brightness * 100).toFixed(0)}%` },
            { label: 'Motion', val: `${(analysisResult.frameMetrics.motionIntensity * 100).toFixed(0)}%` },
            { label: 'Scene Cuts', val: `${analysisResult.frameMetrics.sceneCuts}` },
          ].map(s => (
            <GlassCard key={s.label} className="text-center p-3">
              <div className="text-white font-bold text-lg">{s.val}</div>
              <div className="text-text-secondary text-[10px] uppercase tracking-wider mt-1">{s.label}</div>
            </GlassCard>
          ))}
        </div>

        {/* AI reasoning */}
        <GlassCard className="w-full p-4 flex items-start gap-3 bg-accent-purple/5 border-accent-purple/20">
          <Sparkles className="text-accent-purple shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-white/90 leading-relaxed">{analysisReasoning}</p>
        </GlassCard>
      </motion.div>

      <div className="mt-8 space-y-3">
        <GradientButton onClick={() => navigate('/recommended-tracks')} className="w-full">
          Find Music
        </GradientButton>
        <OutlinedButton onClick={() => navigate('/detailed-analysis')} className="w-full">
          View Detailed Analysis
        </OutlinedButton>
      </div>
    </MobileLayout>
  );
}