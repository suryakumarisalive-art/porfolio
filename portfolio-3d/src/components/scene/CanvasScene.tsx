'use client'

import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { CAMERA_FOV, CAMERA_NEAR, CAMERA_FAR, CAMERA_INITIAL_POSITION } from '@/lib/constants'
import { useWebGLContext } from '@/hooks/useWebGLContext'
import { SceneRoot } from './SceneRoot'

/**
 * The WebGL Canvas — client-only, never SSR.
 *
 * `frameloop="demand"` keeps the GPU idle when nothing moves; every interactive
 * component calls `invalidate()` to request frames.
 *
 * Real-time PBR setup:
 *  - shadows: soft PCF shadow maps for the desk-lamp + key light
 *  - ACESFilmicToneMapping + sRGB output for cinematic, filmic color
 *  - dpr capped at 2 to stay within the bundle/perf budget on retina screens
 */
export function CanvasScene() {
  const { onCreated } = useWebGLContext()

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      shadows="soft"
      gl={{
        antialias:       true,
        powerPreference:  'high-performance',
        alpha:           false,
        toneMapping:      THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{
        fov:      CAMERA_FOV,
        near:     CAMERA_NEAR,
        far:      CAMERA_FAR,
        position: [...CAMERA_INITIAL_POSITION] as [number, number, number],
      }}
      style={{ position: 'absolute', inset: 0 }}
      onCreated={onCreated}
      aria-hidden="true"
    >
      <SceneRoot />
    </Canvas>
  )
}
