#!/usr/bin/env node
// Validates every skill (skills/<name>/SKILL.md) and subagent (agents/<name>.md) of the repository:
//   - the front matter, parsed as YAML, against the JSON Schemas in schemas/ (the Agent Skills specification and the
//     Claude Code subagent format);
//   - the repository's own rules: the name matches the directory, the description says when to use it, the body stays
//     within the progressive-disclosure budget, relative links resolve;
//   - the plugin marketplace lists every skill and subagent exactly once, and nothing that does not exist;
//   - nothing private ships (this repository is public): no home-directory path, no private repository, no price.
// The official validators run in CI as well (skills-ref for the spec, `claude plugin validate` for the marketplace).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { parse as parseYaml } from "yaml";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** The body budget of a SKILL.md (agentskills.io: under 500 lines, about 5,000 tokens). */
export const MAX_BODY_LINES = 500;
export const MAX_BODY_TOKENS = 5000;
/** A description must tell the agent when to load the skill. */
export const TRIGGER = /\bUse (?:when|to)\b/;

/** Text that must never ship in a public skill. Generic shapes, so the list itself reveals nothing. */
export const PRIVATE_PATTERNS = [
  { id: "home-path", re: /(?:~\/\.?[A-Za-z]|\/Users\/|\/home\/[a-z])/ },
  { id: "private-repo", re: /krizaka-internal/i },
  { id: "price", re: /\d(?:[\d.,]*)\s?\$(?!\{)|\$\s?\d|\d\s?(?:USD|CAD|EUR|€)\b/ },
  {
    id: "secret",
    re: /(?:ghp_[A-Za-z0-9]{20,}|gh[sour]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9-]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|xox[abp]-[A-Za-z0-9-]{10,})/,
  },
  { id: "env-file", re: /\b[\w./-]*\/[\w-]+\.env\b/ },
];

const ajv = new Ajv2020({ allErrors: true, strict: true });
const loadSchema = (file) => ajv.compile(JSON.parse(readFileSync(join(REPO, "schemas", file), "utf8")));
const checkSkill = loadSchema("skill.schema.json");
const checkAgent = loadSchema("agent.schema.json");

/** Splits a Markdown file into its YAML front matter (parsed) and its body. */
export function parseFrontMatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!match) return null;
  const data = parseYaml(match[1]);
  return { data: data ?? {}, body: match[2] };
}

const schemaErrors = (validate, label) =>
  (validate.errors ?? []).map((e) => `${label}: front matter ${e.instancePath || "/"} ${e.message}`);

/** Finds private text; returns « <label>: <pattern id> (line n) » for each hit. */
export function privateFindings(text, label) {
  const findings = [];
  text.split("\n").forEach((line, i) => {
    for (const { id, re } of PRIVATE_PATTERNS) {
      if (re.test(line)) findings.push(`${label}: private content (${id}) on line ${i + 1}`);
    }
  });
  return findings;
}

