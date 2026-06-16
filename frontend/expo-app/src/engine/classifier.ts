/**
 * classifier.ts
 *
 * Maps raw frame metrics (brightness, motion, scene cuts) to:
 *   - ClassifiedMood: 'happy' | 'sad' | 'energetic' | 'calm' | 'cinematic'
 *   - EnergyLevel:    'low'   | 'medium' | 'high'
 *
 * Rules:
 *   fast motion            → energetic + high
 *   dark scenes            → sad       + low
 *   bright + slow          → calm      + low
 *   mixed / many cuts      → cinematic + medium
 *   bright + medium motion → happy     + medium
 */

export type ClassifiedMood = 'happy' | 'sad' | 'energetic' | 'calm' | 'cinematic';
export type EnergyLevel = 'low' | 'medium' | 'high';

export interface Classification {
  mood: ClassifiedMood;
  energy: EnergyLevel;
  reasoning: string;
}

// Thresholds — tuned for 0-1 normalised values
const FAST_MOTION = 0.30;   // motion > this → energetic
const SLOW_MOTION = 0.12;   // motion < this → slow
const DARK_SCENE  = 0.35;   // brightness < this → dark
const BRIGHT_SCENE = 0.58;  // brightness > this → bright
const CUT_RATE_HIGH = 0.30; // ≥30% of transitions are cuts → cinematic

/**
 * Classify video content based on measured frame metrics.
 * @param brightness    Mean luminance across sampled frames (0 = black, 1 = white)
 * @param motionIntensity Mean frame-to-frame pixel difference (0 = static, 1 = total change)
 * @param sceneCuts     Count of detected scene cuts
 * @param frameCount    Total number of analysed frames
 */
export function classify(
  brightness: number,
  motionIntensity: number,
  sceneCuts: number,
  frameCount: number,
): Classification {
  const transitions = Math.max(1, frameCount - 1);
  const cutRate = sceneCuts / transitions;

  // ── Rule 1: Fast motion → Energetic + High ───────────────────
  if (motionIntensity >= FAST_MOTION) {
    return {
      mood: 'energetic',
      energy: 'high',
      reasoning: `High motion intensity (${(motionIntensity * 100).toFixed(1)}%) detected across frames`,
    };
  }

  // ── Rule 2: Dark scenes → Sad + Low ──────────────────────────
  if (brightness < DARK_SCENE && motionIntensity < FAST_MOTION) {
    return {
      mood: 'sad',
      energy: 'low',
      reasoning: `Low brightness (${(brightness * 100).toFixed(1)}%) with minimal motion indicates dark, subdued content`,
    };
  }

  // ── Rule 3: Bright + Slow → Calm + Low ──────────────────────
  if (brightness >= BRIGHT_SCENE && motionIntensity < SLOW_MOTION) {
    return {
      mood: 'calm',
      energy: 'low',
      reasoning: `Bright (${(brightness * 100).toFixed(1)}%) and slow-moving content suggests a peaceful atmosphere`,
    };
  }

  // ── Rule 4: Mixed / many scene cuts → Cinematic + Medium ────
  if (cutRate >= CUT_RATE_HIGH || (motionIntensity >= SLOW_MOTION && motionIntensity < FAST_MOTION && sceneCuts >= 2)) {
    return {
      mood: 'cinematic',
      energy: 'medium',
      reasoning: `${sceneCuts} scene cut(s) detected — dynamic, mixed pacing suggests cinematic style`,
    };
  }

  // ── Rule 5: Bright + medium motion → Happy + Medium ─────────
  if (brightness >= BRIGHT_SCENE) {
    return {
      mood: 'happy',
      energy: 'medium',
      reasoning: `Well-lit (${(brightness * 100).toFixed(1)}%) with moderate activity — upbeat, cheerful tone`,
    };
  }

  // ── Fallback: calm, low energy ───────────────────────────────
  return {
    mood: 'calm',
    energy: 'low',
    reasoning: 'Steady luminance and low motion indicate a calm, gentle mood',
  };
}

/** Map the new ClassifiedMood to the legacy BGM-database Mood for track matching */
export function toBGMMood(
  classified: ClassifiedMood,
): 'energetic' | 'cinematic' | 'peaceful' | 'romantic' | 'dark' | 'corporate' | 'vlog' | 'nature' {
  const MAP = {
    happy:     'vlog',
    sad:       'dark',
    energetic: 'energetic',
    calm:      'peaceful',
    cinematic: 'cinematic',
  } as const;
  return MAP[classified];
}

/** Energy level as a 0-100 numeric value (for backward compat with BGM matcher) */
export function energyToNumeric(level: EnergyLevel): number {
  const MAP: Record<EnergyLevel, number> = { low: 20, medium: 55, high: 88 };
  return MAP[level];
}
