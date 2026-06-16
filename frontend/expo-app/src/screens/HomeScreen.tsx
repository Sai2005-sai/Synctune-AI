import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import VideoPickerCard from '../components/VideoPickerCard';
import VideoPlayer from '../components/VideoPlayer';
import AnalyzeButton from '../components/AnalyzeButton';
import BGMTrackCard from '../components/BGMTrackCard';
import MoodBadge from '../components/MoodBadge';
import WaveformVisualizer from '../components/WaveformVisualizer';
import AnalysisMetricsCard from '../components/AnalysisMetricsCard';
import SelectedTracksCard from '../components/SelectedTracksCard';
import { analyzeFrames } from '../engine/frameAnalyzer';
import { classify } from '../engine/classifier';
import { buildAnalysisResult, analyzeVideoFallback, VideoAnalysisResult, VideoMetadata } from '../engine/videoAnalyzer';
import { matchBGM, MatchedTrack } from '../engine/bgmMatcher';
import { selectTracks } from '../engine/trackSelector';
import { loadTracksMetadata, loadTrackMetadata, LoadedTrack } from '../engine/musicLoader';
import { computeSegments } from '../engine/videoSegmenter';
import { assignTracksToSegments, resetVariationHistory, SegmentAssignment } from '../engine/audioVariationEngine';
import SegmentTimelineCard from '../components/SegmentTimelineCard';
import SyncedPreviewPlayer from '../components/SyncedPreviewPlayer';
import ExportPanel from '../components/ExportPanel';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AppState = 'idle' | 'video_selected' | 'prompt_input' | 'analyzing' | 'mood_analysis' | 'music_preview' | 'results';

interface SelectedVideo {
  uri: string;
  name: string;
  size?: number;
  duration?: number;
  width?: number;
  height?: number;
}

// ── Analysis step messages that appear sequentially ──────────────────────────
const ANALYSIS_STEPS = [
  { text: 'Extracting video frames…',            delay: 0    },
  { text: 'Computing per-frame luminance…',       delay: 1200 },
  { text: 'Measuring motion intensity…',          delay: 2400 },
  { text: 'Detecting scene cuts…',                delay: 3500 },
  { text: 'Classifying mood & energy level…',     delay: 4600 },
  { text: 'Loading local music library…',         delay: 5600 },
  { text: 'Selecting & matching tracks…',         delay: 6400 },
];

interface Props {
  onSignOut?: () => void;
}

