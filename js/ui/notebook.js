// Notebook overlay. Entries come from game.notebookView(); hints fill in on their own over time.
const CSS = `
#notebook{display:none;position:fixed;inset:0;z-index:30;background:rgba(4,7,14,.98);overflow-y:auto;color:#d8e2ff;font:14px/1.45 ui-monospace,Menlo,monospace}
#notebook.on{display:block}
#notebook .pg{max-width:560px;margin:0 auto;padding:16px 16px 40px}
#notebook header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;letter-spacing:.12em}
#notebook header button{font:inherit;background:rgba(7,12,24,.8);color:#cfe9ff;border:1px solid var(--c);border-radius:8px;padding:7px 16px}
#notebook article{background:rgba(127,232,255,.05);border:1px solid rgba(127,232,255,.2);border-left:3px solid var(--c);border-radius:8px;padding:10px 12px;margin:0 0 12px}
#notebook article.done{border-color:#3b4a66;opacity:.6}
#notebook h3{margin:0 0 4px;font-size:15px;color:#7fe8ff}
#notebook article.done h3{text-decoration:line-through;color:#8a9ab8}
#notebook p{margin:0 0 6px;white-space:pre-line}
#notebook .hint{color:#ffd080;margin:6px 0 0;padding:5px 8px;border:1px solid rgba(255,208,128,.35);border-radius:6px}
#notebook .more{color:#6a7898;font-size:12px}`;

export function initNotebook(cb) {
  const st = document.createElement('style'); st.textContent = CSS; document.head.append(st);
  const root = document.createElement('div'); root.id = 'notebook';
  root.innerHTML = '<div class="pg"><header><span>NOTEBOOK</span><button type="button">CLOSE</button></header><div class="list"></div></div>';
  document.body.append(root);
  const list = root.querySelector('.list');
  root.querySelector('button').onclick = () => cb.close();
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; e.textContent = text; return e; };

  const render = entries => {
    list.replaceChildren();
    if (!entries.length) list.append(el('p', 'more', 'Nothing written yet.'));
    for (const e of entries) {
      const a = el('article', e.done ? 'done' : '', '');
      a.append(el('h3', '', (e.done ? '\u2713 ' : '') + e.title), el('p', '', e.text));
      for (const h of e.hints) a.append(el('div', 'hint', 'Hint: ' + h));
      if (e.more) a.append(el('div', 'more', 'More hints appear here if you stay stuck.'));
      list.append(a);
    }
  };
  return {
    open: entries => { render(entries); root.classList.add('on'); document.body.classList.add('nb-open'); root.scrollTop = 0; },
    close: () => { root.classList.remove('on'); document.body.classList.remove('nb-open'); },
    isOpen: () => root.classList.contains('on'),
  };
}
