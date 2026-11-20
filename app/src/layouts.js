// Panel layouts and export sizes. A layout is a list of panel rectangles in
// fractions of the cover (x, y, w, h); the cover fills its panels with the
// photos in order, so the first panels are the ones every layout uses.
export const LAYOUTS = {
  vice: {
    label: 'Vice',
    hint: 'Hero panel over two below',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.6 },
      { x: 0, y: 0.6, w: 0.5, h: 0.4 },
      { x: 0.5, y: 0.6, w: 0.5, h: 0.4 },
    ],
  },
  streets: {
    label: 'Streets',
    hint: 'Four panels in a grid',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  solo: {
    label: 'Solo',
    hint: 'One full-bleed photo',
    panels: [{ x: 0, y: 0, w: 1, h: 1 }],
  },
};

// The common post sizes the bounty asks for.
export const SIZES = {
  square: { label: 'Square', w: 1080, h: 1080, file: '1080x1080' },
  portrait: { label: 'Portrait', w: 1080, h: 1350, file: '1080x1350' },
  wide: { label: 'Wide', w: 1920, h: 1080, file: '1920x1080' },
};
