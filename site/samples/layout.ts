import { mountComparison, templatePart, type Sample } from './shared.ts';
export const layoutSamples = (): Sample[] => [
  { id: 'comparison-table', title: 'Comparison table', category: 'Data display', wide: true, description: 'A transposed table uses row and column headers, grouped criteria, a sticky label column and optional best-value emphasis. Values are fictional.', markup: templatePart('comparison', '[data-comparison-demo]') },
  { id: 'app-shell', title: 'App shell', category: 'Layout', wide: true, description: 'Five isolated documents demonstrate the package shell. Resize the browser to try mobile navigation; sidebar variants include working collapse controls.', markup: `<div class="stack">${[['content','Content only'],['top','Top navigation only'],['side','Side navigation only'],['combined','Top and side navigation'],['banner','With banner']].map(([mode,label]) => `<div><h3>${label}</h3><iframe class="demo-shell-frame" data-shell-frame="../layout/dashboard/?shell=${mode}" title="${label} app shell" loading="lazy"></iframe></div>`).join('')}</div>` },
];
export function mountLayoutSamples(root: ParentNode) {
  mountComparison(root);
  // Defer frames in collapsed categories until their examples are opened.
  root.querySelectorAll<HTMLIFrameElement>('[data-shell-frame]').forEach(frame => {
    const category = frame.closest<HTMLDetailsElement>('.component-category');
    const detail = frame.closest<HTMLElement>('[data-component-detail]');
    const load = () => { if ((category?.open || (detail && !detail.hidden)) && !frame.hasAttribute('src')) frame.src = frame.dataset.shellFrame!; };
    category?.addEventListener('toggle', load); detail?.addEventListener('component:show', load); load();
  });
}
