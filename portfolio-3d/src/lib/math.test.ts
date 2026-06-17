import { describe, test, expect } from 'vitest'
import { expDecayLerp, expDecayLerpV3, isNearlyEqual } from '@/lib/math'
import * as THREE from 'three'

// ─── expDecayLerp ────────────────────────────────────────────────────────────

describe('expDecayLerp', () => {
  test('returns target immediately when delta is very large', () => {
    const result = expDecayLerp(0, 10, 10, 100)
    expect(result).toBeCloseTo(10, 2)
  })

  test('returns approximately current value when delta is near zero', () => {
    const result = expDecayLerp(0, 10, 10, 0.00001)
    expect(result).toBeCloseTo(0, 2)
  })

  test('is monotonically convergent toward target', () => {
    let value = 0
    const target = 100
    const decay  = 6
    const delta  = 1 / 60   // 60fps frame

    const steps = 120   // 2 seconds of frames
    let prev = value

    for (let i = 0; i < steps; i++) {
      value = expDecayLerp(value, target, decay, delta)
      expect(value).toBeGreaterThanOrEqual(prev)
      expect(value).toBeLessThanOrEqual(target)
      prev = value
    }
  })

  test('produces same final value regardless of frame rate (frame-rate independence)', () => {
    const start  = 0
    const target = 100
    const decay  = 6
    const totalTime = 0.5   // 500ms

    // Simulate at 60fps
    let val60 = start
    const delta60 = totalTime / 30
    for (let i = 0; i < 30; i++) val60 = expDecayLerp(val60, target, decay, delta60)

    // Simulate at 120fps
    let val120 = start
    const delta120 = totalTime / 60
    for (let i = 0; i < 60; i++) val120 = expDecayLerp(val120, target, decay, delta120)

    // Results should be within 0.01% of each other (frame-rate independent)
    expect(Math.abs(val60 - val120)).toBeLessThan(0.1)
  })

  test('works with negative direction (converging from above)', () => {
    let value = 100
    const target = 0
    const decay  = 4
    const delta  = 1 / 60

    for (let i = 0; i < 60; i++) {
      value = expDecayLerp(value, target, decay, delta)
    }

    expect(value).toBeLessThan(100)
    expect(value).toBeGreaterThanOrEqual(0)
  })
})

// ─── expDecayLerpV3 ──────────────────────────────────────────────────────────

describe('expDecayLerpV3', () => {
  const out     = new THREE.Vector3()
  const current = new THREE.Vector3()
  const target  = new THREE.Vector3()

  test('converges toward target vector', () => {
    current.set(0, 0, 0)
    target.set(10, 20, 30)

    expDecayLerpV3(out, current, target, 6, 1 / 60)

    expect(out.x).toBeGreaterThan(0)
    expect(out.y).toBeGreaterThan(0)
    expect(out.z).toBeGreaterThan(0)
    expect(out.x).toBeLessThan(10)
  })

  test('does not allocate new vectors (mutates out)', () => {
    current.set(0, 0, 0)
    target.set(5, 5, 5)

    const outRef = out
    expDecayLerpV3(out, current, target, 6, 1 / 60)

    // Same object reference — no allocation
    expect(out).toBe(outRef)
  })
})

// ─── isNearlyEqual ───────────────────────────────────────────────────────────

describe('isNearlyEqual', () => {
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()

  test('returns true when vectors are identical', () => {
    a.set(1, 2, 3)
    b.set(1, 2, 3)
    expect(isNearlyEqual(a, b, 0.001)).toBe(true)
  })

  test('returns true when difference is within epsilon', () => {
    a.set(1, 2, 3)
    b.set(1.0005, 2.0005, 3.0005)
    expect(isNearlyEqual(a, b, 0.001)).toBe(true)
  })

  test('returns false when any component exceeds epsilon', () => {
    a.set(1, 2, 3)
    b.set(1.002, 2, 3)
    expect(isNearlyEqual(a, b, 0.001)).toBe(false)
  })
})
