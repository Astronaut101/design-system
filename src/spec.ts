// Every color decision in the system lives in this file. Values are HCT tones, not hexes:
// tone is perceptual lightness, so a tone difference of 51 guarantees at least 4.5:1 and
// 40 guarantees at least 3:1 regardless of hue.
import { fromHct, toHct } from './hct.ts';
import type { Mode } from './chart-gates.ts';

export const SEED_HEX = '#068B8C';
export const SEED = toHct(SEED_HEX);

export type RampName = 'teal' | 'neutral' | 'red' | 'amber' | 'green' | 'blue' | 'teal-tint' | 'red-tint' | 'amber-tint' | 'green-tint' | 'blue-tint';

// Full chroma at tone 95 reads as neon, so quiet backgrounds get their own low-chroma ramps.
const TINT_CHROMA = 16;

export const RAMPS: Record<RampName, { hue: number; chroma: number; note: string; tint?: boolean }> = {
  teal: { hue: SEED.hue, chroma: SEED.chroma, note: 'Brand accent, hue and chroma from #068B8C' },
  neutral: { hue: SEED.hue, chroma: 3, note: 'Surfaces and text, faintly tinted with the brand hue' },
  // Status hues are fixed, not harmonized with the seed: harmonizing pushes success
  // into the accent and danger toward orange.
  red: { hue: 25, chroma: 84, note: 'Danger' },
  amber: { hue: 80, chroma: 60, note: 'Warning' },
  green: { hue: 145, chroma: 70, note: 'Success, 52 degrees clear of the accent' },
  blue: { hue: 268, chroma: 60, note: 'Info' },
  'teal-tint': { hue: SEED.hue, chroma: TINT_CHROMA, note: 'Accent tint', tint: true },
  'red-tint': { hue: 25, chroma: TINT_CHROMA, note: 'Danger tint', tint: true },
  'amber-tint': { hue: 80, chroma: TINT_CHROMA, note: 'Warning tint', tint: true },
  'green-tint': { hue: 145, chroma: TINT_CHROMA, note: 'Success tint', tint: true },
  'blue-tint': { hue: 268, chroma: TINT_CHROMA, note: 'Info tint', tint: true },
};

// Near white, full chroma turns neon. Teal is capped here; red, amber, green and blue need
// their chroma at these tones for status fills, and their subtle backgrounds use tint ramps.
export const taperedChroma = (chroma: number, tone: number) => Math.min(chroma, (100 - tone) * 2);

// The same stops for every ramp, light to dark, matching Material's tonal palettes. Tokens may also
// use tones between these where contrast needs it, and those stay available as extra stops.
export const RAMP_STOPS = [100, 99, 98, 95, 90, 80, 70, 60, 50, 40, 35, 30, 25, 20, 15, 10, 5, 0];

export interface RoleSpec {
  ramp: RampName;
  light: number;
  dark: number;
  note: string;
  /** Opacity per mode, for tokens that sit on top of whatever surface is underneath. */
  alpha?: [number, number];
}

const neutral = (light: number, dark: number, note: string, alpha?: [number, number]): RoleSpec => ({ ramp: 'neutral', light, dark, note, alpha });
const teal = (light: number, dark: number, note: string): RoleSpec => ({ ramp: 'teal', light, dark, note });

// Tokens are named for the property they color, so a text token can't be used as a background.
// Tailwind maps each family to its own namespace: fg to text-*, bg to bg-*, border to border-*.
export const BASE_ROLES: Record<string, RoleSpec> = {
  'fg-default': neutral(10, 94, 'Primary text'),
  'fg-muted': neutral(40, 70, 'Secondary text, captions, placeholders'),
  'fg-disabled': neutral(70, 40, 'Disabled text. Exempt from contrast minimums'),
  'fg-link': teal(40, 80, 'Links'),
  'fg-link-hover': teal(30, 85, 'Links, hovered'),
  'fg-on-inverse': neutral(95, 10, 'Text on the inverse background'),

  'bg-page': neutral(98, 6, 'Page background'),
  'bg-surface': neutral(100, 10, 'Cards and panels'),
  'bg-raised': neutral(100, 15, 'Popovers, menus, dialogs'),
  'bg-sunken': neutral(95, 4, 'Wells, table headers, code blocks'),
  // Translucent, so hover and pressed stay visible on every surface. Limited by text: at more
  // than 11% over bg-sunken, fg-muted and the intent text colors drop below 4.5:1.
  'bg-hover': neutral(10, 94, 'Hovered row or ghost control, on any surface', [0.07, 0.07]),
  'bg-pressed': neutral(10, 94, 'Pressed row or ghost control, on any surface', [0.11, 0.11]),
  'bg-disabled': neutral(94, 17, 'Disabled controls'),
  'bg-inverse': neutral(20, 90, 'Tooltips and toasts'),
  'bg-scrim': neutral(10, 4, 'Backdrop behind dialogs', [0.45, 0.65]),

  'border-default': neutral(90, 22, 'Decorative hairlines and dividers'),
  'border-strong': neutral(55, 50, 'Input and control boundaries, at least 3:1'),
  'border-disabled': neutral(92, 20, 'Disabled controls'),

  focus: teal(48, 80, 'Focus ring on any surface. Always use an outline offset'),
};

export type Intent = 'accent' | 'neutral' | 'danger' | 'warning' | 'success' | 'info';

type Tones = [number, number];

interface IntentTones {
  ramp: RampName;
  tint: RampName;
  emphasis: Tones;
  hover: Tones;
  active: Tones;
  on: Tones;
  muted: Tones;
  mutedHover: Tones;
  /** Neutral text and borders are the base fg-* and border-* tokens. */
  fg?: Tones;
  border?: Tones;
  borderMuted?: Tones;
}

