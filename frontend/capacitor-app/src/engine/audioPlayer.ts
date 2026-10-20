/**
 * audioPlayer.ts
 *
 * Fast, reliable HTML5 audio streaming player with instant playback,
 * smooth volume control, precise seeking, and zero-leakage pausing.
 */

export interface IAudioPlayer {
  play(uri: string, offsetSec?: number, initialVolume?: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  seek(offsetSec: number): Promise<void>;
  stop(): Promise<void>;
  isPlaying(): boolean;
  setOnEnded(cb: () => void): void;
  dispose(): void;
}

export function resolveAudioUri(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const clean = url.startsWith('/') ? url : '/' + url;
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    return '/Synctune-AI' + clean;
  }
  return clean;
}

// Track globally active audio elements so that starting any new track
// immediately stops any previously playing audio across the whole app.
const activeAudioInstances = new Set<HTMLAudioElement>();

export function stopAllGlobalAudio(): void {
  activeAudioInstances.forEach(audio => {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {}
  });
  activeAudioInstances.clear();
}

class HTML5AudioPlayer implements IAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private onEndedCallback: (() => void) | null = null;
  private currentUri = '';
  private isDisposed = false;

  private getAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      
      this.audio.addEventListener('ended', () => {
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('[HTML5AudioPlayer] playback error:', this.audio?.src, e);
      });
    }
    return this.audio;
  }

  async play(uri: string, offsetSec = 0, initialVolume = 1.0): Promise<void> {
    if (this.isDisposed || !uri) return;

    const audio = this.getAudio();
    const resolved = resolveAudioUri(uri);

    // Stop all other audio instances so only ONE track plays at a time
    activeAudioInstances.forEach(other => {
      if (other !== audio) {
        try {
          other.pause();
        } catch {}
      }
    });

    try {
      if (this.currentUri !== resolved || audio.src !== resolved) {
        audio.src = resolved;
        this.currentUri = resolved;
        audio.load();
      }

      audio.volume = Math.max(0, Math.min(1, initialVolume));

      if (offsetSec > 0) {
        try {
          audio.currentTime = offsetSec;
        } catch {}
      }

      activeAudioInstances.add(audio);
      await audio.play();
    } catch (err: any) {
      // Ignore AbortError caused by quick play/pause toggles
      if (err.name !== 'AbortError') {
        console.warn('[HTML5AudioPlayer] play failed:', err);
      }
    }
  }

  async setVolume(volume: number): Promise<void> {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  async pause(): Promise<void> {
    if (this.audio) {
      try {
        this.audio.pause();
      } catch {}
    }
  }

  async resume(): Promise<void> {
    if (this.audio && this.audio.paused && this.currentUri) {
      try {
        await this.audio.play();
        activeAudioInstances.add(this.audio);
      } catch {}
    }
  }

  async seek(offsetSec: number): Promise<void> {
    if (this.audio) {
      try {
        this.audio.currentTime = Math.max(0, offsetSec);
      } catch {}
    }
  }

  async stop(): Promise<void> {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch {}
      activeAudioInstances.delete(this.audio);
    }
  }

  isPlaying(): boolean {
    return Boolean(this.audio && !this.audio.paused && !this.audio.ended);
  }

  setOnEnded(cb: () => void): void {
    this.onEndedCallback = cb;
  }

  dispose(): void {
    this.isDisposed = true;
    this.stop().catch(() => {});
    if (this.audio) {
      this.audio.src = '';
      this.audio = null;
    }
    this.onEndedCallback = null;
  }
}

export function createAudioPlayer(): IAudioPlayer {
  return new HTML5AudioPlayer();
}
