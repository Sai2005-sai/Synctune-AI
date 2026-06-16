import React, { useState, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout, GlassCard } from '../components/SharedComponents';
import {
  ArrowLeft,
  Moon,
  Sun,
  Palette,
  Volume2,
  HardDrive,
  Bell,
  Trash2 } from
'lucide-react';
export default function Settings() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const Toggle = ({
    checked,
    onChange



  }: {checked: boolean;onChange: () => void;}) =>
  <button
    onClick={onChange}
    className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-accent-cyan' : 'bg-white/20'}`}>
    
      <div
      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'left-7' : 'left-1'}`} />
    
    </button>;

  return (
    <MobileLayout hideNav className="flex flex-col px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-bold text-white">Settings</h1>
      </div>

      <div className="space-y-6 pb-8">
        {/* Appearance */}
        <section>
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 ml-1">
            Appearance
          </h2>
          <GlassCard className="divide-y divide-white/10">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ?
                <Moon size={18} className="text-accent-purple" /> :

                <Sun size={18} className="text-yellow-400" />
                }
                <span className="text-sm font-medium text-white">
                  Dark Mode
                </span>
              </div>
              <Toggle
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)} />
              
            </div>
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <Palette size={18} className="text-accent-cyan" />
                <span className="text-sm font-medium text-white">
                  Accent Color
                </span>
              </div>
              <div className="flex gap-2">
                <div className="w-4 h-4 rounded-full bg-accent-purple" />
                <div className="w-4 h-4 rounded-full bg-accent-blue" />
                <div className="w-4 h-4 rounded-full bg-accent-cyan ring-2 ring-white ring-offset-2 ring-offset-dark-surface" />
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Audio & Playback */}
        <section>
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 ml-1">
            Audio & Playback
          </h2>
          <GlassCard className="divide-y divide-white/10">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 size={18} className="text-white" />
                <span className="text-sm font-medium text-white">
                  Auto-play Previews
                </span>
              </div>
              <Toggle
                checked={autoPlay}
                onChange={() => setAutoPlay(!autoPlay)} />
              
            </div>
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white ml-8">
                  Default Audio Quality
                </span>
              </div>
              <span className="text-sm text-text-secondary">320kbps</span>
            </div>
          </GlassCard>
        </section>

        {/* Storage */}
        <section>
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 ml-1">
            Storage
          </h2>
          <GlassCard className="divide-y divide-white/10">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HardDrive size={18} className="text-white" />
                <span className="text-sm font-medium text-white">
                  App Cache
                </span>
              </div>
              <span className="text-sm font-bold text-white">245 MB</span>
            </div>
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-status-error/10 transition-colors group">
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-status-error" />
                <span className="text-sm font-medium text-status-error">
                  Clear Cache
                </span>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 ml-1">
            Notifications
          </h2>
          <GlassCard>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-white" />
                <span className="text-sm font-medium text-white">
                  Push Notifications
                </span>
              </div>
              <Toggle
                checked={notifications}
                onChange={() => setNotifications(!notifications)} />
              
            </div>
          </GlassCard>
        </section>
      </div>
    </MobileLayout>);

}