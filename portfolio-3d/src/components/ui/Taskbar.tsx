'use client'

import { usePortfolioStore, useActiveOverlay, type OverlayId } from '@/store/usePortfolioStore'

interface TaskbarItem {
  id:    OverlayId
  label: string
  key:   string
}

const ITEMS: TaskbarItem[] = [
  { id: 'projects', label: 'Projects',   key: 'P' },
  { id: 'resume',   label: 'Resume',     key: 'R' },
  { id: 'about',    label: 'About',      key: 'A' },
  { id: 'skills',   label: 'Skills',     key: 'S' },
  { id: 'contact',  label: 'Contact',    key: 'C' },
]

/**
 * OS-style taskbar — mirrors the 5 3D object interactions as DOM controls.
 * Activates the same store actions as clicking the 3D objects.
 * Uses keyboard shortcut hints for power users.
 */
export function Taskbar() {
  const openOverlay  = usePortfolioStore((s) => s.openOverlay)
  const closeOverlay = usePortfolioStore((s) => s.closeOverlay)
  const activeOverlay = useActiveOverlay()

  return (
    <nav
      aria-label="Portfolio sections taskbar"
      style={{
        position:       'fixed',
        bottom:         'var(--space-6)',
        left:           '50%',
        transform:      'translateX(-50%)',
        zIndex:         'var(--z-ui)' as never,
        display:        'flex',
        alignItems:     'center',
        gap:            'var(--space-1)',
        padding:        'var(--space-2)',
        background:     'var(--color-chrome-bg)',
        border:         '1px solid var(--color-chrome-border)',
        borderRadius:   'var(--radius-xl)',
        backdropFilter: 'blur(12px)',
        boxShadow:      'var(--shadow-lg)',
      }}
    >
      {ITEMS.map(({ id, label, key }) => {
        const isActive = activeOverlay === id
        return (
          <button
            key={id}
            onClick={() => (isActive ? closeOverlay() : openOverlay(id))}
            aria-pressed={isActive}
            aria-label={`${label} (keyboard shortcut: Alt+${key})`}
            title={`${label} — Alt+${key}`}
            style={{
              position:     'relative',
              background:   isActive ? 'var(--color-accent)' : 'transparent',
              border:       isActive
                ? '1px solid var(--color-accent)'
                : '1px solid transparent',
              borderRadius: 'var(--radius-lg)',
              color:        isActive ? 'var(--color-bg)' : 'var(--color-text-muted)',
              fontFamily:   'var(--font-mono)',
              fontSize:     'var(--text-xs)',
              fontWeight:   isActive ? 700 : 400,
              padding:      'var(--space-2) var(--space-4)',
              cursor:       'pointer',
              letterSpacing: '0.05em',
              transition:   [
                'background var(--duration-fast)',
                'color var(--duration-fast)',
                'border-color var(--duration-fast)',
              ].join(', '),
            }}
          >
            {label}
            {/* Active dot indicator */}
            {isActive && (
              <span
                aria-hidden="true"
                style={{
                  position:     'absolute',
                  bottom:       -6,
                  left:         '50%',
                  transform:    'translateX(-50%)',
                  width:        4,
                  height:       4,
                  background:   'var(--color-accent)',
                  borderRadius: 'var(--radius-full)',
                }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
