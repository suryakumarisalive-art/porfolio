'use client'

import { useEffect } from 'react'
import * as THREE from 'three'

/**
 * Disposes geometries, materials, and textures on component unmount.
 *
 * IMPORTANT: Only pass locally-created (cloned) objects here.
 * Never pass drei/useGLTF cached assets — disposing them corrupts other
 * instances sharing the same cache entry.
 *
 * @param object  A THREE.Object3D (group/mesh) whose sub-tree to dispose
 */
export function useDisposable(object: THREE.Object3D | null | undefined): void {
  useEffect(() => {
    if (!object) return
    return () => {
      disposeObject(object)
    }
  }, [object])
}

/**
 * Recursively dispose geometries, materials, and textures on an Object3D sub-tree.
 * Safe to call on locally-created clones; never call on cached GLTF assets.
 */
export function disposeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose()
      disposeMaterial(child.material)
    }
  })
}

function disposeMaterial(
  material: THREE.Material | THREE.Material[] | undefined
): void {
  if (!material) return
  const mats = Array.isArray(material) ? material : [material]
  for (const mat of mats) {
    // Dispose all texture slots
    if ('map'              in mat && mat.map              instanceof THREE.Texture) mat.map.dispose()
    if ('normalMap'        in mat && mat.normalMap        instanceof THREE.Texture) mat.normalMap.dispose()
    if ('roughnessMap'     in mat && mat.roughnessMap     instanceof THREE.Texture) mat.roughnessMap.dispose()
    if ('metalnessMap'     in mat && mat.metalnessMap     instanceof THREE.Texture) mat.metalnessMap.dispose()
    if ('emissiveMap'      in mat && mat.emissiveMap      instanceof THREE.Texture) mat.emissiveMap.dispose()
    if ('aoMap'            in mat && mat.aoMap            instanceof THREE.Texture) mat.aoMap.dispose()
    if ('envMap'           in mat && mat.envMap           instanceof THREE.Texture) mat.envMap.dispose()
    mat.dispose()
  }
}
