import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

const MONITOR = {
  position: new THREE.Vector3(0.55, 1.08, 0.18),
  rotation: new THREE.Euler(0, 0, 0),
  iframeW:  1024,
  iframeH:  768,
  scale:    0.00165,
}

export class World {
  constructor(exp) {
    this.exp          = exp
    this.clickTargets = []
    this._monitorOpen = false
    this._cssObject   = null

    this._maxAnisotropy = exp.renderer.capabilities.getMaxAnisotropy()

    this.exp.scene.add(new THREE.AmbientLight(0xffffff, 1))
    this._createMonitorCSS3D()
  }

  _createMonitorCSS3D() {
    const iframe = document.createElement('iframe')
    iframe.src    = 'os/index.html'
    iframe.style.width  = MONITOR.iframeW + 'px'
    iframe.style.height = MONITOR.iframeH + 'px'
    iframe.style.border = 'none'
    iframe.style.background     = '#008080'
    iframe.style.pointerEvents  = 'none'  // enabled only when zoomed in
    iframe.sandbox = 'allow-scripts allow-same-origin'
    iframe.title   = 'Desktop OS'

    const cssObj = new CSS3DObject(iframe)
    cssObj.position.copy(MONITOR.position)
    cssObj.rotation.copy(MONITOR.rotation)
    cssObj.scale.setScalar(MONITOR.scale)
    cssObj.visible   = false
    this._cssObject  = cssObj
    this.exp.scene.add(cssObj)
  }

  loadModels() {
    const draco = new DRACOLoader()
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')

    const manager = new THREE.LoadingManager(
      () => this.exp.onLoadComplete(),
      (_, loaded, total) => this.exp.onLoadProgress(loaded, total)
    )

    const loader    = new GLTFLoader(manager)
    const texLoader = new THREE.TextureLoader(manager)
    loader.setDRACOLoader(draco)

    const models = [
      { path: 'models/World/environment.glb',       tex: 'models/World/baked_environment.jpg' },
      { path: 'models/Computer/computer_setup.glb',  tex: 'models/Computer/baked_computer.jpg' },
      { path: 'models/Decor/decor.glb',              tex: 'models/Decor/baked_decor_modified.jpg' },
    ]

    models.forEach(({ path, tex }) => {
      const texture = texLoader.load(tex)
      texture.flipY       = false
      texture.colorSpace  = THREE.SRGBColorSpace
      // High quality texture filtering — eliminates pixelation when rotating
      texture.anisotropy  = this._maxAnisotropy
      texture.minFilter   = THREE.LinearMipmapLinearFilter
      texture.magFilter   = THREE.LinearFilter
      texture.generateMipmaps = true

      const mat = new THREE.MeshBasicMaterial({ map: texture })

      loader.load(path, (gltf) => {
        gltf.scene.traverse(child => {
          if (!child.isMesh) return
          child.material = mat
          child.frustumCulled = true

          if (/screen|monitor|display|glass/i.test(child.name)) {
            child.userData.action = 'openMonitor'
            this.clickTargets.push(child)
          }
        })
        this.exp.scene.add(gltf.scene)
      })
    })
  }

  showMonitor() {
    this._monitorOpen = true
    this._cssObject.visible = true
    this.exp.enableCSSInteraction()

    // Show back button
    let backBtn = document.getElementById('back-btn')
    if (!backBtn) {
      backBtn = document.createElement('button')
      backBtn.id        = 'back-btn'
      backBtn.textContent = '← Back'
      backBtn.className = 'back-btn'
      document.getElementById('ui-interactive').appendChild(backBtn)
      backBtn.addEventListener('click', () => {
        this.exp.world.hideMonitor()
        this.exp.camera.zoomOut()
      })
    }
    backBtn.style.display = 'block'
  }

  hideMonitor() {
    this._monitorOpen    = false
    this._cssObject.visible = false
    this.exp.disableCSSInteraction()
    const backBtn = document.getElementById('back-btn')
    if (backBtn) backBtn.style.display = 'none'
  }

  update() {}
}
