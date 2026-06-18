import { Suspense, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Lighting } from './Lighting'
import { CameraRig } from './CameraRig'
import { PostProcessing } from './PostProcessing'
import { ShaderWarmup } from './ShaderWarmup'
import { RoomGroup } from '@/components/room/RoomGroup'

// Neutral studio grey — calm backdrop the dark desk and CRT read against.
// Fog dissolves the far edges of the baked environment so there is no hard
// floating-plane horizon when the camera follows the mouse.
const BACKDROP_COLOR = '#c7ccd1'
const FOG_NEAR       = 8500
const FOG_FAR        = 19000

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
      <fog attach="fog" args={[BACKDROP_COLOR, FOG_NEAR, FOG_FAR]} />

      <MouseTracker />
      <Lighting />
      <CameraRig />

      {/* null fallback — CanvasLoader lives in UILayer as an HTML overlay */}
      <Suspense fallback={null}>
        <RoomGroup />
        {/* Warmup sits inside Suspense so it runs only after all assets resolve */}
        <ShaderWarmup />
      </Suspense>

      {/* Post-processing — SMAA anti-aliasing + CRT bloom */}
      <PostProcessing />
    </>
  )
}
