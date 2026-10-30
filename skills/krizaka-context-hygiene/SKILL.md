---
name: krizaka-context-hygiene
description: Keep a long agent session sharp and cheap — read only what you need, cap tool output, keep working memory in a checkpoint file, hand off before the context fills, and order prompts so the stable part is cached. Use when an agent session is long, slow, repetitive or expensive, when planning a multi-hour task, or when writing prompts and system instructions that run many times.
license: Apache-2.0
metadata:
  author: krizaka
---

# Context hygiene

A context window filled with old tool output degrades answers: early constraints are forgotten and stale code is
quoted back. Treat context as a budget.

## 1. Read narrowly

- Ask a code index or a search tool where something is before opening files; open the lines you need, not the folder.
- Cap output at the source: `git log -n 5`, `--stat`, `head`, `jq` to select fields, a test runner's failure-only mode.
- Never paste minified bundles, lockfiles, source maps or large JSON into the conversation.
- Delegate a wide search to a subagent only when you need its conclusion and not the file contents.

## 2. Working memory on disk

Keep the state of a long task in a checkpoint file (outside the committed tree, or in a scratch folder that is
git-ignored):

```markdown
# Session state: <task>

- Goal: <one sentence>
- Done: <slices landed, with links>
- Blocked by: <exact error, or none>
- Next action: <file and function>
```

Update it at each milestone. A fresh session that reads it resumes in seconds.

## 3. Hand off before it degrades

Watch the context gauge your agent shows. Well before it is full: commit, update the checkpoint, and continue in a new
session (or let the agent compact) — rather than pushing through a crowded window.

## 4. Order prompts for caching

Providers cache a stable prompt prefix (Anthropic prompt caching, for example). Put what never changes first — system
rules, the repository's `AGENTS.md`, skill and persona definitions — and what changes per task last. Do not inject
timestamps or random ids into the stable part.

## 5. Checklist

- [ ] No tool call returns more than you will read.
- [ ] The checkpoint is current before any long wait or handoff.
- [ ] Stable instructions sit before dynamic ones.
