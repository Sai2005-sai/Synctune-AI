/**
 * frameAnalyzer.ts
 *
 * Platform-adaptive video analysis:
 *
 *   Web    → HTML5 Canvas + Video element → actual RGBA pixel data
 *   Native → Safe duration-based heuristic (no native thumbnail calls
 *            to avoid Android MediaMetadataRetriever C++ signal faults)
 */
// Web-only build — always use canvas analysis
const Platform = { OS: 'web' as const };

export interface FrameAnalysisResult {
  brightness: number;
  motionIntensity: number;
  sceneCuts: number;
  frameCount: number;
  analysisMethod: 'canvas' | 'thumbnail';
  rawBrightnessValues: number[];   // per-frame brightness (for UI sparkline)
  rawMotionValues: number[];       // per-frame motion score
  trueDurationSeconds?: number;    // Extracted directly from DOM/Native if available
}

const SAMPLE_COUNT = 10;           // number of frames to sample
const SCENE_CUT_THRESHOLD = 0.28; // frame-diff > this → scene cut

// ─────────────────────────────────────────────────────────────────────────────
// WEB — Canvas-based true pixel analysis
// ─────────────────────────────────────────────────────────────────────────────

function analyzeFramesWeb(
  videoUri: string,
  durationSeconds: number,
): Promise<FrameAnalysisResult> {
  return new Promise((resolve, reject) => {
    const SAMPLE_W = 48;
    const SAMPLE_H = 27; // 16:9 sample grid → 1296 pixels per frame

    const video = (document as any).createElement('video') as HTMLVideoElement;
    video.src = videoUri;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.preload = 'auto';

    const canvas = (document as any).createElement('canvas') as HTMLCanvasElement;
    canvas.width = SAMPLE_W;
    canvas.height = SAMPLE_H;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const captures: { brightness: number; pixels: Uint8ClampedArray }[] = [];
    let sampleIndex = 0;
    let errored = false;

    const doCapture = () => {
      try {
        ctx.drawImage(video, 0, 0, SAMPLE_W, SAMPLE_H);
        const imageData = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
        const pixels = imageData.data; // RGBA

        // Luminance per pixel: Rec. 709 formula
        let lumSum = 0;
        const pixelCount = SAMPLE_W * SAMPLE_H;
        for (let i = 0; i < pixels.length; i += 4) {
          lumSum +=
            (0.2126 * pixels[i] +
              0.7152 * pixels[i + 1] +
              0.0722 * pixels[i + 2]) /
            255;
        }

        captures.push({
          brightness: lumSum / pixelCount,
          pixels: new Uint8ClampedArray(pixels),
        });
      } catch {
        captures.push({ brightness: 0.5, pixels: new Uint8ClampedArray(0) });
      }

      sampleIndex++;
      if (sampleIndex < SAMPLE_COUNT) {
        // Space out over the true duration, or default
        const maxSeek = Math.max(1, (actualDuration > 0 ? actualDuration : durationSeconds) - 1);
        const t = (sampleIndex / (SAMPLE_COUNT - 1)) * maxSeek;
        video.currentTime = t;
      } else {
        finalise();
      }
    };

    const finalise = () => {
      // Mean brightness
      const brightValues = captures.map((c) => c.brightness);
      const avgBrightness =
        brightValues.reduce((a, b) => a + b, 0) / brightValues.length;

      // Frame-to-frame motion and scene cut detection
      const motionValues: number[] = [];
      let sceneCuts = 0;

      for (let i = 1; i < captures.length; i++) {
        const curr = captures[i].pixels;
        const prev = captures[i - 1].pixels;
        if (curr.length === 0 || prev.length === 0) {
          motionValues.push(0);
          continue;
        }

        let diffSum = 0;
        const len = Math.min(curr.length, prev.length);
        for (let j = 0; j < len; j += 4) {
          diffSum +=
            (Math.abs(curr[j] - prev[j]) +
              Math.abs(curr[j + 1] - prev[j + 1]) +
              Math.abs(curr[j + 2] - prev[j + 2])) /
            (3 * 255);
        }
        const frameDiff = diffSum / (SAMPLE_W * SAMPLE_H);
        motionValues.push(frameDiff);
        if (frameDiff > SCENE_CUT_THRESHOLD) sceneCuts++;
      }

      const avgMotion =
        motionValues.length > 0
          ? motionValues.reduce((a, b) => a + b, 0) / motionValues.length
          : 0;

      // Clean up
      video.src = '';

      resolve({
        brightness: avgBrightness,
        motionIntensity: Math.min(1, avgMotion),
        sceneCuts,
        frameCount: captures.length,
        analysisMethod: 'canvas',
        rawBrightnessValues: brightValues,
        rawMotionValues: motionValues,
        trueDurationSeconds: actualDuration > 0 ? actualDuration : durationSeconds,
      });
    };

    let actualDuration = 0;

    video.onseeked = doCapture;
    video.onerror = (e) => {
      if (!errored) {
        errored = true;
        reject(new Error('Video load error'));
      }
    };
    video.onloadedmetadata = () => {
      if (video.duration && !isNaN(video.duration) && video.duration !== Infinity && video.duration > 0.5) {
        actualDuration = video.duration;
      } else {
        actualDuration = durationSeconds;
      }
      // Start at 5% into the video to skip potential black intro frames
      video.currentTime = actualDuration * 0.05;
    };

    // Timeout guard in case seeking stalls
    setTimeout(() => {
      if (captures.length < 2) {
        reject(new Error('Frame analysis timed out'));
      }
    }, 30_000);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE — Safe duration-based heuristic (no thumbnail calls)
// ─────────────────────────────────────────────────────────────────────────────
// NOTE: expo-video-thumbnails / MediaMetadataRetriever cause unrecoverable
// C++ native signal faults on certain Android devices that JS cannot catch.
// We instead return stable heuristic defaults safely derived from duration.

async function analyzeFramesNative(
  _videoUri: string,
  durationSeconds: number,
): Promise<FrameAnalysisResult> {
  // Derive a soft "motion" estimate from video length:
  // short videos tend to be dynamic clips; long videos tend to be calmer.
  const normalizedDuration = Math.min(1, durationSeconds / 120);
  const motionIntensity = Math.max(0.15, 0.55 - normalizedDuration * 0.3);

  // Balanced neutral defaults — videoAnalyzer heuristics will refine further
  const brightness = 0.5;
  const sceneCuts = durationSeconds > 60 ? 2 : 1;

  return {
    brightness,
    motionIntensity,
    sceneCuts,
    frameCount: SAMPLE_COUNT,
    analysisMethod: 'thumbnail',
    trueDurationSeconds: durationSeconds,
    rawBrightnessValues: new Array(SAMPLE_COUNT).fill(brightness),
    rawMotionValues: new Array(SAMPLE_COUNT - 1).fill(motionIntensity),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Analyse video frames and return real computed metrics.
 * Falls back to safe defaults if analysis fails.
 */
export async function analyzeFrames(
  videoUri: string,
  durationSeconds: number,
): Promise<FrameAnalysisResult> {
  try {
    if (Platform.OS === 'web') {
      return await analyzeFramesWeb(videoUri, Math.max(1, durationSeconds));
    }
    return await analyzeFramesNative(videoUri, Math.max(1, durationSeconds));
  } catch (err) {
    console.warn('[frameAnalyzer] Analysis failed, using defaults:', err);
    return {
      brightness: 0.5,
      motionIntensity: 0.25,
      sceneCuts: 1,
      frameCount: SAMPLE_COUNT,
      analysisMethod: Platform.OS === 'web' ? 'canvas' : 'thumbnail',
      rawBrightnessValues: new Array(SAMPLE_COUNT).fill(0.5),
      rawMotionValues: new Array(SAMPLE_COUNT - 1).fill(0.25),
    };
  }
}
