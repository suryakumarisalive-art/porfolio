/**
 * PROXIMA OS — os.js
 * Vanilla JS window manager for the retro desktop UI.
 * No external dependencies. Works as a plain static file.
 *
 * Sections:
 *   1. App registry
 *   2. Window manager (create, focus, close, drag)
 *   3. Taskbar controller
 *   4. Start menu
 *   5. Desktop icon handlers
 *   6. Contact form (no-op / demo)
 *   7. Clock
 *   8. postMessage bridge → parent 3D app
 */

'use strict';

/* ============================================================
   1. APP REGISTRY
   ============================================================ */

/** Each app definition drives icon, window, menu. */
const APPS = {
  about: {
    id:       'about',
    title:    'About Me',
    templateId: 'tpl-about',
    defaultPos: { x: 80,  y: 60  },
    defaultSize:{ w: 480, h: 320 },
  },
  projects: {
    id:       'projects',
    title:    'Projects',
    templateId: 'tpl-projects',
    defaultPos: { x: 200, y: 100 },
    defaultSize:{ w: 520, h: 380 },
  },
  contact: {
    id:       'contact',
    title:    'Contact',
    templateId: 'tpl-contact',
    defaultPos: { x: 320, y: 140 },
    defaultSize:{ w: 480, h: 360 },
  },
  resume: {
    id:       'resume',
    title:    'Resume',
    templateId: 'tpl-resume',
    defaultPos: { x: 440, y: 80  },
    defaultSize:{ w: 480, h: 400 },
  },
};

/* ============================================================
   2. WINDOW MANAGER
   ============================================================ */

/**
 * Internal state. Maps appId → { el, isOpen }.
 * @type {Map<string, { el: HTMLElement, isOpen: boolean }>}
 */
const windows = new Map();

/** Running z-index counter for window stacking. */
let topZ = 10;

/** Currently active (focused) window id. */
let activeWindowId = null;

const desktop = document.getElementById('desktop');

/**
 * Open or focus an app window.
 * @param {string} appId
 */
function openApp(appId) {
  const app = APPS[appId];
  if (!app) return;

  // If already open — focus it and return
  if (windows.has(appId)) {
    const entry = windows.get(appId);
    focusWindow(appId);
    return;
  }

  // Build the window element
  const win = buildWindow(app);
  desktop.appendChild(win);

  windows.set(appId, { el: win, isOpen: true });
  focusWindow(appId);
  updateTaskbar();

  // Animate in
  win.style.opacity = '0';
  win.style.transform = 'scale(0.96) translateY(4px)';
  requestAnimationFrame(() => {
    win.style.transition = 'opacity 120ms ease, transform 120ms ease';
    win.style.opacity = '1';
    win.style.transform = 'scale(1) translateY(0)';
  });
}

/**
 * Close a window by appId.
 * @param {string} appId
 */
function closeWindow(appId) {
  const entry = windows.get(appId);
  if (!entry) return;

  const win = entry.el;

  // Animate out then remove
  win.style.transition = 'opacity 100ms ease, transform 100ms ease';
  win.style.opacity = '0';
  win.style.transform = 'scale(0.95)';

  setTimeout(() => {
    if (win.parentNode) win.parentNode.removeChild(win);
    windows.delete(appId);

    if (activeWindowId === appId) {
      activeWindowId = null;
      // Focus the topmost remaining window
      let highestZ = 0;
      let nextId = null;
      windows.forEach((e, id) => {
        const z = parseInt(e.el.style.zIndex || '10', 10);
        if (z > highestZ) { highestZ = z; nextId = id; }
      });
      if (nextId) focusWindow(nextId);
    }
    updateTaskbar();
  }, 110);
}

/**
 * Bring a window to front and mark it active.
 * @param {string} appId
 */
function focusWindow(appId) {
  // Deactivate all
  windows.forEach((entry, id) => {
    entry.el.classList.remove('active');
    const btn = document.querySelector(`.taskbar-win-btn[data-app="${id}"]`);
    if (btn) btn.classList.remove('active');
  });

  const entry = windows.get(appId);
  if (!entry) return;

  topZ += 1;
  entry.el.style.zIndex = String(topZ);
  entry.el.classList.add('active');

  const btn = document.querySelector(`.taskbar-win-btn[data-app="${appId}"]`);
  if (btn) btn.classList.add('active');

  activeWindowId = appId;
}

/**
 * Build and return a window DOM element for the given app.
 * @param {typeof APPS[string]} app
 * @returns {HTMLElement}
 */
