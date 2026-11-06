import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { buildLintData, isLintable, lintFiles } from '../lint/lint.js';
import { ICON_NODES } from '../site/icons.ts';
import { TEMPLATES } from '../site/nav.ts';
import { buildModel } from '../src/tokens.ts';

const read = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const model = buildModel();
const data = buildLintData(read('dist/tokens.css'), read('dist/components.css'), model);
const lint = (path: string, text: string) => lintFiles([{ path, text }], data);
const rules = (path: string, text: string) => lint(path, text).map((f) => f.rule);

describe('oe-lint finds', () => {
  it.each([
    ['a hex color in CSS', 'a.css', '.x { color: #fff; }', 'no-raw-colors'],
    ['rgb() in CSS', 'a.css', '.x { background: rgb(0 0 0); }', 'no-raw-colors'],
    ['oklch() in CSS', 'a.css', '.x { background: oklch(50% 0.1 200); }', 'no-raw-colors'],
    ['a named color', 'a.css', '.x { background: white; }', 'no-raw-colors'],
    ['a hex color in a style block', 'a.vue', '<style>.x { color: #123456; }</style>', 'no-raw-colors'],
    ['a hex color in a style attribute', 'a.html', '<p style="color:#123456">x</p>', 'no-raw-colors'],
    ['a Tailwind arbitrary color', 'a.tsx', '<p className="bg-[#123456]">x</p>', 'no-raw-colors'],
    ['a quoted hex color in code', 'a.ts', "const c = '#123456';", 'no-raw-colors'],
    ['a ramp variable', 'a.css', '.x { color: var(--ramp-teal-48); }', 'no-ramps'],
    ['a ramp variable built at runtime', 'a.ts', 'const c = `var(--ramp-${name})`;', 'no-ramps'],
    ['a dark media query', 'a.css', '@media (prefers-color-scheme: dark) { .x { margin: 0; } }', 'no-dark-overrides'],
    ['a data-theme rule', 'a.css', '[data-theme="dark"] .x { margin: 0; }', 'no-dark-overrides'],
    ['a dark: class', 'a.html', '<p class="dark:bg-surface">x</p>', 'no-dark-overrides'],
    ['an invented token', 'a.css', '.x { color: var(--fg-primary); }', 'unknown-token'],
    ['an invented chart color', 'a.css', '.x { fill: var(--chart-99); }', 'unknown-token'],
    ['an invented class', 'a.html', '<b class="oe-btn oe-btn-warning">x</b>', 'unknown-class'],
    ['an invented class in JSX', 'a.tsx', '<b className={clsx("oe-badge-primary", on && "x")}>x</b>', 'unknown-class'],
    ['a stock Tailwind color', 'a.html', '<p class="bg-red-500">x</p>', 'unknown-utility'],
    ['a stock color behind a variant', 'a.html', '<p class="hover:text-blue-600">x</p>', 'unknown-utility'],
    ['a utility shadcn would use', 'a.html', '<p class="bg-muted">x</p>', 'unknown-utility'],
    ['a text utility for a fill', 'a.html', '<p class="text-accent-emphasis">x</p>', 'unknown-utility'],
    ['the wrong text on a fill in CSS', 'a.css', '.x { background: var(--bg-danger-emphasis); color: var(--fg-on-accent); }', 'emphasis-pair'],
    ['a fill without its text class', 'a.html', '<p class="bg-accent-emphasis text-default">x</p>', 'emphasis-pair'],
    ['a named color in a style object', 'a.tsx', "<p style={{ color: 'red' }}>x</p>", 'no-raw-colors'],
    ['rgb() in a style object', 'a.tsx', '<p style={{ background: "rgb(0 0 0)" }}>x</p>', 'no-raw-colors'],
    ['a color in a border shorthand', 'a.ts', "const s = { border: '1px solid black' };", 'no-raw-colors'],
    ['a Vue style binding', 'a.vue', `<template><p :style="{ backgroundColor: 'white' }">x</p></template>`, 'no-raw-colors'],
    ['a Svelte style directive', 'a.svelte', '<p style:color="red">x</p>', 'no-raw-colors'],
    ['a color attribute', 'a.html', '<rect fill="red" />', 'no-raw-colors'],
    ['a color prop', 'a.tsx', '<Icon color="#123" />', 'no-raw-colors'],
    ['a named color as a var() fallback', 'a.css', '.x { color: var(--fg-default, red); }', 'no-raw-colors'],
    ['a dark class selector', 'a.css', 'html.dark .x { margin: 0; }', 'no-dark-overrides'],
    ['a dark variant behind another', 'a.html', '<p class="md:dark:bg-surface">x</p>', 'no-dark-overrides'],
    ['a shadcn variable', 'a.css', '.x { background: var(--background); color: var(--primary); }', 'unknown-token'],
    ['a bare --border', 'a.css', '.x { border-color: var(--border); }', 'unknown-token'],
    ['a shadcn utility', 'a.html', '<p class="bg-primary">x</p>', 'unknown-utility'],
    ['a shadcn text utility', 'a.html', '<p class="text-foreground">x</p>', 'unknown-utility'],
    ['an invented class in a Svelte directive', 'a.svelte', '<p class:oe-nope={on}>x</p>', 'unknown-class'],
    ['an invented class in a Vue binding', 'a.vue', `<p :class="{ 'oe-nope': on }">x</p>`, 'unknown-class'],
    ['an icon button with no name', 'a.html', '<button class="oe-btn oe-btn-ghost oe-btn-icon"><svg></svg></button>', 'icon-button-name'],
    ['a close button with no name', 'a.tsx', '<button className="oe-close" onClick={() => close()}><X /></button>', 'icon-button-name'],
    ['a button made from a div', 'a.html', '<div class="oe-btn oe-btn-primary">x</div>', 'button-element'],
    ['an image with no alt', 'a.svelte', '<img src="/a.png" class="oe-avatar" />', 'img-alt'],
    ['a switch with no role', 'a.html', '<label><input class="oe-switch" type="checkbox" />x</label>', 'switch-role'],
    ['a dialog on a div', 'a.vue', '<div class="oe-dialog">x</div>', 'dialog-element'],
    ['a drawer on a div', 'a.html', '<div class="oe-drawer oe-drawer-left">x</div>', 'dialog-element'],
    ['an input with no label', 'a.html', '<input class="oe-input" />', 'input-label'],
    ['an input after a closed label', 'a.html', '<label>Name</label><input class="oe-input" />', 'input-label'],
    ['an input whose id has no label', 'a.tsx', '<input className="oe-input" id="name" />', 'input-label'],
    ['a select with no label', 'a.vue', '<select class="oe-input"><option>a</option></select>', 'input-label'],
    ['a deprecated icon package', 'package.json', '{ "dependencies": { "lucide-svelte": "1.0.0" } }', 'deprecated-icons'],
  ])('%s', (_label, path, text, rule) => {
    expect(rules(path, text)).toContain(rule);
  });
});

