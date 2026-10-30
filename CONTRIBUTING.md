# Contributing

Thank you for helping. This repository follows the [Agent Skills specification](https://agentskills.io/specification)
and the rules in [AGENTS.md](./AGENTS.md); please read them first.

## Propose a skill

Open a [skill request](https://github.com/krizaka/krizaka-skills/issues/new?template=skill_request.yml): when an agent
should use it, and what it should teach. A good skill is narrow, actionable and true.

## Send a change

1. Fork, then create `skills/<name>/SKILL.md` (or edit one). Start from an existing skill.
2. Add it to one plugin in `.claude-plugin/marketplace.json`.
3. Run `npm ci`, `npm run format`, `npm run lint` and `npm test`.
4. Open a pull request with a Conventional Commit title (`feat(skills): add …`). CI must be green; a maintainer reviews.

Never include a secret, a personal path, personal data or confidential business information — even as an example.

By contributing you agree that your work is licensed under [Apache-2.0](./LICENSE) and you follow the
[code of conduct](https://github.com/krizaka/.github/blob/main/CODE_OF_CONDUCT.md).
