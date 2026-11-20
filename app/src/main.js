// Wires the page: pick photos per panel, crop and position them by dragging,
// choose a layout, a colour grade and an export size, type a caption, and
// export the cover as a PNG. A `?shot=` query sets up a fixed scene for a
// screenshot instead (./shots.js).
import { drawCover } from './cover.js';
import { LAYOUTS, SIZES } from './layouts.js';
import { GRADES } from './grades.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const status = document.getElementById('status');
const photoInput = document.getElementById('photo');
const zoomInput = document.getElementById('zoom');

const state = {
  layout: 'vice',
  grade: 'sunset',
  size: 'square',
  title: 'Sunset Heist',
  subtitle: 'Neon Nights',
  selected: 0,
  panels: [
    { image: null, sample: 'pier', zoom: 1, ox: 0, oy: 0 },
    { image: null, sample: 'boulevard', zoom: 1, ox: 0, oy: 0 },
    { image: null, sample: 'boulevard', zoom: 1, ox: 0, oy: 0 },
    { image: null, sample: 'pier', zoom: 1, ox: 0, oy: 0 },
  ],
};

function panelCount() {
  return (LAYOUTS[state.layout] || LAYOUTS.vice).panels.length;
}

function redraw() {
  const size = SIZES[state.size];
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  // The selection outline is an editor aid: it is drawn on the preview only,
  // never on a cover shot or an export.
  drawCover(canvas, state, state.selected >= 0 ? { selection: state.selected } : {});
}

function selectedSlot() {
  return state.panels[state.selected];
}

function clampPan(slot) {
  if (!slot.image) return;
  const rect = currentRects()[state.selected];
  if (!rect) return;
  const base = Math.max(rect.w / slot.image.naturalWidth, rect.h / slot.image.naturalHeight);
  const pw = slot.image.naturalWidth * base * slot.zoom;
  const ph = slot.image.naturalHeight * base * slot.zoom;
  const maxX = Math.max(0, (pw - rect.w) / 2);
  const maxY = Math.max(0, (ph - rect.h) / 2);
  slot.ox = Math.max(-maxX, Math.min(maxX, slot.ox));
  slot.oy = Math.max(-maxY, Math.min(maxY, slot.oy));
}

function currentRects() {
  const layout = LAYOUTS[state.layout] || LAYOUTS.vice;
  const gap = Math.max(4, Math.round(Math.min(canvas.width, canvas.height) * 0.006));
  return layout.panels.map((p) => ({
    x: p.x * canvas.width + gap,
    y: p.y * canvas.height + gap,
    w: p.w * canvas.width - gap * 2,
    h: p.h * canvas.height - gap * 2,
  }));
}