function buildWindow(app) {
  const win = document.createElement('div');
  win.className = 'window';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', app.title);
  win.dataset.app = app.id;

  // Position
  win.style.left   = `${app.defaultPos.x}px`;
  win.style.top    = `${app.defaultPos.y}px`;
  win.style.width  = `${app.defaultSize.w}px`;
  win.style.height = `${app.defaultSize.h}px`;

  // Title bar
  const titlebar = document.createElement('div');
  titlebar.className = 'window-titlebar';
  titlebar.setAttribute('aria-label', `${app.title} title bar — drag to move`);

  const titleEl = document.createElement('span');
  titleEl.className = 'window-title';
  titleEl.textContent = `[ ${app.title} ]`;

  // Controls
  const controls = document.createElement('div');
  controls.className = 'window-controls';

  const minBtn = document.createElement('button');
  minBtn.className = 'win-btn win-btn-minimize';
  minBtn.textContent = '_';
  minBtn.setAttribute('aria-label', `Minimize ${app.title}`);
  minBtn.addEventListener('click', () => {
    // Simple minimize: just move off-screen (demo behaviour)
    win.style.transform = win.style.transform === 'translateY(2000px)'
      ? 'translateY(0)'
      : 'translateY(2000px)';
  });

  const closeBtn = document.createElement('button');
  closeBtn.className = 'win-btn win-btn-close';
  closeBtn.textContent = 'X';
  closeBtn.setAttribute('aria-label', `Close ${app.title}`);
  closeBtn.addEventListener('click', () => closeWindow(app.id));

  controls.appendChild(minBtn);
  controls.appendChild(closeBtn);
  titlebar.appendChild(controls);
  titlebar.appendChild(titleEl);

  // Content
  const body = document.createElement('div');
  body.className = 'window-body';

  const tpl = document.getElementById(app.templateId);
  if (tpl) {
    const clone = tpl.content.cloneNode(true);
    body.appendChild(clone);
    // Wire the contact form if present
    const form = body.querySelector('#contact-form');
    if (form) wireContactForm(form);
  } else {
    body.textContent = `[Window content for "${app.title}" not found]`;
  }

  win.appendChild(titlebar);
  win.appendChild(body);

  // Focus on click anywhere in the window
  win.addEventListener('mousedown', () => focusWindow(app.id), true);

  // Drag behaviour
  makeDraggable(win, titlebar);

  return win;
}

/**
 * Make `el` draggable when the user grabs `handle`.
 * @param {HTMLElement} el     — the element to move
 * @param {HTMLElement} handle — drag target
 */
function makeDraggable(el, handle) {
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop  = 0;
  let dragging  = false;

  handle.addEventListener('mousedown', (e) => {
    // Only drag with left button, and not on control buttons
    if (e.button !== 0) return;
    if (e.target.closest('.window-controls')) return;

    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseInt(el.style.left, 10) || 0;
    startTop  = parseInt(el.style.top,  10) || 0;

    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const desktopH = desktop.clientHeight;
    const desktopW = desktop.clientWidth;

    // Clamp so window stays partially visible
    const newLeft = Math.max(-el.offsetWidth + 40,
                    Math.min(desktopW - 40, startLeft + dx));
    const newTop  = Math.max(0,
                    Math.min(desktopH - 24, startTop + dy));

    el.style.left = `${newLeft}px`;
    el.style.top  = `${newTop}px`;
  });

  document.addEventListener('mouseup', () => {
    dragging = false;
  });
}

/* ============================================================
   3. TASKBAR CONTROLLER
   ============================================================ */

const taskbarWindows = document.getElementById('taskbar-windows');

/** Rebuild the open-window buttons in the taskbar. */
function updateTaskbar() {
  taskbarWindows.innerHTML = '';

  windows.forEach((entry, appId) => {
    const app  = APPS[appId];
    const btn  = document.createElement('button');
    btn.className = 'taskbar-win-btn';
    btn.dataset.app = appId;
    btn.textContent = app.title;
    btn.setAttribute('aria-label', `Switch to ${app.title}`);

    if (appId === activeWindowId) btn.classList.add('active');

    btn.addEventListener('click', () => {
      focusWindow(appId);
      // Un-minimize if minimized
      const win = entry.el;
      if (win.style.transform === 'translateY(2000px)') {
        win.style.transform = 'translateY(0)';
      }
    });

    taskbarWindows.appendChild(btn);
  });
}

/* ============================================================
   4. START MENU
   ============================================================ */

const startBtn  = document.getElementById('start-btn');
const startMenu = document.getElementById('start-menu');

function openStartMenu() {
  startMenu.classList.add('open');
  startMenu.removeAttribute('aria-hidden');
  startBtn.setAttribute('aria-expanded', 'true');
  // Focus first item
  const first = startMenu.querySelector('.start-menu-item');
  if (first) first.focus();
}

function closeStartMenu() {
  startMenu.classList.remove('open');
  startMenu.setAttribute('aria-hidden', 'true');
  startBtn.setAttribute('aria-expanded', 'false');
}

