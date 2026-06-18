'use client'

import { useProgress } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import { useLifecycle, useWebglHealthy, usePortfolioStore } from '@/store/usePortfolioStore'
import { fadeIn, fadeOut } from '@/lib/gsap'

const BOOT_LINES = [
  { threshold: 0,   text: 'PHOSPHOR OS  v3.1.4  ................  OK' },
  { threshold: 20,  text: 'Loading geometry  ........................  OK' },
  { threshold: 50,  text: 'Loading textures  .......................  OK' },
  { threshold: 80,  text: 'Initializing scene  .....................  OK' },
]

/**
 * Loading overlay — BIOS-style boot sequence while assets load,
 * then a gated [ENTER] button before the camera intro fires.
 *
 * Lifecycle: booting → loading → loaded (show ENTER) → ready (camera intro)
 */
export function CanvasLoader() {
  const { progress, active } = useProgress()
  const lifecycle    = useLifecycle()
  const webglHealthy = useWebglHealthy()
  const setLifecycle = usePortfolioStore((s) => s.setLifecycle)
  const rootRef      = useRef<HTMLDivElement>(null)
  const [exiting, setExiting] = useState(false)

  // Lifecycle transitions
  useEffect(() => {
    if (active && lifecycle === 'booting') {
      setLifecycle('loading')
    }
    // Pause at 'loaded' — wait for the user to press ENTER
    if (!active && lifecycle === 'loading') {
      setLifecycle('loaded')
    }
  }, [active, lifecycle, setLifecycle])

  // Fade in on mount
  useEffect(() => {
    fadeIn(rootRef.current, { duration: 0.4 })
  }, [])

  const isContextLost = !webglHealthy || lifecycle === 'context-lost'
  const isLoaded      = lifecycle === 'loaded' && !isContextLost

  // Once ready, unmount — the GSAP exit animation has already completed
  if (lifecycle === 'ready') return null

  const handleEnter = () => {
    if (exiting) return
    setExiting(true)
    fadeOut(rootRef.current, {
      duration:   0.5,
      onComplete: () => setLifecycle('ready'),
    })
  }

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label={isContextLost ? 'Reconnecting render engine' : 'Loading 3D scene'}
      style={{
        position:       'absolute',
        inset:          0,
        zIndex:         'var(--z-loader)' as never,
        pointerEvents:  'auto',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        background:     'var(--color-bg)',
        fontFamily:     'var(--font-mono)',
        color:          'var(--color-text)',
        opacity:        0,
      }}
    >
      {isContextLost ? (
        <ContextLostView />
      ) : (
        <BIOSView
          progress={progress}
          lifecycle={lifecycle}
          isLoaded={isLoaded}
          onEnter={handleEnter}
          exiting={exiting}
        />
      )}
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function BIOSView({
  progress,
  lifecycle,
  isLoaded,
  onEnter,
  exiting,
}: {
  progress: number
  lifecycle: string
  isLoaded: boolean
  onEnter: () => void
  exiting: boolean
}) {
  const visibleLines = BOOT_LINES.filter((l) => progress >= l.threshold)

  return (
    <div style={{ width: 340, textAlign: 'left' }}>
      {/* Header */}
      <p
        style={{
          fontSize:      'var(--text-xs)',
          color:         'var(--color-accent)',
          marginBottom:  'var(--space-6)',
          letterSpacing: '0.08em',
          opacity:       0.6,
        }}
      >
        SURYA.DEV / PORTFOLIO.EXE
      </p>

      {/* Boot lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {visibleLines.map((line) => (
          <p
            key={line.threshold}
            style={{
              fontSize:  'var(--text-xs)',
              color:     'var(--color-text-muted)',
              animation: 'bios-line-in 0.3s var(--ease-out-expo) both',
            }}
          >
            {line.text}
          </p>
        ))}
      </div>

      {/* Progress bar — visible while loading */}
      {!isLoaded && lifecycle !== 'booting' && (
        <div
          style={{
            marginTop:    'var(--space-6)',
            width:        '100%',
            height:       1,
            background:   'var(--color-border)',
            borderRadius: 'var(--radius-full)',
            overflow:     'hidden',
          }}
        >
          <div
            style={{
              height:     '100%',
              width:      `${progress}%`,
              background: 'var(--color-accent)',
              transition: 'width 200ms ease',
            }}
          />
        </div>
      )}

      {/* ENTER gate — appears when all assets loaded */}
      {isLoaded && !exiting && (
        <button
          onClick={onEnter}
          style={{
            marginTop:     'var(--space-8)',
            background:    'transparent',
            border:        '1px solid var(--color-accent)',
            borderRadius:  'var(--radius-sm)',
            color:         'var(--color-accent)',
            fontFamily:    'var(--font-mono)',
            fontSize:      'var(--text-sm)',
            fontWeight:    600,
            padding:       'var(--space-3) var(--space-6)',
            cursor:        'pointer',
            letterSpacing: '0.1em',
            animation:     'enter-pulse 1.4s ease-in-out infinite',
          }}
        >
          [ ENTER ]
        </button>
      )}
    </div>
  )
}

function ContextLostView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
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
      />
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
        Reconnecting Render Engine
      </p>
    </div>
  )
}