describe('oe-lint allows', () => {
  it.each([
    ['tokens', 'a.css', '.x { color: var(--fg-muted); background: var(--bg-surface); border: 1px solid var(--border-default); fill: var(--chart-3); }'],
    ['transparent and currentColor', 'a.css', '.x { background: transparent; color: currentColor; }'],
    ['a fill with its text', 'a.css', '.x { background: var(--bg-danger-emphasis); color: var(--fg-on-danger); }'],
    ['comments', 'a.css', '/* #ffffff --ramp-teal-48 */ .x { margin: 0; }'],
    ['HTML comments', 'a.html', '<!-- <p style="color:#123456" class="bg-red-500"> -->'],
    ['line comments in code', 'a.ts', "// const c = '#123456';"],
    ['an element id that looks hex-like', 'a.ts', "document.querySelector('#add');"],
    ['an image in CSS', 'a.css', '.x { background-image: url("a#123456.svg"); }'],
    ['real classes', 'a.html', '<b class="oe-btn oe-btn-primary oe-btn-sm">x</b>'],
    ['token utilities', 'a.html', '<p class="bg-surface text-muted border-default hover:bg-hover text-sm bg-accent-muted">x</p>'],
    ['a fill with its text class', 'a.html', '<p class="bg-accent-emphasis text-on-accent hover:bg-accent-emphasis-hover">x</p>'],
    ['tokens built at runtime', 'a.ts', 'const c = `var(--fg-on-${intent}) var(--chart-${i + 1})`;'],
    ['classes built at runtime', 'a.ts', 'const c = `<b class="oe-badge oe-badge-${intent}">x</b>`;'],
    ['matchMedia for canvas charts', 'a.ts', 'matchMedia("(prefers-color-scheme: dark)");'],
    ['a data-theme attribute', 'a.html', '<div data-theme="dark"></div>'],
    ['oe-prefixed strings that are not classes', 'a.ts', "localStorage.getItem('oe-theme');"],
    ['Tailwind utilities unrelated to tokens', 'a.html', '<p class="text-left border-2 bg-transparent text-white">x</p>'],
    ['other variables that mention a color', 'a.css', '.x { color: var(--brand-red); background: var(--my-teal-1, transparent); }'],
    ['names that are not colors', 'a.css', '.red { animation-name: red; grid-area: green; font-family: "Black Ops One", serif; } @keyframes white { to { opacity: 0; } }'],
    ['a color word in an image path', 'a.css', '.x { background: url(/img/red.png); }'],
    ['a dark word that is not a class selector', 'a.css', '.x { background: url(a.dark.png); } .dark-panel { margin: 0; }'],
    ['anchors that look like colors', 'a.html', '<a href="#fff">x</a><svg><use href="#add" /></svg>'],
    ['selectors that look like colors', 'a.ts', "document.querySelector('#facade');"],
    ['plain JavaScript named after colors', 'a.ts', "const white = 1; const red = { black: 2 }; const s = 'green';"],
    ['non-color style values', 'a.tsx', "<p style={{ color: 'var(--fg-muted)', background: 'none', border: '1px solid var(--border-default)', fill: 'currentColor' }}>x</p>"],
    ['words in JSX text', 'a.tsx', '<p>Pick #fff or bg-red-500 or rgb(0 0 0) in the docs</p>'],
    ['other attributes', 'a.html', '<p data-color="red" title="red"></p><input type="color"><rect fill="url(#abc)" fill-rule="evenodd" />'],
    ['variables in color props', 'a.tsx', '<Icon color={red} fill={blue} />'],
    ['class directives', 'a.svelte', '<p class:oe-card={on} class:bg-hover={on}>x</p>'],
    ['the important modifier', 'a.html', '<p class="!bg-surface bg-surface! md:hover:bg-hover">x</p>'],
    ['opacity and arbitrary values', 'a.html', '<p class="bg-surface/50 text-sm/6 bg-(--bg-surface) bg-[var(--bg-surface)] text-[13px]">x</p>'],
    ['Tailwind utilities that share a prefix', 'a.html', '<p class="text-balance text-nowrap bg-clip-text bg-linear-to-r border-collapse border-x-2 text-base">x</p>'],
    ['an icon button with a name', 'a.tsx', '<button className="oe-btn oe-btn-icon" aria-label={t("delete")}><Trash /></button>'],
    ['a Vue bound name', 'a.vue', `<button class="oe-close" :aria-label="label"><X /></button>`],
    ['a link styled as a button', 'a.html', '<a class="oe-btn oe-btn-primary" href="/new">New</a>'],
    ['a component that may add its own name', 'a.tsx', '<IconButton className="oe-btn-icon" />'],
    ['props spread onto an element', 'a.tsx', '<button className="oe-btn-icon" {...props} />'],
    ['Svelte rest props', 'a.svelte', '<input class="oe-input" {...rest} />'],
    ['an arrow function in an attribute', 'a.tsx', '<button className="oe-btn-icon" onClick={() => a > b} aria-label="x"></button>'],
    ['an image with alt', 'a.html', '<img src="/a.png" alt="" />'],
    ['a named switch', 'a.html', '<label><input class="oe-switch" type="checkbox" role="switch" />x</label>'],
    ['a real dialog', 'a.html', '<dialog class="oe-dialog"><p class="oe-dialog-title">x</p></dialog>'],
    ['dialog parts on other elements', 'a.html', '<div class="oe-dialog-actions"></div><div class="oe-dialog-body"></div>'],
    ['an input inside a label', 'a.html', '<label class="oe-field"><span>Name</span><input class="oe-input" /></label>'],
    ['an input linked to a label', 'a.html', '<label for="n">Name</label><input class="oe-input" id="n" />'],
    ['a label linked in JSX', 'a.tsx', '<><label htmlFor="n">Name</label><input className="oe-input" id="n" /></>'],
    ['an id built at runtime', 'a.tsx', '<input className="oe-input" id={id} />'],
    ['an input named with aria-label', 'a.html', '<input class="oe-input" aria-label="Search" />'],
    ['a hidden input', 'a.html', '<input class="oe-input" type="hidden" />'],
    ['TypeScript generics', 'a.ts', 'const a: Record<string, number> = {}; const b = new Set<string>();'],
    ['current icon packages', 'package.json', '{ "dependencies": { "lucide-react": "1.0.0" } }'],
  ])('%s', (_label, path, text) => {
    expect(lint(path, text)).toEqual([]);
  });

  it("an app's own variables and classes", () => {
    const files = [
      { path: 'a.css', text: ':root { --bg-sidebar: var(--bg-surface); } .oe-custom { margin: 0; }' },
      { path: 'b.html', text: '<p class="oe-custom" style="background: var(--bg-sidebar)">x</p>' },
    ];
    expect(lintFiles(files, data)).toEqual([]);
  });

  it("an app's own Tailwind colors", () => {
    const files = [
      { path: 'a.css', text: '@theme { --color-primary: var(--bg-accent-emphasis); --color-surface-2: var(--bg-raised); }' },
      { path: 'b.html', text: '<p class="bg-primary bg-surface-2">x</p>' },
    ];
    expect(lintFiles(files, data)).toEqual([]);
  });

  it.each([
    ['on the same line', '.x { color: #fff; } /* oe-lint-ignore */'],
    ['on the line before', '/* oe-lint-ignore */\n.x { color: #fff; }'],
  ])('an ignore comment %s', (_label, text) => {
    expect(lint('a.css', text)).toEqual([]);
  });

  it('only the next line after an ignore comment', () => {
    expect(rules('a.css', '/* oe-lint-ignore */\n.x { color: #fff; }\n.y { color: #000; }')).toEqual(['no-raw-colors']);
  });
});

