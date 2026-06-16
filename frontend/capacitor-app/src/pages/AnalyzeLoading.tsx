import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileLayout, AILoader } from '../components/SharedComponents';
import { useApp } from '../context/AppContext';

const STEPS = [
  'Extracting frames...',
  'Analyzing visual mood...',
  'Measuring motion energy...',
  'Detecting scene cuts...',
  'Matching background music...',
];

export default function AnalyzeLoading() {
  const navigate = useNavigate();
  const { isAnalyzing, analysisResult, analysisError } = useApp();
  const [stepIdx, setStepIdx] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  // Animate progress bar while analyzing
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        // Cap at 90% until real result arrives
        if (prev >= 90 && isAnalyzing) return 90;
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 1;
      });
    }, 80);
    const stepInterval = setInterval(() => {
      setStepIdx(i => (i + 1) % STEPS.length);
    }, 1500);
    return () => { clearInterval(interval); clearInterval(stepInterval); };
  }, [isAnalyzing]);

  // When analysis finishes, complete progress and navigate
  useEffect(() => {
    if (!isAnalyzing && analysisResult) {
      setProgress(100);
      setTimeout(() => navigate('/analysis-summary'), 500);
    }
    if (!isAnalyzing && analysisError) {
      setTimeout(() => navigate('/analysis-summary'), 500);
    }
  }, [isAnalyzing, analysisResult, analysisError, navigate]);

  return (
    <MobileLayout hideNav className="flex flex-col items-center justify-center relative">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            initial={{ x: Math.random() * 390, y: Math.random() * 800, scale: Math.random() * 2 }}
            animate={{ y: [null, Math.random() * -100], opacity: [0.2, 0.8, 0] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full px-8 flex flex-col items-center">
        <AILoader text={STEPS[stepIdx]} />

        <div className="w-full max-w-[240px] mt-12">
          <div className="flex justify-between text-xs font-medium text-text-secondary mb-2">
            <span>Progress</span>
            <span className="text-accent-cyan">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div
              className="h-full bg-gradient-accent"
              style={{ width: `${progress}%` }}
              layout
            />
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}