function bodyErrors(body, label, baseDir) {
  const errors = [];
  if (body.trim().length < 200) errors.push(`${label}: the body is too thin to guide an agent`);
  const lines = body.split("\n").length;
  if (lines > MAX_BODY_LINES)
    errors.push(`${label}: ${lines} lines (max ${MAX_BODY_LINES}); move detail to references/`);
  const tokens = Math.ceil(body.length / 4);
  if (tokens > MAX_BODY_TOKENS) errors.push(`${label}: about ${tokens} tokens (max ${MAX_BODY_TOKENS})`);
  for (const [, target] of body.matchAll(/\]\((?!https?:|mailto:|#)([^)\s]+)\)/g)) {
    if (!existsSync(join(baseDir, target.split("#")[0]))) errors.push(`${label}: broken link ${target}`);
  }
  return errors;
}

/** Validates one skill directory. */
export function validateSkill(dir) {
  const name = basename(dir);
  const label = `skills/${name}`;
  const file = join(dir, "SKILL.md");
  if (!existsSync(file)) return [`${label}: SKILL.md is missing`];
  const text = readFileSync(file, "utf8");
  let parsed;
  try {
    parsed = parseFrontMatter(text);
  } catch (error) {
    return [`${label}: front matter is not valid YAML (${error.message})`];
  }
  if (!parsed) return [`${label}: SKILL.md must start with a front matter block between --- lines`];
  const errors = checkSkill(parsed.data) ? [] : schemaErrors(checkSkill, label);
  if (parsed.data.name !== name) errors.push(`${label}: name « ${parsed.data.name} » must match the directory`);
  if (typeof parsed.data.description === "string" && !TRIGGER.test(parsed.data.description)) {
    errors.push(`${label}: the description must say when to use the skill (« Use when … »)`);
  }
  errors.push(...bodyErrors(parsed.body, label, dir), ...privateFindings(text, label));
  for (const extra of ["scripts", "references", "assets"]) {
    const sub = join(dir, extra);
    if (!existsSync(sub)) continue;
    for (const f of readdirSync(sub, { recursive: true })) {
      const p = join(sub, String(f));
      if (statSync(p).isFile() && /\.(md|txt|json|ya?ml|mjs|js|ts|py|sh)$/.test(p)) {
        errors.push(...privateFindings(readFileSync(p, "utf8"), `${label}/${extra}/${f}`));
      }
    }
  }
  return errors;
}

/** Validates one subagent file. */
export function validateAgent(file) {
  const name = basename(file, ".md");
  const label = `agents/${name}.md`;
  const text = readFileSync(file, "utf8");
  let parsed;
  try {
    parsed = parseFrontMatter(text);
  } catch (error) {
    return [`${label}: front matter is not valid YAML (${error.message})`];
  }
  if (!parsed) return [`${label}: must start with a front matter block between --- lines`];
  const errors = checkAgent(parsed.data) ? [] : schemaErrors(checkAgent, label);
  if (parsed.data.name !== name) errors.push(`${label}: name « ${parsed.data.name} » must match the file name`);
  if (typeof parsed.data.description === "string" && !TRIGGER.test(parsed.data.description)) {
    errors.push(`${label}: the description must say when to use the subagent (« Use to … » / « Use when … »)`);
  }
  errors.push(...bodyErrors(parsed.body, label, dirname(file)), ...privateFindings(text, label));
  return errors;
}

/** The marketplace lists every skill and subagent exactly once, and only paths that exist. */
export function validateMarketplace(root, skills, agents) {
  const file = join(root, ".claude-plugin", "marketplace.json");
  if (!existsSync(file)) return [".claude-plugin/marketplace.json is missing"];
  const market = JSON.parse(readFileSync(file, "utf8"));
  const errors = [];
  const listed = { skills: [], agents: [] };
  for (const plugin of market.plugins ?? []) {
    for (const kind of ["skills", "agents"]) {
      for (const p of plugin[kind] ?? []) {
        listed[kind].push(p);
        if (!existsSync(join(root, p))) errors.push(`marketplace: ${plugin.name} lists ${p}, which does not exist`);
      }
    }
  }
  const expect = { skills: skills.map((s) => `./skills/${s}`), agents: agents.map((a) => `./agents/${a}`) };
  for (const kind of ["skills", "agents"]) {
    for (const p of expect[kind]) {
      const n = listed[kind].filter((x) => x === p).length;
      if (n !== 1) errors.push(`marketplace: ${p} is listed ${n} times (expected once)`);
    }
  }
  return errors;
}

/** Validates the whole repository; returns the list of errors. */
export function validateRepository(root = REPO) {
  const skillsDir = join(root, "skills");
  const agentsDir = join(root, "agents");
  const skills = existsSync(skillsDir)
    ? readdirSync(skillsDir).filter((d) => statSync(join(skillsDir, d)).isDirectory())
    : [];
  const agents = existsSync(agentsDir) ? readdirSync(agentsDir).filter((f) => f.endsWith(".md")) : [];
  const errors = [];
  if (skills.length === 0) errors.push("skills/: no skill found");
  for (const s of skills) errors.push(...validateSkill(join(skillsDir, s)));
  for (const a of agents) errors.push(...validateAgent(join(agentsDir, a)));
  errors.push(...validateMarketplace(root, skills, agents));
  return { skills, agents, errors };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { skills, agents, errors } = validateRepository(resolve(process.argv[2] ?? REPO));
  if (errors.length > 0) {
    for (const e of errors) console.error(`✗ ${e}`);
    console.error(`\n${errors.length} problem(s) in ${skills.length} skills and ${agents.length} subagents.`);
    process.exit(1);
  }
  console.log(`✓ ${skills.length} skills and ${agents.length} subagents are valid.`);
}
