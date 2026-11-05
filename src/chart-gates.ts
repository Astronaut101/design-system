import { contrast, deltaE, oklch } from './color-math.ts';

export type Mode = 'light' | 'dark';

// Thresholds for categorical palettes. Delta E is OKLab distance x100.
export const CHART_GATES = {
  // Wider than strictly even lightness: the extra range is what separates the leading slots.
  lightnessBand: { light: [0.4, 0.7], dark: [0.48, 0.8] } as Record<Mode, [number, number]>,
  chromaFloor: 0.1,
  adjacentFloor: 15,
  surfaceContrast: 3,
  // Most charts use few series, so the earliest slots have to be the most distinct.
  leadingFloors: [
    [2, 25],
    [3, 22],
    [4, 18],
    [5, 15],
  ] as [number, number][],
  // Slots 6 to 8 are for stacked and grouped bars with a legend, but still can't merge.
  fullSetFloor: 10,
  // A series must not read as an error or a success. The accent is exempt: teal is the brand.
  statusFloor: 11,
};

/** Any two marks can touch in these slots, so scatter plots stop at this many colors. */
export const PAIRWISE_SLOTS = 5;

/** The smallest color difference between neighboring slots. */
export const minAdjacent = (colors: string[]) =>
  Math.min(...colors.slice(1).map((c, i) => deltaE(colors[i], c)));

/** The smallest color difference between any two of the given colors. */
export const minSeparation = (colors: string[]) => {
  let min = Infinity;
  for (let i = 0; i < colors.length; i++)
    for (let j = i + 1; j < colors.length; j++) min = Math.min(min, deltaE(colors[i], colors[j]));
  return min;
};

export const minFromStatus = (colors: string[], status: string[]) =>
  Math.min(...colors.flatMap((c) => status.map((s) => deltaE(c, s))));

export interface ChartReport {
  mode: Mode;
  surface: string;
  lightnessInBand: boolean;
  chromaAboveFloor: boolean;
  minContrast: number;
  adjacent: number;
  /** Smallest difference among the first N slots, keyed by N. */
  leading: Record<number, number>;
  fullSet: number;
  fromStatus: number;
  pass: boolean;
}

export const reportCategorical = (colors: string[], mode: Mode, surface: string, status: string[]): ChartReport => {
  const [lo, hi] = CHART_GATES.lightnessBand[mode];
  const lightnessInBand = colors.every((c) => {
    const { L } = oklch(c);
    return L >= lo && L <= hi;
  });
  const chromaAboveFloor = colors.every((c) => oklch(c).C >= CHART_GATES.chromaFloor);
  const minContrast = Math.min(...colors.map((c) => contrast(c, surface)));
  const adjacent = minAdjacent(colors);
  const leading = Object.fromEntries(CHART_GATES.leadingFloors.map(([n]) => [n, minSeparation(colors.slice(0, n))]));
  const fullSet = minSeparation(colors);
  const fromStatus = minFromStatus(colors, status);
  return {
    mode,
    surface,
    lightnessInBand,
    chromaAboveFloor,
    minContrast,
    adjacent,
    leading,
    fullSet,
    fromStatus,
    pass:
      lightnessInBand &&
      chromaAboveFloor &&
      minContrast >= CHART_GATES.surfaceContrast &&
      adjacent >= CHART_GATES.adjacentFloor &&
      CHART_GATES.leadingFloors.every(([n, floor]) => leading[n] >= floor) &&
      fullSet >= CHART_GATES.fullSetFloor &&
      fromStatus >= CHART_GATES.statusFloor,
  };
};
