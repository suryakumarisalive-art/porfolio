'use client'

import { useGLTF, useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { MeshBasicMaterial, SRGBColorSpace, LinearMipmapLinearFilter, LinearFilter } from 'three'
import * as THREE from 'three'
import { useMemo } from 'react'

// ─── Baked model sources ──────────────────────────────────────────────────────
const SOURCES = [
  { glb: '/models/World/environment.glb',       tex: '/models/World/baked_environment.jpg' },
  { glb: '/models/Computer/computer_setup.glb', tex: '/models/Computer/baked_computer.jpg' },
  { glb: '/models/Decor/decor.glb',             tex: '/models/Decor/baked_decor_modified.jpg' },
] as const

// Preload GLBs AND textures simultaneously — both start fetching the moment
// this module is imported, so the Suspense boundary resolves with everything
// already in cache. Textures that aren't preloaded cause a visible pop-in
// because useLoader() inside a component only starts fetching on first render.
SOURCES.forEach(({ glb, tex }) => {
  useGLTF.preload(glb)
  useTexture.preload(tex)
})

// ─── Single baked model ───────────────────────────────────────────────────────

interface BakedModelProps {
  glb: string
  tex: string
}

function BakedModel({ glb, tex }: BakedModelProps) {
  const { scene }  = useGLTF(glb)
  const texture    = useTexture(tex)
  const { gl }     = useThree()

  useMemo(() => {
    // Texture space
    texture.flipY      = false
    texture.colorSpace = SRGBColorSpace

    // Filtering — critical for quality:
    //   LinearMipmapLinear (trilinear) eliminates shimmer on distant surfaces.
    //   Anisotropy removes the blurring you'd see on surfaces at oblique angles
    //   (floor, desk top, side walls). getMaxAnisotropy() returns 16 on most
    //   modern GPUs; Three.js clamps it safely if the device is weaker.
    texture.minFilter  = LinearMipmapLinearFilter
    texture.magFilter  = LinearFilter
    texture.anisotropy = gl.capabilities.getMaxAnisotropy()
    texture.needsUpdate = true

    const mat = new MeshBasicMaterial({ map: texture })

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = mat
      }
    })
  }, [scene, texture, gl])

  return <primitive object={scene} scale={900} />
}

// ─── Room shell ───────────────────────────────────────────────────────────────

/**
 * Loads and renders the three henry-clone baked GLBs as the static room visual.
 * All interactive behaviour lives in sibling hotspot components.
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
