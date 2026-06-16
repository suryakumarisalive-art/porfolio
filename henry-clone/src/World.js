import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

// Monitor face position & orientation in 3D space (tweak to match your GLB)
const MONITOR = {
  position: new THREE.Vector3(0.55, 1.08, 0.18),
  rotation: new THREE.Euler(0, 0, 0),
  // iframe dimensions in CSS pixels mapped to 3D units
  // scale so it fills the monitor screen face
  iframeW: 1024,
  iframeH: 768,
  scale:   0.00165,   // 1 CSS-px = scale 3D units
}

export class World {
  constructor(exp) {
    this.exp          = exp
    this.clickTargets = []
    this._monitorOpen = false
    this._cssObject   = null

    this._setupLighting()
    this._createMonitorCSS3D()
    // Models are loaded on demand (after START)
  }

  _setupLighting() {
    this.exp.scene.add(new THREE.AmbientLight(0xffffff, 1))
  }

  _createMonitorCSS3D() {
    // Build the iframe that will sit on the monitor face
    const iframe = document.createElement('iframe')
    iframe.src   = 'os/index.html'
    iframe.style.width  = MONITOR.iframeW + 'px'
    iframe.style.height = MONITOR.iframeH + 'px'
    iframe.style.border = 'none'
    iframe.style.background = '#008080'
    iframe.sandbox = 'allow-scripts allow-same-origin'
    iframe.title   = 'Desktop OS'

    const cssObj = new CSS3DObject(iframe)
    cssObj.position.copy(MONITOR.position)
    cssObj.rotation.copy(MONITOR.rotation)
    cssObj.scale.setScalar(MONITOR.scale)
    cssObj.visible = false   // hidden until zoomed in
    this._cssObject = cssObj
    this.exp.scene.add(cssObj)
  }

  loadModels() {
    const draco = new DRACOLoader()
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')

    const manager = new THREE.LoadingManager(
      () => this.exp.onLoadComplete(),
      (_, loaded, total) => this.exp.onLoadProgress(loaded, total)
    )

    const loader = new GLTFLoader(manager)
    loader.setDRACOLoader(draco)

    const texLoader = new THREE.TextureLoader(manager)

    const models = [
      { path: 'models/World/environment.glb',       tex: 'models/World/baked_environment.jpg' },
      { path: 'models/Computer/computer_setup.glb',  tex: 'models/Computer/baked_computer.jpg' },
      { path: 'models/Decor/decor.glb',              tex: 'models/Decor/baked_decor_modified.jpg' },
    ]

    models.forEach(({ path, tex }) => {
      const texture = texLoader.load(tex)
      texture.flipY        = false
      texture.colorSpace   = THREE.SRGBColorSpace
      const mat = new THREE.MeshBasicMaterial({ map: texture })

      loader.load(path, (gltf) => {
        gltf.scene.traverse(child => {
          if (!child.isMesh) return
          child.material = mat

          // Register monitor screen as click target
          if (/screen|monitor|display|glass/i.test(child.name)) {
            child.userData.action = 'openMonitor'
            this.clickTargets.push(child)
          }
        })
        this.exp.scene.add(gltf.scene)
      })
    })

    // Overlay textures on monitor (smudges / shadow)
    const smudge = texLoader.load('textures/monitor/layers/compressed/smudges.jpg')
    const shadow = texLoader.load('textures/monitor/layers/compressed/shadow-compressed.png')
    smudge.colorSpace = THREE.SRGBColorSpace
    shadow.colorSpace = THREE.SRGBColorSpace
    this._smudgeTex = smudge
    this._shadowTex = shadow
  }

  showMonitor() {
    this._monitorOpen = true
    if (this._cssObject) this._cssObject.visible = true
    this.exp.enableCSSInteraction()
  }

  hideMonitor() {
    this._monitorOpen = false
    if (this._cssObject) this._cssObject.visible = false
    this.exp.disableCSSInteraction()
  }

  update() {}
}
