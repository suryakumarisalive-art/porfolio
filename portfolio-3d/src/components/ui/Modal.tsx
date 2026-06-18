'use client'

import {
  type ReactNode,
  useEffect,
  useRef,
  useId,
  type KeyboardEvent,
} from 'react'
import { usePortfolioStore } from '@/store/usePortfolioStore'
import { gsap, useGSAP } from '@/lib/gsap'

interface ModalProps {
  title:    string
  children: ReactNode
}

// Focusable element selector for focus-trap
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Accessible base modal.
 *
 * - role="dialog", aria-modal, aria-labelledby
 * - Focus trap: Tab / Shift+Tab cycles within the modal
 * - Escape closes (delegates to store — overlay Escape takes priority over camera reset)
 * - Backdrop click closes
 * - GSAP entrance/exit via compositor-only opacity + transform
 * - Restores focus to the previously-focused element on close
 */
export function Modal({ title, children }: ModalProps) {
  const titleId     = useId()
  const dialogRef   = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)

  const closeOverlay = usePortfolioStore((s) => s.closeOverlay)
  const isReducedMotion = usePortfolioStore((s) => s.isReducedMotion)

  // Remember what had focus before opening, so we can restore it on close
  useEffect(() => {
    prevFocusRef.current = document.activeElement as HTMLElement
    // Focus first focusable element inside modal
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTORS)
    firstFocusable?.focus()
    return () => {
      prevFocusRef.current?.focus()
    }
  }, [])

  // GSAP entrance animation — compositor-only (opacity + translateY)
  useGSAP(() => {
    if (!dialogRef.current || !backdropRef.current) return
    const duration = isReducedMotion ? 0 : 0.28
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration })
    gsap.fromTo(
      dialogRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration, ease: 'power3.out' }
    )
  }, { dependencies: [isReducedMotion] })

  // Focus trap
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      closeOverlay()
      return
    }
    if (e.key !== 'Tab') return

    const dialog    = dialogRef.current
    if (!dialog) return
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))
    if (focusable.length === 0) return

    const first = focusable[0]!
    const last  = focusable[focusable.length - 1]!

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  return (
    /* Backdrop */
    <div
      ref={backdropRef}
      onClick={closeOverlay}
      style={{
        position:  'fixed',
        inset:     0,
        zIndex:    'var(--z-overlay)' as never,
        background: 'oklch(0% 0 0 / 0.4)',
        display:   'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding:   'var(--space-4)',
      }}
    >
      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        style={{
          background:   'var(--color-surface)',
          border:       '1px solid var(--color-chrome-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow:    'var(--shadow-lg)',
          maxWidth:     700,
          width:        '100%',
          maxHeight:    '85vh',
          display:      'flex',
          flexDirection: 'column',
          overflow:     'hidden',
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        'var(--space-4) var(--space-6)',
            borderBottom:   '1px solid var(--color-border)',
            background:     'var(--color-chrome-title)',
            flexShrink:     0,
          }}
        >
          <h2
            id={titleId}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize:   'var(--text-md)',
              fontWeight: 600,
              color:      'var(--color-text)',
            }}
          >
            {title}
          </h2>
          <button
            onClick={closeOverlay}
            aria-label="Close"
            className="modal-close"
            style={{
              background:   'transparent',
              border:       '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color:        'var(--color-text-muted)',
              fontFamily:   'var(--font-mono)',
              fontSize:     'var(--text-base)',
              lineHeight:   1,
              padding:      'var(--space-1) var(--space-2)',
              cursor:       'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            overflowY: 'auto',
            padding:   'var(--space-6)',
            flex:      1,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
