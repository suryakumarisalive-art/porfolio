import { Suspense, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { Lighting } from './Lighting'
import { CameraRig } from './CameraRig'
import { SceneEnvironment } from './SceneEnvironment'
import { PostProcessing } from './PostProcessing'
import { ShaderWarmup } from './ShaderWarmup'
import { RoomGroup } from '@/components/room/RoomGroup'

// Warm neutral studio backdrop, just darker than the plaster walls so the room
// reads as a lit volume rather than a cut-out. Fog is intentionally absent —
// the room is enclosed, so there is no far horizon to dissolve.
const BACKDROP_COLOR = '#0e0d12'

/**
 * Calls `invalidate()` on every pointermove so the mouse-follow camera stays
 * alive in `frameloop="demand"` mode without burning GPU while idle.
 */
function MouseTracker() {
  const { invalidate, gl } = useThree()

  useEffect(() => {
    const el = gl.domElement
    const onMove = () => invalidate()
    el.addEventListener('pointermove', onMove, { passive: true })
    return () => el.removeEventListener('pointermove', onMove)
  }, [invalidate, gl])

  return null
}

export function SceneRoot() {
  return (
    <>
      <color attach="background" args={[BACKDROP_COLOR]} />

      <MouseTracker />
      <Lighting />
      <CameraRig />

      <Suspense fallback={null}>
        <SceneEnvironment />
        <RoomGroup />

        {/* Soft contact shadow pool under the desk — baked once (frames=1) */}
        <ContactShadows
          position={[0, 0.001, -0.9]}
          scale={4}
          resolution={1024}
          blur={2.4}
          opacity={0.42}
          far={2}
          frames={1}
          color="#1a1410"
        />

        <ShaderWarmup />
      </Suspense>

      {/* Post-processing — SMAA + bloom */}
      <PostProcessing />
    </>
  )
}
