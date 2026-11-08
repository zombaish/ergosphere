// HUD: room, W gauge, tip, inventory, prompt, toasts, reading panel, reset bar, touch buttons.
const CSS = `
#hud{position:fixed;inset:0;pointer-events:none;z-index:5;font:12px/1.4 ui-monospace,Menlo,monospace;color:#cfe9ff;text-shadow:0 1px 3px #000}
#hud[hidden]{display:none}
#hud .top{position:absolute;top:10px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:5px}
#hud .room{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#9fc4d8;white-space:nowrap}
#hud .wc{background:var(--bg);border:1px solid var(--bd);border-radius:8px;padding:5px 12px 4px;text-align:center;letter-spacing:.12em;font-size:11px}
#hud .wp{display:flex;gap:3px;margin-bottom:3px}
#hud .wp i{width:14px;height:5px;border-radius:2px;background:var(--c);opacity:.2}
#hud .sb{width:110px;height:4px;border-radius:2px;background:rgba(255,106,74,.15);overflow:hidden;opacity:0;transition:opacity .4s}
#hud .sb i{display:block;height:100%;width:0;background:#ffa040}
#hud .tl{position:absolute;top:10px;left:12px;display:flex;flex-direction:column;gap:6px;max-width:28vw}
#hud .inv{display:flex;gap:6px;flex-wrap:wrap}
#hud .chip{border:1px solid #ffb030;color:#ffd080;padding:1px 7px;border-radius:6px;background:var(--bg);font-size:11px}
#hud .nbh{opacity:.5;font-size:11px}
#hud .nbh.new{opacity:1;color:#ffd080}
#hud.touch .nbh{display:none}
#hud .tip{position:absolute;top:80px;left:50%;transform:translateX(-50%);width:min(60vw,270px);text-align:center;background:var(--bg);border:1px solid rgba(255,208,128,.5);border-radius:8px;padding:6px 10px;font-size:11px;color:#ffd080}
#hud .tip:empty{display:none}
#hud .toasts{position:absolute;left:50%;bottom:30%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:4px;width:90vw}
#hud .toast{background:var(--bg);border:1px solid var(--bd);padding:4px 12px;border-radius:8px;transition:opacity .5s;text-align:center}
#hud .prompt{position:absolute;left:50%;bottom:19%;transform:translateX(-50%);background:var(--bg);padding:6px 14px;border:1px solid var(--c);border-radius:8px;white-space:nowrap;color:var(--c)}
#hud .prompt:empty{display:none}
#hud .say{display:none;position:absolute;top:22%;left:50%;transform:translateX(-50%);width:min(86vw,420px);background:rgba(7,12,24,.88);border:1px solid var(--bd);border-radius:10px;padding:12px 14px;pointer-events:auto;white-space:pre-line}
#hud .say.on{display:block}
#hud .say b{display:block;margin-bottom:5px;color:var(--c);letter-spacing:.1em}
#hud .rbar{display:none;position:absolute;left:50%;bottom:11%;width:150px;height:6px;margin-left:-75px;background:var(--bg);border:1px solid var(--bd);border-radius:3px;overflow:hidden}
#hud .rbar.on{display:block}
#hud .rbar i{display:block;height:100%;width:0;background:#ff6a4a}
#hud .btns{position:absolute;right:14px;top:42%}
#hud .pills{position:absolute;right:14px;top:58px;display:flex;flex-direction:column;gap:8px}
#hud button{pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none;font:600 10px ui-monospace,Menlo,monospace;letter-spacing:.12em;color:#cfe9ff;background:var(--bg);border:1px solid var(--bd);border-radius:10px}
#hud button:active{background:rgba(127,232,255,.25)}
#hud .use{width:72px;height:72px;font-size:13px;border-color:var(--c);color:var(--c)}
#hud .nb,#hud .rs,#hud .sd{width:70px;height:32px}
#hud .sd.off{opacity:.5}
#hud .nb.new{border-color:#ffb030;color:#ffd080}`;

