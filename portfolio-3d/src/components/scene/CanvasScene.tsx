'use client'

import { Canvas } from '@react-three/fiber'
import { CAMERA_FOV, CAMERA_NEAR, CAMERA_FAR, CAMERA_INITIAL_POSITION } from '@/lib/constants'
import { useWebGLContext } from '@/hooks/useWebGLContext'
import { SceneRoot } from './SceneRoot'

/**
 * The WebGL Canvas — client-only, never SSR.
 * `frameloop="demand"` keeps the GPU idle when nothing moves. Every interactive
 * component calls `invalidate()` to request frames, so animations and OrbitControls
 * damping stay smooth without burning GPU cycles at rest.
 */
export function CanvasScene() {
  const { onCreated } = useWebGLContext()

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
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
