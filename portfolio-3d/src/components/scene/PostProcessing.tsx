'use client'

import { EffectComposer, SMAA, Bloom } from '@react-three/postprocessing'

/**
 * Post-processing pipeline.
 *
 * SMAA — subpixel morphological anti-aliasing: removes jagged geometry edges
 *   without the overhead of MSAA render targets. Works cleanly with demand
 *   frameloop since it runs as part of the normal compose pass.
 *
 * Bloom — blooms pixels that exceed the luminance threshold. At default
 *   camera distance the CRT phosphor green (#00ff41) reads well above 0.9
 *   in sRGB space, so only the monitor screen glows — nothing else.
 *
 * multisampling={0} — disables WebGL2 MSAA on the FBO (SMAA handles AA).
 * enableNormalPass={false} — skip the G-buffer normal pass (not needed for
 *   MeshBasicMaterial; saves one render pass).
 */
export function PostProcessing() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <SMAA />
      <Bloom
        luminanceThreshold={0.88}
        luminanceSmoothing={0.03}
        intensity={0.35}
        radius={0.65}
        mipmapBlur
      />
    </EffectComposer>
  )
}
