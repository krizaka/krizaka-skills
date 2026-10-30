import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, test } from "node:test";
import { parseFrontMatter, privateFindings, validateRepository, validateSkill } from "../scripts/validate-skills.mjs";

const REPO = resolve(import.meta.dirname, "..");
const BODY = `# Title\n\n${"A line of real guidance for the agent to follow.\n".repeat(8)}`;

/** A throw-away skill directory with the given SKILL.md. */
function skill(name, frontMatter, body = BODY) {
  const dir = join(mkdtempSync(join(tmpdir(), "skill-")), name);
  mkdirSync(dir);
  writeFileSync(join(dir, "SKILL.md"), `---\n${frontMatter}\n---\n${body}`);
  return dir;
}

describe("the repository", () => {
  test("every skill, subagent and the marketplace are valid", () => {
    const { skills, agents, errors } = validateRepository(REPO);
    assert.deepEqual(errors, []);
    assert.ok(skills.length >= 8);
    assert.ok(agents.length >= 4);
  });

  test("a skill missing from the marketplace fails", () => {
    const copy = mkdtempSync(join(tmpdir(), "repo-"));
    for (const d of ["skills", "agents", ".claude-plugin"]) {
      cpSync(join(REPO, d), join(copy, d), { recursive: true });
    }
    cpSync(join(REPO, "skills", "krizaka-lab-design"), join(copy, "skills", "krizaka-extra-skill"), {
      recursive: true,
    });
    const { errors } = validateRepository(copy);
    assert.ok(
      errors.some((e) => e.includes("./skills/krizaka-extra-skill is listed 0 times")),
      errors.join("\n"),
    );
  });
});

describe("front matter", () => {
  test("is parsed as YAML, nested metadata included", () => {
    const parsed = parseFrontMatter(
      "---\nname: a-b\ndescription: >-\n  Folded\n  text.\nmetadata:\n  author: x\n---\nBody",
    );
    assert.equal(parsed.data.description, "Folded text.");
    assert.deepEqual(parsed.data.metadata, { author: "x" });
  });

  const ok = "description: Does a thing. Use when the thing is needed.";
  test("a valid skill passes", () => {
    assert.deepEqual(validateSkill(skill("good-skill", `name: good-skill\n${ok}`)), []);
  });
  test("the name must match the directory", () => {
    assert.match(validateSkill(skill("good-skill", `name: other-skill\n${ok}`)).join(), /must match the directory/);
  });
  test("names follow the spec (no uppercase, no double hyphen)", () => {
    assert.match(validateSkill(skill("Bad--Name", `name: Bad--Name\n${ok}`)).join(), /must match pattern/);
  });
  test("the description fits 1,024 characters", () => {
    const long = `description: Use when ${"x".repeat(1100)}`;
    assert.match(validateSkill(skill("long-skill", `name: long-skill\n${long}`)).join(), /1024/);
  });
  test("the description says when to use the skill", () => {
    assert.match(validateSkill(skill("vague-skill", "name: vague-skill\ndescription: Helps.")).join(), /when to use/);
  });
  test("unknown front matter fields are refused", () => {
    assert.match(
      validateSkill(skill("extra-skill", `name: extra-skill\n${ok}\nauthor: me`)).join(),
      /additional properties/,
    );
  });
  test("the body stays within 500 lines", () => {
    const dir = skill("big-skill", `name: big-skill\n${ok}`, "line\n".repeat(600));
    assert.match(validateSkill(dir).join(), /max 500/);
  });
  test("relative links must resolve", () => {
    const dir = skill("link-skill", `name: link-skill\n${ok}`, `${BODY}\nSee [the guide](references/GUIDE.md).`);
    assert.match(validateSkill(dir).join(), /broken link/);
  });
});

describe("nothing private ships", () => {
  // Built from parts so that no real-looking path or token sits in this file.
  const cases = {
    "home-path": ["Read ", "~", "/.notes/today.md first"].join(""),
    "private-repo": ["Closes krizaka", "-internal#12"].join(""),
    price: "Our plan costs 45 $ a month",
    secret: ["token ", "ghp", "_", "a".repeat(36)].join(""),
    "env-file": ["load config/", "team", ".env first"].join(""),
  };
  for (const [id, line] of Object.entries(cases)) {
    test(`refuses ${id}`, () => {
      assert.match(privateFindings(line, "x").join(), new RegExp(`\\(${id}\\)`));
    });
  }
  test("accepts ordinary guidance", () => {
    assert.deepEqual(privateFindings("Use `var(--kz-accent)`; GST 5 % and QST 9.975 %; ${name}", "x"), []);
  });
});
