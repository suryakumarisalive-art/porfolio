/* ───────────────────────────────────────────────────────────
   Retro desktop OS — window manager + apps
   Runs inside the CSS3DRenderer iframe. Talks to the 3D scene
   via postMessage (keyboard / click SFX, "go back" requests).
   ─────────────────────────────────────────────────────────── */

const APPS = {
  about: {
    title: 'About Me',
    glyph: '👤',
    width: 360, height: 280, x: 90, y: 50,
    body: `
      <div class="inset window-content" style="margin:0">
        <h1>Hi, I'm [Your Name] 👋</h1>
        <p>I'm a <strong>developer &amp; designer</strong> who builds fast,
           tactile things for the web — 3D scenes, interactive UI, and the
           occasional fake operating system.</p>
        <hr>
        <h2>What I work with</h2>
        <p>
          <span class="tag">Three.js</span><span class="tag">WebGL</span>
          <span class="tag">React</span><span class="tag">TypeScript</span>
          <span class="tag">Node.js</span><span class="tag">GSAP</span>
          <span class="tag">UI / UX</span>
        </p>
        <p class="muted">Based in [Your City] — open to freelance &amp; full-time work.</p>
      </div>`,
  },

  projects: {
    title: 'Projects',
    glyph: '📁',
    width: 420, height: 320, x: 130, y: 70,
    menu: ['File', 'Edit', 'View', 'Help'],
    body: `
      <div class="inset window-content" style="margin:0">
        <div class="proj">
          <div class="proj-head"><span>📄</span><strong>Interactive 3D Portfolio</strong></div>
          <p class="muted">A Three.js room you can orbit, with a clickable CRT that boots this desktop.</p>
          <div class="proj-links">
            <a data-ext="https://github.com/">GitHub ↗</a>
            <a data-ext="https://example.com/">Live ↗</a>
          </div>
        </div>
        <div class="proj">
          <div class="proj-head"><span>📄</span><strong>[Project Two]</strong></div>
          <p class="muted">One line on what it does and why it was hard.</p>
          <div class="proj-links"><a data-ext="https://github.com/">GitHub ↗</a></div>
        </div>
        <div class="proj">
          <div class="proj-head"><span>📄</span><strong>[Project Three]</strong></div>
          <p class="muted">Another thing you're proud of.</p>
          <div class="proj-links"><a data-ext="https://github.com/">GitHub ↗</a></div>
        </div>
      </div>`,
  },

  skills: {
    title: 'Skills',
    glyph: '🧰',
    width: 320, height: 260, x: 170, y: 90,
    body: `
      <h2>Frontend</h2>
      <p><span class="tag">React</span><span class="tag">Three.js</span><span class="tag">CSS</span><span class="tag">GSAP</span></p>
      <h2>Backend</h2>
      <p><span class="tag">Node.js</span><span class="tag">Express</span><span class="tag">PostgreSQL</span></p>
      <h2>Tooling</h2>
      <p><span class="tag">Vite</span><span class="tag">Git</span><span class="tag">Figma</span><span class="tag">Blender</span></p>`,
  },

  contact: {
    title: 'Contact',
    glyph: '✉️',
    width: 300, height: 210, x: 210, y: 110,
    body: `
      <h1>Get in touch</h1>
      <p>📧 <a data-ext="mailto:you@example.com">you@example.com</a></p>
      <p>💼 <a data-ext="https://linkedin.com/">LinkedIn ↗</a></p>
      <p>🐙 <a data-ext="https://github.com/">GitHub ↗</a></p>
      <p>🐦 <a data-ext="https://twitter.com/">Twitter / X ↗</a></p>`,
  },

  terminal: {
    title: 'Terminal',
    glyph: '🖥️',
    width: 460, height: 300, x: 150, y: 60,
    isTerminal: true,
    body: `
      <div id="term-output">
        <div class="term-line">PortfolioOS [Version 1.0]</div>
        <div class="term-line">(c) You. All rights reserved.</div>
        <div class="term-line"> </div>
        <div class="term-line">Type <b>help</b> for a list of commands.</div>
        <div class="term-line"> </div>
      </div>
      <div class="term-input-row">
        <span class="ps1">C:\\&gt;&nbsp;</span>
        <input id="term-input" autocomplete="off" spellcheck="false" />
      </div>`,
  },

  credits: {
    title: 'About This Site',
    glyph: 'ℹ️',
    width: 360, height: 240, x: 120, y: 80,
    body: `
      <h1>About this site</h1>
      <p>A 3D portfolio inspired by the genre of interactive desk scenes.
         The room is rendered in <strong>Three.js</strong>; this desktop is a
         real DOM page mounted onto the monitor with <strong>CSS3DRenderer</strong>.</p>
      <hr>
      <p class="muted">Orbit with drag, scroll to zoom, click the monitor to dive in,
         and use <strong>← Back</strong> to fly out.</p>`,
  },
};