function toggleStartMenu() {
  if (startMenu.classList.contains('open')) {
    closeStartMenu();
  } else {
    openStartMenu();
  }
}

startBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleStartMenu();
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (startMenu.classList.contains('open') &&
      !startMenu.contains(e.target) &&
      e.target !== startBtn) {
    closeStartMenu();
  }
});

// Keyboard: Escape closes the menu
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && startMenu.classList.contains('open')) {
    closeStartMenu();
    startBtn.focus();
  }
});

// Wire start-menu app buttons
startMenu.querySelectorAll('.start-menu-item[data-app]').forEach((btn) => {
  btn.addEventListener('click', () => {
    openApp(btn.dataset.app);
    closeStartMenu();
  });
});

// Close-menu button in start menu
const menuShutdown = document.getElementById('menu-shutdown');
if (menuShutdown) {
  menuShutdown.addEventListener('click', () => closeStartMenu());
}

/* ============================================================
   5. DESKTOP ICON HANDLERS
   ============================================================ */

const iconContainer = document.getElementById('icon-container');

// Track double-click state per icon (two quick clicks)
const iconClickTimers = new Map();
const DBL_CLICK_MS = 380;

iconContainer.querySelectorAll('.desktop-icon').forEach((icon) => {
  const appId = icon.dataset.app;
  if (!appId) return;

  // Click: select / double-click detection
  icon.addEventListener('click', () => {
    if (iconClickTimers.has(appId)) {
      // Second click within window → double-click
      clearTimeout(iconClickTimers.get(appId));
      iconClickTimers.delete(appId);
      openApp(appId);
      clearIconSelection();
    } else {
      // First click: select the icon
      clearIconSelection();
      icon.classList.add('selected');
      // Start timer; if no second click, just stay selected
      const timer = setTimeout(() => {
        iconClickTimers.delete(appId);
      }, DBL_CLICK_MS);
      iconClickTimers.set(appId, timer);
    }
  });

  // Keyboard: Enter or Space opens the app
  icon.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openApp(appId);
    }
  });
});

function clearIconSelection() {
  iconContainer.querySelectorAll('.desktop-icon').forEach((ic) => {
    ic.classList.remove('selected');
  });
}

// Clicking the bare desktop clears icon selection and closes start menu
desktop.addEventListener('click', (e) => {
  if (e.target === desktop || e.target.id === 'icon-container') {
    clearIconSelection();
  }
  if (!startMenu.contains(e.target) && e.target !== startBtn) {
    closeStartMenu();
  }
});

/* ============================================================
   6. CONTACT FORM (demo — no network request)
   ============================================================ */

/**
 * Wire the contact form inside a newly-opened window.
 * Called each time the contact window is created (fresh clone).
 * @param {HTMLFormElement} form
 */
function wireContactForm(form) {
  const statusEl = form.querySelector('#form-status');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = form.querySelector('#cf-name').value.trim();
    const email   = form.querySelector('#cf-email').value.trim();
    const message = form.querySelector('#cf-message').value.trim();

    if (!name || !email || !message) {
      if (statusEl) {
        statusEl.textContent = '> ERROR: All fields required.';
        statusEl.style.color = '#c04040';
      }
      return;
    }

    // Demo submit — no real network call
    // TODO: connect to Formspree / Netlify Forms / backend endpoint
    if (statusEl) {
      statusEl.textContent = '> Message queued. [demo mode — not sent]';
      statusEl.style.color = 'var(--phosphor-dim)';
    }
    form.reset();
  });
}

/* ============================================================
   7. LIVE CLOCK
   ============================================================ */

const clockEl = document.getElementById('taskbar-clock');

function updateClock() {
  const now  = new Date();
  const hh   = String(now.getHours()).padStart(2, '0');
  const mm   = String(now.getMinutes()).padStart(2, '0');
  clockEl.textContent = `${hh}:${mm}`;
}

updateClock();
setInterval(updateClock, 10_000); // refresh every 10s

/* ============================================================
   8. POST-MESSAGE BRIDGE → PARENT 3D APP
   Forwards DOM interaction events so the parent Three.js scene
   can react to cursor movement and clicks over the monitor.
   Keep this bridge intact — the rest of OS interactivity (window
   dragging, icon clicks, etc.) continues to work locally alongside.
   ============================================================ */

const post = (type, e) => {
  window.parent.postMessage(
    {
      type,
      clientX: e.clientX,
      clientY: e.clientY,
      key: e.key,
    },
    '*'
  );
};

window.addEventListener('mousemove',  (e) => post('mousemove', e));
window.addEventListener('mousedown',  (e) => post('mousedown', e));
window.addEventListener('mouseup',    (e) => post('mouseup', e));
window.addEventListener('keydown',    (e) => post('keydown', e));
window.addEventListener('keyup',      (e) => post('keyup', e));
