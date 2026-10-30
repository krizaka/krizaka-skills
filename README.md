# Krizaka Skills

[![CI](https://github.com/krizaka/krizaka-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/krizaka/krizaka-skills/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/krizaka/krizaka-skills/badge)](https://scorecard.dev/viewer/?uri=github.com/krizaka/krizaka-skills)
[![Agent Skills](https://img.shields.io/badge/format-Agent%20Skills-2f5d8a)](https://agentskills.io/specification)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue)](./LICENSE)

The [Agent Skills](https://agentskills.io) and subagents we use to build Krizaka's products with AI coding agents —
shared in the open. Each skill is a folder with a `SKILL.md` (YAML front matter `name` + `description`, then
instructions) that an agent loads only when the task calls for it.

## Install

**Claude Code** — the repository is a plugin marketplace:

```text
/plugin marketplace add krizaka/krizaka-skills
/plugin install krizaka-design@krizaka-skills
/plugin install krizaka-engineering@krizaka-skills
/plugin install krizaka-growth@krizaka-skills
```

**Any agent that reads Agent Skills** (Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot…) — with the open
[`skills`](https://github.com/vercel-labs/skills) installer:

```bash
npx skills add krizaka/krizaka-skills              # pick the skills and the agents to install to
npx skills add krizaka/krizaka-skills --skill krizaka-quality-gate
```

**Claude API / claude.ai** — upload a skill folder as a custom skill (see Anthropic's
[Agent Skills documentation](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)).

## Plugins and skills

| Plugin                | Skill / subagent                                                             | Use it when                                                      |
| :-------------------- | :--------------------------------------------------------------------------- | :--------------------------------------------------------------- |
| `krizaka-design`      | [`krizaka-cahier-design`](./skills/krizaka-cahier-design/SKILL.md)           | building a page of a Krizaka site (the notebook look)            |
|                       | [`krizaka-product-design`](./skills/krizaka-product-design/SKILL.md)         | building a product screen with `@krizaka/ui`                     |
|                       | [`krizaka-lab-design`](./skills/krizaka-lab-design/SKILL.md)                 | building a 3D or scroll-driven showroom page                     |
| `krizaka-engineering` | [`krizaka-engineering`](./skills/krizaka-engineering/SKILL.md)               | writing or reviewing code: architecture, library first, checks   |
|                       | [`krizaka-agent-cto`](./skills/krizaka-agent-cto/SKILL.md)                   | planning and dispatching work across coding-agent sessions       |
|                       | [`krizaka-lean-orchestration`](./skills/krizaka-lean-orchestration/SKILL.md) | designing how several agents cooperate without loops             |
|                       | [`krizaka-context-hygiene`](./skills/krizaka-context-hygiene/SKILL.md)       | a long or expensive agent session                                |
|                       | [`krizaka-quality-gate`](./skills/krizaka-quality-gate/SKILL.md)             | setting up CI or shipping an LLM feature with reliable outputs   |
|                       | [`falcon-cto`](./agents/falcon-cto.md) (subagent)                            | reviewing a pull request or splitting a feature                  |
|                       | [`duck-ai-engine`](./agents/duck-ai-engine.md) (subagent)                    | building an AI pipeline or a background job                      |
|                       | [`owl-document-mind`](./agents/owl-document-mind.md) (subagent)              | reading documents, checking figures, auditing privacy            |
|                       | [`beaver-builder`](./agents/beaver-builder.md) (subagent)                    | building bookings, storefronts and listing sync                  |
| `krizaka-growth`      | [`krizaka-social-growth`](./skills/krizaka-social-growth/SKILL.md)           | writing or automating honest technical posts on social platforms |

The subagents are Krizaka's birds — each carries one promise: the falcon watches, the owl reads, the duck builds the
engine, the beaver builds what holds.

## Generated references

`skills/krizaka-engineering/references/packages.md` lists what every published `@krizaka/*` package exports. It is
generated from the npm registry by `npm run gen:packages` and kept current by the daily « Packages reference » workflow,
which opens a pull request when a release changes it. Never edit it by hand.

## How it is checked

Every pull request runs:

- the **official validators**: [`skills-ref`](https://github.com/agentskills/agentskills/tree/main/skills-ref) (the
  Agent Skills specification) and `claude plugin validate --strict` (the marketplace);
- the repository's validator (`npm run validate`): front matter against the [JSON Schemas](./schemas), the name matches
  its folder, the description says when to use the skill, the body stays under 500 lines, relative links resolve, the
  marketplace lists every skill once, and **nothing private ships** (no home path, no private repository, no price, no
  secret);
- Prettier, markdownlint, a link check (lychee), unit tests (`node --test`);
- gitleaks and zizmor (secrets and workflow security), actionlint, OpenSSF Scorecard; Dependabot keeps pins current.

Releases are cut by release-please; each GitHub Release carries the skills archive with a signed build provenance:

```bash
gh attestation verify krizaka-skills-<version>.zip -R krizaka/krizaka-skills
```

## Contribute

See [CONTRIBUTING.md](./CONTRIBUTING.md). Report a vulnerability privately: [SECURITY.md](./SECURITY.md).

## Licence

[Apache-2.0](./LICENSE) © Technologies Krizaka Inc.
