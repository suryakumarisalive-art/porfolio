import { Suspense } from 'react'
import { Lighting } from './Lighting'
import { SceneEnvironment } from './SceneEnvironment'
import { CameraRig } from './CameraRig'
import { RoomGroup } from '@/components/room/RoomGroup'
import { CanvasLoader } from '@/components/loaders/CanvasLoader'

/**
 * Root Three.js scene graph — assembled here, mounted by CanvasScene.
 * Owns the Suspense boundary so models can stream in.
 */
export function SceneRoot() {
  return (
    <>
      <Lighting />
      <SceneEnvironment />
      <CameraRig />

      <Suspense fallback={<CanvasLoader />}>
        <RoomGroup />
      </Suspense>
    </>
  )
}
