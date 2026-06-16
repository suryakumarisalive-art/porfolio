import * as THREE from 'three'
import { World } from './World.js'
import { Camera } from './Camera.js'
import { AudioManager } from './Audio.js'
import { RaycasterManager } from './Raycaster.js'

export class Experience {
  constructor({ canvas, osFrame, loadingFill, loadingText, loadingEl }) {
    this.canvas      = canvas
    this.osFrame     = osFrame
    this.loadingFill = loadingFill
    this.loadingText = loadingText
    this.loadingEl   = loadingEl

    this.renderer = this._makeRenderer()
    this.scene    = new THREE.Scene()
    this.sizes    = { width: window.innerWidth, height: window.innerHeight }

    this.camera    = new Camera(this)
    this.world     = new World(this)
    this.audio     = new AudioManager()
    this.raycaster = new RaycasterManager(this)

    window.addEventListener('resize', () => this._onResize())
    this._tick()
  }

  _makeRenderer() {
    const r = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true })
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    r.setSize(window.innerWidth, window.innerHeight)
    r.outputColorSpace = THREE.SRGBColorSpace
    r.shadowMap.enabled = false   // baked lighting — no real-time shadows needed
    return r
  }

  onLoadProgress(loaded, total) {
    const pct = Math.round((loaded / total) * 100)
    this.loadingFill.style.width = pct + '%'
    this.loadingText.textContent = `Loading… ${pct}%`
  }

  onLoadComplete() {
    this.loadingEl.style.opacity = '0'
    this.loadingEl.style.transition = 'opacity 600ms'
    setTimeout(() => this.loadingEl.classList.add('hidden'), 650)
    this.audio.playStartup()
    this.camera.animateIn()
  }

  _onResize() {
    this.sizes.width  = window.innerWidth
    this.sizes.height = window.innerHeight
    this.camera.instance.aspect = this.sizes.width / this.sizes.height
    this.camera.instance.updateProjectionMatrix()
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  _tick() {
    this.world.update()
    this.renderer.render(this.scene, this.camera.instance)
    requestAnimationFrame(() => this._tick())
  }
}
