'use client'

import { useEffect } from 'react'
import { usePortfolioStore } from '@/store/usePortfolioStore'

/**
 * Custom cursor state — swaps the system cursor to indicate interactivity
 * when hovering a 3D object.
 *
 * Degrades gracefully on touch / coarse-pointer devices (no custom cursor shown).
 * Respects reduced-motion by avoiding CSS animation on the cursor.
 */
export function useCustomPointer(): void {
  const hoveredId = usePortfolioStore((s) => s.hoveredId)

  useEffect(() => {
    // Only apply custom pointer on fine (mouse) pointers
    const isFinePointer = window.matchMedia('(pointer: fine)').matches
    if (!isFinePointer) return

    const root = document.documentElement
    if (hoveredId !== null) {
      root.style.cursor = 'pointer'
    } else {
      root.style.cursor = ''
    }
    return () => {
      root.style.cursor = ''
    }
  }, [hoveredId])
}
