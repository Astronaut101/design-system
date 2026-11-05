import { readFileSync } from 'node:fs';
import { Contrast } from '@material/material-color-utilities';
import lucideNodesJson from 'lucide-static/icon-nodes.json';
import lucideTags from 'lucide-static/tags.json';
import { compile } from 'tailwindcss';
import { describe, expect, it } from 'vitest';
import { searchIcons } from '../site/icon-browser.ts';
import { ICON_NODES } from '../site/icons.ts';
import { CHART_GATES, PAIRWISE_SLOTS, minSeparation, type Mode } from '../src/chart-gates.ts';
import palette from '../src/chart-palette.json';
import { composite, deltaE, oklch } from '../src/color-math.ts';
import { emitDtcg, emitTailwindCss } from '../src/emit.ts';
import { toHct } from '../src/hct.ts';
import { ICON_SIZES } from '../src/icons.ts';
import { INTENT_NAMES, RAMP_STOPS, SEED, chartSurface } from '../src/spec.ts';
import { SPACE_STEPS, STATUS_TOKENS, buildModel, readTailwindSizing } from '../src/tokens.ts';

const model = buildModel();
const MODES: Mode[] = ['light', 'dark'];
const PLANES = ['bg-page', 'bg-surface', 'bg-raised', 'bg-sunken'];
const role = (name: string) => {
  const found = model.roles.find((r) => r.name === name);
  if (!found) throw new Error(`no token named ${name}`);
  return found;
};

describe('accent', () => {
  it('stays on the brand hue in both modes', () => {
    for (const mode of MODES) expect(Math.abs(toHct(role('bg-accent-emphasis')[mode].hex).hue - SEED.hue)).toBeLessThan(1.5);
  });

  it('keeps the agreed values', () => {
    expect(role('bg-accent-emphasis').light.hex).toBe('#007f80');
    expect(role('bg-accent-emphasis').dark.hex).toBe('#52bbbb');
  });
});

describe('tone contrast rule', () => {
  it('holds for every tone pair at the documented gaps', () => {
    for (let t = 0; t <= 49; t++) expect(Contrast.ratioOfTones(t, t + 51)).toBeGreaterThanOrEqual(4.5);
    for (let t = 0; t <= 60; t++) expect(Contrast.ratioOfTones(t, t + 40)).toBeGreaterThanOrEqual(3);
  });
});

describe('token set', () => {
  it('gives every intent the same fills and on-color', () => {
    for (const i of INTENT_NAMES)
      for (const name of [`bg-${i}-emphasis`, `bg-${i}-emphasis-hover`, `bg-${i}-emphasis-active`, `fg-on-${i}`, `bg-${i}-muted`, `bg-${i}-muted-hover`])
        expect(() => role(name), name).not.toThrow();
  });

  it('gives every status intent text and both borders', () => {
    for (const i of INTENT_NAMES.filter((n) => n !== 'neutral'))
      for (const name of [`fg-${i}`, `border-${i}-emphasis`, `border-${i}-muted`]) expect(() => role(name), name).not.toThrow();
  });

  it('names every token for the property it colors', () => {
    for (const r of model.roles) expect(r.name).toMatch(/^(fg|bg|border)-|^focus$/);
  });
});

describe('role contrast', () => {
  it.each(model.contrast.map((c) => [`${c.mode}: ${c.fg} on ${c.bg}`, c] as const))('%s', (_, c) => {
    expect(c.ratio).toBeGreaterThanOrEqual(c.min);
  });
});

describe('interaction states', () => {
  const over = (state: string, plane: string, mode: Mode) =>
    composite(role(state)[mode].hex, role(state)[mode].alpha!, role(plane)[mode].hex);

  it.each(MODES)('hover is visible on every surface in %s mode', (mode) => {
    for (const plane of PLANES) {
      const dist = deltaE(over('bg-hover', plane, mode), role(plane)[mode].hex);
      expect(dist, plane).toBeGreaterThanOrEqual(4);
    }
  });

  it.each(MODES)('pressed is distinct from hover on every surface in %s mode', (mode) => {
    for (const plane of PLANES) {
      const dist = deltaE(over('bg-pressed', plane, mode), over('bg-hover', plane, mode));
      expect(dist, plane).toBeGreaterThanOrEqual(2.5);
    }
  });
});

describe('semantic colors', () => {
  it.each(MODES)('are distinct from each other in %s mode', (mode) => {
    for (const a of INTENT_NAMES)
      for (const b of INTENT_NAMES)
        if (a < b) {
          const dist = deltaE(role(`bg-${a}-emphasis`)[mode].hex, role(`bg-${b}-emphasis`)[mode].hex);
          expect(dist, `${a} vs ${b}`).toBeGreaterThanOrEqual(CHART_GATES.adjacentFloor);
        }
  });

  it.each(MODES)('neutral stays gray in %s mode', (mode) => {
    for (const name of ['bg-neutral-emphasis', 'bg-neutral-muted']) expect(oklch(role(name)[mode].hex).C).toBeLessThan(0.02);
  });
});

