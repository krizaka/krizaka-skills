---
name: krizaka-cahier-design
description: The Cahier look of Krizaka's own sites (krizaka.com, the blog, ui.krizaka.com and the tool sites) — paper and blue ink, the Seyès ruling, the red margin with § numbers, square corners, solid paper shadows, the pen stroke and the birds as specimens. Use when designing, building or reviewing a page of a Krizaka site, or when asked for the Krizaka editorial / notebook style. Not for product screens (use krizaka-product-design).
license: Apache-2.0
metadata:
  author: krizaka
  source: https://github.com/krizaka/krizaka-ui/blob/main/docs/adr/ADR-004-cahier.md
---

# Krizaka Cahier — the flock's field notebook

Cahier is the identity of Krizaka's **own sites**: the French school copybook meets the naturalist's plates. The birds
are not mascots; they are the specimens the system is organised around. It ships in `@krizaka/tokens`,
`@krizaka/fonts`, `@krizaka/tailwind`, `@krizaka/icons` and `@krizaka/ui` — **use those packages, never re-type values**.

## When to use it, when not

| Surface                                               |                  Cahier?                  | Why                                                                |
| :---------------------------------------------------- | :---------------------------------------: | :----------------------------------------------------------------- |
| krizaka.com, the blog, ui.krizaka.com, the tool sites |                    yes                    | the company's voice: story, proof, documentation                   |
| Product screens (dashboards, forms, dense tables)     |                    no                     | use `krizaka-product-design`: plain Krizaka UI, no notebook ruling |
| A product's public showcase page                      | only when its own design decision says so | products keep their brand colour                                   |

## The levers

| Lever         | Cahier rule                                                                                                                                                                  |
| :------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type          | **Young Serif** for display (one weight, never bold), **Atkinson Hyperlegible Next** for text, **Courier Prime** for notes and code — from `@krizaka/fonts`, all SIL OFL 1.1 |
| Colour, light | **paper** (cool white, never cream) and **blue ink** for text                                                                                                                |
| Colour, dark  | **slate** (green-grey) and **chalk**                                                                                                                                         |
| Accent        | the steel blue of the pen; each product keeps its own colour                                                                                                                 |
| Grid          | the **Seyès ruling** as an opt-in paper (`Page paper="ruled"` or `"lines"`); the **red margin** where section numbers hang (`§ 2`)                                           |
| Radius        | **2 px on controls, 0 on cards, dialogs and sheets**; only the pill stays round                                                                                              |
| Elevation     | **a solid offset of paper**, never a blur; no glow                                                                                                                           |
| What floats   | **an opaque sheet**: no backdrop blur, no frosted glass                                                                                                                      |
| Surfaces      | **matt paper**: no sheen, no light edge, no gradient wash                                                                                                                    |
| Labels        | **lower-case notes** in the typewriter face, in the margin red; no tracked uppercase eyebrows                                                                                |
| Icons         | `@krizaka/icons`: a 1.5 pen stroke, square caps, mitred joins                                                                                                                |
| Motion        | **ink**: blocks settle in place (no travel, no blur), the pen's ease; nothing moves under `prefers-reduced-motion`                                                           |
| Navigation    | an ink underline under the current item                                                                                                                                      |

## How to build a page

1. Compose the page from the `@krizaka/ui` blocks (`Page`, `PageHero`, `Section`, `SectionHeading`, `CardGrid`…).
   A missing block goes into `@krizaka/ui` first, never a local copy.
2. Colours come only from tokens: `var(--kz-surface-0)`, `var(--kz-text-primary)`, `var(--kz-accent)`,
   `var(--kz-border-subtle)`… No hex in a component.
3. Number sections in the margin (`§ 1`, `§ 2.1`) only on reading pages (story, docs, long posts).
4. Frame every figure: a thin rule, a caption under it that says what the figure shows (« Fig. 2 — … »).
5. One bird per subject, carrying a promise (the falcon watches over security, the owl reads documents), never
   decoration; never the same bird twice in the same mood on one page.
6. Check both themes (paper and slate) and a phone width before calling it done.

## Refuse

- The default template look: a centred hero with an uppercase mono eyebrow and two buttons over every section, a band of
  counting figures under every hero, fake browser windows, blurred glows, one big radius everywhere.
- Cream backgrounds, glassmorphism, gradient washes, drop shadows with blur.
- Bold Young Serif, or a font file copied into the repository.
