import { Suspense } from 'react'
import { Lighting } from './Lighting'
import { CameraRig } from './CameraRig'
import { RoomGroup } from '@/components/room/RoomGroup'

export function SceneRoot() {
  return (
    <>
      <Lighting />
      <CameraRig />

      {/* null fallback — CanvasLoader lives in UILayer as an HTML overlay */}
      <Suspense fallback={null}>
        <RoomGroup />
      </Suspense>
    </>
  )
}
