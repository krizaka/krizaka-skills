---
name: krizaka-agent-cto
description: How a coordinating agent runs software work across several agent sessions — one lane per product plus a platform and a security lane, issues before code, small PR slices that land one after the other, standard issue and PR titles, secrets never on screen, and a short handoff. Use when planning or dispatching work to coding agents, splitting a feature into pull requests, or reviewing whether an agent session followed the delivery rules.
license: Apache-2.0
metadata:
  author: krizaka
---

# The agent CTO — delivery rules for a team of coding agents

The motto: **keep the flow moving; we set the deadline — it may move, the quality never does.**

## 1. Lanes

Work is split into **lanes**, one agent session each, so two sessions never edit the same files:

| Lane            | Owns                                                                                            |
| :-------------- | :---------------------------------------------------------------------------------------------- |
| one per product | that product's repositories, end to end (web, admin, mobile, desktop, CLI/API where they exist) |
| platform        | shared libraries, templates, CI, the design system, the org's conventions                       |
| security        | scanners, secret hygiene, advisories, supply-chain checks                                       |

A session reads its lane's handoff, works its queue in order, and writes a short handoff when it stops.

## 2. Issues first, then slices

1. Every piece of work starts from an issue with acceptance criteria and the surfaces it must reach.
2. A feature is split into slices that each land on their own, in order:
   contracts and schema → domain logic with unit tests → integration → user interface → end-to-end proof and telemetry.
3. One pull request per slice; the next one starts when the previous one is in the merge queue.
4. Cap the open pull requests per repository; at the cap, land before opening more.
5. A finding outside the slice is not fixed in passing: it goes in the issue's checklist or a new issue.

## 3. Conventions

- **Issue title**: `<repo> · <type>(<scope>): <what, in plain words>` — types: feat, fix, test, docs, chore, ci, perf,
  refactor, security, design.
- **PR body**: `## Why`, `## What`, `## Acceptance` (a checklist), and the issue it closes, with its full reference.
- **Commits**: Conventional Commits; the author is the agent's own identity, never a person's.
- **Reviews**: findings as PR comments; small fixes are committed on the branch by the reviewer; large rework goes back.
- Sensitive matters (vulnerabilities, abuse detection, prices, infrastructure details) never go in a public issue: a
  vulnerability is a private security advisory; the rest goes to a private tracker.

## 4. Security rules every session follows

1. A secret is never typed, printed, committed or put in a URL. Commands read it from a secret manager or the
   environment, inside the command; a token response goes to a variable or a `chmod 600` file, never to stdout.
2. Hooks are never skipped (`--no-verify` is forbidden); a test, rule or ratchet is never weakened to get green.
3. Every repository runs secret scanning (gitleaks) and workflow linting (actionlint, zizmor) in CI; actions are
   pinned by commit SHA.
4. Personal data is masked in logs and fixtures; demo data only, never a real customer.

## 5. Session protocol

1. Read the lane handoff and the repository's `AGENTS.md`.
2. Land or close your open pull requests before starting new work.
3. Write the failing test first for a fix; every bug gets the guard that would have caught it.
4. Run the targeted tests locally; let CI run the rest.
5. Hand off in three lines: what landed (links), what waits and why, what is next.
