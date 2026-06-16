/**
 * audioPlayer.ts
 *
 * Cross-platform audio player with a single consistent interface.
 *
 * WEB    → HTMLAudioElement (native browser API — guaranteed to work,
 *           no bower autoplay blocks because we call .play() inside a
 *           user-event handler, and volume fades work via .volume property)
 *
 * NATIVE → expo-av Audio.Sound (no changes needed on native)
 *
 * WHY not expo-av on web?
 *   expo-av's web wrapper does not always initialise the Web Audio API
 *   context correctly when assets are served from Metro bundler query-param
 *   URLs. The raw HTMLAudioElement has no such issues.
 */

import { Platform } from 'react-native';

export interface IAudioPlayer {
  /** Load URI and start playback. offsetSec = start offset in the track. */
  play(uri: string, offsetSec?: number, initialVolume?: number): Promise<void>;
  /** Smoothly change volume (0–1). */
  setVolume(volume: number): Promise<void>;
  /** Pause without unloading. */
  pause(): Promise<void>;
  /** Resume after pause. */
  resume(): Promise<void>;
  /** Stop playback and unload. */
  stop(): Promise<void>;
  /** Whether the player is currently producing audio. */
  isPlaying(): boolean;
  /** Callback invoked when natural playback finishes. */
  setOnEnded(cb: () => void): void;
  /** Free all resources. */
  dispose(): void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Web: Web Audio API (AudioContext)
// ─────────────────────────────────────────────────────────────────────────────

// Shared AudioContext for the entire app. It bypasses Autoplay policies once 
// the user has interacted with the document.
let sharedAudioCtx: AudioContext | null = null;
const audioBufferCache = new Map<string, AudioBuffer>();

function getAudioContext(): AudioContext {
  if (!sharedAudioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    sharedAudioCtx = new Ctx();
  }
  return sharedAudioCtx;
}

class WebAudioPlayer implements IAudioPlayer {
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private _playing = false;
  private _onEnded?: () => void;
  private _uri = '';
  private _startTimeContext = 0;
  private _offsetSec = 0;

  async play(uri: string, offsetSec = 0, initialVolume = 1.0): Promise<void> {
    await this.stop();
    this._uri = uri;
    this._offsetSec = offsetSec;
    
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // Load and decode buffer (with caching so crossfades are instant)
    let buffer = audioBufferCache.get(uri);
    if (!buffer) {
      try {
        const resp = await fetch(uri);
        const arrayBuf = await resp.arrayBuffer();
        buffer = await ctx.decodeAudioData(arrayBuf);
        audioBufferCache.set(uri, buffer);
      } catch (err) {
        console.warn('[WebAudioPlayer] fetch/decode failed for URI:', uri, err);
        throw err;
      }
    }

    this.source = ctx.createBufferSource();
    this.source.buffer = buffer;
    
    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, initialVolume)), ctx.currentTime);
    
    this.source.connect(this.gainNode);
    this.gainNode.connect(ctx.destination);

    this.source.onended = () => {
      // onended fires when buffer completes or stop() is called.
      if (this._playing) {
        this._playing = false;
        this._onEnded?.();
      }
    };

    this.source.start(0, offsetSec);
    this._startTimeContext = ctx.currentTime;
    this._playing = true;
  }

  async setVolume(v: number): Promise<void> {
    if (this.gainNode) {
      const ctx = getAudioContext();
      // Ramp smoothly over 50ms to prevent clicking
      this.gainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), ctx.currentTime, 0.05);
    }
  }

  async pause(): Promise<void> {
    if (this._playing && this.source) {
      try { this.source.stop(); } catch {}
      const ctx = getAudioContext();
      this._offsetSec += (ctx.currentTime - this._startTimeContext);
      this._playing = false;
      this.source.disconnect();
      this.source = null;
    }
  }

  async resume(): Promise<void> {
    if (!this._playing && this._uri) {
      await this.play(this._uri, this._offsetSec, this.gainNode?.gain.value ?? 1.0);
    }
  }

  async stop(): Promise<void> {
    if (this.source) {
      try { this.source.stop(); } catch {}
      this.source.disconnect();
      this.source = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    this._playing = false;
    this._offsetSec = 0;
  }

  isPlaying(): boolean {
    return this._playing;
  }

  setOnEnded(cb: () => void): void {
    this._onEnded = cb;
  }

  dispose(): void {
    this.stop().catch(() => {});
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Native: expo-av Audio.Sound
// ─────────────────────────────────────────────────────────────────────────────

class NativeAudioPlayer implements IAudioPlayer {
  private sound: any = null;
  private _playing = false;
  private _onEnded?: () => void;

  async play(uri: string, offsetSec = 0, initialVolume = 1.0): Promise<void> {
    await this.stop();
    const { Audio } = require('expo-av');
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, playThroughEarpieceAndroid: false });
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, volume: Math.max(0, Math.min(1, initialVolume)), positionMillis: Math.round(offsetSec * 1000) },
    );
    this.sound = sound;
    this._playing = true;

    sound.setOnPlaybackStatusUpdate((s: any) => {
      if (s.isLoaded && s.didJustFinish) {
        this._playing = false;
        this._onEnded?.();
      }
    });
  }

  async setVolume(v: number): Promise<void> {
    if (this.sound) {
      try { await this.sound.setVolumeAsync(Math.max(0, Math.min(1, v))); } catch {}
    }
  }

  async pause(): Promise<void> {
    if (this.sound) {
      try { await this.sound.pauseAsync(); } catch {}
    }
    this._playing = false;
  }

  async resume(): Promise<void> {
    if (this.sound) {
      try { await this.sound.playAsync(); } catch {}
      this._playing = true;
    }
  }

  async stop(): Promise<void> {
    if (this.sound) {
      try { await this.sound.stopAsync();   } catch {}
      try { await this.sound.unloadAsync(); } catch {}
      this.sound = null;
    }
    this._playing = false;
  }

  isPlaying(): boolean {
    return this._playing;
  }

  setOnEnded(cb: () => void): void {
    this._onEnded = cb;
  }

  dispose(): void {
    this.stop().catch(() => {});
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

export function createAudioPlayer(): IAudioPlayer {
  return Platform.OS === 'web' ? new WebAudioPlayer() : new NativeAudioPlayer();
}
