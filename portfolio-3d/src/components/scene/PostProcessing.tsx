'use client'

import { EffectComposer, SMAA, Bloom, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

/**
 * Post-processing pipeline.
 *
 * SMAA — subpixel morphological anti-aliasing: clean geometry edges with no
 *   MSAA render-target cost. Pairs with demand frameloop cleanly.
 *
 * Bloom — only the brightest pixels (the glowing monitor UI, the lamp bulb)
 *   exceed the threshold and bloom; PBR surfaces stay grounded.
 *
 * ToneMapping (ACES Filmic) — the composer takes over tone mapping from the
 *   renderer, so we apply ACES here for filmic highlight roll-off and rich,
 *   cinematic contrast.
 *
 * multisampling=0 (SMAA handles AA), enableNormalPass=false (no effect needs it).
 */
export function PostProcessing() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={0.9}
        luminanceSmoothing={0.05}
        intensity={0.55}
        radius={0.7}
        mipmapBlur
      />
      <SMAA />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
