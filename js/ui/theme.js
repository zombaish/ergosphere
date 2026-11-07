// Shared look: colours, touch-control skin, modal hiding, version tag. Overrides older CSS on purpose.
import { VERSION } from '../version.js';
const CSS = `
:root{--c:#7fe8ff;--bd:rgba(127,232,255,.35);--bg:rgba(7,12,24,.62)}
input[type=range],input[type=checkbox]{accent-color:#7fe8ff}
body.menu-open #hud,body.menu-open #touch,body.nb-open #hud,body.nb-open #touch{visibility:hidden!important}
#msg{position:fixed!important;left:12px!important;right:auto!important;top:122px!important;bottom:auto!important;transform:none!important;max-width:58vw;margin:0!important;padding:5px 10px!important;text-align:left!important;font:11px/1.4 ui-monospace,Menlo,monospace!important;letter-spacing:.03em;color:#bfeaff!important;background:var(--bg);border:1px solid var(--bd);border-radius:8px;pointer-events:none;z-index:6}
#msg:empty{display:none!important}
#stick{border:1px solid var(--bd)!important;background:rgba(7,12,24,.25)!important;box-shadow:none!important}
#nub{background:rgba(127,232,255,.3)!important;border:1px solid var(--c)!important;box-shadow:none!important}
#btns button{border-radius:10px!important;border:1px solid var(--bd)!important;background:var(--bg)!important;color:#cfe9ff!important;font:600 9px ui-monospace,Menlo,monospace!important;letter-spacing:.08em!important;box-shadow:none!important}
#btns button:active{background:rgba(127,232,255,.25)!important}
#btns button[data-b=portal],#btns button[data-b=rewind]{opacity:.35}
#go{border:1px solid var(--c)!important;background:rgba(127,232,255,.12)!important;color:var(--c)!important;border-radius:10px!important;letter-spacing:.2em;font-family:ui-monospace,Menlo,monospace}
.ver{position:fixed;left:50%;bottom:calc(6px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:60;font:10px ui-monospace,Menlo,monospace;letter-spacing:.14em;color:#8fb0c8;opacity:.5;pointer-events:none}`;

export function initTheme() {
  const st = document.createElement('style'); st.textContent = CSS; document.head.append(st);
  const v = document.createElement('div'); v.className = 'ver'; v.textContent = 'ERGOSPHERE ' + VERSION;
  document.body.append(v);
}
