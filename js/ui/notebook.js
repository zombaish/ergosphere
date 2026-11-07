// Notebook overlay. Entries come from game.notebookView(); hints fill in on their own over time.
const CSS = `
#notebook{display:none;position:fixed;inset:0;z-index:30;background:#05060ae8;overflow-y:auto;color:#d8e2ff;font:14px/1.45 ui-monospace,Menlo,monospace}
#notebook.on{display:block}
#notebook .pg{max-width:560px;margin:0 auto;padding:16px 16px 40px}
#notebook header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;letter-spacing:.12em}
#notebook header button{font:inherit;background:#10162a;color:#cfe0ff;border:1px solid #6f86c8;border-radius:4px;padding:6px 14px}
#notebook article{border-left:3px solid #7fe8ff;padding:2px 0 2px 10px;margin:0 0 16px}
#notebook article.done{border-color:#3b4a66;opacity:.6}
#notebook h3{margin:0 0 4px;font-size:15px;color:#7fe8ff}
#notebook article.done h3{text-decoration:line-through;color:#8a9ab8}
#notebook p{margin:0 0 6px;white-space:pre-line}
#notebook .hint{color:#ffd080;margin:4px 0}
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
    open: entries => { render(entries); root.classList.add('on'); root.scrollTop = 0; },
    close: () => root.classList.remove('on'),
    isOpen: () => root.classList.contains('on'),
  };
}
