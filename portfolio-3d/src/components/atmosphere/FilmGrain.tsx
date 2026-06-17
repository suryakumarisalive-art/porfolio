'use client'

import { useEffect, useRef } from 'react'
import { useIsReducedMotion } from '@/store/usePortfolioStore'

// ─── Tuning — mirrors henry-clone's Overlay (soft-light grain pass) ───────────
const GRAIN_OPACITY   = 0.08   // subtle — atmosphere, not texture
const GRAIN_RES       = 160    // low-res noise tile, stretched fullscreen
const FRAME_MS        = 42     // ~24fps — film cadence, cheap on GPU

/**
 * Animated film-grain overlay composited over the canvas with mix-blend-mode
 * soft-light at low opacity. Generates fresh noise into a small offscreen
 * buffer each tick and stretches it to fullscreen — the noise hides the upscale.
 *
 * Honours prefers-reduced-motion: renders a single static grain frame and stops.
 */
export function FilmGrain() {
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const isReducedMotion = useIsReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width  = GRAIN_RES
    canvas.height = GRAIN_RES
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const image = ctx.createImageData(GRAIN_RES, GRAIN_RES)
    const buffer = image.data

    const drawGrain = () => {
      // Monochrome noise — each pixel a random grey, full alpha
      for (let i = 0; i < buffer.length; i += 4) {
        const v = (Math.random() * 255) | 0
        buffer[i] = v
        buffer[i + 1] = v
        buffer[i + 2] = v
        buffer[i + 3] = 255
      }
      ctx.putImageData(image, 0, 0)
    }

    // Reduced motion: one static frame, no animation loop
    if (isReducedMotion) {
      drawGrain()
      return
    }

    let rafId = 0
    let last  = 0
    const tick = (now: number) => {
      if (now - last >= FRAME_MS) {
        last = now
        drawGrain()
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(rafId)
  }, [isReducedMotion])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:       'fixed',
        inset:          0,
        width:          '100%',
        height:         '100%',
        opacity:        GRAIN_OPACITY,
        mixBlendMode:   'soft-light',
        pointerEvents:  'none',
        zIndex:         'var(--z-grain)' as never,
        // Crisp-edged scaling keeps the grain looking like film, not blur
        imageRendering: 'pixelated',
      }}
    />
  )
}
