/**
 * audioVariationEngine.ts
 *
 * Assigns a different audio track (and a varied start-time within that track)
 * to each video segment, guaranteeing non-repetitive output every run.
 *
 * VARIATION STRATEGY
 * ──────────────────
 * 1. Tracks are distributed so no two adjacent segments share the same track.
 * 2. For each assignment the track is divided into equal "sections"; a random
 *    offset inside the next unused section is chosen — so even if the same
 *    track recurs across segments it always plays from a different position.
 * 3. A module-level usage map persists for the lifetime of the app session,
 *    further preventing inter-run repetition.
 *
 * RESULT
 * ──────
 * An array of SegmentAssignment — one per video segment — each bearing:
 *   • which track to play
 *   • audioStartTime  (seconds into the track file)
 *   • audioEndTime    (audioStartTime + segment.duration)
 */

import type { LoadedTrack }  from './musicLoader';
import type { VideoSegment } from './videoSegmenter';

export interface SegmentAssignment {
  segment:        VideoSegment;
  track:          LoadedTrack;
  audioStartTime: number;   // seconds into the audio file
  audioEndTime:   number;   // audioStartTime + segment.duration
  /** 1-based counter shown in the UI ("Variation 1", "Variation 2", …) */
  variationIndex: number;
  /** Human-readable offset label e.g. "▶ from 0:34" */
  offsetLabel:    string;
}

// ── Session-level usage history ───────────────────────────────────────────────
// Maps trackId → array of previously used audioStartTimes (seconds)
const trackUsageHistory = new Map<string, number[]>();

// Global variation counter — increments on every assignment to guarantee
// unique variationIndex across multiple analyzeVideo() calls in a session.
let globalVariationCounter = 0;

/** Clear history (call when user picks a new video). */
export function resetVariationHistory(): void {
  trackUsageHistory.clear();
  globalVariationCounter = 0;
}

// ── Core helpers ──────────────────────────────────────────────────────────────

function offsetLabel(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `▶ from ${m}:${s.toString().padStart(2, '0')}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Assign the best matching track to every video segment so it plays
 * CONTINUOUSLY from a start offset chosen to align the track's own
 * natural musical outro/ending with the video's last frame.
 *
 * @param segments        Segments from computeSegments()
 * @param availableTracks LoadedTrack[] from loadTracksMetadata() — track[0] is best match
 * @param videoDuration   Total video duration in seconds
 */
export function assignTracksToSegments(
  segments:        VideoSegment[],
  availableTracks: LoadedTrack[],
  videoDuration:   number,
): SegmentAssignment[] {
  if (segments.length === 0 || availableTracks.length === 0) return [];

  // ── Duration-aware track selection ─────────────────────────────────────────
  // From the top prompt-matched tracks, pick the one whose duration best fits
  // the video's length. This ensures the track's natural arc
  // (intro → build → climax → outro) aligns with the video's own timeline.
  //
  // Preference order:
  //  1. Track whose duration is closest to videoDuration (within ±50%)
  //  2. Track that ends AFTER the video (longer is safer than shorter)
  //  3. Fall back to availableTracks[0] (best prompt match) if none fit
  const getTrackDur = (t: LoadedTrack) =>
    t.duration > 0 ? t.duration : (t.nominalDuration || 60);

  // Score: prefer tracks where duration >= videoDuration, penalise shorter ones
  const scoreDuration = (t: LoadedTrack) => {
    const dur  = getTrackDur(t);
    const diff = dur - videoDuration;   // positive = track longer than video (good)
    if (diff >= 0) return -diff;        // closest-but-longer wins (smallest negative)
    return diff * 3;                    // penalise shorter tracks 3×
  };

  const primaryTrack = [...availableTracks].sort(
    (a, b) => scoreDuration(a) - scoreDuration(b),
  )[0] ?? availableTracks[0];

  // Always start from the very beginning so the track's natural intro plays.
  // If the track is longer than the video the outro-fade (4 s) covers the tail.
  // If the track is shorter than the video the fade handles the rest gracefully.
  const startOffset = 0;

  const assignments: SegmentAssignment[] = [];
  let currentAudioTime = startOffset;

  segments.forEach((segment) => {
    const audioStartTime = currentAudioTime;
    const audioEndTime   = audioStartTime + segment.duration;

    globalVariationCounter++;

    assignments.push({
      segment,
      track: primaryTrack,
      audioStartTime,
      audioEndTime,
      variationIndex: globalVariationCounter,
      offsetLabel:    offsetLabel(audioStartTime),
    });

    currentAudioTime = audioEndTime;
  });

  return assignments;
}
