import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout, GlassCard, GradientButton } from '../components/SharedComponents';
import { ArrowLeft, User, Mail, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [photo, setPhoto] = useState(user?.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateProfile(name, photo);
    navigate(-1);
  };

  return (
    <MobileLayout hideNav className="flex flex-col relative pb-24">
      <div className="sticky top-0 z-20 bg-dark-bg/90 backdrop-blur-xl px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-xl font-bold text-white">Edit Profile</h1>
        </div>
      </div>

      <div className="px-6 pt-8">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-accent relative z-10">
              <img src={photo} crossOrigin="anonymous" className="w-full h-full rounded-full border-4 border-dark-bg object-cover" alt="Avatar" />
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-dark-surface rounded-full border-2 border-white/10 flex items-center justify-center z-20 hover:bg-white/20">
              <Camera size={14} className="text-white" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

        <GlassCard className="p-4 mb-4">
          <label className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">Full Name</label>
          <div className="flex items-center gap-3">
            <User size={18} className="text-white/40" />
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent border-none text-white font-medium text-sm w-full outline-none" 
            />
          </div>
        </GlassCard>

        <GlassCard className="p-4 mb-8 opacity-70">
          <label className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">Email Address</label>
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-white/40" />
            <input 
              type="email" 
              value={user?.email || ''} 
              readOnly
              className="bg-transparent border-none text-white font-medium text-sm w-full outline-none cursor-not-allowed" 
            />
          </div>
          <p className="text-[10px] text-text-secondary mt-2">Email address cannot be changed.</p>
        </GlassCard>

        <GradientButton className="w-full" onClick={handleSave}>
          Save Changes
        </GradientButton>
      </div>
    </MobileLayout>
  );
}
