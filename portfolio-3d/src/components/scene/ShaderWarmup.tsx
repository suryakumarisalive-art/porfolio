'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { usePortfolioStore } from '@/store/usePortfolioStore'

/**
 * Forces a full shader-compilation pass the moment the Suspense boundary
 * resolves (all GLBs + textures in the cache). Calling `gl.compile()` walks
 * the scene graph, compiles every GLSL program into the driver cache, and
 * uploads every texture to VRAM — all before the loader overlay fades out.
 *
 * Without this, the first real render frame triggers JIT compilation in the
 * driver (visible as a 100-400ms hitch on the first mouse move after START).
 */
export function ShaderWarmup() {
  const { gl, scene, camera } = useThree()
  const lifecycle = usePortfolioStore((s) => s.lifecycle)

  useEffect(() => {
    if (lifecycle !== 'booting' && lifecycle !== 'loading') return
    // compile() is synchronous and safe to call at any time
    gl.compile(scene, camera)
  }, [gl, scene, camera, lifecycle])

  return null
}
