'use client'

import { Environment, Lightformer } from '@react-three/drei'

/**
 * Image-based lighting built entirely from inline Lightformers — NO network
 * fetch, so it works under any environment network policy and never stalls
 * loading. These emitter planes are rendered once into an off-screen cubemap
 * and drive the specular reflections you see on the screen bezel, mug, lamp,
 * and laptop lid.
 *
 * The layout mimics a softbox key (large warm panel, upper-right), a cool
 * window fill (left), and a soft top strip — giving metals and plastics
 * believable, directional highlights instead of a flat grey sheen.
 */
export function SceneEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      {/* Warm key softbox — upper right */}
      <Lightformer
        form="rect"
        intensity={3}
        color="#fff0db"
        position={[2.5, 3, 1]}
        rotation={[-Math.PI / 4, 0, 0]}
        scale={[4, 3, 1]}
      />
      {/* Cool window fill — left */}
      <Lightformer
        form="rect"
        intensity={1.4}
        color="#dce7ff"
        position={[-3, 2, 0.5]}
        rotation={[0, Math.PI / 3, 0]}
        scale={[3, 4, 1]}
      />
      {/* Soft top strip */}
      <Lightformer
        form="rect"
        intensity={1.1}
        color="#ffffff"
        position={[0, 4, -1]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[5, 2, 1]}
      />
      {/* Subtle rim from behind */}
      <Lightformer
        form="rect"
        intensity={0.8}
        color="#ffd9b0"
        position={[0, 1.5, -4]}
        rotation={[Math.PI, 0, 0]}
        scale={[4, 2, 1]}
      />
    </Environment>
  )
}
