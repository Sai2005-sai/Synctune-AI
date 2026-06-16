import React, { useState, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MobileLayout,
  GradientButton,
  GlassCard } from
'../components/SharedComponents';
import {
  ArrowLeft,
  Search,
  ChevronDown,
  MessageSquare,
  Mail } from
'lucide-react';
export default function HelpFAQ() {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<number | null>(1);
  const faqs = [
  {
    id: 1,
    q: 'How does the AI choose the music?',
    a: "Our AI analyzes your video's visual elements including brightness, color palette, motion intensity, and scene cuts. It then matches these characteristics with audio profiles in our library to find the perfect mood and energy match."
  },
  {
    id: 2,
    q: 'Can I use the exported videos commercially?',
    a: 'Yes! All music generated or provided through SyncTune AI is royalty-free and cleared for commercial use on platforms like YouTube, TikTok, and Instagram.'
  },
  {
    id: 3,
    q: 'What is the maximum video length supported?',
    a: 'Currently, Free tier users can upload videos up to 3 minutes long. Pro users can upload videos up to 10 minutes long and up to 500MB in size.'
  },
  {
    id: 4,
    q: 'How do I manually adjust the synced audio?',
    a: "After the AI generates the initial sync plan, you can tap 'Edit Segments' or 'Manual Adjustments' to enter the timeline editor. There you can drag segments, change tracks, and adjust fade transitions."
  },
  {
    id: 5,
    q: 'Why did my export fail?',
    a: 'Export failures usually happen due to connection drops or insufficient storage space on your device. Please ensure you have a stable connection and at least 1GB of free space.'
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
          Help & FAQ
        </h1>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-text-secondary" />
        </div>
        <input
          type="text"
          placeholder="Search for help..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-purple transition-all" />
        
      </div>

      <div className="flex-1 flex flex-col">
        <h2 className="text-sm font-bold text-white mb-4">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3 mb-8">
          {faqs.map((faq) =>
          <GlassCard key={faq.id} className="overflow-hidden">
              <button
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              className="w-full p-4 flex items-center justify-between text-left">
              
                <span className="text-sm font-medium text-white pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                size={18}
                className={`text-text-secondary transition-transform duration-300 shrink-0 ${openId === faq.id ? 'rotate-180 text-accent-cyan' : ''}`} />
              
              </button>

              <AnimatePresence>
                {openId === faq.id &&
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0
                }}
                animate={{
                  height: 'auto',
                  opacity: 1
                }}
                exit={{
                  height: 0,
                  opacity: 0
                }}
                className="overflow-hidden">
                
                    <div className="p-4 pt-0 text-sm text-text-secondary leading-relaxed border-t border-white/5 mt-1">
                      {faq.a}
                    </div>
                  </motion.div>
              }
              </AnimatePresence>
            </GlassCard>
          )}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/10">
        <h2 className="text-sm font-bold text-white mb-4 text-center">
          Still need help?
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button className="flex flex-col items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
            <MessageSquare size={20} className="text-accent-cyan" />
            <span className="text-xs font-medium text-white">Live Chat</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
            <Mail size={20} className="text-accent-purple" />
            <span className="text-xs font-medium text-white">Email Us</span>
          </button>
        </div>
      </div>
    </MobileLayout>);

}