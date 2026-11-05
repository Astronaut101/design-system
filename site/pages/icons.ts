import { mountPage } from '../frame.ts';
import { mountIconBrowser } from '../icon-browser.ts';
import { lucideSvg, model, pageHead } from '../shared.ts';

const iconsPage = () => `
  ${pageHead('Icons', '<a href="https://lucide.dev">Lucide</a>. Click an icon to copy its name.')}
    <div class="stack">
      <div class="oe-card" id="icon-browser"></div>
      <div class="oe-card">
        <h2 class="card-title">Sizes</h2>
        <div class="icon-sizes">
          ${Object.entries(model.iconSizes)
            .map(
              ([size, step]) => `<div>
                <span class="icon-size-box" style="--ic-size:var(--space-${step})">${lucideSvg('circle-check')}</span>
                <span><b>${size}</b> ${step * 4}px</span>
              </div>`,
            )
            .join('')}
        </div>
      </div>
    </div>`;

mountPage('icons', iconsPage());
mountIconBrowser(document.querySelector<HTMLElement>('#icon-browser')!);
