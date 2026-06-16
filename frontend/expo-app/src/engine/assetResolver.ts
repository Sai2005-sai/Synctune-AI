/**
 * assetResolver.ts
 *
 * Cross-platform helper that converts a Metro require() asset reference
 * (which may be a number, object, or string) into a usable URI string
 * for expo-av and fetch().
 *
 * WHY THIS IS NEEDED
 * ──────────────────
 * On Expo web:
 *   require('../../assets/music/foo.mp3')  →  numeric module ID  e.g. 42
 *   Audio.Sound.createAsync(42)            →  ❌ silent / fails
 *   Audio.Sound.createAsync({ uri })       →  ✅ plays correctly
 *
 * On Expo native:
 *   require(...)  →  already a resolvable asset reference for expo-av
 *   Audio.Sound.createAsync(ref)           →  ✅ works directly
 *   BUT passing { uri } from expo-asset also works, so we use the same
 *   path on both platforms for simplicity.
 *
 * expo-asset (a core Expo package, always available) downloads/registers
 * the asset and returns the real localUri / uri for us.
 */

import { Asset } from 'expo-asset';

/**
 * Resolve any Metro asset reference to a playable/fetchable URI string.
 *
 * @param asset  The result of require() — may be number | string | object
 * @returns      A URI string suitable for Audio.Sound.createAsync({ uri }) or fetch()
 */
export async function resolveAssetUri(asset: any): Promise<string> {
  // Already a plain URI string — return as-is (edge case)
  if (typeof asset === 'string') return asset;

  try {
    const resolved = await Asset.fromModule(asset).downloadAsync();
    // localUri is available on native; uri is a CDN/static path on web
    const uri = resolved.localUri ?? resolved.uri;
    if (!uri) throw new Error('Asset resolved to empty URI');
    return uri;
  } catch (err) {
    console.warn('[assetResolver] Failed to resolve asset:', err);
    throw err;
  }
}
