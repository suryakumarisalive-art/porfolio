import * as THREE from 'three'

/**
 * Frame-rate-independent exponential decay lerp for scalars.
 * Formula: current + (target - current) * (1 - e^(-decay * delta))
 *
 * @param current  The value at the start of this frame
 * @param target   The value to approach
 * @param decay    Convergence speed (units: 1/second). Higher = faster.
 * @param delta    Frame delta-time in SECONDS (as provided by R3F useFrame)
 */
export function expDecayLerp(
  current: number,
  target: number,
  decay: number,
  delta: number
): number {
  const factor = 1 - Math.exp(-decay * delta)
  return current + (target - current) * factor
}

/**
 * Frame-rate-independent exponential decay lerp for a THREE.Vector3.
 * Mutates `out` — no allocation.
 *
 * @param out      The vector to write the result into (pre-allocated at call site)
 * @param current  Current position
 * @param target   Target position
 * @param decay    Convergence speed (1/second)
 * @param delta    Frame delta-time in SECONDS
 */
export function expDecayLerpV3(
  out: THREE.Vector3,
  current: THREE.Vector3,
  target: THREE.Vector3,
  decay: number,
  delta: number
): void {
  const factor = 1 - Math.exp(-decay * delta)
  out.x = current.x + (target.x - current.x) * factor
  out.y = current.y + (target.y - current.y) * factor
  out.z = current.z + (target.z - current.z) * factor
}

/**
 * Returns whether a Vector3 is within `epsilon` of another.
 * Used to stop calling invalidate once the camera has settled.
 */
export function isNearlyEqual(
  a: THREE.Vector3,
  b: THREE.Vector3,
  epsilon: number
): boolean {
  return (
    Math.abs(a.x - b.x) < epsilon &&
    Math.abs(a.y - b.y) < epsilon &&
    Math.abs(a.z - b.z) < epsilon
  )
}
