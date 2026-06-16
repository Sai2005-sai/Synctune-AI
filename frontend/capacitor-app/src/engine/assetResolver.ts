/**
 * assetResolver.ts — Web version
 * The asset field is now a plain string path (e.g. '/music/calm/km-healing.mp3')
 * served from the Vite public folder.
 */
export async function resolveAssetUri(asset: any): Promise<string> {
  if (typeof asset === 'string') return asset;
  return '';
}
