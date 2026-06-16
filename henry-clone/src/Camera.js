import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const POS = {
  initial:  { pos: new THREE.Vector3(0, 3, 9),       target: new THREE.Vector3(0, 0.5, 0) },
  overview: { pos: new THREE.Vector3(3.2, 2.2, 4.8),  target: new THREE.Vector3(0, 0.8, 0) },
  monitor:  { pos: new THREE.Vector3(0.55, 1.18, 1.45), target: new THREE.Vector3(0.55, 1.08, 0) },
}

export class Camera {
  constructor(exp) {
    this.exp = exp
    this.instance = new THREE.PerspectiveCamera(
      45,
      exp.sizes.width / exp.sizes.height,
      0.1,
      100
    )
    this.instance.position.copy(POS.initial.pos)
    exp.scene.add(this.instance)

    this._anim   = null
    this._target = POS.initial.target.clone()

    // Attach OrbitControls to CSS3DRenderer domElement — it has pointer-events: auto
    this.controls = new OrbitControls(this.instance, exp.cssRenderer.domElement)
    this.controls.target.copy(POS.initial.target)
    this.controls.enableDamping   = true
    this.controls.dampingFactor   = 0.04
    this.controls.enablePan       = false
    this.controls.rotateSpeed     = 0.6
    this.controls.zoomSpeed       = 0.8
    this.controls.minDistance     = 1.8
    this.controls.maxDistance     = 11
    this.controls.minPolarAngle   = Math.PI * 0.08
    this.controls.maxPolarAngle   = Math.PI * 0.62
    this.controls.enabled         = false  // enabled after scene loads
  }

  animateIn() {
    this._moveTo(POS.overview.pos, POS.overview.target, 2200, () => {
      this.controls.target.copy(POS.overview.target)
      this.controls.enabled = true
    })
  }

  zoomIntoMonitor(onComplete) {
    this.controls.enabled = false
    this._moveTo(POS.monitor.pos, POS.monitor.target, 1800, onComplete)
  }

  zoomOut() {
    this._moveTo(POS.overview.pos, POS.overview.target, 1600, () => {
      this.controls.target.copy(POS.overview.target)
      this.controls.enabled = true
    })
  }

  _moveTo(toPos, toTarget, duration, onComplete) {
    this._anim = {
      fromPos:    this.instance.position.clone(),
      fromTarget: this._target.clone(),
      toPos:      toPos.clone(),
      toTarget:   toTarget.clone(),
      duration,
      startTime:  performance.now(),
      onComplete: onComplete || null,
    }
  }

  update() {
    if (this._anim) {
      const { fromPos, fromTarget, toPos, toTarget, duration, startTime, onComplete } = this._anim
      const raw = Math.min((performance.now() - startTime) / duration, 1)
      const t   = _easeInOutQuart(raw)

      this.instance.position.lerpVectors(fromPos, toPos, t)
      this._target.lerpVectors(fromTarget, toTarget, t)
      this.instance.lookAt(this._target)

      if (raw >= 1) {
        this._anim = null
        if (onComplete) onComplete()
      }
    } else if (this.controls.enabled) {
      this.controls.update()
      this._target.copy(this.controls.target)
    }
  }
}

function _easeInOutQuart(x) {
  return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2
}
