'use client'

import { InteractiveObject } from './InteractiveObject'
import { OBJECT_POSITIONS } from '@/lib/constants'

const [px, py, pz] = OBJECT_POSITIONS.desk

/**
 * Invisible click zone covering the desk surface.
 * Visual comes from environment.glb (baked texture).
 * Double-click opens About overlay.
 */
export function Desk() {
  return (
    <InteractiveObject id="desk" overlayId="about" position={[px, py, pz]}>
      <mesh>
        <boxGeometry args={[2600, 100, 1800]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </InteractiveObject>
  )
}
