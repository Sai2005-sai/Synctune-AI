import React, { Component, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MobileLayout,
  GlassCard,
  MoodChip } from
  '../components/SharedComponents';
import { Bell, Plus, Play, MoreVertical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HomeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState([
    { id: 1, title: 'Welcome to SyncTune AI!', desc: 'Explore AI-generated backing tracks for your videos.', time: 'Just now' },
    { id: 2, title: 'Export Ready', desc: 'Your cinematic video project is ready for download.', time: '2 hours ago' }
  ]);

  const recentProjects = (() => {
    try {
      const saved = localStorage.getItem('synctune_projects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  return (
    <MobileLayout className="px-6 pt-12 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            SyncTune{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-cyan">
              AI
            </span>
          </h1>
          <p className="text-text-secondary text-sm">Welcome back, {user?.name || 'User'}</p>
        </div>
        <div className="flex items-center gap-3 relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative hover:bg-white/10 transition-colors"
          >
            <Bell size={18} className="text-white" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-status-error rounded-full border border-dark-bg" />
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-12 top-12 w-72 bg-dark-surface/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-semibold text-sm">Notifications</span>
                {unreadNotifications.length > 0 && (
                  <button 
                    onClick={() => setUnreadNotifications([])}
                    className="text-accent-cyan text-xs font-medium hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {unreadNotifications.length === 0 ? (
                  <div className="text-center py-6 text-text-secondary text-xs">
                    No new notifications
                  </div>
                ) : (
                  unreadNotifications.map((notif) => (
                    <div key={notif.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-start">
                        <h4 className="text-white text-xs font-bold">{notif.title}</h4>
                        <span className="text-[10px] text-text-secondary">{notif.time}</span>
                      </div>
                      <p className="text-text-secondary text-[11px] mt-1 leading-relaxed">{notif.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <button 
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-gradient-accent p-[2px] cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          >
            {user?.photo ? (
              <img
                src={user.photo}
                alt="Profile"
                className="w-full h-full rounded-full border-2 border-dark-bg object-cover" />
            ) : (
              <div className="w-full h-full bg-dark-bg rounded-full flex items-center justify-center border-2 border-dark-bg">
                <span className="text-xs font-bold text-white uppercase">{user?.name?.charAt(0) || 'U'}</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Create New Project */}
      <motion.div
        whileTap={{
          scale: 0.98
        }}
        onClick={() => navigate('/upload')}
        className="relative w-full h-40 rounded-3xl overflow-hidden mb-10 cursor-pointer group shadow-lg">
        
        <div className="absolute inset-0 bg-gradient-accent opacity-80 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus size={28} />
          </div>
          <h2 className="font-display font-bold text-lg">Create New Project</h2>
        </div>
      </motion.div>

      {/* Recent Projects */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display font-bold text-lg text-white">
            Recent Projects
          </h3>
          <button
            onClick={() => navigate('/projects')}
            className="text-accent-cyan text-sm font-medium">
            
            See All
          </button>
        </div>

        <div className="space-y-4">
          {recentProjects.length === 0 ? (
            <div className="text-center py-10 opacity-50 text-text-secondary text-sm bg-white/5 border border-white/10 rounded-2xl">
              No recent projects
            </div>
          ) : (
            recentProjects.map((project, i) =>
              <motion.div
                key={project.id}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  delay: i * 0.1
                }}>
                
                  <GlassCard
                  className="flex gap-4 p-3"
                  onClick={() => navigate('/preview')}>
              
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                  <img
                  src={project.img}
                  alt={project.name}
                  className="w-full h-full object-cover" />
                
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play size={14} className="text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-medium text-white">
                    {project.duration}
                  </div>
                </div>

                <div className="flex-1 py-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-white text-sm line-clamp-1">
                        {project.name}
                      </h4>
                      <p className="text-text-secondary text-xs mt-0.5">
                        {project.date}
                      </p>
                    </div>
                    <button className="text-text-secondary hover:text-white p-1">
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <MoodChip mood={project.mood} />
                    <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${project.status === 'Completed' ? 'bg-status-success/20 text-status-success' : 'bg-white/10 text-text-secondary'}`}>
                    
                      {project.status}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )
        )}
        </div>
      </div>
    </MobileLayout>);

}