describe('categorical chart palette', () => {
  it.each(MODES)('passes every gate in %s mode', (mode) => {
    const report = model.chartReports[mode];
    expect(report.lightnessInBand).toBe(true);
    expect(report.chromaAboveFloor).toBe(true);
    expect(report.minContrast).toBeGreaterThanOrEqual(CHART_GATES.surfaceContrast);
    expect(report.adjacent).toBeGreaterThanOrEqual(CHART_GATES.adjacentFloor);
    expect(report.pass).toBe(true);
  });

  it('starts with the brand hue and keeps its order in both modes', () => {
    expect(palette[0].name).toBe('teal');
    expect(Math.abs(toHct(model.chart.categorical.light[0]).hue - SEED.hue)).toBeLessThan(1.5);
    expect(model.chart.names).toEqual(['teal', 'coral', 'violet', 'amber', 'blue', 'green', 'orange', 'magenta']);
  });

  it.each(MODES.flatMap((mode) => CHART_GATES.leadingFloors.map(([n, floor]) => [mode, n, floor] as const)))(
    'keeps every pair distinct in the first slots: %s mode, first %i, at least %i',
    (mode, n, floor) => {
      expect(minSeparation(model.chart.categorical[mode].slice(0, n))).toBeGreaterThanOrEqual(floor);
    },
  );

  it.each(MODES)('never lets two of the eight colors merge in %s mode', (mode) => {
    expect(minSeparation(model.chart.categorical[mode])).toBeGreaterThanOrEqual(CHART_GATES.fullSetFloor);
  });

  it.each(MODES)('stays clear of status colors in %s mode', (mode) => {
    model.chart.categorical[mode].forEach((color, slot) => {
      for (const token of STATUS_TOKENS) {
        const dist = deltaE(color, role(token)[mode].hex);
        expect(dist, `${model.chart.names[slot]} vs ${token}`).toBeGreaterThanOrEqual(CHART_GATES.statusFloor);
      }
    });
  });

  it('caps scatter plots where the pairwise floor still holds', () => {
    expect(PAIRWISE_SLOTS).toBe(5);
    const floor = CHART_GATES.leadingFloors.find(([n]) => n === PAIRWISE_SLOTS)![1];
    expect(floor).toBeGreaterThanOrEqual(CHART_GATES.adjacentFloor);
  });

  it('validates against the real card surface', () => {
    expect(model.chartReports.light.surface).toBe(chartSurface('light'));
    expect(model.chartReports.dark.surface).toBe(chartSurface('dark'));
  });
});

describe('tonal ramps', () => {
  const tones = (stops: Record<string, string>) => Object.keys(stops).map(Number);

  it.each(Object.entries(model.ramps))('%s has every shared stop', (_, stops) => {
    expect(tones(stops)).toEqual(expect.arrayContaining(RAMP_STOPS));
  });

  it('keeps every tone a token uses, including ones between the shared stops', () => {
    for (const r of model.roles)
      for (const mode of MODES) expect(model.ramps[r[mode].ramp][r[mode].tone], `${r.name} ${mode}`).toBe(r[mode].hex);
  });

  it('runs the shared stops light to dark', () => {
    expect(RAMP_STOPS).toEqual([...RAMP_STOPS].sort((a, b) => b - a));
  });
});

describe('sequential and diverging scales', () => {
  const lightness = (xs: string[]) => xs.map((x) => oklch(x).L);

  it('sequential moves steadily away from the surface', () => {
    const light = lightness(model.chart.sequential.light);
    const dark = lightness(model.chart.sequential.dark);
    light.slice(1).forEach((l, i) => expect(l).toBeLessThan(light[i]));
    dark.slice(1).forEach((l, i) => expect(l).toBeGreaterThan(dark[i]));
  });

  it.each(MODES)('diverging has a neutral midpoint and matched arms in %s mode', (mode) => {
    const scale = model.chart.diverging[mode];
    expect(scale).toHaveLength(9);
    expect(oklch(scale[4]).C).toBeLessThan(0.02);
    for (let i = 0; i < 4; i++) {
      const gap = Math.abs(oklch(scale[i]).L - oklch(scale[8 - i]).L);
      expect(gap, `step ${i}`).toBeLessThan(0.05);
    }
  });
});

describe('sizing', () => {
  it('uses the Tailwind scale unchanged', () => {
    const css = readFileSync(new URL('../dist/tokens.css', import.meta.url), 'utf8');
    for (const t of readTailwindSizing()) expect(css).toContain(`${t.name}: ${t.value};`);
    expect(css).toContain('--spacing: 0.25rem;');
  });
});

