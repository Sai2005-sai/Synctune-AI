/**
 * videoSegmenter.ts
 *
 * Splits a video into discrete scene segments using the frame-analysis data
 * already computed by frameAnalyzer.ts.
 *
 * HOW IT WORKS
 * ─────────────
 * frameAnalyzer samples N frames evenly from 5 % → 95 % of the video.
 * rawMotionValues[i] is the normalised pixel-diff between frame i and frame i+1.
 * When rawMotionValues[i] > SCENE_CUT_THRESHOLD a scene cut is detected.
 *
 * We reconstruct the timestamp for each frame, find every cut, and build
 * contiguous [startTime, endTime] segments that span the full video duration.
 */

import type { FrameAnalysisResult } from './frameAnalyzer';

export const SCENE_CUT_THRESHOLD = 0.28; // must match frameAnalyzer constant

export interface VideoSegment {
  index: number;
  startTime: number;   // seconds into video
  endTime: number;     // seconds into video
  duration: number;    // endTime − startTime
  motionScore: number; // average motion in this segment (0-1)
  label: string;       // "Segment 1", "Segment 2", …
  color: string;       // accent colour for UI
}

// Eight visually distinct accent colours — one per segment (cycles if >8)
export const SEGMENT_PALETTE = [
  '#7C3AED', // violet
  '#06B6D4', // cyan
  '#F59E0B', // amber
  '#10B981', // green
  '#EC4899', // pink
  '#F97316', // orange
  '#6366F1', // indigo
  '#14B8A6', // teal
];

/**
 * Compute video segments from frame-analysis data.
 *
 * @param videoDuration  Total video length in seconds
 * @param frameData      Full FrameAnalysisResult from analyzeFrames()
 * @returns              Array of VideoSegment (≥1), in chronological order
 */
export function computeSegments(
  videoDuration: number,
  frameData: FrameAnalysisResult,
): VideoSegment[] {
  const { rawMotionValues, frameCount, motionIntensity } = frameData;

  // ── No usable motion data — return a single segment ──────────────────────
  if (rawMotionValues.length === 0 || frameCount < 2) {
    return [makeSingleSegment(videoDuration, motionIntensity)];
  }

  // ── Reconstruct frame timestamps ─────────────────────────────────────────
  // Frames span 5 % → 95 % of duration, spaced evenly.
  const frameTimestamps: number[] = Array.from({ length: frameCount }, (_, i) =>
    videoDuration * (0.05 + (i / Math.max(1, frameCount - 1)) * 0.9),
  );

  // ── Locate cut timestamps ────────────────────────────────────────────────
  // A cut between frame[i] and frame[i+1] → midpoint timestamp.
  const cutTimes: number[] = [];
  for (let i = 0; i < rawMotionValues.length; i++) {
    if (rawMotionValues[i] > SCENE_CUT_THRESHOLD && frameTimestamps[i + 1] != null) {
      cutTimes.push((frameTimestamps[i] + frameTimestamps[i + 1]) / 2);
    }
  }

  // ── Build segments ────────────────────────────────────────────────────────
  const boundaries = [0, ...cutTimes, videoDuration];
  const segments: VideoSegment[] = [];

  for (let i = 0; i < boundaries.length - 1; i++) {
    const startTime = boundaries[i];
    const endTime   = boundaries[i + 1];

    // Average motion for frames inside this time window
    const startFrac = startTime / videoDuration;
    const endFrac   = endTime   / videoDuration;
    const motionInRange = rawMotionValues.filter((_, idx) => {
      const mid = (idx + 0.5) / rawMotionValues.length;
      return mid >= startFrac && mid < endFrac;
    });
    const avgMotion =
      motionInRange.length > 0
        ? motionInRange.reduce((a, b) => a + b, 0) / motionInRange.length
        : motionIntensity;

    segments.push({
      index:       i,
      startTime,
      endTime,
      duration:    endTime - startTime,
      motionScore: avgMotion,
      label:       `Segment ${i + 1}`,
      color:       SEGMENT_PALETTE[i % SEGMENT_PALETTE.length],
    });
  }

  // Merge any segments shorter than 1 s into the next (cap at 8 useful segments)
  return mergeShort(segments).slice(0, 8);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSingleSegment(duration: number, motion: number): VideoSegment {
  return {
    index: 0, startTime: 0, endTime: duration, duration,
    motionScore: motion, label: 'Segment 1', color: SEGMENT_PALETTE[0],
  };
}

/** Merge segments shorter than 1 s into their successor. */
function mergeShort(segs: VideoSegment[]): VideoSegment[] {
  const out: VideoSegment[] = [];
  for (const seg of segs) {
    if (seg.duration < 1 && out.length > 0) {
      const prev = out[out.length - 1];
      out[out.length - 1] = {
        ...prev,
        endTime:     seg.endTime,
        duration:    seg.endTime - prev.startTime,
        motionScore: (prev.motionScore + seg.motionScore) / 2,
      };
    } else {
      out.push({ ...seg, index: out.length, label: `Segment ${out.length + 1}` });
    }
  }
  return out;
}

/** Human-readable time label: "0:00" */
export function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
