import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/* Exact camera keyframes from the reference experience.
   The whole scene lives in a ~900x coordinate space (models scaled 900),
   so all positions are in the tens-of-thousands range. */
const KEY = {
  loading:            { pos: new THREE.Vector3(-35000, 35000, 35000), focal: new THREE.Vector3(0, -5000, 0) },
  idle:               { pos: new THREE.Vector3(-20000, 12000, 20000), focal: new THREE.Vector3(0, -1000, 0) },
  desk:               { pos: new THREE.Vector3(0, 1800, 5500),        focal: new THREE.Vector3(0, 500, 0) },
  monitor:            { pos: new THREE.Vector3(0, 950, 2000),         focal: new THREE.Vector3(0, 950, 0) },
  // Free-orbit home — framed close on the desk so the computer + screen read well
  orbitControlsStart: { pos: new THREE.Vector3(0, 1500, 4600),        focal: new THREE.Vector3(0, 800, 0) },
}

export class Camera {
  constructor(exp) {
    this.exp = exp

    // fov 35, near 10, far 900000 — matches the reference
    this.instance = new THREE.PerspectiveCamera(
      35,
      exp.sizes.width / exp.sizes.height,
      10,
      900000
    )
    this.instance.position.copy(KEY.loading.pos)
    this.instance.lookAt(KEY.loading.focal)
    exp.scene.add(this.instance)

    this._anim  = null
    this._focal = KEY.loading.focal.clone()

    // OrbitControls attached to the CSS3DRenderer element (pointer-events: auto)
    this.controls = new OrbitControls(this.instance, exp.cssRenderer.domElement)
    this.controls.target.copy(KEY.orbitControlsStart.focal)
    this.controls.enablePan     = false
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.maxPolarAngle = Math.PI / 2
    this.controls.minDistance   = 2200    // stay outside the screen
    this.controls.maxDistance   = 9000    // keep the desk framed (no flying into empty space)
    this.controls.enabled       = false   // enabled after the intro tween
  }

  // Click START → ease from the loading view into free-orbit
  animateIn() {
    this._moveTo(KEY.orbitControlsStart.pos, KEY.orbitControlsStart.focal, 2500, _easeOutExpo, () => {
      this.controls.target.copy(KEY.orbitControlsStart.focal)
      this.controls.enabled = true
    })
  }

  // Click the monitor → fly in (2000ms, reference bezier .13,.99,0,1)
  zoomIntoMonitor(onComplete) {
    this.controls.enabled = false
    this._moveTo(KEY.monitor.pos, KEY.monitor.focal, 2000, _bezier13, onComplete)
  }

  // Back out of the monitor → return to free-orbit
  zoomOut() {
    this._moveTo(KEY.orbitControlsStart.pos, KEY.orbitControlsStart.focal, 1200, _bezier13, () => {
      this.controls.target.copy(KEY.orbitControlsStart.focal)
      this.controls.enabled = true
    })
  }

  _moveTo(toPos, toFocal, duration, ease, onComplete) {
    this._anim = {
      fromPos:    this.instance.position.clone(),
      fromFocal:  this._focal.clone(),
      toPos:      toPos.clone(),
      toFocal:    toFocal.clone(),
      duration,
      ease:       ease || _easeInOutQuint,
      startTime:  performance.now(),
      onComplete: onComplete || null,
    }
  }

  update() {
    if (this._anim) {
      const a   = this._anim
      const raw = Math.min((performance.now() - a.startTime) / a.duration, 1)
      const t   = a.ease(raw)
      this.instance.position.lerpVectors(a.fromPos, a.toPos, t)
      this._focal.lerpVectors(a.fromFocal, a.toFocal, t)
      this.instance.lookAt(this._focal)
      if (raw >= 1) {
        this._anim = null
        if (a.onComplete) a.onComplete()
      }
    } else if (this.controls.enabled) {
      this.controls.update()
      this._focal.copy(this.controls.target)
    }
  }
}

/* Easing — matches the reference tween choices */
function _easeInOutQuint(x) {
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2
}
function _easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
}
// cubic-bezier(.13,.99,0,1) used for monitor enter/leave
function _bezier13(x) {
  const cx = 3 * 0.13, bx = 3 * (0 - 0.13) - cx, ax = 1 - cx - bx
  const cy = 3 * 0.99, by = 3 * (1 - 0.99) - cy, ay = 1 - cy - by
  const sampleX = (t) => ((ax * t + bx) * t + cx) * t
  const sampleY = (t) => ((ay * t + by) * t + cy) * t
  let t = x
  for (let i = 0; i < 5; i++) {
    const dx = sampleX(t) - x
    const d  = (3 * ax * t + 2 * bx) * t + cx
    if (Math.abs(d) < 1e-6) break
    t -= dx / d
  }
  return sampleY(t)
}
