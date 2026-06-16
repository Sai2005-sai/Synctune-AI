/**
 * audioExportEngine.ts
 *
 * Export pipeline — platform-adaptive:
 *
 *   WEB    → OfflineAudioContext renders a real mixed WAV from all audio
 *            segments (with gain envelopes matching the live sync engine):
 *              • Each segment starts at its audioStartTime offset in the track
 *              • Gain fades in at segment.startTime and out at segment.endTime
 *            → Produces a downloadable .wav Blob
 *
 *   NATIVE → expo-media-library saves the video file to the device gallery
 *            → expo-file-system writes the precise BGM timing plan as JSON
 *            → expo-sharing opens the OS share sheet for the plan file
 *
 * SYNC ACCURACY
 * ─────────────
 * The same segment timing data (startTime, audioStartTime, duration) used by
 * AudioSyncEngine for live playback is reused 1-to-1 for both the WAV render
 * and the JSON plan, so the export is bit-accurate with the preview.
 */

import { Platform } from 'react-native';
import type { SegmentAssignment } from './audioVariationEngine';

export type ExportPhase =
  | 'idle'
  | 'preparing'
  | 'rendering'
  | 'encoding'
  | 'saving'
  | 'done'
  | 'error';

export interface ExportProgress {
  phase:    ExportPhase;
  progress: number;    // 0-1
  message:  string;
}

export interface ExportResult {
  success:   boolean;
  platform:  'web' | 'native';
  /** Web only: object URL for the mixed WAV blob */
  wavUrl?:   string;
  /** Web only: suggested filename */
  filename?: string;
  /** Native only: path of the saved BGM plan JSON */
  planPath?: string;
  error?:    string;
}

export type ProgressCallback = (p: ExportProgress) => void;

// ─────────────────────────────────────────────────────────────────────────────
// WAV encoder (browser — converts AudioBuffer → Blob)
// ─────────────────────────────────────────────────────────────────────────────

