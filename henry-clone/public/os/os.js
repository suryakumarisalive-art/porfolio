/* ───────────────────────────────────────────────────────────
   Desktop OS core — registry-driven window manager, taskbar,
   start menu and shutdown sequence. Mirrors the reference:
   one app registry drives both desktop icons and windows;
   "My Showcase" auto-opens on boot.
   ─────────────────────────────────────────────────────────── */

const OS_NAME = 'PortfolioOS'   // reference rail reads "HeffernanOS"

const REGISTRY = [
  {
    key: 'showcase', name: 'My Showcase', glyph: '🖥️',
    bar: { title: '[Your Name] — Showcase', glyph: '🖥️', color: '#000080', status: '© 2025 [Your Name]' },
    size: () => ({ w: Math.min(window.innerWidth - 100, 980), h: Math.min(window.innerHeight - 100, 720) }),
    pos:  { top: 24, left: 56 },
    app: 'showcase', autoOpen: true,
  },
  {
    key: 'henordle', name: 'Henordle', glyph: '🟩',
    bar: { title: 'Henordle', glyph: '🎮', color: '#1c6b3c', status: '© 2025 [Your Name]' },
    size: () => ({ w: 600, h: 760 }), pos: { top: 40, left: 120 },
    app: 'henordle',
  },
  {
    key: 'credits', name: 'Credits', glyph: '📜',
    bar: { title: 'Credits', glyph: '📄', color: '#000080', status: 'A 3D portfolio' },
    size: () => ({ w: 760, h: 560 }), pos: { top: 48, left: 80 },
    app: 'credits',
  },
]

const MIN_W = 520, MIN_H = 220, TASKBAR_H = 36

let zCounter = 10
let activeKey = null
const openWindows = new Map() // key -> { el, taskBtn, def, prevRect }

/* ── postMessage to the 3D host (SFX, navigation, external links) ── */
function notifyParent(type, payload) {
  try { parent.postMessage({ source: 'os', type, ...(payload || {}) }, '*') } catch {}
}
function openUrl(url) {
  if (!url || url.startsWith('#')) return
  notifyParent('open-url', { url })
  window.open(url, '_blank', 'noopener')
}

/* ── DOM refs ── */
const desktop   = document.getElementById('desktop')
const taskBtns  = document.getElementById('task-btns')
const startBtn  = document.getElementById('start-btn')
const startMenu = document.getElementById('start-menu')
const clockEl   = document.getElementById('clock')

/* ─────────────────────────  Window manager  ───────────────────────── */
function openApp(key) {
  closeStartMenu()
  const def = REGISTRY.find(a => a.key === key)
  if (!def) return

  if (openWindows.has(key)) {
    const w = openWindows.get(key)
    w.el.classList.remove('minimized')
    focusWindow(key)
    return
  }

  const size = def.size()
  const el = document.createElement('div')
  el.className = 'window'
  el.id = 'win-' + key
  el.style.width  = size.w + 'px'
  el.style.height = size.h + 'px'
  el.style.left   = (def.pos?.left ?? 80) + 'px'
  el.style.top    = (def.pos?.top  ?? 40) + 'px'

  el.innerHTML = `
    <div class="window-title" style="background:linear-gradient(90deg, ${def.bar.color}, #1084d0)">
      <span class="ttl-glyph">${def.bar.glyph}</span>
      <span class="ttl-text">${def.bar.title}</span>
      <div class="window-btns">
        <button class="window-btn" data-act="min"  title="Minimize">_</button>
        <button class="window-btn" data-act="max"  title="Maximize">□</button>
        <button class="window-btn" data-act="close" title="Close">✕</button>
      </div>
    </div>
    <div class="window-content"></div>
    <div class="window-resize" title="Resize"></div>`

  desktop.appendChild(el)

  el.querySelector('[data-act="close"]').addEventListener('click', e => { e.stopPropagation(); closeApp(key) })
  el.querySelector('[data-act="min"]').addEventListener('click',   e => { e.stopPropagation(); minimizeApp(key) })
  el.querySelector('[data-act="max"]').addEventListener('click',   e => { e.stopPropagation(); toggleMaximize(key) })
  el.addEventListener('mousedown', () => focusWindow(key))

  makeDraggable(el, el.querySelector('.window-title'))
  makeResizable(el, el.querySelector('.window-resize'))

  // Taskbar button
  const taskBtn = document.createElement('button')
  taskBtn.className = 'task-btn'
  taskBtn.innerHTML = `<span class="ttl-glyph">${def.bar.glyph}</span><span>${def.bar.title}</span>`
  taskBtn.addEventListener('click', () => {
    if (activeKey === key && !el.classList.contains('minimized')) minimizeApp(key)
    else { el.classList.remove('minimized'); focusWindow(key) }
  })
  taskBtns.appendChild(taskBtn)

  openWindows.set(key, { el, taskBtn, def, prevRect: null })

  // Render the app body
  const content = el.querySelector('.window-content')
  const render = window.OSApps && window.OSApps[def.app]
  if (render) render(content, { openUrl })
  else content.textContent = 'App unavailable.'

  focusWindow(key)
  notifyParent('app-open', { app: key })
}

