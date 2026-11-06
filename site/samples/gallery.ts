import { icon, type Category, type Sample } from './shared.ts';
import type { legacySamples } from './legacy.ts';

export type LibraryEntry = { id: string; title: string; category: Category; description: string; html: string; preview: string };
const legacyDescriptions: Record<string, string> = {
  buttons: 'Actions, priorities, sizes and states for everyday tasks.',
  badges: 'Compact labels that communicate status and categorization.',
  alerts: 'Contextual feedback with a clear message and next step.',
  'form-fields': 'Labeled fields with help, validation and size variants.',
  'form-layout': 'Group related fields and keep form actions predictable.',
  choosing: 'Radio cards, checkboxes and sliders for choosing values.',
  'file-upload': 'A drop zone and a native file picker for attachments.',
  avatars: 'People and teams represented by initials or images.',
  table: 'Scannable records with selection, sorting and pagination.',
  'flush-card': 'A table that aligns with the edges of its containing card.',
  stats: 'Key figures paired with context and change over time.',
  'tabs-and-segmented-control': 'Switch between related destinations and display options.',
  menu: 'Organize contextual actions, checked items and shortcuts.',
  overlays: 'Dialogs, drawers and popovers for focused interactions.',
  notifications: 'Banners and status messages for timely feedback.',
  card: 'A content container with a heading, body and related actions.',
  'list-rows': 'Related items with supporting text and optional actions.',
  'timeline-and-stepper': 'Show what happened and where a process stands.',
  text: 'Readable prose, inline code and structured content.',
  loading: 'Progress and skeleton states that explain waiting.',
  'switch-and-search': 'Quick preferences and an icon-led search field.',
  'empty-state': 'Explain an empty view and give users a useful next step.',
  'pagination-and-accordion': 'Navigate result pages and reveal supporting information.',
  'interaction-states': 'Rest, hover, press and selection across system surfaces.',
};

// Previews contain only inert presentation. Live examples are mounted once in the detail view.
export function miniature(markup: string, id: string) {
  const host = document.createElement('div');
  host.innerHTML = markup;
  host.querySelectorAll('dialog, iframe, [popover], .sample-code, .code-block, .oe-toaster, .oe-sr-only').forEach(node => node.remove());
  host.querySelectorAll('h2.card-title').forEach(node => node.remove());
  host.querySelectorAll('*').forEach(node => {
    for (const attr of [...node.attributes]) {
      if (['id', 'for', 'name', 'autofocus', 'href', 'aria-controls', 'aria-describedby', 'aria-labelledby', 'popovertarget'].includes(attr.name) || (attr.name.startsWith('data-') && !['data-author','data-best','data-status','data-highlight','data-level'].includes(attr.name))) node.removeAttribute(attr.name);
    }
    if (node.hasAttribute('role')) node.removeAttribute('role');
  });
  if (id === 'app-shell') return `<div class="library-shell-picture"><div>${icon('package')}<span></span><span></span><span></span></div><div><b></b><div class="library-shell-cards"><i></i><i></i></div><p></p><p></p><p></p></div></div>`;
  if (id === 'toast') return `<div class="oe-toast oe-toast-success">${icon('circle-check')}<div><p class="oe-toast-title">Changes saved</p><p>Your report is ready.</p></div></div>`;
  if (id === 'hover-card') return `<div class="oe-hover-card"><span class="oe-avatar">MH</span><strong> Maja Holm</strong><p>Planning lead · Northwind</p></div>`;
  if (id === 'tooltip') return `<div class="oe-stack"><span class="oe-tooltip">Save changes to this report</span><button class="oe-btn oe-btn-secondary" type="button">${icon('save')}Save report</button></div>`;
  if (id === 'code-blocks') return `<pre class="oe-code-block"><code><span class="oe-syntax-keyword">const</span> report = {\n  title: <span class="oe-syntax-string">"Weekly capacity"</span>,\n  period: <span class="oe-syntax-string">"next-week"</span>\n};</code></pre>`;
  return host.innerHTML;
}

export function libraryEntries(legacy: typeof legacySamples, additions: Sample[], render: (sample: Sample) => string): LibraryEntry[] {
  return [
    ...legacy.map(sample => ({...sample, description: legacyDescriptions[sample.id], preview: miniature(sample.html, sample.id)})),
    ...additions.map(sample => ({...sample, html: render(sample), preview: miniature(sample.markup, sample.id)})),
  ];
}
