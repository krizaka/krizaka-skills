#!/usr/bin/env node
// The generated reference of what every published @krizaka/* package exports, for the « library first » lookup of the
// krizaka-engineering skill. Read from the npm registry (the published truth, not a repository's work in progress):
// each package's description, version, entry points and the value names its type declarations export.
//
//   node scripts/gen-packages-reference.mjs            write skills/krizaka-engineering/references/packages.md
//   node scripts/gen-packages-reference.mjs --check    exit 1 when the committed file differs from the registry
//
// The scheduled workflow (.github/workflows/packages-reference.yml) runs it and opens a pull request when it drifts.
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { pathToFileURL } from "node:url";
import { privateFindings } from "./validate-skills.mjs";

const REGISTRY = "https://registry.npmjs.org";
export const OUT = new URL("../skills/krizaka-engineering/references/packages.md", import.meta.url);
/** Fewer than this many packages means the search answered badly: fail rather than write a short list. */
const MIN_PACKAGES = 20;
/** Names listed per package; past this the line says how many more (the entry points tell where to look). */
const MAX_NAMES = 40;
/** Entry points listed per package (`@krizaka/ui` has one per component: its catalogue is ui.krizaka.com). */
const MAX_ENTRIES = 24;

const getJson = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
};

/** The files of a gzipped npm tarball: `Map<path without "package/", text>` (regular files under 2 MB only). */
export function untar(gz) {
  const tar = gunzipSync(gz);
  const files = new Map();
  for (let at = 0; at + 512 <= tar.length;) {
    const name = tar.toString("utf8", at, at + 100).replace(/\0.*$/s, "");
    if (!name) break;
    const size = Number.parseInt(
      tar
        .toString("utf8", at + 124, at + 136)
        .replace(/\0.*$/s, "")
        .trim() || "0",
      8,
    );
    const type = tar.toString("utf8", at + 156, at + 157);
    if ((type === "0" || type === "\0") && size < 2_000_000) {
      files.set(name.replace(/^[^/]+\//, ""), tar.toString("utf8", at + 512, at + 512 + size));
    }
    at += 512 + Math.ceil(size / 512) * 512;
  }
  return files;
}

const VALUE_NAME = /^[A-Za-z_$][\w$]*$/;

/** The value names a declaration file exports (types left out), following `export * from "./x"` inside the package. */
export function exportedNames(files, path, seen = new Set()) {
  if (seen.has(path) || !files.has(path)) return [];
  seen.add(path);
  const text = files.get(path);
  const names = new Set();
  for (const m of text.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(",")) {
      const item = part.trim();
      if (!item || item.startsWith("type ")) continue;
      const name = item
        .split(/\s+as\s+/)
        .pop()
        .trim();
      if (VALUE_NAME.test(name) && name !== "default") names.add(name);
    }
  }
  for (const m of text.matchAll(/export\s+declare\s+(?:function|const|class|let)\s+([A-Za-z_$][\w$]*)/g))
    names.add(m[1]);
  for (const m of text.matchAll(/export\s*\*\s*from\s*["'](\.[^"']+)["']/g)) {
    const base = new URL(m[1], `file:///${path}`).pathname.slice(1).replace(/\.(js|mjs|cjs)$/, "");
    const next = [`${base}.d.ts`, `${base}.d.mts`, `${base}/index.d.ts`].find((p) => files.has(p));
    if (next) for (const n of exportedNames(files, next, seen)) names.add(n);
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

/** The packages a declaration file re-exports whole (`export * from "@tanstack/react-query"`): their names are this package's too. */
export function reexportedPackages(files, path, seen = new Set()) {
  if (seen.has(path) || !files.has(path)) return [];
  seen.add(path);
  const found = new Set();
  for (const m of files.get(path).matchAll(/export\s*\*\s*from\s*["']([^"']+)["']/g)) {
    if (!m[1].startsWith(".")) {
      found.add(m[1]);
      continue;
    }
    const base = new URL(m[1], `file:///${path}`).pathname.slice(1).replace(/\.(js|mjs|cjs)$/, "");
    const next = [`${base}.d.ts`, `${base}.d.mts`, `${base}/index.d.ts`].find((p) => files.has(p));
    if (next) for (const n of reexportedPackages(files, next, seen)) found.add(n);
  }
  return [...found].sort((a, b) => a.localeCompare(b));
}

/** The declaration file of the package's main entry. */
export function typesEntry(manifest) {
  const dot = manifest.exports?.["."];
  const fromExports = typeof dot === "object" ? (dot.types ?? dot.import?.types ?? dot.default?.types) : undefined;
  const entry = (typeof fromExports === "string" ? fromExports : undefined) ?? manifest.types ?? manifest.typings;
  return entry?.replace(/^\.\//, "");
}

/** One package's line of the reference. */
export async function describe(name) {
  const manifest = await getJson(`${REGISTRY}/${name.replace("/", "%2F")}/latest`);
  const entries = Object.keys(manifest.exports ?? {}).filter((k) => k !== "./package.json" && !k.includes("*"));
  let names = [];
  let reexports = [];
  const types = typesEntry(manifest);
  if (types && manifest.dist?.tarball) {
    const res = await fetch(manifest.dist.tarball, { signal: AbortSignal.timeout(120_000) });
    if (!res.ok) throw new Error(`${name} tarball: ${res.status}`);
    const files = untar(Buffer.from(await res.arrayBuffer()));
    names = exportedNames(files, types);
    reexports = reexportedPackages(files, types);
  }
  const description = (manifest.description ?? "").replaceAll(/\s+/g, " ").trim();
  return { name, version: manifest.version, description, entries, names, reexports };
}

const code = (s) => `\`${s}\``;

/** The Markdown of the reference (deterministic: sorted, no date). */
export function render(packages) {
  const lines = [
    "# @krizaka/\\* packages — what each one exports",
    "",
    "<!-- Generated by scripts/gen-packages-reference.mjs from the npm registry. Do not edit: run the script. -->",
    "",
    "Search this file **before writing anything generic** (a size check, a date sum, a money format, a fetch, a retry, a",
    "rate limit, a validation regex). A missing function goes into the package first, never into a local copy.",
    "",
  ];
  for (const p of packages) {
    lines.push(`## ${p.name} ${p.version}`, "", p.description || "(no description)", "");
    const subpaths = p.entries.filter((e) => e !== ".");
    if (subpaths.length > 0) {
      const shown = subpaths.slice(0, MAX_ENTRIES).map((e) => code(`${p.name}${e.slice(1)}`));
      const more = subpaths.length > MAX_ENTRIES ? `, and ${subpaths.length - MAX_ENTRIES} more` : "";
      lines.push(`- Entry points: ${shown.join(", ")}${more}`);
    }
    if (p.names.length > 0) {
      const more = p.names.length > MAX_NAMES ? `, and ${p.names.length - MAX_NAMES} more` : "";
      lines.push(`- Exports: ${p.names.slice(0, MAX_NAMES).map(code).join(", ")}${more}`);
    }
    if (p.reexports?.length > 0) lines.push(`- Re-exports everything of: ${p.reexports.map(code).join(", ")}`);
    if (lines.at(-1) !== "") lines.push("");
  }
  return lines.join("\n").replace(/\n+$/, "\n");
}

export async function listPackages() {
  const found = await getJson(`${REGISTRY}/-/v1/search?text=%40krizaka&size=250`);
  const names = found.objects.map((o) => o.package.name).filter((n) => n.startsWith("@krizaka/"));
  if (names.length < MIN_PACKAGES) throw new Error(`the registry search found ${names.length} @krizaka packages`);
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}

export async function main(argv) {
  const packages = [];
  for (const name of await listPackages()) packages.push(await describe(name));
  const text = render(packages);
  const leaks = privateFindings(text, "packages.md");
  if (leaks.length > 0) {
    console.error(`a package description reads as private, fix it at its source:\n${leaks.join("\n")}`);
    return 1;
  }
  if (argv.includes("--check")) {
    const same = readFileSync(OUT, "utf8") === text;
    console.log(same ? "packages.md is current" : "packages.md drifted from the registry: run the script");
    return same ? 0 : 1;
  }
  writeFileSync(OUT, text);
  console.log(`packages.md: ${packages.length} packages`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exit(await main(process.argv.slice(2)));
