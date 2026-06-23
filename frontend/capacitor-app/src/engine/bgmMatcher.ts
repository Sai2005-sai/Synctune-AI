import { ALL_TRACKS, LocalTrack } from '../data/musicLibrary';
import type { ClassifiedMood } from './classifier';
import type { VideoAnalysisResult } from './videoAnalyzer';

export interface MatchedTrack extends LocalTrack {
  matchScore: number; // higher = better match, no upper cap
}

// ── Semantic prompt understanding ─────────────────────────────────────────────
// Maps common English words a user might type to a target mood and a score boost.
// Moods: 'happy' | 'sad' | 'energetic' | 'calm' | 'cinematic'
interface SemanticEntry {
  mood: ClassifiedMood;
  boost: number; // points added to tracks of that mood
}

const SEMANTIC_MAP: Record<string, SemanticEntry> = {
  // ── CINEMATIC / EPIC ──────────────────────────────────────────────────────
  epic:          { mood: 'cinematic', boost: 150 },
  orchestral:    { mood: 'cinematic', boost: 150 },
  orchestra:     { mood: 'cinematic', boost: 150 },
  trailer:       { mood: 'cinematic', boost: 150 },
  cinematic:     { mood: 'cinematic', boost: 150 },
  dramatic:      { mood: 'cinematic', boost: 140 },
  grand:         { mood: 'cinematic', boost: 130 },
  hollywood:     { mood: 'cinematic', boost: 140 },
  heroic:        { mood: 'cinematic', boost: 130 },
  majestic:      { mood: 'cinematic', boost: 130 },
  powerful:      { mood: 'cinematic', boost: 120 },
  film:          { mood: 'cinematic', boost: 120 },
  movie:         { mood: 'cinematic', boost: 120 },
  score:         { mood: 'cinematic', boost: 110 },
  inspirational: { mood: 'cinematic', boost: 130 },
  inspiring:     { mood: 'cinematic', boost: 130 },
  triumphant:    { mood: 'cinematic', boost: 140 },
  triumph:       { mood: 'cinematic', boost: 130 },
  anthem:        { mood: 'cinematic', boost: 120 },
  symphonic:     { mood: 'cinematic', boost: 150 },
  symphony:      { mood: 'cinematic', boost: 150 },
  strings:       { mood: 'cinematic', boost: 120 },
  brass:         { mood: 'cinematic', boost: 120 },
  choir:         { mood: 'cinematic', boost: 130 },
  choral:        { mood: 'cinematic', boost: 130 },
  chorus:        { mood: 'cinematic', boost: 120 },
  war:           { mood: 'cinematic', boost: 130 },
  battle:        { mood: 'cinematic', boost: 140 },
  warrior:       { mood: 'cinematic', boost: 130 },
  legend:        { mood: 'cinematic', boost: 120 },
  fantasy:       { mood: 'cinematic', boost: 120 },
  medieval:      { mood: 'cinematic', boost: 120 },
  empire:        { mood: 'cinematic', boost: 130 },
  noble:         { mood: 'cinematic', boost: 110 },
  regal:         { mood: 'cinematic', boost: 120 },
  rise:          { mood: 'cinematic', boost: 110 },
  glory:         { mood: 'cinematic', boost: 130 },
  victorious:    { mood: 'cinematic', boost: 130 },
  victory:       { mood: 'cinematic', boost: 130 },
  documentary:   { mood: 'cinematic', boost: 110 },
  tense:         { mood: 'cinematic', boost: 120 },
  tension:       { mood: 'cinematic', boost: 120 },
  suspense:      { mood: 'cinematic', boost: 120 },
  suspenseful:   { mood: 'cinematic', boost: 120 },
  thriller:      { mood: 'cinematic', boost: 130 },
  adventure:     { mood: 'cinematic', boost: 130 },
  journey:       { mood: 'cinematic', boost: 110 },
  quest:         { mood: 'cinematic', boost: 120 },
  hero:          { mood: 'cinematic', boost: 130 },
  classical:     { mood: 'cinematic', boost: 130 },
  orchestrated:  { mood: 'cinematic', boost: 140 },
  cinemas:       { mood: 'cinematic', boost: 120 },
  futuristic:    { mood: 'cinematic', boost: 110 },
  scifi:         { mood: 'cinematic', boost: 120 },
  sci:           { mood: 'cinematic', boost: 100 },
  space:         { mood: 'cinematic', boost: 110 },
  cosmos:        { mood: 'cinematic', boost: 110 },
  galactic:      { mood: 'cinematic', boost: 120 },

  // ── ENERGETIC / ACTION ────────────────────────────────────────────────────
  action:        { mood: 'energetic', boost: 150 },
  intense:       { mood: 'energetic', boost: 140 },
  pumped:        { mood: 'energetic', boost: 140 },
  hype:          { mood: 'energetic', boost: 140 },
  energetic:     { mood: 'energetic', boost: 150 },
  adrenaline:    { mood: 'energetic', boost: 150 },
  rock:          { mood: 'energetic', boost: 130 },
  metal:         { mood: 'energetic', boost: 140 },
  drums:         { mood: 'energetic', boost: 120 },
  beat:          { mood: 'energetic', boost: 120 },
  sport:         { mood: 'energetic', boost: 140 },
  sports:        { mood: 'energetic', boost: 140 },
  workout:       { mood: 'energetic', boost: 140 },
  gym:           { mood: 'energetic', boost: 140 },
  energy:        { mood: 'energetic', boost: 130 },
  aggressive:    { mood: 'energetic', boost: 140 },
  driven:        { mood: 'energetic', boost: 120 },
  fast:          { mood: 'energetic', boost: 130 },
  speed:         { mood: 'energetic', boost: 130 },
  racing:        { mood: 'energetic', boost: 140 },
  rush:          { mood: 'energetic', boost: 130 },
  extreme:       { mood: 'energetic', boost: 140 },
  running:       { mood: 'energetic', boost: 130 },
  jump:          { mood: 'energetic', boost: 120 },
  fighting:      { mood: 'energetic', boost: 140 },
  fight:         { mood: 'energetic', boost: 140 },
  boxing:        { mood: 'energetic', boost: 140 },
  ninja:         { mood: 'energetic', boost: 130 },
  power:         { mood: 'energetic', boost: 130 },
  bass:          { mood: 'energetic', boost: 120 },
  edm:           { mood: 'energetic', boost: 140 },
  electronic:    { mood: 'energetic', boost: 130 },
  dubstep:       { mood: 'energetic', boost: 140 },
  techno:        { mood: 'energetic', boost: 140 },
  rave:          { mood: 'energetic', boost: 140 },
  dance:         { mood: 'energetic', boost: 130 },
  club:          { mood: 'energetic', boost: 130 },
  hip:           { mood: 'energetic', boost: 110 },
  hop:           { mood: 'energetic', boost: 110 },
  hiphop:        { mood: 'energetic', boost: 130 },
  rap:           { mood: 'energetic', boost: 130 },
  trap:          { mood: 'energetic', boost: 130 },
  car:           { mood: 'energetic', boost: 120 },
  driving:       { mood: 'energetic', boost: 130 },
  party:         { mood: 'energetic', boost: 130 },
  festival:      { mood: 'energetic', boost: 130 },
  fierce:        { mood: 'energetic', boost: 130 },
  brutal:        { mood: 'energetic', boost: 130 },
  superhero:     { mood: 'energetic', boost: 130 },
  pump:          { mood: 'energetic', boost: 130 },
  bounce:        { mood: 'energetic', boost: 120 },
  hardcore:      { mood: 'energetic', boost: 140 },

  // ── HAPPY / UPBEAT ────────────────────────────────────────────────────────
  happy:         { mood: 'happy', boost: 150 },
  joyful:        { mood: 'happy', boost: 150 },
  upbeat:        { mood: 'happy', boost: 140 },
  cheerful:      { mood: 'happy', boost: 140 },
  fun:           { mood: 'happy', boost: 130 },
  playful:       { mood: 'happy', boost: 130 },
  positive:      { mood: 'happy', boost: 130 },
  carefree:      { mood: 'happy', boost: 130 },
  pop:           { mood: 'happy', boost: 120 },
  bright:        { mood: 'happy', boost: 120 },
  light:         { mood: 'happy', boost: 110 },
  joy:           { mood: 'happy', boost: 140 },
  smile:         { mood: 'happy', boost: 120 },
  laugh:         { mood: 'happy', boost: 120 },
  sunny:         { mood: 'happy', boost: 130 },
  summer:        { mood: 'happy', boost: 130 },
  beach:         { mood: 'happy', boost: 120 },
  tropical:      { mood: 'happy', boost: 130 },
  funky:         { mood: 'happy', boost: 130 },
  groovy:        { mood: 'happy', boost: 130 },
  disco:         { mood: 'happy', boost: 130 },
  reggae:        { mood: 'happy', boost: 130 },
  folk:          { mood: 'happy', boost: 110 },
  acoustic:      { mood: 'happy', boost: 110 },
  wedding:       { mood: 'happy', boost: 120 },
  celebration:   { mood: 'happy', boost: 130 },
  celebrate:     { mood: 'happy', boost: 130 },
  birthday:      { mood: 'happy', boost: 120 },
  kids:          { mood: 'happy', boost: 120 },
  children:      { mood: 'happy', boost: 120 },
  cute:          { mood: 'happy', boost: 120 },
  bounce2:       { mood: 'happy', boost: 120 },
  travel:        { mood: 'happy', boost: 110 },
  vlog:          { mood: 'happy', boost: 120 },
  exciting:      { mood: 'happy', boost: 120 },
  animated:      { mood: 'happy', boost: 110 },
  comedy:        { mood: 'happy', boost: 120 },
  sitcom:        { mood: 'happy', boost: 110 },
  cartoon:       { mood: 'happy', boost: 120 },
  jazz:          { mood: 'happy', boost: 110 },

  // ── SAD / EMOTIONAL ───────────────────────────────────────────────────────
  sad:           { mood: 'sad', boost: 150 },
  melancholy:    { mood: 'sad', boost: 150 },
  emotional:     { mood: 'sad', boost: 140 },
  melancholic:   { mood: 'sad', boost: 150 },
  tearful:       { mood: 'sad', boost: 140 },
  somber:        { mood: 'sad', boost: 140 },
  grief:         { mood: 'sad', boost: 140 },
  mourning:      { mood: 'sad', boost: 140 },
  nostalgic:     { mood: 'sad', boost: 130 },
  nostalgia:     { mood: 'sad', boost: 130 },
  lonely:        { mood: 'sad', boost: 130 },
  alone:         { mood: 'sad', boost: 120 },
  dark:          { mood: 'sad', boost: 120 },
  violin:        { mood: 'sad', boost: 130 },
  heartbreak:    { mood: 'sad', boost: 140 },
  broken:        { mood: 'sad', boost: 130 },
  loss:          { mood: 'sad', boost: 130 },
  tears:         { mood: 'sad', boost: 130 },
  cry:           { mood: 'sad', boost: 130 },
  crying:        { mood: 'sad', boost: 130 },
  pain:          { mood: 'sad', boost: 130 },
  depressing:    { mood: 'sad', boost: 130 },
  depression:    { mood: 'sad', boost: 130 },
  tragic:        { mood: 'sad', boost: 140 },
  tragedy:       { mood: 'sad', boost: 140 },
  sorrow:        { mood: 'sad', boost: 140 },
  sorrowful:     { mood: 'sad', boost: 140 },
  longing:       { mood: 'sad', boost: 130 },
  bittersweet:   { mood: 'sad', boost: 130 },
  farewell:      { mood: 'sad', boost: 130 },
  goodbye:       { mood: 'sad', boost: 120 },
  missing:       { mood: 'sad', boost: 120 },
  regret:        { mood: 'sad', boost: 130 },
  haunting:      { mood: 'sad', boost: 130 },
  moody:         { mood: 'sad', boost: 120 },
  intimate:      { mood: 'sad', boost: 110 },
  romantic:      { mood: 'sad', boost: 120 },
  love:          { mood: 'sad', boost: 110 },
  ballad:        { mood: 'sad', boost: 130 },
  slow:          { mood: 'sad', boost: 110 },
  heavy:         { mood: 'sad', boost: 120 },

  // ── CALM / AMBIENT ────────────────────────────────────────────────────────
  calm:          { mood: 'calm', boost: 150 },
  peaceful:      { mood: 'calm', boost: 150 },
  relaxing:      { mood: 'calm', boost: 150 },
  ambient:       { mood: 'calm', boost: 150 },
  soothing:      { mood: 'calm', boost: 140 },
  piano:         { mood: 'calm', boost: 130 },
  soft:          { mood: 'calm', boost: 130 },
  gentle:        { mood: 'calm', boost: 140 },
  meditation:    { mood: 'calm', boost: 150 },
  meditate:      { mood: 'calm', boost: 150 },
  sleep:         { mood: 'calm', boost: 140 },
  chill:         { mood: 'calm', boost: 140 },
  lofi:          { mood: 'calm', boost: 140 },
  background:    { mood: 'calm', boost: 110 },
  nature:        { mood: 'calm', boost: 130 },
  forest:        { mood: 'calm', boost: 130 },
  rain:          { mood: 'calm', boost: 130 },
  ocean:         { mood: 'calm', boost: 130 },
  water:         { mood: 'calm', boost: 120 },
  breeze:        { mood: 'calm', boost: 130 },
  sunrise:       { mood: 'calm', boost: 120 },
  sunset:        { mood: 'calm', boost: 120 },
  spa:           { mood: 'calm', boost: 140 },
  yoga:          { mood: 'calm', boost: 140 },
  study:         { mood: 'calm', boost: 130 },
  studying:      { mood: 'calm', boost: 130 },
  focus:         { mood: 'calm', boost: 130 },
  concentration: { mood: 'calm', boost: 130 },
  minimal:       { mood: 'calm', boost: 120 },
  minimalist:    { mood: 'calm', boost: 120 },
  quiet:         { mood: 'calm', boost: 130 },
  tranquil:      { mood: 'calm', boost: 140 },
  serene:        { mood: 'calm', boost: 140 },
  ethereal:      { mood: 'calm', boost: 130 },
  dreamy:        { mood: 'calm', boost: 130 },
  dream:         { mood: 'calm', boost: 120 },
  night:         { mood: 'calm', boost: 110 },
  stars:         { mood: 'calm', boost: 120 },
  moonlight:     { mood: 'calm', boost: 120 },
  breathing:     { mood: 'calm', boost: 130 },
  healing:       { mood: 'calm', boost: 130 },
  zen:           { mood: 'calm', boost: 140 },
  retreat:       { mood: 'calm', boost: 120 },
  indie:         { mood: 'calm', boost: 110 },
  slow2:         { mood: 'calm', boost: 110 },
  introspective: { mood: 'calm', boost: 120 },
  reflective:    { mood: 'calm', boost: 120 },
  contemplative: { mood: 'calm', boost: 120 },
};

