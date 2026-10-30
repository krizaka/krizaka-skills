---
name: krizaka-product-design
description: The product design rules of Krizaka's apps (Yomizaka, Akinaza, Orazaka) — plain, finished screens built only from @krizaka/ui components and @krizaka/tokens, each product in its brand colour, both themes, phone first, motion and accessibility budgets. Use when building, reviewing or restyling a screen, form, table or dashboard of a Krizaka product, or a web app that consumes @krizaka/ui. Not for the company's sites (use krizaka-cahier-design).
license: Apache-2.0
metadata:
  author: krizaka
---

# Krizaka product design — plain Krizaka UI, finished

A product screen is a tool: it must read in five seconds, feel finished, and never look « generated ». The look is
plain **Krizaka UI** (the Cahier chrome without the notebook ruling), in the product's brand colour.

## Rules

1. **Components only from `@krizaka/ui`** (`Button`, `DataTable`, `Dialog`, `Form` fields, `Chip`, `Sparkline`…).
   No hand-made button class, no hand-written `<table>` for data, no copy of a component. A missing component or
   variant is added to `@krizaka/ui` (with its examples and tests), released, then used.
2. **Colours only from tokens**: `var(--kz-surface-0..3)`, `var(--kz-text-primary|secondary|muted)`,
   `var(--kz-border-subtle|default|strong)`, `var(--kz-accent)`, `var(--kz-accent-text)`. The product's colour comes
   from its brand scope (`@krizaka/tokens/brands`), never from a hex in a component.
3. **Square and matt**: 2 px on controls, 0 on cards and dialogs; a solid paper offset for elevation; no blur, no glass,
   no glow, no gradient wash.
4. **One primary action per block** (`Button variant="primary"`), the others `secondary` or `ghost`.
5. **Real structure, demo data said as demo**: tabular figures for money and counts (`font-variant-numeric:
tabular-nums`), honest empty and error states, no invented screenshot or metric.
6. **Both themes and a phone** are part of done: light and dark, 360 px wide, keyboard only.
7. **Every string is translated** (English and French catalogues); no text chosen with a locale ternary.

## Budgets

| Budget        | Rule                                                                                                          |
| :------------ | :------------------------------------------------------------------------------------------------------------ |
| Motion        | the shared motion of `@krizaka/ui`; nothing moves under `prefers-reduced-motion`; no permanent animation loop |
| Data saver    | under `Save-Data`, no video backdrop and no heavy media                                                       |
| Contrast      | ≥ 4.5:1 for text, ≥ 3:1 for UI parts and the brand mark, in both themes                                       |
| Touch         | targets ≥ 44 × 44 px                                                                                          |
| Layout        | a fixed box for anything that loads late (no layout shift)                                                    |
| Data in React | through `@krizaka/query`; no fetch in a `useEffect`                                                           |

## Review checklist

- [ ] Only `@krizaka/ui` components and `var(--kz-*)` colours; no hex, no Tailwind literal colour utilities.
- [ ] One primary action per block; every action is a `Button`.
- [ ] Light, dark, phone and keyboard checked.
- [ ] Every claim on screen is true to what the code does.
