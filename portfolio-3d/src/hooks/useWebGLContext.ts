'use client'

import { useCallback } from 'react'
import type { RootState } from '@react-three/fiber'
import { usePortfolioStore } from '@/store/usePortfolioStore'

/**
 * Returns an `onCreated` callback for the R3F Canvas that registers
 * WebGL context-loss / context-restored event handlers on the renderer canvas.
 *
 * Context loss flow:
 * 1. `webglcontextlost` fires → preventDefault (allows restore to fire) → mark unhealthy
 * 2. The CanvasLoader reads `webglHealthy === false` and shows "Reconnecting Render Engine"
 * 3. `webglcontextrestored` fires → mark healthy again; Three.js re-inits automatically
 */
export function useWebGLContext() {
  const setWebglHealthy = usePortfolioStore((s) => s.setWebglHealthy)
  const setLifecycle    = usePortfolioStore((s) => s.setLifecycle)

  const onCreated = useCallback(
    (state: RootState) => {
      const canvas = state.gl.domElement

      const onLost = (e: Event) => {
        // preventDefault is REQUIRED for webglcontextrestored to fire
        e.preventDefault()
        setWebglHealthy(false)
        setLifecycle('context-lost')
      }

      const onRestored = () => {
        setWebglHealthy(true)
        setLifecycle('ready')
      }

      canvas.addEventListener('webglcontextlost', onLost)
      canvas.addEventListener('webglcontextrestored', onRestored)

      // Cleanup — canvas is removed on unmount
      return () => {
        canvas.removeEventListener('webglcontextlost', onLost)
        canvas.removeEventListener('webglcontextrestored', onRestored)
      }
    },
    [setWebglHealthy, setLifecycle]
  )

  return { onCreated }
}
