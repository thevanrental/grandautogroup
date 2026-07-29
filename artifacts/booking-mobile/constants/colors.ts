/**
 * Grand Auto Group — Black / Red / White brand palette.
 * Synced from artifacts/booking/src/index.css (dark-first brand).
 */

const colors = {
  light: {
    // Legacy aliases
    text: '#f5f5f5',
    tint: '#D91A27',

    // Core surfaces
    background: '#0d0d0d',
    foreground: '#f5f5f5',

    // Cards / elevated surfaces
    card: '#171717',
    cardForeground: '#f5f5f5',

    // Primary — Grand Auto Red hsl(356 80% 47%)
    primary: '#D91A27',
    primaryForeground: '#ffffff',

    // Secondary
    secondary: '#212121',
    secondaryForeground: '#f5f5f5',

    // Muted
    muted: '#1c1c1c',
    mutedForeground: '#8c8c8c',

    // Accent
    accent: '#212121',
    accentForeground: '#f5f5f5',

    // Destructive
    destructive: '#e53935',
    destructiveForeground: '#ffffff',

    // Borders / inputs
    border: '#242424',
    input: '#242424',
  },

  // Sharp corners to match the angular logo
  radius: 4,
};

export default colors;