describe('oe-lint reporting', () => {
  it('points at the right line and column, even after a multi-line comment', () => {
    expect(lint('a.css', '/* one\n   two */\n.x {\n  color: #fff;\n}')).toMatchObject([{ file: 'a.css', line: 4, column: 10, severity: 'error' }]);
  });

  it('suggests real names', () => {
    expect(lint('a.html', '<p class="bg-accent">x</p>')[0].message).toContain('bg-accent-emphasis');
    expect(lint('a.html', '<p class="oe-btn-primry">x</p>')[0].message).toContain('oe-btn-primary');
  });

  it('warns about unlayered resets only in apps using the classes', () => {
    const css = { path: 'a.css', text: 'button { color: inherit; }\n@layer base { a { color: inherit; } }' };
    const html = { path: 'b.html', text: '<button class="oe-btn">x</button>' };
    expect(lintFiles([css], data)).toEqual([]);
    expect(lintFiles([css, html], data)).toMatchObject([{ rule: 'unlayered-reset', severity: 'warning', line: 1 }]);
  });

  it('warns when an app restyles a component, however it does it', () => {
    const warned = (path: string, text: string) => lint(path, text).map((f) => f.rule);
    for (const css of ['.oe-card { padding: 0; }', '.panel .oe-card { padding: 0; }', '.oe-table th { padding: 0; }', '.oe-tabs > * { color: inherit; }', '.oe-btn:hover { opacity: 0.5; }', '@layer app { .oe-tooltip { white-space: normal; } }', '.a, .oe-card { padding: 0; }']) {
      expect(warned('a.css', css), css).toEqual(['restyled-component']);
    }
    expect(warned('a.svelte', '<style>:global(.oe-card) { padding: 0; }</style>')).toEqual(['restyled-component']);
    expect(warned('a.vue', '<style>:deep(.oe-card) { padding: 0; }</style>')).toEqual(['restyled-component']);
    expect(warned('a.html', '<div class="oe-card" style="padding: 0"></div>')).toEqual(['restyled-component']);
    expect(warned('a.tsx', '<div className="oe-card" style={{ paddingTop: 0 }} />')).toEqual(['restyled-component']);
    expect(warned('a.tsx', '<div className="oe-card p-0" />')).toEqual(['restyled-component']);
    expect(warned('a.html', '<button class="oe-btn hover:bg-hover"></button>')).toEqual(['restyled-component']);
    expect(lint('a.css', '.oe-card { padding: 0; color: inherit; }')[0]).toMatchObject({ severity: 'warning', message: expect.stringContaining('padding, color') });
  });

  it('lets an app place a component and style its own elements', () => {
    for (const css of ['.oe-card { margin-top: 8px; grid-column: 1 / -1; flex: 1; width: 100%; --oe-sidenav-width: 200px; }', '.oe-card .mine { padding: 0; }', '.oe-page-head + section { padding: 0; }', '.oe-custom { padding: 0; }', ':not(.oe-card) { padding: 0; }']) {
      expect(lint('a.css', css), css).toEqual([]);
    }
    expect(lint('a.html', '<div class="oe-card" style="width: 100%; grid-template-columns: repeat(2, 1fr)"></div>')).toEqual([]);
    expect(lint('a.tsx', '<div className="oe-card" style={{ gridTemplateColumns: "repeat(2, 1fr)", marginTop: 4 }} />')).toEqual([]);
    expect(lint('a.tsx', '<div className="oe-card mt-4 w-full flex-1" />')).toEqual([]);
    expect(lint('a.html', '<div class="mine p-0"></div>')).toEqual([]);
    expect(lint('a.css', '/* oe-lint-ignore: a one-off for the print view */\n.oe-card { padding: 0; }')).toEqual([]);
  });

  it('warns about a table with no wrapper', () => {
    expect(lint('a.html', '<table class="oe-table"></table>')).toMatchObject([{ rule: 'table-wrap', severity: 'warning' }]);
    expect(lint('a.html', '<div class="oe-table-wrap"><table class="oe-table"></table></div>')).toEqual([]);
    expect(rules('a.html', '<div class="oe-table-wrap"><table class="oe-table"></table></div><table class="oe-table"></table>')).toEqual(['table-wrap']);
  });

  it('skips build output and type declarations', () => {
    expect(isLintable('a.min.css')).toBe(false);
    expect(isLintable('a.d.ts')).toBe(false);
    expect(isLintable('a.png')).toBe(false);
    expect(isLintable('a.svelte')).toBe(true);
  });
});

