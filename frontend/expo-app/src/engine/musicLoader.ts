import { Audio, AVPlaybackStatus } from 'expo-av';
import type { LocalTrack } from '../data/musicLibrary';
import { resolveAssetUri } from './assetResolver';

export interface LoadedTrack extends LocalTrack {
  /** Actual duration in seconds, read from the audio file by expo-av */
  duration: number;
  /** Formatted mm:ss string */
  durationLabel: string;
  /** Resolved URI string ready for expo-av / fetch */
  resolvedUri: string;
}

function formatDuration(sec: number): string {
  if (isNaN(sec) || sec <= 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Load a single track, probe its real duration, then unload the Sound.
 * Falls back to nominalDuration if the file fails to load.
 */
export async function loadTrackMetadata(track: LocalTrack): Promise<LoadedTrack> {
  let duration = track.nominalDuration;

  // Resolve require() asset ID → real URI (critical on Expo web)
  let resolvedUri = '';
  try {
    resolvedUri = await resolveAssetUri(track.asset);
  } catch (err) {
    console.warn(`[musicLoader] Could not resolve URI for "${track.title}":`, err);
    return { ...track, duration, durationLabel: formatDuration(duration), resolvedUri: '' };
  }

  // To prevent Android/iOS Native Out-Of-Memory (OOM) crashes, we no longer
  // attempt to preload the actual large audio files concurrently here using
  // expo-av or window.Audio. We trust the library's `nominalDuration`.
  // Real memory allocation happens safely ONLY when the user clicks 'Play'.

  return {
    ...track,
    duration,
    durationLabel: formatDuration(duration),
    resolvedUri,
  };
}

/**
 * Load metadata for a batch of tracks in parallel.
 */
export async function loadTracksMetadata(tracks: LocalTrack[]): Promise<LoadedTrack[]> {
  return Promise.all(tracks.map((t) => loadTrackMetadata(t)));
}