const QUIET = { muted: [95, 20], mutedHover: [92, 25] } satisfies Partial<IntentTones>;

const INTENTS: Record<Intent, IntentTones> = {
  // T48 gives white text 4.5:1 with a small margin while staying close to the brand's T52.
  // T70 in dark mode keeps the same teal character rather than the paler Material T80.
  accent: { ramp: 'teal', tint: 'teal-tint', emphasis: [48, 70], hover: [44, 75], active: [40, 80], on: [100, 10], fg: [40, 80], border: [50, 60], borderMuted: [80, 35], ...QUIET },
  // Stays gray at every step, for tags, secondary fills and quiet badges. The fill sits well
  // away from the accent's tone, since gray and teal at the same tone look too alike.
  neutral: { ramp: 'neutral', tint: 'neutral', emphasis: [25, 85], hover: [20, 90], active: [15, 94], on: [100, 10], muted: [92, 22], mutedHover: [88, 25] },
  danger: { ramp: 'red', tint: 'red-tint', emphasis: [40, 70], hover: [35, 75], active: [30, 80], on: [100, 10], fg: [40, 80], border: [50, 60], borderMuted: [80, 35], ...QUIET },
  // Amber only works as a light fill in both modes, so it always carries dark text.
  warning: { ramp: 'amber', tint: 'amber-tint', emphasis: [80, 80], hover: [75, 85], active: [70, 90], on: [10, 10], fg: [40, 80], border: [55, 60], borderMuted: [85, 35], ...QUIET },
  // Hue alone cannot clear the accent because green hits the gamut limit at this tone, so
  // the fill also sits further from the accent's tone in both modes.
  success: { ramp: 'green', tint: 'green-tint', emphasis: [35, 78], hover: [30, 82], active: [25, 86], on: [100, 10], fg: [35, 80], border: [50, 60], borderMuted: [80, 35], ...QUIET },
  // Blue sits below the accent's tone in dark mode, for the same reason as success.
  info: { ramp: 'blue', tint: 'blue-tint', emphasis: [40, 62], hover: [35, 67], active: [30, 72], on: [100, 10], fg: [40, 80], border: [50, 60], borderMuted: [80, 35], ...QUIET },
};

export const INTENT_NAMES = Object.keys(INTENTS) as Intent[];

export const intentRoles = (intent: Intent): Record<string, RoleSpec> => {
  const t = INTENTS[intent];
  const role = (ramp: RampName, [light, dark]: Tones, note: string): RoleSpec => ({ ramp, light, dark, note });
  const roles: Record<string, RoleSpec> = {
    [`bg-${intent}-emphasis`]: role(t.ramp, t.emphasis, 'Solid fill'),
    [`bg-${intent}-emphasis-hover`]: role(t.ramp, t.hover, 'Solid fill, hovered'),
    [`bg-${intent}-emphasis-active`]: role(t.ramp, t.active, 'Solid fill, pressed'),
    [`fg-on-${intent}`]: role(t.ramp, t.on, 'Text and icons on the solid fill'),
    [`bg-${intent}-muted`]: role(t.tint, t.muted, 'Quiet background, also used for selected items'),
    [`bg-${intent}-muted-hover`]: role(t.tint, t.mutedHover, 'Quiet background, hovered'),
  };
  if (t.fg) roles[`fg-${intent}`] = role(t.ramp, t.fg, 'Text and icons on surfaces and quiet backgrounds');
  if (t.border) roles[`border-${intent}-emphasis`] = role(t.ramp, t.border, 'Border, at least 3:1');
  if (t.borderMuted) roles[`border-${intent}-muted`] = role(t.ramp, t.borderMuted, 'Decorative border for quiet backgrounds');
  return roles;
};

// Mode-aware because Tailwind's 10% black shadow all but disappears on dark surfaces.
const shadowColor = (light: number, dark: number) => `light-dark(rgb(0 0 0 / ${light}), rgb(0 0 0 / ${dark}))`;

export const ELEVATION: Record<string, string> = {
  raised: `0 1px 3px 0 ${shadowColor(0.1, 0.45)}, 0 1px 2px -1px ${shadowColor(0.1, 0.45)}`,
  overlay: `0 10px 15px -3px ${shadowColor(0.12, 0.55)}, 0 4px 6px -4px ${shadowColor(0.1, 0.55)}`,
};

// Charts --------------------------------------------------------------------------

export const CHART_CHROME: Record<string, RoleSpec> = {
  grid: neutral(92, 20, 'Gridlines, recessive by design'),
  axis: neutral(75, 35, 'Baselines and axis rules'),
};

/** Charts are drawn on the card surface, so that is what palettes are validated against. */
export const chartSurface = (mode: Mode) => {
  const tone = BASE_ROLES['bg-surface'][mode];
  return fromHct(RAMPS.neutral.hue, RAMPS.neutral.chroma, tone);
};

// Light to dark in light mode, flipped in dark mode so high values always stand out from the surface.
export const SEQUENTIAL_TONES: Record<Mode, number[]> = {
  light: [90, 80, 70, 60, 50, 40, 30],
  dark: [25, 35, 45, 55, 65, 75, 85],
};

// Two opposed poles with a neutral midpoint that reads as "nothing".
export const DIVERGING = {
  negative: { hue: 50, chroma: 60, name: 'orange' },
  positive: { hue: SEED.hue, chroma: SEED.chroma, name: 'teal' },
  armTones: { light: [40, 55, 70, 85], dark: [80, 65, 50, 35] } as Record<Mode, number[]>,
  midpointTone: { light: 92, dark: 25 } as Record<Mode, number>,
};
