/**
 * audioSyncEngine.ts
 *
 * Synchronises background music playback with video position.
 * Uses the cross-platform IAudioPlayer (HTMLAudioElement on web, expo-av on native).
 *
 * FADE STRATEGY
 * ─────────────
 *   Old track fades OUT over FADE_OUT_MS before the boundary,
 *   new track fades IN over FADE_IN_MS after it starts.
 *   Both run in parallel for a true crossfade feel.
 */

import type { SegmentAssignment } from './audioVariationEngine';
import { createAudioPlayer, IAudioPlayer } from './audioPlayer';

// ── Timing constants ─────────────────────────────────────────────────────────
const FADE_IN_MS           = 700;
const FADE_OUT_MS          = 3000;   // 3 s — gives a cinematic, gradual outro
const FADE_STEPS           = 40;
const PRE_FADE_WINDOW_SEC  = 1.8;
const END_FADE_WINDOW_SEC  = 4.0;   // start fading 4 s before video ends
const POSITION_UPDATE_THROTTLE_MS = 150;

export interface SyncStatus {
  currentSegmentIdx:  number;
  currentTrackTitle:  string;
  volume:             number;
  state:              'idle' | 'loading' | 'playing' | 'paused' | 'fading' | 'transitioning' | 'stopped';
  nextTrackTitle:     string | null;
}

type StatusCallback = (s: SyncStatus) => void;

export class AudioSyncEngine {
  private assignments:    SegmentAssignment[];
  private onStatusChange: StatusCallback;

  private player:            IAudioPlayer | null = null;
  private currentSegmentIdx  = -1;
  private volume             = 0;
  private engineState: SyncStatus['state'] = 'idle';

  private fadeInTimer:  ReturnType<typeof setInterval> | null = null;
  private fadeOutTimer: ReturnType<typeof setInterval> | null = null;
  private lastPositionUpdateAt = 0;
  private isTransitioning = false;

  constructor(assignments: SegmentAssignment[], onStatusChange: StatusCallback) {
    this.assignments    = assignments;
    this.onStatusChange = onStatusChange;
  }

  // ── Public controls ─────────────────────────────────────────────────────────

  async play(): Promise<void> {
    if (this.currentSegmentIdx === -1 && this.assignments.length > 0) {
      await this.loadAndFadeIn(0);
    } else if (this.player) {
      await this.player.resume();
      this.setEngineState('playing');
    }
  }

  async pause(): Promise<void> {
    this.clearFadeTimers();
    await this.player?.pause();
    this.setEngineState('paused');
  }

  async stop(): Promise<void> {
    this.clearFadeTimers();
    await this.player?.stop();
    this.player?.dispose();
    this.player          = null;
    this.currentSegmentIdx = -1;
    this.volume            = 0;
    this.isTransitioning   = false;
    this.setEngineState('stopped');
  }

  async reset(): Promise<void> {
    await this.stop();
    this.setEngineState('idle');
  }

  dispose(): void {
    this.clearFadeTimers();
    this.player?.dispose();
    this.player = null;
  }

  // ── Main sync hook — called from Video.onPlaybackStatusUpdate ───────────────

