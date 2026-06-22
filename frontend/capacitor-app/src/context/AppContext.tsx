/**
 * AppContext.tsx — Global state for SyncTune AI web app
 * Correct function signatures from engine files.
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { analyzeFrames } from '../engine/frameAnalyzer';
import { buildAnalysisResult, analyzeVideoFallback, VideoAnalysisResult, VideoMetadata } from '../engine/videoAnalyzer';
import { classify } from '../engine/classifier';
import { matchBGM, MatchedTrack } from '../engine/bgmMatcher';
import { selectTracks } from '../engine/trackSelector';
import { loadTracksMetadata, LoadedTrack } from '../engine/musicLoader';
import { computeSegments } from '../engine/videoSegmenter';
import { assignTracksToSegments, resetVariationHistory, SegmentAssignment } from '../engine/audioVariationEngine';
import type { LocalTrack } from '../data/musicLibrary';

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
});

export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  const loadProject = useCallback(async (project: any) => {
    const mockVideo: VideoFile = {
      url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-light-12407-large.mp4',
      name: project.name || 'My SyncTune Project',
      size: 1024 * 1024 * 12,
      duration: 15
    };

    const meta = { uri: mockVideo.url, name: mockVideo.name, size: mockVideo.size, duration: mockVideo.duration };
    const fallback = analyzeVideoFallback(meta);
    if (project.mood) {
      fallback.classifiedMood = project.mood;
    }
    const matched = matchBGM(fallback);
    const selected = selectTracks(fallback.classifiedMood, fallback.energyLevel);
    
    const allLoaded = await loadTracksMetadata(undefined);
    const segments = [{ id: 'seg_1', startTime: 0, endTime: 15, duration: 15, mood: fallback.classifiedMood }];
    const assignments = [{ segment: segments[0], track: allLoaded[0] || matched[0] || selected[0], audioStartTime: 0 }];

    setState({
      video: mockVideo,
      prompt: '',
      isAnalyzing: false,
      analysisResult: fallback,
      analysisError: null,
      matchedTracks: matched,
      selectedLocalTracks: selected,
      segmentAssignments: assignments,
      selectedTrackId: matched[0]?.id ?? null,
    });
  }, []);

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

      // Save project to localStorage for persistence
      try {
        const saved = localStorage.getItem('synctune_projects');
        const projList = saved ? JSON.parse(saved) : [];
        const newProj = {
          id: Date.now(),
          name: video.name || 'My SyncTune Project',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          mood: result.classifiedMood || 'Cinematic',
          status: 'Completed',
          duration: '0:15',
          size: `${Math.round((video.size || 0) / 1024 / 1024)} MB`,
          img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=500&auto=format&fit=crop'
        };
        if (!projList.some((p: any) => p.name === newProj.name)) {
          projList.unshift(newProj);
          localStorage.setItem('synctune_projects', JSON.stringify(projList));
        }
      } catch (e) {
        console.error('Failed to save project:', e);
      }

      setState(s => ({
        ...s, isAnalyzing: false, analysisResult: result,
        matchedTracks: matched, selectedLocalTracks: selected,
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
    <AppCtx.Provider value={{ ...state, setVideo, setVideoDuration, setPrompt, runAnalysis, selectTrack, resetAll, loadProject }}>
      {children}
    </AppCtx.Provider>
  );
}
