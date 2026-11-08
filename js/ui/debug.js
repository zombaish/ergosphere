// Debug console: ` key, or add ?debug to the URL for an on-screen DBG button. Buttons only (phone friendly).
const CSS = `#dbg{position:fixed;left:8px;right:8px;bottom:8px;z-index:50;background:rgba(3,5,12,.95);border:1px solid var(--bd);border-radius:10px;padding:8px;font:11px ui-monospace,monospace;color:#cfe9ff}
#dbg[hidden]{display:none}#dbg .r{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-bottom:6px}
#dbg b{width:52px;color:#7fe8ff;font-weight:400}#dbg button{padding:6px 9px;font-size:11px;letter-spacing:0;border-radius:6px}
#dbg button.on{border-color:#7fe8ff;color:#7fe8ff}#dbgbtn{position:fixed;left:50%;bottom:30px;transform:translateX(-50%);z-index:49;padding:4px 10px;font-size:10px}`;
export function initDebug(api) {
  const st = document.createElement('style'); st.textContent = CSS; document.head.append(st);
  const root = document.createElement('div'); root.id = 'dbg'; root.hidden = true; document.body.append(root);
  const btn = (p, label, fn) => { const b = document.createElement('button'); b.textContent = label; b.onclick = () => { fn(b); }; p.append(b); return b; };
  const row = (name, items) => {
    const r = document.createElement('div'); r.className = 'r'; r.innerHTML = '<b>' + name + '</b>'; root.append(r);
    for (const [l, f] of items) btn(r, l, f);
  };
  row('Static', [0, 0.25, 0.5, 0.75, 1].map(v => [String(v), () => { api.state().static = v; }]));
  row('Hold', [['freeze', b => { const s = api.state(); s.stFreeze = !s.stFreeze; b.classList.toggle('on', s.stFreeze); }]]);
  row('W', [0, 1, 2, 3, 4, 5, 6].map(w => [String(w), () => { Object.assign(api.state().wl, { w, tgt: w, w0: w }); }]));
  row('Room', api.rooms.map(r => [r.id, () => api.tp(r)]));
  row('', [['close', () => toggle(false)]]);
  const toggle = on => {
    root.hidden = on === undefined ? !root.hidden : !on;
    document.body.classList.toggle('dbg-open', !root.hidden);
    if (!root.hidden) document.exitPointerLock?.();
  };
  addEventListener('keydown', e => { if (e.code === 'Backquote') { e.preventDefault(); toggle(); } });
  if (location.search.includes('debug')) { const b = btn(document.body, 'DBG', () => toggle()); b.id = 'dbgbtn'; }
}
