// Pure config core — no browser/node-only imports, so both the CLI gate
// (Node) and the site (Vite) can import it.
export const EMBLEMS = ['comet', 'bolt', 'star', 'ring', 'delta', 'phoenix'];
export const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

// The choosable ships. baseHue = the model's dominant paint hue (deg), so a
// given `color` hue-shifts every ship predictably to the same target.
export const SHIPS = [
  { id: 'fighter',     file: 'fighter.glb',     label: 'Fighter',     baseHue: 25 },
  { id: 'interceptor', file: 'interceptor.glb', label: 'Interceptor', baseHue: 330 },
  { id: 'hauler',      file: 'hauler.glb',      label: 'Hauler',      baseHue: 140 },
  { id: 'scout',       file: 'scout.glb',       label: 'Scout',       baseHue: 48 },
];
export const SHIP_IDS = SHIPS.map((s) => s.id);
export const DEFAULT_SHIP = 'fighter';
export const DEFAULTS = { shipName: 'Nebula Runner', color: '#22d3ee', shipModel: DEFAULT_SHIP, emblem: 'comet' };

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// Rotation (radians) to turn a model of baseHue° into the hue of `color`.
// Greyscale/invalid colour → 0 (leave the baked paint alone).
export function hueShiftFor(color, baseHue) {
  const m = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(typeof color === 'string' ? color : '');
  if (!m) return 0;
  const r = parseInt(m[1], 16) / 255, g = parseInt(m[2], 16) / 255, b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (sat < 0.15) return 0;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return ((h - baseHue) * Math.PI) / 180;
}

// Strict — the pre-flight gate. Returns every problem it finds.
export function validateConfig(cfg) {
  if (!isObject(cfg)) return { ok: false, errors: ['config must be a JSON object'] };
  const errors = [];
  const name = typeof cfg.shipName === 'string' ? cfg.shipName.trim() : '';
  if (name.length < 1 || name.length > 24) {
    errors.push('shipName must be a non-empty string of at most 24 characters');
  }
  if (typeof cfg.color !== 'string' || !COLOR_RE.test(cfg.color)) {
    errors.push('color must be a hex string like #22d3ee');
  }
  if (typeof cfg.shipModel !== 'string' || !SHIP_IDS.includes(cfg.shipModel)) {
    errors.push(`shipModel must be one of: ${SHIP_IDS.join(', ')}`);
  }
  if (typeof cfg.emblem !== 'string' || !EMBLEMS.includes(cfg.emblem)) {
    errors.push(`emblem must be one of: ${EMBLEMS.join(', ')}`);
  }
  return { ok: errors.length === 0, errors };
}

// Lenient — the browser. Always returns usable params so a bad config
// (which the gate would have blocked anyway) never white-screens the site.
export function toRenderParams(cfg) {
  const raw = isObject(cfg) ? cfg : {};
  const shipName =
    typeof raw.shipName === 'string' && raw.shipName.trim() ? raw.shipName.trim().slice(0, 24) : DEFAULTS.shipName;
  const color = typeof raw.color === 'string' && COLOR_RE.test(raw.color) ? raw.color : DEFAULTS.color;
  const shipModel = typeof raw.shipModel === 'string' && SHIP_IDS.includes(raw.shipModel) ? raw.shipModel : DEFAULTS.shipModel;
  const emblem = typeof raw.emblem === 'string' && EMBLEMS.includes(raw.emblem) ? raw.emblem : DEFAULTS.emblem;
  return { shipName, color, shipModel, emblem };
}
