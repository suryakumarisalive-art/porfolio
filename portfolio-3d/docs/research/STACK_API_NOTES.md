# Stack API Notes — Pre-Flight Gate Output

Confirmed 2026-06-17. All code generation is gated on these exact versions and API names.

## Pinned Versions

| Package | Version |
|---|---|
| next | 15.5.19 |
| react | 19.2.7 |
| react-dom | 19.2.7 |
| @react-three/fiber | 9.6.1 |
| @react-three/drei | 10.7.7 |
| three | 0.184.0 |
| @types/three | 0.184.1 |
| @types/react | 19.2.17 |
| zustand | 5.0.14 |
| gsap | 3.15.0 |

## R3F 9.6.1 (React 19)

- `Canvas` props: `frameloop`, `gl`, `dpr`, `camera`, `shadows`, `onCreated`
- `useThree()` → `{ camera, gl, scene, invalidate, size, viewport, ... }`
- `useFrame((state, delta) => { ... })` — second arg is delta in **seconds**
- `state.invalidate()` / `invalidate()` from destructured `useThree()` to request a new frame under `frameloop="demand"`
- Pointer events on mesh children: `onPointerOver`, `onPointerOut`, `onClick`, `onDoubleClick`; `event.stopPropagation()` available on R3F synthetic event object
- `onCreated` callback receives `{ gl, camera, scene }` state

## @react-three/drei 10.7.7

- `OrbitControls` props: `enableDamping` (bool), `dampingFactor` (num), `minDistance`, `maxDistance`, `minPolarAngle`, `maxPolarAngle`, `makeDefault` (registers as default controls), `target` (Vector3)
- `useGLTF(url)` — returns `{ scene, nodes, materials, animations }`; Draco wiring via `useGLTF.setDecoderPath('/draco/')`
- `useGLTF.preload(url)` — preloads before mount
- `useProgress()` → `{ progress: number, active: boolean, loaded: number, total: number, errors: string[], item: string }`
- `Html` — renders DOM inside canvas; `Environment` for IBL; `Bounds` for auto-framing

## Next.js 15.5.19

- `metadata` and `viewport` are **separate named exports** from `layout.tsx` or `page.tsx`
- `themeColor` lives in the `viewport` export (NOT in `metadata`)
- `dynamic(() => import('./Foo'), { ssr: false })` **must be called from a Client Component** (`'use client'`); calling it from a Server Component throws
- App Router: Server Components by default; add `'use client'` for any component using hooks, refs, or browser APIs
- `ImageResponse` for OG images requires `export const runtime = 'edge'` or `'nodejs'` explicitly in the route

## Zustand 5.0.14

- Curried creator: `create<State>()((set, get) => ({ ... }))` (the extra `()` is required)
- Middleware import: `import { subscribeWithSelector } from 'zustand/middleware'`
- No `createWithEqualityFn` in v5 (removed); use `useStore(selector, Object.is)` or `useShallow` from `zustand/react/shallow`
- `import { useShallow } from 'zustand/react/shallow'` for shallow equality multi-field selectors

## GSAP 3.15.0

- `gsap.context(func, scopeElement)` — scoped tween cleanup; `.revert()` on unmount
- For React: `useGSAP(callback, { scope, dependencies })` from `@gsap/react` (install separately)
- In `useEffect` without `@gsap/react`: create `const ctx = gsap.context(() => { ... }, ref)` → return `() => ctx.revert()`
- `gsap.to(target, { x, y, opacity, duration, ease, onComplete })` — compositor-only props: `x`, `y`, `opacity`, `scale`
- Respect `prefers-reduced-motion` by checking `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before animating

## Three.js 0.184.0

- Performance counters: `renderer.info.render.calls` (draw calls), `renderer.info.render.triangles`
- Memory: `renderer.info.memory.geometries`, `renderer.info.memory.textures`
- Disposal: `geometry.dispose()`, `material.dispose()`, `texture.dispose()`
- Context loss: `canvas.addEventListener('webglcontextlost', handler)`, `canvas.addEventListener('webglcontextrestored', handler)` — must `event.preventDefault()` in `webglcontextlost` for restore to fire
- `THREE.Vector3`, `THREE.Euler`, `THREE.Color` — declare at file scope, mutate via `.set()` / `.copy()` / `.lerpVectors()` inside `useFrame`; never `new` inside `useFrame`

## Deviations From Plan Defaults

| Plan Assumption | Actual |
|---|---|
| `@types/three` matches `three` | `three@0.184.0`, `@types/three@0.184.1` — exact match ✓ |
| R3F `delta` unit | seconds (not ms) — use decay values accordingly |
| Zustand creator | curried `create<S>()((set) => ...)` — extra `()` required |
| `ssr:false` in dynamic import | must be from `'use client'` component — plan already accounts for this ✓ |
