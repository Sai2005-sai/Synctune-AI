import React, { useState, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MobileLayout,
  GradientButton,
  GlassCard } from
'../components/SharedComponents';
import { ArrowLeft, Download, Film, Music, Info } from 'lucide-react';
export default function ExportSettings() {
  const navigate = useNavigate();
  const [isPro] = useState(() => localStorage.getItem('synctune_is_pro') === 'true');
  const [quality, setQuality] = useState('1080p');
  const [format, setFormat] = useState('MP4');
  const [audio, setAudio] = useState(() => isPro ? '320kbps' : '256kbps');
  const [watermark, setWatermark] = useState(false);

  const handleQualityChange = (q: string) => {
    if (q === '4K' && !isPro) {
      alert('4K export is a PRO feature. Please subscribe to SyncTune PRO to unlock.');
      navigate('/subscription');
      return;
    }
    setQuality(q);
  };

  const handleAudioChange = (a: string) => {
    if (a === '320kbps' && !isPro) {
      alert('320kbps high-quality audio is a PRO feature. Please subscribe to SyncTune PRO to unlock.');
      navigate('/subscription');
      return;
    }
    setAudio(a);
  };
  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-bold text-white">
          Export Settings
        </h1>
      </div>

      <div className="flex-1 flex flex-col space-y-6 overflow-y-auto pb-6 no-scrollbar">
        {/* Video Quality */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Film size={16} className="text-accent-cyan" />
            <h2 className="text-sm font-medium text-white">Video Quality</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['720p', '1080p', '4K'].map((q) =>
            <button
              key={q}
              onClick={() => handleQualityChange(q)}
              className={`py-3 rounded-xl text-sm font-medium transition-all border ${quality === q ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'}`}>
              
                {q}
              </button>
            )}
          </div>
        </section>

        {/* Video Format */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Film size={16} className="text-accent-purple" />
            <h2 className="text-sm font-medium text-white">Format</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['MP4', 'MOV', 'AVI'].map((f) =>
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`py-3 rounded-xl text-sm font-medium transition-all border ${format === f ? 'bg-accent-purple/10 border-accent-purple text-accent-purple shadow-[0_0_10px_rgba(139,92,246,0.2)]' : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'}`}>
              
                {f}
              </button>
            )}
          </div>
        </section>

        {/* Audio Quality */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Music size={16} className="text-accent-blue" />
            <h2 className="text-sm font-medium text-white">Audio Quality</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['128kbps', '256kbps', '320kbps'].map((a) =>
            <button
              key={a}
              onClick={() => handleAudioChange(a)}
              className={`py-3 rounded-xl text-sm font-medium transition-all border ${audio === a ? 'bg-accent-blue/10 border-accent-blue text-accent-blue shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'}`}>
              
                {a}
              </button>
            )}
          </div>
        </section>


        {/* Summary */}
        <GlassCard className="p-4 mt-auto">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-text-secondary shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-white font-medium">
                  Estimated File Size
                </span>
                <span className="text-sm font-bold text-accent-cyan">
                  {quality === '4K' ?
                  '185 MB' :
                  quality === '1080p' ?
                  '65 MB' :
                  '28 MB'}
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                Exporting {quality} {format} video with {audio} audio.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="mt-6">
        <GradientButton
          onClick={() => navigate('/export-processing')}
          icon={Download}
          className="w-full">
          
          Export Video
        </GradientButton>
      </div>
    </MobileLayout>);

}