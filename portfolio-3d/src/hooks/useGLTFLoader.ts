'use client'

import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import type { GLTF } from 'three-stdlib'
import type { Mesh, Material } from 'three'

// Point drei's GLTF loader at the Draco decoder placed under /public/draco/
// This call is idempotent and must run before any useGLTF() call.
useGLTF.setDecoderPath('/draco/')

export type GLTFResult = GLTF & {
  nodes:     Record<string, Mesh>
  materials: Record<string, Material>
}

/**
 * Typed GLTF loader wrapping drei's useGLTF.
 * Automatically uses the Draco decoder at /draco/.
 *
 * @param path  Path relative to /public — e.g. '/models/room.glb'
 * @returns     Typed GLTF result with `scene`, `nodes`, `materials`, `animations`
 */
export function useGLTFLoader(path: string): GLTFResult {
  return useGLTF(path) as unknown as GLTFResult
}

/**
 * Preload a GLTF asset before the component mounts.
 * Call at module scope alongside the component that will load the model.
 */
export function preloadGLTF(path: string): void {
  useGLTF.preload(path)
}

// ─── Internal: ensure decoder path is set on module load ─────────────────────
// (the setDecoderPath call at the top handles this, this effect is a safety net
// in case the module is hot-reloaded out of order in development)
export function useEnsureDecoderPath(): void {
  useEffect(() => {
    useGLTF.setDecoderPath('/draco/')
  }, [])
}

