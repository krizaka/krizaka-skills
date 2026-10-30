---
name: krizaka-lean-orchestration
description: Lean multi-agent orchestration — role contracts in Markdown, a linear plan → slice → implement → verify → merge pipeline, files and pull requests as the handoff, step and cost caps, and when a framework is worth it. Use when designing how several AI agents cooperate on a codebase, writing role contracts or subagent definitions, or diagnosing agents that loop and burn tokens.
license: Apache-2.0
metadata:
  author: krizaka
---

# Lean multi-agent orchestration

Agents that chat with each other in open loops spend tokens arguing and lose state. Keep orchestration **linear,
written down, and verifiable**: each agent receives a contract, produces an artifact, and hands it on.

## 1. Adopt or skip a framework

| Need       | Lean default                                                                 | Reach for a framework when                                        |
| :--------- | :--------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| Sequencing | a fixed pipeline: plan → slice → implement → verify → merge                  | the flow branches on runtime data you cannot know up front        |
| Memory     | Markdown checkpoints in the repository or a scratch folder, plus git history | you need retrieval over a corpus far bigger than a context window |
| Handoff    | a file, a commit or a pull request with a stated schema                      | agents run as long-lived services with queues                     |
| Roles      | an Agent Skill (`SKILL.md`) or a subagent definition (`agents/*.md`)         | —                                                                 |

## 2. The role contract

Every agent in a multi-agent run gets one, short enough to read in a minute:

1. **Role** — who it is (a persona helps tone, not competence).
2. **Goal** — one measurable outcome.
3. **Boundaries** — what it never touches (other lanes' files, secrets, production).
4. **Inputs and tools** — exactly what it may read and run.
5. **Deliverable** — the artifact and its format (a diff with tests, a checklist, a JSON document matching a schema).
6. **Handoff** — who receives the deliverable, and what makes it acceptable.

## 3. A worked chain

1. A **planner** turns an issue into slices with acceptance criteria → `plan.md`.
2. A **builder** implements one slice test-first → a commit with passing tests.
3. A **reviewer** checks it against the plan, the security rules and the conventions → PR comments or an approval.
4. The **merge** is mechanical: required checks green, queue, done.

## 4. Circuit breakers

- **Step cap** per subagent; at the cap, write a checkpoint and stop for a human.
- **Two failures, then read**: after the same test fails twice, stop editing and re-read the error and the code.
- **Cost cap** per session, set by the owner of the budget; exceeding it needs their explicit consent.
- **No waiting loops**: a scheduled job or a merge queue waits; an agent does not poll.

## 5. Anti-patterns

- Agents debating in free text until one « wins ».
- A shared vector memory nobody can review or revert.
- One agent both writing and approving its own change.
