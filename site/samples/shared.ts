import { code, lucideSvg } from '../shared.ts';
import { templateSource } from '../template-source.ts';
import type { TemplateId } from '../nav.ts';

export const CATEGORIES = ['Actions', 'Forms', 'Data display', 'Navigation', 'Feedback', 'Overlays', 'Content', 'Layout', 'Chat'] as const;
export type Category = (typeof CATEGORIES)[number];
export type Sample = { id: string; title: string; category: Category; description: string; markup: string; wide?: boolean };
export const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
export const icon = lucideSvg;
export const button = (label: string, attrs = '', variant = 'secondary') => `<button class="oe-btn oe-btn-${variant}" type="button" ${attrs}>${label}</button>`;
export const sampleHtml = (sample: Sample) => `<article class="oe-card demo sample${sample.wide ? ' sample-wide' : ''}" id="${sample.id}"><h2 class="card-title">${sample.title}</h2><p class="sample-description">${sample.description}</p><div class="sample-body">${sample.markup}</div><details class="sample-code"><summary>Usage markup</summary>${code(sample.markup)}</details></article>`;
export const templatePart = (id: TemplateId, selector: string) => {
  const doc = new DOMParser().parseFromString(templateSource(id), 'text/html');
  doc.querySelectorAll<HTMLElement>('[data-lucide]').forEach(node => { node.outerHTML = icon(node.dataset.lucide!); });
  return doc.querySelector(selector)!.outerHTML;
};
export const mountComparison = (root: ParentNode) => {
  root.querySelectorAll<HTMLElement>('[data-comparison-demo]').forEach(demo => {
    demo.querySelector<HTMLInputElement>('[data-best-toggle]')!.addEventListener('change', event => {
      demo.querySelector('table')!.setAttribute('data-highlight', String((event.target as HTMLInputElement).checked));
    });
    demo.querySelectorAll<HTMLElement>('[data-choose-tool]').forEach(button => button.addEventListener('click', () => {
      demo.querySelector('[data-choice-status]')!.textContent = `${button.dataset.chooseTool} selected. Your choice is ready to review.`;
      demo.querySelectorAll<HTMLElement>('[data-choose-tool]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    }));
  });
};
