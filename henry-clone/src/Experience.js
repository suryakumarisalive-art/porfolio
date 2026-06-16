import * as THREE from 'three'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { World } from './World.js'
import { Camera } from './Camera.js'
import { AudioManager } from './Audio.js'
import { RaycasterManager } from './Raycaster.js'

export class Experience {
  constructor({ canvas, cssContainer }) {
    this.canvas       = canvas
    this.cssContainer = cssContainer
    this.sizes        = { width: window.innerWidth, height: window.innerHeight }

    // Loading UI refs
    this.loadingLine1  = document.getElementById('loading-line-1')
    this.loadingLine2  = document.getElementById('loading-line-2')
    this.loadingLine3  = document.getElementById('loading-line-3')
    this.loadingScreen = document.getElementById('loading-screen')
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

    document.getElementById('mute-btn')?.addEventListener('click', () => {
      this.audio.toggle()
      document.getElementById('mute-btn').classList.toggle('muted')
    })

    window.addEventListener('resize', () => this._onResize())
    this._tick()
  }

  start() {
    document.getElementById('start-btn').style.display = 'none'
    if (this.loadingLine1) this.loadingLine1.textContent = 'Loading scene...'
    this.world.loadModels()
    this.audio.init()
  }

  _makeWebGLRenderer() {
    const r = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    r.setSize(this.sizes.width, this.sizes.height)
    r.outputColorSpace  = THREE.SRGBColorSpace
    r.toneMapping       = THREE.ACESFilmicToneMapping
    r.toneMappingExposure = 1.0
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

  onLoadProgress(loaded, total) {
    const pct = Math.round((loaded / total) * 100)
    if (this.loadingLine1) this.loadingLine1.textContent = `Loading scene... ${pct}%`
    if (pct > 30 && this.loadingLine2) this.loadingLine2.textContent = 'Parsing geometry...'
    if (pct > 70 && this.loadingLine3) this.loadingLine3.textContent = 'Uploading textures...'
  }

  onLoadComplete() {
    this.loadingScreen.style.transition = 'opacity 800ms'
    this.loadingScreen.style.opacity    = '0'
    setTimeout(() => {
      this.loadingScreen.classList.add('hidden')
      this.uiInteractive.classList.remove('hidden')
    }, 850)
    this.audio.playStartup()
    setTimeout(() => this.audio.startAmbience(), 1500)
    this.camera.animateIn()
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
