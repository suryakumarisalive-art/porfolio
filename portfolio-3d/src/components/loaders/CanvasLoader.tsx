'use client'

import { useProgress } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import { useLifecycle, useWebglHealthy, usePortfolioStore } from '@/store/usePortfolioStore'
import { fadeIn, fadeOut } from '@/lib/gsap'

const OWNER = 'Surya Kumar'
const YEAR  = '2025'

/**
 * Start screen — a faithful replica of the henry-clone entry popup:
 * pure black full-screen with a centred white-bordered terminal box,
 * monospace text, and a START button. No BIOS dots, no gradients.
 *
 * Lifecycle: booting → loading → loaded (show START) → ready (camera intro)
 */
export function CanvasLoader() {
  const { progress, active } = useProgress()
  const lifecycle    = useLifecycle()
  const webglHealthy = useWebglHealthy()
  const setLifecycle = usePortfolioStore((s) => s.setLifecycle)
  const rootRef      = useRef<HTMLDivElement>(null)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (active && lifecycle === 'booting') setLifecycle('loading')
    if (!active && lifecycle === 'loading') setLifecycle('loaded')
  }, [active, lifecycle, setLifecycle])

  useEffect(() => {
    fadeIn(rootRef.current, { duration: 0.4 })
  }, [])

  const isContextLost = !webglHealthy || lifecycle === 'context-lost'
  const isLoaded      = lifecycle === 'loaded' && !isContextLost

  if (lifecycle === 'ready') return null

  const handleStart = () => {
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
        alignItems:     'center',
        justifyContent: 'center',
        background:     '#000',
        opacity:        0,
      }}
    >
      {/* Centred terminal box */}
      <div
        style={{
          border:     '2px solid #fff',
          background: '#000',
          padding:    '28px 32px',
          minWidth:   440,
          maxWidth:   '90vw',
        }}
      >
        {isContextLost ? (
          <p style={LINE_STYLE}>Reconnecting render engine…</p>
        ) : (
          <>
            <p style={LINE_STYLE}>{OWNER} Portfolio Showcase {YEAR}</p>

            {isLoaded ? (
              <>
                <p style={LINE_STYLE}>Click start to begin</p>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
                  <button
                    onClick={handleStart}
                    disabled={exiting}
                    style={BUTTON_STYLE}
                    className="start-btn"
                  >
                    START
                  </button>
                </div>
              </>
            ) : (
              <p style={LINE_STYLE}>
                Loading assets… {Math.round(progress)}%
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Styles — monospace white on black, henry-clone exact ──────────────────────

const LINE_STYLE: React.CSSProperties = {
  fontFamily:    'var(--font-mono)',
  fontSize:      '16px',
  lineHeight:    1.55,
  color:         '#fff',
  letterSpacing: '0.02em',
  whiteSpace:    'nowrap',
}

const BUTTON_STYLE: React.CSSProperties = {
  border:       '2px solid #fff',
  background:   '#000',
  color:        '#fff',
  fontFamily:   'var(--font-mono)',
  fontSize:     '16px',
  fontWeight:   400,
  padding:      '8px 18px',
  cursor:       'pointer',
  letterSpacing: '0.04em',
}
