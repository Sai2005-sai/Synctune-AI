/**
 * trackSelector.ts
 *
 * Smart BGM track selection engine.
 *
 * Given the detected mood and energy level, selects 2–3 tracks from the
 * local music library with the following guarantees:
 *   • Only tracks matching the detected mood are considered
 *   • Tracks are shuffled (Fisher–Yates) for random variation
 *   • A persistent session history prevents the same track repeating
 *     across consecutive analysis runs
 *   • If all tracks for a mood have been recently played, history resets
 *   • Energy level controls how many tracks are selected (2 or 3)
 */

import { MUSIC_LIBRARY, LocalTrack } from '../data/musicLibrary';
import type { ClassifiedMood, EnergyLevel } from './classifier';

// ── Session-level play history (module singleton) ─────────────────────────────
const playHistory = new Set<string>();

/** Fisher–Yates in-place shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Number of tracks to select based on energy level:
 *   low    → 2 (gentle, small set)
 *   medium → 2–3 (random each call)
 *   high   → 3 (full energetic set)
 */
function countForEnergy(energy: EnergyLevel): number {
  if (energy === 'low')    return 2;
  if (energy === 'high')   return 3;
  // medium: randomly 2 or 3
  return Math.random() < 0.5 ? 2 : 3;
}

/**
 * Select tracks from the local library for the given mood + energy.
 *
 * @param mood   Detected ClassifiedMood
 * @param energy Detected EnergyLevel
 * @returns      2–3 LocalTrack objects (from real assets, no repeats across runs)
 */
export function selectTracks(
  mood: ClassifiedMood,
  energy: EnergyLevel,
): LocalTrack[] {
  const allForMood = MUSIC_LIBRARY[mood] ?? [];

  if (allForMood.length === 0) {
    console.warn(`[trackSelector] No tracks for mood "${mood}"`);
    return [];
  }

  const wantCount = Math.min(countForEnergy(energy), allForMood.length);

  // Filter out recently played
  let available = allForMood.filter((t) => !playHistory.has(t.id));

  // If not enough un-played tracks remain, reset history and use full set
  if (available.length < wantCount) {
    available.forEach((t) => playHistory.delete(t.id));
    allForMood.forEach((t) => playHistory.delete(t.id)); // clear all for this mood
    available = [...allForMood];
  }

  // Shuffle and pick
  const selected = shuffle(available).slice(0, wantCount);

  // Record in history
  selected.forEach((t) => playHistory.add(t.id));

  return selected;
}

/** Clear the play history (useful for testing or after app restart) */
export function clearPlayHistory(): void {
  playHistory.clear();
}

/** Expose current history size for diagnostics */
export function playHistorySize(): number {
  return playHistory.size;
}
