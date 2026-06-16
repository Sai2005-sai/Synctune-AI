import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileLayout, GlassCard } from '../components/SharedComponents';
import {
  User,
  Crown,
  FolderHeart,
  Settings as SettingsIcon,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight } from
'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleSignOut = () => {
     logout();
     navigate('/splash');
  };
  
  const menuItems = [
  {
    icon: User,
    label: 'Edit Profile',
    path: '/edit-profile',
    color: 'text-blue-400'
  },
  {
    icon: Crown,
    label: 'Subscription',
    path: '/subscription',
    color: 'text-yellow-400',
    badge: 'PRO'
  },
  {
    icon: SettingsIcon,
    label: 'Settings',
    path: '/settings',
    color: 'text-gray-400'
  },
  {
    icon: HelpCircle,
    label: 'Help & FAQ',
    path: '/help',
    color: 'text-accent-cyan'
  },
  {
    icon: Info,
    label: 'About SyncTune',
    path: '/about',
    color: 'text-accent-purple'
  }];

  return (
    <MobileLayout className="flex flex-col relative pb-24">
      {/* Header Background */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-accent-purple/20 via-dark-bg to-dark-bg pointer-events-none" />

      <div className="relative z-10 px-6 pt-12">
        <h1 className="font-display text-2xl font-bold text-white mb-8">
          Profile
        </h1>

        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-accent blur-md opacity-50" />
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-accent relative z-10 flex items-center justify-center overflow-hidden">
               {user?.photo ? (
                 <img src={user.photo} crossOrigin="anonymous" className="w-full h-full rounded-full border-4 border-dark-bg object-cover" alt="Profile" />
               ) : (
                 <div className="w-full h-full bg-dark-bg rounded-full flex items-center justify-center border-4 border-dark-bg">
                    <span className="text-3xl font-display font-bold text-white uppercase">{user?.name?.charAt(0) || 'U'}</span>
                 </div>
               )}
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-accent-cyan rounded-full border-2 border-dark-bg flex items-center justify-center z-20">
              <Crown size={12} className="text-dark-bg" fill="currentColor" />
            </div>
          </div>

          <h2 className="font-display text-xl font-bold text-white">
            {user?.name || 'SyncTune User'}
          </h2>
          <p className="text-text-secondary text-sm">{user?.email || 'user@example.com'}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <GlassCard className="p-3 flex flex-col items-center justify-center text-center">
            <span className="font-display text-xl font-bold text-white mb-1">
              12
            </span>
            <span className="text-[10px] text-text-secondary uppercase tracking-wider">
              Projects
            </span>
          </GlassCard>
          <GlassCard className="p-3 flex flex-col items-center justify-center text-center">
            <span className="font-display text-xl font-bold text-white mb-1">
              8
            </span>
            <span className="text-[10px] text-text-secondary uppercase tracking-wider">
              Exports
            </span>
          </GlassCard>
          <GlassCard className="p-3 flex flex-col items-center justify-center text-center">
            <span className="font-display text-xl font-bold text-accent-cyan mb-1">
              24h
            </span>
            <span className="text-[10px] text-text-secondary uppercase tracking-wider">
              Saved
            </span>
          </GlassCard>
        </div>

        {/* Menu */}
        <div className="space-y-3">
          {menuItems.map((item, i) =>
          <motion.div
            key={item.label}
            initial={{
              opacity: 0,
              x: -20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              delay: i * 0.1
            }}>
            
              <GlassCard
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => item.path !== '#' && navigate(item.path)}>
              
                <div className="flex items-center gap-4">
                  <div
                  className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${item.color}`}>
                  
                    <item.icon size={20} />
                  </div>
                  <span className="font-medium text-white text-sm">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {item.badge &&
                <span className="bg-gradient-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                }
                  <ChevronRight size={18} className="text-text-secondary" />
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>

        <button
          onClick={handleSignOut}
          className="w-full mt-8 py-4 flex items-center justify-center gap-2 text-status-error font-medium text-sm hover:bg-status-error/10 rounded-xl transition-colors">
          
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </MobileLayout>);

}