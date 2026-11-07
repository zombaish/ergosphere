const KEY = 'ergosphere.save.v1';
const DEFAULTS = { reduce: false, sens: 1, vignette: 0.6 };
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
export const loadSettings = () => ({ ...DEFAULTS, ...(read().settings || {}) });
export function saveSettings(s) {
  try { const d = read(); d.settings = s; localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
}
