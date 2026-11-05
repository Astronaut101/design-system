// A small app using only the package's CSS and no site styles, so it behaves like a real app.
import '../../dist/tokens.css';
import '../../dist/components.css';
import '../example.css';
import { lucideSvg, statusBadge } from '../shared.ts';

const MAIN: [string, string, string?][] = [
  ['Overview', 'house'],
  ['Orders', 'package', '12'],
  ['Shipments', 'truck'],
  ['Invoices', 'file-text', '3'],
];

const TEAM: [string, string][] = [
  ['Customers', 'users'],
  ['Reports', 'chart-column'],
];

const navItems = (items: [string, string, string?][], current?: string) =>
  items
    .map(
      ([label, icon, count]) =>
        `<li><a class="oe-nav-item" href="#" title="${label}"${label === current ? ' aria-current="page"' : ''}>${lucideSvg(icon)}${label}${count ? `<span class="oe-badge oe-badge-neutral">${count}</span>` : ''}</a></li>`,
    )
    .join('');

const ORDERS: [string, string, string, string, string][] = [
  ['2041', 'Nordic Freight', 'success', 'Paid', '$12,400'],
  ['2040', 'Fjord Marine', 'warning', 'Due soon', '$8,150'],
  ['2039', 'Havn Logistics', 'danger', 'Overdue', '$3,920'],
  ['2038', 'Bakke Byg', 'info', 'Draft', '$1,780'],
];

document.body.insertAdjacentHTML(
  'afterbegin',
  `<div class="oe-shell">
    <nav class="oe-sidenav" id="nav" popover aria-label="Pages">
      <a class="oe-sidenav-brand" href="#">${lucideSvg('package')}Northwind</a>
      <div class="oe-sidenav-body">
        <ul class="oe-nav-list">${navItems(MAIN, 'Overview')}</ul>
        <p class="oe-nav-heading">Team</p>
        <ul class="oe-nav-list">${navItems(TEAM)}</ul>
      </div>
      <div class="oe-sidenav-foot">
        <a class="oe-nav-item" href="#" title="Settings">${lucideSvg('settings')}Settings</a>
        <a class="oe-nav-item" href="#" title="Maja Holm"><span class="oe-avatar">MH</span>Maja Holm</a>
      </div>
    </nav>
    <div class="oe-shell-main">
      <header class="oe-topbar">
        <button class="oe-btn oe-btn-ghost oe-btn-icon oe-shell-menu" type="button" popovertarget="nav" aria-label="Open navigation">${lucideSvg('menu')}</button>
        <button class="oe-btn oe-btn-ghost oe-btn-icon oe-shell-toggle" type="button" aria-expanded="${!location.search.includes('closed')}" aria-controls="nav" aria-label="Toggle sidebar" title="Toggle sidebar">${lucideSvg('panel-left')}</button>
        <nav class="oe-breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><a href="#">Northwind</a></li>
            <li aria-current="page">Overview</li>
          </ol>
        </nav>
        <div class="oe-topbar-actions">
          <button class="oe-btn oe-btn-ghost oe-btn-icon" type="button" aria-label="Search" title="Search">${lucideSvg('search')}</button>
          <button class="oe-btn oe-btn-ghost oe-btn-icon" type="button" aria-label="Notifications" title="Notifications">${lucideSvg('bell')}</button>
        </div>
      </header>
      <main class="oe-page">
        <header class="oe-page-head">
          <div>
            <h1 class="oe-page-title">Overview</h1>
            <p class="oe-page-subtitle">Sample data.</p>
          </div>
          <div class="oe-page-actions">
            <button class="oe-btn oe-btn-secondary" type="button">${lucideSvg('download')}Export</button>
            <button class="oe-btn oe-btn-primary" type="button">${lucideSvg('plus')}New order</button>
          </div>
        </header>
      <dl class="example-stats">
        <div class="oe-stat"><dt class="oe-stat-label">Revenue</dt><dd class="oe-stat-value">$40.1K</dd><small class="oe-stat-delta oe-stat-delta-success">${lucideSvg('arrow-up')}+12%</small></div>
        <div class="oe-stat"><dt class="oe-stat-label">Open orders</dt><dd class="oe-stat-value">128</dd><small class="oe-stat-delta">${lucideSvg('arrow-up')}+4</small></div>
        <div class="oe-stat"><dt class="oe-stat-label">Overdue</dt><dd class="oe-stat-value">3</dd><small class="oe-stat-delta oe-stat-delta-danger">${lucideSvg('arrow-up')}+1</small></div>
      </dl>
      <div class="oe-table-wrap">
        <table class="oe-table">
          <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Status</th><th scope="col" class="oe-table-num">Amount</th></tr></thead>
          <tbody>${ORDERS.map(([id, who, intent, label, amount]) => `<tr><td>${id}</td><td>${who}</td><td>${statusBadge(intent, label)}</td><td class="oe-table-num">${amount}</td></tr>`).join('')}</tbody>
        </table>
      </div>
      </main>
    </div>
  </div>`,
);

const toggle = document.querySelector<HTMLButtonElement>('.oe-shell-toggle')!;
toggle.addEventListener('click', () => {
  toggle.setAttribute('aria-expanded', String(toggle.getAttribute('aria-expanded') === 'false'));
});

// Follows the showcase's theme switch, which is on another page.
addEventListener('storage', (e) => {
  if (e.key !== 'oe-theme') return;
  if (e.newValue) document.documentElement.dataset.theme = e.newValue;
  else delete document.documentElement.dataset.theme;
});
