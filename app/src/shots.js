// Fixed scenes for screenshots: ?shot=editor shows the page with sample photos
// loaded; ?shot=cover shows the cover alone, filling the viewport. `photo`
// picks the sample (samples/<photo>.jpg), `caption` the title, `layout`,
// `grade` and `size` the rest of the scene. window.__shotReady is set once the
// fonts are in and the scene has painted.
export async function runShot(shot, query, setup) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await setup({
    photo: query.get('photo') ?? 'pier',
    caption: query.get('caption') ?? 'Sunset Heist',
    layout: query.get('layout') ?? 'vice',
    grade: query.get('grade') ?? 'sunset',
    size: query.get('size') ?? 'square',
  });
  try {
    await document.fonts.ready;
  } catch {
    // Fonts may already be ready; the scene still paints.
  }
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
