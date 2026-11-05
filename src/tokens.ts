import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import chartPalette from './chart-palette.json' with { type: 'json' };
import { reportCategorical, type ChartReport, type Mode } from './chart-gates.ts';
import { composite, contrast } from './color-math.ts';
import { fromHct } from './hct.ts';
import { ICON_SIZES } from './icons.ts';
import {
  BASE_ROLES,
  CHART_CHROME,
  DIVERGING,
  ELEVATION,
  INTENT_NAMES,
  RAMPS,
  RAMP_STOPS,
  SEED,
  SEED_HEX,
  SEQUENTIAL_TONES,
  chartSurface,
  intentRoles,
  taperedChroma,
  type RampName,
  type RoleSpec,
} from './spec.ts';

export interface RoleValue {
  hex: string;
  /** The value to use in CSS: the hex, with opacity appended for translucent tokens. */
  css: string;
  alpha?: number;
  ramp: RampName;
  tone: number;
}
export interface Role {
  name: string;
  family: 'fg' | 'bg' | 'border' | 'focus' | 'chart';
  /** The intent this role belongs to, or 'base'. */
  group: string;
  note: string;
  light: RoleValue;
  dark: RoleValue;
}
export interface ContrastCheck {
  fg: string;
  bg: string;
  mode: Mode;
  fgHex: string;
  bgHex: string;
  min: number;
  ratio: number;
  pass: boolean;
}
export interface SizeToken {
  name: string;
  value: string;
  group: string;
}

// Tailwind's scale is adopted by reading it from Tailwind itself, so it cannot drift.
const SIZE_GROUPS: [RegExp, string][] = [
  [/^--spacing$/, 'spacing'],
  [/^--text-/, 'text'],
  [/^--font-(sans|mono)$/, 'font'],
  [/^--font-weight-/, 'font-weight'],
  [/^--leading-/, 'leading'],
  [/^--tracking-/, 'tracking'],
  [/^--radius-/, 'radius'],
  [/^--shadow-/, 'shadow'],
  [/^--ease-/, 'ease'],
  [/^--breakpoint-/, 'breakpoint'],
  [/^--container-/, 'container'],
];

export const readTailwindSizing = (): SizeToken[] => {
  const require = createRequire(import.meta.url);
  const css = readFileSync(require.resolve('tailwindcss/theme.css'), 'utf8');
  const tokens: SizeToken[] = [];
  for (const [, name, raw] of css.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    const group = SIZE_GROUPS.find(([re]) => re.test(name))?.[1];
    if (group) tokens.push({ name, group, value: raw.replace(/\s+/g, ' ').trim() });
  }
  return tokens;
};

/** Status colors keep their meaning, so chart series must stay clear of them. */
export const STATUS_TOKENS = ['danger', 'warning', 'success', 'info'].flatMap((i) => [`bg-${i}-emphasis`, `fg-${i}`]);

export const SPACE_STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24, 32];

const hexOf = (ramp: RampName, tone: number) => {
  const { hue, chroma } = RAMPS[ramp];
  return fromHct(hue, ramp === 'teal' ? taperedChroma(chroma, tone) : chroma, tone);
};

const alphaHex = (alpha: number) => Math.round(alpha * 255).toString(16).padStart(2, '0');

const toValue = (spec: RoleSpec, mode: Mode): RoleValue => {
  const hex = hexOf(spec.ramp, spec[mode]);
  const alpha = spec.alpha?.[mode === 'light' ? 0 : 1];
  return { hex, css: alpha === undefined ? hex : hex + alphaHex(alpha), ...(alpha === undefined ? {} : { alpha }), ramp: spec.ramp, tone: spec[mode] };
};

const toRole = (name: string, family: Role['family'], group: string, spec: RoleSpec): Role => ({
  name,
  family,
  group,
  note: spec.note,
  light: toValue(spec, 'light'),
  dark: toValue(spec, 'dark'),
});

const familyOf = (name: string) => name.split('-')[0] as Role['family'];

const buildRoles = (): Role[] => [
  ...Object.entries(BASE_ROLES).map(([n, s]) => toRole(n, familyOf(n), 'base', s)),
  ...INTENT_NAMES.flatMap((intent) =>
    Object.entries(intentRoles(intent)).map(([n, s]) => toRole(n, familyOf(n), intent, s)),
  ),
];

const buildRamps = (roles: Role[]) => {
  const ramps = {} as Record<RampName, Record<number, string>>;
  for (const name of Object.keys(RAMPS) as RampName[]) {
    const used = roles
      .filter((r) => r.light.ramp === name)
      .flatMap((r) => [r.light.tone, r.dark.tone]);
    const tones = [...new Set([...RAMP_STOPS, ...used])].sort((a, b) => a - b);
    ramps[name] = Object.fromEntries(tones.map((t) => [t, hexOf(name, t)]));
  }
  return ramps;
};

