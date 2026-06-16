import * as THREE from 'three'

// Camera positions matching Henry's scene layout
const POSITIONS = {
  initial:  { pos: new THREE.Vector3(0, 2.5, 8),   target: new THREE.Vector3(0, 0.5, 0) },
  overview: { pos: new THREE.Vector3(3.5, 2.2, 5),  target: new THREE.Vector3(0, 0.8, 0) },
  monitor:  { pos: new THREE.Vector3(0.55, 1.15, 1.4), target: new THREE.Vector3(0.55, 1.05, 0) },
}

export class Camera {
  constructor(exp) {
    this.exp = exp
    this.instance = new THREE.PerspectiveCamera(45, exp.sizes.width / exp.sizes.height, 0.1, 100)
    this.instance.position.copy(POSITIONS.initial.pos)
    this.instance.lookAt(POSITIONS.initial.target)
    exp.scene.add(this.instance)

    this._target     = POSITIONS.initial.target.clone()
    this._animating  = false
    this._t          = 0
    this._fromPos    = this.instance.position.clone()
    this._toPos      = this.instance.position.clone()
    this._fromTarget = this._target.clone()
    this._toTarget   = this._target.clone()
  }

  animateIn() {
    this._moveTo(POSITIONS.overview.pos, POSITIONS.overview.target, 2200)
  }

  zoomIntoMonitor(onComplete) {
    this._moveTo(POSITIONS.monitor.pos, POSITIONS.monitor.target, 1800, onComplete)
  }

  zoomOut() {
    this._moveTo(POSITIONS.overview.pos, POSITIONS.overview.target, 1600)
  }

  _moveTo(toPos, toTarget, duration, onComplete) {
    this._fromPos    = this.instance.position.clone()
    this._fromTarget = this._target.clone()
    this._toPos      = toPos.clone()
    this._toTarget   = toTarget.clone()
    this._duration   = duration
    this._startTime  = performance.now()
    this._onComplete = onComplete || null
    this._animating  = true
  }

  update() {
    if (!this._animating) return
    const elapsed = performance.now() - this._startTime
    const raw = Math.min(elapsed / this._duration, 1)
    const t   = _easeInOutQuart(raw)

    this.instance.position.lerpVectors(this._fromPos, this._toPos, t)
    this._target.lerpVectors(this._fromTarget, this._toTarget, t)
    this.instance.lookAt(this._target)

    if (raw >= 1) {
      this._animating = false
      if (this._onComplete) this._onComplete()
    }
  }
}

function _easeInOutQuart(x) {
  return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2
}
