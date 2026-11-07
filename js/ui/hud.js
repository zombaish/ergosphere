// HUD: room name, inventory, interaction prompt, toasts, reading panel, reset bar, touch buttons.
const CSS = `
#hud{position:fixed;inset:0;pointer-events:none;z-index:5;font:13px/1.35 ui-monospace,Menlo,monospace;color:#cfe0ff;text-shadow:0 1px 3px #000}
#hud[hidden]{display:none}
#hud .tl{position:absolute;top:10px;left:12px;display:flex;flex-direction:column;gap:6px;max-width:60vw}
#hud .room{letter-spacing:.08em;text-transform:uppercase;opacity:.85}
#hud .inv{display:flex;gap:6px;flex-wrap:wrap}
#hud .chip{border:1px solid #ffb030;color:#ffd080;padding:1px 7px;border-radius:3px;background:#0008;font-size:12px}
#hud .nbh{opacity:.55;font-size:12px}
#hud .nbh.new,#hud .nb.new{opacity:1;color:#ffd080;border-color:#ffb030}
#hud.touch .nbh{display:none}
#hud .wc{position:absolute;top:10px;left:50%;transform:translateX(-50%);text-align:center;letter-spacing:.1em}
#hud .wp{display:flex;gap:4px;justify-content:center;margin-bottom:3px}
#hud .wp i{width:16px;height:7px;border:1px solid #7fe8ff;background:#7fe8ff;opacity:.2}
#hud .tip{position:absolute;top:56px;left:50%;transform:translateX(-50%);width:min(88vw,380px);text-align:center;background:#000a;border:1px solid #4a5a80;padding:5px 10px;font-size:12px;color:#ffd080}
#hud .tip:empty{display:none}
#hud .toasts{position:absolute;left:50%;bottom:30%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:4px;width:90vw}
#hud .toast{background:#000a;padding:4px 10px;border-radius:3px;transition:opacity .5s;text-align:center}
#hud .prompt{position:absolute;left:50%;bottom:19%;transform:translateX(-50%);background:#000a;padding:5px 12px;border:1px solid #6f86c8;border-radius:4px;white-space:nowrap}
#hud .prompt:empty{display:none}
#hud .say{display:none;position:absolute;top:13%;left:50%;transform:translateX(-50%);width:min(86vw,420px);background:#0a0c14e6;border:1px solid #4a5a80;padding:10px 14px;pointer-events:auto;white-space:pre-line}
#hud .say.on{display:block}
#hud .say b{display:block;margin-bottom:4px;color:#7fe8ff;letter-spacing:.06em}
#hud .rbar{display:none;position:absolute;left:50%;bottom:11%;width:150px;height:6px;margin-left:-75px;background:#0008;border:1px solid #6f86c8}
#hud .rbar.on{display:block}
#hud .rbar i{display:block;height:100%;width:0;background:#ff6a4a}
#hud .btns{position:absolute;right:12px;top:34%;display:flex;flex-direction:column;gap:14px;align-items:center}
#hud .btns button{pointer-events:auto;border-radius:50%;border:2px solid #6f86c8;background:#10162a99;color:#cfe0ff;font:bold 11px ui-monospace,monospace;touch-action:none;user-select:none;-webkit-user-select:none}
#hud .btns .use{width:66px;height:66px;font-size:14px}
#hud .btns .nb,#hud .btns .rs{width:50px;height:50px}`;

export function initHud(touch, cb) {
  const st = document.createElement('style'); st.textContent = CSS; document.head.append(st);
  const root = document.createElement('div'); root.id = 'hud'; root.hidden = true;
  if (touch) root.classList.add('touch');
  root.innerHTML = '<div class="tl"><div class="room"></div><div class="inv"></div><div class="nbh">[N] notebook</div></div>' +
    '<div class="say"><b></b><span></span></div><div class="toasts"></div><div class="prompt"></div>' +
    '<div class="rbar"><i></i></div><div class="wc"><div class="wp">' + '<i></i>'.repeat(7) + '</div><span>W 0.0</span></div><div class="tip"></div>';
  document.body.append(root);
  const q = s => root.querySelector(s);
  const room = q('.room'), inv = q('.inv'), nbh = q('.nbh'), say = q('.say'), toasts = q('.toasts');
  const prompt = q('.prompt'), rbar = q('.rbar'), rfill = q('.rbar i');
  const pips = [...root.querySelectorAll('.wp i')], wtxt = q('.wc span');
  const tipEl = q('.tip');
  say.onclick = () => say.classList.remove('on');
  let notesBtn = null, sayT = 0;

  if (touch) {
    const btns = document.createElement('div'); btns.className = 'btns';
    const mk = (cls, label, down, up) => {
      const b = document.createElement('button'); b.className = cls; b.textContent = label;
      const stop = e => { e.preventDefault(); e.stopPropagation(); };
      b.addEventListener('touchstart', e => { stop(e); down(); }, { passive: false });
      for (const ev of ['touchend', 'touchcancel']) b.addEventListener(ev, e => { stop(e); if (up) up(); }, { passive: false });
      btns.append(b); return b;
    };
    notesBtn = mk('nb', 'NOTES', cb.notebook);
    mk('use', 'USE', cb.use);
    mk('rs', 'HOLD RESET', () => cb.reset(true), () => cb.reset(false));
    root.append(btns);
  }

  return {
    show: () => { root.hidden = false; },
    setW: (w, dir) => { pips.forEach((p, i) => { p.style.opacity = Math.max(0.2, 1 - Math.abs(w - i)); }); wtxt.textContent = 'W ' + w.toFixed(1) + (dir > 0 ? ' \u25b2' : ' \u25bc'); },
    setTip: s => { if (tipEl.textContent !== s) tipEl.textContent = s; },
    setRoom: n => { room.textContent = n; },
    setPrompt: s => { if (prompt.textContent !== s) prompt.textContent = s; },
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