export default function HomeScreen({ onSignOut }: Props) {
  const [appState, setAppState]                 = useState<AppState>('idle');
  const [selectedVideo, setSelectedVideo]       = useState<SelectedVideo | null>(null);
  const [userPrompt, setUserPrompt]             = useState('');
  const [analysisResult, setAnalysisResult]     = useState<VideoAnalysisResult | null>(null);
  const [matchedTracks, setMatchedTracks]       = useState<MatchedTrack[]>([]);
  const [selectedLocalTracks, setSelectedLocalTracks] = useState<LoadedTrack[]>([]);
  const [segmentAssignments, setSegmentAssignments]   = useState<SegmentAssignment[]>([]);
  const [showSyncPreview, setShowSyncPreview]         = useState(false);
  const [showExportPanel,  setShowExportPanel]         = useState(false);
  const [analysisError, setAnalysisError]       = useState<string | null>(null);

  // Animations
  const headerAnim  = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const resultsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    // contentAnim drives: video_selected, prompt_input, analyzing pages
    if (appState === 'video_selected' || appState === 'prompt_input' || appState === 'analyzing') {
      Animated.spring(contentAnim, { toValue: 1, friction: 8, tension: 60, useNativeDriver: true }).start();
    }
    // resultsAnim drives: mood_analysis, music_preview pages
    if (appState === 'mood_analysis' || appState === 'music_preview') {
      Animated.timing(resultsAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
    // Reset animations when returning to earlier steps
    if (appState === 'idle') {
      contentAnim.setValue(0);
      resultsAnim.setValue(0);
    }
  }, [appState]);

  // ── Video picker ─────────────────────────────────────────────────────────
  const pickVideo = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.granted) {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['videos'],
          allowsEditing: false,
          quality: 1,
        });
        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          resetForNewVideo({
            uri: asset.uri,
            name: asset.fileName ?? asset.uri.split('/').pop() ?? 'video.mp4',
            size: asset.fileSize,
            duration: asset.duration ? asset.duration / 1000 : undefined,
            width: asset.width,
            height: asset.height,
          });
          return;
        }
      }

      // Fallback: DocumentPicker
      const docResult = await DocumentPicker.getDocumentAsync({ type: 'video/*', copyToCacheDirectory: true });
      if (!docResult.canceled && docResult.assets[0]) {
        const asset = docResult.assets[0];
        resetForNewVideo({ uri: asset.uri, name: asset.name, size: asset.size });
      }
    } catch (err) {
      console.warn('Video pick error:', err);
    }
  }, []);

  const resetForNewVideo = (video: SelectedVideo) => {
    contentAnim.setValue(0);
    resultsAnim.setValue(0);
    setSelectedVideo(video);
    setUserPrompt('');
    setAnalysisResult(null);
    setMatchedTracks([]);
    setSelectedLocalTracks([]);
    setSegmentAssignments([]);
    setAnalysisError(null);
    resetVariationHistory();
    setAppState('video_selected');
  };

  // Move to prompt page after video selected
  const handleContinueToPrompt = () => setAppState('prompt_input');

  // ── Manual BGM Selection Override ────────────────────────────────────────
  const handleSelectBGM = async (track: MatchedTrack) => {
    try {
      const loaded = await loadTrackMetadata(track);
      setSelectedLocalTracks([loaded]);

      const dur = selectedVideo?.duration ?? 60;
      const singleSegment = {
        index: 0,
        startTime: 0,
        endTime: dur,
        duration: dur,
        motionScore: 0.5,
        label: 'Selected BGM',
        color: '#6366F1'
      };

      const assignment: SegmentAssignment = {
        segment: singleSegment,
        track: loaded,
        audioStartTime: 0,
        audioEndTime: Math.min(loaded.duration, dur),
        variationIndex: 1,
        offsetLabel: '▶ from 0:00',
      };

      setSegmentAssignments([assignment]);
      
      // Restart preview block to quickly sync the new timeline
      setShowSyncPreview(false);
      setTimeout(() => setShowSyncPreview(true), 50);

    } catch (err) {
      console.warn('Failed to apply selected BGM:', err);
    }
  };

  // ── Real frame analysis ──────────────────────────────────────────────────
  const handleAnalyze = useCallback(async () => {
    if (!selectedVideo) return;
    setAppState('analyzing');
    setAnalysisError(null);

    try {
      let durationSec = selectedVideo.duration ?? 60;

      // ① Real frame-level computation (Canvas on web, thumbnail entropy on native)
      const frameData = await analyzeFrames(selectedVideo.uri, durationSec);

      // Override guessed duration if analyzer extracted the true media duration
      if (frameData.trueDurationSeconds && frameData.trueDurationSeconds > 0) {
        durationSec = frameData.trueDurationSeconds;
        setSelectedVideo(prev => prev ? { ...prev, duration: durationSec } : null);
      }

      // ② Classify based on brightness, motion intensity, scene cuts
      const classification = classify(
        frameData.brightness,
        frameData.motionIntensity,
        frameData.sceneCuts,
        frameData.frameCount,
      );

      // ③ Build the full result (combines frame metrics + metadata heuristics)
      const meta: VideoMetadata = {
        uri: selectedVideo.uri,
        name: selectedVideo.name,
        size: selectedVideo.size,
        duration: durationSec,
        width: selectedVideo.width,
        height: selectedVideo.height,
      };
      const analysis = buildAnalysisResult(meta, frameData, classification);

      // ④ Determine which tracks to use for primary audio generation.
      //    If the user gave a prompt → use the top prompt-matched tracks (strict adherence).
      //    Otherwise → fall back to the visual-AI-driven selectTracks().
      const allMatched = matchBGM(analysis, userPrompt, 8);
      const pickedTracks = (userPrompt && userPrompt.trim().length > 0)
        ? allMatched.slice(0, 3)          // top 3 prompt-matched tracks drive the audio
        : selectTracks(classification.mood, classification.energy);

      const loadedTracks  = await loadTracksMetadata(pickedTracks);

      // ⑤ Compute video segments from scene-cut data + assign audio variations
      const segments      = computeSegments(durationSec, frameData);
      const assignments   = assignTracksToSegments(segments, loadedTracks, durationSec);

      // ⑥ matchBGM already computed above — reuse for the recommended BGM list
      const tracks = allMatched;

      setAnalysisResult(analysis);
      setSelectedLocalTracks(loadedTracks);
      setSegmentAssignments(assignments);
      setMatchedTracks(tracks);
      resultsAnim.setValue(0);
      setAppState('mood_analysis');
    } catch (err: any) {
      console.warn('Analysis error:', err);
      // Graceful fallback — metadata-only heuristic
      const meta: VideoMetadata = {
        uri: selectedVideo.uri,
        name: selectedVideo.name,
        size: selectedVideo.size,
        duration: selectedVideo.duration,
        width: selectedVideo.width,
        height: selectedVideo.height,
      };
      const fallback = analyzeVideoFallback(meta);
      // Still load local tracks with fallback mood
      try {
        const fallbackPicked = selectTracks(fallback.classifiedMood, fallback.energyLevel);
        const fallbackLoaded = await loadTracksMetadata(fallbackPicked);
        setSelectedLocalTracks(fallbackLoaded);
      } catch { /* ignore */ }
      const tracks = matchBGM(fallback, userPrompt, 8);
      setAnalysisResult(fallback);
      setMatchedTracks(tracks);
      setAnalysisError('Frame analysis failed — using metadata fallback.');
      resultsAnim.setValue(0);
      setAppState('mood_analysis');
    }
  }, [selectedVideo, userPrompt]);

  const handleReset = () => {
    setAppState('idle');
    setSelectedVideo(null);
    setAnalysisResult(null);
    setMatchedTracks([]);
    setSelectedLocalTracks([]);
    setSegmentAssignments([]);
    setAnalysisError(null);
    resetVariationHistory();
    contentAnim.setValue(0);
    resultsAnim.setValue(0);
  };

  const handleBack = () => {
    if (appState === 'music_preview') {
      resultsAnim.setValue(0);
      setAppState('mood_analysis');
    } else if (appState === 'mood_analysis') {
      resultsAnim.setValue(0);
      setAppState('prompt_input');
    } else if (appState === 'prompt_input') {
      contentAnim.setValue(0);
      setAppState('video_selected');
    } else if (appState === 'video_selected' || appState === 'analyzing') {
      handleReset();
    }
  };

  // ── Energy level badge helper ────────────────────────────────────────────
  const EnergyBadge = ({ level }: { level: 'low' | 'medium' | 'high' }) => {
    const cfg = {
      low:    { color: Colors.moodPeaceful, label: 'Low Energy',    bg: 'rgba(16,185,129,0.15)', icon: 'moon-outline' },
      medium: { color: '#F59E0B',              label: 'Medium Energy',  bg: 'rgba(245,158,11,0.15)', icon: 'sunny-outline' },
      high:   { color: Colors.moodEnergetic, label: 'High Energy',    bg: 'rgba(245,158,11,0.15)', icon: 'flash-outline' },
    }[level];
    return (
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:12,paddingVertical:6,borderRadius:20,borderWidth:1,borderColor:cfg.color,backgroundColor:cfg.bg}}>
        <Ionicons name={cfg.icon as any} size={14} color={cfg.color} style={{ marginRight: 5 }} />
        <Text style={{fontSize:13,fontWeight:'600',color:cfg.color}}>{cfg.label}</Text>
      </View>
    );
  };


  /* ─── MP style helpers ─────────────────────────────────────── */
  const BG   = '#0A0A1A';
  const SURF = '#12122A';
  const GRAD = ['#8B5CF6','#3B82F6','#06B6D4'] as const;
  const GCOL = 'rgba(255,255,255,0.05)';
  const GBRD = 'rgba(255,255,255,0.10)';
  const TSEC = '#8B8BA7';

  const GBtn = ({label,onPress,disabled}:{label:string;onPress:()=>void;disabled?:boolean}) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85}
      style={{borderRadius:50,overflow:'hidden',opacity:disabled?0.5:1,marginTop:12}}>
      <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}}
        style={{paddingVertical:16,alignItems:'center'}}>
        <Text style={{color:'#fff',fontSize:16,fontWeight:'700'}}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const OBtn = ({label,onPress}:{label:string;onPress:()=>void}) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}
      style={{borderRadius:50,borderWidth:1,borderColor:GBRD,backgroundColor:GCOL,paddingVertical:14,alignItems:'center',marginTop:10}}>
      <Text style={{color:'#fff',fontSize:15,fontWeight:'600'}}>{label}</Text>
    </TouchableOpacity>
  );

  const GCard = ({children,style}:{children:React.ReactNode;style?:any}) => (
    <View style={[{backgroundColor:GCOL,borderWidth:1,borderColor:GBRD,borderRadius:16,padding:16},style]}>
      {children}
    </View>
  );

  const BackBtn = () => (
    <TouchableOpacity onPress={handleBack}
      style={{width:40,height:40,borderRadius:20,backgroundColor:GCOL,borderWidth:1,borderColor:GBRD,alignItems:'center',justifyContent:'center'}}>
      <Ionicons name="arrow-back" size={20} color="#fff"/>
    </TouchableOpacity>
  );

  const Steps = ({n}:{n:number}) => (
    <View style={{flexDirection:'row',justifyContent:'center',gap:6,paddingVertical:12}}>
      {[1,2,3,4,5].map(i=>(
        <View key={i} style={{height:6,borderRadius:3,
          width: i===n?32:16,
          backgroundColor: i===n?'#8B5CF6': i<n?'rgba(139,92,246,0.5)':'rgba(255,255,255,0.1)'}}/>
      ))}
    </View>
  );

  const EBadge = ({level}:{level:'low'|'medium'|'high'}) => {
    const c={low:{col:'#10B981',lbl:'Low Energy'},medium:{col:'#F59E0B',lbl:'Medium Energy'},high:{col:'#EF4444',lbl:'High Energy'}}[level];
    return(
      <View style={{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:GCOL,borderWidth:1,borderColor:GBRD,paddingHorizontal:12,paddingVertical:6,borderRadius:20}}>
        <Ionicons name={level==='low'?'moon-outline':level==='medium'?'sunny-outline':'flash-outline'} size={13} color={c.col}/>
        <Text style={{fontSize:12,fontWeight:'600',color:'#fff'}}>{c.lbl}</Text>
      </View>
    );
  };

  const MChip = ({mood}:{mood:string}) => {
    const m:Record<string,[string,string]>={
      happy:['rgba(245,158,11,0.2)','#F59E0B'],sad:['rgba(59,130,246,0.2)','#3B82F6'],
      energetic:['rgba(249,115,22,0.2)','#F97316'],calm:['rgba(16,185,129,0.2)','#10B981'],
      cinematic:['rgba(139,92,246,0.2)','#8B5CF6'],
    };
    const [bg,col]=m[mood.toLowerCase()]??['rgba(255,255,255,0.1)','#fff'];
    return(
      <View style={{borderRadius:20,borderWidth:1,borderColor:col+'44',backgroundColor:bg,paddingHorizontal:12,paddingVertical:4}}>
        <Text style={{fontSize:12,fontWeight:'600',color:col}}>{mood}</Text>
      </View>
    );
  };

  return (
    <View style={{flex:1,backgroundColor:BG}}>
      <StatusBar barStyle="light-content" backgroundColor={BG}/>
      <SafeAreaView style={{flex:1}}>

        {/* ── Header ── */}
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,paddingVertical:14,borderBottomWidth:1,borderBottomColor:GBRD}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
            {appState!=='idle' && <BackBtn/>}
            <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}}
              style={{width:36,height:36,borderRadius:10,alignItems:'center',justifyContent:'center'}}>
              <Ionicons name="musical-notes" size={18} color="#fff"/>
            </LinearGradient>
            <View>
              <Text style={{color:'#fff',fontSize:17,fontWeight:'800'}}>
                SyncTune <Text style={{color:'#8B5CF6'}}>AI</Text>
              </Text>
              <Text style={{color:TSEC,fontSize:11}}>AI Video BGM Matcher</Text>
            </View>
          </View>
          {appState!=='idle' && (
            <TouchableOpacity onPress={handleReset}
              style={{width:36,height:36,borderRadius:10,backgroundColor:GCOL,borderWidth:1,borderColor:GBRD,alignItems:'center',justifyContent:'center'}}>
              <Ionicons name="refresh" size={17} color={TSEC}/>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}
          contentContainerStyle={{padding:20,paddingBottom:110,gap:16}}>

          {/* ══ PAGE 1: IDLE — Home Dashboard ══ */}
          {appState==='idle' && (
            <Animated.View style={{opacity:headerAnim}}>
              {/* Hero banner */}
              <TouchableOpacity onPress={pickVideo} activeOpacity={0.9}
                style={{borderRadius:24,overflow:'hidden',marginBottom:20,height:160}}>
                <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={{flex:1,alignItems:'center',justifyContent:'center',gap:8}}>
                  <View style={{width:56,height:56,borderRadius:28,backgroundColor:'rgba(255,255,255,0.2)',alignItems:'center',justifyContent:'center'}}>
                    <Ionicons name="add" size={28} color="#fff"/>
                  </View>
                  <Text style={{color:'#fff',fontSize:18,fontWeight:'800'}}>Create New Project</Text>
                  <Text style={{color:'rgba(255,255,255,0.8)',fontSize:13}}>Tap to upload your video</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* How it works */}
              <Text style={{color:TSEC,fontSize:11,fontWeight:'700',letterSpacing:1.5,marginBottom:12}}>HOW IT WORKS</Text>
              <GCard>
                {[
                  {icon:'folder-open-outline',s:'1',t:'Upload Video',d:'Select any video from your device'},
                  {icon:'analytics-outline',s:'2',t:'AI Analysis',d:'Real frame-level brightness, motion & cuts'},
                  {icon:'musical-notes-outline',s:'3',t:'BGM Match',d:'Top tracks ranked by mood & energy'},
                  {icon:'download-outline',s:'4',t:'Export',d:'Download your video with background music'},
                ].map((item,i)=>(
                  <View key={i} style={{flexDirection:'row',alignItems:'center',gap:12,marginBottom:i<3?12:0}}>
                    <View style={{width:24,height:24,borderRadius:12,backgroundColor:'rgba(139,92,246,0.2)',borderWidth:1,borderColor:'rgba(139,92,246,0.5)',alignItems:'center',justifyContent:'center'}}>
                      <Text style={{color:'#8B5CF6',fontSize:11,fontWeight:'700'}}>{item.s}</Text>
                    </View>
                    <Ionicons name={item.icon as any} size={22} color="#8B5CF6"/>
                    <View style={{flex:1}}>
                      <Text style={{color:'#fff',fontSize:14,fontWeight:'600'}}>{item.t}</Text>
                      <Text style={{color:TSEC,fontSize:12}}>{item.d}</Text>
                    </View>
                  </View>
                ))}
              </GCard>

              <VideoPickerCard onPickVideo={pickVideo} hasVideo={false}/>
            </Animated.View>
          )}

          {/* ══ PAGE 2: VIDEO SELECTED ══ */}
          {appState==='video_selected' && selectedVideo && (
            <Animated.View style={{opacity:contentAnim,gap:16}}>
              <Steps n={1}/>
              <VideoPlayer uri={selectedVideo.uri} name={selectedVideo.name} fileSize={selectedVideo.size}
                onDurationLoaded={dur=>setSelectedVideo(prev=>prev&&Math.abs((prev.duration||0)-dur)>0.1?{...prev,duration:dur}:prev)}/>
              <GCard>
                <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:12}}>
                  {selectedVideo.duration&&<View style={{flexDirection:'row',alignItems:'center',gap:4,backgroundColor:'rgba(255,255,255,0.05)',borderRadius:8,paddingHorizontal:8,paddingVertical:4}}>
                    <Ionicons name="time-outline" size={12} color={TSEC}/>
                    <Text style={{color:TSEC,fontSize:11}}>{Math.floor(selectedVideo.duration/60)}m {Math.round(selectedVideo.duration%60)}s</Text>
                  </View>}
                  {selectedVideo.size&&<View style={{flexDirection:'row',alignItems:'center',gap:4,backgroundColor:'rgba(255,255,255,0.05)',borderRadius:8,paddingHorizontal:8,paddingVertical:4}}>
                    <Ionicons name="server-outline" size={12} color={TSEC}/>
                    <Text style={{color:TSEC,fontSize:11}}>{(selectedVideo.size/1048576).toFixed(1)} MB</Text>
                  </View>}
                  <View style={{flexDirection:'row',alignItems:'center',gap:4,backgroundColor:'rgba(16,185,129,0.1)',borderRadius:8,paddingHorizontal:8,paddingVertical:4}}>
                    <Ionicons name="checkmark-circle" size={12} color="#10B981"/>
                    <Text style={{color:'#10B981',fontSize:11}}>Ready</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={pickVideo} style={{flexDirection:'row',alignItems:'center',gap:6,alignSelf:'flex-end'}}>
                  <Ionicons name="swap-horizontal-outline" size={14} color="#06B6D4"/>
                  <Text style={{color:'#06B6D4',fontSize:12,fontWeight:'600'}}>Change Video</Text>
                </TouchableOpacity>
              </GCard>
              <GBtn label="Continue →" onPress={handleContinueToPrompt} disabled={!selectedVideo.duration}/>
              {!selectedVideo.duration&&<Text style={{textAlign:'center',color:TSEC,fontSize:11}}>Loading video metadata…</Text>}
            </Animated.View>
          )}

          {/* ══ PAGE 3: PROMPT INPUT ══ */}
          {appState==='prompt_input' && selectedVideo && (
            <Animated.View style={{opacity:contentAnim,gap:16}}>
              <Steps n={2}/>
              <View style={{alignItems:'center',marginVertical:8}}>
                <View style={{width:80,height:80,borderRadius:20,backgroundColor:SURF,borderWidth:1,borderColor:GBRD,alignItems:'center',justifyContent:'center'}}>
                  <Ionicons name="color-wand-outline" size={36} color="#06B6D4"/>
                </View>
              </View>
              <GCard>
                <Text style={{color:'#fff',fontSize:14,fontWeight:'600',marginBottom:4}}>
                  Describe your music style <Text style={{color:TSEC,fontWeight:'400'}}>(optional)</Text>
                </Text>
                <TextInput
                  value={userPrompt} onChangeText={setUserPrompt} multiline
                  placeholder="e.g. Cinematic orchestral with soft piano…"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  style={{backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderColor:'rgba(255,255,255,0.10)',borderRadius:12,padding:14,color:'#fff',fontSize:14,minHeight:100,marginTop:10,textAlignVertical:'top'}}/>
                <Ionicons name="sparkles" size={16} color="#8B5CF6" style={{position:'absolute',right:24,bottom:28,opacity:0.5}}/>
              </GCard>
              <Text style={{color:TSEC,fontSize:12,fontWeight:'500',marginTop:4}}>Quick Suggestions</Text>
              <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
                {['Upbeat Pop','Lo-fi Chill','Epic Cinematic','Acoustic Warm','Electronic','Dark Ambient'].map(s=>(
                  <TouchableOpacity key={s} onPress={()=>setUserPrompt(s)}
                    style={{paddingHorizontal:14,paddingVertical:6,borderRadius:20,
                      backgroundColor:userPrompt===s?'rgba(139,92,246,0.15)':GCOL,
                      borderWidth:1,borderColor:userPrompt===s?'rgba(139,92,246,0.5)':GBRD}}>
                    <Text style={{fontSize:12,color:userPrompt===s?'#8B5CF6':TSEC,fontWeight:userPrompt===s?'700':'400'}}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <GBtn label="Analyze Video" onPress={handleAnalyze} disabled={!selectedVideo.duration}/>
              <TouchableOpacity onPress={handleAnalyze} style={{alignItems:'center',paddingVertical:8}}>
                <Text style={{color:TSEC,fontSize:14,fontWeight:'500'}}>Skip — Let AI Decide</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* ══ PAGE 4: ANALYZING ══ */}
          {appState==='analyzing' && (
            <Animated.View style={{opacity:contentAnim,alignItems:'center',paddingVertical:40,gap:32}}>
              <View style={{position:'relative',width:140,height:140,alignItems:'center',justifyContent:'center'}}>
                <View style={{position:'absolute',inset:0,width:140,height:140,borderRadius:70,borderWidth:2,borderColor:'rgba(139,92,246,0.3)'}}/>
                <View style={{position:'absolute',width:110,height:110,borderRadius:55,borderWidth:2,borderColor:'rgba(6,182,212,0.3)'}}/>
                <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}}
                  style={{width:56,height:56,borderRadius:28,alignItems:'center',justifyContent:'center'}}>
                  <View style={{width:40,height:40,borderRadius:20,backgroundColor:'rgba(10,10,26,0.8)',alignItems:'center',justifyContent:'center'}}>
                    <View style={{width:16,height:16,borderRadius:8,backgroundColor:'#06B6D4'}}/>
                  </View>
                </LinearGradient>
              </View>
              <Text style={{fontSize:22,fontWeight:'800',color:'#fff',textAlign:'center'}}>Analyzing your video</Text>
              <Text style={{fontSize:14,color:TSEC,textAlign:'center'}}>AI is processing frames and matching music</Text>
              <GCard style={{width:'100%',gap:10}}>
                {ANALYSIS_STEPS.map((step,i)=>(<AnalysisStep key={i} text={step.text} delay={step.delay}/>))}
              </GCard>
            </Animated.View>
          )}

          {/* ══ PAGE 5: MOOD ANALYSIS ══ */}
          {appState==='mood_analysis' && analysisResult && selectedVideo && (
            <Animated.View style={{opacity:resultsAnim,gap:16}}>
              <Steps n={3}/>
              {analysisError&&(
                <View style={{flexDirection:'row',gap:8,backgroundColor:'rgba(245,158,11,0.1)',borderWidth:1,borderColor:'rgba(245,158,11,0.3)',borderRadius:12,padding:12}}>
                  <Ionicons name="warning-outline" size={14} color="#F59E0B"/>
                  <Text style={{color:'#F59E0B',fontSize:12,flex:1}}>{analysisError}</Text>
                </View>
              )}
              {/* Mood hero */}
              <View style={{alignItems:'center',marginVertical:8}}>
                <Text style={{color:TSEC,fontSize:13,marginBottom:12}}>AI detected the primary mood as</Text>
                <GCard style={{alignItems:'center',gap:8,paddingVertical:20}}>
                  <Text style={{fontSize:36}}>{analysisResult.sceneIcon}</Text>
                  <Text style={{color:'#fff',fontSize:28,fontWeight:'800'}}>{analysisResult.classifiedMood}</Text>
                  <View style={{flexDirection:'row',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
                    <MChip mood={analysisResult.classifiedMood}/>
                    <EBadge level={analysisResult.energyLevel}/>
                  </View>
                </GCard>
              </View>
              {/* Stats grid */}
              <View style={{flexDirection:'row',gap:10}}>
                {[
                  {v:`${(analysisResult.frameMetrics.brightness*100).toFixed(0)}%`,l:'Brightness',ic:'bulb-outline'},
                  {v:`${(analysisResult.frameMetrics.motionIntensity*100).toFixed(0)}%`,l:'Motion',ic:'walk-outline'},
                  {v:`${analysisResult.frameMetrics.sceneCuts}`,l:'Cuts',ic:'cut-outline'},
                  {v:`${analysisResult.confidence}%`,l:'Confidence',ic:'analytics-outline'},
                ].map(s=>(
                  <GCard key={s.l} style={{flex:1,alignItems:'center',padding:12,gap:4}}>
                    <Ionicons name={s.ic as any} size={18} color="#8B5CF6"/>
                    <Text style={{color:'#fff',fontSize:14,fontWeight:'700'}}>{s.v}</Text>
                    <Text style={{color:TSEC,fontSize:10,textAlign:'center'}}>{s.l}</Text>
                  </GCard>
                ))}
              </View>
              {/* AI insight */}
              <GCard style={{flexDirection:'row',gap:12,backgroundColor:'rgba(139,92,246,0.05)',borderColor:'rgba(139,92,246,0.2)'}}>
                <Ionicons name="sparkles" size={18} color="#8B5CF6" style={{marginTop:2}}/>
                <Text style={{color:'rgba(255,255,255,0.9)',fontSize:13,lineHeight:20,flex:1}}>{analysisResult.analysisReasoning}</Text>
              </GCard>
              {/* Metrics */}
              <AnalysisMetricsCard frameMetrics={analysisResult.frameMetrics} classifiedMood={analysisResult.classifiedMood} energyLevel={analysisResult.energyLevel} reasoning={analysisResult.analysisReasoning}/>
              {/* Recommended BGM */}
              {selectedLocalTracks.length>0&&(
                <>
                  <Text style={{color:TSEC,fontSize:11,fontWeight:'700',letterSpacing:1.5}}>AI RECOMMENDED BGM</Text>
                  <SelectedTracksCard tracks={selectedLocalTracks} onApply={t=>console.log('Applied:',t.title)}/>
                </>
              )}
              <GBtn label="🎵  Preview with Music" onPress={()=>{resultsAnim.setValue(0);setAppState('music_preview');}}/>
            </Animated.View>
          )}

          {/* ══ PAGE 6: MUSIC PREVIEW + EXPORT ══ */}
          {appState==='music_preview' && analysisResult && selectedVideo?.duration && (
            <Animated.View style={{opacity:resultsAnim,gap:16}}>
              <Steps n={4}/>
              {/* Variation plan */}
              {segmentAssignments.length>0&&(
                <>
                  <Text style={{color:TSEC,fontSize:11,fontWeight:'700',letterSpacing:1.5}}>AUDIO VARIATION PLAN</Text>
                  <SegmentTimelineCard assignments={segmentAssignments} videoDuration={selectedVideo.duration}/>
                </>
              )}
              {/* Synced preview */}
              {segmentAssignments.length>0&&(
                <>
                  <TouchableOpacity onPress={()=>setShowSyncPreview(v=>!v)} activeOpacity={0.85}
                    style={{borderRadius:50,overflow:'hidden',borderWidth:1,borderColor:showSyncPreview?'#8B5CF6':'rgba(255,255,255,0.15)'}}>
                    <LinearGradient
                      colors={showSyncPreview?GRAD:['rgba(255,255,255,0.05)','rgba(255,255,255,0.02)']}
                      start={{x:0,y:0}} end={{x:1,y:0}}
                      style={{paddingVertical:14,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8}}>
                      <Ionicons name={showSyncPreview?'close-circle':'film'} size={18} color={showSyncPreview?'#fff':'#8B5CF6'}/>
                      <Text style={{color:showSyncPreview?'#fff':'#8B5CF6',fontSize:15,fontWeight:'700'}}>
                        {showSyncPreview?'Close Preview':'Preview with Background Music'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  {showSyncPreview&&<SyncedPreviewPlayer videoUri={selectedVideo.uri} videoDuration={selectedVideo.duration} assignments={segmentAssignments}/>}
                </>
              )}
              {/* Alternative tracks */}
              <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
                <Text style={{color:'#fff',fontSize:18,fontWeight:'700',flex:1}}>Best Picks</Text>
                <View style={{backgroundColor:'#8B5CF6',borderRadius:10,paddingHorizontal:8,paddingVertical:2}}>
                  <Text style={{color:'#fff',fontSize:12,fontWeight:'700'}}>{matchedTracks.length}</Text>
                </View>
              </View>
              <Text style={{color:TSEC,fontSize:12}}>Tap ▶ to preview • Tap Apply to switch BGM</Text>
              {matchedTracks.map((t,i)=>(<BGMTrackCard key={t.id} track={t} rank={i+1} onSelect={handleSelectBGM}/>))}
              {/* Export */}
              <Text style={{color:TSEC,fontSize:11,fontWeight:'700',letterSpacing:1.5,marginTop:8}}>EXPORT</Text>
              <TouchableOpacity onPress={()=>setShowExportPanel(v=>!v)} activeOpacity={0.85}
                style={{borderRadius:50,overflow:'hidden',borderWidth:1,borderColor:showExportPanel?'#EF4444':'rgba(255,255,255,0.15)'}}>
                <LinearGradient
                  colors={showExportPanel?['#EF4444','#F97316']:['rgba(255,255,255,0.05)','rgba(255,255,255,0.02)']}
                  start={{x:0,y:0}} end={{x:1,y:0}}
                  style={{paddingVertical:14,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8}}>
                  <Ionicons name={showExportPanel?'close-circle':'download'} size={18} color={showExportPanel?'#fff':'#F97316'}/>
                  <Text style={{color:showExportPanel?'#fff':'#F97316',fontSize:15,fontWeight:'700'}}>
                    {showExportPanel?'Close Export':'Export Video with BGM'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              {showExportPanel&&<ExportPanel videoUri={selectedVideo.uri} videoDuration={selectedVideo.duration} assignments={segmentAssignments} onClose={()=>setShowExportPanel(false)}/>}
              {/* Bottom actions */}
              <View style={{flexDirection:'row',gap:10,marginTop:8}}>
                <OBtn label="Change Video" onPress={pickVideo}/>
                <GBtn label="Re-analyze" onPress={handleAnalyze}/>
              </View>
            </Animated.View>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function AnalysisStep({text,delay}:{text:string;delay:number}){
  const [visible,setVisible]=useState(false);
  const fade=useRef(new Animated.Value(0)).current;
  useEffect(()=>{
    const t=setTimeout(()=>{
      setVisible(true);
      Animated.timing(fade,{toValue:1,duration:400,useNativeDriver:true}).start();
    },delay);
    return ()=>clearTimeout(t);
  },[]);
  if(!visible)return null;
  return(
    <Animated.View style={{opacity:fade,flexDirection:'row',alignItems:'center',gap:10}}>
      <View style={{width:6,height:6,borderRadius:3,backgroundColor:'#8B5CF6'}}/>
      <Text style={{color:'#8B8BA7',fontSize:13}}>{text}</Text>
    </Animated.View>
  );
}