/** Loads an image from a URL, resolving to the image once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function loadSampleInto(slot, name) {
  return loadImage(`samples/${name}.jpg`).then((img) => {
    slot.image = img;
    slot.sample = name;
    slot.zoom = 1;
    slot.ox = 0;
    slot.oy = 0;
  });
}

function refreshPanelButtons() {
  document.querySelectorAll('[data-panel]').forEach((button) => {
    const index = Number(button.dataset.panel);
    button.classList.toggle('active', index === state.selected);
    button.disabled = index >= panelCount();
  });
  if (state.selected < 0) {
    document.getElementById('selected-label').textContent = 'No panel selected';
    return;
  }
  const slot = selectedSlot();
  zoomInput.value = String(Math.round((slot.zoom || 1) * 100));
  document.getElementById('zoom-value').textContent = `${Math.round((slot.zoom || 1) * 100)}%`;
  document.getElementById('selected-label').textContent = `Panel ${state.selected + 1} of ${panelCount()}`;
}

function refreshGroup(groupId, value) {
  document.querySelectorAll(`#${groupId} [data-value]`).forEach((button) => {
    button.classList.toggle('active', button.dataset.value === value);
  });
}

function bindGroup(groupId, onPick) {
  document.querySelectorAll(`#${groupId} [data-value]`).forEach((button) => {
    button.addEventListener('click', () => onPick(button.dataset.value));
  });
}

photoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const slot = selectedSlot();
  slot.image = await loadImage(URL.createObjectURL(file));
  slot.sample = null;
  slot.zoom = 1;
  slot.ox = 0;
  slot.oy = 0;
  redraw();
  status.textContent = `Photo loaded into panel ${state.selected + 1}.`;
});

document.getElementById('sample-pier').addEventListener('click', async () => {
  await loadSampleInto(selectedSlot(), 'pier');
  redraw();
});
document.getElementById('sample-boulevard').addEventListener('click', async () => {
  await loadSampleInto(selectedSlot(), 'boulevard');
  redraw();
});
document.getElementById('fill-all').addEventListener('click', () => {
  const slot = selectedSlot();
  if (!slot.image) return;
  state.panels.forEach((other) => {
    other.image = slot.image;
    other.sample = slot.sample;
    other.zoom = 1;
    other.ox = 0;
    other.oy = 0;
  });
  redraw();
  status.textContent = 'One photo now fills every panel.';
});

zoomInput.addEventListener('input', () => {
  const slot = selectedSlot();
  slot.zoom = Number(zoomInput.value) / 100;
  clampPan(slot);
  document.getElementById('zoom-value').textContent = `${zoomInput.value}%`;
  redraw();
});
document.getElementById('reset-pan').addEventListener('click', () => {
  const slot = selectedSlot();
  slot.zoom = 1;
  slot.ox = 0;
  slot.oy = 0;
  refreshPanelButtons();
  redraw();
});

document.querySelectorAll('[data-panel]').forEach((button) => {
  button.addEventListener('click', () => {
    state.selected = Number(button.dataset.panel);
    refreshPanelButtons();
    redraw();
  });
});

bindGroup('layout-group', (value) => {
  state.layout = value;
  if (state.selected >= panelCount()) state.selected = 0;
  refreshGroup('layout-group', value);
  refreshPanelButtons();
  redraw();
});
bindGroup('grade-group', (value) => {
  state.grade = value;
  refreshGroup('grade-group', value);
  redraw();
});
bindGroup('size-group', (value) => {
  state.size = value;
  refreshGroup('size-group', value);
  redraw();
});

titleInput.addEventListener('input', () => {
  state.title = titleInput.value;
  redraw();
});
subtitleInput.addEventListener('input', () => {
  state.subtitle = subtitleInput.value;
  redraw();
});

document.getElementById('export').addEventListener('click', () => {
  const size = SIZES[state.size];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, state);
  off.toBlob((blob) => {
    if (!blob) {
      status.textContent = 'Export failed — try again.';
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sunset-cover-${size.file}.png`;
    a.click();
    status.textContent = `Saved sunset-cover-${size.file}.png (${size.w} x ${size.h}).`;
  }, 'image/png');
});

// Drag on the preview to pan the selected panel's photo.
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const px = (e.clientX - rect.left) * (canvas.width / rect.width);
  const py = (e.clientY - rect.top) * (canvas.height / rect.height);
  const hit = currentRects().findIndex((r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h);
  if (hit !== -1 && hit !== state.selected) {
    state.selected = hit;
    refreshPanelButtons();
    redraw();
  }
  if (hit !== -1) {
    drag = { x: px, y: py, ox: selectedSlot().ox, oy: selectedSlot().oy };
    canvas.setPointerCapture(e.pointerId);
  }
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const rect = canvas.getBoundingClientRect();
  const px = (e.clientX - rect.left) * (canvas.width / rect.width);
  const py = (e.clientY - rect.top) * (canvas.height / rect.height);
  const slot = selectedSlot();
  slot.ox = drag.ox + (px - drag.x);
  slot.oy = drag.oy + (py - drag.y);
  clampPan(slot);
  redraw();
});
canvas.addEventListener('pointerup', () => {
  drag = null;
});

async function loadDefaults() {
  await Promise.all(state.panels.map((slot) => loadSampleInto(slot, slot.sample)));
  redraw();
  refreshPanelButtons();
}

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, async (scene) => {
    state.layout = LAYOUTS[scene.layout] ? scene.layout : 'vice';
    state.grade = GRADES[scene.grade] ? scene.grade : 'sunset';
    state.size = SIZES[scene.size] ? scene.size : 'square';
    state.title = scene.caption;
    titleInput.value = scene.caption;
    subtitleInput.value = 'Neon Nights';
    state.subtitle = 'Neon Nights';
    const other = scene.photo === 'pier' ? 'boulevard' : 'pier';
    const names = [scene.photo, other, scene.photo, other];
    await Promise.all(state.panels.map((slot, i) => loadSampleInto(slot, names[i])));
    // A cover shot shows no selection outline; an editor shot keeps panel 1
    // selected so the shot shows the editor at work.
    state.selected = shot === 'cover' ? -1 : 0;
    // In a wide hero panel the photo's subject can be cropped out at the top;
    // nudge the hero photo down so faces stay in frame.
    redraw();
    const rects = currentRects();
    if (rects[0] && rects[0].w / rects[0].h > 1.8) {
      state.panels[0].oy = Math.round(rects[0].h * 0.4);
    }
    refreshGroup('layout-group', state.layout);
    refreshGroup('grade-group', state.grade);
    refreshGroup('size-group', state.size);
    refreshPanelButtons();
    redraw();
  });
} else {
  refreshGroup('layout-group', state.layout);
  refreshGroup('grade-group', state.grade);
  refreshGroup('size-group', state.size);
  loadDefaults();
}
