# krizaka-skills — agent contract

This repository is **public**. It holds Agent Skills (`skills/<name>/SKILL.md`), Claude Code subagents
(`agents/<name>.md`) and the plugin marketplace that installs them (`.claude-plugin/marketplace.json`). It follows the
[Agent Skills specification](https://agentskills.io/specification); this file follows the
[AGENTS.md](https://agents.md) convention, so any coding agent (Claude Code through `CLAUDE.md`, Codex, Cursor,
Gemini CLI, Copilot) reads the same rules.

## 1. Layout

```text
skills/<name>/SKILL.md        one skill; optional scripts/, references/, assets/ beside it
agents/<name>.md              one subagent (front matter: name, description, optional tools, model)
.claude-plugin/marketplace.json   the plugins and the skills and agents each one installs
schemas/                      JSON Schemas of the front matter
scripts/validate-skills.mjs   the repository validator (npm run validate)
tests/                        node --test
```

## 2. Writing a skill

1. `name`: lowercase letters, digits and single hyphens, ≤ 64 characters, the same as its folder; prefix `krizaka-`.
2. `description`: ≤ 1,024 characters; says **what** it does and **when to use it** (« Use when … »), with the words a
   user would type.
3. Optional fields only from the specification: `license`, `compatibility`, `metadata` (string values),
   `allowed-tools`.
4. Progressive disclosure: the body under 500 lines (about 5,000 tokens); detail goes to `references/`, one level deep,
   linked with a relative path.
5. Instructions an agent can act on: steps, rules, checklists, short examples. No marketing, no filler.
6. True to the code: a skill that names a Krizaka package, token or component describes what it really does.
7. List the skill in exactly one plugin of `.claude-plugin/marketplace.json`.

## 3. Public by design — nothing private ships

Never write, in any file: a secret or token, a personal or machine path, the name of a private repository, an internal
process detail that would help an attacker, abuse-detection thresholds, prices or commercial strategy, customer or
partner names, personal data. Examples use placeholders and demo data. The validator and gitleaks enforce the shapes
they can; the review enforces the rest.

## 4. Before every push

```bash
npm run format   # Prettier
npm run lint     # markdownlint + the repository validator
npm test
```

CI also runs the official validators (`skills-ref`, `claude plugin validate --strict`), a link check, gitleaks, zizmor
and actionlint. A check is never skipped or weakened to get green; hooks are never bypassed.

## 5. Commits and releases

Conventional Commits (`feat(skills): …`, `fix(agents): …`, `docs: …`). release-please turns them into the changelog and
the version of `package.json` and of every plugin in the marketplace; never edit those versions by hand.

## 9. Anti-slop (ADR-015)

What a model tends to write and this repository does not need:

1. **No filler.** No « delve », « cutting-edge », « game-changer », « seamless », no emoji headings, no claims of
   percentages nobody measured.
2. **No invented facts.** A model version, an API limit, a token name or a figure is either checked at its source or
   left out.
3. **A closed set is a list in one place** (the schemas, the marketplace), never repeated by hand in prose.
4. **The checks are the judge.** Format, lint and test before every push; `krizaka-edit-check` runs on each edit through
   `.claude/settings.json`. A rule is never silenced to get green.
