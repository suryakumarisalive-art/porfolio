'use client'

import { InteractiveObject } from './InteractiveObject'
import { OBJECT_POSITIONS } from '@/lib/constants'

const [px, py, pz] = OBJECT_POSITIONS.laptop

/**
 * Invisible click zone over the keyboard / trackpad.
 * Visual comes from computer_setup.glb (baked texture).
 * Double-click opens Resume overlay.
 */
export function Laptop() {
  return (
    <InteractiveObject id="laptop" overlayId="resume" position={[px, py, pz]}>
      <mesh>
        <boxGeometry args={[900, 80, 550]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </InteractiveObject>
  )
}
