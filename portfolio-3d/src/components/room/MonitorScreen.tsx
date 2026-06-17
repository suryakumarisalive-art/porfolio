'use client'

import { useEffect, useState } from 'react'
import { CanvasTexture } from 'three'
import { PROJECTS } from '@/content/projects'

const SCREEN_POS: [number, number, number] = [0, 950, 255]
const SCREEN_ROT: [number, number, number] = [-3 * (Math.PI / 180), 0, 0]
const PLANE_W = 1280
const PLANE_H = 1024
const TEX_W   = 512
const TEX_H   = 400

export function MonitorScreen() {
  const [texture, setTexture] = useState<CanvasTexture | null>(null)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width  = TEX_W
    canvas.height = TEX_H
    const tex = new CanvasTexture(canvas)
    let intervalId = 0

    document.fonts.ready.then(() => {
      let cursorOn = true
      const draw = () => {
        drawScreen(canvas, cursorOn)
        tex.needsUpdate = true
      }
      draw()
      setTexture(tex)
      intervalId = window.setInterval(() => {
        cursorOn = !cursorOn
        draw()
      }, 550)
    })

    return () => {
      clearInterval(intervalId)
      tex.dispose()
    }
  }, [])

  if (!texture) return null

  return (
    <mesh position={SCREEN_POS} rotation={SCREEN_ROT} renderOrder={1}>
      <planeGeometry args={[PLANE_W, PLANE_H]} />
      <meshBasicMaterial map={texture} depthTest={false} />
    </mesh>
  )
}

// ─── Canvas renderer ──────────────────────────────────────────────────────────

function drawScreen(canvas: HTMLCanvasElement, cursorOn: boolean) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const W = canvas.width
  const H = canvas.height

  // Background
  ctx.fillStyle = 'rgb(4,10,4)'
  ctx.fillRect(0, 0, W, H)

  // Title bar
  ctx.fillStyle = 'rgb(8,14,8)'
  ctx.fillRect(0, 0, W, 38)
  ctx.strokeStyle = 'rgba(0,255,65,0.18)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, 38); ctx.lineTo(W, 38); ctx.stroke()

  // Traffic light dots
  const dots = [{ x: 18, c: '#ff3b30' }, { x: 34, c: '#ffbb00' }, { x: 50, c: '#00ff41' }]
  dots.forEach(({ x, c }) => {
    ctx.fillStyle = c
    ctx.shadowColor = c
    ctx.shadowBlur = 6
    ctx.beginPath(); ctx.arc(x, 19, 5.5, 0, Math.PI * 2); ctx.fill()
  })
  ctx.shadowBlur = 0

  ctx.fillStyle = '#00ff41'
  ctx.shadowColor = '#00ff41'
  ctx.shadowBlur = 8
  ctx.font = 'bold 13px monospace'
  ctx.fillText('PORTFOLIO.EXE', 66, 25)
  ctx.shadowBlur = 0
  ctx.fillStyle = 'rgba(0,255,65,0.45)'
  ctx.font = '10px monospace'
  ctx.fillText('[2025]', W - 58, 25)

  // Body — start below title bar
  let y = 60
  const line = (text: string, color = '#00ff41', glow = false, size = 11) => {
    ctx.font = `${size}px monospace`
    ctx.fillStyle = color
    ctx.shadowColor = '#00ff41'
    ctx.shadowBlur = glow ? 8 : 0
    ctx.fillText(text, 20, y)
    ctx.shadowBlur = 0
    y += size + 5
  }

  line('PHOSPHOR OS  v3.1.4  —  ready', 'rgba(0,255,65,0.45)')
  line('MEM: 640K OK   CPU: 4.77 MHz', 'rgba(0,255,65,0.45)')
  line('─────────────────────────────')
  line('WELCOME,  DEVELOPER.', '#afffbf', true, 12)
  line('─────────────────────────────')

  y += 6
  line('RECENT WORK:', 'rgba(0,255,65,0.45)', false, 10)
  y += 2

  PROJECTS.slice(0, 3).forEach((project, i) => {
    const rowY = y
    ctx.font = '10px monospace'
    ctx.fillStyle = 'rgba(0,255,65,0.45)'
    ctx.fillText(String(i + 1).padStart(2, '0'), 20, rowY)
    ctx.font = '11px monospace'
    ctx.fillStyle = '#00ff41'
    ctx.shadowColor = '#00ff41'; ctx.shadowBlur = 5
    ctx.fillText(project.title.toUpperCase().slice(0, 26), 44, rowY)
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(0,255,65,0.45)'
    ctx.font = '10px monospace'
    ctx.fillText(String(project.year), W - 50, rowY)
    y += 26
    // row separator
    ctx.strokeStyle = 'rgba(0,255,65,0.08)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(20, y - 6); ctx.lineTo(W - 20, y - 6); ctx.stroke()
  })

  y += 8
  line('─────────────────────────────')
  // Prompt
  ctx.font = '12px monospace'
  ctx.fillStyle = '#00ff41'
  ctx.shadowColor = '#00ff41'; ctx.shadowBlur = 6
  ctx.fillText('C:\\> ', 20, y)
  ctx.shadowBlur = 0
  if (cursorOn) {
    ctx.fillStyle = '#00ff41'
    ctx.shadowColor = '#00ff41'; ctx.shadowBlur = 8
    ctx.fillText('█', 20 + 42, y)
    ctx.shadowBlur = 0
  }

  // Scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  for (let sy = 0; sy < H; sy += 4) {
    ctx.fillRect(0, sy + 3, W, 1)
  }

  // Vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.72)
  vg.addColorStop(0, 'transparent')
  vg.addColorStop(1, 'rgba(0,0,0,0.68)')
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, W, H)
}
