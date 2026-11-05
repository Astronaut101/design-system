// @ts-check
// Plain JavaScript with no dependencies, because it runs from an app's node_modules.

const CSS_FILE = /\.(css|scss|less|pcss)$/;
const MARKUP_FILE = /\.(html|jsx|tsx|vue|svelte|astro)$/;
const SCRIPT_FILE = /\.(js|mjs|cjs|ts)$/;

export const isLintable = (/** @type {string} */ path) =>
  !/\.min\.|\.d\.ts$/.test(path) && (CSS_FILE.test(path) || MARKUP_FILE.test(path) || SCRIPT_FILE.test(path) || /(^|\/)package\.json$/.test(path));

const INTENTS = 'accent|neutral|danger|warning|success|info';
const RAW_COLOR = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/gi;
const COLOR_NAME = String.raw`(?<![\w-])(?:white|black|red|green|blue|yellow|orange|purple|pink|gray|grey|teal)(?![\w-])`;
const NAMED_COLOR = new RegExp(String.raw`(?:^|[\s;{"'])(?:color|background|background-color|border(?:-[a-z]+)*-color|border(?:-[a-z]+)?|outline(?:-color)?|fill|stroke)\s*:[^;{}"']*?(${COLOR_NAME})`, 'gi');
const COLOR_VALUE = new RegExp(String.raw`${COLOR_NAME}|#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(`, 'i');
const EXACT_HEX = /^#(?:[0-9a-f]{8}|[0-9a-f]{6}|fff|000)$/i;
const STYLE_OBJECT = /(?<![\w-])(?:color|background(?:Color)?|border(?:[A-Z][a-z]+)*|outline(?:Color)?|fill|stroke)["']?\s*:\s*(["'`])([^"'`\n]*)\1/g;
const COLOR_ATTRIBUTE = /(?<![\w:-])(?:fill|stroke|color|stop-color|flood-color|style:[\w-]+)\s*=\s*\{?\s*["'`]+([^"'`\n]*)["'`]/g;
const NOT_A_COLOR = /(?:href\s*=\s*\{?|(?:querySelector(?:All)?|closest|matches|getElementById)\()\s*$/;
const STOCK_PALETTE = /^(?:bg|text|border|ring|fill|stroke|outline|divide|from|via|to|accent|caret|decoration|placeholder|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}$/;
const UTILITY_ROOTS = new Set([...INTENTS.split('|'), 'default', 'muted', 'strong', 'disabled', 'link', 'on', 'page', 'surface', 'raised', 'sunken', 'hover', 'pressed', 'inverse', 'scrim', 'primary', 'secondary', 'foreground', 'background', 'destructive', 'popover', 'card', 'error', 'border']);
const RESET_ELEMENTS = new Set(['*', 'a', 'button', 'input', 'select', 'textarea', 'table', 'th', 'td', 'tr', 'ul', 'ol', 'li', 'p', 'dialog', 'nav', 'label', 'h1', 'h2', 'h3', 'h4', 'small', 'svg']);
const RESET_PROPS = /(?:^|[\s;])(?:color|background(?:-color)?|border(?:-[a-z]+)*|padding(?:-[a-z]+)*|margin(?:-[a-z]+)*|font(?:-[a-z]+)*|outline|width|height|display)\s*:/;
const DEPRECATED_ICONS = { 'lucide-vue-next': '@lucide/vue', 'lucide-svelte': '@lucide/svelte', 'lucide-angular': '@lucide/angular' };

/**
 * @typedef {{ tokens: Set<string>, classes: Set<string>, utilities: Set<string> }} LintData
 * @typedef {{ file: string, line: number, column: number, severity: 'error' | 'warning', rule: string, message: string }} Finding
 */

/** Blanks out a match but keeps its newlines, so line numbers stay right. */
const blank = (/** @type {string} */ text, /** @type {RegExp} */ pattern) => text.replace(pattern, (m) => m.replace(/[^\n]/g, ' '));

const stripComments = (/** @type {string} */ text, /** @type {string} */ file) => {
  let out = blank(text, /\/\*[\s\S]*?\*\//g);
  if (MARKUP_FILE.test(file)) out = blank(out, /<!--[\s\S]*?-->/g);
  if (!CSS_FILE.test(file) || /\.(scss|less)$/.test(file)) out = blank(out, /^[ \t]*\/\/.*$/gm);
  return out;
};

/** The parts of a file that are CSS: the whole file, or its style blocks and style attributes. */
const cssRegions = (/** @type {string} */ text, /** @type {string} */ file) => {
  if (CSS_FILE.test(file)) return [{ start: 0, css: text }];
  if (!MARKUP_FILE.test(file)) return [];
  const regions = [];
  for (const m of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) regions.push({ start: m.index + m[0].indexOf(m[1]), css: m[1] });
  for (const m of text.matchAll(/\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    const css = m[1] ?? m[2];
    regions.push({ start: m.index + m[0].indexOf(css), css });
  }
  return regions;
};

/**
 * Every class attribute's contents, as separate class names with where each one is.
 * @param {string} text
 * @returns {{ name: string, offset: number }[][]}
 */
const classLists = (text) => {
  /** @type {{ name: string, offset: number }[][]} */
  const lists = [];
  const add = (/** @type {string} */ value, /** @type {number} */ start) => {
    // A class built at runtime can't be checked, so a name touching ${...} is skipped.
    const safe = value.replace(/\$\{[^}]*\}/g, (m) => '\u0000'.repeat(m.length));
    const names = [...safe.matchAll(/[^\s'"`,]+/g)].filter((n) => !n[0].includes('\u0000')).map((n) => ({ name: n[0], offset: start + n.index }));
    if (names.length) lists.push(names);
  };
  for (const m of text.matchAll(/(?<![\w:-])(?:class|className)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    const value = m[1] ?? m[2];
    add(value, m.index + m[0].lastIndexOf(value));
  }
  // className={...} and :class="...": only the strings inside can be read.
  for (const m of text.matchAll(/(?:className|class|class:list)\s*=\s*\{|:class\s*=\s*"/g)) {
    const open = m.index + m[0].length;
    let depth = 1;
    let end = open;
    if (m[0].endsWith('"')) end = text.indexOf('"', open);
    else {
      while (end < text.length && depth > 0) {
        if (text[end] === '{') depth++;
        if (text[end] === '}') depth--;
        end++;
      }
    }
    const inner = text.slice(open, end);
    for (const s of inner.matchAll(/'([^']*)'|"([^"]*)"|`([^`]*)`/g)) {
      const value = s[1] ?? s[2] ?? s[3];
      add(value, open + s.index + 1);
    }
  }
  // Svelte's class:name={...}.
  for (const m of text.matchAll(/(?<![\w-])class:(?!list\b)([^\s=>{}]+)/g)) add(m[1], m.index + 'class:'.length);
  return lists;
};

/** Rules with the at-rules around them. A small scanner, not a full CSS parser. */
const cssRules = (/** @type {string} */ css) => {
  const rules = [];
  const stack = [];
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === ';') start = i + 1;
    else if (ch === '}') {
      stack.pop();
      start = i + 1;
    } else if (ch === '{') {
      const prelude = css.slice(start, i).trim();
      if (/^@(media|supports|layer|container|scope)\b/.test(prelude)) {
        stack.push(prelude);
        start = i + 1;
        continue;
      }
      let depth = 1;
      let end = i + 1;
      while (end < css.length && depth > 0) {
        if (css[end] === '{') depth++;
        if (css[end] === '}') depth--;
        end++;
      }
      rules.push({ selector: prelude, body: css.slice(i + 1, end - 1), offset: i + 1, atRules: [...stack] });
      i = end - 1;
      start = end;
    }
  }
  return rules;
};

/**
 * @param {{ path: string, text: string }[]} files
 * @param {LintData} data
 * @returns {Finding[]}
 */
export const lintFiles = (files, data) => {
  /** @type {Finding[]} */
  const findings = [];
  const prepared = files.map((f) => ({ ...f, clean: stripComments(f.text, f.path) }));

  // An app's own variables and classes are fine, so collect them from everywhere first.
  const declaredVars = new Set();
  const declaredClasses = new Set();
  for (const { path, clean } of prepared) {
    for (const { css } of cssRegions(clean, path)) {
      for (const m of css.matchAll(/(--[\w-]+)\s*:/g)) declaredVars.add(m[1]);
      for (const m of css.matchAll(/\.(oe-[\w-]+)/g)) declaredClasses.add(m[1]);
    }
  }
  const usesComponents = prepared.some(({ path, clean }) => !CSS_FILE.test(path) && classLists(clean).some((list) => list.some((c) => c.name.startsWith('oe-'))));

  for (const { path, text, clean } of prepared) {
    const lines = text.split('\n');
    const report = (/** @type {number} */ offset, /** @type {Finding['severity']} */ severity, /** @type {string} */ rule, /** @type {string} */ message) => {
      const before = text.slice(0, offset);
      const line = before.split('\n').length;
      if (lines[line - 1]?.includes('oe-lint-ignore') || lines[line - 2]?.includes('oe-lint-ignore')) return;
      findings.push({ file: path, line, column: offset - before.lastIndexOf('\n'), severity, rule, message });
    };

    if (/(^|\/)package\.json$/.test(path)) {
      for (const [name, replacement] of Object.entries(DEPRECATED_ICONS)) {
        const at = text.indexOf(`"${name}"`);
        if (at >= 0) report(at, 'error', 'deprecated-icons', `${name} is deprecated. Use ${replacement}.`);
      }
      continue;
    }

    for (const m of clean.matchAll(/--ramp-[\w-]*/g)) {
      report(m.index, 'error', 'no-ramps', `${m[0]} is internal. Use a token such as --bg-surface or --fg-default.`);
    }

    for (const m of clean.matchAll(/var\(\s*(--(?:fg|bg|border|chart|primary|secondary|foreground|background|destructive)(?![a-zA-Z0-9_])(?:-[\w-]*)?)/g)) {
      // A name built at runtime, such as --fg-on-${intent}, can't be checked.
      const built = m[1].endsWith('-') || /[$\[{]/.test(clean[m.index + m[0].length] ?? '');
      if (!built && !data.tokens.has(m[1]) && !declaredVars.has(m[1])) report(m.index, 'error', 'unknown-token', `${m[1]} doesn't exist in the design system.`);
    }

    for (const { start, css } of cssRegions(clean, path)) {
      const noUrls = blank(css, /url\([^)]*\)/g);
      for (const m of noUrls.matchAll(RAW_COLOR)) {
        report(start + m.index, 'error', 'no-raw-colors', `${m[0].replace(/\($/, '()')} is a raw color. Use a token.`);
      }
      for (const m of noUrls.matchAll(NAMED_COLOR)) report(start + m.index + m[0].lastIndexOf(m[1]), 'error', 'no-raw-colors', `"${m[1]}" is a raw color. Use a token.`);
      for (const m of css.matchAll(/prefers-color-scheme\s*:\s*dark|\[data-theme=["']?dark["']?\]|(?:(?<![\w-])|(?<=html|body|:root))\.dark(?![\w-])(?=[^{}]*\{)/g)) {
        report(start + m.index, 'error', 'no-dark-overrides', 'Tokens already change with the mode, so remove this override.');
      }

      for (const rule of cssRules(css)) {
        const fill = rule.body.match(new RegExp(`background(?:-color)?\\s*:\\s*var\\(\\s*--bg-(${INTENTS})-emphasis(?:-hover|-active)?\\s*\\)`));
        const color = rule.body.match(/(?:^|[\s;])color\s*:\s*([^;]+)/);
        if (fill && color && !color[1].includes(`--fg-on-${fill[1]}`)) {
          report(start + rule.offset + rule.body.indexOf(color[0]), 'error', 'emphasis-pair', `Text on bg-${fill[1]}-emphasis must use --fg-on-${fill[1]}.`);
        }
        if (usesComponents && CSS_FILE.test(path) && !rule.atRules.some((a) => a.startsWith('@layer'))) {
          const parts = rule.selector.split(',').map((s) => s.trim());
          if (parts.every((p) => RESET_ELEMENTS.has(p)) && RESET_PROPS.test(rule.body)) {
            report(start + rule.offset, 'warning', 'unlayered-reset', `"${rule.selector}" is outside a CSS layer, so it overrides the component classes. Move it into @layer base.`);
          }
        }
      }
    }

    // Quoted colors, style objects and color attributes, in anything that isn't plain CSS.
    if (!CSS_FILE.test(path)) {
      for (const m of clean.matchAll(/(['"`])#(?:[0-9a-f]{8}|[0-9a-f]{6}|fff|000)\1/gi)) {
        if (NOT_A_COLOR.test(clean.slice(Math.max(0, m.index - 40), m.index))) continue;
        report(m.index, 'error', 'no-raw-colors', `${m[0]} is a raw color. Use a token, or chart from the package for canvas charts.`);
      }
      const checkValue = (/** @type {string} */ value, /** @type {number} */ at) => {
        const raw = EXACT_HEX.test(value) ? null : blank(value, /url\([^)]*\)/g).match(COLOR_VALUE);
        if (raw) report(at + value.indexOf(raw[0]), 'error', 'no-raw-colors', `${raw[0].replace(/\($/, '()')} is a raw color. Use a token.`);
      };
      for (const m of clean.matchAll(STYLE_OBJECT)) checkValue(m[2], m.index + m[0].lastIndexOf(m[2]));
      if (MARKUP_FILE.test(path)) for (const m of clean.matchAll(COLOR_ATTRIBUTE)) checkValue(m[1], m.index + m[0].lastIndexOf(m[1]));
    }

    for (const list of classLists(clean)) {
      const names = list.map((c) => c.name);
      for (const { name, offset } of list) {
        const variants = name.replace(/^!/, '').split(':');
        const variantless = variants.at(-1) ?? name;
        const hasVariant = name.includes(':');
        const base = variantless.replace(/!$/, '').replace(/\/(?:\d+|\[[^\]]*\])$/, '');

        if (variants.slice(0, -1).includes('dark')) report(offset, 'error', 'no-dark-overrides', `${name}: tokens already change with the mode, so remove this.`);

        const arbitrary = base.match(/^[a-z-]+-\[(#[0-9a-f]{3,8}|(?:rgba?|hsla?|oklch|oklab|lab|lch)\()/i);
        if (arbitrary) report(offset, 'error', 'no-raw-colors', `${name} is a raw color. Use a token.`);

        if (base.startsWith('oe-')) {
          if (!data.classes.has(base) && !declaredClasses.has(base) && !base.endsWith('-')) {
            report(offset, 'error', 'unknown-class', `${base} doesn't exist in components.css.${suggest(base, data.classes)}`);
          }
          continue;
        }

        if (STOCK_PALETTE.test(base)) {
          report(offset, 'error', 'unknown-utility', `${base} doesn't exist, because Tailwind's stock colors are removed. Use a token utility such as bg-surface or text-muted.`);
          continue;
        }

        const utility = base.match(/^(text|bg|border)-([a-z]+)/);
        if (utility && UTILITY_ROOTS.has(utility[2]) && !data.utilities.has(base) && !declaredVars.has(`--color-${base.slice(utility[1].length + 1)}`)) {
          const hint = suggest(base, data.utilities) || ' Use a token utility such as bg-accent-emphasis or text-muted.';
          report(offset, 'error', 'unknown-utility', `${base} doesn't exist in the design system.${hint}`);
        }

        const fill = base.match(new RegExp(`^bg-(${INTENTS})-emphasis$`));
        if (fill && !hasVariant && !names.some((n) => n.split(':').at(-1) === `text-on-${fill[1]}`) && !names.some((n) => n.startsWith('oe-'))) {
          report(offset, 'error', 'emphasis-pair', `${base} needs text-on-${fill[1]} on the same element.`);
        }
      }
    }
  }
  return findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column);
};

/** Up to three real names that start the same way. */
const suggest = (/** @type {string} */ name, /** @type {Set<string>} */ known) => {
  const stem = name.split('-').slice(0, 2).join('-');
  const matches = [...known].filter((k) => k === stem || k.startsWith(`${stem}-`)).slice(0, 3);
  return matches.length ? ` Did you mean ${matches.join(', ')}?` : '';
};

/**
 * Reads the real tokens and classes from the package's own build output.
 * @param {string} tokensCss
 * @param {string} componentsCss
 * @param {{ roles: { name: string, family: string }[], chart: { categorical: { light: string[] } } }} model
 * @returns {LintData}
 */
export const buildLintData = (tokensCss, componentsCss, model) => {
  const tokens = new Set([...tokensCss.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  const classes = new Set([...componentsCss.matchAll(/\.(oe-[\w-]+)/g)].map((m) => m[1]));
  const prefixes = { fg: 'text', bg: 'bg', border: 'border' };
  /** @type {Set<string>} */
  const utilities = new Set();
  for (const role of model.roles) {
    const prefix = prefixes[/** @type {keyof typeof prefixes} */ (role.family)];
    if (prefix) utilities.add(`${prefix}-${role.name.slice(role.family.length + 1)}`);
  }
  return { tokens, classes, utilities };
};
