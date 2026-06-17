import { MAX_DRAW_CALLS, MAX_TRIANGLES } from '@/lib/constants'

let _lastCheck = 0
const CHECK_INTERVAL_MS = 2000  // sample every 2 seconds, not every frame

/**
 * Dev-only performance guard — reads renderer.info and warns when the scene
 * exceeds the hard limits from the spec (100 draw calls, 500k triangles).
 * No-ops in production to avoid any overhead.
 *
 * Usage: call `checkPerfBudget(renderer)` inside a useFrame callback (guarded
 * by the dev check) at the sampling interval.
 */
export function checkPerfBudget(renderer: {
  info: {
    render:  { calls: number; triangles: number }
    memory: { geometries: number; textures: number }
  }
}): void {
  if (process.env.NODE_ENV !== 'development') return

  const now = performance.now()
  if (now - _lastCheck < CHECK_INTERVAL_MS) return
  _lastCheck = now

  const { calls, triangles } = renderer.info.render
  const { geometries, textures } = renderer.info.memory

  if (calls > MAX_DRAW_CALLS) {
    console.warn(
      `[PerfGuard] Draw calls ${calls} exceeds budget of ${MAX_DRAW_CALLS}`
    )
  }

  if (triangles > MAX_TRIANGLES) {
    console.warn(
      `[PerfGuard] Triangles ${triangles} exceeds budget of ${MAX_TRIANGLES.toLocaleString()}`
    )
  }

  // Log stats in dev to help during optimisation
  if (calls > MAX_DRAW_CALLS * 0.8 || triangles > MAX_TRIANGLES * 0.8) {
    console.warn(
      `[PerfGuard] Approaching budget: ${calls} draws | ${triangles.toLocaleString()} tris | ` +
      `${geometries} geoms | ${textures} textures`
    )
  }
}
