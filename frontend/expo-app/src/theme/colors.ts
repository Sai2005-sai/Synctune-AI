/**
 * SyncTune AI — Color tokens from Magic Pattern design
 * Exact values from tailwind.config.js + index.css
 */
export const Colors = {
  // Backgrounds
  background:      '#0A0A1A',   // dark-bg
  surface:         '#12122A',   // dark-surface
  surfaceElevated: '#1A1A30',
  card:            '#161628',
  border:          'rgba(255,255,255,0.10)',
  borderLight:     'rgba(255,255,255,0.06)',

  // Accent palette (Magic Pattern exact)
  primary:         '#8B5CF6',   // accent-purple
  primaryLight:    '#A78BFA',
  primaryDark:     '#7C3AED',
  secondary:       '#06B6D4',   // accent-cyan
  secondaryLight:  '#22D3EE',
  accentBlue:      '#3B82F6',   // accent-blue

  // Gradient (Purple → Blue → Cyan)
  gradientColors:  ['#8B5CF6', '#3B82F6', '#06B6D4'] as const,
  gradientPrimary: ['#8B5CF6', '#7C3AED'] as const,
  gradientCyan:    ['#06B6D4', '#3B82F6'] as const,
  gradientAnalyze: ['#8B5CF6', '#06B6D4'] as const,
  gradientCard:    ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] as const,
  gradientHero:    ['#1A0040', '#0A0A1A'] as const,

  // Text
  textPrimary:   '#FFFFFF',
  textSecondary: '#8B8BA7',   // text-secondary exact
  textMuted:     '#5A5A7A',
  textInverse:   '#0A0A1A',

  // Status
  success: '#10B981',  // status-success
  warning: '#F59E0B',  // status-warning
  error:   '#EF4444',  // status-error

  // Glass
  glass:       'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.10)',

  // Mood colors
  moodHappy:     '#F59E0B',
  moodSad:       '#3B82F6',
  moodEnergetic: '#F97316',
  moodCalm:      '#10B981',
  moodCinematic: '#8B5CF6',
  moodPeaceful:  '#10B981',
  moodRomantic:  '#EC4899',
  moodDark:      '#EF4444',
  moodCorporate: '#06B6D4',
  moodVlog:      '#F97316',
  moodNature:    '#22C55E',

  // Overlay
  overlay:      'rgba(0,0,0,0.60)',
  overlayHeavy: 'rgba(0,0,0,0.85)',
};
