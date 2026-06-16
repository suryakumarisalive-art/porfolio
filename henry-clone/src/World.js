import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

/* Exact monitor transform from the reference experience.
   Scene is in a ~900x space; the screen is 1280x1024 world units. */
const MONITOR = {
  position: new THREE.Vector3(0, 950, 255),
  rotation: new THREE.Euler(-3 * THREE.MathUtils.DEG2RAD, 0, 0),
  width:    1280,
  height:   1024,
}
const MODEL_SCALE = 900

export class World {
  constructor(exp) {
    this.exp          = exp
    this.clickTargets = []
    this._monitorOpen = false
    this._cssObject   = null

    this._maxAnisotropy = exp.renderer.capabilities.getMaxAnisotropy()

    this._createMonitorCSS3D()
    this._createScreenClickPlane()
  }

  _createMonitorCSS3D() {
    const iframe = document.createElement('iframe')
    iframe.src    = 'os/index.html'
    iframe.id     = 'computer-screen'
    iframe.style.width     = MONITOR.width + 'px'
    iframe.style.height    = MONITOR.height + 'px'
    iframe.style.padding   = '32px'
    iframe.style.boxSizing = 'border-box'
    iframe.style.border    = 'none'
    iframe.style.background = '#1d2e2f'
    iframe.style.pointerEvents = 'none'   // enabled only when zoomed in
    iframe.sandbox = 'allow-scripts allow-same-origin allow-popups'
    iframe.title   = 'Desktop OS'
    iframe.className = 'jitter'

    const cssObj = new CSS3DObject(iframe)
    cssObj.position.copy(MONITOR.position)
    cssObj.rotation.copy(MONITOR.rotation)
    // scale 1 — the iframe's px dimensions are world units in the 900x scene
    this._cssObject = cssObj
    this.exp.scene.add(cssObj)
  }

  // Invisible plane co-located with the screen — reliable raycast click target
  _createScreenClickPlane() {
    const geo  = new THREE.PlaneGeometry(MONITOR.width, MONITOR.height)
    const mat  = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.copy(MONITOR.position)
    mesh.rotation.copy(MONITOR.rotation)
    mesh.userData.action = 'openMonitor'
    this._screenPlane = mesh
    this.clickTargets.push(mesh)
    this.exp.scene.add(mesh)
  }

  loadModels() {
    const draco = new DRACOLoader()
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')

    const sources = [
      { path: 'models/World/environment.glb',      tex: 'models/World/baked_environment.jpg' },
      { path: 'models/Computer/computer_setup.glb', tex: 'models/Computer/baked_computer.jpg' },
      { path: 'models/Decor/decor.glb',             tex: 'models/Decor/baked_decor_modified.jpg' },
    ]

    const manager = new THREE.LoadingManager(
      () => this.exp.onLoadComplete(),
      (url, loaded, total) => this.exp.onLoadProgress(loaded, total)
    )

    const loader    = new GLTFLoader(manager)
    const texLoader = new THREE.TextureLoader(manager)
    loader.setDRACOLoader(draco)

    sources.forEach(({ path, tex }) => {
      this.exp.onLoadItem(tex.split('/').pop())
      const texture = texLoader.load(tex)
      texture.flipY      = false
      texture.colorSpace = THREE.SRGBColorSpace
      // Quality: anisotropy + mipmaps keep baked textures crisp at angles
      texture.anisotropy      = this._maxAnisotropy
      texture.minFilter       = THREE.LinearMipmapLinearFilter
      texture.magFilter       = THREE.LinearFilter
      texture.generateMipmaps = true

      const material = new THREE.MeshBasicMaterial({ map: texture })

      loader.load(path, (gltf) => {
        gltf.scene.scale.setScalar(MODEL_SCALE)
        gltf.scene.traverse(child => {
          if (!child.isMesh) return
          child.material = material
          child.frustumCulled = true
        })
        this.exp.scene.add(gltf.scene)
      })
    })
  }

  showMonitor() {
    this._monitorOpen = true
    this.exp.enableCSSInteraction()
    this._ensureBackButton().style.display = 'block'
  }

  hideMonitor() {
    this._monitorOpen = false
    this.exp.disableCSSInteraction()
    const backBtn = document.getElementById('back-btn')
    if (backBtn) backBtn.style.display = 'none'
  }

  _ensureBackButton() {
    let backBtn = document.getElementById('back-btn')
    if (!backBtn) {
      backBtn = document.createElement('button')
      backBtn.id          = 'back-btn'
      backBtn.textContent = '← Back'
      backBtn.className    = 'back-btn'
      document.getElementById('ui-interactive').appendChild(backBtn)
      backBtn.addEventListener('click', () => {
        this.hideMonitor()
        this.exp.camera.zoomOut()
      })
    }
    return backBtn
  }

  update() {}
}
