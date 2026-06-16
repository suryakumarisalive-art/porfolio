import * as THREE from 'three'

export class RaycasterManager {
  constructor(exp) {
    this.exp       = exp
    this._rc       = new THREE.Raycaster()
    this._mouse    = new THREE.Vector2(-9, -9)
    this._hovering = false

    // Listen on the CSS container so events pass through both WebGL and CSS3D layers
    const el = exp.cssContainer
    el.addEventListener('mousemove', e => this._onMove(e))
    el.addEventListener('click',     e => this._onClick(e))
    el.addEventListener('mousedown', () => exp.audio.playMouseDown())
    el.addEventListener('mouseup',   () => exp.audio.playMouseUp())
  }

  _onMove(e) {
    this._mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1
    this._mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    this._rc.setFromCamera(this._mouse, this.exp.camera.instance)

    const hits = this._rc.intersectObjects(this.exp.world.clickTargets, false)
    const wasHovering = this._hovering
    this._hovering = hits.length > 0
    if (this._hovering !== wasHovering) {
      this.exp.cssContainer.style.cursor = this._hovering ? 'pointer' : ''
    }
  }

  _onClick(e) {
    if (this.exp.world._monitorOpen) return   // in monitor mode — clicks go to iframe

    this._rc.setFromCamera(this._mouse, this.exp.camera.instance)
    const hits = this._rc.intersectObjects(this.exp.world.clickTargets, false)
    if (!hits.length) return

    const action = hits[0].object.userData.action
    if (action === 'openMonitor') {
      this.exp.camera.zoomIntoMonitor(() => {
        this.exp.world.showMonitor()
      })
    }
  }
}
