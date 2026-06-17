// All magic numbers from the spec in one place — import from here, never inline

// ─── Camera ───────────────────────────────────────────────────────────────────
export const CAMERA_FOV               = 45
export const CAMERA_NEAR              = 0.1
export const CAMERA_FAR               = 100
export const CAMERA_INITIAL_POSITION  = [8, 6, 8]  as const
export const CAMERA_LOOK_AT           = [0, 1, 0]  as const

// ─── OrbitControls ───────────────────────────────────────────────────────────
export const ORBIT_DAMPING    = 0.05
export const ORBIT_MIN_DIST   = 5
export const ORBIT_MAX_DIST   = 12
export const ORBIT_MIN_POLAR  = 0.8   // radians (~46°)
export const ORBIT_MAX_POLAR  = 1.4   // radians (~80°)

// ─── Exponential-decay lerp factors (per-second; delta is in seconds) ─────────
// Formula: factor = 1 - e^(-decay * delta)
// Higher value = faster convergence.
export const LERP_DECAY_CAMERA  = 6    // camera position / lookAt transition speed
export const LERP_DECAY_HOVER   = 10   // hover emission + scale snap speed

// ─── Settle epsilon (stop calling invalidate when camera is this close) ────────
export const CAMERA_SETTLE_EPSILON = 0.002

// ─── Hover interaction ────────────────────────────────────────────────────────
export const HOVER_SCALE              = 1.05
export const BASE_SCALE               = 1.0
export const EMISSION_INTENSITY_HOVER = 0.6   // emissiveIntensity target on hover
export const EMISSION_INTENSITY_BASE  = 0.0

// ─── Performance budget limits ────────────────────────────────────────────────
export const MAX_DRAW_CALLS  = 100
export const MAX_TRIANGLES   = 500_000
export const MAX_GPU_MB      = 200

// ─── Lighting ─────────────────────────────────────────────────────────────────
export const SHADOW_MAP_SIZE        = 1024    // cap for budget
export const DIRECTIONAL_INTENSITY  = 1.4
export const AMBIENT_INTENSITY      = 0.4

// ─── Room object world positions (must mirror CAMERA_PRESETS lookAt) ──────────
// These are the approximate world-space centres of each interactive mesh.
export const OBJECT_POSITIONS = {
  monitor:   [0,    1.4, 0] as const,
  laptop:    [-1,   1.0, 0] as const,
  desk:      [0,    0,   0] as const,
  bookshelf: [2.5,  2.0, 0] as const,
  phone:     [0.8,  1.0, 0] as const,
} satisfies Record<string, readonly [number, number, number]>
