import '../dist/tokens.css';
import './site.css';
import model from '../dist/model.json';
import { contrast } from '../src/color-math.ts';
import { mountCharts } from './charts.ts';
import { mountIconBrowser } from './icon-browser.ts';
import { lucideSvg } from './icons.ts';

type Mode = 'light' | 'dark';
const MODES: Mode[] = ['light', 'dark'];
const INTENTS = ['accent', 'neutral', 'danger', 'warning', 'success', 'info'] as const;
const role = (name: string) => model.roles.find((r) => r.name === name)!;


const NAV = [
  ['overview', 'Overview', 'house'],
  ['start', 'Get started', 'book-open'],
  ['accent', 'Accent', 'pipette'],
  ['roles', 'Color tokens', 'palette'],
  ['status', 'Status and controls', 'toggle-right'],
  ['charts', 'Charts', 'chart-column'],
  ['icons', 'Icons', 'shapes'],
  ['sizing', 'Sizing', 'ruler'],
  ['ramps', 'Tonal ramps', 'blend'],
  ['report', 'Contrast report', 'contrast'],
];

const THEMES = [
  ['auto', 'Match system theme', 'monitor'],
  ['light', 'Light theme', 'sun'],
  ['dark', 'Dark theme', 'moon'],
];

const INTENT_ICONS: Record<string, string> = {
  accent: 'sparkles',
  neutral: 'circle-dashed',
  info: 'info',
  success: 'circle-check',
  warning: 'triangle-exclamation-point',
  danger: 'circle-x',
};

const rampInfo: Record<string, { note: string; tint?: boolean }> = model.rampInfo;
const passCount = model.contrast.filter((c) => c.pass).length;

const statusBadge = (intent: string, label: string) =>
  `<span class="badge" style="background:var(--bg-${intent}-muted);color:var(--fg-${intent === 'neutral' ? 'default' : intent})">${lucideSvg(INTENT_ICONS[intent])}${label}</span>`;

const ORDERS: [string, string, string, string][] = [
  ['2041', 'Nordic Freight', 'success', 'Paid'],
  ['2040', 'Fjord Marine', 'warning', 'Due soon'],
  ['2039', 'Havn Logistics', 'danger', 'Overdue'],
  ['2038', 'Bakke Byg', 'info', 'Draft'],
];

const WEEKLY_ORDERS = [42, 48, 45, 55, 52, 60, 58, 66, 63, 70, 74, 78];

