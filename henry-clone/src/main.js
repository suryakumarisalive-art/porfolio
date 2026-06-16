import './style.css'
import { Experience } from './Experience.js'

const isMobile = () => window.innerWidth < 640 || !supportsWebGL()

function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

if (isMobile()) {
  document.getElementById('mobile-fallback').classList.remove('hidden')
  document.getElementById('ui-app').classList.add('hidden')
} else {
  // Experience boots itself: loads assets, shows the BIOS screen, and
  // wires its own START button (handled inside LoadingScreen).
  new Experience({
    canvas:       document.getElementById('webgl'),
    cssContainer: document.getElementById('css'),
  })
}
