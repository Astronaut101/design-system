import { INTENT_ICONS, lucideSvg, statusBadge } from '../shared.ts';
import type { Category } from './shared.ts';

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

export const legacySamples: { id: string; title: string; category: Category; html: string }[] = [
  { id: 'buttons', title: 'Buttons', category: 'Actions', html: `      <div id="buttons" class="oe-card demo">
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
            <a class="oe-link" href="#">Text link</a>
          </div>
          <div class="row">
            <div class="oe-btn-group" role="group" aria-label="Text alignment">
              <button class="oe-btn oe-btn-secondary" type="button" aria-pressed="true">Left</button>
              <button class="oe-btn oe-btn-secondary" type="button" aria-pressed="false">Center</button>
              <button class="oe-btn oe-btn-secondary" type="button" aria-pressed="false">Right</button>
            </div>
            <button class="oe-btn oe-btn-quiet" type="button">Quiet</button>
          </div>
        </div>
      </div>` },
  { id: 'badges', title: 'Badges', category: 'Feedback', html: `      <div id="badges" class="oe-card demo">
        <h2 class="card-title">Badges</h2>
        <div class="row">
          ${statusBadge('success', 'Paid')}${statusBadge('warning', 'Due soon')}${statusBadge('danger', 'Overdue')}${statusBadge('info', 'Draft')}${statusBadge('accent', 'New')}${statusBadge('neutral', 'Archived')}
          <span class="oe-badge oe-badge-success oe-badge-dot">Online</span>
          <span class="oe-badge oe-badge-neutral">Design<button class="oe-badge-remove" type="button" aria-label="Remove Design">${lucideSvg('x')}</button></span>
        </div>
      </div>` },
  { id: 'alerts', title: 'Alerts', category: 'Feedback', html: `      <div id="alerts" class="oe-card demo">
        <h2 class="card-title">Alerts</h2>
        <div class="stack demo-stack">
          ${ALERTS.map(alert).join('')}
          <div class="oe-alert oe-alert-info" role="group">
            ${lucideSvg('info')}
            <div>
              <p class="oe-alert-title">New version available</p>
              <p>Reload to get the latest changes.</p>
              <div class="oe-alert-actions"><button class="oe-btn oe-btn-secondary oe-btn-sm" type="button">Reload</button></div>
            </div>
            <button class="oe-close" type="button" aria-label="Dismiss">${lucideSvg('x')}</button>
          </div>
        </div>
      </div>` },
  { id: 'form-fields', title: 'Form fields', category: 'Forms', html: `      <div id="form-fields" class="oe-card demo">
        <h2 class="card-title">Form fields</h2>
        <div class="stack demo-stack">
          <label class="oe-field"><span class="oe-field-label">Name</span><input class="oe-input" placeholder="Placeholder text" /><small class="oe-field-help">As it appears on the invoice</small></label>
          <label class="oe-field"><span class="oe-field-label">Focused</span><input class="oe-input is-focus" value="Focus ring" /></label>
          <label class="oe-field"><span class="oe-field-label">Email</span><input class="oe-input" value="not-an-email" aria-invalid="true" /><small class="oe-field-error">${lucideSvg('circle-x')}Enter a valid email address</small></label>
          <label class="oe-field"><span class="oe-field-label">Country</span><select class="oe-input"><option>Denmark</option><option>Norway</option></select></label>
          <label class="oe-check-label"><input class="oe-check" type="checkbox" checked />Send a receipt</label>
          <div class="row">
            <input class="oe-input oe-input-sm" style="width:auto" placeholder="Small" aria-label="Small input" />
            <input class="oe-input oe-input-lg" style="width:auto" placeholder="Large" aria-label="Large input" />
          </div>
        </div>
      </div>` },
  { id: 'form-layout', title: 'Form layout', category: 'Forms', html: `      <div id="form-layout" class="oe-card demo">
        <h2 class="card-title">Form layout</h2>
        <form class="oe-form">
          <div class="oe-form-row">
            <label class="oe-field"><span class="oe-field-label oe-field-required">First name</span><input class="oe-input" required /></label>
            <label class="oe-field"><span class="oe-field-label">Last name</span><input class="oe-input" /></label>
          </div>
          <label class="oe-field oe-field-inline"><span class="oe-field-label">Notes</span><textarea class="oe-input oe-input-autogrow" rows="2" placeholder="Grows as you type…"></textarea><small class="oe-field-help">Shown on the invoice</small></label>
          <fieldset class="oe-fieldset">
            <legend class="oe-fieldset-legend">Notify me by</legend>
            <label class="oe-check-label"><input class="oe-check" type="checkbox" checked />Email</label>
            <label class="oe-check-label"><input class="oe-check" type="checkbox" />Text message</label>
          </fieldset>
          <div class="oe-form-actions">
            <button class="oe-btn oe-btn-secondary" type="button">Cancel</button>
            <button class="oe-btn oe-btn-primary" type="button">Save</button>
          </div>
        </form>
      </div>` },
  { id: 'choosing', title: 'Choosing', category: 'Forms', html: `      <div id="choosing" class="oe-card demo">
        <h2 class="card-title">Choosing</h2>
        <div class="stack demo-stack">
          <label class="oe-radio-card"><input class="oe-check" type="radio" name="plan" checked /><span><span class="oe-radio-card-title">Standard</span><span class="oe-radio-card-text">Delivered in 3 to 5 days</span></span></label>
          <label class="oe-radio-card"><input class="oe-check" type="radio" name="plan" /><span><span class="oe-radio-card-title">Express</span><span class="oe-radio-card-text">Delivered tomorrow</span></span></label>
          <label class="oe-field"><span class="oe-field-label">Volume</span><input class="oe-slider" type="range" value="60" /></label>
          <label class="oe-field"><span class="oe-field-label">Code</span><input class="oe-input oe-input-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" value="123456" /></label>
        </div>
      </div>` },
  { id: 'file-upload', title: 'File upload', category: 'Forms', html: `      <div id="file-upload" class="oe-card demo">
        <h2 class="card-title">File upload</h2>
        <div class="stack demo-stack">
          <label class="oe-dropzone">${lucideSvg('upload')}<span>Drop a file here, or click to choose</span><input type="file" /></label>
          <label class="oe-field"><span class="oe-field-label">Attachment</span><input class="oe-input" type="file" /></label>
        </div>
      </div>` },
  { id: 'avatars', title: 'Avatars', category: 'Content', html: `      <div id="avatars" class="oe-card demo">
        <h2 class="card-title">Avatars</h2>
        <div class="stack demo-stack">
          <div class="row">
            <span class="oe-avatar oe-avatar-sm">MH</span><span class="oe-avatar">MH</span><span class="oe-avatar oe-avatar-lg">MH</span><span class="oe-avatar oe-avatar-xl">MH</span>
            <span class="oe-avatar-group"><span class="oe-avatar oe-avatar-lg">MH</span><span class="oe-avatar oe-avatar-lg">JN</span><span class="oe-avatar oe-avatar-lg">AB</span><span class="oe-avatar oe-avatar-lg oe-avatar-neutral">+3</span></span>
          </div>
        </div>
      </div>` },
  { id: 'flush-card', title: 'Flush card', category: 'Data display', html: `      <div id="flush-card" class="oe-card oe-card-flush wide">
        <div class="oe-card-head">
          <div><h2 class="oe-card-title">Flush card</h2><p class="oe-card-subtitle">Recent invoices</p></div>
          <button class="oe-btn oe-btn-quiet oe-btn-icon" type="button" aria-label="More">${lucideSvg('ellipsis')}</button>
        </div>
        <div class="oe-table-wrap">
          <table class="oe-table">
            <thead><tr><th scope="col">Invoice</th><th scope="col">Customer</th><th scope="col" class="oe-table-num">Amount</th></tr></thead>
            <tbody>
              <tr><td class="num">2041</td><td>Nordic Freight</td><td class="oe-table-num">$12,400</td></tr>
              <tr class="oe-row-selected"><td class="num">2040</td><td>Fjord Marine</td><td class="oe-table-num">$8,150</td></tr>
              <tr><td class="num">2039</td><td>Havn Logistics</td><td class="oe-table-num">$3,920</td></tr>
            </tbody>
          </table>
        </div>
        <div class="oe-card-foot"><button class="oe-btn oe-btn-quiet" type="button">View all</button></div>
      </div>` },
  { id: 'tabs-and-segmented-control', title: 'Tabs and segmented control', category: 'Navigation', html: `      <div id="tabs-and-segmented-control" class="oe-card demo">
        <h2 class="card-title">Tabs and segmented control</h2>
        <div class="oe-topbar topbar-demo">
          <nav class="oe-tabs" aria-label="Top bar tabs"><a href="#" aria-current="page">Overview</a><a href="#">Activity</a><a href="#">Settings</a></nav>
          <button class="oe-btn oe-btn-ghost oe-btn-icon" type="button" aria-label="Search">${lucideSvg('search')}</button>
        </div>
        <div class="stack demo-stack">
          <nav class="oe-tabs" aria-label="Example tabs">
            <a href="#" aria-current="page">Orders</a><a href="#">Customers</a><a href="#">Invoices</a>
          </nav>
          <div class="row"><div class="oe-segmented" role="group" aria-label="Example view switch">
            <button type="button" aria-pressed="true">Day</button><button type="button" aria-pressed="false">Week</button><button type="button" aria-pressed="false">Month</button>
          </div></div>
        </div>
      </div>` },
  { id: 'menu', title: 'Menu', category: 'Actions', html: `      <div id="menu" class="oe-card demo">
        <h2 class="card-title">Menu</h2>
        <div class="row">
          <ul class="oe-menu" aria-label="Example menu">
            <li class="oe-menu-heading">Order</li>
            <li><button class="oe-menu-item" type="button">${lucideSvg('pencil')}Edit<kbd class="oe-menu-shortcut">⌘E</kbd></button></li>
            <li><button class="oe-menu-item" type="button">${lucideSvg('copy')}Duplicate<kbd class="oe-menu-shortcut">⌘D</kbd></button></li>
            <li><button class="oe-menu-item" type="button" role="menuitemcheckbox" aria-checked="true">${lucideSvg('pin')}Pinned</button></li>
            <li><button class="oe-menu-item" type="button" disabled>${lucideSvg('archive')}Archive</button></li>
            <li class="oe-menu-separator" role="separator"></li>
            <li><button class="oe-menu-item oe-menu-item-danger" type="button">${lucideSvg('trash')}Delete</button></li>
          </ul>
        </div>
      </div>` },
  { id: 'overlays', title: 'Overlays', category: 'Overlays', html: `      <div id="overlays" class="oe-card demo">
        <h2 class="card-title">Overlays</h2>
        <div class="stack demo-stack">
          <div class="scrim-demo">
            <div class="scrim"></div>
            <!-- oe-lint-ignore: a static picture of a dialog -->
            <div class="oe-dialog"><p class="oe-dialog-title">Delete this order?</p><div class="oe-dialog-actions"><button class="oe-btn oe-btn-secondary" type="button">Cancel</button><button class="oe-btn oe-btn-danger" type="button">${lucideSvg('trash')}Delete</button></div></div>
          </div>
          <div class="row"><span class="oe-toast">${lucideSvg('circle-check')}Order saved</span><span class="oe-tooltip">Tooltip</span><span class="oe-tooltip">Includes tax and shipping. The total updates when the delivery address changes.</span></div>
          <div class="row">
            <button class="oe-btn oe-btn-secondary" type="button" data-open="demo-dialog">Dialog</button>
            <button class="oe-btn oe-btn-secondary" type="button" data-open="demo-drawer">Drawer</button>
            <button class="oe-btn oe-btn-secondary" type="button" popovertarget="demo-popover" style="anchor-name: --demo-popover">Popover</button>
            <div class="oe-popover" id="demo-popover" popover style="position-anchor: --demo-popover">Shared with 3 people</div>
          </div>
        </div>
        <dialog class="oe-dialog" id="demo-dialog">
          <div class="oe-dialog-head"><p class="oe-dialog-title">Order 2041</p><button class="oe-close" type="button" aria-label="Close" data-close>${lucideSvg('x')}</button></div>
          <div class="oe-dialog-body"><dl class="oe-dl">${Array.from({ length: 24 }, (_, i) => `<div><dt>Line ${i + 1}</dt><dd>Part ${1040 + i}</dd></div>`).join('')}</dl></div>
          <div class="oe-dialog-actions"><button class="oe-btn oe-btn-secondary" type="button" data-close>Close</button></div>
        </dialog>
        <dialog class="oe-drawer" id="demo-drawer">
          <div class="oe-dialog-head"><p class="oe-dialog-title">Filters</p><button class="oe-close" type="button" aria-label="Close" data-close>${lucideSvg('x')}</button></div>
          <div class="oe-dialog-body">Filter options go here.</div>
          <div class="oe-dialog-actions"><button class="oe-btn oe-btn-primary" type="button" data-close>Apply</button></div>
        </dialog>
      </div>` },
  { id: 'notifications', title: 'Notifications', category: 'Feedback', html: `      <div id="notifications" class="oe-card demo">
        <h2 class="card-title">Notifications</h2>
        <div class="stack demo-stack">
          <div class="oe-banner oe-banner-warning" role="status">${lucideSvg('triangle-exclamation-point')}<p>Scheduled maintenance on Sunday.</p><button class="oe-close" type="button" aria-label="Dismiss">${lucideSvg('x')}</button></div>
          <div class="oe-toast oe-toast-success">${lucideSvg('circle-check')}<div><p class="oe-toast-title">Invoice sent</p><p>Invoice 2041 is on its way.</p></div></div>
          <div class="oe-toast oe-toast-danger">${lucideSvg('circle-x')}<p>Payment failed.</p><button class="oe-btn oe-btn-secondary oe-btn-sm" type="button">Retry</button><button class="oe-close" type="button" aria-label="Dismiss">${lucideSvg('x')}</button></div>
        </div>
      </div>` },
  { id: 'card', title: 'Card', category: 'Layout', html: `      <div id="card" class="oe-card demo">
        <div class="oe-card-head">
          <div><h2 class="oe-card-title">Card</h2><p class="oe-card-subtitle">With a header and footer</p></div>
          <button class="oe-btn oe-btn-ghost oe-btn-icon" type="button" aria-label="More">${lucideSvg('ellipsis')}</button>
        </div>
        <dl class="oe-dl">
          <div><dt>Customer</dt><dd>Nordic Freight</dd></div>
          <div><dt>Terms</dt><dd>Net 30</dd></div>
        </dl>
        <div class="oe-card-foot"><button class="oe-btn oe-btn-secondary" type="button">Cancel</button><button class="oe-btn oe-btn-primary" type="button">Save</button></div>
      </div>` },
  { id: 'list-rows', title: 'List rows', category: 'Data display', html: `      <div id="list-rows" class="oe-card demo">
        <h2 class="card-title">List rows</h2>
        <ul class="oe-list">
          <li><a class="oe-list-item" href="#">${lucideSvg('user')}<span class="oe-list-text"><span class="oe-list-title">Profile</span><span class="oe-list-subtitle">Name, email and photo</span></span>${lucideSvg('arrow-right')}</a></li>
          <li><div class="oe-list-item">${lucideSvg('bell')}<span class="oe-list-text"><span class="oe-list-title">Notifications</span><span class="oe-list-subtitle">Email and push</span></span><input class="oe-switch" type="checkbox" role="switch" checked aria-label="Notifications" /></div></li>
        </ul>
      </div>` },
  { id: 'timeline-and-stepper', title: 'Timeline and stepper', category: 'Navigation', html: `      <div id="timeline-and-stepper" class="oe-card demo">
        <h2 class="card-title">Timeline and stepper</h2>
        <div class="stack demo-stack">
          <ol class="oe-steps" aria-label="Checkout"><li class="oe-step oe-step-done">Cart</li><li class="oe-step" aria-current="step">Delivery</li><li class="oe-step">Payment</li></ol>
          <hr class="oe-separator" />
          <ol class="oe-timeline">
            <li class="oe-timeline-item"><span class="oe-timeline-marker">${lucideSvg('truck')}</span><div class="oe-timeline-text">Shipped<span class="oe-timeline-time">Today at 09:12</span></div></li>
            <li class="oe-timeline-item"><span class="oe-timeline-marker">${lucideSvg('circle-check')}</span><div class="oe-timeline-text">Paid<span class="oe-timeline-time">Yesterday at 16:40</span></div></li>
            <li class="oe-timeline-item"><span class="oe-timeline-marker">${lucideSvg('file-text')}</span><div class="oe-timeline-text">Invoice created<span class="oe-timeline-time">Monday at 11:05</span></div></li>
          </ol>
        </div>
      </div>` },
  { id: 'text', title: 'Text', category: 'Content', html: `      <div id="text" class="oe-card demo">
        <h2 class="card-title">Text</h2>
        <div class="oe-prose">
          <h3>Prose</h3>
          <p>Styled <a href="#">links</a>, <code>code</code> and lists, for text that can't carry classes.</p>
          <ul><li>Headings and paragraphs</li><li>Tables and quotes</li></ul>
        </div>
        <pre class="oe-code-block" style="margin-top:var(--space-3)"><code>npx oe-lint src</code></pre>
      </div>` },
  { id: 'loading', title: 'Loading', category: 'Feedback', html: `      <div id="loading" class="oe-card demo">
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
      </div>` },
  { id: 'switch-and-search', title: 'Switch and search', category: 'Forms', html: `      <div id="switch-and-search" class="oe-card demo">
        <h2 class="card-title">Switch and search</h2>
        <div class="stack demo-stack">
          <label class="oe-check-label"><input class="oe-switch" type="checkbox" role="switch" checked />Email updates</label>
          <label class="oe-check-label"><input class="oe-switch" type="checkbox" role="switch" />Weekly report</label>
          <label class="oe-input-group">${lucideSvg('search')}<input class="oe-input" placeholder="Search…" aria-label="Search" /><kbd class="oe-kbd">/</kbd></label>
        </div>
      </div>` },
  { id: 'empty-state', title: 'Empty state', category: 'Feedback', html: `      <div id="empty-state" class="oe-card demo">
        <h2 class="card-title">Empty state</h2>
        <div class="oe-empty">
          ${lucideSvg('package')}
          <p class="oe-empty-title">No orders yet</p>
          <p class="oe-empty-text">New orders show up here.</p>
          <button class="oe-btn oe-btn-primary" type="button">${lucideSvg('plus')}New order</button>
        </div>
      </div>` },
  { id: 'pagination-and-accordion', title: 'Pagination and accordion', category: 'Navigation', html: `      <div id="pagination-and-accordion" class="oe-card demo">
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
      </div>` },
  { id: 'interaction-states', title: 'Interaction states', category: 'Feedback', html: `      <div id="interaction-states" class="oe-card demo">
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
      </div>` },
  { id: 'table', title: 'Table', category: 'Data display', html: `      <div id="table" class="wide demo">
        <h2 class="card-title">Table</h2>
        <div class="oe-card oe-card-flush">
        <div class="oe-toolbar oe-toolbar-selection">
          <span>1 selected</span>
          <button class="oe-btn oe-btn-quiet oe-btn-sm" type="button">Clear</button>
          <div class="oe-toolbar-end"><button class="oe-btn oe-btn-secondary oe-btn-sm" type="button">${lucideSvg('archive')}Archive</button><button class="oe-btn oe-btn-secondary oe-btn-sm" type="button">${lucideSvg('trash')}Delete</button></div>
        </div>
        <div class="oe-table-wrap">
          <table class="oe-table">
            <thead><tr>
              <th scope="col" class="oe-table-select"><input class="oe-check" type="checkbox" aria-label="Select all" /></th>
              <th scope="col" aria-sort="descending"><button class="oe-table-sort" type="button">Order${lucideSvg('arrow-down')}</button></th>
              <th scope="col"><button class="oe-table-sort" type="button">Customer${lucideSvg('arrow-up-down')}</button></th>
              <th scope="col">Status</th>
              <th scope="col" class="oe-table-num">Amount</th>
              <th scope="col" class="oe-table-actions"><span class="oe-sr-only">Actions</span></th>
            </tr></thead>
            <tbody>${TABLE_ROWS.map(([id, who, intent, label, amount, selected]) => `<tr${selected ? ' class="oe-row-selected"' : ''}><td class="oe-table-select"><input class="oe-check" type="checkbox" aria-label="Select order ${id}"${selected ? ' checked' : ''} /></td><td class="num">${id}</td><td>${who}</td><td>${statusBadge(intent, label)}</td><td class="oe-table-num">${amount}</td><td class="oe-table-actions oe-table-reveal"><button class="oe-btn oe-btn-quiet oe-btn-icon oe-btn-sm" type="button" aria-label="More for order ${id}">${lucideSvg('ellipsis')}</button></td></tr>`).join('')}</tbody>
          </table>
        </div>
        <div class="oe-toolbar">
          <span>3 of 48 orders</span>
          <nav class="oe-pagination oe-toolbar-end" aria-label="Table pages">
            <a href="#" aria-label="Previous page">${lucideSvg('arrow-left')}</a><a href="#" aria-current="page">1</a><a href="#">2</a><a href="#">3</a><span aria-disabled="true">…</span><a href="#">16</a><a href="#" aria-label="Next page">${lucideSvg('arrow-right')}</a>
          </nav>
        </div>
        </div>
      </div>` },
  { id: 'stats', title: 'Stats', category: 'Data display', html: `      <div id="stats" class="wide demo">
        <h2 class="card-title">Stats</h2>
        <dl class="oe-stat-grid">
          <div class="oe-stat"><dt class="oe-stat-label">Revenue</dt><dd class="oe-stat-value">$40.1K</dd><dd class="oe-stat-context"><span class="oe-stat-delta oe-stat-delta-success">${lucideSvg('arrow-up')}<span class="oe-sr-only">Up </span>12%</span>vs last month</dd></div>
          <div class="oe-stat"><dt class="oe-stat-label">Open orders</dt><dd class="oe-stat-value">128</dd><dd class="oe-stat-context"><span class="oe-stat-delta">${lucideSvg('minus')}0</span>vs last month</dd></div>
          <div class="oe-stat"><dt class="oe-stat-label">Overdue</dt><dd class="oe-stat-value">3</dd><dd class="oe-stat-context"><span class="oe-stat-delta oe-stat-delta-danger">${lucideSvg('arrow-up')}<span class="oe-sr-only">Up </span>1</span>vs last month</dd></div>
        </dl>
      </div>` },
];