export function initHud(touch, cb) {
  const st = document.createElement('style'); st.textContent = CSS; document.head.append(st);
  const root = document.createElement('div'); root.id = 'hud'; root.hidden = true;
  if (touch) root.classList.add('touch');
  root.innerHTML = '<div class="top"><div class="room"></div><div class="wc"><div class="wp">' + '<i></i>'.repeat(7) +
    '</div><span>W 0.0</span></div><div class="sb"><i></i></div></div><div class="tl"><div class="inv"></div><div class="nbh">[N] notebook</div></div>' +
    '<div class="tip"></div><div class="say"><b></b><span></span></div><div class="toasts"></div><div class="prompt"></div>' +
    '<div class="rbar"><i></i></div>';
  document.body.append(root);
  const q = s => root.querySelector(s);
  const room = q('.room'), inv = q('.inv'), nbh = q('.nbh'), say = q('.say'), toasts = q('.toasts');
  const prompt = q('.prompt'), rbar = q('.rbar'), rfill = q('.rbar i'), tipEl = q('.tip'), wtxt = q('.wc span');
  const sb = q('.sb'), sbi = q('.sb i');
  const pips = [...root.querySelectorAll('.wp i')];
  say.onclick = () => say.classList.remove('on');
  let notesBtn = null, soundBtn = null, sayT = 0;

  if (touch) {
    const btns = document.createElement('div'); btns.className = 'btns';
    const pills = document.createElement('div'); pills.className = 'pills';
    const mk = (cls, label, parent, down, up) => {
      const b = document.createElement('button'); b.className = cls; b.textContent = label;
      const stop = e => { e.preventDefault(); e.stopPropagation(); };
      b.addEventListener('touchstart', e => { stop(e); down(); }, { passive: false });
      for (const ev of ['touchend', 'touchcancel']) b.addEventListener(ev, e => { stop(e); if (up) up(); }, { passive: false });
      parent.append(b); return b;
    };
    notesBtn = mk('nb', 'NOTES', pills, cb.notebook);
    mk('rs', 'RESET', pills, () => cb.reset(true), () => cb.reset(false));
    soundBtn = mk('sd', 'SOUND', pills, cb.sound);
    mk('use', 'USE', btns, cb.use);
    root.append(btns, pills);
  }

  return {
    setSound: on => { if (soundBtn) { soundBtn.textContent = on ? 'SOUND' : 'MUTED'; soundBtn.classList.toggle('off', !on); } },
    show: () => { root.hidden = false; },
    setRoom: n => { if (room.textContent !== n) room.textContent = n; },
    setStatic: v => { sb.style.opacity = v > 0.02 ? 1 : 0; sbi.style.width = Math.round(v * 100) + '%'; sbi.style.background = v > 0.7 ? '#ff5a3a' : '#ffa040'; },
    setPrompt: s => { if (prompt.textContent !== s) prompt.textContent = s; },
    setTip: s => { if (tipEl.textContent !== s) tipEl.textContent = s; },
    setW: (w, dir) => {
      pips.forEach((p, i) => { p.style.opacity = Math.max(0.2, 1 - Math.abs(w - i)); });
      wtxt.textContent = 'W ' + w.toFixed(1) + (dir > 0 ? ' \u25b2' : ' \u25bc');
    },
    setInv: names => { inv.replaceChildren(...names.map(n => { const c = document.createElement('span'); c.className = 'chip'; c.textContent = n; return c; })); },
    setReset: p => { rbar.classList.toggle('on', p > 0); rfill.style.width = Math.min(100, p * 100) + '%'; },
    ping: on => { nbh.classList.toggle('new', on); nbh.textContent = on ? '[N] notebook \u2022 new' : '[N] notebook'; if (notesBtn) notesBtn.classList.toggle('new', on); },
    clearSay: () => say.classList.remove('on'),
    toast: (msg, ms = 2800) => {
      const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg; toasts.append(d);
      while (toasts.children.length > 3) toasts.firstChild.remove();
      setTimeout(() => { d.style.opacity = 0; setTimeout(() => d.remove(), 500); }, ms);
    },
    say: (title, text, ms = 14000) => {
      say.querySelector('b').textContent = title; say.querySelector('span').textContent = text;
      say.classList.add('on'); clearTimeout(sayT); sayT = setTimeout(() => say.classList.remove('on'), ms);
    },
  };
}
