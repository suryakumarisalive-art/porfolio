'use client'

import { useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { TextureLoader, SRGBColorSpace, MeshBasicMaterial } from 'three'
import * as THREE from 'three'
import { useMemo } from 'react'

// ─── Baked model sources ──────────────────────────────────────────────────────
// Each entry pairs a Draco-compressed GLB with its baked lightmap texture.
const SOURCES = [
  { glb: '/models/World/environment.glb',       tex: '/models/World/baked_environment.jpg' },
  { glb: '/models/Computer/computer_setup.glb', tex: '/models/Computer/baked_computer.jpg' },
  { glb: '/models/Decor/decor.glb',             tex: '/models/Decor/baked_decor_modified.jpg' },
] as const

// Preload all three GLBs so they start fetching immediately when the module loads.
SOURCES.forEach(({ glb }) => useGLTF.preload(glb))

// ─── Single baked model ───────────────────────────────────────────────────────

interface BakedModelProps {
  glb: string
  tex: string
}

function BakedModel({ glb, tex }: BakedModelProps) {
  const { scene } = useGLTF(glb)
  const texture   = useLoader(TextureLoader, tex)

  // Apply the baked texture as MeshBasicMaterial on every mesh — runs once per pair
  useMemo(() => {
    texture.flipY      = false
    texture.colorSpace = SRGBColorSpace

    const mat = new MeshBasicMaterial({ map: texture })

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = mat
      }
    })
  }, [scene, texture])

  // Scale matches henry-clone: models are in 1-unit GLB space → 900-unit world
  return <primitive object={scene} scale={900} />
}

// ─── Room shell ───────────────────────────────────────────────────────────────

/**
 * Loads and renders the three henry-clone baked GLBs as the static room visual.
 * All interactive behaviour lives in the sibling hotspot components (Monitor,
 * Laptop, Desk, BookShelf, Phone) which overlay invisible click planes.
 */
export function RoomShell() {
  return (
    <group>
      {SOURCES.map(({ glb, tex }) => (
        <BakedModel key={glb} glb={glb} tex={tex} />
      ))}
    </group>
  )
}
