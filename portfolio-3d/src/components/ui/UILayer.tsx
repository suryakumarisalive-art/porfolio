'use client'

import { useEffect, useRef, useState } from 'react'
import { useActiveOverlay, useIsOverlayOpen, type OverlayId } from '@/store/usePortfolioStore'
import { Taskbar } from './Taskbar'
import { ProjectsOverlay }  from './overlays/ProjectsOverlay'
import { ResumeOverlay }    from './overlays/ResumeOverlay'
import { AboutOverlay }     from './overlays/AboutOverlay'
import { SkillsOverlay }    from './overlays/SkillsOverlay'
import { ContactOverlay }   from './overlays/ContactOverlay'
import { useCustomPointer } from '@/hooks/useCustomPointer'
import { CanvasLoader }     from '@/components/loaders/CanvasLoader'

const CLOSE_DURATION_MS = 200

/**
 * Fixed-position DOM layer above the canvas.
 * Manages overlay visibility with a close animation: when `isOverlayOpen` goes
 * false the overlay stays mounted for CLOSE_DURATION_MS so the CSS exit
 * animation can play before the component unmounts.
 */
export function UILayer() {
  useCustomPointer()

  const isOverlayOpen  = useIsOverlayOpen()
  const activeOverlay  = useActiveOverlay()

  // `renderedOverlay` tracks what's actually in the DOM (lags isOverlayOpen during close)
  const [renderedOverlay, setRenderedOverlay] = useState<OverlayId | null>(null)
  const [isClosing, setIsClosing]             = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isOverlayOpen && activeOverlay) {
      // Opening — cancel any pending close timer and show immediately
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      setRenderedOverlay(activeOverlay)
      setIsClosing(false)
    } else if (!isOverlayOpen && renderedOverlay) {
      // Closing — animate out, then unmount
      setIsClosing(true)
      closeTimerRef.current = setTimeout(() => {
        setRenderedOverlay(null)
        setIsClosing(false)
      }, CLOSE_DURATION_MS)
    }
  // renderedOverlay deliberately excluded — it's only read to detect "was open"
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOverlayOpen, activeOverlay])

  // Cleanup on unmount
  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
  }, [])

  return (
    <div
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        'var(--z-ui)' as never,
        pointerEvents: 'none',
      }}
    >
      {/* Loading overlay — manages its own visibility via lifecycle state */}
      <CanvasLoader />

      {/* Taskbar — always visible, opts in to pointer events */}
      <div style={{ pointerEvents: 'auto' }}>
        <Taskbar />
      </div>

      {/* Active overlay modal with exit animation */}
      {renderedOverlay && (
        <div
          style={{
            pointerEvents: 'auto',
            animation: isClosing
              ? `modal-out ${CLOSE_DURATION_MS}ms var(--ease-out-expo) forwards`
              : 'none',
          }}
        >
          {renderedOverlay === 'projects' && <ProjectsOverlay />}
          {renderedOverlay === 'resume'   && <ResumeOverlay />}
          {renderedOverlay === 'about'    && <AboutOverlay />}
          {renderedOverlay === 'skills'   && <SkillsOverlay />}
          {renderedOverlay === 'contact'  && <ContactOverlay />}
        </div>
      )}
    </div>
  )
}
