'use client'

import { useId } from 'react'
import { usePortfolioStore, useIsOverlayOpen, useActiveOverlay } from '@/store/usePortfolioStore'
import type { OverlayId } from '@/store/usePortfolioStore'

// Mapping from section key to human-readable label
const SECTIONS: { id: OverlayId; label: string; description: string }[] = [
  { id: 'projects', label: 'Projects',   description: 'View software projects — click the monitor in the 3D scene' },
  { id: 'resume',   label: 'Resume',     description: 'Download or view resume — click the laptop in the 3D scene' },
  { id: 'about',    label: 'About Me',   description: 'Read about me — click the desk in the 3D scene' },
  { id: 'skills',   label: 'Skills',     description: 'Explore skills — click the bookshelf in the 3D scene' },
  { id: 'contact',  label: 'Contact',    description: 'Get in touch — click the phone in the 3D scene' },
]

/**
 * Visually-hidden semantic shadow — provides full keyboard and screen reader
 * access to all portfolio sections without touching the WebGL canvas.
 *
 * This is the primary accessibility guarantee: the 3D canvas is aria-hidden,
 * and all content is reachable via this shadow DOM overlay.
 */
export function AccessibilityShadow() {
  const liveId      = useId()
  const openOverlay  = usePortfolioStore((s) => s.openOverlay)
  const closeOverlay = usePortfolioStore((s) => s.closeOverlay)
  const isOpen       = useIsOverlayOpen()
  const activeOverlay = useActiveOverlay()

  return (
    <>
      {/* Live region — announces overlay open/close to screen readers */}
      <div
        id={liveId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isOpen && activeOverlay
          ? `${SECTIONS.find((s) => s.id === activeOverlay)?.label ?? ''} section opened`
          : isOpen === false && 'Section closed'}
      </div>

      {/* Keyboard-navigable portfolio nav — visually hidden, fully operable */}
      <nav
        aria-label="Portfolio sections"
        style={{
          position:   'absolute',
          top:        0,
          left:       0,
          zIndex:     1,
          opacity:    0,
          pointerEvents: 'none',
          // Becomes pointer-interactive only on keyboard focus via :focus-within
        }}
        onFocus={(e) => {
          // Make nav visible and interactive when keyboard focus enters
          ;(e.currentTarget as HTMLElement).style.opacity = '1'
          ;(e.currentTarget as HTMLElement).style.pointerEvents = 'auto'
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            ;(e.currentTarget as HTMLElement).style.opacity = '0'
            ;(e.currentTarget as HTMLElement).style.pointerEvents = 'none'
          }
        }}
      >
        <ul
          style={{
            listStyle:      'none',
            display:        'flex',
            flexDirection:  'column',
            gap:            'var(--space-2)',
            padding:        'var(--space-4)',
            background:     'var(--color-chrome-bg)',
            border:         '1px solid var(--color-chrome-border)',
            borderRadius:   'var(--radius-md)',
            margin:         'var(--space-4)',
          }}
        >
          <li>
            <span
              style={{
                fontFamily:    'var(--font-mono)',
                fontSize:      'var(--text-xs)',
                color:         'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Portfolio Navigation
            </span>
          </li>
          {SECTIONS.map(({ id, label, description }) => (
            <li key={id}>
              <button
                onClick={() => openOverlay(id)}
                aria-pressed={activeOverlay === id}
                aria-describedby={`${liveId}-${id}`}
                style={{
                  background:   'transparent',
                  border:       '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color:        'var(--color-text)',
                  fontFamily:   'var(--font-mono)',
                  fontSize:     'var(--text-sm)',
                  padding:      'var(--space-2) var(--space-3)',
                  cursor:       'pointer',
                  width:        '100%',
                  textAlign:    'left',
                }}
              >
                {label}
                <span id={`${liveId}-${id}`} className="sr-only">
                  {description}
                </span>
              </button>
            </li>
          ))}
          {isOpen && (
            <li>
              <button
                onClick={closeOverlay}
                style={{
                  background:   'var(--color-accent)',
                  border:       'none',
                  borderRadius: 'var(--radius-sm)',
                  color:        'var(--color-bg)',
                  fontFamily:   'var(--font-mono)',
                  fontSize:     'var(--text-sm)',
                  padding:      'var(--space-2) var(--space-3)',
                  cursor:       'pointer',
                  width:        '100%',
                }}
              >
                Close section (Escape)
              </button>
            </li>
          )}
        </ul>
      </nav>
    </>
  )
}