const mockApp = (mode: Mode) => `
  <div class="mode-panel mock" data-theme="${mode}">
    <nav class="mock-nav" aria-label="Example app, ${mode} mode">
      <b><span class="brand-mark"></span>Orders</b>
      <span class="on">${lucideSvg('house')}Overview</span><span>${lucideSvg('user')}Customers</span><span>${lucideSvg('file')}Invoices</span><span>${lucideSvg('settings')}Settings</span>
    </nav>
    <div class="mock-main">
      <div class="mock-head"><h4>Overview</h4><button class="btn btn-primary" type="button">${lucideSvg('plus')}New order</button></div>
      <dl class="tiles">
        <div class="tile"><dt>Revenue</dt><dd>$40.1K</dd><small style="color:var(--fg-success)">${lucideSvg('arrow-up')}+12%</small></div>
        <div class="tile"><dt>Open orders</dt><dd>128</dd><small style="color:var(--fg-muted)">${lucideSvg('arrow-up')}+4</small></div>
        <div class="tile"><dt>Overdue</dt><dd>3</dd><small style="color:var(--fg-danger)">${lucideSvg('arrow-up')}+1</small></div>
      </dl>
      <figure class="mini-chart" role="img" aria-label="Orders per week, rising from ${WEEKLY_ORDERS[0]} to ${WEEKLY_ORDERS.at(-1)}. Sample data.">
        <figcaption>Orders per week</figcaption>
        <div class="bars">${WEEKLY_ORDERS.map((v) => `<i style="height:${v}%"></i>`).join('')}</div>
      </figure>
      <div class="mock-table">
        <table>
          <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Status</th></tr></thead>
          <tbody>${ORDERS.map(([id, who, intent, label]) => `<tr><td class="num">${id}</td><td>${who}</td><td>${statusBadge(intent, label)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>
  </div>`;

const overview = () => `
  <section id="overview">
    <div class="hero">
      <h1>One brand color, every app</h1>
      <p class="lead">Color, chart, icon and sizing tokens for every Oestergaard-AS app, in any framework.</p>
      <div class="row">
        <a class="btn btn-primary" href="#start">Get started</a>
        <a class="btn btn-secondary" href="#roles">Browse tokens</a>
      </div>
    </div>
    <div class="mode-pair hero-mocks">${MODES.map(mockApp).join('')}</div>
    <p class="caption hero-caption">Sample data.</p>
    <dl class="stats">
      <div><dt>Color tokens</dt><dd>${model.roles.length}</dd></div>
      <div><dt>Contrast pairs passing</dt><dd>${passCount}/${model.contrast.length}</dd></div>
      <div><dt>Chart colors</dt><dd>${model.chart.categorical.light.length}</dd></div>
      <div><dt>Icon sizes</dt><dd>${Object.keys(model.iconSizes).length}</dd></div>
    </dl>
  </section>`;

const code = (src: string) => {
  const esc = src.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return `<div class="code-block"><button class="code-copy" type="button" data-copy-code>${lucideSvg('copy')}Copy</button><pre><code>${esc}</code></pre></div>`;
};

const USAGE_TABS: [string, string, string][] = [
  [
    'css',
    'CSS variables',
    `${code(`@import "@oestergaard/design-tokens/tokens.css";

.button {
  background: var(--bg-accent-emphasis);
  color: var(--fg-on-accent);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
}
.button:hover { background: var(--bg-accent-emphasis-hover); }`)}`,
  ],
  [
    'tailwind',
    'Tailwind v4',
    `${code(`@import "tailwindcss";
@import "@oestergaard/design-tokens/tailwind.css";`)}
    ${code(`<button class="bg-accent-emphasis text-on-accent hover:bg-accent-emphasis-hover px-4 py-2 rounded-md text-sm">
  Save changes
</button>
<p class="text-muted">Secondary text</p>`)}`,
  ],
  [
    'native',
    'Charts and native',
    `${code(`import { chart } from "@oestergaard/design-tokens";

// Libraries that draw to canvas can't read CSS variables.
const mode = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
echarts.init(el).setOption({ color: chart.categorical[mode] });`)}`,
  ],
];

const startSection = () => `
  <section id="start">
    <div class="section-head">
      <h2>Get started</h2>
      <p>One package for any framework.</p>
    </div>
    <div class="usage-grid">
      ${code('npm install ../oe-design-system')}
      <div>
        <div class="tabs" role="tablist" aria-label="Ways to use the tokens">
          ${USAGE_TABS.map(([id, label], i) => `<button type="button" role="tab" id="tab-${id}" aria-controls="panel-${id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${label}</button>`).join('')}
        </div>
        ${USAGE_TABS.map(([id, , body], i) => `<div role="tabpanel" id="panel-${id}" aria-labelledby="tab-${id}"${i === 0 ? '' : ' hidden'}>${body}</div>`).join('')}
      </div>
    </div>
  </section>`;

const accentSection = () => {
  const a = role('bg-accent-emphasis');
  const on = role('fg-on-accent');
  const cards = [
    { title: 'Light accent', theme: 'light', hex: a.light.hex, text: on.light.hex },
    { title: 'Dark accent', theme: 'dark', hex: a.dark.hex, text: on.dark.hex },
  ];
  return `
  <section id="accent">
    <div class="section-head">
      <h2>Accent</h2>
      <p>Derived from ${model.seed.hex} for each mode.</p>
    </div>
    <div class="accent-grid">
      ${cards
        .map(
          (c) => `<div class="accent-card" data-theme="${c.theme}">
            <div class="accent-fill" style="background:${c.hex};color:${c.text}">Save changes</div>
            <div class="accent-body">
              <h3>${c.title}</h3>
              <button class="copy-hex" type="button" data-copy="${c.hex}" aria-label="Copy ${c.hex}">${c.hex}</button>
            </div>
          </div>`,
        )
        .join('')}
    </div>
  </section>`;
};

// One block per token, labeled in the color it pairs with, so the map also teaches the pairings.
const mapCell = (name: string, label: string, style: string, modifier = '') =>
  model.roles.some((r) => r.name === name)
    ? `<button class="map-cell ${modifier}" type="button" data-copy="var(--${name})" title="--${name}" aria-label="Copy --${name}" style="${style}">${label}</button>`
    : `<span class="map-cell map-empty ${modifier}"></span>`;

const intentColumn = (i: string) => {
  const fill = (name: string, label: string, modifier = '') => mapCell(name, label, `background:var(--${name});color:var(--fg-on-${i})`, modifier);
  const quiet = (name: string, label: string, modifier = '') => mapCell(name, label, `background:var(--${name});color:var(--fg-${i === 'neutral' ? 'default' : i})`, modifier);
  const edge = (name: string, label: string) => mapCell(name, label, `background:var(--bg-surface);border-color:var(--${name})`, 'map-edge');
  return `<div class="map-column">
    <h4>${i[0].toUpperCase() + i.slice(1)}</h4>
    ${fill(`bg-${i}-emphasis`, 'Emphasis', 'map-tall')}
    ${fill(`bg-${i}-emphasis-hover`, 'Hover')}
    ${fill(`bg-${i}-emphasis-active`, 'Active')}
    ${mapCell(`fg-on-${i}`, 'On fill', `background:var(--fg-on-${i});color:var(--bg-${i}-emphasis)`)}
    ${quiet(`bg-${i}-muted`, 'Muted', 'map-tall')}
    ${quiet(`bg-${i}-muted-hover`, 'Muted hover')}
    ${mapCell(`fg-${i}`, 'Text', `background:var(--bg-surface);color:var(--fg-${i})`)}
    ${edge(`border-${i}-emphasis`, 'Border')}
    ${edge(`border-${i}-muted`, 'Muted border')}
  </div>`;
};

const mapGroup = (title: string, cells: string[]) => `
  <div class="map-group" style="--blocks:${cells.length}">
    <h4>${title}</h4>
    <div class="map-blocks">${cells.join('')}</div>
  </div>`;

const baseGroups = () => {
  const surface = (name: string, modifier = '') => mapCell(name, name, `background:var(--${name});color:var(--fg-default)`, modifier);
  const state = (name: string, text = 'fg-default') => mapCell(name, name, `background:linear-gradient(var(--${name}),var(--${name})),var(--bg-surface);color:var(--${text})`);
  const ink = (name: string) => mapCell(name, name, `background:var(--bg-surface);color:var(--${name})`);
  const edge = (name: string) => mapCell(name, name, `background:var(--bg-surface);border-color:var(--${name})`, 'map-edge');
  return [
    mapGroup('Surfaces', [surface('bg-sunken'), surface('bg-page'), surface('bg-surface'), surface('bg-raised', 'map-raised')]),
    mapGroup('States', [state('bg-hover'), state('bg-pressed'), state('bg-disabled', 'fg-disabled')]),
    mapGroup('Overlays', [
      mapCell('bg-inverse', 'bg-inverse', 'background:var(--bg-inverse);color:var(--fg-on-inverse)'),
      mapCell('fg-on-inverse', 'fg-on-inverse', 'background:var(--fg-on-inverse);color:var(--bg-inverse)'),
      mapCell('bg-scrim', '<span>bg-scrim</span>', 'background:linear-gradient(var(--bg-scrim),var(--bg-scrim)),var(--bg-surface)', 'map-scrim'),
    ]),
    mapGroup('Text', [ink('fg-default'), ink('fg-muted'), ink('fg-disabled'), ink('fg-link'), ink('fg-link-hover')]),
    mapGroup('Borders and focus', [edge('border-default'), edge('border-strong'), edge('border-disabled'), mapCell('focus', 'focus', 'background:var(--bg-surface);outline:2px solid var(--focus);outline-offset:-4px')]),
  ].join('');
};

const roleMap = (mode: Mode) => `
  <div class="mode-panel role-map" data-theme="${mode}">
    <p class="mode-label">${mode === 'light' ? 'Light' : 'Dark'}</p>
    <div class="map-columns">${INTENTS.map(intentColumn).join('')}</div>
    <div class="map-groups">${baseGroups()}</div>
  </div>`;

const rolesSection = () => `
  <section id="roles">
    <div class="section-head">
      <h2>Color tokens</h2>
      <p>Click a block to copy its token.</p>
    </div>
    <div class="stack">${MODES.map(roleMap).join('')}</div>
  </section>`;

const ALERTS: [string, string, string][] = [
  ['info', 'Scheduled maintenance', 'Unavailable Sunday from 02:00 to 03:00.'],
  ['success', 'Invoice sent', 'Invoice 2041 is on its way.'],
  ['warning', 'Certificate expiring', 'Renew it within 14 days.'],
  ['danger', 'Payment failed', 'Check the card details and try again.'],
];

const alert = ([intent, title, body]: [string, string, string]) => `
  <div class="alert" role="group" style="background:var(--bg-${intent}-muted);border-color:var(--border-${intent}-muted)">
    <span style="color:var(--fg-${intent});display:flex">${lucideSvg(INTENT_ICONS[intent])}</span>
    <p><strong>${title}.</strong> ${body}</p>
  </div>`;

const statusSection = () => `
  <section id="status">
    <div class="section-head">
      <h2>Status and controls</h2>
      <p>Examples built from the tokens.</p>
    </div>
    <div class="size-grid">
      <div class="size-card demo">
        <h3>Buttons</h3>
        <div class="stack demo-stack">
          <div class="row">
            <button class="btn btn-primary" type="button">${lucideSvg('save')}Save changes</button>
            <button class="btn btn-secondary" type="button">Cancel</button>
            <button class="btn btn-ghost" type="button">Learn more</button>
            <button class="btn btn-secondary btn-icon" type="button" aria-label="More options" title="More options">${lucideSvg('ellipsis')}</button>
          </div>
          <div class="row">
            <button class="btn btn-neutral" type="button">Neutral</button>
            <button class="btn btn-danger" type="button">${lucideSvg('trash')}Delete</button>
            <button class="btn" disabled type="button">Disabled</button>
            <a href="#status">Text link</a>
          </div>
        </div>
      </div>
      <div class="size-card demo">
        <h3>Badges</h3>
        <div class="row">
          ${statusBadge('success', 'Paid')}${statusBadge('warning', 'Due soon')}${statusBadge('danger', 'Overdue')}${statusBadge('info', 'Draft')}${statusBadge('accent', 'New')}${statusBadge('neutral', 'Archived')}
        </div>
      </div>
      <div class="size-card demo">
        <h3>Alerts</h3>
        <div class="stack demo-stack">${ALERTS.map(alert).join('')}</div>
      </div>
      <div class="size-card demo">
        <h3>Form fields</h3>
        <div class="stack demo-stack">
          <label class="field"><span>Name</span><input placeholder="Placeholder text" /></label>
          <label class="field"><span>Focused</span><input class="is-focus" value="Focus ring" /></label>
          <label class="field"><span>Email</span><input class="is-error" value="not-an-email" aria-invalid="true" /><small>${lucideSvg('circle-x')}Enter a valid email address</small></label>
        </div>
      </div>
      <div class="size-card demo">
        <h3>Interaction states</h3>
        <div class="state-grid" aria-label="Interaction states on each surface">
          ${[
            ['Page', 'bg-page'],
            ['Surface', 'bg-surface'],
            ['Raised', 'bg-raised'],
            ['Sunken', 'bg-sunken'],
          ]
            .map(
              ([label, plane]) => `<div class="state-plane" style="background:var(--${plane})">
                <span>${label}</span>
                <span class="state-item">Rest</span>
                <span class="state-item is-hover">Hover</span>
                <span class="state-item is-pressed">Pressed</span>
                <span class="state-item is-selected">Selected</span>
              </div>`,
            )
            .join('')}
        </div>
      </div>
      <div class="size-card demo">
        <h3>Overlays</h3>
        <div class="stack demo-stack">
          <div class="scrim-demo">
            <div class="scrim"></div>
            <div class="dialog"><strong>Delete this order?</strong><div class="row"><button class="btn btn-danger" type="button">${lucideSvg('trash')}Delete</button><button class="btn btn-secondary" type="button">Cancel</button></div></div>
          </div>
          <div class="row"><span class="inverse-chip">${lucideSvg('circle-check')}Order saved</span></div>
        </div>
      </div>
    </div>
  </section>`;

const chartsSection = () => `
  <section id="charts">
    <div class="section-head">
      <h2>Charts</h2>
      <p>Eight colors in a fixed order.</p>
    </div>
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
    <div class="chart-grid" id="chart-grid"></div>
  </section>`;

const iconsSection = () => `
  <section id="icons">
    <div class="section-head">
      <h2>Icons</h2>
      <p><a href="https://lucide.dev">Lucide</a>. Click an icon to copy its name.</p>
    </div>
    <div class="stack">
      <div class="size-card" id="icon-browser"></div>
      <div class="size-card">
        <h3>Sizes</h3>
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
    </div>
  </section>`;

const sizingSection = () => {
  const text = model.sizing.filter((t) => /^--text-(xs|sm|base|lg|xl|2xl|3xl)$/.test(t.name));
  const radii = model.sizing.filter((t) => t.group === 'radius');
  const shadows = model.sizing.filter((t) => t.group === 'shadow');
  const toPx = (rem: string) => `${parseFloat(rem) * 16}px`;
  return `
  <section id="sizing">
    <div class="section-head">
      <h2>Sizing</h2>
      <p>Tailwind v4's scale, unchanged.</p>
    </div>
    <div class="size-grid">
      <div class="size-card">
        <h3>Spacing</h3>
        ${model.spaceSteps
          .slice(0, 14)
          .map((s) => {
            const name = `--space-${String(s).replace('.', '-')}`;
            return `<div class="space-row"><code>${name}</code><span>${s * 4}px</span><b style="width:calc(var(--spacing) * ${s})"></b></div>`;
          })
          .join('')}
      </div>
      <div class="size-card">
        <h3>Type scale</h3>
        ${text
          .map((t) => `<div class="type-row"><code>${t.name.replace('--text-', '')} ${toPx(t.value)}</code><div style="font-size:var(${t.name})">Oestergaard</div></div>`)
          .join('')}
      </div>
      <div class="size-card">
        <h3>Radius</h3>
        <div class="chips">${radii.map((t) => `<div><b style="border-radius:var(${t.name})"></b><code>${t.name.replace('--radius-', '')}</code></div>`).join('')}</div>
      </div>
      <div class="size-card">
        <h3>Shadow</h3>
        <div class="chips shadow-chip">${Object.keys(model.elevation).map((n) => `<div><b style="box-shadow:var(--shadow-${n})"></b><code>${n}</code></div>`).join('')}${shadows.map((t) => `<div><b style="box-shadow:var(${t.name})"></b><code>${t.name.replace('--shadow-', '')}</code></div>`).join('')}</div>
        <p class="caption breakpoints num">Breakpoints: ${model.sizing.filter((t) => t.group === 'breakpoint').map((t) => `${t.name.replace('--breakpoint-', '')} ${toPx(t.value)}`).join(' · ')}</p>
      </div>
    </div>
  </section>`;
};

const rampsSection = () => {
  const cell = (ramp: string, tone: string, hex: string) => {
    const onWhite = contrast(hex, '#ffffff');
    const onDark = contrast(hex, '#000000');
    const text = onWhite > onDark ? 'white' : 'black';
    return `<button type="button" data-copy="var(--ramp-${ramp}-${tone})" title="--ramp-${ramp}-${tone} ${hex}" aria-label="Copy --ramp-${ramp}-${tone}" style="background:${hex};color:${text}">${tone}</button>`;
  };
  const row = ([name, stops]: [string, Record<string, string>]) => `<div class="ramp">
      <strong title="${rampInfo[name].note}">${name}</strong>
      <div class="ramp-cells">${model.rampStops.map((tone) => cell(name, String(tone), stops[tone])).join('')}</div>
    </div>`;
  const ramps: [string, Record<string, string>][] = Object.entries(model.ramps);
  return `
  <section id="ramps">
    <div class="section-head">
      <h2>Tonal ramps</h2>
      <p>What the tokens are built from.</p>
    </div>
    <div class="ramps">${ramps.filter(([name]) => !rampInfo[name].tint).map(row).join('')}</div>
    <h3 class="ramps-sub">Tints</h3>
    <div class="ramps">${ramps.filter(([name]) => rampInfo[name].tint).map(row).join('')}</div>
  </section>`;
};

const reportSection = () => {
  const sorted = [...model.contrast].sort((a, b) => a.ratio / a.min - b.ratio / b.min);
  const row = (c: (typeof sorted)[number]) => `<tr>
    <td><span class="aa" style="background:${c.bgHex};color:${c.fgHex}">Aa</span></td>
    <td class="mono" style="font-size:var(--text-xs)">${c.fg}</td>
    <td class="mono" style="font-size:var(--text-xs)">${c.bg}</td>
    <td>${c.mode}</td>
    <td class="num">${c.ratio.toFixed(2)}:1</td>
    <td class="num">${c.min}:1</td>
    <td>${c.pass ? `<span class="pass-mark">${lucideSvg('circle-check')}Pass</span>` : `<span class="fail-mark">${lucideSvg('circle-x')}Fail</span>`}</td>
  </tr>`;
  const allPass = passCount === model.contrast.length;
  return `
  <section id="report">
    <div class="section-head">
      <h2>Contrast report</h2>
      <p>Measured on every build.</p>
    </div>
    <div class="report-grid">
      <div class="size-card report-score">
        <span style="color:var(--fg-${allPass ? 'success' : 'danger'});display:flex;--ic-size:var(--space-8)">${lucideSvg(allPass ? 'circle-check' : 'circle-x')}</span>
        <strong class="num">${passCount}/${model.contrast.length}</strong>
        <span class="note">pairs pass, in light and dark</span>
      </div>
      <div class="size-card">
        <h3>Tightest pairs</h3>
        <div class="pair-grid">
          ${sorted
            .slice(0, 6)
            .map(
              (c) => `<div class="pair">
                <span class="aa aa-lg" style="background:${c.bgHex};color:${c.fgHex}">Aa</span>
                <span class="pair-text"><b class="num">${c.ratio.toFixed(2)}:1</b> <small>needs ${c.min}:1, ${c.mode}</small><code>${c.fg}</code></span>
              </div>`,
            )
            .join('')}
        </div>
      </div>
    </div>
    <details class="report">
      <summary>Show all ${model.contrast.length} pairs</summary>
      <div class="table-scroll"><table class="role-table">
        <thead><tr><th scope="col">Sample</th><th scope="col">Foreground</th><th scope="col">Background</th><th scope="col">Mode</th><th scope="col">Ratio</th><th scope="col">Needs</th><th scope="col">Result</th></tr></thead>
        <tbody>${sorted.map(row).join('')}</tbody>
      </table></div>
    </details>
  </section>`;
};

// Page -----------------------------------------------------------------------------
const app = document.querySelector<HTMLElement>('#app')!;
app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="#overview"><span class="brand-mark"></span>Oestergaard <small>design system v0.1</small></a>
    <div class="segmented" role="group" aria-label="Color theme">
      ${THEMES.map(([theme, label, name]) => `<button type="button" data-set-theme="${theme}" aria-label="${label}" title="${label}">${lucideSvg(name)}</button>`).join('')}
    </div>
  </header>
  <div class="layout">
    <nav class="sidenav" aria-label="Sections"><ul>${NAV.map(([id, label, name]) => `<li><a href="#${id}">${lucideSvg(name)}${label}</a></li>`).join('')}</ul></nav>
    <main id="main">
      ${overview()}${startSection()}${accentSection()}${rolesSection()}${statusSection()}${chartsSection()}${iconsSection()}${sizingSection()}${rampsSection()}${reportSection()}
    </main>
  </div>`;

mountCharts(document.querySelector<HTMLElement>('#chart-grid')!);
mountIconBrowser(document.querySelector<HTMLElement>('#icon-browser')!);

// Theme switch
const themeButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-set-theme]')];
const applyTheme = (theme: string) => {
  if (theme === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  themeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setTheme === theme)));
  try {
    if (theme === 'auto') localStorage.removeItem('oe-theme');
    else localStorage.setItem('oe-theme', theme);
  } catch {
    // Storage can be blocked. The theme still applies for this visit.
  }
};
applyTheme(document.documentElement.dataset.theme ?? 'auto');
themeButtons.forEach((b) => b.addEventListener('click', () => applyTheme(b.dataset.setTheme!)));

