import * as THREE from 'three'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { World } from './World.js'
import { Camera } from './Camera.js'
import { AudioManager } from './Audio.js'
import { RaycasterManager } from './Raycaster.js'
import { LoadingScreen } from './LoadingScreen.js'

export class Experience {
  constructor({ canvas, cssContainer }) {
    this.canvas       = canvas
    this.cssContainer = cssContainer
    this.sizes        = { width: window.innerWidth, height: window.innerHeight }
    this._started     = false

    this.uiInteractive = document.getElementById('ui-interactive')

    // WebGL renderer — high quality settings
    this.renderer = this._makeWebGLRenderer()

    // CSS3DRenderer — lives inside cssContainer, pointer-events ALWAYS on
    this.cssRenderer = this._makeCSSRenderer()

    this.scene     = new THREE.Scene()
    this.camera    = new Camera(this)
    this.world     = new World(this)
    this.audio     = new AudioManager()
    this.raycaster = new RaycasterManager(this)

    // BIOS loading/start screen — drives the boot sequence
    this.loading = new LoadingScreen(document.getElementById('loading-screen'), {
      onStart: () => this.enterScene(),
    })

    document.getElementById('mute-btn')?.addEventListener('click', () => {
      this.audio.toggle()
      document.getElementById('mute-btn').classList.toggle('muted')
    })

    window.addEventListener('resize', () => this._onResize())
    window.addEventListener('message', (e) => this._onOSMessage(e))

    // Begin loading immediately — the BIOS screen shows live progress
    this.world.loadModels()
    this._tick()
  }

  // Click START → reveal the room, kick off audio + camera intro
  enterScene() {
    if (this._started) return
    this._started = true
    this.loading.hide()
    this.uiInteractive.classList.remove('hidden')
    this.audio.init().then(() => {
      this.audio.playStartup()
      setTimeout(() => this.audio.startAmbience(), 1500)
    })
    this.camera.animateIn()
  }

  // Messages from the in-monitor desktop iframe (os/os.js)
  _onOSMessage(e) {
    const msg = e.data
    if (!msg || msg.source !== 'os') return
    switch (msg.type) {
      case 'keypress':
        this.audio.playType()
        break
      case 'go-back':
        this.world.hideMonitor()
        this.camera.zoomOut()
        break
      case 'app-open':
        this.audio.playMouseDown()
        break
      // 'open-url' is handled by the iframe itself via window.open
    }
  }

  _makeWebGLRenderer() {
    const r = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    r.setSize(this.sizes.width, this.sizes.height)
    r.outputColorSpace = THREE.SRGBColorSpace
    // Reference uses no tone mapping (NoToneMapping) and a transparent clear
    r.setClearColor(0x000000, 0)
    r.shadowMap.enabled = false
    return r
  }

  _makeCSSRenderer() {
    const r = new CSS3DRenderer()
    r.setSize(this.sizes.width, this.sizes.height)
    // CSS3DRenderer domElement MUST have pointer-events auto — OrbitControls listens here
    r.domElement.style.position      = 'absolute'
    r.domElement.style.top           = '0'
    r.domElement.style.left          = '0'
    r.domElement.style.pointerEvents = 'auto'
    this.cssContainer.appendChild(r.domElement)
    return r
  }

  onLoadItem(label) {
    this.loading.addItem(label)
  }

  onLoadProgress(loaded, total) {
    this.loading.setProgress(loaded, total)
  }

  onLoadComplete() {
    this.loading.finish()
  }

  // When zoomed into monitor, let the iframe receive clicks
  enableCSSInteraction()  {
    if (this.world._cssObject) {
      this.world._cssObject.element.style.pointerEvents = 'auto'
    }
  }
  disableCSSInteraction() {
    if (this.world._cssObject) {
      this.world._cssObject.element.style.pointerEvents = 'none'
    }
  }

  _onResize() {
    this.sizes.width  = window.innerWidth
    this.sizes.height = window.innerHeight
    this.camera.instance.aspect = this.sizes.width / this.sizes.height
    this.camera.instance.updateProjectionMatrix()
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.cssRenderer.setSize(this.sizes.width, this.sizes.height)
    this.camera.controls?.update()
  }

  _tick() {
    this.camera.update()
    this.renderer.render(this.scene, this.camera.instance)
    this.cssRenderer.render(this.scene, this.camera.instance)
    requestAnimationFrame(() => this._tick())
  }
}
