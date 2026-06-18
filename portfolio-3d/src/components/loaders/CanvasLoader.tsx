'use client'

import { useEffect, useRef, useState } from 'react'
import { useLifecycle, useWebglHealthy, usePortfolioStore } from '@/store/usePortfolioStore'
import { fadeIn, fadeOut } from '@/lib/gsap'

const OWNER = 'Surya Kumar'
const YEAR  = '2025'

// Boot lines revealed in sequence. The scene compiles shaders (ShaderWarmup)
// during this window, so by the time START is clickable the first real frame
// is already warm — no compile hitch, no pop-in.
const BOOT_LINES = [
  'Initialising render engine',
  'Building scene geometry',
  'Calibrating lighting',
  'Compiling shaders',
] as const

const LINE_INTERVAL_MS = 260   // gap between each boot line
const SETTLE_MS        = 320   // pause after last line before START appears

/**
 * Premium boot overlay: pure-black, white-bordered terminal box, monospace.
 * Reveals BIOS-style status lines one by one, then a START button. Fades out
 * smoothly into the scene (the camera intro fly-in begins on START).
 *
 * Lifecycle: booting → (timed reveal) → loaded (START) → ready (camera intro)
 */
export function CanvasLoader() {
  const lifecycle    = useLifecycle()
  const webglHealthy = useWebglHealthy()
  const setLifecycle = usePortfolioStore((s) => s.setLifecycle)
  const rootRef      = useRef<HTMLDivElement>(null)
  const [exiting, setExiting]   = useState(false)
  const [shownCount, setShownCount] = useState(1)

  // Timed boot sequence — reveal each line, then mark loaded
  useEffect(() => {
    if (lifecycle !== 'booting') return
    const timers: ReturnType<typeof setTimeout>[] = []

    for (let i = 1; i < BOOT_LINES.length; i++) {
      timers.push(setTimeout(() => setShownCount(i + 1), LINE_INTERVAL_MS * i))
    }
    timers.push(
      setTimeout(
        () => setLifecycle('loaded'),
        LINE_INTERVAL_MS * BOOT_LINES.length + SETTLE_MS,
      ),
    )

    return () => timers.forEach(clearTimeout)
  }, [lifecycle, setLifecycle])

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
      <div style={BOX_STYLE}>
        {isContextLost ? (
          <p style={LINE_STYLE}>Reconnecting render engine…</p>
        ) : (
          <>
            <p style={{ ...LINE_STYLE, opacity: 0.5, marginBottom: 2 }}>
              {OWNER.toUpperCase()}  ·  PORTFOLIO  {YEAR}
            </p>
            <div style={DIVIDER_STYLE} />

            <div style={{ marginTop: 6 }}>
              {BOOT_LINES.slice(0, shownCount).map((label, i) => (
                <BootLine key={i} label={label} />
              ))}
              {isLoaded && <BootLine label="Scene ready" final />}
            </div>

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
  const dots = '.'.repeat(Math.max(2, 36 - label.length))
  return (
    <p
      style={{
        ...LINE_STYLE,
        fontSize:   '12px',
        lineHeight: 1.9,
        animation:  'bios-line-in 0.25s var(--ease-out-expo) both',
        color:      final ? '#9affc4' : '#fff',
      }}
    >
      <span style={{ opacity: 0.45 }}>{'> '}</span>
      {label}
      <span style={{ opacity: 0.22 }}>{dots}</span>
      <span style={{ opacity: 0.7 }}> OK</span>
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