/* ── State ── */
let zCounter = 10;
let activeId = null;
const openWindows = new Map(); // id -> { el, taskBtn }

/* ── postMessage helpers (drive 3D scene SFX / navigation) ── */
function notifyParent(type, payload) {
  try { parent.postMessage({ source: 'os', type, ...payload }, '*'); } catch {}
}

/* ── DOM refs ── */
const desktop      = document.getElementById('desktop');
const taskBtns     = document.getElementById('task-btns');
const startBtn     = document.getElementById('start-btn');
const startMenu    = document.getElementById('start-menu');
const clockEl      = document.getElementById('clock');

/* ─────────────────────────  Window manager  ───────────────────────── */
function openApp(id) {
  closeStartMenu();
  const app = APPS[id];
  if (!app) return;

  if (openWindows.has(id)) {
    const w = openWindows.get(id);
    w.el.classList.remove('minimized');
    focusWindow(id);
    return;
  }

  const el = document.createElement('div');
  el.className = 'window';
  el.id = 'win-' + id;
  el.style.width  = app.width  + 'px';
  el.style.height = app.height + 'px';
  el.style.left   = app.x + 'px';
  el.style.top    = app.y + 'px';

  const menuBar = app.menu
    ? `<div class="window-menu">${app.menu.map(m => `<span>${m}</span>`).join('')}</div>`
    : '';
  const contentClass = app.isTerminal ? 'window-content' : 'window-content';

  el.innerHTML = `
    <div class="window-title">
      <span class="ttl-glyph">${app.glyph}</span>
      <span class="ttl-text">${app.title}</span>
      <div class="window-btns">
        <button class="window-btn" data-act="min" title="Minimize">_</button>
        <button class="window-btn" data-act="close" title="Close">✕</button>
      </div>
    </div>
    ${menuBar}
    <div class="${contentClass}">${app.body}</div>`;

  desktop.appendChild(el);

  // Title-bar buttons
  el.querySelector('[data-act="close"]').addEventListener('click', e => { e.stopPropagation(); closeApp(id); });
  el.querySelector('[data-act="min"]').addEventListener('click',  e => { e.stopPropagation(); minimizeApp(id); });

  // Focus on any interaction
  el.addEventListener('mousedown', () => focusWindow(id));

  // External links → ask the host page to open them (iframe is sandboxed)
  el.querySelectorAll('[data-ext]').forEach(a => {
    a.addEventListener('click', ev => {
      ev.preventDefault();
      notifyParent('open-url', { url: a.getAttribute('data-ext') });
      window.open(a.getAttribute('data-ext'), '_blank', 'noopener');
    });
  });

  makeDraggable(el, el.querySelector('.window-title'));

  // Taskbar button
  const taskBtn = document.createElement('button');
  taskBtn.className = 'task-btn';
  taskBtn.innerHTML = `<span class="ttl-glyph">${app.glyph}</span><span>${app.title}</span>`;
  taskBtn.addEventListener('click', () => {
    if (activeId === id && !el.classList.contains('minimized')) {
      minimizeApp(id);
    } else {
      el.classList.remove('minimized');
      focusWindow(id);
    }
  });
  taskBtns.appendChild(taskBtn);

  openWindows.set(id, { el, taskBtn });

  if (app.isTerminal) initTerminal(el);

  focusWindow(id);
  notifyParent('app-open', { app: id });
}