  async handleVideoPosition(positionSec: number, duration: number): Promise<void> {
    const now = Date.now();
    if (now - this.lastPositionUpdateAt < POSITION_UPDATE_THROTTLE_MS) return;
    this.lastPositionUpdateAt = now;

    if (this.isTransitioning) return;

    // ── 1. Hard-stop safety net: position at or past video end ───────────────
    if (duration > 0 && positionSec >= duration - 0.1) {
      if (this.engineState !== 'stopped') {
        await this.stop();
      }
      return;
    }

    // ── 2. Gradual outro fade starting END_FADE_WINDOW_SEC before the end ───
    const timeLeft = duration - positionSec;
    if (timeLeft <= END_FADE_WINDOW_SEC && this.player && this.engineState !== 'stopped') {
      if (!this.fadeOutTimer) {
        // Start fade, scaled so it finishes exactly at the video end
        const startFrac = Math.min(1, timeLeft / END_FADE_WINDOW_SEC);
        this.fadeOut(this.player, startFrac);
      }
      return;
    }

    // ── 2. Find current segment ─────────────────────────────────────────────
    const segIdx = this.segmentIndexAt(positionSec);
    if (segIdx < 0) return;

    // If still in the same segment, just return. (Removed redundant 1.8s pre-fade which muted short segments prematurely)
    if (segIdx === this.currentSegmentIdx) {
      return;
    }

    // ── 2.5 Continuous track check ──────────────────────────────────────────
    // If the new segment uses the EXACT SAME track contiguously, don't interrupt
    // playback with a jarring crossfade. Just let it keep playing naturally!
    if (this.currentSegmentIdx >= 0) {
      const currentAsn = this.assignments[this.currentSegmentIdx];
      const newAsn =     this.assignments[segIdx];
      if (
        currentAsn.track.id === newAsn.track.id &&
        Math.abs(currentAsn.audioEndTime - newAsn.audioStartTime) < 0.2
      ) {
        // Seamless flow: just update the UI index so the timeline moves forward
        this.currentSegmentIdx = segIdx;
        this.emit();
        return;
      }
    }

    // ── 3. Segment changed — crossfade to new segment ───────────────────────
    await this.crossfadeTo(segIdx);
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private segmentIndexAt(positionSec: number): number {
    for (let i = 0; i < this.assignments.length; i++) {
      const { startTime, endTime } = this.assignments[i].segment;
      if (positionSec >= startTime && positionSec < endTime) return i;
    }
    return this.assignments.length - 1;
  }

  private async crossfadeTo(newIdx: number): Promise<void> {
    if (newIdx < 0 || newIdx >= this.assignments.length) return;
    this.isTransitioning = true;
    this.setEngineState('transitioning');

    const prevPlayer = this.player;
    this.player          = null;
    this.currentSegmentIdx = newIdx;
    this.volume            = 0;
    this.emit();

    // Fade out old in background
    if (prevPlayer) {
      this.fadeOut(prevPlayer).then(async () => {
        await prevPlayer.stop();
        prevPlayer.dispose();
      });
    }

    await this.loadAndFadeIn(newIdx);
    this.isTransitioning = false;
  }

  private async loadAndFadeIn(idx: number): Promise<void> {
    const asn = this.assignments[idx];
    if (!asn) return;

    const uri = (asn.track as any).resolvedUri as string | undefined;
    if (!uri) {
      console.warn('[AudioSyncEngine] No resolvedUri for idx', idx, asn.track.title);
      this.setEngineState('idle');
      this.emit();
      return;
    }

    this.setEngineState('loading');
    this.emit();

    const player = createAudioPlayer();
    try {
      await player.play(uri, asn.audioStartTime, 0); // start silent
      this.player            = player;
      this.currentSegmentIdx = idx;
      this.setEngineState('playing');
      this.emit();
      await this.fadeIn(player);
    } catch (err) {
      console.warn('[AudioSyncEngine] loadAndFadeIn error:', err);
      player.dispose();
      this.player = null;
      this.setEngineState('idle');
      this.emit();
    }
  }

  private fadeIn(player: IAudioPlayer): Promise<void> {
    return this.fadeVolume(player, 0, 1, FADE_IN_MS, true);
  }

  private fadeOut(player: IAudioPlayer, startFrac = 1): Promise<void> {
    return this.fadeVolume(player, this.volume * startFrac, 0, FADE_OUT_MS, false);
  }

  private fadeVolume(
    player:     IAudioPlayer,
    from:       number,
    to:         number,
    durationMs: number,
    isFadeIn:   boolean,
  ): Promise<void> {
    return new Promise((resolve) => {
      if (isFadeIn)  this.clearFadeIn();
      else           this.clearFadeOut();

      const intervalMs = durationMs / FADE_STEPS;
      const delta      = (to - from) / FADE_STEPS;
      let step = 0;
      let current = from;

      const timer = setInterval(async () => {
        step++;
        current = Math.max(0, Math.min(1, from + delta * step));
        await player.setVolume(current);
        if (isFadeIn) { this.volume = current; this.emit(); }

        if (step >= FADE_STEPS) {
          clearInterval(timer);
          if (isFadeIn)  this.fadeInTimer  = null;
          else           this.fadeOutTimer = null;
          resolve();
        }
      }, intervalMs);

      if (isFadeIn)  this.fadeInTimer  = timer;
      else           this.fadeOutTimer = timer;
    });
  }

  private clearFadeIn():  void { if (this.fadeInTimer)  { clearInterval(this.fadeInTimer);  this.fadeInTimer  = null; } }
  private clearFadeOut(): void { if (this.fadeOutTimer) { clearInterval(this.fadeOutTimer); this.fadeOutTimer = null; } }
  private clearFadeTimers(): void { this.clearFadeIn(); this.clearFadeOut(); }

  private setEngineState(s: SyncStatus['state']): void { this.engineState = s; }

  private emit(): void {
    const idx   = this.currentSegmentIdx;
    const asn   = idx >= 0 ? this.assignments[idx] : null;
    const next  = idx + 1 < this.assignments.length ? this.assignments[idx + 1] : null;
    this.onStatusChange({
      currentSegmentIdx: idx,
      currentTrackTitle: asn?.track.title ?? '—',
      volume:            this.volume,
      state:             this.engineState,
      nextTrackTitle:    next?.track.title ?? null,
    });
  }
}
