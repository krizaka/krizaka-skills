---
name: krizaka-engineering
description: How Krizaka writes code — ports and adapters, domain code without env or ambient clock, the @krizaka/* library-first lookup (a generated reference of what every package exports), small functions with one job, no duplication, settings as data, names by function, typed errors, a failing test before a fix, and the journey as the proof. Use when writing or reviewing TypeScript or Java in a Krizaka repository, before adding a route handler, a form, a service or a helper, and before pushing.
license: Apache-2.0
metadata:
  author: krizaka
---

# Krizaka engineering

The code must read like it was written by one careful person: each piece does one thing, in one place, with the
library that already does it. The guards (ESLint, ast-grep, ArchUnit, jscpd, the ratchets) enforce what they can; this
skill is the rest of the judgement.

## 1. Before you code

1. **Start from the issue.** One issue, one deliverable; its acceptance criteria and the journey that will prove it.
2. **Look the capability up in [references/packages.md](./references/packages.md)** — the generated list of every
   `@krizaka/*` package and what it exports. A size check, a type sniff, a date sum, a money or date format, a fetch, a
   retry, a debounce, a rate limit, a validation regex, a setting, an audit line, a mail, a webhook: it is there.
3. **Missing function? Add it to the package first** (with its tests and a changeset), release, then use it. Never a
   local copy, never « for now ».
4. **No `@krizaka` package covers it?** Prefer a maintained, widely adopted open-source library with a permissive
   licence, behind a `@krizaka/*` facade (apps never import it directly). Write the choice and the reason in the PR.
5. **Data before code.** A limit, a price, a duration, a feature flag, a routing choice is a setting in the database
   (`@krizaka/settings`), changed by an administrator — not a constant, not an `if` on a name.
6. **Place it.** Decide its layer (section 2) and its file name (section 5) before the first line.

## 2. Architecture — ports and adapters

```text
app (route handler, page, CLI)  →  service (use case)  →  port (interface)  ←  adapter (database, HTTP, storage)
                                        ↓
                                   domain (pure rules)
```

- **Domain** is pure: no `process.env`, no `new Date()` / `Date.now()`, no database client, no `fetch`. Values arrive
  as parameters; the clock is injected (`Clock`); randomness is injected.
- **Services** orchestrate one use case through ports. No SQL and no schema import in a `*.service.ts` or `*.rules.ts`.
- **Adapters** implement a port (`pgShopStore`, `memoryShopStore`); the memory one serves the tests.
- **App code** (a route handler, a page) is thin: authenticate, parse, call one service, map the result. Env is read
  once, in a typed module (`lib/env.ts`), and passed down.
- **A closed set is a type** (`as const` object and its derived type, a Java enum or sealed interface), never strings
  compared by hand. No TypeScript `enum`.
- React server state goes through `@krizaka/query` (`useQuery`, `useMutation`, `krizakaFetch`), never `fetch` in an
  effect or a hand-made `isLoading` / `error` state. UI comes from `@krizaka/ui`.

## 3. Small functions with one job

- **The budget**: cognitive complexity ≤ 15, nesting ≤ 2 levels, ≤ 3 nested callbacks, a function body that fits one
  screen (about 60 lines). Above it, the lint ratchet fails.
- **One job.** If the description of a function needs « and », split it. A handler reads like a table of contents:
  `const plan = planOf(input); const ok = await confirm(plan); if (ok) await save.mutateAsync(plan);`
- **Save once.** A form gathers, validates, then calls one mutation. Never two writes for one submit, never a write
  hidden inside a helper the name does not announce.
- **Return early** on the refusal; the happy path is not nested.
- **No magic numbers.** A number is a setting, a named constant with its reason (`// @fixed: <why>` on an exported
  one), or a unit from a library (`addMinutes`, not `n * 60 * 1000`).

## 4. No duplication

- The same block in two places is a function; in two repositories it is a package function.
- One source per rule set, per list, per type: generate the others from it (types from a schema, docs from the code).
- jscpd counts duplicated lines per repository; the count only goes down.

## 5. Names by function

- Files and symbols say what they do: `media-store.ts`, `send-receipt.ts`, `shopStore` — never the technology
  (`postgres.ts`, `mailgun.ts`) and never `utils`, `helpers`, `manager`, `misc`.
- Booleans read as a question (`isPaid`, `canPublish`); functions as an action (`storeImage`, `planOf`).
- Environment variables by bounded context (`MAIL_PROVIDER`, `MEDIA_STORAGE_ZONE`), never by vendor or product.

## 6. Errors are typed

- A refusal is a typed error with a stable code (`StorageError` with `STORAGE_CODE.tooBig`, an `ApiError` with a
  Problem Details body), mapped to HTTP **once**, in the shared handler — not a string, not a `{ error: "…" }` built in
  every route.
- Never swallow: a `catch` either maps to a typed error, retries through the library, or rethrows.
- User-facing messages come from the translation catalogues, keyed by the error code. No English fallback in code.

## 7. Tests

- **A fix starts with a failing test** that reproduces the bug; the fix turns it green; the test stays.
- **Every bug gets its guard**: ask why the dev-time checks missed it and add the rule (ast-grep, ESLint, ArchUnit, a
  page audit) so the whole class fails next time.
- Unit tests for logic (a service with memory adapters, a pure rule); the library's own components are tested in the
  library, not again in the product.
- **The journey proves the feature**: an end-to-end run (Playwright, Maestro) of what the user does, on demo data,
  green before the feature is called done.

## 8. Before you push

- [ ] Each new function has one job and fits the budget; no new `eslint-disable`, no new ratchet count.
- [ ] Nothing generic was hand-written that [references/packages.md](./references/packages.md) already exports.
- [ ] No env, clock or I/O in domain code; no SQL in a service; route handlers are thin.
- [ ] No duplicated block; no magic number; names by function.
- [ ] Errors typed, mapped once; messages translated (both languages).
- [ ] Tests: the failing test first for a fix, unit tests for the logic, the journey for the feature.
- [ ] Format, lint, type check and tests green locally on what changed; hooks run, never bypassed.
- [ ] The README and generated docs still say what the code does.

## 9. Examples

[references/examples.md](./references/examples.md) rewrites three shapes we found in real code — an upload route that
re-checks what the storage library checks, a form handler with five jobs, a hand-made fetch state — the way this
skill asks.

## 10. When the rules disagree with the code

The guard is right until proven wrong: fix the code. If the rule is truly wrong for a case, change the rule (with its
test) in the shared configuration — never silence it locally, never raise a ratchet.