function writeStr(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

function audioBufferToWav(buf: AudioBuffer): Blob {
  const numCh      = buf.numberOfChannels;
  const sr         = buf.sampleRate;
  const numSamples = buf.length;
  const dataLen    = numSamples * numCh * 2; // 16-bit PCM
  const ab         = new ArrayBuffer(44 + dataLen);
  const view       = new DataView(ab);

  writeStr(view, 0, 'RIFF'); view.setUint32(4, 36 + dataLen, true);
  writeStr(view, 8, 'WAVE');
  writeStr(view, 12, 'fmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);           // PCM
  view.setUint16(22, numCh, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * numCh * 2, true);
  view.setUint16(32, numCh * 2, true);
  view.setUint16(34, 16, true);          // 16-bit
  writeStr(view, 36, 'data'); view.setUint32(40, dataLen, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      const s = Math.max(-1, Math.min(1, buf.getChannelData(ch)[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
  }
  return new Blob([ab], { type: 'audio/wav' });
}

// ─────────────────────────────────────────────────────────────────────────────
// WEB export — OfflineAudioContext real mix
// ─────────────────────────────────────────────────────────────────────────────

async function exportWeb(
  assignments:   SegmentAssignment[],
  videoDuration: number,
  onProgress:    ProgressCallback,
): Promise<ExportResult> {
  const SAMPLE_RATE = 44100;
  const FADE_IN     = 0.7;   // seconds (matches AudioSyncEngine)
  const FADE_OUT    = 0.6;

  try {
    const OfflineCtx = (window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    if (!OfflineCtx) throw new Error('OfflineAudioContext not supported in this browser');

    // If videoDuration is undefined/NaN (e.g. from DocumentPicker fallback),
    // calculate the exact total duration from the segments.
    let durationSec = videoDuration;
    if (!durationSec || isNaN(durationSec)) {
      durationSec = assignments.reduce((max, asn) => Math.max(max, asn.segment.endTime), 0);
    }
    // Fallback if still 0 to prevent OfflineAudioContext crashing
    if (durationSec <= 0) durationSec = 1;

    const ctx = new OfflineCtx(2, Math.ceil(SAMPLE_RATE * durationSec), SAMPLE_RATE);

    onProgress({ phase: 'preparing', progress: 0.05, message: 'Initialising audio context…' });

    for (let i = 0; i < assignments.length; i++) {
      const asn = assignments[i];
      const { startTime, endTime, duration } = asn.segment;
      const audioStart = asn.audioStartTime;

      try {
        // Use pre-resolved URI from musicLoader (expo-asset resolved it on all platforms)
        const assetUri = (asn.track as any).resolvedUri as string | undefined;
        if (!assetUri) {
          console.warn('[audioExport] No resolvedUri for segment', i, '— skipping');
          continue;
        }

        const response    = await fetch(assetUri);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        const source   = ctx.createBufferSource();
        source.buffer  = audioBuffer;

        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        source.connect(gainNode);

        // ── Gain envelope — bit-identical to AudioSyncEngine ──────────────
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(1, startTime + FADE_IN);

        const fadeOutStart = Math.max(startTime + FADE_IN, endTime - FADE_OUT);
        gainNode.gain.setValueAtTime(1, fadeOutStart);
        gainNode.gain.linearRampToValueAtTime(0, endTime);

        // schedule: offset = audioStart, duration = segment.duration
        source.start(startTime, audioStart, duration);
      } catch (err) {
        console.warn(`[audioExport] Segment ${i} failed:`, err);
      }

      onProgress({
        phase:    'rendering',
        progress: 0.05 + (i + 1) / assignments.length * 0.55,
        message:  `Processing segment ${i + 1} of ${assignments.length}: "${asn.track.title}"`,
      });
    }

    onProgress({ phase: 'encoding', progress: 0.65, message: 'Rendering final audio mix…' });
    const rendered = await ctx.startRendering();

    onProgress({ phase: 'encoding', progress: 0.85, message: 'Encoding WAV…' });
    const wavBlob = audioBufferToWav(rendered);
    const wavUrl  = URL.createObjectURL(wavBlob);
    const ts      = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `bgm_mix_${ts}.wav`;

    onProgress({ phase: 'done', progress: 1, message: 'Audio mix ready for download!' });
    return { success: true, platform: 'web', wavUrl, filename };

  } catch (err: any) {
    onProgress({ phase: 'error', progress: 0, message: `Export failed: ${err.message}` });
    return { success: false, platform: 'web', error: String(err) };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE export — gallery save + JSON plan share
// ─────────────────────────────────────────────────────────────────────────────

async function exportNative(
  videoUri:      string,
  assignments:   SegmentAssignment[],
  onProgress:    ProgressCallback,
): Promise<ExportResult> {
  try {
    onProgress({ phase: 'preparing', progress: 0.1, message: 'Requesting permissions…' });

    const MediaLibrary = await import('expo-media-library');
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Media library permission denied. Please allow access in Settings.');
    }

    onProgress({ phase: 'saving', progress: 0.35, message: 'Saving video to gallery…' });
    await MediaLibrary.saveToLibraryAsync(videoUri);

    // Build precise BGM timing plan
    const plan = {
      app:        'AI Video BGM Matcher',
      exportedAt: new Date().toISOString(),
      note:       'Apply each track at the exact audioStartTime offset listed below.',
      segments:   assignments.map((a, idx) => ({
        segment:         `Segment ${idx + 1}`,
        videoStartTime:  a.segment.startTime.toFixed(3),
        videoEndTime:    a.segment.endTime.toFixed(3),
        durationSeconds: a.segment.duration.toFixed(3),
        trackTitle:      a.track.title,
        mood:            a.track.mood,
        bpm:             a.track.bpm,
        audioStartOffset: a.audioStartTime.toFixed(3),
        offsetLabel:     a.offsetLabel,
        fadeIn:          '0.700s',
        fadeOut:         '0.600s',
      })),
    };

    onProgress({ phase: 'saving', progress: 0.65, message: 'Writing BGM plan…' });
    const FileSystemMod = await import('expo-file-system');
    const FS            = FileSystemMod.default ?? FileSystemMod;
    const ts            = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const planPath      = `${(FS as any).cacheDirectory}bgm_plan_${ts}.json`;
    await (FS as any).writeAsStringAsync(planPath, JSON.stringify(plan, null, 2));

    onProgress({ phase: 'saving', progress: 0.85, message: 'Opening share sheet…' });
    const Sharing = await import('expo-sharing');
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(planPath, {
        mimeType:    'application/json',
        dialogTitle: 'Share BGM Plan',
        UTI:         'public.json',
      });
    }

    onProgress({ phase: 'done', progress: 1, message: 'Video saved to gallery!' });
    return { success: true, platform: 'native', planPath };

  } catch (err: any) {
    onProgress({ phase: 'error', progress: 0, message: err.message ?? 'Export failed' });
    return { success: false, platform: 'native', error: String(err) };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export async function exportWithBGM(
  videoUri:      string,
  assignments:   SegmentAssignment[],
  videoDuration: number,
  onProgress:    ProgressCallback,
): Promise<ExportResult> {
  if (assignments.length === 0) {
    return { success: false, platform: Platform.OS === 'web' ? 'web' : 'native', error: 'No assignments to export' };
  }
  if (Platform.OS === 'web') {
    return exportWeb(assignments, videoDuration, onProgress);
  }
  return exportNative(videoUri, assignments, onProgress);
}
