import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export class World {
  constructor(exp) {
    this.exp          = exp
    this.clickTargets = []
    this._monitorOpen = false

    this._setupLighting()
    this._loadModels()
  }

  _setupLighting() {
    // Scene uses baked textures — only ambient light needed
    const ambient = new THREE.AmbientLight(0xffffff, 1)
    this.exp.scene.add(ambient)
  }

  _loadModels() {
    const draco = new DRACOLoader()
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')

    const loader = new GLTFLoader()
    loader.setDRACOLoader(draco)

    const manager = new THREE.LoadingManager(
      // onLoad
      () => this.exp.onLoadComplete(),
      // onProgress
      (_, loaded, total) => this.exp.onLoadProgress(loaded, total)
    )
    const mloader = new GLTFLoader(manager)
    mloader.setDRACOLoader(draco)

    // Load the three GLB models (Henry's assets reused for local study)
    const models = [
      { path: 'models/World/environment.glb',    bakedTex: 'models/World/baked_environment.jpg' },
      { path: 'models/Computer/computer_setup.glb', bakedTex: 'models/Computer/baked_computer.jpg' },
      { path: 'models/Decor/decor.glb',          bakedTex: 'models/Decor/baked_decor_modified.jpg' },
    ]

    models.forEach(({ path, bakedTex }) => {
      const tex = new THREE.TextureLoader().load(bakedTex)
      tex.flipY = false
      tex.colorSpace = THREE.SRGBColorSpace

      const mat = new THREE.MeshBasicMaterial({ map: tex })

      mloader.load(path, (gltf) => {
        gltf.scene.traverse(child => {
          if (child.isMesh) {
            child.material = mat

            // Tag monitor screen mesh for click detection
            if (/screen|monitor|display/i.test(child.name)) {
              child.userData.action = 'openMonitor'
              this.clickTargets.push(child)
            }
          }
        })
        this.exp.scene.add(gltf.scene)
      })
    })

    // Monitor overlay textures (smudge + shadow)
    this._addMonitorOverlays()
  }

  _addMonitorOverlays() {
    const texLoader = new THREE.TextureLoader()

    const smudgeTex  = texLoader.load('textures/monitor/layers/compressed/smudges.jpg')
    const shadowTex  = texLoader.load('textures/monitor/layers/compressed/shadow-compressed.png')

    smudgeTex.colorSpace = THREE.SRGBColorSpace
    shadowTex.colorSpace = THREE.SRGBColorSpace

    // These will be parented to the monitor mesh once the model loads
    // Stored for later attachment in showMonitor()
    this._smudgeTex = smudgeTex
    this._shadowTex = shadowTex
  }

  showMonitor() {
    this._monitorOpen = true
    const frame = this.exp.osFrame
    frame.classList.remove('hidden')
    frame.style.pointerEvents = 'auto'
    // Position iframe over the canvas area corresponding to the monitor
    frame.style.position = 'fixed'
    frame.style.left     = '0'
    frame.style.top      = '0'
    frame.style.width    = '100vw'
    frame.style.height   = '100vh'
    frame.style.zIndex   = '10'
    frame.style.border   = 'none'
    frame.style.background = '#000'
  }

  hideMonitor() {
    this._monitorOpen = false
    const frame = this.exp.osFrame
    frame.style.pointerEvents = 'none'
    frame.classList.add('hidden')
  }

  update() {
    this.exp.camera.update()
  }
}
