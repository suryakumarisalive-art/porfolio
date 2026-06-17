'use client'

import { useRef } from 'react'
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
  LERP_DECAY_CAMERA,
  CAMERA_SETTLE_EPSILON,
} from '@/lib/constants'
import { expDecayLerpV3, isNearlyEqual } from '@/lib/math'
import { usePortfolioStore } from '@/store/usePortfolioStore'

// ─── File-scope pre-allocated vectors — NEVER `new THREE.*` inside useFrame ───
const _desiredPos    = new THREE.Vector3()
const _desiredLookAt = new THREE.Vector3()
const _nextPos       = new THREE.Vector3()
const _nextLookAt    = new THREE.Vector3()

/**
 * Camera authority — reads store `cameraMode` and `cameraTarget`, applies
 * exponential-decay lerp toward the desired position / lookAt, and calls
 * `invalidate()` only while moving (keeps frameloop="demand" sleeping at rest).
 */
export function CameraRig() {
  const orbitRef = useRef<OrbitControlsImpl>(null)
  const { camera, invalidate } = useThree()

  // These selectors are narrow — only re-render when their slice changes
  const cameraMode    = usePortfolioStore((s) => s.cameraMode)
  const cameraTarget  = usePortfolioStore((s) => s.cameraTarget)
  const setCameraMode = usePortfolioStore((s) => s.setCameraMode)
  const lifecycle     = usePortfolioStore((s) => s.lifecycle)

  // Live lookAt that the camera actually follows (mutable ref — not React state).
  // Starts at the intro focal so the opening sweep tilts up from below, like henry.
  const lookAtRef = useRef(
    new THREE.Vector3(CAMERA_INTRO_LOOKAT[0], CAMERA_INTRO_LOOKAT[1], CAMERA_INTRO_LOOKAT[2])
  )

  useFrame((_state, delta) => {
    const controls = orbitRef.current
    if (!controls) return

    // ── Boot/loading: hold the intro vantage until the scene is ready ────────
    // Keeps OrbitControls from snapping the far-away camera to maxDistance and
    // preserves the dramatic opening sweep for when the loader fades out.
    if (lifecycle !== 'ready') {
      controls.enabled = false
      camera.lookAt(lookAtRef.current)
      return
    }

    // ── Idle: OrbitControls is authoritative ─────────────────────────────────
    if (cameraMode === 'idle') {
      if (!controls.enabled) {
        controls.enabled = true
        // Sync target before handing off so there is no jump
        controls.target.copy(lookAtRef.current)
        controls.update()
      }
      return
    }

    // ── Focus / Pan / Reset: manual exponential-decay lerp ───────────────────
    controls.enabled = false

    _desiredPos.set(
      cameraTarget.position[0],
      cameraTarget.position[1],
      cameraTarget.position[2]
    )
    _desiredLookAt.set(
      cameraTarget.lookAt[0],
      cameraTarget.lookAt[1],
      cameraTarget.lookAt[2]
    )

    // Lerp into _next* — mutates pre-allocated vectors, zero allocation
    expDecayLerpV3(_nextPos,    camera.position,  _desiredPos,    LERP_DECAY_CAMERA, delta)
    expDecayLerpV3(_nextLookAt, lookAtRef.current, _desiredLookAt, LERP_DECAY_CAMERA, delta)

    camera.position.copy(_nextPos)
    lookAtRef.current.copy(_nextLookAt)
    camera.lookAt(lookAtRef.current)

    // Keep requesting frames while in motion
    invalidate()

    // Check for settle
    const posSettled    = isNearlyEqual(camera.position,  _desiredPos,    CAMERA_SETTLE_EPSILON)
    const lookAtSettled = isNearlyEqual(lookAtRef.current, _desiredLookAt, CAMERA_SETTLE_EPSILON)

    if (posSettled && lookAtSettled) {
      // Snap exactly to avoid permanent micro-drift
      camera.position.copy(_desiredPos)
      lookAtRef.current.copy(_desiredLookAt)
      camera.lookAt(lookAtRef.current)

      // For reset: hand control back to OrbitControls
      if (cameraMode === 'reset') {
        controls.target.copy(lookAtRef.current)
        controls.update()
        controls.enabled = true
      } else {
        // focus/pan: keep controls off while the user views the focused object
        controls.target.copy(lookAtRef.current)
      }

      setCameraMode('idle')
    }
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
