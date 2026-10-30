# Security policy

## Reporting a vulnerability

Please report it **privately** through a
[GitHub security advisory](https://github.com/krizaka/krizaka-skills/security/advisories/new) — never in a public
issue or pull request. We acknowledge a report within three business days and keep you informed until it is fixed.

What counts here: a skill or subagent that leads an agent to an unsafe action (leaking a secret, running untrusted
code, bypassing a check), a script that can be abused, a compromised workflow or dependency, or private information
published by mistake.

## Supported versions

The latest release on `main` is supported. Each release archive carries a signed build provenance:
`gh attestation verify krizaka-skills-<version>.zip -R krizaka/krizaka-skills`.
