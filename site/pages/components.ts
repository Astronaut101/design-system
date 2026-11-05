import { mountPage } from '../frame.ts';
import { INTENT_ICONS, lucideSvg, pageHead, statusBadge } from '../shared.ts';

const ALERTS: [string, string, string][] = [
  ['info', 'Scheduled maintenance', 'Unavailable Sunday from 02:00 to 03:00.'],
  ['success', 'Invoice sent', 'Invoice 2041 is on its way.'],
  ['warning', 'Certificate expiring', 'Renew it within 14 days.'],
  ['danger', 'Payment failed', 'Check the card details and try again.'],
];

const alert = ([intent, title, body]: [string, string, string]) => `
  <div class="oe-alert oe-alert-${intent}" role="group">
    ${lucideSvg(INTENT_ICONS[intent])}
    <p><strong>${title}.</strong> ${body}</p>
  </div>`;

const TABLE_ROWS: [string, string, string, string, string, boolean][] = [
  ['2041', 'Nordic Freight', 'success', 'Paid', '$12,400', false],
  ['2040', 'Fjord Marine', 'warning', 'Due soon', '$8,150', true],
  ['2039', 'Havn Logistics', 'danger', 'Overdue', '$3,920', false],
];

const componentsPage = () => `
  ${pageHead('Components', 'Styles for any framework, built from the tokens.')}
    <div class="size-grid">
      <div class="oe-card demo">
        <h2 class="card-title">Buttons</h2>
        <div class="stack demo-stack">
          <div class="row">
            <button class="oe-btn oe-btn-primary" type="button">${lucideSvg('save')}Save changes</button>
            <button class="oe-btn oe-btn-secondary" type="button">Cancel</button>
            <button class="oe-btn oe-btn-ghost" type="button">Learn more</button>
            <button class="oe-btn oe-btn-secondary oe-btn-icon" type="button" aria-label="More options" title="More options">${lucideSvg('ellipsis')}</button>
          </div>
          <div class="row">
            <button class="oe-btn oe-btn-neutral" type="button">Neutral</button>
            <button class="oe-btn oe-btn-danger" type="button">${lucideSvg('trash')}Delete</button>
            <button class="oe-btn" disabled type="button">Disabled</button>
            <button class="oe-btn oe-btn-secondary oe-btn-sm" type="button">${lucideSvg('copy')}Small</button>
            <button class="oe-btn oe-btn-secondary oe-btn-lg" type="button">${lucideSvg('copy')}Large</button>
            <a href="#">Text link</a>
          </div>
        </div>
      </div>
      <div class="oe-card demo">
        <h2 class="card-title">Badges</h2>
        <div class="row">
          ${statusBadge('success', 'Paid')}${statusBadge('warning', 'Due soon')}${statusBadge('danger', 'Overdue')}${statusBadge('info', 'Draft')}${statusBadge('accent', 'New')}${statusBadge('neutral', 'Archived')}
        </div>
      </div>
      <div class="oe-card demo">
        <h2 class="card-title">Alerts</h2>
        <div class="stack demo-stack">${ALERTS.map(alert).join('')}</div>
      </div>
      <div class="oe-card demo">
        <h2 class="card-title">Form fields</h2>
        <div class="stack demo-stack">
          <label class="oe-field"><span class="oe-field-label">Name</span><input class="oe-input" placeholder="Placeholder text" /><small class="oe-field-help">As it appears on the invoice</small></label>
          <label class="oe-field"><span class="oe-field-label">Focused</span><input class="oe-input is-focus" value="Focus ring" /></label>
          <label class="oe-field"><span class="oe-field-label">Email</span><input class="oe-input" value="not-an-email" aria-invalid="true" /><small class="oe-field-error">${lucideSvg('circle-x')}Enter a valid email address</small></label>
          <label class="oe-field"><span class="oe-field-label">Country</span><select class="oe-input"><option>Denmark</option><option>Norway</option></select></label>
          <label class="oe-check-label"><input class="oe-check" type="checkbox" checked />Send a receipt</label>
        </div>
      </div>
      <div class="oe-card demo wide">
        <h2 class="card-title">Table</h2>
        <div class="oe-table-wrap">
          <table class="oe-table">
            <thead><tr>
              <th scope="col" aria-sort="descending"><button class="oe-table-sort" type="button">Order${lucideSvg('arrow-down')}</button></th>
              <th scope="col"><button class="oe-table-sort" type="button">Customer${lucideSvg('arrow-up-down')}</button></th>
              <th scope="col">Status</th>
              <th scope="col" class="oe-table-num">Amount</th>
            </tr></thead>
            <tbody>${TABLE_ROWS.map(([id, who, intent, label, amount, selected]) => `<tr${selected ? ' class="oe-row-selected"' : ''}><td class="num">${id}</td><td>${who}</td><td>${statusBadge(intent, label)}</td><td class="oe-table-num">${amount}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
      <div class="oe-card demo">
        <h2 class="card-title">Stats</h2>
        <dl class="tiles">
          <div class="oe-stat"><dt class="oe-stat-label">Revenue</dt><dd class="oe-stat-value">$40.1K</dd><small class="oe-stat-delta oe-stat-delta-success">${lucideSvg('arrow-up')}+12%</small></div>
          <div class="oe-stat"><dt class="oe-stat-label">Open orders</dt><dd class="oe-stat-value">128</dd><small class="oe-stat-delta">${lucideSvg('minus')}0</small></div>
          <div class="oe-stat"><dt class="oe-stat-label">Overdue</dt><dd class="oe-stat-value">3</dd><small class="oe-stat-delta oe-stat-delta-danger">${lucideSvg('arrow-up')}+1</small></div>
        </dl>
      </div>
      <div class="oe-card demo">
        <h2 class="card-title">Tabs and segmented control</h2>
        <div class="stack demo-stack">
          <nav class="oe-tabs" aria-label="Example tabs">
            <a href="#" aria-current="page">Orders</a><a href="#">Customers</a><a href="#">Invoices</a>
          </nav>
          <div class="row"><div class="oe-segmented" role="group" aria-label="Example view switch">
            <button type="button" aria-pressed="true">Day</button><button type="button" aria-pressed="false">Week</button><button type="button" aria-pressed="false">Month</button>
          </div></div>
        </div>
      </div>
      <div class="oe-card demo">
        <h2 class="card-title">Menu</h2>
        <div class="row">
          <ul class="oe-menu" aria-label="Example menu">
            <li><button class="oe-menu-item" type="button">${lucideSvg('pencil')}Edit</button></li>
            <li><button class="oe-menu-item" type="button">${lucideSvg('copy')}Duplicate</button></li>
            <li><button class="oe-menu-item oe-menu-item-danger" type="button">${lucideSvg('trash')}Delete</button></li>
          </ul>
        </div>
      </div>
      <div class="oe-card demo">
        <h2 class="card-title">Overlays</h2>
        <div class="stack demo-stack">
          <div class="scrim-demo">
            <div class="scrim"></div>
            <div class="oe-dialog"><p class="oe-dialog-title">Delete this order?</p><div class="oe-dialog-actions"><button class="oe-btn oe-btn-secondary" type="button">Cancel</button><button class="oe-btn oe-btn-danger" type="button">${lucideSvg('trash')}Delete</button></div></div>
          </div>
          <div class="row"><span class="oe-toast">${lucideSvg('circle-check')}Order saved</span><span class="oe-tooltip">Tooltip</span></div>
        </div>
      </div>
      <div class="oe-card demo">
        <h2 class="card-title">Loading</h2>
        <div class="stack demo-stack">
          <div class="row">
            <button class="oe-btn oe-btn-primary" type="button" aria-busy="true">Saving…</button>
            <span class="oe-spinner" role="status" aria-label="Loading"></span>
          </div>
          <div class="stack demo-stack" aria-hidden="true">
            <span class="oe-skeleton" style="width:60%"></span>
            <span class="oe-skeleton"></span>
          </div>
          <progress class="oe-progress" value="60" max="100" aria-label="Upload progress"></progress>
        </div>
      </div>
      <div class="oe-card demo">
        <h2 class="card-title">Switch and search</h2>
        <div class="stack demo-stack">
          <label class="oe-check-label"><input class="oe-switch" type="checkbox" role="switch" checked />Email updates</label>
          <label class="oe-check-label"><input class="oe-switch" type="checkbox" role="switch" />Weekly report</label>
          <label class="oe-input-group">${lucideSvg('search')}<input class="oe-input" placeholder="Search…" aria-label="Search" /><kbd class="oe-kbd">/</kbd></label>
        </div>
      </div>
      <div class="oe-card demo">
        <h2 class="card-title">Empty state</h2>
        <div class="oe-empty">
          ${lucideSvg('package')}
          <p class="oe-empty-title">No orders yet</p>
          <p class="oe-empty-text">New orders show up here.</p>
          <button class="oe-btn oe-btn-primary" type="button">${lucideSvg('plus')}New order</button>
        </div>
      </div>
      <div class="oe-card demo">
        <h2 class="card-title">Pagination and accordion</h2>
        <div class="stack demo-stack">
          <nav class="oe-pagination" aria-label="Example pagination">
            <a href="#" aria-label="Previous page">${lucideSvg('arrow-left')}</a><a href="#" aria-current="page">1</a><a href="#">2</a><a href="#">3</a><span aria-disabled="true">…</span><a href="#">9</a><a href="#" aria-label="Next page">${lucideSvg('arrow-right')}</a>
          </nav>
          <hr class="oe-separator" />
          <div>
            <details class="oe-accordion" open><summary>Delivery</summary><p>Ships within two days.</p></details>
            <details class="oe-accordion"><summary>Returns</summary><p>Free for 30 days.</p></details>
          </div>
        </div>
      </div>
      <div class="oe-card demo">
        <h2 class="card-title">Interaction states</h2>
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
    </div>`;

mountPage('components', componentsPage());
