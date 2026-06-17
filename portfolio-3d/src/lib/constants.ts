// All magic numbers — import from here, never inline.
// Coordinate space: henry-clone scene scaled at 900 world units.

// ─── Camera ───────────────────────────────────────────────────────────────────
export const CAMERA_FOV              = 35        // matches henry-clone reference
export const CAMERA_NEAR             = 10        // min distance before clipping
export const CAMERA_FAR              = 900_000   // far clip for 900-unit world

// Intro vantage — camera spawns here and sweeps in (henry "loading" keyframe)
export const CAMERA_INITIAL_POSITION = [-35000, 35000, 35000] as const
export const CAMERA_INTRO_LOOKAT     = [0, -5000, 0]          as const

// Home framing — where the intro lands + OrbitControls target (henry "orbitControlsStart")
export const CAMERA_LOOK_AT          = [0, 500, 0] as const

// Intro sweep duration (ms) — cinematic ease, matches henry's 2.5s animateIn
export const CAMERA_INTRO_DURATION   = 2500

// ─── OrbitControls ───────────────────────────────────────────────────────────
export const ORBIT_DAMPING    = 0.05
export const ORBIT_MIN_DIST   = 2600           // stay outside the desk surface
export const ORBIT_MAX_DIST   = 12000          // keep the desk framed
export const ORBIT_MIN_POLAR  = 0              // allow looking up
export const ORBIT_MAX_POLAR  = Math.PI / 2   // no below-floor orbit

// ─── Exponential-decay lerp factors (per second; delta is in seconds) ─────────
// Formula: factor = 1 - e^(-decay * delta)
export const LERP_DECAY_CAMERA = 3   // camera position / lookAt — cinematic ease-out glide
export const LERP_DECAY_HOVER  = 10  // hover scale snap speed

// ─── Settle epsilon — stop calling invalidate when camera is this close ────────
// In a ~30 000-unit travel range, 1 unit is imperceptibly small.
export const CAMERA_SETTLE_EPSILON = 1.0

// ─── Hover interaction ────────────────────────────────────────────────────────
export const HOVER_SCALE              = 1.05
export const BASE_SCALE               = 1.0
export const EMISSION_INTENSITY_HOVER = 0.6
export const EMISSION_INTENSITY_BASE  = 0.0

// ─── Performance budget limits ────────────────────────────────────────────────
export const MAX_DRAW_CALLS = 100
export const MAX_TRIANGLES  = 500_000
export const MAX_GPU_MB     = 200

// ─── Lighting ─────────────────────────────────────────────────────────────────
// Baked models use MeshBasicMaterial — no PBR lighting.
// Ambient is kept in case any standard-material objects are added later.
export const AMBIENT_INTENSITY     = 0.6
export const DIRECTIONAL_INTENSITY = 0     // unused for baked scene
export const SHADOW_MAP_SIZE       = 1024

// ─── Room object hotspot positions (900-unit world) ───────────────────────────
// Approximate world-space centres of each interactive area.
// The visual geometry comes from the baked GLBs; these drive invisible click planes.
export const OBJECT_POSITIONS = {
  monitor:   [0,     950,  255] as const,  // monitor screen centre — exact from henry-clone
  laptop:    [0,     500,  800] as const,  // keyboard / trackpad area
  desk:      [0,     300, 1400] as const,  // desk surface midpoint
  bookshelf: [-2000, 1400,   0] as const,  // left-side shelf unit (estimate)
  phone:     [700,   600,  700] as const,  // phone on desk right (estimate)
} satisfies Record<string, readonly [number, number, number]>
