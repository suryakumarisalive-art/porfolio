'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { CanvasLoader } from '@/components/loaders/CanvasLoader'
import { UILayer } from '@/components/ui/UILayer'
import { FilmGrain } from '@/components/atmosphere/FilmGrain'
import { AccessibilityShadow } from '@/components/a11y/AccessibilityShadow'
import { usePortfolioActions } from '@/store/usePortfolioStore'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useCameraInteractions } from '@/hooks/useCameraInteractions'

// Dynamic import with ssr:false — MUST be called from a 'use client' component
const CanvasScene = dynamic(
  () => import('./scene/CanvasScene').then((m) => m.CanvasScene),
  { ssr: false, loading: () => <CanvasLoader /> }
)

/**
 * Top-level client entry — mounts canvas, UI, a11y shadow, and global hooks.
 * page.tsx imports this from a Server Component; the dynamic import handles SSR exclusion.
 */
export function PortfolioExperience() {
  const { setReducedMotion } = usePortfolioActions()

  // Initialise reduced-motion preference from OS
  useReducedMotion()

  // Global keyboard bindings (Escape to reset camera, etc.)
  useCameraInteractions()

  // Detect reduced motion for GSAP / CSS animations
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setReducedMotion])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Accessibility shadow DOM — keyboard nav + screen reader text */}
      <AccessibilityShadow />

      {/* 3D canvas — aria-hidden, a11y shadow handles AT interaction */}
      <CanvasScene />

      {/* Film-grain atmosphere — soft-light over the canvas, below the UI */}
      <FilmGrain />

      {/* 2D UI layer — taskbar, modals, loader overlay */}
      <UILayer />
    </div>
  )
}