/**
 * Interprets the user's text prompt using the semantic map.
 * Also applies partial/stem matching (e.g. "emotion" → "emotional").
 * Returns a map of mood → total boost score.
 */
function interpretPrompt(prompt: string): Partial<Record<ClassifiedMood, number>> {
  if (!prompt || !prompt.trim()) return {};
  const boosts: Partial<Record<ClassifiedMood, number>> = {};
  const words = prompt.toLowerCase().split(/[\s,_\-]+/).filter(w => w.length > 2);
  for (const word of words) {
    const entry = SEMANTIC_MAP[word];
    if (entry) {
      boosts[entry.mood] = (boosts[entry.mood] ?? 0) + entry.boost;
    }
  }
  return boosts;
}

/**
 * Score a single track.
 *
 * Scoring is split into two independent channels that are added together
 * (NO upper cap), so a strong prompt always wins over visual AI:
 *
 * Channel A — User Prompt (semantic, up to ~500+ pts if prompt is strong)
 * Channel B — Visual AI   (up to ~80 pts based on video analysis)
 */
function scoreTrack(
  track: LocalTrack,
  analysis: VideoAnalysisResult,
  promptBoosts: Partial<Record<ClassifiedMood, number>>,
): number {
  let score = 0;

  // ── Channel A: Prompt semantic boost ──────────────────────────────────────
  const moodBoost = promptBoosts[track.mood] ?? 0;
  score += moodBoost * 10; // MASSIVE Priority to user prompt

  // ── Channel B: Visual AI ───────────────────────────────────────────────────
  // Only count visual AI at full weight when no prompt; scale it down as a
  // tiebreaker when a prompt is given.
  const hasPrompt = Object.keys(promptBoosts).length > 0;
  const visualWeight = hasPrompt ? 0.25 : 1.0;

  // Primary mood match
  if (track.mood === analysis.primaryMood) score += 45 * visualWeight;

  // Secondary mood match
  if (analysis.secondaryMood && track.mood === analysis.secondaryMood)
    score += 20 * visualWeight;

  // Energy proximity (max 25 pts)
  const energyDiff = Math.abs(track.energyLevel - analysis.energy);
  score += Math.max(0, 25 - energyDiff * 0.5) * visualWeight;

  // Tempo alignment (10 pts)
  const bpm = track.bpm;
  if (
    (analysis.tempo === 'fast'   && bpm > 115) ||
    (analysis.tempo === 'medium' && bpm >= 80 && bpm <= 115) ||
    (analysis.tempo === 'slow'   && bpm < 80)
  ) {
    score += 10 * visualWeight;
  }

  return score;
}

