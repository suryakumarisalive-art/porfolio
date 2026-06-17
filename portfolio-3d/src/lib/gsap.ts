'use client'

import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

// Register useGSAP plugin once — idempotent
gsap.registerPlugin(useGSAP)

/**
 * Central GSAP entry-point.
 * Import gsap and useGSAP from here, not from 'gsap' or '@gsap/react' directly,
 * to guarantee the plugin is registered before first use.
 */
export { gsap, useGSAP }

/**
 * Animate `opacity` 0 → 1 on `element` with compositor-only transform.
 * Respects prefers-reduced-motion — snaps instantly when reduced motion is set.
 */
export function fadeIn(
  element: HTMLElement | null,
  options: { duration?: number; delay?: number; onComplete?: () => void } = {}
): gsap.core.Tween | null {
  if (!element) return null
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return gsap.fromTo(
    element,
    { opacity: 0 },
    {
      opacity:    1,
      duration:   reducedMotion ? 0 : (options.duration ?? 0.4),
      delay:      reducedMotion ? 0 : (options.delay ?? 0),
      ease:       'power2.out',
      onComplete: options.onComplete,
    }
  )
}

/**
 * Animate `opacity` 1 → 0 and call `onComplete` when done.
 */
export function fadeOut(
  element: HTMLElement | null,
  options: { duration?: number; onComplete?: () => void } = {}
): gsap.core.Tween | null {
  if (!element) return null
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return gsap.to(element, {
    opacity:    0,
    duration:   reducedMotion ? 0 : (options.duration ?? 0.3),
    ease:       'power2.in',
    onComplete: options.onComplete,
  })
}
