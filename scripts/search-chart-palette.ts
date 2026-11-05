// Finds the categorical chart palette by search rather than by eye, then freezes it in
// src/chart-palette.json. Deterministic: the same seed reproduces the same palette.
// Run only when the brand seed or the status colors change. `npm test` enforces the result either way.
import { writeFileSync } from 'node:fs';
import { CHART_GATES, minAdjacent, minSeparation, type Mode } from '../src/chart-gates.ts';
import { contrast, deltaE, oklch } from '../src/color-math.ts';
import { fromHct } from '../src/hct.ts';
import { SEED, chartSurface } from '../src/spec.ts';
import { STATUS_TOKENS, buildModel } from '../src/tokens.ts';

interface Family {
  name: string;
  hue: number;
}

// Slot 1 is always the brand hue. The search orders the rest and tunes hue and tone.
const OTHERS: Family[] = [
  { name: 'orange', hue: 50 },
  { name: 'blue', hue: 268 },
  { name: 'amber', hue: 88 },
  { name: 'magenta', hue: 350 },
  { name: 'green', hue: 140 },
  { name: 'violet', hue: 300 },
  { name: 'coral', hue: 22 },
];
const CHROMA = 60;
const HUE_WOBBLE = 12;
const TONES: Record<Mode, number[]> = {
  light: [32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60],
  dark: [50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76],
};
// What to aim for, above the floors the tests enforce, so the search keeps improving past them.
const LEADING_TARGETS: [number, number][] = [
  [2, 30],
  [3, 24],
  [4, 20],
  [5, 16],
];
const FULL_SET_TARGET = 12;
const STATUS_TARGET = 12;

const { roles } = buildModel();
const statusHexes = (mode: Mode) => STATUS_TOKENS.map((n) => roles.find((r) => r.name === n)![mode].hex);
const STATUS = { light: statusHexes('light'), dark: statusHexes('dark') };

interface State {
  order: number[];
  wobble: number[];
  tones: Record<Mode, number[]>;
}

let seed = 20261105;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T>(xs: T[]) => xs[Math.floor(rand() * xs.length)];

const colorsFor = (s: State, mode: Mode) =>
  s.order.map((family, slot) =>
    slot === 0
      ? fromHct(SEED.hue, CHROMA, s.tones[mode][0])
      : fromHct((OTHERS[family].hue + s.wobble[slot] + 360) % 360, CHROMA, s.tones[mode][slot]),
  );

const scoreMode = (colors: string[], mode: Mode) => {
  const [lo, hi] = CHART_GATES.lightnessBand[mode];
  const surface = chartSurface(mode);
  let penalty = 0;
  for (const c of colors) {
    const { L, C } = oklch(c);
    penalty += Math.max(0, lo - L) * 20 + Math.max(0, L - hi) * 20;
    penalty += Math.max(0, CHART_GATES.chromaFloor - C) * 40;
    penalty += Math.max(0, CHART_GATES.surfaceContrast - contrast(c, surface));
    for (const s of STATUS[mode]) penalty += Math.max(0, STATUS_TARGET - deltaE(c, s)) * 0.1;
  }
  // Every term is normalised so 1.0 means "exactly on target".
  const margin = Math.min(
    minAdjacent(colors) / CHART_GATES.adjacentFloor,
    minSeparation(colors) / FULL_SET_TARGET,
    ...LEADING_TARGETS.map(([n, target]) => minSeparation(colors.slice(0, n)) / target),
  );
  return margin + 0.05 * (minSeparation(colors) / CHART_GATES.adjacentFloor) - penalty;
};

const score = (s: State) =>
  Math.min(scoreMode(colorsFor(s, 'light'), 'light'), scoreMode(colorsFor(s, 'dark'), 'dark'));

const randomState = (): State => {
  const rest = OTHERS.map((_, i) => i).sort(() => rand() - 0.5);
  return {
    order: [-1, ...rest],
    wobble: Array.from({ length: 8 }, () => Math.round((rand() - 0.5) * 2 * HUE_WOBBLE)),
    tones: {
      light: Array.from({ length: 8 }, () => pick(TONES.light)),
      dark: Array.from({ length: 8 }, () => pick(TONES.dark)),
    },
  };
};

const mutate = (s: State): State => {
  const n: State = {
    order: [...s.order],
    wobble: [...s.wobble],
    tones: { light: [...s.tones.light], dark: [...s.tones.dark] },
  };
  const slot = 1 + Math.floor(rand() * 7);
  const kind = rand();
  if (kind < 0.25) {
    const other = 1 + Math.floor(rand() * 7);
    [n.order[slot], n.order[other]] = [n.order[other], n.order[slot]];
  } else if (kind < 0.45) {
    n.wobble[slot] = Math.round((rand() - 0.5) * 2 * HUE_WOBBLE);
  } else {
    const mode: Mode = rand() < 0.5 ? 'light' : 'dark';
    const target = rand() < 0.15 ? 0 : slot;
    n.tones[mode][target] = pick(TONES[mode]);
  }
  return n;
};

let best: State | null = null;
let bestScore = -Infinity;
for (let restart = 0; restart < 24; restart++) {
  let cur = randomState();
  let curScore = score(cur);
  for (let i = 0; i < 6000; i++) {
    const temp = 0.08 * (1 - i / 6000) + 1e-4;
    const next = mutate(cur);
    const nextScore = score(next);
    if (nextScore > curScore || rand() < Math.exp((nextScore - curScore) / temp)) {
      cur = next;
      curScore = nextScore;
    }
    if (curScore > bestScore) {
      best = cur;
      bestScore = curScore;
    }
  }
}

if (!best) throw new Error('search produced nothing');
const found = best;
const slots = found.order.map((family, slot) => ({
  name: slot === 0 ? 'teal' : OTHERS[family].name,
  hue: slot === 0 ? SEED.hue : (OTHERS[family].hue + found.wobble[slot] + 360) % 360,
  chroma: CHROMA,
  tone: { light: found.tones.light[slot], dark: found.tones.dark[slot] },
}));
writeFileSync(new URL('../src/chart-palette.json', import.meta.url), JSON.stringify(slots, null, 2) + '\n');
console.log('score', bestScore.toFixed(3));
for (const s of slots)
  console.log(s.name.padEnd(8), 'H', s.hue.toFixed(1).padEnd(6), 'L', s.tone.light, fromHct(s.hue, s.chroma, s.tone.light), ' D', s.tone.dark, fromHct(s.hue, s.chroma, s.tone.dark));
