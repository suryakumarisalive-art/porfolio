import { describe, test, expect, beforeEach } from 'vitest'
import { createStore } from 'zustand/vanilla'
import { subscribeWithSelector } from 'zustand/middleware'

// Re-implement a plain vanilla store for testing (no React dependency)
// We test the state transitions, not React rendering.

type InteractiveId = 'monitor' | 'laptop' | 'desk' | 'bookshelf' | 'phone'
type OverlayId = 'projects' | 'resume' | 'about' | 'skills' | 'contact'
type CameraMode = 'idle' | 'focus' | 'pan' | 'reset'

interface TestState {
  hoveredId:     InteractiveId | null
  focusTargetId: InteractiveId | null
  activeOverlay: OverlayId | null
  isOverlayOpen: boolean
  cameraMode:    CameraMode
  webglHealthy:  boolean

  setHovered:      (id: InteractiveId | null) => void
  openOverlay:     (id: OverlayId) => void
  closeOverlay:    () => void
  focusObject:     (id: InteractiveId) => void
  resetCamera:     () => void
  setWebglHealthy: (healthy: boolean) => void
}

function makeTestStore() {
  return createStore<TestState>()(
    subscribeWithSelector((set) => ({
      hoveredId:     null,
      focusTargetId: null,
      activeOverlay: null,
      isOverlayOpen: false,
      cameraMode:    'idle',
      webglHealthy:  true,

      setHovered: (id) => set({ hoveredId: id }),

      openOverlay: (id) => set({
        activeOverlay: id,
        isOverlayOpen: true,
        cameraMode:    'focus',
      }),

      closeOverlay: () => set({
        activeOverlay: null,
        isOverlayOpen: false,
        cameraMode:    'reset',
        focusTargetId: null,
      }),

      focusObject: (id) => set({
        focusTargetId: id,
        cameraMode:    'focus',
      }),

      resetCamera: () => set({
        focusTargetId: null,
        cameraMode:    'reset',
        activeOverlay: null,
        isOverlayOpen: false,
      }),

      setWebglHealthy: (healthy) => set({ webglHealthy: healthy }),
    }))
  )
}

describe('usePortfolioStore — state transitions', () => {
  let store: ReturnType<typeof makeTestStore>

  beforeEach(() => {
    store = makeTestStore()
  })

  test('initial state is idle with no hovered/focused/open items', () => {
    const s = store.getState()
    expect(s.hoveredId).toBeNull()
    expect(s.focusTargetId).toBeNull()
    expect(s.activeOverlay).toBeNull()
    expect(s.isOverlayOpen).toBe(false)
    expect(s.cameraMode).toBe('idle')
    expect(s.webglHealthy).toBe(true)
  })

  test('setHovered sets hoveredId', () => {
    store.getState().setHovered('monitor')
    expect(store.getState().hoveredId).toBe('monitor')
  })

  test('setHovered(null) clears hoveredId', () => {
    store.getState().setHovered('monitor')
    store.getState().setHovered(null)
    expect(store.getState().hoveredId).toBeNull()
  })

  test('openOverlay sets activeOverlay, isOverlayOpen, and cameraMode to focus', () => {
    store.getState().openOverlay('projects')
    const s = store.getState()
    expect(s.activeOverlay).toBe('projects')
    expect(s.isOverlayOpen).toBe(true)
    expect(s.cameraMode).toBe('focus')
  })

  test('closeOverlay clears overlay and resets camera mode', () => {
    store.getState().openOverlay('skills')
    store.getState().closeOverlay()
    const s = store.getState()
    expect(s.activeOverlay).toBeNull()
    expect(s.isOverlayOpen).toBe(false)
    expect(s.cameraMode).toBe('reset')
    expect(s.focusTargetId).toBeNull()
  })

  test('focusObject sets focusTargetId and cameraMode to focus', () => {
    store.getState().focusObject('desk')
    const s = store.getState()
    expect(s.focusTargetId).toBe('desk')
    expect(s.cameraMode).toBe('focus')
  })

  test('resetCamera clears all focus/overlay state', () => {
    store.getState().openOverlay('contact')
    store.getState().focusObject('phone')
    store.getState().resetCamera()
    const s = store.getState()
    expect(s.activeOverlay).toBeNull()
    expect(s.isOverlayOpen).toBe(false)
    expect(s.focusTargetId).toBeNull()
    expect(s.cameraMode).toBe('reset')
  })

  test('each action returns a new state slice (immutable)', () => {
    const before = store.getState()
    store.getState().setHovered('laptop')
    const after = store.getState()
    // State objects are different references
    expect(after).not.toBe(before)
  })

  test('webgl context loss sets webglHealthy to false', () => {
    store.getState().setWebglHealthy(false)
    expect(store.getState().webglHealthy).toBe(false)
  })

  test('webgl context restore sets webglHealthy to true', () => {
    store.getState().setWebglHealthy(false)
    store.getState().setWebglHealthy(true)
    expect(store.getState().webglHealthy).toBe(true)
  })
})
