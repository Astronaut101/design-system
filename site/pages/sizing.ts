import { mountPage } from '../frame.ts';
import { model, pageHead } from '../shared.ts';

const sizingPage = () => {
  const text = model.sizing.filter((t) => /^--text-(xs|sm|base|lg|xl|2xl|3xl)$/.test(t.name));
  const radii = model.sizing.filter((t) => t.group === 'radius');
  const shadows = model.sizing.filter((t) => t.group === 'shadow');
  const toPx = (rem: string) => `${parseFloat(rem) * 16}px`;
  return `
  ${pageHead('Sizing', 'Tailwind v4&rsquo;s scale, unchanged.')}
    <div class="size-grid">
      <div class="oe-card">
        <h2 class="card-title">Spacing</h2>
        ${model.spaceSteps
          .slice(0, 14)
          .map((s) => {
            const name = `--space-${String(s).replace('.', '-')}`;
            return `<div class="space-row"><code>${name}</code><span>${s * 4}px</span><b style="width:calc(var(--spacing) * ${s})"></b></div>`;
          })
          .join('')}
      </div>
      <div class="oe-card">
        <h2 class="card-title">Type scale</h2>
        ${text
          .map((t) => `<div class="type-row"><code>${t.name.replace('--text-', '')} ${toPx(t.value)}</code><div style="font-size:var(${t.name})">Oestergaard</div></div>`)
          .join('')}
      </div>
      <div class="oe-card">
        <h2 class="card-title">Radius</h2>
        <div class="chips">${radii.map((t) => `<div><b style="border-radius:var(${t.name})"></b><code>${t.name.replace('--radius-', '')}</code></div>`).join('')}</div>
      </div>
      <div class="oe-card">
        <h2 class="card-title">Shadow</h2>
        <div class="chips shadow-chip">${Object.keys(model.elevation).map((n) => `<div><b style="box-shadow:var(--shadow-${n})"></b><code>${n}</code></div>`).join('')}${shadows.map((t) => `<div><b style="box-shadow:var(${t.name})"></b><code>${t.name.replace('--shadow-', '')}</code></div>`).join('')}</div>
        <p class="caption breakpoints num">Breakpoints: ${model.sizing.filter((t) => t.group === 'breakpoint').map((t) => `${t.name.replace('--breakpoint-', '')} ${toPx(t.value)}`).join(' · ')}</p>
      </div>
    </div>`;
};

mountPage('sizing', sizingPage());
