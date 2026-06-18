'use client'

import {
  HEMI_INTENSITY,
  KEY_INTENSITY,
  FILL_INTENSITY,
  SHADOW_MAP_SIZE,
} from '@/lib/constants'

/**
 * Cinematic three-point lighting for the real-time PBR scene.
 *
 *  - Hemisphere: warm sky / cool ground ambient so shadows are never pure black
 *    (this is the "bounce" term that keeps materials reading at all angles).
 *  - Key (directional): the main shaper. Warm, high, camera-left, casts the
 *    soft shadows that ground every object on the desk.
 *  - Fill (directional): cool, opposite side, low intensity — lifts the shadow
 *    side just enough to reveal form without flattening contrast.
 *
 * The warm desk-lamp point light lives in Decor.tsx next to the lamp mesh so
 * the light and its source geometry stay together.
 */
export function Lighting() {
  return (
    <>
      <hemisphereLight
        intensity={HEMI_INTENSITY}
        color="#fff4e6"
        groundColor="#3a3340"
      />

      {/* Key light — warm, camera-left, high. Casts the primary shadow. */}
      <directionalLight
        position={[3.2, 4.5, 2.0]}
        intensity={KEY_INTENSITY}
        color="#fff1dd"
        castShadow
        shadow-mapSize-width={SHADOW_MAP_SIZE}
        shadow-mapSize-height={SHADOW_MAP_SIZE}
        shadow-camera-near={0.5}
        shadow-camera-far={14}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />

      {/* Fill light — cool, camera-right, soft. No shadow. */}
      <directionalLight
        position={[-3.5, 2.4, 1.5]}
        intensity={FILL_INTENSITY}
        color="#cfe0ff"
      />
    </>
  )
}