const buildChart = () => {
  const categorical = (mode: Mode) => chartPalette.map((s) => fromHct(s.hue, s.chroma, s.tone[mode]));
  const sequential = (mode: Mode) => SEQUENTIAL_TONES[mode].map((t) => hexOf('teal', t));
  const diverging = (mode: Mode) => {
    const { negative, positive, armTones, midpointTone } = DIVERGING;
    const arm = (p: { hue: number; chroma: number }) =>
      armTones[mode].map((t) => fromHct(p.hue, taperedChroma(p.chroma, t), t));
    return [...arm(negative), hexOf('neutral', midpointTone[mode]), ...arm(positive).reverse()];
  };
  const chrome = Object.fromEntries(
    Object.entries(CHART_CHROME).map(([n, s]) => [n, toRole(`chart-${n}`, 'chart', 'chart', s)]),
  );
  return {
    names: chartPalette.map((s) => s.name),
    categorical: { light: categorical('light'), dark: categorical('dark') },
    sequential: { light: sequential('light'), dark: sequential('dark') },
    diverging: { light: diverging('light'), dark: diverging('dark') },
    grid: chrome.grid,
    axis: chrome.axis,
  };
};

// Every pairing the system promises, checked in both modes. A translucent state is measured
// as what it actually looks like: composited over each surface it can sit on.
const buildContrastChecks = (roles: Role[]): ContrastCheck[] => {
  const byName = new Map(roles.map((r) => [r.name, r]));
  const planes = ['bg-page', 'bg-surface', 'bg-raised', 'bg-sunken'];
  const statesOverPlanes = ['bg-hover', 'bg-pressed'].flatMap((state) => planes.map((p) => `${state} over ${p}`));
  const everywhere = [...planes, ...statesOverPlanes];
  const pairs: [string, string, number][] = [];

  for (const p of everywhere) for (const fg of ['fg-default', 'fg-muted', 'fg-link']) pairs.push([fg, p, 4.5]);
  for (const p of planes) pairs.push(['fg-link-hover', p, 4.5], ['border-strong', p, 3], ['focus', p, 3]);
  pairs.push(['fg-on-inverse', 'bg-inverse', 4.5]);

  for (const i of INTENT_NAMES) {
    for (const state of ['', '-hover', '-active']) pairs.push([`fg-on-${i}`, `bg-${i}-emphasis${state}`, 4.5]);
    for (const muted of [`bg-${i}-muted`, `bg-${i}-muted-hover`]) {
      pairs.push(['fg-default', muted, 4.5]);
      if (i === 'neutral') pairs.push(['fg-muted', muted, 4.5]);
      else pairs.push([`fg-${i}`, muted, 4.5], [`border-${i}-emphasis`, muted, 3]);
    }
    if (i === 'neutral') continue;
    for (const p of everywhere) pairs.push([`fg-${i}`, p, 4.5]);
    for (const p of ['bg-page', 'bg-surface', 'bg-raised']) pairs.push([`border-${i}-emphasis`, p, 3]);
    // Amber is a light fill by design: on light surfaces border-warning-emphasis provides the edge.
    if (i !== 'warning') for (const p of ['bg-page', 'bg-surface']) pairs.push([`bg-${i}-emphasis`, p, 3]);
  }

  const resolve = (name: string, mode: Mode) => {
    const [state, plane] = name.split(' over ');
    if (!plane) return byName.get(name)![mode].hex;
    const value = byName.get(state)![mode];
    return composite(value.hex, value.alpha!, byName.get(plane)![mode].hex);
  };
  const checks: ContrastCheck[] = [];
  for (const mode of ['light', 'dark'] as Mode[]) {
    for (const [fg, bg, min] of pairs) {
      const [fgHex, bgHex] = [resolve(fg, mode), resolve(bg, mode)];
      const ratio = contrast(fgHex, bgHex);
      checks.push({ fg, bg, mode, fgHex, bgHex, min, ratio: Number(ratio.toFixed(2)), pass: ratio >= min });
    }
  }
  return checks;
};

export const buildModel = () => {
  const roles = buildRoles();
  const chart = buildChart();
  const statusHexes = (mode: Mode) => STATUS_TOKENS.map((n) => roles.find((r) => r.name === n)![mode].hex);
  const chartReports: Record<Mode, ChartReport> = {
    light: reportCategorical(chart.categorical.light, 'light', chartSurface('light'), statusHexes('light')),
    dark: reportCategorical(chart.categorical.dark, 'dark', chartSurface('dark'), statusHexes('dark')),
  };
  return {
    seed: { hex: SEED_HEX, ...SEED },
    ramps: buildRamps(roles),
    rampStops: RAMP_STOPS,
    rampInfo: RAMPS,
    roles,
    chart,
    chartReports,
    contrast: buildContrastChecks(roles),
    elevation: ELEVATION,
    sizing: readTailwindSizing(),
    spaceSteps: SPACE_STEPS,
    iconSizes: ICON_SIZES,
  };
};

export type Model = ReturnType<typeof buildModel>;
