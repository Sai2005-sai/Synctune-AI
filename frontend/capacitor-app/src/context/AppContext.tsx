/**
 * AppContext.tsx — Global state for SyncTune AI web app
 * Correct function signatures from engine files.
 */
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { analyzeFrames } from '../engine/frameAnalyzer';
import { buildAnalysisResult, analyzeVideoFallback, VideoAnalysisResult, VideoMetadata } from '../engine/videoAnalyzer';
import { classify } from '../engine/classifier';
import { matchBGM, MatchedTrack } from '../engine/bgmMatcher';
import { selectTracks } from '../engine/trackSelector';
import { loadTracksMetadata, LoadedTrack } from '../engine/musicLoader';
import { computeSegments } from '../engine/videoSegmenter';
import { assignTracksToSegments, resetVariationHistory, SegmentAssignment } from '../engine/audioVariationEngine';
import type { LocalTrack } from '../data/musicLibrary';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';
import { Capacitor } from '@capacitor/core';

export interface VideoFile {
  url: string;
  name: string;
  size: number;
  duration?: number;
}

export interface AppState {
  video: VideoFile | null;
  prompt: string;
  isAnalyzing: boolean;
  analysisResult: VideoAnalysisResult | null;
  analysisError: string | null;
  matchedTracks: MatchedTrack[];
  selectedLocalTracks: LocalTrack[];
  segmentAssignments: SegmentAssignment[];
  selectedTrackId: string | null;
}

interface AppActions {
  setVideo: (v: VideoFile | null) => void;
  setVideoDuration: (d: number) => void;
  setPrompt: (p: string) => void;
  runAnalysis: () => Promise<void>;
  selectTrack: (id: string) => void;
  resetAll: () => void;
  loadProject: (project: any) => Promise<void>;
  updateProject: (project: any) => Promise<void>;
  projects: any[];
  linkLocalVideo: (url: string) => void;
}

const defaultState: AppState = {
  video: null, prompt: '', isAnalyzing: false, analysisResult: null,
  analysisError: null, matchedTracks: [], selectedLocalTracks: [],
  segmentAssignments: [], selectedTrackId: null,
};

const AppCtx = createContext<AppState & AppActions>({
  ...defaultState,
  setVideo: () => {}, setVideoDuration: () => {}, setPrompt: () => {},
  runAnalysis: async () => {}, selectTrack: () => {}, resetAll: () => {},
  loadProject: async () => {},
  updateProject: async () => {},
  projects: [],
  linkLocalVideo: () => {},
});

export const useApp = () => useContext(AppCtx);

