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
    this.loadingLine1 = document.getElementById('loading-line-1')
    this.loadingLine2 = document.getElementById('loading-line-2')
    this.loadingLine3 = document.getElementById('loading-line-3')
    this.loadingScreen = document.getElementById('loading-screen')
    this.uiInteractive = document.getElementById('ui-interactive')

    // Renderers
    this.renderer    = this._makeWebGLRenderer()
    this.cssRenderer = this._makeCSSRenderer()

    // Scene
    this.scene    = new THREE.Scene()
    this.camera   = new Camera(this)
    this.world    = new World(this)
    this.audio    = new AudioManager()
    this.raycaster = new RaycasterManager(this)

    // Mute button
    document.getElementById('mute-btn')?.addEventListener('click', () => {
      this.audio.toggle()
      document.getElementById('mute-btn').classList.toggle('muted')
    })

    window.addEventListener('resize', () => this._onResize())
    this._tick()
  }

  start() {
    // Fade out START button, show loading progress
    document.getElementById('start-btn').style.display = 'none'
    this.loadingLine1.textContent = 'Loading scene...'
    this.world.loadModels()
    this.audio.init()
  }

  _makeWebGLRenderer() {
    const r = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true })
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    r.setSize(this.sizes.width, this.sizes.height)
    r.outputColorSpace = THREE.SRGBColorSpace
    r.shadowMap.enabled = false
    return r
  }

  _makeCSSRenderer() {
    const r = new CSS3DRenderer()
    r.setSize(this.sizes.width, this.sizes.height)
    r.domElement.style.position = 'absolute'
    r.domElement.style.top = '0'
    r.domElement.style.left = '0'
    r.domElement.style.pointerEvents = 'none'
    this.cssContainer.appendChild(r.domElement)
    return r
  }

  onLoadProgress(loaded, total) {
    const pct = Math.round((loaded / total) * 100)
    if (this.loadingLine1) this.loadingLine1.textContent = `Loading scene... ${pct}%`
    if (pct > 30 && this.loadingLine2) this.loadingLine2.textContent = 'Loading models...'
    if (pct > 70 && this.loadingLine3) this.loadingLine3.textContent = 'Baking textures...'
  }

  onLoadComplete() {
    // Fade out loading screen
    this.loadingScreen.style.transition = 'opacity 800ms'
    this.loadingScreen.style.opacity = '0'
    setTimeout(() => {
      this.loadingScreen.classList.add('hidden')
      this.uiInteractive.classList.remove('hidden')
    }, 850)

    this.audio.playStartup()
    setTimeout(() => this.audio.startAmbience(), 1500)
    this.camera.animateIn()
  }

  enableCSSInteraction() {
    this.cssContainer.querySelector('div').style.pointerEvents = 'auto'
  }

  disableCSSInteraction() {
    this.cssContainer.querySelector('div').style.pointerEvents = 'none'
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
