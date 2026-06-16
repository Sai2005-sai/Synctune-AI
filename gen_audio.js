/**
 * gen_audio.js
 * Generates 15 mood-categorized WAV audio files for the AI Video BGM Matcher app.
 * Each file is a rich synthesized tone with harmonics, modulation, and proper fade envelopes.
 *
 * Run from the project root:  node gen_audio.js
 */
const fs   = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const CHANNELS    = 1;
const BITS        = 16;

function writeWAV({ frequency, duration, modulation, outputPath, title }) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const dataSize   = numSamples * CHANNELS * (BITS / 8);
  const buf        = Buffer.alloc(44 + dataSize);

  // ── RIFF / fmt / data headers ────────────────────────────────
  buf.write('RIFF',  0, 'ascii'); buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE',  8, 'ascii');
  buf.write('fmt ', 12, 'ascii'); buf.writeUInt32LE(16,            16);
  buf.writeUInt16LE(1,                               20); // PCM
  buf.writeUInt16LE(CHANNELS,                        22);
  buf.writeUInt32LE(SAMPLE_RATE,                     24);
  buf.writeUInt32LE(SAMPLE_RATE * CHANNELS * BITS / 8, 28);
  buf.writeUInt16LE(CHANNELS * BITS / 8,             32);
  buf.writeUInt16LE(BITS,                            34);
  buf.write('data', 36, 'ascii'); buf.writeUInt32LE(dataSize,      40);

  const PEAK = 0.65;
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // Smooth fade-in / fade-out envelope
    const fadeIn  = Math.min(1, t / 0.18);
    const fadeOut = Math.min(1, (duration - t) / 0.28);
    const env     = fadeIn * fadeOut;

    // Fundamental + 2nd / 3rd / 5th harmonics for richness
    const f  = frequency;
    let s  = Math.sin(2 * Math.PI * f       * t);
    s += 0.42 * Math.sin(2 * Math.PI * f * 2 * t);
    s += 0.18 * Math.sin(2 * Math.PI * f * 3 * t);
    s += 0.08 * Math.sin(2 * Math.PI * f * 5 * t);
    s /= 1.68; // normalise to ±1

    // Per-mood modulation
    let mod = 1;
    if (modulation === 'pulse') {
      // Square-wave amplitude pulsing at 4 Hz (energetic feel)
      mod = 0.55 + 0.45 * (Math.sign(Math.sin(2 * Math.PI * 4 * t)) * 0.5 + 0.5);
    } else if (modulation === 'tremolo') {
      // Slow tremolo at 2.5 Hz (calm / sad feel)
      mod = 0.84 + 0.16 * Math.sin(2 * Math.PI * 2.5 * t);
    } else if (modulation === 'vibrato') {
      // Vibrato: slight pitch wobble at 5 Hz (bright / cinematic feel)
      const vib = Math.sin(2 * Math.PI * 5 * t) * 0.012;
      s  = Math.sin(2 * Math.PI * f       * (1 + vib) * t);
      s += 0.38 * Math.sin(2 * Math.PI * f * 2 * (1 + vib) * t);
      s += 0.14 * Math.sin(2 * Math.PI * f * 3 * (1 + vib) * t);
      s /= 1.52;
    }

    const sample = s * env * mod * PEAK;
    const value  = Math.max(-32767, Math.min(32767, Math.round(sample * 32767)));
    buf.writeInt16LE(value, 44 + i * 2);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buf);
  console.log(`  ✅  ${title.padEnd(20)} → ${path.relative(process.cwd(), outputPath)}`);
}

// ── Track definitions ─────────────────────────────────────────────────────────
const BASE   = path.join(__dirname, '..', 'aivideobgm', 'assets', 'music');
const TRACKS = [
  // HAPPY  — bright major tones (C5 / D5 / E5)
  { mood: 'happy',     file: 'happy_01.wav',     title: 'Golden Sunrise',   frequency: 523.25, duration: 4.0, modulation: 'vibrato' },
  { mood: 'happy',     file: 'happy_02.wav',     title: 'Carefree Walk',    frequency: 587.33, duration: 3.5, modulation: 'tremolo' },
  { mood: 'happy',     file: 'happy_03.wav',     title: 'Bright Steps',     frequency: 659.25, duration: 3.0, modulation: 'vibrato' },

  // SAD    — low minor register (A3 / G3 / F#3)
  { mood: 'sad',       file: 'sad_01.wav',       title: 'Fading Light',     frequency: 220.00, duration: 5.0, modulation: 'tremolo' },
  { mood: 'sad',       file: 'sad_02.wav',       title: 'Quiet Rain',       frequency: 196.00, duration: 4.5, modulation: 'tremolo' },
  { mood: 'sad',       file: 'sad_03.wav',       title: 'Empty Room',       frequency: 185.00, duration: 4.0, modulation: 'vibrato' },

  // ENERGETIC — high punchy tones (A5 / B5 / C6)
  { mood: 'energetic', file: 'energetic_01.wav', title: 'Power Drive',      frequency: 880.00, duration: 3.0, modulation: 'pulse'   },
  { mood: 'energetic', file: 'energetic_02.wav', title: 'Thunder Run',      frequency: 987.77, duration: 2.5, modulation: 'pulse'   },
  { mood: 'energetic', file: 'energetic_03.wav', title: 'Electric Rush',    frequency: 1046.50,duration: 3.5, modulation: 'pulse'   },

  // CALM   — gentle mid-range (C4 / D4 / E4)
  { mood: 'calm',      file: 'calm_01.wav',      title: 'Still Waters',     frequency: 261.63, duration: 6.0, modulation: 'tremolo' },
  { mood: 'calm',      file: 'calm_02.wav',      title: 'Gentle Breeze',    frequency: 293.66, duration: 5.0, modulation: 'tremolo' },
  { mood: 'calm',      file: 'calm_03.wav',      title: 'Soft Glow',        frequency: 329.63, duration: 5.5, modulation: 'vibrato' },

  // CINEMATIC — deep dramatic tones (C3 / D3 / E3)
  { mood: 'cinematic', file: 'cinematic_01.wav', title: 'Epic Rising',      frequency: 130.81, duration: 5.0, modulation: 'tremolo' },
  { mood: 'cinematic', file: 'cinematic_02.wav', title: 'Deep Space',       frequency: 146.83, duration: 6.0, modulation: 'vibrato' },
  { mood: 'cinematic', file: 'cinematic_03.wav', title: 'Grand Finale',     frequency: 164.81, duration: 4.5, modulation: 'tremolo' },
];

console.log('\n🎵  Generating mood audio files…\n');
const moods = [...new Set(TRACKS.map(t => t.mood))];
moods.forEach(mood => {
  console.log(`  ${mood.toUpperCase()}`);
  TRACKS.filter(t => t.mood === mood).forEach(t =>
    writeWAV({ ...t, outputPath: path.join(BASE, t.mood, t.file) })
  );
  console.log('');
});
console.log('✨  Done — 15 audio files written.\n');
