/**
 * musicLoader.ts — Web version
 * Asset paths are now plain strings served from /public/music.
 * No expo-av dependency.
 */
import type { LocalTrack } from '../data/musicLibrary';

export interface LoadedTrack extends LocalTrack {
  duration: number;
  durationLabel: string;
  resolvedUri: string;
}

export type LoadedTrackResult = LoadedTrack;

function formatDuration(sec: number): string {
  if (isNaN(sec) || sec <= 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export async function loadTrackMetadata(track: LocalTrack): Promise<LoadedTrack> {
  const duration = track.nominalDuration ?? 0;
  // asset is now a plain string path like '/music/calm/km-healing.mp3'
  const resolvedUri = typeof track.asset === 'string' ? track.asset : '';
  return { ...track, duration, durationLabel: formatDuration(duration), resolvedUri };
}

export async function loadTracksMetadata(tracks?: LocalTrack[]): Promise<LoadedTrack[]> {
  const { ALL_TRACKS } = await import('../data/musicLibrary');
  const list = tracks ?? ALL_TRACKS;
  return Promise.all(list.map(loadTrackMetadata));
}
