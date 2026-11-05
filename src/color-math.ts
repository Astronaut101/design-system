// Pure color math with no dependencies, so the showcase site can use it in the browser too.

export type Rgb = [number, number, number];

export const hexToRgb = (hex: string): Rgb => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as Rgb;
};

/** The opaque color you see when `fg` at `alpha` sits on top of `bg`. */
export const composite = (fg: string, alpha: number, bg: string): string => {
  const [f, b] = [hexToRgb(fg), hexToRgb(bg)];
  const channels = f.map((c, i) => Math.round((c * alpha + b[i] * (1 - alpha)) * 255));
  return '#' + channels.map((c) => c.toString(16).padStart(2, '0')).join('');
};

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linear = (hex: string) => hexToRgb(hex).map(toLinear) as Rgb;

const luminance = (hex: string) => {
  const [r, g, b] = linear(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG 2 contrast ratio. */
export const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const oklabFromLinear = ([r, g, b]: Rgb): Rgb => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

export const oklch = (hex: string) => {
  const [L, a, b] = oklabFromLinear(linear(hex));
  return { L, C: Math.hypot(a, b), H: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360 };
};

/** Euclidean OKLab distance x100. */
export const deltaE = (a: string, b: string): number => {
  const p = oklabFromLinear(linear(a));
  const q = oklabFromLinear(linear(b));
  return 100 * Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
};
