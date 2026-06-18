import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { subscribeWithSelector } from 'zustand/middleware'

// ─── Domain types ─────────────────────────────────────────────────────────────

export type InteractiveId = 'monitor' | 'laptop' | 'desk' | 'bookshelf' | 'phone'

export type OverlayId = 'projects' | 'resume' | 'about' | 'skills' | 'contact'

export type CameraMode = 'idle' | 'focus' | 'pan' | 'reset'

export type LifecycleState = 'booting' | 'loading' | 'loaded' | 'ready' | 'context-lost'

// Camera target as plain tuples — no Three.js dep in the store layer
export interface CameraTarget {
  position: readonly [number, number, number]
  lookAt: readonly [number, number, number]
}

// ─── Camera presets (single source of truth) ──────────────────────────────────

// All positions are in REAL-WORLD METRES (see lib/constants.ts).
export const CAMERA_PRESETS = {
  default: {
    // Home framing — three-quarter view of the desk, monitor as focal point.
    // Pulled back + slightly lower so the whole desk breathes in frame and the
    // laptop on the right is never clipped.
    position: [0, 1.40, 2.45] as const,
    lookAt:   [0, 1.02, -1.15] as const,
  },
  monitor: {
    // Fly close to the screen to read it
    position: [0, 1.18, -0.30] as const,
    lookAt:   [0, 1.18, -1.40] as const,
  },
  laptop: {
    position: [0.72, 1.12, -0.05] as const,
    lookAt:   [0.72, 0.82, -0.82] as const,
  },
  desk: {
    // Pull back slightly, look down at the whole desk surface
    position: [0, 1.62, 1.35] as const,
    lookAt:   [0, 0.82, -1.00] as const,
  },
  bookshelf: {
    position: [-0.62, 1.18, -0.10] as const,
    lookAt:   [-0.62, 0.86, -1.02] as const,
  },
  phone: {
    position: [0.42, 1.05, -0.05] as const,
    lookAt:   [0.42, 0.78, -0.80] as const,
  },
} satisfies Record<string, CameraTarget>

// ─── Store shape ──────────────────────────────────────────────────────────────

export interface PortfolioState {
  // Interaction layer
  hoveredId:       InteractiveId | null
  focusTargetId:   InteractiveId | null

  // Overlay layer
  activeOverlay:   OverlayId | null
  isOverlayOpen:   boolean

  // Camera layer
  cameraMode:      CameraMode
  cameraTarget:    CameraTarget

  // Lifecycle & health
  lifecycle:       LifecycleState
  isReducedMotion: boolean
  webglHealthy:    boolean

  // ─── Actions ────────────────────────────────────────────────────────────────
  setHovered:       (id: InteractiveId | null) => void
  openOverlay:      (id: OverlayId) => void
  closeOverlay:     () => void
  focusObject:      (id: InteractiveId) => void
  resetCamera:      () => void
  setCameraMode:    (mode: CameraMode) => void
  setCameraTarget:  (target: CameraTarget) => void
  setLifecycle:     (state: LifecycleState) => void
  setReducedMotion: (reduced: boolean) => void
  setWebglHealthy:  (healthy: boolean) => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePortfolioStore = create<PortfolioState>()(
  subscribeWithSelector((set) => ({
    // Defaults
    hoveredId:       null,
    focusTargetId:   null,
    activeOverlay:   null,
    isOverlayOpen:   false,
    // Start in 'reset' so the camera glides from the intro vantage to home
    cameraMode:      'reset',
    cameraTarget:    CAMERA_PRESETS.default,
    lifecycle:       'booting',
    isReducedMotion: false,
    webglHealthy:    true,

    // Actions — each creates a new state slice (immutable)
    setHovered: (id) => set({ hoveredId: id }),

    openOverlay: (id) =>
      set({
        activeOverlay: id,
        isOverlayOpen: true,
        // Opening an overlay also focuses the related camera angle
        cameraMode:    'focus',
        focusTargetId: overlayToObject[id],
        cameraTarget:  CAMERA_PRESETS[overlayToObject[id]],
      }),

    closeOverlay: () =>
      set({
        activeOverlay: null,
        isOverlayOpen: false,
        // Return to default orbit on close
        cameraMode:    'reset',
        focusTargetId: null,
        cameraTarget:  CAMERA_PRESETS.default,
      }),

    focusObject: (id) =>
      set({
        focusTargetId: id,
        cameraMode:    'focus',
        cameraTarget:  CAMERA_PRESETS[id],
      }),

    resetCamera: () =>
      set({
        focusTargetId: null,
        cameraMode:    'reset',
        cameraTarget:  CAMERA_PRESETS.default,
        activeOverlay: null,
        isOverlayOpen: false,
      }),

    setCameraMode:    (mode)    => set({ cameraMode: mode }),
    setCameraTarget:  (target)  => set({ cameraTarget: target }),
    setLifecycle:     (state)   => set({ lifecycle: state }),
    setReducedMotion: (reduced) => set({ isReducedMotion: reduced }),
    setWebglHealthy:  (healthy) => set({ webglHealthy: healthy }),
  }))
)

// ─── Typed selector hooks (prevent re-render storms) ──────────────────────────

export const useHoveredId       = () => usePortfolioStore((s) => s.hoveredId)
export const useFocusTargetId   = () => usePortfolioStore((s) => s.focusTargetId)
export const useActiveOverlay   = () => usePortfolioStore((s) => s.activeOverlay)
export const useIsOverlayOpen   = () => usePortfolioStore((s) => s.isOverlayOpen)
export const useCameraMode      = () => usePortfolioStore((s) => s.cameraMode)
export const useCameraTarget    = () => usePortfolioStore((s) => s.cameraTarget)
export const useLifecycle       = () => usePortfolioStore((s) => s.lifecycle)
export const useIsReducedMotion = () => usePortfolioStore((s) => s.isReducedMotion)
export const useWebglHealthy    = () => usePortfolioStore((s) => s.webglHealthy)

// Actions selector — useShallow prevents new-object re-renders on every call
export const usePortfolioActions = () =>
  usePortfolioStore(useShallow((s) => ({
    setHovered:       s.setHovered,
    openOverlay:      s.openOverlay,
    closeOverlay:     s.closeOverlay,
    focusObject:      s.focusObject,
    resetCamera:      s.resetCamera,
    setCameraMode:    s.setCameraMode,
    setCameraTarget:  s.setCameraTarget,
    setLifecycle:     s.setLifecycle,
    setReducedMotion: s.setReducedMotion,
    setWebglHealthy:  s.setWebglHealthy,
  })))

// ─── Internal helpers ─────────────────────────────────────────────────────────

const overlayToObject: Record<OverlayId, InteractiveId> = {
  projects: 'monitor',
  resume:   'laptop',
  about:    'desk',
  skills:   'bookshelf',
  contact:  'phone',
}
