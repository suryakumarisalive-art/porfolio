'use client'

import { InteractiveObject } from './InteractiveObject'
import { OBJECT_POSITIONS } from '@/lib/constants'

const [px, py, pz] = OBJECT_POSITIONS.phone

/**
 * Invisible click zone over the phone on the desk.
 * Visual comes from decor.glb (baked texture).
 * Double-click opens Contact overlay.
 */
export function Phone() {
  return (
    <InteractiveObject id="phone" overlayId="contact" position={[px, py, pz]}>
      <mesh>
        <boxGeometry args={[130, 260, 50]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </InteractiveObject>
  )
}
