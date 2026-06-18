'use client'

import { useProgress } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import { useLifecycle, useWebglHealthy, usePortfolioStore } from '@/store/usePortfolioStore'
import { fadeIn, fadeOut } from '@/lib/gsap'

const OWNER = 'Surya Kumar'
const YEAR  = '2025'

// ─── Boot sequence lines ──────────────────────────────────────────────────────
// Each line appears when `progress` crosses its threshold. The last line
// ("Scene ready") only appears once `active === false` (all assets resolved).
const BOOT_LINES = [
  { threshold: 0,  label: 'Initialising render engine' },
  { threshold: 20, label: 'Loading scene geometry' },
  { threshold: 55, label: 'Loading surface textures' },
  { threshold: 82, label: 'Compiling shaders' },
] as const

/**
 * Full-screen loading overlay that matches the henry-clone aesthetic exactly:
 * pure-black background, white-bordered terminal box, monospace font.
 *
 * The loading sequence shows BIOS-style lines one by one as assets load,
 * then reveals a pulsing START button once everything is ready.
 *
 * Lifecycle: booting → loading → loaded (START button) → ready (camera intro)
 */
export function CanvasLoader() {
  const { progress, active } = useProgress()
  const lifecycle    = useLifecycle()
  const webglHealthy = useWebglHealthy()
  const setLifecycle = usePortfolioStore((s) => s.setLifecycle)
  const rootRef      = useRef<HTMLDivElement>(null)
  const [exiting, setExiting] = useState(false)

  // Boot lines that are visible so far — append-only, never shrinks
  const [shownLines, setShownLines] = useState<number[]>([0])

  useEffect(() => {
    if (active && lifecycle === 'booting') setLifecycle('loading')
    if (!active && lifecycle === 'loading') setLifecycle('loaded')
  }, [active, lifecycle, setLifecycle])

  // Reveal boot lines as progress crosses each threshold
  useEffect(() => {
    const toShow = BOOT_LINES
      .map((_, i) => i)
      .filter(i => progress >= (BOOT_LINES[i]?.threshold ?? 0) && !shownLines.includes(i))
    if (toShow.length > 0) setShownLines(prev => [...prev, ...toShow])
  // intentionally excludes shownLines to avoid re-triggering on its own update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress])

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
      {/* ── Terminal box ──────────────────────────────────────────────────── */}
      <div style={BOX_STYLE}>

        {isContextLost ? (
          <p style={LINE_STYLE}>Reconnecting render engine…</p>
        ) : (
          <>
            {/* Header */}
            <p style={{ ...LINE_STYLE, opacity: 0.5, marginBottom: 2 }}>
              {OWNER.toUpperCase()}  PORTFOLIO OS  {YEAR}
            </p>
            <div style={DIVIDER_STYLE} />

            {/* Boot lines */}
            <div style={{ marginTop: 6 }}>
              {BOOT_LINES.map((line, i) =>
                shownLines.includes(i) ? (
                  <BootLine key={i} label={line.label} />
                ) : null
              )}

              {/* "Scene ready" appears once loading is done */}
              {isLoaded && <BootLine label="Scene ready" final />}
            </div>

            {/* Progress indicator while still loading */}
            {!isLoaded && (
              <p style={{ ...LINE_STYLE, opacity: 0.35, marginTop: 10, fontSize: '11px' }}>
                {Math.round(progress)}%
              </p>
            )}

            {/* START button — only when fully loaded */}
            {isLoaded && (
              <>
                <div style={DIVIDER_STYLE} />
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
                  <button
                    onClick={handleStart}
                    disabled={exiting}
                    style={BUTTON_STYLE}
                    className="start-btn"
                    autoFocus
                  >
                    START
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── BootLine ─────────────────────────────────────────────────────────────────

function BootLine({ label, final = false }: { label: string; final?: boolean }) {
  const dots = '.'.repeat(Math.max(2, 38 - label.length))
  return (
    <p
      style={{
        ...LINE_STYLE,
        fontSize:     '12px',
        lineHeight:   1.9,
        animation:    'bios-line-in 0.25s var(--ease-out-expo) both',
        color:        final ? '#afffbf' : '#fff',
      }}
    >
      <span style={{ opacity: 0.45 }}>{'> '}</span>
      {label}
      <span style={{ opacity: 0.22 }}>{dots}</span>
      <span style={{ opacity: 0.7, color: final ? '#afffbf' : '#fff' }}> OK</span>
    </p>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BOX_STYLE: React.CSSProperties = {
  border:     '2px solid #fff',
  background: '#000',
  padding:    '24px 28px 20px',
  minWidth:   400,
  maxWidth:   '88vw',
}

const DIVIDER_STYLE: React.CSSProperties = {
  borderBottom: '1px solid rgba(255,255,255,0.15)',
  margin:       '10px 0',
}

const LINE_STYLE: React.CSSProperties = {
  fontFamily:    'var(--font-mono)',
  fontSize:      '14px',
  lineHeight:    1.55,
  color:         '#fff',
  letterSpacing: '0.02em',
  whiteSpace:    'nowrap',
}

const BUTTON_STYLE: React.CSSProperties = {
  border:        '2px solid #fff',
  background:    '#000',
  color:         '#fff',
  fontFamily:    'var(--font-mono)',
  fontSize:      '14px',
  fontWeight:    400,
  padding:       '8px 24px',
  cursor:        'pointer',
  letterSpacing: '0.06em',
}
