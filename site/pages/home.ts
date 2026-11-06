import { version } from '../../package.json';
import { mountPage } from '../frame.ts';
import { MODES, code, lucideSvg, model, statusBadge, type Mode } from '../shared.ts';

const passCount = model.contrast.filter((c) => c.pass).length;

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
      <span class="oe-nav-item" aria-current="page">${lucideSvg('house')}Overview</span><span class="oe-nav-item">${lucideSvg('user')}Customers</span><span class="oe-nav-item">${lucideSvg('file')}Invoices</span><span class="oe-nav-item">${lucideSvg('settings')}Settings</span>
    </nav>
    <div class="mock-main">
      <div class="mock-head"><p class="mock-title">Overview</p><button class="oe-btn oe-btn-primary" type="button">${lucideSvg('plus')}New order</button></div>
      <dl class="oe-stat-grid">
        <div class="oe-stat"><dt class="oe-stat-label">Revenue</dt><dd class="oe-stat-value">$40.1K</dd><dd class="oe-stat-context"><span class="oe-stat-delta oe-stat-delta-success">${lucideSvg('arrow-up')}<span class="oe-sr-only">Up </span>12%</span>vs last month</dd></div>
        <div class="oe-stat"><dt class="oe-stat-label">Open orders</dt><dd class="oe-stat-value">128</dd><dd class="oe-stat-context"><span class="oe-stat-delta">${lucideSvg('arrow-up')}<span class="oe-sr-only">Up </span>4</span>vs last month</dd></div>
        <div class="oe-stat"><dt class="oe-stat-label">Overdue</dt><dd class="oe-stat-value">3</dd><dd class="oe-stat-context"><span class="oe-stat-delta oe-stat-delta-danger">${lucideSvg('arrow-up')}<span class="oe-sr-only">Up </span>1</span>vs last month</dd></div>
      </dl>
      <figure class="mini-chart" role="img" aria-label="Orders per week, rising from ${WEEKLY_ORDERS[0]} to ${WEEKLY_ORDERS.at(-1)}. Sample data.">
        <figcaption>Orders per week</figcaption>
        <div class="bars">${WEEKLY_ORDERS.map((v) => `<i style="height:${v}%"></i>`).join('')}</div>
      </figure>
      <div class="oe-table-wrap">
        <table class="oe-table oe-table-compact">
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
      <p class="lead">Tokens and component styles for every Oestergaard-AS app, in any framework.</p>
      <div class="row">
        <a class="oe-btn oe-btn-primary" href="#start">Get started</a>
        <a class="oe-btn oe-btn-secondary" href="colors/">Browse tokens</a>
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

const USAGE_TABS: [string, string, string][] = [
  [
    'classes',
    'Components',
    `${code(`@import "@oestergaard/design-tokens/tokens.css";
@import "@oestergaard/design-tokens/components.css";`)}
    ${code(`<button class="oe-btn oe-btn-primary">Save changes</button>
<span class="oe-badge oe-badge-success">Paid</span>`)}`,
  ],
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
@import "@oestergaard/design-tokens/tailwind.css";
@import "@oestergaard/design-tokens/components.css";`)}
    ${code(`<button class="bg-accent-emphasis text-on-accent hover:bg-accent-emphasis-hover px-4 py-2 rounded-md text-sm">
  Save changes
</button>
<p class="text-muted">Secondary text</p>`)}`,
  ],
  [
    'agents',
    'Agents',
    `${code(`Follow node_modules/@oestergaard/design-tokens/AGENT-GUIDE.md for all UI work.
Run npx oe-lint src before finishing, and fix every error.`)}`,
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
      ${code(`npm install github:Oestergaard-A-S/design-system#v${version}`)}
      <div>
        <div class="oe-tabs" role="tablist" aria-label="Ways to use the tokens">
          ${USAGE_TABS.map(([id, label], i) => `<button type="button" role="tab" id="tab-${id}" aria-controls="panel-${id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${label}</button>`).join('')}
        </div>
        ${USAGE_TABS.map(([id, , body], i) => `<div role="tabpanel" id="panel-${id}" aria-labelledby="tab-${id}"${i === 0 ? '' : ' hidden'}>${body}</div>`).join('')}
      </div>
    </div>
  </section>`;

mountPage('home', `${overview()}${startSection()}`);

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
