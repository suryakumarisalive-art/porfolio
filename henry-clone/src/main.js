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
  const startBtn = document.getElementById('start-btn')
  const exp = new Experience({
    canvas:       document.getElementById('webgl'),
    cssContainer: document.getElementById('css'),
  })

  // START button click
  const handleStart = () => {
    startBtn.removeEventListener('click', handleStart)
    startBtn.removeEventListener('keydown', handleStartKey)
    exp.start()
  }
  const handleStartKey = (e) => { if (e.key === 'Enter' || e.key === ' ') handleStart() }

  startBtn.addEventListener('click', handleStart)
  startBtn.addEventListener('keydown', handleStartKey)
  startBtn.focus()
}
