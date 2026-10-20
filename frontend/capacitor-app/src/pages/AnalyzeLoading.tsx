import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileLayout, AILoader } from '../components/SharedComponents';
import { useApp } from '../context/AppContext';

const STEPS = [
  'Extracting visual frames...',
  'Analyzing visual mood & lighting...',
  'Measuring motion & pacing...',
  'Detecting scene transitions...',
  'Matching beat & soundtrack...',
];

export default function AnalyzeLoading() {
  const navigate = useNavigate();
  const { isAnalyzing, analysisResult, analysisError } = useApp();
  const [stepIdx, setStepIdx] = React.useState(0);
  const [progress, setProgress] = React.useState(12);

  // Animate progress bar smoothly and dynamically
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (!isAnalyzing) return 100;
        if (prev < 45) return prev + 4;
        if (prev < 75) return prev + 2;
        if (prev < 94) return prev + 1;
        return 95;
      });
    }, 70);

    const stepInterval = setInterval(() => {
      setStepIdx(i => (i + 1) % STEPS.length);
    }, 750);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [isAnalyzing]);

  // When analysis finishes, smoothly jump to 100% and proceed
  useEffect(() => {
    if (!isAnalyzing && (analysisResult || analysisError)) {
      setProgress(100);
      const timer = setTimeout(() => {
        navigate('/analysis-summary');
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, analysisResult, analysisError, navigate]);

  return (
    <MobileLayout hideNav className="flex flex-col items-center justify-center relative px-6 pb-16">
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

      <div className="relative z-10 w-full px-4 flex flex-col items-center">
        <AILoader text={STEPS[stepIdx]} />

        <div className="w-full max-w-[260px] mt-12">
          <div className="flex justify-between text-xs font-semibold text-text-secondary mb-2">
            <span>Progress</span>
            <span className="text-accent-cyan font-bold">{progress}%</span>
          </div>
          <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
            <motion.div
              className="h-full bg-gradient-accent rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
              layout
            />
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}