describe('icons', () => {
  const lucideNodes: Record<string, unknown> = lucideNodesJson;
  const names = Object.keys(ICON_NODES);

  // Lucide keeps old names as aliases and drops them later, so an alias doesn't pass.
  it.each(names)('%s is a current Lucide name', (name) => {
    expect(lucideNodes).toHaveProperty([name]);
  });

  it('draws the same icons from both Lucide packages', () => {
    for (const name of names) expect(ICON_NODES[name]).toEqual(lucideNodes[name]);
  });

  it.each([
    ['trash', 'trash'],
    ['delete', 'trash'],
    ['done', 'circle-check'],
    ['approved', 'circle-check'],
    ['arrow up', 'arrow-up'],
  ])('finds a match for the search "%s"', (query, name) => {
    expect(searchIcons(query, Object.keys(lucideNodes), lucideTags)).toContain(name);
  });

  it('ranks an exact name first and returns nothing for a search with no match', () => {
    expect(searchIcons('trash', Object.keys(lucideNodes), lucideTags)[0]).toBe('trash');
    expect(searchIcons('zzzz', Object.keys(lucideNodes), lucideTags)).toEqual([]);
  });

  it('keeps icon sizes on the spacing scale', () => {
    for (const step of Object.values(ICON_SIZES)) expect(SPACE_STEPS).toContain(step);
  });
});

describe('JSON output', () => {
  it('nests tokens by property and keeps opacity on translucent tokens', () => {
    const { color } = emitDtcg(model, 'light');
    expect(color.fg.muted.$value.hex).toBe(role('fg-muted').light.hex);
    expect(color.bg['accent-emphasis'].$value.hex).toBe('#007f80');
    expect(color.bg.hover.$value.alpha).toBe(0.07);
    expect(color.focus.$value.hex).toBe(role('focus').light.hex);
  });
});

describe('tailwind output', () => {
  const build = async (candidates: string[]) => {
    const tailwindTheme = readFileSync(new URL('../node_modules/tailwindcss/theme.css', import.meta.url), 'utf8');
    const utilities = readFileSync(new URL('../node_modules/tailwindcss/utilities.css', import.meta.url), 'utf8');
    const compiler = await compile(`@layer theme, base, components, utilities;\n${tailwindTheme}\n${emitTailwindCss(model)}\n${utilities}`);
    return compiler.build(candidates);
  };

  it('maps each token family to its own utility', async () => {
    const css = await build(['text-default', 'text-muted', 'text-danger', 'text-on-accent', 'text-link', 'bg-accent-emphasis', 'bg-accent-muted', 'bg-surface', 'border-default', 'border-strong', 'border-accent-muted', 'ring-focus', 'outline-focus']);
    expect(css).toContain('color: var(--fg-default)');
    expect(css).toContain('color: var(--fg-muted)');
    expect(css).toContain('color: var(--fg-on-accent)');
    expect(css).toContain('background-color: var(--bg-accent-emphasis)');
    expect(css).toContain('border-color: var(--border-accent-muted)');
    expect(css).toContain('outline-color: var(--focus)');
    expect(css).toContain('--bg-accent-emphasis: light-dark(');
  });

  it.each(['text-accent-emphasis', 'text-accent-muted', 'text-warning-emphasis', 'bg-accent', 'bg-warning', 'bg-default', 'bg-muted', 'border-accent', 'border-warning', 'border-on-accent'])(
    'does not generate the misusable utility %s',
    async (candidate) => {
      expect(await build([candidate])).not.toContain(`.${candidate}`);
    },
  );

  it.each(['bg-red-500', 'text-slate-900', 'bg-teal-48', 'bg-ramp-teal-48', 'text-neutral-40'])('does not expose %s', async (candidate) => {
    expect(await build([candidate])).not.toContain(`.${candidate}`);
  });

  it('compiles the utilities the icon docs recommend', async () => {
    const css = await build(['size-3', 'size-4', 'size-5', 'size-6', 'text-success']);
    for (const step of Object.values(ICON_SIZES)) expect(css).toContain(`.size-${step}`);
    expect(css).toContain('color: var(--fg-success)');
  });

  it('keeps sizing, chart colors, modifiers and variants working', async () => {
    const css = await build(['p-4', 'text-sm', 'rounded-lg', 'bg-chart-1', 'stroke-chart-2', 'bg-accent-emphasis/50', 'hover:bg-hover', 'dark:bg-surface', 'shadow-overlay']);
    expect(css).toContain('calc(var(--spacing) * 4)');
    expect(css).toContain('font-size: var(--text-sm)');
    expect(css).toContain('background-color: var(--chart-1)');
    expect(css).toContain('stroke: var(--chart-2)');
    expect(css).toContain('color-mix');
    expect(css).toContain('background-color: var(--bg-hover)');
    expect(css).toContain('prefers-color-scheme: dark');
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain('.shadow-overlay');
    expect(css).toContain('light-dark(rgb(0 0 0 / 0.12), rgb(0 0 0 / 0.55))');
  });
});
