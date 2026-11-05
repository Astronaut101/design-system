import { Hct, argbFromHex, hexFromArgb } from '@material/material-color-utilities';

export interface HctValue {
  hue: number;
  chroma: number;
  tone: number;
}

export const toHct = (hex: string): HctValue => {
  const c = Hct.fromInt(argbFromHex(hex));
  return { hue: c.hue, chroma: c.chroma, tone: c.tone };
};

/** Tone is exact. Chroma is reduced to the sRGB gamut limit when the request exceeds it. */
export const fromHct = (hue: number, chroma: number, tone: number): string =>
  hexFromArgb(Hct.from(hue, chroma, tone).toInt());
