import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// ─── Domain types ─────────────────────────────────────────────────────────────

export type InteractiveId = 'monitor' | 'laptop' | 'desk' | 'bookshelf' | 'phone'

export type OverlayId = 'projects' | 'resume' | 'about' | 'skills' | 'contact'

export type CameraMode = 'idle' | 'focus' | 'pan' | 'reset'

export type LifecycleState = 'booting' | 'loading' | 'ready' | 'context-lost'

// Camera target as plain tuples — no Three.js dep in the store layer
export interface CameraTarget {
  position: readonly [number, number, number]
  lookAt: readonly [number, number, number]
}

// ─── Camera presets (single source of truth) ──────────────────────────────────

export const CAMERA_PRESETS = {
  default: {
    position: [8, 6, 8] as const,
    lookAt:   [0, 1, 0] as const,
  },
  monitor: {
    position: [0.2, 1.8, 2.8] as const,
    lookAt:   [0, 1.4, 0]     as const,
  },
  laptop: {
    position: [-2.5, 2.5, 3.5] as const,
    lookAt:   [-1,   1,   0]   as const,
  },
  desk: {
    position: [0, 4.5, 5.5] as const,
    lookAt:   [0, 0,   0]   as const,
  },
  bookshelf: {
    position: [4.5, 3.5, 2.5] as const,
    lookAt:   [2.5, 2,   0]   as const,
  },
  phone: {
    position: [1.8, 2.8, 4.5] as const,
    lookAt:   [0.8, 1,   0]   as const,
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
    cameraMode:      'idle',
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

// Actions selector — stable reference, never causes re-renders
export const usePortfolioActions = () =>
  usePortfolioStore((s) => ({
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
  }))

// ─── Internal helpers ─────────────────────────────────────────────────────────

const overlayToObject: Record<OverlayId, InteractiveId> = {
  projects: 'monitor',
  resume:   'laptop',
  about:    'desk',
  skills:   'bookshelf',
  contact:  'phone',
}
