// Colour grades for the cover: each grade names its canvas filter, its accent
// colour for the lettering, and the overlay washes drawCover paints over every
// photo. All four are the app's own look — a sunset or neon grade in the spirit
// of the poster's genre, never a copied palette from any game.
export const GRADES = {
  sunset: {
    label: 'Sunset',
    accent: '#ffb347',
    filter: 'saturate(1.3) contrast(1.07)',
    top: 'rgba(255, 176, 92, 0.10)',
    bottom: 'rgba(255, 64, 140, 0.34)',
    sun: true,
  },
  neon: {
    label: 'Neon',
    accent: '#39d5ff',
    filter: 'saturate(1.45) contrast(1.1)',
    top: 'rgba(57, 213, 255, 0.16)',
    bottom: 'rgba(255, 46, 180, 0.30)',
    sun: false,
  },
  palm: {
    label: 'Palm',
    accent: '#5ff2c8',
    filter: 'saturate(1.2) contrast(1.05)',
    top: 'rgba(0, 190, 160, 0.16)',
    bottom: 'rgba(0, 64, 92, 0.34)',
    sun: true,
  },
  noir: {
    label: 'Noir',
    accent: '#f2f2f2',
    filter: 'grayscale(0.92) contrast(1.14) brightness(1.06)',
    top: 'rgba(255, 240, 210, 0.08)',
    bottom: 'rgba(10, 10, 18, 0.30)',
    sun: false,
  },
};
