/**
 * Easing functions for camera tweens.
 * t is a normalized time value [0, 1].
 */

export function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5)
}
