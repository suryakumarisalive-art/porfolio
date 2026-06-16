import * as THREE from 'three'

/* Film-grain atmosphere overlay — a second WebGL pass composited over the
   scene with mix-blend-mode: soft-light at low opacity, matching the
   reference experience's overlay renderer. A fullscreen grain quad keeps
   it robust regardless of camera position. */
export class Overlay {
  constructor(container) {
    this.scene  = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    const el = this.renderer.domElement
    el.style.position      = 'fixed'
    el.style.top           = '0'
    el.style.left          = '0'
    el.style.mixBlendMode  = 'soft-light'
    el.style.opacity       = '0.12'
    el.style.pointerEvents = 'none'
    container.appendChild(el)

    this.uniforms = { u_time: { value: 0 } }
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: /* glsl */`
        void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: /* glsl */`
        uniform float u_time;
        // golden-ratio gradient noise, as in the reference grain pass
        float gold(vec2 xy, float seed) {
          float PHI = 1.61803398874989484820459;
          return fract(tan(distance(xy * PHI, xy) * seed) * xy.x);
        }
        void main() {
          float n = gold(gl_FragCoord.xy, fract(u_time) + 1.0);
          gl_FragColor = vec4(vec3(n), 1.0);
        }
      `,
    })
    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat))
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  update(timeMs) {
    this.uniforms.u_time.value = Math.sin(0.01 * timeMs)
    this.renderer.render(this.scene, this.camera)
  }
}
