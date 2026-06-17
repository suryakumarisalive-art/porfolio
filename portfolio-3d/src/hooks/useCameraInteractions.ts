'use client'

import { useEffect } from 'react'
import { usePortfolioStore } from '@/store/usePortfolioStore'

/**
 * Global keyboard bindings for camera and overlay control.
 *
 * - Escape: if an overlay is open → close it (overlay Escape takes priority
 *   to avoid also resetting the camera unexpectedly). If no overlay is open
 *   → reset camera to default.
 *
 * Guard: does not fire when focus is inside a form input (so typing in the
 * contact form never triggers a camera reset).
 */
export function useCameraInteractions(): void {
  const resetCamera  = usePortfolioStore((s) => s.resetCamera)
  const closeOverlay = usePortfolioStore((s) => s.closeOverlay)
  const isOverlayOpen = usePortfolioStore((s) => s.isOverlayOpen)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Guard: do not intercept when typing in an input / textarea / select
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return
      }

      if (e.key === 'Escape') {
        if (isOverlayOpen) {
          // Overlay gets first dibs on Escape
          closeOverlay()
        } else {
          // Nothing open → reset camera to default orbit position
          resetCamera()
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOverlayOpen, closeOverlay, resetCamera])
}
