import React, { useState, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MobileLayout,
  GlassCard,
  MoodChip } from
'../components/SharedComponents';
import { Search, Filter, MoreVertical, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProjectHistory() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  
  const projects = (() => {
    try {
      const saved = localStorage.getItem('synctune_projects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  const filteredProjects = projects.filter((p: any) => {
    const matchesTab = activeTab === 'All' || p.status === activeTab || (activeTab === 'In Progress' && p.status === 'Draft');
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <MobileLayout className="flex flex-col relative">
      <div className="sticky top-0 z-20 bg-dark-bg/90 backdrop-blur-xl px-6 py-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-white">
            My Projects
          </h1>
          <button 
            onClick={() => setShowSearchInput(!showSearchInput)}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${showSearchInput ? 'bg-accent-cyan border-accent-cyan text-dark-bg' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
          >
            <Search size={18} />
          </button>
        </div>

        {showSearchInput && (
          <div className="mb-4 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-accent-cyan transition-colors"
              autoFocus
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-text-secondary hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {['All', 'Completed', 'In Progress'].map((tab) =>
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-colors flex-1 ${activeTab === tab ? 'bg-white text-dark-bg' : 'bg-white/5 border border-white/10 text-text-secondary hover:text-white'}`}>
            
              {tab}
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4 pb-24">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Search size={48} className="mb-4 text-text-secondary" />
            <p className="text-text-secondary">No projects found.</p>
          </div>
        ) : (
          filteredProjects.map((project, i) =>
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
              delay: i * 0.05
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
                      <Play
                      size={14}
                      className="text-white ml-0.5"
                      fill="currentColor" />
                    
                    </div>
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-medium text-white">
                    {project.duration}
                  </div>
                </div>

              <div className="flex-1 py-1 flex flex-col justify-between min-w-0">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 pr-2">
                    <h4 className="font-medium text-white text-sm truncate">
                      {project.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-secondary">
                      <span>{project.date}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span>{project.size}</span>
                    </div>
                  </div>
                  <button className="text-text-secondary hover:text-white p-1 shrink-0 -mt-1 -mr-1">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <MoodChip mood={project.mood} />
                  <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${project.status === 'Completed' ? 'bg-status-success/20 text-status-success' : project.status === 'Draft' ? 'bg-white/10 text-text-secondary' : 'bg-status-warning/20 text-status-warning'}`}>
                  
                    {project.status}
                  </span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </MobileLayout>);

}