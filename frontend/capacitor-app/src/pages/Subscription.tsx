import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout, GlassCard, GradientButton } from '../components/SharedComponents';
import { ArrowLeft, Crown, CheckCircle2 } from 'lucide-react';

export default function Subscription() {
  const navigate = useNavigate();

  const features = [
    'Unlimited Video Exports',
    'Full Premium Music Library',
    'Advanced Sync Controls',
    'No Watermarks',
    'Priority Rendering'
  ];

  return (
    <MobileLayout hideNav className="flex flex-col relative pb-24">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-yellow-500/20 via-dark-bg to-dark-bg pointer-events-none" />

      <div className="sticky top-0 z-20 bg-dark-bg/50 backdrop-blur-xl px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-xl font-bold text-white">Subscription</h1>
        </div>
      </div>

      <div className="px-6 pt-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
            <Crown size={36} className="text-dark-bg" fill="currentColor" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">SyncTune PRO</h2>
          <p className="text-text-secondary text-sm">Unlock the ultimate AI music syncing experience.</p>
        </div>

        <GlassCard className="p-6 mb-8 border-yellow-500/30 bg-yellow-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full" />
          
          <div className="mb-6">
            <span className="text-3xl font-bold text-white">$9.99</span>
            <span className="text-text-secondary text-sm"> / month</span>
          </div>

          <div className="space-y-4 mb-8">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-yellow-400 shrink-0" />
                <span className="text-sm text-white/90">{f}</span>
              </div>
            ))}
          </div>

          <GradientButton className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-yellow-500/25">
            Upgrade to PRO
          </GradientButton>
          <p className="text-center text-[10px] text-text-muted mt-4">Cancel anytime. Terms & conditions apply.</p>
        </GlassCard>
      </div>
    </MobileLayout>
  );
}