function focusWindow(key) {
  activeKey = key
  for (const [k, w] of openWindows) {
    const active = k === key
    w.el.classList.toggle('blurred', !active)
    w.taskBtn.classList.toggle('active', active && !w.el.classList.contains('minimized'))
  }
  const w = openWindows.get(key)
  if (w) w.el.style.zIndex = String(++zCounter)
}

function minimizeApp(key) {
  const w = openWindows.get(key)
  if (!w) return
  w.el.classList.add('minimized')
  w.taskBtn.classList.remove('active')
  if (activeKey === key) activeKey = null
}

function toggleMaximize(key) {
  const w = openWindows.get(key)
  if (!w) return
  if (w.prevRect) {
    Object.assign(w.el.style, w.prevRect)
    w.prevRect = null
  } else {
    w.prevRect = { width: w.el.style.width, height: w.el.style.height, top: w.el.style.top, left: w.el.style.left }
    w.el.style.left = '0px'; w.el.style.top = '0px'
    w.el.style.width = window.innerWidth + 'px'
    w.el.style.height = (window.innerHeight - TASKBAR_H) + 'px'
  }
  focusWindow(key)
}

function closeApp(key) {
  const w = openWindows.get(key)
  if (!w) return
  const content = w.el.querySelector('.window-content')
  if (content && content._cleanup) content._cleanup()
  w.el.remove()
  w.taskBtn.remove()
  openWindows.delete(key)
  if (activeKey === key) activeKey = null
}

/* ── Dragging (whole title bar) ── */
function makeDraggable(win, handle) {
  let dx = 0, dy = 0, dragging = false
  handle.addEventListener('mousedown', e => {
    if (e.target.closest('.window-btn')) return
    dragging = true; dx = e.clientX - win.offsetLeft; dy = e.clientY - win.offsetTop
    e.preventDefault()
  })
  document.addEventListener('mousemove', e => {
    if (!dragging) return
    const nx = Math.min(Math.max(e.clientX - dx, -win.offsetWidth + 80), window.innerWidth - 40)
    const ny = Math.min(Math.max(e.clientY - dy, 0), window.innerHeight - TASKBAR_H - 24)
    win.style.left = nx + 'px'; win.style.top = ny + 'px'
  })
  document.addEventListener('mouseup', () => { dragging = false })
}

/* ── Resizing (bottom-right handle, min 520x220) ── */
function makeResizable(win, handle) {
  let resizing = false, sx = 0, sy = 0, sw = 0, sh = 0
  handle.addEventListener('mousedown', e => {
    resizing = true; sx = e.clientX; sy = e.clientY
    sw = win.offsetWidth; sh = win.offsetHeight
    e.preventDefault(); e.stopPropagation()
  })
  document.addEventListener('mousemove', e => {
    if (!resizing) return
    win.style.width  = Math.max(MIN_W, sw + (e.clientX - sx)) + 'px'
    win.style.height = Math.max(MIN_H, sh + (e.clientY - sy)) + 'px'
  })
  document.addEventListener('mouseup', () => { resizing = false })
}

