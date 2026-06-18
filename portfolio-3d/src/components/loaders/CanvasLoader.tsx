'use client'

import { useProgress } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import { useLifecycle, useWebglHealthy, usePortfolioStore } from '@/store/usePortfolioStore'
import { fadeIn, fadeOut } from '@/lib/gsap'

// Exact same colour as the 3D canvas background — zero discontinuity on load
const SCENE_BG = '#c7ccd1'

/**
 * Loading overlay — clean, henry-clone style.
 * Shows name + thin progress bar while assets load,
 * then a minimal "Enter" button before the camera intro fires.
 *
 * Lifecycle: booting → loading → loaded (show Enter) → ready (camera intro)
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
    if (active && lifecycle === 'booting') setLifecycle('loading')
    if (!active && lifecycle === 'loading') setLifecycle('loaded')
  }, [active, lifecycle, setLifecycle])

  // Fade in on mount
  useEffect(() => {
    fadeIn(rootRef.current, { duration: 0.5 })
  }, [])

  const isContextLost = !webglHealthy || lifecycle === 'context-lost'
  const isLoaded      = lifecycle === 'loaded' && !isContextLost

  if (lifecycle === 'ready') return null

  const handleEnter = () => {
    if (exiting) return
    setExiting(true)
    fadeOut(rootRef.current, {
      duration:   0.6,
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
        background:     SCENE_BG,
        opacity:        0,
      }}
    >
      {isContextLost ? (
        <ContextLostView />
      ) : (
        <MainView
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

function MainView({
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
  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           '44px',
        width:         300,
        textAlign:     'center',
      }}
    >
      {/* Identity */}
      <div>
        <p
          style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '10px',
            color:         'rgba(0,0,0,0.38)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom:  '10px',
          }}
        >
          Interactive Portfolio
        </p>
        <h1
          style={{
            fontFamily:    'var(--font-sans)',
            fontSize:      '26px',
            fontWeight:    700,
            color:         '#111',
            letterSpacing: '-0.02em',
            lineHeight:    1,
          }}
        >
          Surya Kumar
        </h1>
      </div>

      {/* Progress bar — only while loading, hidden when loaded */}
      {!isLoaded && lifecycle !== 'booting' && (
        <div
          style={{
            width:        180,
            height:       1,
            background:   'rgba(0,0,0,0.12)',
            borderRadius: 999,
            overflow:     'hidden',
          }}
        >
          <div
            style={{
              height:       '100%',
              width:        `${progress}%`,
              background:   'rgba(0,0,0,0.5)',
              borderRadius: 999,
              transition:   'width 200ms ease',
            }}
          />
        </div>
      )}

      {/* Enter gate — appears when assets finish loading */}
      {isLoaded && !exiting && (
        <button
          onClick={onEnter}
          style={{
            background:    'transparent',
            border:        '1px solid rgba(0,0,0,0.22)',
            borderRadius:  '3px',
            color:         'rgba(0,0,0,0.65)',
            fontFamily:    'var(--font-mono)',
            fontSize:      '10px',
            fontWeight:    600,
            padding:       '11px 26px',
            cursor:        'pointer',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            animation:     'enter-pulse 1.6s ease-in-out infinite',
          }}
        >
          Enter
        </button>
      )}
    </div>
  )
}

function ContextLostView() {
  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           '14px',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width:        22,
          height:       22,
          border:       '1.5px solid rgba(0,0,0,0.12)',
          borderTop:    '1.5px solid rgba(0,0,0,0.5)',
          borderRadius: '50%',
          animation:    'spin 1s linear infinite',
        }}
      />
      <p
        style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      '10px',
          color:         'rgba(0,0,0,0.4)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        Reconnecting…
      </p>
    </div>
  )
}
