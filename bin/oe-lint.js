#!/usr/bin/env node
// @ts-check
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildLintData, isLintable, lintFiles } from '../lint/lint.js';

const SKIP = new Set(['node_modules', 'dist', 'build', 'out', 'coverage', 'vendor', '.git', '.next', '.nuxt', '.svelte-kit', '.astro', '.turbo', '.vite']);

const HELP = `Usage: oe-lint [paths...] [--json]

Checks an app for raw colors, ramp variables, dark-mode overrides, tokens and
classes that don't exist, and fills with the wrong text color.

Paths default to the current folder. Exits with 1 if it finds any errors.
To allow one line, add a comment containing oe-lint-ignore on it or the line before.
`;

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  process.stdout.write(HELP);
  process.exit(0);
}
const json = args.includes('--json');
const unknown = args.filter((a) => a.startsWith('-') && a !== '--json');
if (unknown.length) {
  process.stderr.write(`Unknown option: ${unknown[0]}\n\n${HELP}`);
  process.exit(2);
}
const paths = args.filter((a) => !a.startsWith('-'));
if (!paths.length) paths.push('.');

const walk = (/** @type {string} */ path, /** @type {string[]} */ found = []) => {
  const stat = statSync(path);
  if (stat.isFile()) {
    if (isLintable(path)) found.push(path);
  } else {
    for (const entry of readdirSync(path)) {
      if (!SKIP.has(entry) && !entry.startsWith('.')) walk(join(path, entry), found);
    }
  }
  return found;
};

let files;
try {
  files = paths.flatMap((p) => walk(p));
} catch (error) {
  process.stderr.write(`oe-lint: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(2);
}

const read = (/** @type {string} */ file) => readFileSync(new URL(`../dist/${file}`, import.meta.url), 'utf8');
const data = buildLintData(read('tokens.css'), read('components.css'), JSON.parse(read('model.json')));
const findings = lintFiles(
  files.map((path) => ({ path: relative(process.cwd(), path) || path, text: readFileSync(path, 'utf8') })),
  data,
);

const errors = findings.filter((f) => f.severity === 'error').length;
const warnings = findings.length - errors;

if (json) {
  process.stdout.write(`${JSON.stringify({ files: files.length, errors, warnings, findings }, null, 2)}\n`);
} else {
  for (const f of findings) process.stdout.write(`${f.file}:${f.line}:${f.column}  ${f.severity}  ${f.rule}  ${f.message}\n`);
  const plural = (/** @type {number} */ n, /** @type {string} */ word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  process.stdout.write(`${findings.length ? '\n' : ''}${plural(errors, 'error')}, ${plural(warnings, 'warning')} in ${plural(files.length, 'file')}\n`);
}
process.exit(errors ? 1 : 0);
