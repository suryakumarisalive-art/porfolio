'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  CAMERA_INTRO_LOOKAT,
} from '@/lib/constants'
import { easeOutExpo, easeOutQuint } from '@/lib/easing'
import { usePortfolioStore, CAMERA_PRESETS } from '@/store/usePortfolioStore'

// ─── File-scope pre-allocated vectors — NEVER `new THREE.*` inside useFrame ───
const _interpolatedLookAt = new THREE.Vector3()
const _mousePosTarget     = new THREE.Vector3()
const _homeLookAt         = new THREE.Vector3(
  CAMERA_PRESETS.default.lookAt[0],
  CAMERA_PRESETS.default.lookAt[1],
  CAMERA_PRESETS.default.lookAt[2],
)

// Henry-clone mouse-follow ranges (world units from the home position).
// Kept deliberately SMALL so the monitor stays framed head-on — you never
// drift far enough to see over the top or around the back of the CRT.
const MOUSE_RANGE_X    = 0.16
const MOUSE_RANGE_Y    = 0.09
// Exponential-decay lerp factor — controls how dreamily the camera follows the mouse
const MOUSE_LERP_DECAY = 3.0

/**
 * Camera authority — no OrbitControls.
 *
 * Idle mode: camera smoothly follows the mouse cursor (henry-clone style).
 *   Moving your mouse left/right/up/down gently rotates the view without
 *   any clicking required. Feels alive at all times.
 *
 * Tween mode: triggered by intro fly-in, overlay focus, or overlay close.
 *   Uses eased elapsed-time tweens (no spring overshoot):
 *    - Intro fly-in:   2500ms easeOutExpo
 *    - Zoom to object: 2000ms easeOutQuint
 *    - Return home:    1200ms easeOutQuint
 */
export function CameraRig() {
  const { camera, invalidate } = useThree()

  const cameraMode    = usePortfolioStore((s) => s.cameraMode)
  const cameraTarget  = usePortfolioStore((s) => s.cameraTarget)
  const setCameraMode = usePortfolioStore((s) => s.setCameraMode)
  const lifecycle     = usePortfolioStore((s) => s.lifecycle)

  // Live lookAt the camera actually points at (mutable ref — not React state)
  const lookAtRef = useRef(
    new THREE.Vector3(CAMERA_INTRO_LOOKAT[0], CAMERA_INTRO_LOOKAT[1], CAMERA_INTRO_LOOKAT[2])
  )

  // Tween state — all pre-allocated, zero allocation in useFrame
  const tweenStartPos     = useRef(new THREE.Vector3())
  const tweenStartLookAt  = useRef(new THREE.Vector3())
  const tweenTargetPos    = useRef(new THREE.Vector3())
  const tweenTargetLookAt = useRef(new THREE.Vector3())
  const tweenDuration     = useRef(0)   // seconds
  const tweenElapsed      = useRef(0)   // seconds
  const tweenEasingRef    = useRef<(t: number) => number>(easeOutExpo)
  const tweenActive       = useRef(false)
  const hasIntroPlayed    = useRef(false)

  // Start a new tween whenever camera mode or target changes (only when ready)
  useEffect(() => {
    if (lifecycle !== 'ready') return
    if (cameraMode === 'idle') {
      tweenActive.current = false
      return
    }

    tweenStartPos.current.copy(camera.position)
    tweenStartLookAt.current.copy(lookAtRef.current)

    tweenTargetPos.current.set(
      cameraTarget.position[0],
      cameraTarget.position[1],
      cameraTarget.position[2],
    )
    tweenTargetLookAt.current.set(
      cameraTarget.lookAt[0],
      cameraTarget.lookAt[1],
      cameraTarget.lookAt[2],
    )

    const isIntro    = !hasIntroPlayed.current && cameraMode === 'reset'
    const durationMs = isIntro ? 2500 : cameraMode === 'reset' ? 1200 : 2000
    tweenDuration.current  = durationMs / 1000
    tweenEasingRef.current = isIntro ? easeOutExpo : easeOutQuint
    tweenElapsed.current   = 0
    tweenActive.current    = true

    invalidate()
    // camera and invalidate are stable R3F refs — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraMode, cameraTarget, lifecycle])

  useFrame((state, delta) => {
    // Hold position while loading; intro vantage faces lookAtRef
    if (lifecycle !== 'ready') {
      camera.lookAt(lookAtRef.current)
      return
    }

    // ── Idle: gentle mouse-follow (henry-clone feel) ───────────────────────
    if (cameraMode === 'idle') {
      const mx = state.mouse.x  // -1 to 1 (left to right)
      const my = state.mouse.y  // -1 to 1 (bottom to top)

      const [hx, hy, hz] = CAMERA_PRESETS.default.position
      _mousePosTarget.set(
        hx + mx * MOUSE_RANGE_X,
        hy + my * MOUSE_RANGE_Y,
        hz,
      )

      // Exponential-decay lerp — frame-rate independent, no overshoot
      const factor = 1 - Math.exp(-MOUSE_LERP_DECAY * delta)
      const prevX  = camera.position.x
      const prevY  = camera.position.y

      camera.position.lerp(_mousePosTarget, factor)
      camera.lookAt(_homeLookAt)

      // Only invalidate when the camera is still meaningfully moving
      const moved = Math.abs(camera.position.x - prevX) + Math.abs(camera.position.y - prevY)
      if (moved > 0.05) invalidate()
      return
    }

    // ── Tween in progress ──────────────────────────────────────────────────
    if (!tweenActive.current) return

    tweenElapsed.current = Math.min(tweenElapsed.current + delta, tweenDuration.current)
    const rawT = tweenElapsed.current / tweenDuration.current
    const t    = tweenEasingRef.current(rawT)

    camera.position.lerpVectors(tweenStartPos.current, tweenTargetPos.current, t)
    _interpolatedLookAt.lerpVectors(tweenStartLookAt.current, tweenTargetLookAt.current, t)
    lookAtRef.current.copy(_interpolatedLookAt)
    camera.lookAt(lookAtRef.current)

    if (rawT < 1) {
      invalidate()
      return
    }

    // ── Tween complete — snap exactly to target ────────────────────────────
    camera.position.copy(tweenTargetPos.current)
    lookAtRef.current.copy(tweenTargetLookAt.current)
    camera.lookAt(lookAtRef.current)
    tweenActive.current  = false
    hasIntroPlayed.current = true

    setCameraMode('idle')
  })

  // No OrbitControls — mouse-follow is the entire interaction model
  return null
}
