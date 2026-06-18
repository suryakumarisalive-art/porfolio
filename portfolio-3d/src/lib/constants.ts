// All magic numbers — import from here, never inline.
// Coordinate space: REAL-WORLD METERS. Y up. Camera looks toward -Z.
// 1 unit = 1 metre. Desk surface sits at y=0.75 (standard desk height).

// ─── Camera ───────────────────────────────────────────────────────────────────
export const CAMERA_FOV  = 38
export const CAMERA_NEAR = 0.05
export const CAMERA_FAR  = 100

// Intro vantage — camera spawns here and sweeps in (cinematic establishing shot)
export const CAMERA_INITIAL_POSITION = [-3.4, 3.2, 4.8] as const
export const CAMERA_INTRO_LOOKAT     = [0, 0.85, -1.15] as const

// Home framing — where the intro lands; the resting "desk" composition
export const CAMERA_LOOK_AT          = [0, 1.0, -1.15] as const

// Intro sweep duration (ms)
export const CAMERA_INTRO_DURATION   = 2600

// ─── Exponential-decay lerp factors (per second; delta is in seconds) ─────────
export const LERP_DECAY_CAMERA = 3
export const LERP_DECAY_HOVER  = 12

// ─── Settle epsilon — stop calling invalidate when camera is this close ───────
export const CAMERA_SETTLE_EPSILON = 0.0005

// ─── Hover interaction ────────────────────────────────────────────────────────
export const HOVER_SCALE              = 1.04
export const BASE_SCALE               = 1.0
export const EMISSION_INTENSITY_HOVER = 0.5
export const EMISSION_INTENSITY_BASE  = 0.0

// ─── Performance budget limits ────────────────────────────────────────────────
export const MAX_DRAW_CALLS = 120
export const MAX_TRIANGLES  = 400_000
export const MAX_GPU_MB     = 200

// ─── Lighting (real-time PBR) ─────────────────────────────────────────────────
export const HEMI_INTENSITY   = 0.40   // sky/ground ambient bounce (lower = more contrast)
export const KEY_INTENSITY    = 2.8    // primary directional key light
export const FILL_INTENSITY   = 0.55   // cool fill from opposite side
export const LAMP_INTENSITY   = 6.0    // warm desk-lamp point light
export const SHADOW_MAP_SIZE  = 2048

// ─── Interactive hotspot positions (metres) ───────────────────────────────────
// World-space centres of each interactive object — drive camera focus + labels.
export const OBJECT_POSITIONS = {
  monitor:   [0,     1.18, -1.40] as const,  // monitor screen centre
  laptop:    [0.72,  0.80, -0.82] as const,  // open laptop on desk right
  desk:      [0,     0.75, -1.00] as const,  // desk surface midpoint
  bookshelf: [-0.62, 0.86, -1.02] as const,  // stacked books left
  phone:     [0.42,  0.78, -0.80] as const,  // phone flat on desk
} satisfies Record<string, readonly [number, number, number]>
