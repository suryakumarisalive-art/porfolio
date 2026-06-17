'use client'

import { Canvas } from '@react-three/fiber'
import { CAMERA_FOV, CAMERA_NEAR, CAMERA_FAR, CAMERA_INITIAL_POSITION } from '@/lib/constants'
import { useWebGLContext } from '@/hooks/useWebGLContext'
import { SceneRoot } from './SceneRoot'

/**
 * The WebGL Canvas — client-only, never SSR.
 * `frameloop="always"` renders every frame so OrbitControls damping, the camera
 * intro sweep, and hover lerps all stay buttery-smooth — matching the henry-clone
 * feel. Lingering invalidate() calls elsewhere are harmless no-ops in this mode.
 */
export function CanvasScene() {
  const { onCreated } = useWebGLContext()

  return (
    <Canvas
      frameloop="always"
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
