'use client'

import { useEffect, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { CanvasTexture } from 'three'
import * as THREE from 'three'

// Local coords — placed by the parent Monitor group. Screen sits just in front
// of the bezel, facing +Z (toward the camera).
const SCREEN_POS: [number, number, number] = [0, 0, 0.013]
const PLANE_W = 0.60
const PLANE_H = 0.345
const TEX_W   = 1024
const TEX_H   = 590

/**
 * The monitor's glowing display. A clean, modern portfolio home screen drawn to
 * a CanvasTexture and shown on an unlit (MeshBasicMaterial) plane so it emits
 * its own light and the bloom pass picks up the bright accent pixels.
 *
 * No CRT scanlines, no grain — a crisp dark UI with a single accent colour.
 */
export function MonitorScreen() {
  const [texture, setTexture] = useState<CanvasTexture | null>(null)
  const { invalidate } = useThree()
  const invalidateRef = useRef(invalidate)
  invalidateRef.current = invalidate

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width  = TEX_W
    canvas.height = TEX_H
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    let intervalId = 0

    document.fonts.ready.then(() => {
      let caretOn = true
      const draw = () => {
        drawScreen(canvas, caretOn)
        tex.needsUpdate = true
        invalidateRef.current()
      }
      draw()
      setTexture(tex)
      intervalId = window.setInterval(() => {
        caretOn = !caretOn
        draw()
      }, 600)
    })

    return () => {
      clearInterval(intervalId)
      tex.dispose()
    }
  }, [])

  if (!texture) return null

  return (
    <mesh position={SCREEN_POS}>
      <planeGeometry args={[PLANE_W, PLANE_H]} />
      {/* Unlit + toneMapped=false → screen glows and triggers bloom */}
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}

// ─── Clean modern screen UI ─────────────────────────────────────────────────────

const ACCENT = '#5b8cff'

function drawScreen(canvas: HTMLCanvasElement, caretOn: boolean) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const W = canvas.width
  const H = canvas.height

  // Background — deep slate with a subtle top-down gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#141821')
  bg.addColorStop(1, '#0d1018')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Top menu bar
  ctx.fillStyle = '#1b212e'
  ctx.fillRect(0, 0, W, 64)
  // window dots
  ;['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
    ctx.fillStyle = c
    ctx.beginPath(); ctx.arc(36 + i * 30, 32, 8, 0, Math.PI * 2); ctx.fill()
  })
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '500 22px system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText('portfolio — home', 150, 33)

  // Hero heading
  ctx.fillStyle = '#f4f6fb'
  ctx.font = '700 64px system-ui, sans-serif'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('Surya Kumar', 56, 190)

  ctx.fillStyle = ACCENT
  ctx.font = '500 30px system-ui, sans-serif'
  ctx.fillText('Creative Developer', 58, 234)

  // caret
  if (caretOn) {
    ctx.fillStyle = ACCENT
    ctx.fillRect(58 + ctx.measureText('Creative Developer').width + 10, 210, 4, 28)
  }

  // Project cards row
  const cards = ['Projects', 'About', 'Contact']
  const cardW = 270, cardH = 150, gap = 36, startX = 56, startY = 300
  cards.forEach((label, i) => {
    const x = startX + i * (cardW + gap)
    // card surface
    roundRect(ctx, x, startY, cardW, cardH, 16)
    ctx.fillStyle = '#1d2433'
    ctx.fill()
    // accent top edge
    roundRect(ctx, x, startY, cardW, 6, 3)
    ctx.fillStyle = ACCENT
    ctx.fill()
    // label
    ctx.fillStyle = '#dfe5f0'
    ctx.font = '600 28px system-ui, sans-serif'
    ctx.fillText(label, x + 24, startY + 56)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '400 18px system-ui, sans-serif'
    ctx.fillText('Open  →', x + 24, startY + 100)
  })

  // Footer status line
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.font = '400 18px system-ui, sans-serif'
  ctx.fillText('● online   ·   double-click any object to explore', 56, H - 36)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