// Usage tabs
const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
const selectTab = (selected: HTMLButtonElement) => {
  tabs.forEach((tab) => {
    const on = tab === selected;
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')!)!.hidden = !on;
  });
};
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (e) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    const next = tabs[(i + step + tabs.length) % tabs.length];
    selectTab(next);
    next.focus();
  });
});

// Copy
const toast = document.querySelector<HTMLElement>('#toast')!;
let toastTimer = 0;
const copy = async (text: string) => {
  let message = `Copied ${text}`;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    message = 'Copy is blocked in this browser';
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 1600);
};
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const copyable = target.closest<HTMLElement>('[data-copy]');
  if (copyable) copy(copyable.dataset.copy!);
  const codeBtn = target.closest<HTMLElement>('[data-copy-code]');
  if (codeBtn) copy(codeBtn.parentElement!.querySelector('code')!.textContent!);
  if (target.closest('.demo a')) e.preventDefault();
});

// Current section in the nav
const sidenav = document.querySelector<HTMLElement>('.sidenav')!;
const links = new Map([...document.querySelectorAll<HTMLAnchorElement>('.sidenav a')].map((a) => [a.getAttribute('href')!.slice(1), a]));
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      links.forEach((a) => a.removeAttribute('aria-current'));
      const current = links.get(entry.target.id);
      current?.setAttribute('aria-current', 'true');
      // Horizontal only: scrollIntoView here would drag the page back to the sticky nav.
      if (current) sidenav.scrollLeft = current.offsetLeft - sidenav.offsetLeft - 16;
    }
  },
  { rootMargin: '-20% 0px -70% 0px' },
);
document.querySelectorAll('main section').forEach((s) => observer.observe(s));
