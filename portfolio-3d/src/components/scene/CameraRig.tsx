'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import {
  ORBIT_DAMPING,
  ORBIT_MIN_DIST,
  ORBIT_MAX_DIST,
  ORBIT_MIN_POLAR,
  ORBIT_MAX_POLAR,
  CAMERA_LOOK_AT,
  CAMERA_INTRO_LOOKAT,
} from '@/lib/constants'
import { easeOutExpo, easeOutQuint } from '@/lib/easing'
import { usePortfolioStore } from '@/store/usePortfolioStore'

// ─── File-scope pre-allocated vectors — NEVER `new THREE.*` inside useFrame ───
const _interpolatedLookAt = new THREE.Vector3()

/**
 * Camera authority — reads store `cameraMode` and `cameraTarget`, runs a
 * tween with easing curves matching henry-clone:
 *  - Intro fly-in:  2500ms easeOutExpo
 *  - Zoom to object: 2000ms easeOutQuint
 *  - Return home:   1200ms easeOutQuint
 *
 * Calls `invalidate()` only while tweening so `frameloop="demand"` sleeps at rest.
 */
export function CameraRig() {
  const orbitRef = useRef<OrbitControlsImpl>(null)
  const { camera, invalidate } = useThree()

  const cameraMode    = usePortfolioStore((s) => s.cameraMode)
  const cameraTarget  = usePortfolioStore((s) => s.cameraTarget)
  const setCameraMode = usePortfolioStore((s) => s.setCameraMode)
  const lifecycle     = usePortfolioStore((s) => s.lifecycle)

  // Live lookAt that the camera actually follows (mutable ref — not React state)
  const lookAtRef = useRef(
    new THREE.Vector3(CAMERA_INTRO_LOOKAT[0], CAMERA_INTRO_LOOKAT[1], CAMERA_INTRO_LOOKAT[2])
  )

  // Tween state — all pre-allocated refs, zero allocation in useFrame
  const tweenStartPos     = useRef(new THREE.Vector3())
  const tweenStartLookAt  = useRef(new THREE.Vector3())
  const tweenTargetPos    = useRef(new THREE.Vector3())
  const tweenTargetLookAt = useRef(new THREE.Vector3())
  const tweenDuration     = useRef(0)   // seconds
  const tweenElapsed      = useRef(0)   // seconds
  const tweenEasingRef    = useRef<(t: number) => number>(easeOutExpo)
  const tweenActive       = useRef(false)
  const hasIntroPlayed    = useRef(false) // distinguishes intro from subsequent resets

  // Start a new tween whenever the camera mode or target changes (and scene is ready)
  useEffect(() => {
    if (lifecycle !== 'ready') return
    if (cameraMode === 'idle') {
      tweenActive.current = false
      return
    }

    // Capture current camera state as tween start
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

    // Duration and easing — matches henry-clone Camera.js timings
    const isIntro = !hasIntroPlayed.current && cameraMode === 'reset'
    const durationMs = isIntro ? 2500 : cameraMode === 'reset' ? 1200 : 2000
    tweenDuration.current = durationMs / 1000
    tweenEasingRef.current = isIntro ? easeOutExpo : easeOutQuint
    tweenElapsed.current = 0
    tweenActive.current = true

    invalidate()
    // camera and invalidate are stable R3F refs — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraMode, cameraTarget, lifecycle])

  useFrame((_, delta) => {
    const controls = orbitRef.current
    if (!controls) return

    // ── Booting / loading: hold the intro vantage until the user hits ENTER ──
    if (lifecycle !== 'ready') {
      controls.enabled = false
      camera.lookAt(lookAtRef.current)
      return
    }

    // ── Idle: hand authority to OrbitControls ──────────────────────────────
    if (cameraMode === 'idle') {
      if (!controls.enabled) {
        controls.enabled = true
        controls.target.copy(lookAtRef.current)
        controls.update()
      }
      return
    }

    // ── Tween in progress ──────────────────────────────────────────────────
    if (!tweenActive.current) return

    controls.enabled = false
    tweenElapsed.current = Math.min(tweenElapsed.current + delta, tweenDuration.current)
    const rawT = tweenElapsed.current / tweenDuration.current
    const t = tweenEasingRef.current(rawT)

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
    tweenActive.current = false
    hasIntroPlayed.current = true

    if (cameraMode === 'reset') {
      controls.target.copy(lookAtRef.current)
      controls.update()
      controls.enabled = true
    } else {
      // Focus/pan: keep controls off while overlay is open
      controls.target.copy(lookAtRef.current)
    }

    setCameraMode('idle')
  })

  return (
    <OrbitControls
      ref={orbitRef}
      makeDefault
      enableDamping
      dampingFactor={ORBIT_DAMPING}
      minDistance={ORBIT_MIN_DIST}
      maxDistance={ORBIT_MAX_DIST}
      minPolarAngle={ORBIT_MIN_POLAR}
      maxPolarAngle={ORBIT_MAX_POLAR}
      target={new THREE.Vector3(CAMERA_LOOK_AT[0], CAMERA_LOOK_AT[1], CAMERA_LOOK_AT[2])}
    />
  )
}
