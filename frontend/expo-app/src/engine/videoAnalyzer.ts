import type { Mood } from '../data/bgmDatabase';
import type { ClassifiedMood, EnergyLevel, Classification } from './classifier';
import type { FrameAnalysisResult } from './frameAnalyzer';

export type { ClassifiedMood, EnergyLevel };

export interface VideoMetadata {
  uri: string;
  name: string;
  size?: number;       // bytes
  duration?: number;   // seconds
  width?: number;
  height?: number;
  mimeType?: string;
}

export interface VideoAnalysisResult {
  // ── Frame-derived (real computation) ──────────────────────
  classifiedMood: ClassifiedMood;
  energyLevel: EnergyLevel;
  analysisReasoning: string;
  frameMetrics: FrameAnalysisResult;

  // ── BGM-matching mood (maps classifiedMood → legacy Mood) ─
  primaryMood: Mood;
  secondaryMood: Mood | null;

  // ── Metadata / heuristic enrichment ───────────────────────
  tempo: 'slow' | 'medium' | 'fast';
  energy: number;       // 0–100 numeric for BGM matcher
  scene: string;
  sceneIcon: string;
  confidence: number;   // 0–100
  detectedTraits: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────

function tempoFromMotion(motion: number): 'slow' | 'medium' | 'fast' {
  if (motion >= 0.30) return 'fast';
  if (motion >= 0.12) return 'medium';
  return 'slow';
}

/** Derive aspect ratio label from video dimensions */
export function aspectLabel(w: number, h: number): string {
  const ratio = w / h;
  if (ratio > 1.7) return 'widescreen';
  if (ratio < 0.8) return 'portrait';
  return 'square';
}

/**
 * Build the final VideoAnalysisResult from real frame metrics + metadata.
 * This is the single source of truth called by HomeScreen after frame analysis.
 */
export function buildAnalysisResult(
  meta: VideoMetadata,
  frameData: FrameAnalysisResult,
  classification: Classification,
): VideoAnalysisResult {
  const { mood: classifiedMood, energy: energyLevel, reasoning } = classification;

  // ── Map to BGM-database mood ─────────────────────────────────
  const MOOD_MAP: Record<ClassifiedMood, Mood> = {
    happy:     'vlog',
    sad:       'dark',
    energetic: 'energetic',
    calm:      'peaceful',
    cinematic: 'cinematic',
  };
  const primaryMood = MOOD_MAP[classifiedMood];

  // Secondary mood enrichment from classifier
  const SECONDARY_MAP: Partial<Record<ClassifiedMood, Mood>> = {
    cinematic: 'romantic',
    energetic: 'dark',
    happy:     'romantic',
    sad:       'peaceful',
  };
  const secondaryMood = SECONDARY_MAP[classifiedMood] ?? null;

  // ── Numeric energy (0-100) for BGM matcher ───────────────────
  const ENERGY_NUMERIC: Record<EnergyLevel, number> = {
    low: 20, medium: 55, high: 88,
  };
  const energy = ENERGY_NUMERIC[energyLevel];

  // ── Tempo from motion ────────────────────────────────────────
  const tempo = tempoFromMotion(frameData.motionIntensity);

  // ── Scene label & icon from classified mood ──────────────────
  const SCENE_INFO: Record<ClassifiedMood, { scene: string; sceneIcon: string }> = {
    happy:     { scene: 'Happy / Upbeat',     sceneIcon: '😊' },
    sad:       { scene: 'Dark / Emotional',   sceneIcon: '🌑' },
    energetic: { scene: 'Action / Dynamic',   sceneIcon: '⚡' },
    calm:      { scene: 'Calm / Peaceful',    sceneIcon: '🌿' },
    cinematic: { scene: 'Cinematic / Mixed',  sceneIcon: '🎬' },
  };
  const { scene, sceneIcon } = SCENE_INFO[classifiedMood];

  // ── Confidence — based on quality of frame data ──────────────
  const methodBonus = frameData.analysisMethod === 'canvas' ? 10 : 0;
  const frameBonus = Math.min(10, frameData.frameCount);
  const confidence = Math.min(95, 65 + methodBonus + frameBonus);

  // ── Detected traits ──────────────────────────────────────────
  const traits: string[] = [
    `${frameData.frameCount} frames analysed (${frameData.analysisMethod})`,
    `Brightness: ${(frameData.brightness * 100).toFixed(0)}%`,
    `Motion intensity: ${(frameData.motionIntensity * 100).toFixed(0)}%`,
    `Scene cuts detected: ${frameData.sceneCuts}`,
  ];

  const width = meta.width ?? 1920;
  const height = meta.height ?? 1080;
  const ar = aspectLabel(width, height);
  if (ar === 'portrait') traits.push('Vertical / Short video');
  if (width >= 3840) traits.push('4K resolution');
  if (meta.duration && meta.duration < 30) traits.push('Short clip');
  if (meta.duration && meta.duration > 300) traits.push('Long-form video');

  return {
    classifiedMood,
    energyLevel,
    analysisReasoning: reasoning,
    frameMetrics: frameData,
    primaryMood,
    secondaryMood,
    tempo,
    energy,
    scene,
    sceneIcon,
    confidence,
    detectedTraits: traits,
  };
}

/**
 * Legacy sync heuristic-only analysis (kept for edge-case fallback).
 * Prefers frame-based analysis; use buildAnalysisResult() in production.
 */
export function analyzeVideoFallback(meta: VideoMetadata): VideoAnalysisResult {
  const duration = meta.duration ?? 60;
  const traits: string[] = ['Fallback: metadata-only analysis'];
  if (duration < 30) traits.push('Short clip');
  if (duration > 300) traits.push('Long-form video');

  return {
    classifiedMood: 'calm',
    energyLevel: 'medium',
    analysisReasoning: 'Metadata-only fallback (frame analysis unavailable)',
    frameMetrics: {
      brightness: 0.5,
      motionIntensity: 0.25,
      sceneCuts: 0,
      frameCount: 0,
      analysisMethod: 'canvas',
      rawBrightnessValues: [],
      rawMotionValues: [],
    },
    primaryMood: 'peaceful',
    secondaryMood: null,
    tempo: 'medium',
    energy: 50,
    scene: 'General Video',
    sceneIcon: '🎬',
    confidence: 40,
    detectedTraits: traits,
  };
}
