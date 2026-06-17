'use client'

import { useActiveOverlay, useIsOverlayOpen } from '@/store/usePortfolioStore'
import { Taskbar } from './Taskbar'
import { ProjectsOverlay }  from './overlays/ProjectsOverlay'
import { ResumeOverlay }    from './overlays/ResumeOverlay'
import { AboutOverlay }     from './overlays/AboutOverlay'
import { SkillsOverlay }    from './overlays/SkillsOverlay'
import { ContactOverlay }   from './overlays/ContactOverlay'
import { useCustomPointer } from '@/hooks/useCustomPointer'
import { CanvasLoader }     from '@/components/loaders/CanvasLoader'

/**
 * Fixed-position DOM layer above the canvas.
 * Renders the taskbar and whichever overlay is currently active.
 *
 * Pointer-events are set to `none` on the root container so mouse events
 * pass through to the canvas when no modal is open. The Taskbar and modal
 * opt back in with `pointer-events: auto`.
 */
export function UILayer() {
  useCustomPointer()

  const activeOverlay = useActiveOverlay()
  const isOverlayOpen = useIsOverlayOpen()

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

      {/* Active overlay modal — opts in to pointer events */}
      {isOverlayOpen && activeOverlay && (
        <div style={{ pointerEvents: 'auto' }}>
          {activeOverlay === 'projects' && <ProjectsOverlay />}
          {activeOverlay === 'resume'   && <ResumeOverlay />}
          {activeOverlay === 'about'    && <AboutOverlay />}
          {activeOverlay === 'skills'   && <SkillsOverlay />}
          {activeOverlay === 'contact'  && <ContactOverlay />}
        </div>
      )}
    </div>
  )
}