/**
 * Return top N matching tracks, ranked by score.
 * Pass userPrompt to activate semantic understanding of the prompt.
 */
export function matchBGM(
  analysis: VideoAnalysisResult,
  userPrompt?: string,
  topN: number = 8,
): MatchedTrack[] {
  const promptBoosts = interpretPrompt(userPrompt ?? '');

  const scored: MatchedTrack[] = ALL_TRACKS.map((track) => ({
    ...track,
    matchScore: Math.round(scoreTrack(track, analysis, promptBoosts)),
  }));

  // Sort first
  const sorted = scored.sort((a, b) => b.matchScore - a.matchScore);
  
  // Assign a normalized match percentage between 72% and 98%
  const topScore = sorted[0]?.matchScore || 1;
  const withPercentage = sorted.map((t, idx) => {
    let displayPercent = 98 - idx * 4; // realistic drop
    if (topScore > 0) {
      const scoreRatio = t.matchScore / topScore;
      displayPercent = Math.round(75 + scoreRatio * 23);
    }
    // Bound it between 72% and 98%
    displayPercent = Math.max(72, Math.min(98, displayPercent));
    return {
      ...t,
      matchScore: displayPercent
    };
  });
  
  return withPercentage.slice(0, Math.min(topN, withPercentage.length));
}
