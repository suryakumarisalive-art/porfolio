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
  document.getElementById('splash').classList.add('hidden')
} else {
  const startBtn = document.getElementById('start-btn')
  startBtn.addEventListener('click', startExperience, { once: true })
  startBtn.focus()
}

function startExperience() {
  const splash   = document.getElementById('splash')
  const loading  = document.getElementById('loading')

  splash.style.opacity = '0'
  splash.style.transition = 'opacity 400ms'
  setTimeout(() => {
    splash.classList.add('hidden')
    loading.classList.remove('hidden')
  }, 400)

  new Experience({
    canvas:      document.getElementById('webgl'),
    osFrame:     document.getElementById('os-frame'),
    loadingFill: document.getElementById('loading-fill'),
    loadingText: document.getElementById('loading-text'),
    loadingEl:   loading,
  })
}
