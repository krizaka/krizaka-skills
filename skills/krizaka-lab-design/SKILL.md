---
name: krizaka-lab-design
description: Design and performance rules for 3D, WebGL and scroll-driven showroom pages — depth that explains, three quality tiers down to a static plate, lazy-loaded scenes, paused render loops, compressed models and a still version under reduced motion. Use when building or reviewing a 3D scene, a Three.js / React Three Fiber canvas or a scroll-driven showcase page.
license: Apache-2.0
metadata:
  author: krizaka
---

# Krizaka Lab — spatial pages that stay fast

The Lab is where experiments are shown. Its pages may use depth and motion, under the same rules as every other page:
they must explain something, load fast, and degrade to a readable still page.

## Principles

1. **Depth explains, never decorates.** A 3D scene shows a structure, a flow or an object; if a static figure says the
   same thing, ship the figure.
2. **Scroll drives the camera** through a normalised progress (`0 → 1`) per section; the text never waits for the scene.
3. **Three tiers, decided at load**:
   - full: WebGL 2 (or WebGPU where available), post-processing only if the frame budget holds;
   - light (phones, low battery, weak GPU): baked lighting, no post-processing, fewer draw calls;
   - still (`prefers-reduced-motion`, `Save-Data`, no WebGL): a static image or SVG plate with the same layout and text.

## Implementation rules

- Three.js or React Three Fiber (`@react-three/fiber`, `@react-three/drei`); the scene code is a lazy chunk loaded when
  the canvas approaches the viewport (`IntersectionObserver`).
- Models are `.glb` compressed with Draco or Meshopt; textures in KTX2 or WebP; a size budget per scene, checked in CI.
- The render loop runs only while the canvas is visible and the tab is shown:

  ```ts
  const visible = isInView && !document.hidden;
  renderer.setAnimationLoop(visible ? render : null);
  ```

- Frame-rate independent motion (delta time); `devicePixelRatio` capped (e.g. 2) to keep fill rate in check.
- The canvas is `aria-hidden`; everything it shows is also in the page as text (a caption, a list or a table).
- Colours of the page chrome still come from `@krizaka/tokens`; the scene's own lighting is the scene's business.

## Done when

- [ ] Largest Contentful Paint is the text, not the canvas.
- [ ] The still tier reads correctly with JavaScript disabled.
- [ ] No frame drops while scrolling on a mid-range phone; the loop stops off screen.
- [ ] Both themes and a phone width checked.