/* ─────────────────────────  Desktop icons  ───────────────────────── */
function buildDesktopIcons() {
  REGISTRY.forEach((def, i) => {
    const el = document.createElement('div')
    el.className = 'icon'
    el.tabIndex = 0
    el.style.top  = (16 + i * 92) + 'px'
    el.style.left = '16px'
    el.innerHTML = `<div class="glyph">${def.glyph}</div><span>${def.name}</span>`
    el.addEventListener('click', () => {
      document.querySelectorAll('.icon').forEach(n => n.classList.remove('selected'))
      el.classList.add('selected')
    })
    el.addEventListener('dblclick', () => openApp(def.key))
    desktop.appendChild(el)
  })
  desktop.addEventListener('mousedown', e => {
    if (e.target === desktop) document.querySelectorAll('.icon').forEach(n => n.classList.remove('selected'))
  })
}

/* ─────────────────────────  Start menu  ───────────────────────── */
function buildStartMenu() {
  document.getElementById('start-rail').textContent = OS_NAME
  const list = document.getElementById('start-list')
  REGISTRY.forEach(def => {
    const row = document.createElement('div')
    row.className = 'start-item'
    row.innerHTML = `<span class="si-glyph">${def.glyph}</span><span>${def.name}</span>`
    row.addEventListener('click', () => openApp(def.key))
    list.appendChild(row)
  })
  const sep = document.createElement('div'); sep.className = 'start-sep'; list.appendChild(sep)
  const shut = document.createElement('div')
  shut.className = 'start-item'
  shut.innerHTML = `<span class="si-glyph">🖥️</span><span>Sh<u>u</u>t down...</span>`
  shut.addEventListener('click', () => { closeStartMenu(); runShutdown() })
  list.appendChild(sep)
  list.appendChild(shut)
}
function toggleStartMenu() {
  const open = startMenu.classList.toggle('hidden') === false
  startBtn.classList.toggle('open', open)
}
function closeStartMenu() {
  startMenu.classList.add('hidden')
  startBtn.classList.remove('open')
}

/* ─────────────────────────  Shutdown easter egg  ───────────────────────── */
let shutdownCount = 0
const SNARK = [
  'Did you not read the last message?',
  '...all you wanna do is shut the computer down.',
  'Goodbye!',
  'Goodbye Again!',
  'Really...',
  '7th shutdown... lucky number 7!',
  'Your commitment is admirable, but the answer is still no.',
]
function runShutdown() {
  const el = document.getElementById('shutdown')
  el.classList.remove('hidden')
  el.textContent = ''
  const lines = shutdownCount === 0 ? [
    'Beginning Pre-Shutdown Sequence...',
    `Connecting to ${OS_NAME}01/13:2000...`,
    `Established connection, attempting data transfer.`,
    '[DEP_ANALYTICS_SERVER] InvalidFormatting',
    '[SOCKET_FAILED_TO_RESPOND] Connection Refused: Reconnecting...',
    'Transfer Failed.',
    'Aborting shutdown. Rebooting...',
  ] : [
    SNARK[Math.min(shutdownCount - 1, SNARK.length - 1)],
    'Rebooting...',
  ]
  shutdownCount++
  let i = 0
  const tick = () => {
    if (i < lines.length) { el.textContent += (i ? '\n' : '') + lines[i]; i++; setTimeout(tick, 600) }
    else setTimeout(() => el.classList.add('hidden'), 1100)
  }
  tick()
}

/* ─────────────────────────  Clock + SFX + boot  ───────────────────────── */
function tickClock() {
  const d = new Date()
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  clockEl.textContent = `${h}:${m} ${ap}`
}
function wireKeyboardSfx() { document.addEventListener('keydown', () => notifyParent('keypress'), true) }

function boot() {
  buildDesktopIcons()
  buildStartMenu()
  wireKeyboardSfx()

  startBtn.addEventListener('click', e => { e.stopPropagation(); toggleStartMenu() })
  document.addEventListener('mousedown', e => {
    if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) closeStartMenu()
  })

  tickClock(); setInterval(tickClock, 5000)

  // Auto-open the showcase, like the reference
  const auto = REGISTRY.find(a => a.autoOpen)
  if (auto) openApp(auto.key)
}

boot()
