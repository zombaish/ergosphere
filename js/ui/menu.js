const $ = id => document.getElementById(id);
export function initMenu(settings, save, hooks) {
  const el = $('menu'), reduce = $('s-reduce'), sens = $('s-sens'), vig = $('s-vig');
  reduce.checked = settings.reduce; sens.value = settings.sens; vig.value = settings.vignette;
  const apply = () => {
    document.documentElement.style.setProperty('--vig', settings.vignette);
    document.body.classList.toggle('reduce', settings.reduce); // used by effects from M4
    hooks.onChange(settings);
  };
  const change = fn => () => { fn(); save(settings); apply(); };
  reduce.onchange = change(() => { settings.reduce = reduce.checked; });
  sens.oninput = change(() => { settings.sens = +sens.value; });
  vig.oninput = change(() => { settings.vignette = +vig.value; });
  const open = () => { el.hidden = false; hooks.onOpen(); };
  const close = () => { el.hidden = true; hooks.onClose(); };
  $('gear').onclick = open; $('opt').onclick = open; $('resume').onclick = close;
  apply();
  return { open, close, isOpen: () => !el.hidden };
}