const uploadVideoToServer = async (videoUrl: string, name: string): Promise<string> => {
  try {
    const blob = await fetch(videoUrl).then(r => r.blob());
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64Str = dataUrl.split(',')[1];
        resolve(base64Str);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64, filename: name })
    });
    const data = await res.json();
    if (data && data.url) {
      return data.url;
    }
  } catch (err) {
    console.error('Failed to upload video to server:', err);
  }
  return videoUrl;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [projects, setProjects] = useState<any[]>([]);
  const { user } = useAuth();

  const syncProjects = useCallback(async () => {
    if (!user || !(user.id || user.email)) return;
    const emailKey = `synctune_projects_${user.email}`;
    const localSaved = localStorage.getItem(emailKey);
    let localProjects = localSaved ? JSON.parse(localSaved) : [];

    try {
      const identifier = user.id || user.email;
      const res = await fetch(`${API_URL}/api/projects/${identifier}`);
      const dbProjects = await res.json();
      if (Array.isArray(dbProjects)) {
        const merged = [...dbProjects];
        localProjects.forEach((lp: any) => {
          const dbIndex = merged.findIndex(dp => dp.id === lp.id || dp.name === lp.name);
          if (dbIndex === -1) {
            merged.push(lp);
          } else {
            const dbProj = merged[dbIndex];
            if (lp.status === 'Completed' && dbProj.status !== 'Completed') {
              merged[dbIndex] = { ...dbProj, ...lp };
            }
          }
        });
        merged.sort((a, b) => b.id - a.id);
        localStorage.setItem(emailKey, JSON.stringify(merged));
        setProjects(merged);
      }
    } catch (err) {
      console.error('Failed to sync projects from backend:', err);
    }
  }, [user]);

  useEffect(() => {
    const emailKey = user ? `synctune_projects_${user.email}` : 'synctune_projects_guest';
    const localSaved = localStorage.getItem(emailKey);
    let localProjects = localSaved ? JSON.parse(localSaved) : [];
    setProjects(localProjects);

    if (user) {
      syncProjects();
      const interval = setInterval(syncProjects, 10000); // Sync every 10 seconds
      return () => clearInterval(interval);
    } else {
      setProjects([]);
    }
  }, [user, syncProjects]);

  const loadProject = useCallback(async (project: any) => {
    const parseDuration = (d: any): number => {
      if (typeof d === 'number') return d;
      if (typeof d === 'string') {
        const parts = d.split(':');
        if (parts.length === 2) {
          return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
        return parseInt(d) || 15;
      }
      return 15;
    };

    const videoDuration = parseDuration(project.duration);
    
    const isInvalidUrlForPlatform = (urlStr: string) => {
      if (!urlStr) return true;
      const isNative = Capacitor.isNativePlatform();
      
      // Blob URLs are invalid when restoring a project in a new session (whether on web or phone)
      if (urlStr.startsWith('blob:')) return true;
      
      // On web, if the URL is not a valid remote web url, it's invalid (e.g. C:/ local paths, content://, file://, _capacitor_file_)
      if (!isNative) {
        if (urlStr.startsWith('file://') || urlStr.startsWith('content://') || urlStr.includes('_capacitor_file_')) {
          return true;
        }
        if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
          return true;
        }
      }
      
      return false;
    };
    
    const finalVideoUrl = isInvalidUrlForPlatform(project.url || '')
      ? 'https://www.w3schools.com/html/mov_bbb.mp4'
      : (project.url || 'https://www.w3schools.com/html/mov_bbb.mp4');

    const mockVideo: VideoFile = {
      url: finalVideoUrl,
      name: project.name || 'My SyncTune Project',
      size: typeof project.size === 'number' ? project.size : (parseInt(project.size) * 1024 * 1024 || 1024 * 1024 * 12),
      duration: videoDuration
    };

    const meta = { uri: mockVideo.url, name: mockVideo.name, size: mockVideo.size, duration: mockVideo.duration };
    const fallback = analyzeVideoFallback(meta);
    if (project.mood) {
      fallback.classifiedMood = project.mood;
    }
    const matched = matchBGM(fallback);
    const selected = selectTracks(fallback.classifiedMood, fallback.energyLevel);
    
    const targetTrackId = project.selectedTrackId || matched[0]?.id || null;
    const allLoaded = await loadTracksMetadata(undefined);
    const targetTrack = allLoaded.find(t => t.id === targetTrackId) || 
                        matched.find(t => t.id === targetTrackId) || 
                        selected.find(t => t.id === targetTrackId) || 
                        allLoaded[0] || matched[0] || selected[0];

    const segments = [{ id: 'seg_1', startTime: 0, endTime: videoDuration, duration: videoDuration, mood: fallback.classifiedMood }];
    const assignments = [{ segment: segments[0], track: targetTrack, audioStartTime: 0 }];

    setState({
      video: mockVideo,
      prompt: '',
      isAnalyzing: false,
      analysisResult: fallback,
      analysisError: null,
      matchedTracks: matched,
      selectedLocalTracks: selected,
      segmentAssignments: assignments,
      selectedTrackId: targetTrackId,
    });
  }, []);

  const updateProject = useCallback(async (updatedProj: any) => {
    const emailKey = user ? `synctune_projects_${user.email}` : 'synctune_projects_guest';
    setProjects(prev => {
      const idx = prev.findIndex(p => p.name === updatedProj.name);
      let updatedList = [...prev];
      if (idx !== -1) {
        updatedList[idx] = { 
          selectedTrackId: state.selectedTrackId, 
          ...updatedList[idx], 
          ...updatedProj 
        };
      } else {
        const newProj = {
          id: Date.now(),
          name: updatedProj.name || 'My SyncTune Project',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          mood: state.analysisResult?.classifiedMood || 'Cinematic',
          status: 'Completed',
          duration: state.video?.duration ? `${Math.floor(state.video.duration / 60)}:${Math.floor(state.video.duration % 60) < 10 ? '0' : ''}${Math.floor(state.video.duration % 60)}` : '0:15',
          size: state.video?.size ? `${Math.round(state.video.size / 1024 / 1024)} MB` : '12 MB',
          img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=500&auto=format&fit=crop',
          selectedTrackId: state.selectedTrackId,
          ...updatedProj
        };
        updatedList.unshift(newProj);
      }
      localStorage.setItem(emailKey, JSON.stringify(updatedList));
      
      const targetProj = idx !== -1 ? updatedList[idx] : updatedList[0];
      if (user && (user.id || user.email)) {
        fetch(`${API_URL}/api/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, email: user.email, project: targetProj })
        }).catch(err => console.error('Failed to sync updated project to backend:', err));
      }
      
      return updatedList;
    });
  }, [user, state.video, state.analysisResult, state.selectedTrackId]);

  const setVideo = useCallback((v: VideoFile | null) =>
    setState(s => ({ ...s, video: v, analysisResult: null, matchedTracks: [], segmentAssignments: [], analysisError: null })), []);

  const setVideoDuration = useCallback((d: number) =>
    setState(s => s.video ? { ...s, video: { ...s.video, duration: d } } : s), []);

  const setPrompt = useCallback((p: string) =>
    setState(s => ({ ...s, prompt: p })), []);

  const selectTrack = useCallback((id: string) =>
    setState(s => ({ ...s, selectedTrackId: id })), []);

  const resetAll = useCallback(() => {
    resetVariationHistory();
    setState(defaultState);
  }, []);

  const linkLocalVideo = useCallback((url: string) => {
    setState(s => ({
      ...s,
      video: s.video ? { ...s.video, url } : null
    }));
  }, []);

  const runAnalysis = useCallback(async () => {
    const { video, prompt } = state;
    if (!video || !video.duration) return;
    setState(s => ({ ...s, isAnalyzing: true, analysisError: null }));

    const meta: VideoMetadata = { uri: video.url, name: video.name, size: video.size, duration: video.duration };

    try {
      // 1. Frame analysis (web canvas)
      let frameData;
      try { frameData = await analyzeFrames(video.url, video.duration); }
      catch { frameData = analyzeVideoFallback(meta).frameMetrics; }

      // 2. Classify mood from frame data
      const classification = classify(
        frameData.brightness,
        frameData.motionIntensity,
        frameData.sceneCuts,
        frameData.frameCount,
      );

      // 3. Build full result
      const result = buildAnalysisResult(meta, frameData, classification);

      // 4. Match BGM — matchBGM(analysis, userPrompt?, topN?)
      const matched = matchBGM(result, prompt || undefined);

      // 5. Select best tracks for mood
      const selected: LocalTrack[] = selectTracks(result.classifiedMood, result.energyLevel);

      // 6. Build variation plan — computeSegments(videoDuration, frameData)
      const segments = computeSegments(video.duration, frameData);
      resetVariationHistory();
      const allLoaded: LoadedTrack[] = await loadTracksMetadata(undefined);
      const assignments = assignTracksToSegments(segments, allLoaded, video.duration);

      // 7. Upload video to the server for cross-device persistence
      let remoteVideoUrl = video.url;
      try {
        remoteVideoUrl = await uploadVideoToServer(video.url, video.name);
      } catch (err) {
        console.error('Video upload failed, falling back to local URL:', err);
      }

      // Save project to localStorage & backend for persistence
      try {
        const emailKey = user ? `synctune_projects_${user.email}` : 'synctune_projects_guest';
        const formatDuration = (secs: number) => {
          const m = Math.floor(secs / 60);
          const s = Math.floor(secs % 60);
          return `${m}:${s < 10 ? '0' : ''}${s}`;
        };
        const newProj = {
          id: Date.now(),
          name: video.name || 'My SyncTune Project',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          mood: result.classifiedMood || 'Cinematic',
          status: 'Draft',
          duration: formatDuration(video.duration || 15),
          size: `${Math.round((video.size || 0) / 1024 / 1024)} MB`,
          img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=500&auto=format&fit=crop',
          url: remoteVideoUrl,
          selectedTrackId: matched[0]?.id || null
        };
        
        setProjects(prev => {
          const updated = [newProj, ...prev.filter(p => p.name !== newProj.name)];
          localStorage.setItem(emailKey, JSON.stringify(updated));
          return updated;
        });

        if (user && (user.id || user.email)) {
          fetch(`${API_URL}/api/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, email: user.email, project: newProj })
          }).catch(err => console.error('Failed to sync project to backend:', err));
        }
      } catch (e) {
        console.error('Failed to save project:', e);
      }

      setState(s => ({
        ...s,
        video: s.video ? { ...s.video, url: remoteVideoUrl } : null,
        isAnalyzing: false,
        analysisResult: result,
        matchedTracks: matched,
        selectedLocalTracks: selected,
        segmentAssignments: assignments,
        selectedTrackId: matched[0]?.id ?? null,
      }));
    } catch (err: any) {
      console.error('[AppContext] Analysis failed:', err);
      // Attempt fallback result
      try {
        const fallback = analyzeVideoFallback(meta);
        const matched = matchBGM(fallback, prompt || undefined);
        setState(s => ({
          ...s, isAnalyzing: false, analysisResult: fallback,
          matchedTracks: matched, selectedLocalTracks: [],
          segmentAssignments: [], selectedTrackId: matched[0]?.id ?? null,
          analysisError: 'Frame analysis failed — using AI defaults',
        }));
      } catch {
        setState(s => ({ ...s, isAnalyzing: false, analysisError: err?.message ?? 'Analysis failed' }));
      }
    }
  }, [state]);

  return (
    <AppCtx.Provider value={{ ...state, setVideo, setVideoDuration, setPrompt, runAnalysis, selectTrack, resetAll, loadProject, updateProject, projects, linkLocalVideo }}>
      {children}
    </AppCtx.Provider>
  );
}
