import React, { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Folder, User, Plus, Play, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
export const MobileLayout = ({
  children,
  className = '',
  hideNav = false




}: {children: React.ReactNode;className?: string;hideNav?: boolean;}) => {
  return (
    <div className="w-full min-h-screen bg-dark-bg flex justify-center overflow-hidden">
      <div
        className={`w-full max-w-[390px] md:max-w-3xl lg:max-w-5xl min-h-screen bg-dark-bg relative shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-y-auto overflow-x-hidden md:border-x md:border-white/5 ${!hideNav ? 'md:pt-20' : ''} ${className}`}>
        
        {children}
        {!hideNav && <div className="h-24 md:hidden" />} {/* Spacer for bottom nav */}
        {!hideNav && <BottomNav />}
      </div>
    </div>);

};
export const GlassCard = ({
  children,
  className = '',
  onClick




}: {children: React.ReactNode;className?: string;onClick?: () => void;}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-2xl p-4 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}>
      
      {children}
    </div>);

};
export const GradientButton = ({
  children,
  className = '',
  onClick,
  icon: Icon,
  fullWidth = true,
  disabled,
  type,
}: {children: React.ReactNode;className?: string;onClick?: () => void;icon?: any;fullWidth?: boolean;disabled?: boolean;type?: 'button'|'submit'|'reset';}) => {
  return (
    <button
      onClick={onClick}
      type={type ?? 'button'}
      disabled={disabled}
      className={`bg-gradient-accent text-white font-medium py-3.5 px-6 rounded-full glow-shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      
      {Icon && <Icon size={20} />}
      {children}
    </button>);

};
export const OutlinedButton = ({
  children,
  className = '',
  onClick,
  icon: Icon,
  fullWidth = true,
  disabled,
  type,
}: {children: React.ReactNode;className?: string;onClick?: () => void;icon?: any;fullWidth?: boolean;disabled?: boolean;type?: 'button'|'submit'|'reset';}) => {
  return (
    <button
      onClick={onClick}
      type={type ?? 'button'}
      disabled={disabled}
      className={`bg-white/5 border border-white/20 text-white font-medium py-3.5 px-6 rounded-full active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-white/10 ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      
      {Icon && <Icon size={20} />}
      {children}
    </button>);

};
export const BottomNav = () => {
  const location = useLocation();
  const navItems = [
  {
    icon: Home,
    label: 'Home',
    path: '/'
  },
  {
    icon: Folder,
    label: 'Projects',
    path: '/projects'
  },
  {
    icon: User,
    label: 'Profile',
    path: '/profile'
  }];

  return (
    <div className="fixed bottom-0 md:top-0 md:bottom-auto w-full max-w-[390px] md:max-w-3xl lg:max-w-5xl h-20 md:h-20 glass-card rounded-t-3xl md:rounded-none border-b-0 md:border-b md:border-white/10 border-x-0 flex justify-around md:justify-between items-center px-6 md:px-8 z-50">
      
      {/* Desktop Logo */}
      <div className="hidden md:flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-lg shadow-accent-purple/20">
          <Play size={20} className="text-white ml-1" fill="currentColor" />
        </div>
        <span className="font-display font-bold text-xl text-white tracking-wide">SyncTune</span>
      </div>

      <div className="flex justify-around md:justify-end items-center w-full md:w-auto md:gap-8">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          if (index === 1) {
            return (
              <Fragment key={item.path}>
                <Link
                  to={item.path}
                  className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 ${isActive ? 'text-accent-cyan' : 'text-text-secondary hover:text-white transition-colors'}`}>
                  
                  <item.icon
                    size={24}
                    className={isActive ? 'text-accent-cyan md:w-5 md:h-5' : 'md:w-5 md:h-5'} />
                  
                  <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
                </Link>

                {/* Floating FAB on Mobile / Flat Button on Desktop */}
                <div className="relative -top-8 md:top-0 md:ml-4">
                  <Link to="/upload">
                    <div className="w-14 h-14 md:w-auto md:h-10 md:px-5 rounded-full bg-gradient-accent glow-shadow flex items-center justify-center text-white hover:scale-105 transition-transform md:shadow-none md:rounded-xl">
                      <Plus size={28} className="md:w-5 md:h-5" />
                      <span className="hidden md:block ml-2 text-sm font-bold">New Project</span>
                    </div>
                  </Link>
                </div>
              </Fragment>);
          }
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 ${isActive ? 'text-accent-cyan' : 'text-text-secondary hover:text-white transition-colors'}`}>
              
              <item.icon
                size={24}
                className={isActive ? 'text-accent-cyan md:w-5 md:h-5' : 'md:w-5 md:h-5'} />
              
              <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
            </Link>);

        })}
      </div>
    </div>);

};
export const MoodChip = ({ mood }: {mood: string;}) => {
  const getColors = () => {
    switch (mood.toLowerCase()) {
      case 'happy':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'sad':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'energetic':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'calm':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'cinematic':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-white/10 text-white border-white/20';
    }
  };
  return (
    <div
      className={`px-3 py-1 rounded-full text-xs font-medium border ${getColors()} inline-flex items-center gap-1`}>
      
      {mood}
    </div>);

};
export const EnergyBadge = ({
  level


}: {level: 'Low' | 'Medium' | 'High';}) => {
  return (
    <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
      <div className="flex items-end gap-0.5 h-3">
        <div
          className={`w-1 rounded-full ${level === 'Low' || level === 'Medium' || level === 'High' ? 'bg-status-success h-1.5' : 'bg-white/20 h-1.5'}`} />
        
        <div
          className={`w-1 rounded-full ${level === 'Medium' || level === 'High' ? 'bg-status-warning h-2.5' : 'bg-white/20 h-2.5'}`} />
        
        <div
          className={`w-1 rounded-full ${level === 'High' ? 'bg-status-error h-3.5' : 'bg-white/20 h-3.5'}`} />
        
      </div>
      <span className="text-xs font-medium text-white">{level} Energy</span>
    </div>);

};
export const ProgressSteps = ({
  currentStep,
  totalSteps = 5



}: {currentStep: number;totalSteps?: number;}) => {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({
        length: totalSteps
      }).map((_, i) =>
      <div
        key={i}
        className={`h-1.5 rounded-full transition-all duration-300 ${i + 1 === currentStep ? 'w-8 bg-gradient-accent' : i + 1 < currentStep ? 'w-4 bg-accent-purple/50' : 'w-4 bg-white/10'}`} />

      )}
    </div>);

};
export const AILoader = ({ text = 'Processing...' }: {text?: string;}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute inset-0 rounded-full border-2 border-accent-purple/30" />
        
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3
          }}
          className="absolute inset-4 rounded-full border-2 border-accent-cyan/30" />
        
        <motion.div
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute inset-8 rounded-full border border-dashed border-accent-blue/50" />
        
        <div className="w-12 h-12 rounded-full bg-gradient-accent glow-shadow flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-dark-bg flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-accent-cyan animate-pulse" />
          </div>
        </div>
      </div>
      <motion.p
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity
        }}
        className="text-lg font-display font-medium text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-cyan">
        
        {text}
      </motion.p>
    </div>);

};
export const WaveformVisualizer = ({
  playing = false


}: {playing?: boolean;}) => {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {Array.from({
        length: 30
      }).map((_, i) => {
        const height = Math.max(10, Math.random() * 40);
        return (
          <motion.div
            key={i}
            animate={
            playing ?
            {
              height: [height, Math.max(10, Math.random() * 48), height]
            } :
            {
              height: height * 0.5
            }
            }
            transition={{
              duration: 0.5 + Math.random() * 0.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="w-1.5 rounded-full bg-gradient-to-t from-accent-purple to-accent-cyan opacity-80"
            style={{
              height: `${height}px`
            }} />);


      })}
    </div>);

};