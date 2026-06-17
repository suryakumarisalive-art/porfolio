'use client'

import { useProgress } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { useLifecycle, useWebglHealthy, usePortfolioStore } from '@/store/usePortfolioStore'
import { fadeIn } from '@/lib/gsap'

/**
 * Loading lifecycle overlay — covers the canvas during boot and model loading.
 * Also renders the WebGL context-lost "Reconnecting Render Engine" state.
 *
 * Lifecycle sequence: booting → loading (progress %) → ready (fade out)
 */
export function CanvasLoader() {
  const { progress, active } = useProgress()
  const lifecycle    = useLifecycle()
  const webglHealthy = useWebglHealthy()
  const setLifecycle = usePortfolioStore((s) => s.setLifecycle)
  const rootRef      = useRef<HTMLDivElement>(null)

  // Advance lifecycle: when drei says loading is done, mark ready
  useEffect(() => {
    if (!active && lifecycle === 'loading') {
      setLifecycle('ready')
    }
    if (active && lifecycle === 'booting') {
      setLifecycle('loading')
    }
  }, [active, lifecycle, setLifecycle])

  // Fade in on mount
  useEffect(() => {
    fadeIn(rootRef.current, { duration: 0.4 })
  }, [])

  const isContextLost = !webglHealthy || lifecycle === 'context-lost'
  const isReady       = lifecycle === 'ready' && !isContextLost

  // Hide when ready and healthy — the canvas takes over
  if (isReady) return null

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label={isContextLost ? 'Reconnecting render engine' : 'Loading 3D scene'}
      style={{
        position:        'absolute',
        inset:           0,
        zIndex:          'var(--z-loader)' as never,
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        gap:             '1.5rem',
        background:      'var(--color-bg)',
        fontFamily:      'var(--font-mono)',
        color:           'var(--color-text)',
        opacity:         0,
      }}
    >
      {isContextLost ? (
        <>
          <ContextLostSpinner />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Reconnecting Render Engine
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Attempting to restore WebGL context…
          </p>
        </>
      ) : (
        <>
          <ProgressBar progress={progress} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {lifecycle === 'booting' ? 'Initialising…' : `Loading scene — ${Math.round(progress)}%`}
          </p>
        </>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width:        260,
        height:       2,
        background:   'var(--color-border)',
        borderRadius: 'var(--radius-full)',
        overflow:     'hidden',
      }}
    >
      <div
        style={{
          height:      '100%',
          width:       `${progress}%`,
          background:  'var(--color-accent)',
          borderRadius: 'var(--radius-full)',
          transition:  'width 200ms ease',
        }}
      />
    </div>
  )
}

function ContextLostSpinner() {
  return (
    <div
      aria-hidden="true"
      style={{
        width:        32,
        height:       32,
        border:       '2px solid var(--color-border)',
        borderTop:    '2px solid var(--color-accent)',
        borderRadius: '50%',
        animation:    'spin 1s linear infinite',
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
