import * as THREE from 'three'

export class RaycasterManager {
  constructor(exp) {
    this.exp       = exp
    this._rc       = new THREE.Raycaster()
    this._mouse    = new THREE.Vector2(-9, -9)
    this._hovering = false

    window.addEventListener('mousemove', e => this._onMove(e))
    window.addEventListener('click',     e => this._onClick(e))
    window.addEventListener('mousedown', () => exp.audio.playMouseDown())
    window.addEventListener('mouseup',   () => exp.audio.playMouseUp())
  }

  _onMove(e) {
    this._mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1
    this._mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    this._rc.setFromCamera(this._mouse, this.exp.camera.instance)

    const hits = this._rc.intersectObjects(this.exp.world.clickTargets, false)
    const wasHovering = this._hovering
    this._hovering = hits.length > 0
    if (this._hovering !== wasHovering) {
      document.body.style.cursor = this._hovering ? 'pointer' : 'default'
    }
  }

  _onClick(e) {
    this._rc.setFromCamera(this._mouse, this.exp.camera.instance)
    const hits = this._rc.intersectObjects(this.exp.world.clickTargets, false)
    if (!hits.length) return

    const obj = hits[0].object
    if (obj.userData.action === 'openMonitor') {
      this.exp.camera.zoomIntoMonitor(() => {
        this.exp.world.showMonitor()
      })
    } else if (obj.userData.action === 'back') {
      this.exp.camera.zoomOut()
      this.exp.world.hideMonitor()
    }
  }
}
