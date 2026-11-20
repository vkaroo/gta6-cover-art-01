// Draws the cover: the layout's panels filled with their photos, each under
// the chosen colour grade, a diagonal neon slash across the hero panel, and the
// caption in bold display lettering over a dark foot band.
//
// `state` is { layout, grade, title, subtitle, panels }, where panels is an
// array of { image, zoom, ox, oy } — image is an HTMLImageElement or null,
// zoom a scale factor, ox/oy a pan in cover pixels. `options.selection` is the
// index of the panel the editor has selected, drawn as an outline on the
// preview only; exports pass nothing, so no outline is ever exported.
import { GRADES } from './grades.js';
import { LAYOUTS } from './layouts.js';

function panelRects(width, height, layout) {
  const gap = Math.max(4, Math.round(Math.min(width, height) * 0.006));
  return layout.panels.map((p) => ({
    x: p.x * width + gap,
    y: p.y * height + gap,
    w: p.w * width - gap * 2,
    h: p.h * height - gap * 2,
  }));
}

function drawPhoto(ctx, image, rect, slot, grade) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (image) {
    const base = Math.max(w / image.naturalWidth, h / image.naturalHeight);
    const scale = base * (slot.zoom || 1);
    const pw = image.naturalWidth * scale;
    const ph = image.naturalHeight * scale;
    const cx = x + w / 2 + (slot.ox || 0);
    const cy = y + h / 2 + (slot.oy || 0);
    ctx.filter = grade.filter;
    ctx.drawImage(image, cx - pw / 2, cy - ph / 2, pw, ph);
    ctx.filter = 'none';
  } else {
    const empty = ctx.createLinearGradient(x, y, x, y + h);
    empty.addColorStop(0, '#3a2350');
    empty.addColorStop(1, '#160b24');
    ctx.fillStyle = empty;
    ctx.fillRect(x, y, w, h);
  }
  // Grade wash: warm top, deep colour at the foot.
  const wash = ctx.createLinearGradient(x, y, x, y + h);
  wash.addColorStop(0, grade.top);
  wash.addColorStop(1, grade.bottom);
  ctx.fillStyle = wash;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function drawSun(ctx, rect, grade) {
  if (!grade.sun) return;
  const cx = rect.x + rect.w * 0.8;
  const cy = rect.y + rect.h * 0.24;
  const r = Math.min(rect.w, rect.h) * 0.17;
  const glow = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  glow.addColorStop(0, 'rgba(255, 196, 110, 0.95)');
  glow.addColorStop(0.55, 'rgba(255, 120, 90, 0.55)');
  glow.addColorStop(1, 'rgba(255, 120, 90, 0)');
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSlash(ctx, rect, grade) {
  // Two thin diagonal neon stripes tucked into the hero panel's top-right
  // corner: an accent, not a wash across the photo.
  const { x, y, w, h } = rect;
  const band = ctx.createLinearGradient(x + w * 0.7, y, x + w, y + h * 0.4);
  band.addColorStop(0, grade.accent);
  band.addColorStop(1, '#ff2eb4');
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = band;
  ctx.lineCap = 'butt';
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = Math.max(6, Math.min(w, h) * 0.03);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.66, y - h * 0.05);
  ctx.lineTo(x + w * 1.02, y + h * 0.42);
  ctx.stroke();
  ctx.globalAlpha = 0.22;
  ctx.lineWidth = Math.max(3, Math.min(w, h) * 0.012);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.72, y - h * 0.05);
  ctx.lineTo(x + w * 1.05, y + h * 0.38);
  ctx.stroke();
  ctx.restore();
}

function drawTitleBand(ctx, width, height, state, grade) {
  const bandTop = height * 0.72;
  const shade = ctx.createLinearGradient(0, bandTop, 0, height);
  shade.addColorStop(0, 'rgba(6, 2, 12, 0)');
  shade.addColorStop(0.45, 'rgba(6, 2, 12, 0.72)');
  shade.addColorStop(1, 'rgba(6, 2, 12, 0.92)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, bandTop, width, height - bandTop);

  const subtitle = (state.subtitle || '').trim().toUpperCase();
  const title = (state.title || '').trim().toUpperCase();
  const cx = width / 2;

  if (subtitle) {
    let subSize = height * 0.032;
    ctx.font = `${subSize}px "Bebas Neue", sans-serif`;
    try {
      ctx.letterSpacing = `${Math.round(subSize * 0.32)}px`;
    } catch {
      // letterSpacing is Chrome-only; without it the subtitle still draws.
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = grade.accent;
    ctx.fillText(subtitle, cx, height - height * 0.175);
    try {
      ctx.letterSpacing = '0px';
    } catch {
      // See above.
    }
  }

  if (!title) return;
  let size = height * 0.105;
  ctx.font = `${size}px Anton, sans-serif`;
  while (ctx.measureText(title).width > width * 0.92 && size > 16) {
    size -= 2;
    ctx.font = `${size}px Anton, sans-serif`;
  }
  ctx.save();
  // A slight forward slant, the poster's lean.
  ctx.transform(1, 0, -0.05, 1, size * 0.03, 0);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(8, 2, 14, 0.9)';
  ctx.lineWidth = Math.max(3, size * 0.09);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = size * 0.18;
  ctx.shadowOffsetY = size * 0.04;
  ctx.strokeText(title, cx, height - height * 0.055);
  ctx.fillText(title, cx, height - height * 0.055);
  ctx.restore();
}

function drawVignette(ctx, width, height) {
  const glow = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.42,
    width / 2, height / 2, Math.max(width, height) * 0.72,
  );
  glow.addColorStop(0, 'rgba(0, 0, 0, 0)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0.32)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
}

/** Renders `state` onto `canvas` at the canvas's own pixel size. */
export function drawCover(canvas, state, options = {}) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const layout = LAYOUTS[state.layout] || LAYOUTS.vice;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const rects = panelRects(width, height, layout);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#0d0714';
  ctx.fillRect(0, 0, width, height);

  rects.forEach((rect, i) => {
    drawPhoto(ctx, state.panels[i] ? state.panels[i].image : null, rect, state.panels[i] || {}, grade);
    if (i === 0) {
      drawSun(ctx, rect, grade);
      drawSlash(ctx, rect, grade);
    }
  });

  drawTitleBand(ctx, width, height, state, grade);
  drawVignette(ctx, width, height);

  if (typeof options.selection === 'number') {
    const rect = rects[options.selection];
    if (rect) {
      ctx.save();
      ctx.strokeStyle = '#39d5ff';
      ctx.lineWidth = Math.max(3, Math.min(width, height) * 0.005);
      ctx.setLineDash([14, 8]);
      ctx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);
      ctx.restore();
    }
  }
}