function focusWindow(id) {
  activeId = id;
  for (const [wid, w] of openWindows) {
    const isActive = wid === id;
    w.el.classList.toggle('blurred', !isActive);
    w.taskBtn.classList.toggle('active', isActive && !w.el.classList.contains('minimized'));
  }
  const w = openWindows.get(id);
  if (w) w.el.style.zIndex = String(++zCounter);
}

function minimizeApp(id) {
  const w = openWindows.get(id);
  if (!w) return;
  w.el.classList.add('minimized');
  w.taskBtn.classList.remove('active');
  if (activeId === id) activeId = null;
}

function closeApp(id) {
  const w = openWindows.get(id);
  if (!w) return;
  w.el.remove();
  w.taskBtn.remove();
  openWindows.delete(id);
  if (activeId === id) activeId = null;
}

/* ── Dragging (clamped to desktop) ── */
function makeDraggable(win, handle) {
  let dx = 0, dy = 0, dragging = false;
  handle.addEventListener('mousedown', e => {
    if (e.target.closest('.window-btn')) return;
    dragging = true;
    dx = e.clientX - win.offsetLeft;
    dy = e.clientY - win.offsetTop;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const maxX = window.innerWidth  - 40;
    const maxY = window.innerHeight - 30 - 30; // taskbar
    const nx = Math.min(Math.max(e.clientX - dx, -win.offsetWidth + 80), maxX);
    const ny = Math.min(Math.max(e.clientY - dy, 0), maxY);
    win.style.left = nx + 'px';
    win.style.top  = ny + 'px';
  });
  document.addEventListener('mouseup', () => { dragging = false; });
}

/* ─────────────────────────  Terminal app  ───────────────────────── */
function initTerminal(win) {
  const output = win.querySelector('#term-output');
  const input  = win.querySelector('#term-input');
  const print = (txt) => {
    const line = document.createElement('div');
    line.className = 'term-line';
    line.innerHTML = txt;
    output.appendChild(line);
  };

  const commands = {
    help: () => print(
      'Available commands:<br>' +
      '&nbsp;&nbsp;help &nbsp;&nbsp;&nbsp;- show this list<br>' +
      '&nbsp;&nbsp;about &nbsp;&nbsp;- open About Me<br>' +
      '&nbsp;&nbsp;projects - open Projects<br>' +
      '&nbsp;&nbsp;contact &nbsp;- open Contact<br>' +
      '&nbsp;&nbsp;skills &nbsp;- list skills<br>' +
      '&nbsp;&nbsp;whoami &nbsp;- who am I<br>' +
      '&nbsp;&nbsp;date &nbsp;&nbsp;&nbsp;- current date/time<br>' +
      '&nbsp;&nbsp;exit &nbsp;&nbsp;&nbsp;- fly back out to the room<br>' +
      '&nbsp;&nbsp;cls &nbsp;&nbsp;&nbsp;&nbsp;- clear the screen'
    ),
    about:    () => { openApp('about');    print('Opening About Me...'); },
    projects: () => { openApp('projects'); print('Opening Projects...'); },
    contact:  () => { openApp('contact');  print('Opening Contact...'); },
    skills:   () => print('React, Three.js, TypeScript, Node.js, GSAP, Blender.'),
    whoami:   () => print('[Your Name] — developer &amp; designer.'),
    date:     () => print(new Date().toString()),
    exit:     () => { print('Goodbye.'); notifyParent('go-back', {}); },
    cls:      () => { output.innerHTML = ''; },
    clear:    () => { output.innerHTML = ''; },
  };

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const raw = input.value.trim();
      print(`<span class="ps1">C:\\&gt;&nbsp;</span>${escapeHtml(raw)}`);
      const cmd = raw.toLowerCase().split(/\s+/)[0];
      if (cmd === '') { /* noop */ }
      else if (commands[cmd]) commands[cmd]();
      else print(`'${escapeHtml(cmd)}' is not recognized. Type <b>help</b>.`);
      input.value = '';
      win.querySelector('.window-content').scrollTop = 1e9;
    }
  });
  setTimeout(() => input.focus(), 50);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

