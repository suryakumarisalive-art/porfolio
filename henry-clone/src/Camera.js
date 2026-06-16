import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const POS = {
  initial:  { pos: new THREE.Vector3(0, 3,  9),   target: new THREE.Vector3(0, 0.5, 0) },
  overview: { pos: new THREE.Vector3(3.2, 2.2, 4.8), target: new THREE.Vector3(0, 0.8, 0) },
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

    this._anim     = null
    this._target   = new THREE.Vector3().copy(POS.initial.target)

    this._setupControls()
  }

  _setupControls() {
    // OrbitControls on the CSS container div so mouse events work over both layers
    this.controls = new OrbitControls(this.instance, this.exp.cssContainer)
    this.controls.target.copy(POS.initial.target)
    this.controls.enableDamping   = true
    this.controls.dampingFactor   = 0.05
    this.controls.enablePan       = false
    this.controls.minDistance     = 2
    this.controls.maxDistance     = 12
    this.controls.minPolarAngle   = Math.PI * 0.1  // can't go below floor
    this.controls.maxPolarAngle   = Math.PI * 0.65
    this.controls.enabled         = false           // enabled after load
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
    this.controls.enabled = false
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