describe('the oe-lint command', () => {
  const dir = mkdtempSync(join(tmpdir(), 'oe-lint-'));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));
  const run = (...args: string[]) => spawnSync(process.execPath, [new URL('../bin/oe-lint.js', import.meta.url).pathname, ...args], { cwd: dir, encoding: 'utf8' });

  it('exits 0 for clean code', () => {
    writeFileSync(join(dir, 'clean.css'), '.x { color: var(--fg-default); }');
    const result = run('clean.css');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('0 errors, 0 warnings in 1 file');
  });

  it('exits 1 with file, line and rule for errors', () => {
    writeFileSync(join(dir, 'bad.css'), '\n.x { color: #fff; }');
    const result = run('bad.css');
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/bad\.css:2:\d+ +error +no-raw-colors/);
  });

  it('prints JSON', () => {
    const result = run('bad.css', '--json');
    expect(JSON.parse(result.stdout)).toMatchObject({ errors: 1, findings: [{ rule: 'no-raw-colors', line: 2 }] });
  });

  it('exits 2 for a bad option or path', () => {
    expect(run('--nope').status).toBe(2);
    expect(run('missing-folder').status).toBe(2);
  });
});

describe('the showcase', () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
      const path = join(dir, entry);
      if (entry === 'dist') return [];
      return statSync(path).isDirectory() ? walk(path) : isLintable(path) ? [path] : [];
    });

  it('passes oe-lint with no findings', () => {
    const root = new URL('../site', import.meta.url).pathname;
    expect(lintFiles(walk(root).map((path) => ({ path, text: readFileSync(path, 'utf8') })), data)).toEqual([]);
  });
});

