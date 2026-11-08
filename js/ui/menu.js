const $ = id => document.getElementById(id);
export function initMenu(settings, save, hooks) {
  const el = $('menu'), reduce = $('s-reduce'), sens = $('s-sens'), vig = $('s-vig'), vol = $('s-vol');
  let volume = 0.8;
  try { const v = parseFloat(localStorage.getItem('ergo_vol')); if (v >= 0 && v <= 1) volume = v; } catch {}
  reduce.checked = settings.reduce; sens.value = settings.sens; vig.value = settings.vignette; vol.value = volume;
  const show = () => {
    $('o-sens').textContent = (+sens.value).toFixed(2) + 'x';
    $('o-vig').textContent = Math.round(vig.value * 100) + '%';
    $('o-vol').textContent = Math.round(vol.value * 100) + '%';
  };
  const apply = () => {
    document.documentElement.style.setProperty('--vig', settings.vignette);
    document.body.classList.toggle('reduce', settings.reduce); // used by effects from M4
    hooks.onChange(settings); show();
  };
  const change = fn => () => { fn(); save(settings); apply(); };
  reduce.onchange = change(() => { settings.reduce = reduce.checked; });
  sens.oninput = change(() => { settings.sens = +sens.value; });
  vig.oninput = change(() => { settings.vignette = +vig.value; });
  vol.oninput = () => {
    volume = +vol.value; try { localStorage.setItem('ergo_vol', volume); } catch {}
    hooks.onVolume?.(volume); show();
  };
  const open = () => { el.hidden = false; hooks.onOpen(); };
  const close = () => { el.hidden = true; hooks.onClose(); };
  $('gear').onclick = open; $('opt').onclick = open; $('resume').onclick = close;
  apply(); hooks.onVolume?.(volume);
  return { open, close, isOpen: () => !el.hidden };
}
