'use client'

import { InteractiveObject } from './InteractiveObject'
import { OBJECT_POSITIONS } from '@/lib/constants'

const [px, py, pz] = OBJECT_POSITIONS.monitor

/**
 * Invisible click zone in front of the monitor screen.
 * Visual comes from computer_setup.glb (baked texture).
 * Double-click opens Projects overlay and flies camera to screen.
 */
export function Monitor() {
  return (
    <InteractiveObject id="monitor" overlayId="projects" position={[px, py, pz]}>
      <mesh>
        <boxGeometry args={[1000, 800, 100]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </InteractiveObject>
  )
}
