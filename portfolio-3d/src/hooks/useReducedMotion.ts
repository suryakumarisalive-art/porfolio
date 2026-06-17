'use client'

import { useEffect } from 'react'
import { usePortfolioStore } from '@/store/usePortfolioStore'

/**
 * Subscribes to `prefers-reduced-motion` OS media query and writes the result
 * to the portfolio store so every component reads from a single source of truth.
 * Mount this hook once near the top of the component tree.
 */
export function useReducedMotion(): void {
  const setReducedMotion = usePortfolioStore((s) => s.setReducedMotion)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setReducedMotion])
}
