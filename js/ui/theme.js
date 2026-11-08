// Shared bits: hide touch controls while a modal is open, version tag. Look and feel live in style.css / hud.js.
import { VERSION } from '../version.js';
const CSS = `
body.menu-open #hud,body.menu-open #touch,body.nb-open #hud,body.nb-open #touch{visibility:hidden!important}
.ver{position:fixed;left:50%;bottom:calc(6px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:60;font:10px ui-monospace,Menlo,monospace;letter-spacing:.14em;color:#8fb0c8;opacity:.5;pointer-events:none}`;
export function initTheme() {
  const st = document.createElement('style'); st.textContent = CSS; document.head.append(st);
  const v = document.createElement('div'); v.className = 'ver'; v.textContent = 'ERGOSPHERE ' + VERSION;
  document.body.append(v);
}