describe('the page templates', () => {
  const dir = new URL('../templates/', import.meta.url).pathname;
  const names = readdirSync(dir).map((file) => file.replace('.html', ''));
  const text = (name: string) => readFileSync(join(dir, `${name}.html`), 'utf8');

  it('are the set the showcase lists, each with its own page', () => {
    expect(names.sort()).toEqual(TEMPLATES.map((t) => t.id).sort());
    for (const name of names) expect(read(`site/layout/${name}/index.html`)).toContain(`data-template="${name}"`);
  });

  it.each(TEMPLATES.map((t) => t.id))('%s passes oe-lint with no findings', (name) => {
    expect(lint(`${name}.html`, text(name))).toEqual([]);
  });

  it.each(TEMPLATES.map((t) => t.id))('%s only uses icons the showcase can draw', (name) => {
    const icons = [...text(name).matchAll(/data-lucide="([^"]+)"/g)].map((m) => m[1]);
    expect(icons.length).toBeGreaterThan(0);
    for (const icon of icons) expect(ICON_NODES, icon).toHaveProperty([icon]);
  });

  it('are named in the guide and ship in the package', () => {
    const guide = read('AGENT-GUIDE.md');
    for (const name of names) expect(guide).toContain(`${name}.html`);
    expect(JSON.parse(read('package.json')).files).toContain('templates');
  });
});

