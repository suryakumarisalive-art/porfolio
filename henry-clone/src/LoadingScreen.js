/* ───────────────────────────────────────────────────────────
   BIOS-style loading + start screen.
   Faithful reproduction of the reference boot sequence:
   top-left HHBIOS-style header/body/footer with a live resource
   list, then a centred START popup once everything is loaded.

   Owner-specific text is parameterised below so it can be
   swapped for the site owner's real identity later.
   ─────────────────────────────────────────────────────────── */

const OWNER = {
  // Two-line "logo" shown top-left, surname first like the reference
  logoLine1: 'Heffernan,',
  logoLine2: 'Henry Inc.',
  biosTag:   'HHBIOS (C)2000 Heffernan Henry Inc.,',
  released:  'Released: 01/13/2000',
  showcase:  'Henry Heffernan Portfolio Showcase 2022',
  launchName:"'Henry Heffernan Portfolio Showcase'",
}

const GREEN = '#15b800'

export class LoadingScreen {
  constructor(root, { onStart }) {
    this.root     = root          // #loading-screen element
    this.onStart  = onStart
    this._loaded  = 0
    this._total   = 0
    this._items   = []
    this._done    = false
    this._render()
  }

  _dateStr() {
    const d = new Date()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${mm}/${dd}/${d.getFullYear()}`
  }

  _render() {
    this.root.innerHTML = `
      <div class="loading-screen-header jitter" style="display:flex;flex-direction:row">
        <div style="display:flex;flex-direction:row">
          <div>
            <p style="color:${GREEN}"><b>${OWNER.logoLine1}</b> </p>
            <p style="color:${GREEN}"><b>${OWNER.logoLine2}</b></p>
          </div>
        </div>
        <div style="margin-left:64px">
          <p>${OWNER.released}</p>
          <p>${OWNER.biosTag}</p>
        </div>
      </div>

      <div class="loading-screen-body" style="flex:1;display:flex;flex-direction:column;width:100%">
        <p>HSP S13 2000-2022 Special UC131S</p>
        <div class="ls-spacer"></div>
        <p>HSP Showcase(tm) XX 113</p>
        <p>Checking RAM : 14000 OK</p>
        <div class="ls-spacer"></div>
        <div class="ls-spacer"></div>
        <p id="ls-status" class="loading">WAIT</p>
        <div class="ls-spacer"></div>
        <div id="ls-list" style="display:flex;padding-left:32px;padding-bottom:32px;flex-direction:column"></div>
        <div class="ls-spacer"></div>
        <p id="ls-launch" class="hidden">All Content Loaded, launching <b style="color:${GREEN}">${OWNER.launchName}</b> V1.0</p>
        <div class="ls-spacer"></div>
        <span class="blinking-cursor"></span>
      </div>

      <div class="loading-screen-footer jitter" style="box-sizing:border-box;width:100%">
        <p>Press <b>DEL</b> to enter SETUP , <b>ESC</b> to skip memory test</p>
        <p>${this._dateStr()}</p>
      </div>

      <!-- Centred START popup (hidden until loaded) -->
      <div id="ls-popup" class="ls-popup-container hidden">
        <div class="ls-start-popup">
          <p>${OWNER.showcase}</p>
          <div id="ls-warning" class="hidden">
            <br/>
            <b>
              <p style="color:yellow">WARNING: This experience is best viewed on</p>
              <p style="color:yellow">a desktop or laptop computer.</p>
            </b>
            <br/>
          </div>
          <div style="display:flex;align-items:flex-end">
            <p>Click start to begin&nbsp;</p>
            <span class="blinking-cursor"></span>
          </div>
          <div style="display:flex;justify-content:center;align-items:center;margin-top:16px">
            <div class="bios-start-button" id="start-btn" tabindex="0" role="button" aria-label="Start">
              <p>START</p>
            </div>
          </div>
        </div>
      </div>`

    this.statusEl = this.root.querySelector('#ls-status')
    this.listEl   = this.root.querySelector('#ls-list')
    this.launchEl = this.root.querySelector('#ls-launch')
    this.popupEl  = this.root.querySelector('#ls-popup')

    // Mobile-warning visibility mirrors the reference
    if (window.innerWidth < 1024) {
      this.root.querySelector('#ls-warning')?.classList.remove('hidden')
    }
  }

  // Called as each named resource starts loading
  addItem(label) {
    if (this._items.includes(label)) return
    this._items.push(label)
    const p = document.createElement('p')
    p.textContent = label
    this.listEl.appendChild(p)
  }

  setProgress(loaded, total) {
    this._loaded = loaded
    this._total  = total
    if (this._done) return
    this.statusEl.classList.add('loading')
    this.statusEl.textContent = `LOADING RESOURCES (${loaded}/${total === 0 ? '-' : total})`
  }

  finish() {
    this._done = true
    this.statusEl.classList.remove('loading')
    this.statusEl.textContent = 'FINISHED LOADING RESOURCES'
    this.launchEl.classList.remove('hidden')

    // Reveal the centred START popup after a short BIOS-style beat
    setTimeout(() => {
      this.popupEl.classList.remove('hidden')
      const btn = this.root.querySelector('#start-btn')
      const go = () => {
        btn.removeEventListener('click', go)
        btn.removeEventListener('keydown', goKey)
        this.onStart()
      }
      const goKey = (e) => { if (e.key === 'Enter' || e.key === ' ') go() }
      btn.addEventListener('click', go)
      btn.addEventListener('keydown', goKey)
      btn.focus()
    }, 500)
  }

  hide() {
    this.root.style.transition = 'opacity 600ms'
    this.root.style.opacity = '0'
    setTimeout(() => this.root.classList.add('hidden'), 650)
  }
}
