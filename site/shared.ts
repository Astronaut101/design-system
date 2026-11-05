import model from '../dist/model.json';
import { lucideSvg } from './icons.ts';

export { lucideSvg, model };

export type Mode = 'light' | 'dark';
export const MODES: Mode[] = ['light', 'dark'];

export const INTENT_ICONS: Record<string, string> = {
  accent: 'sparkles',
  neutral: 'circle-dashed',
  info: 'info',
  success: 'circle-check',
  warning: 'triangle-exclamation-point',
  danger: 'circle-x',
};

export const statusBadge = (intent: string, label: string) =>
  `<span class="oe-badge oe-badge-${intent}">${lucideSvg(INTENT_ICONS[intent])}${label}</span>`;

export const code = (src: string) => {
  const esc = src.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return `<div class="code-block"><button class="oe-btn oe-btn-secondary oe-btn-sm code-copy" type="button" data-copy-code>${lucideSvg('copy')}Copy</button><pre><code>${esc}</code></pre></div>`;
};

export const pageHead = (title: string, subtitle: string) => `
  <header class="oe-page-head">
    <div>
      <h1 class="oe-page-title">${title}</h1>
      <p class="oe-page-subtitle">${subtitle}</p>
    </div>
  </header>`;