/* ─────────────────────────  Desktop icons  ───────────────────────── */
function buildDesktopIcons() {
  const list = [
    { id: 'about',    label: 'About Me',  color: '#000080' },
    { id: 'projects', label: 'Projects',  color: '#808000' },
    { id: 'skills',   label: 'Skills',    color: '#008000' },
    { id: 'contact',  label: 'Contact',   color: '#800000' },
    { id: 'terminal', label: 'Terminal',  color: '#101010' },
    { id: 'credits',  label: 'Read Me',   color: '#404080' },
  ];
  list.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'icon';
    el.tabIndex = 0;
    el.style.top  = (14 + i * 80) + 'px';
    el.style.left = '14px';
    el.innerHTML = `<div class="glyph" style="background:${item.color};border-radius:4px">${APPS[item.id].glyph}</div><span>${item.label}</span>`;
    el.addEventListener('click', () => {
      document.querySelectorAll('.icon').forEach(n => n.classList.remove('selected'));
      el.classList.add('selected');
    });
    el.addEventListener('dblclick', () => openApp(item.id));
    desktop.appendChild(el);
  });
  // Click empty desktop clears selection
  desktop.addEventListener('mousedown', e => {
    if (e.target === desktop) document.querySelectorAll('.icon').forEach(n => n.classList.remove('selected'));
  });
}

/* ─────────────────────────  Start menu  ───────────────────────── */
function buildStartMenu() {
  const items = [
    { id: 'about',    label: 'About Me' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills',   label: 'Skills' },
    { id: 'contact',  label: 'Contact' },
    { id: 'terminal', label: 'Terminal' },
    { id: 'credits',  label: 'Read Me' },
  ];
  const listEl = document.getElementById('start-list');
  items.forEach(it => {
    const row = document.createElement('div');
    row.className = 'start-item';
    row.innerHTML = `<span class="si-glyph">${APPS[it.id].glyph}</span><span>${it.label}</span>`;
    row.addEventListener('click', () => openApp(it.id));
    listEl.appendChild(row);
  });
  const sep = document.createElement('div');
  sep.className = 'start-sep';
  listEl.appendChild(sep);
  const back = document.createElement('div');
  back.className = 'start-item';
  back.innerHTML = `<span class="si-glyph">⏏️</span><span>Exit to Room</span>`;
  back.addEventListener('click', () => { closeStartMenu(); notifyParent('go-back', {}); });
  listEl.appendChild(back);
}

function toggleStartMenu() {
  const open = startMenu.classList.toggle('hidden') === false;
  startBtn.classList.toggle('open', open);
}
function closeStartMenu() {
  startMenu.classList.add('hidden');
  startBtn.classList.remove('open');
}

/* ─────────────────────────  Clock  ───────────────────────── */
function tickClock() {
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  clockEl.textContent = `${h}:${m} ${ap}`;
}

/* ─────────────────────────  Global keyboard SFX  ───────────────────────── */
function wireKeyboardSfx() {
  document.addEventListener('keydown', () => notifyParent('keypress', {}), true);
}

/* ─────────────────────────  Boot  ───────────────────────── */
function boot() {
  buildDesktopIcons();
  buildStartMenu();
  wireKeyboardSfx();

  startBtn.addEventListener('click', e => { e.stopPropagation(); toggleStartMenu(); });
  document.addEventListener('mousedown', e => {
    if (!startMenu.contains(e.target) && e.target !== startBtn && !startBtn.contains(e.target)) closeStartMenu();
  });

  tickClock();
  setInterval(tickClock, 1000 * 15);

  // Open a welcome window so the desktop never feels empty
  openApp('about');
}

boot();
