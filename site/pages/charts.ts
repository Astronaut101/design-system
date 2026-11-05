import { mountCharts } from '../charts.ts';
import { mountPage } from '../frame.ts';
import { MODES, model, pageHead } from '../shared.ts';

const chartsPage = () => `
  ${pageHead('Charts', 'Eight colors in a fixed order.')}
    <div class="mode-pair">
      ${MODES.map((mode) => `<div class="mode-panel" data-theme="${mode}" style="background:var(--bg-surface)">
          <p class="mode-label">${mode === 'light' ? 'Light' : 'Dark'}</p>
          <div class="palette-chips">
            ${model.chart.categorical[mode]
              .map(
                (c, i) => `<button type="button" data-copy="var(--chart-${i + 1})" title="Copy --chart-${i + 1}"><i style="background:${c}"></i><span>${i + 1} ${model.chart.names[i]}</span><span class="mono">${c}</span></button>`,
              )
              .join('')}
          </div>
        </div>`).join('')}
    </div>
    <div class="chart-grid" id="chart-grid"></div>`;

mountPage('charts', chartsPage());
mountCharts(document.querySelector<HTMLElement>('#chart-grid')!);
