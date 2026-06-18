'use client'

import { memo, useRef, type ReactNode, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  BASE_SCALE,
  HOVER_SCALE,
  EMISSION_INTENSITY_BASE,
  EMISSION_INTENSITY_HOVER,
  LERP_DECAY_HOVER,
} from '@/lib/constants'
import { expDecayLerp } from '@/lib/math'
import {
  usePortfolioStore,
  useHoveredId,
  type InteractiveId,
  type OverlayId,
} from '@/store/usePortfolioStore'

// ─── File-scope pre-allocated — never `new` inside useFrame ──────────────────
// (no Vector3/Color allocation needed here; we mutate scale directly)

interface InteractiveObjectProps {
  id:          InteractiveId
  overlayId:   OverlayId
  position?:   [number, number, number]
  /** Ref to the mesh's MeshStandardMaterial — emission is applied here each frame */
  materialRef?: RefObject<THREE.MeshStandardMaterial | null>
  children:    ReactNode
}

/**
 * Wrapper for interactive room objects.
 *
 * Responsibilities:
 * - Pointer event dispatch (over/out/double-click) with stopPropagation
 * - Hover scale animation via exponential-decay lerp on the group
 * - Hover emission intensity animation on the supplied materialRef
 * - Calling invalidate() during animation to keep frameloop="demand" alive
 */
export const InteractiveObject = memo(function InteractiveObject({
  id,
  overlayId,
  position = [0, 0, 0],
  materialRef,
  children,
}: InteractiveObjectProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Mutable per-frame state — refs, not React state, to avoid re-renders
  const currentScaleRef    = useRef(BASE_SCALE)
  const currentEmissionRef = useRef(EMISSION_INTENSITY_BASE)

  const { invalidate } = useThree()
  const hoveredId   = useHoveredId()
  const setHovered  = usePortfolioStore((s) => s.setHovered)
  const openOverlay = usePortfolioStore((s) => s.openOverlay)
  const focusObject = usePortfolioStore((s) => s.focusObject)

  const isHovered = hoveredId === id

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return

    const targetScale    = isHovered ? HOVER_SCALE            : BASE_SCALE
    const targetEmission = isHovered ? EMISSION_INTENSITY_HOVER : EMISSION_INTENSITY_BASE

    const newScale    = expDecayLerp(currentScaleRef.current,    targetScale,    LERP_DECAY_HOVER, delta)
    const newEmission = expDecayLerp(currentEmissionRef.current, targetEmission, LERP_DECAY_HOVER, delta)

    currentScaleRef.current    = newScale
    currentEmissionRef.current = newEmission

    // Mutate scale via setScalar — no allocation
    group.scale.setScalar(newScale)

    // Mutate emission on the caller-supplied material ref
    if (materialRef?.current) {
      materialRef.current.emissiveIntensity = newEmission
    }

    // Keep demand frameloop alive while scale/emission is still transitioning
    const scaleSettled    = Math.abs(newScale    - targetScale)    < 0.0005
    const emissionSettled = Math.abs(newEmission - targetEmission) < 0.001
    if (!scaleSettled || !emissionSettled) {
      invalidate()
    }
  })

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(id)
        invalidate()
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHovered(null)
        invalidate()
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        openOverlay(overlayId)
        focusObject(id)
        invalidate()
      }}
      onClick={(e) => {
        // Single click also focuses (without opening overlay) for discoverability
        e.stopPropagation()
        focusObject(id)
        invalidate()
      }}
    >
      {children}
    </group>
  )
})
