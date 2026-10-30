---
name: krizaka-quality-gate
description: The quality gate every change passes — static checks, secret and workflow scanning, unit and integration tests, and evaluation of LLM features with structured outputs and grounded answers. Use when setting up CI for a repository, reviewing a pull request before merge, or adding an LLM-powered feature that must return reliable, schema-checked results.
license: Apache-2.0
metadata:
  author: krizaka
---

# The quality gate

A change merges only when every ring is green. A ring is never skipped, weakened or silenced to get there.

## 1. The rings

1. **Static**: formatter check, linter, type checker in strict mode, workflow lint (actionlint).
2. **Security**: secret scanning (gitleaks), workflow security (zizmor), dependency audit, actions pinned by SHA,
   OpenSSF Scorecard on the default branch.
3. **Tests**: unit tests for logic, integration tests for adapters, end-to-end journeys for what a user does. A fix
   starts with the failing test that reproduces it.
4. **LLM evaluation** (for AI features): schema validity rate, grounding checks and a regression set run in CI.

## 2. LLM outputs you can trust

### Structured, never free text where a program reads it

```ts
import { z } from "zod";

export const ExtractionResult = z.object({
  documentId: z.string().uuid(),
  fields: z.array(
    z.object({
      name: z.enum(["issuer", "date", "total"]),
      value: z.string(),
      evidence: z.string().describe("verbatim quote from the source"),
    }),
  ),
  ambiguous: z.boolean(),
});
```

Validate every response against the schema; a response that fails is retried or reported, never patched by hand.

### Grounding

1. **Evidence first**: the model quotes the source fragment before it concludes; the quote is checked against the source.
2. **Say « unsure »**: below the threshold you set, return an explicit ambiguity flag rather than a confident guess.
3. **Plain words**: no filler or hype in generated text; claims must be true to what the product does.

### Regression set

Keep a small set of real-shaped (demo) inputs with expected outputs; run it on every prompt or model change and fail
the build when the score drops.

## 3. Before you open the pull request

- [ ] Lint, types and tests pass locally for what you touched.
- [ ] No `.env` file, key or token in the diff; examples use placeholders.
- [ ] Dependencies come from official registries and are pinned by the lockfile.
- [ ] The PR says what changed and how it was verified.
