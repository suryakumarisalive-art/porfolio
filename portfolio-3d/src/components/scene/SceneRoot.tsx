import { Suspense } from 'react'
import { Lighting } from './Lighting'
import { CameraRig } from './CameraRig'
import { RoomGroup } from '@/components/room/RoomGroup'

// Clean studio backdrop — a calm neutral that the dark desk and green CRT read
// against. Fog dissolves the baked environment's far edges into this colour so
// there's no hard "floating plane" horizon when you orbit.
const BACKDROP_COLOR = '#c7ccd1'
const FOG_NEAR       = 8500
const FOG_FAR        = 19000

export function SceneRoot() {
  return (
    <>
      <color attach="background" args={[BACKDROP_COLOR]} />
      <fog attach="fog" args={[BACKDROP_COLOR, FOG_NEAR, FOG_FAR]} />

      <Lighting />
      <CameraRig />

      {/* null fallback — CanvasLoader lives in UILayer as an HTML overlay */}
      <Suspense fallback={null}>
        <RoomGroup />
      </Suspense>
    </>
  )
}