describe('AGENT-GUIDE.md', () => {
  const guide = read('AGENT-GUIDE.md');

  it('names every class in components.css', () => {
    for (const name of data.classes) expect(guide, name).toContain(name);
  });

  it.each([
    ['AGENT-GUIDE.md', guide],
    ['README.md', read('README.md')],
  ])('%s only names classes that exist', (_file, text) => {
    for (const m of text.matchAll(/(?<![-\w])oe-(?!lint|design)[a-z0-9-]+\b/g)) expect(data.classes, m[0]).toContain(m[0]);
  });

  it('only names tokens that exist', () => {
    const roles = new Set(model.roles.map((r) => r.name));
    const names = [...guide.matchAll(/`((?:fg|bg|border)-[a-z-]*[a-z])`/g)].map((m) => m[1]);
    expect(names.length).toBeGreaterThan(20);
    for (const name of names) expect(roles, name).toContain(name);
  });

  it('passes the lint rules in its own example', () => {
    const shell = guide.match(/```html\n([\s\S]*?)```/)![1];
    expect(lint('shell.html', shell)).toEqual([]);
  });

  it('ships in the package', () => {
    const files: string[] = JSON.parse(read('package.json')).files;
    for (const name of ['AGENT-GUIDE.md', 'bin', 'lint', 'dist']) expect(files).toContain(name);
  });
});
