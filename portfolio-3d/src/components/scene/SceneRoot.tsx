import { Suspense, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Lighting } from './Lighting'
import { CameraRig } from './CameraRig'
import { RoomGroup } from '@/components/room/RoomGroup'

// Clean studio backdrop — calm neutral that the dark desk and green CRT read
// against. Fog dissolves the baked environment's far edges so there's no hard
// floating-plane horizon when the camera follows the mouse.
const BACKDROP_COLOR = '#c7ccd1'
const FOG_NEAR       = 8500
const FOG_FAR        = 19000

/**
 * Calls `invalidate()` on every pointer-move so the mouse-follow camera
 * stays alive in `frameloop="demand"` mode without burning GPU while idle.
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
      </Suspense>
    </>
  )
}
