import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileLayout, GlassCard } from '../components/SharedComponents';
import {
  ArrowLeft,
  Globe,
  Twitter,
  Instagram,
  Github,
  Heart } from
'lucide-react';
export default function AboutApp() {
  const navigate = useNavigate();
  return (
    <MobileLayout
      hideNav
      className="flex flex-col px-6 py-8 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl" />

      <div className="flex items-center gap-4 mb-12 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-bold text-white">About</h1>
      </div>

      <div className="flex-1 flex flex-col items-center relative z-10">
        <motion.div
          initial={{
            scale: 0.9,
            opacity: 0
          }}
          animate={{
            scale: 1,
            opacity: 1
          }}
          className="relative w-24 h-24 mb-6">
          
          <div className="absolute inset-0 bg-gradient-accent rounded-3xl blur-xl opacity-50" />
          <div className="relative w-full h-full bg-dark-surface rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#gradient-about)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              
              <defs>
                <linearGradient
                  id="gradient-about"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%">
                  
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
              <path d="M12 2v20" strokeDasharray="2 4" opacity="0.5" />
            </svg>
          </div>
        </motion.div>

        <h2 className="font-display text-2xl font-bold text-white mb-1">
          SyncTune AI
        </h2>
        <p className="text-text-secondary text-sm mb-6">
          Version 1.0.0 (Build 42)
        </p>

        <p className="text-center text-sm text-white/80 leading-relaxed mb-10 px-4">
          SyncTune AI empowers creators by automatically finding and syncing the
          perfect background music to match the mood, energy, and pacing of any
          video.
        </p>

        <div className="w-full space-y-4 mb-10">
          <GlassCard className="p-4 flex flex-col gap-2">
            <span className="text-sm font-bold text-white uppercase tracking-wider text-accent-cyan">
              Privacy Policy
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">
              Your privacy is our priority. SyncTune AI securely processes your video and audio data on your local device whenever possible. Any data transmitted to our servers for advanced AI analysis is fully encrypted in transit and at rest, and is never shared with third parties or used to train public models without your explicit consent.
            </p>
          </GlassCard>
          <GlassCard className="p-4 flex flex-col gap-2">
            <span className="text-sm font-bold text-white uppercase tracking-wider text-accent-purple">
              Terms of Service
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">
              By using SyncTune AI, you agree to our terms of acceptable use. You retain full ownership and copyright of all original videos uploaded and exported through our platform. The generated background music synchronization is provided as-is, and users must adhere to local copyright laws regarding the commercial distribution of the final tracks.
            </p>
          </GlassCard>
          <GlassCard className="p-4 flex flex-col gap-2">
            <span className="text-sm font-bold text-white uppercase tracking-wider text-pink-400">
              Open Source Licenses
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">
              SyncTune AI is built using incredible open-source technologies including React, Vite, Framer Motion, and TailwindCSS. We are deeply grateful to the open-source community. A complete list of dependencies, their respective MIT and Apache 2.0 licenses, and our compliance documentation can be found in our official GitHub repository.
            </p>
          </GlassCard>
        </div>

        <div className="mt-auto flex items-center gap-2 text-xs text-text-secondary">
          Made with{' '}
          <Heart size={12} className="text-status-error fill-status-error" /> by
          SyncTune Team
        </div>
      </div>
    </MobileLayout>);

}