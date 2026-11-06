import { mountPage } from '../frame.ts';
import { TEMPLATES, type TemplateId } from '../nav.ts';
import { templateSource } from '../template-source.ts';
import { lucideSvg, code, pageHead } from '../shared.ts';

const WIDE = { width: 1120, height: 640 };

const SHELL = `<a class="oe-skip-link" href="#main">Skip to content</a>
<div class="oe-shell">
  <nav class="oe-sidenav" id="nav" popover aria-label="Pages">
    <a class="oe-sidenav-brand" href="/"><!-- Logo -->Northwind</a>
    <div class="oe-sidenav-body">
      <ul class="oe-nav-list">
        <li><a class="oe-nav-item" href="/" title="Overview" aria-current="page"><!-- Icon -->Overview</a></li>
      </ul>
      <p class="oe-nav-heading">Team</p>
      <ul class="oe-nav-list">
        <li><a class="oe-nav-item" href="/customers" title="Customers"><!-- Icon -->Customers</a></li>
      </ul>
    </div>
    <div class="oe-sidenav-foot">
      <a class="oe-nav-item" href="/me" title="Maja Holm"><span class="oe-avatar">MH</span>Maja Holm</a>
    </div>
  </nav>
  <div class="oe-shell-main">
    <header class="oe-topbar">
      <button class="oe-btn oe-btn-ghost oe-btn-icon oe-shell-menu" popovertarget="nav" aria-label="Open navigation"><!-- menu --></button>
      <button class="oe-btn oe-btn-ghost oe-btn-icon oe-shell-toggle" aria-expanded="true" aria-controls="nav" aria-label="Toggle sidebar"><!-- panel-left --></button>
      <nav class="oe-breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Northwind</a></li>
          <li aria-current="page">Overview</li>
        </ol>
      </nav>
      <div class="oe-topbar-actions"><!-- Search, notifications --></div>
    </header>
    <main class="oe-page" id="main">
      <header class="oe-page-head">
        <div>
          <h1 class="oe-page-title">Overview</h1>
          <p class="oe-page-subtitle">Summary</p>
        </div>
        <div class="oe-page-actions"><!-- The page's main actions --></div>
      </header>
    </main>
  </div>
</div>`;

const layoutPage = () => `
  ${pageHead('Layout', 'Eleven adaptable page templates, from desktop to phone. Select one to explore.')}
  <div class="stack">
    <div class="size-grid" id="template-gallery">
      ${TEMPLATES.map(({ id, label, category, description }) => `<article class="oe-card template-card">
        <span class="oe-badge oe-badge-neutral">${category}</span><h2 class="card-title">${label}</h2>
        <p class="note">${description}</p>
        <div class="shell-preview shell-preview-scaled" inert aria-hidden="true"><iframe src="${id}/" title="${label} thumbnail" width="${WIDE.width}" height="${WIDE.height}" loading="lazy" tabindex="-1"></iframe></div><div class="template-card-footer"><span class="caption">Responsive layout</span><button class="oe-btn oe-btn-secondary template-preview-button" type="button" data-preview="${id}" aria-haspopup="dialog" aria-controls="layout-preview" aria-label="Preview ${label}">${lucideSvg('eye')}Preview layout</button></div>
      </article>`).join('')}
    </div>
    <div class="oe-card"><h2 class="card-title">App shell markup</h2>${code(SHELL)}</div>
  </div>
  <dialog class="oe-dialog layout-preview" id="layout-preview" aria-labelledby="preview-title" aria-describedby="preview-description">
    <div class="oe-dialog-head"><div><h2 class="oe-dialog-title" id="preview-title"></h2><p class="note" id="preview-description"></p></div><button class="oe-close" type="button" data-close-preview aria-label="Close preview" autofocus>${lucideSvg('x')}</button></div>
    <div class="oe-dialog-body"><div class="preview-stage"><div class="preview-viewport"><iframe title="Layout preview" id="preview-frame"></iframe></div></div></div>
    <div class="oe-dialog-actions"><div class="oe-segmented" role="group" aria-label="Preview viewport"><button type="button" data-viewport="desktop" aria-pressed="true">${lucideSvg('monitor')}Desktop</button><button type="button" data-viewport="phone" aria-pressed="false">Phone</button></div><button class="oe-btn oe-btn-secondary" type="button" data-copy-template>Copy HTML</button><button class="oe-btn oe-btn-primary" type="button" id="preview-open">Open full page</button></div>
    <p class="caption" id="preview-status" role="status"></p>
  </dialog>`;

mountPage('layout', layoutPage());

const dialog = document.querySelector<HTMLDialogElement>('#layout-preview')!;
let frame = document.querySelector<HTMLIFrameElement>('#preview-frame')!;
const viewport = document.querySelector<HTMLElement>('.preview-viewport')!;
const stage = document.querySelector<HTMLElement>('.preview-stage')!;
let selected: TemplateId | undefined;
let opener: HTMLElement | null = null;
let phone = false;
const sizePreview = () => {
  const width = phone ? 390 : WIDE.width;
  const height = phone ? 720 : WIDE.height;
  const scale = Math.min(1, stage.clientWidth / width);
  frame.width = String(width);
  frame.height = String(height);
  frame.style.transform = `scale(${scale})`;
  viewport.style.width = `${width * scale}px`;
  viewport.style.height = `${height * scale}px`;
};
const syncFromUrl = () => {
  const id = new URL(location.href).searchParams.get('preview');
  const template = TEMPLATES.find(t => t.id === id);
  if (!template) {
    selected = undefined;
    if (dialog.open) dialog.close();
    return;
  }
  selected = template.id;
  document.querySelector('#preview-title')!.textContent = template.label;
  document.querySelector('#preview-description')!.textContent = template.description;
  document.querySelector('#preview-status')!.textContent = '';
  if (!frame.isConnected || frame.getAttribute('src') !== `${template.id}/`) {
    frame.remove();
    frame = document.createElement('iframe');
    frame.id = 'preview-frame';
    frame.src = `${template.id}/`;
    frame.addEventListener('load', syncTheme);
    viewport.append(frame);
  }
  frame.title = `${template.label} interactive preview`;
  if (!dialog.open) dialog.showModal();
  sizePreview();
};
const closePreview = () => {
  if (history.state?.oeLayoutPreview) { frame.remove(); history.back(); }
  else {
    const url = new URL(location.href);
    url.searchParams.delete('preview');
    history.replaceState(history.state, '', url);
    syncFromUrl();
  }
};
document.querySelectorAll<HTMLElement>('[data-preview]').forEach(button => button.addEventListener('click', () => {
  opener = button;
  const url = new URL(location.href);
  url.searchParams.set('preview', button.dataset.preview!);
  history.pushState({ ...history.state, oeLayoutPreview: true }, '', url);
  syncFromUrl();
}));
dialog.querySelector('[data-close-preview]')!.addEventListener('click', closePreview);
dialog.addEventListener('cancel', event => { event.preventDefault(); closePreview(); });
dialog.addEventListener('close', () => { if (!dialog.open) frame.remove(); opener?.focus({ preventScroll: true }); });
// Keep Tab cycling inside the modal instead of moving to browser chrome.
dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const first = dialog.querySelector<HTMLElement>('[data-close-preview]')!;
  const last = dialog.querySelector<HTMLElement>('#preview-open')!;
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
dialog.querySelectorAll<HTMLButtonElement>('[data-viewport]').forEach(button => button.addEventListener('click', () => {
  phone = button.dataset.viewport === 'phone';
  dialog.querySelectorAll<HTMLElement>('[data-viewport]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  sizePreview();
}));
dialog.querySelector('#preview-open')!.addEventListener('click', () => { if (selected) window.open(`${selected}/`, '_blank', 'noopener'); });
dialog.querySelector('[data-copy-template]')!.addEventListener('click', async () => {
  if (!selected) return;
  const status = document.querySelector('#preview-status')!;
  try { await navigator.clipboard.writeText(templateSource(selected)); status.textContent = 'HTML copied to clipboard'; }
  catch { status.textContent = 'Copy is blocked in this browser. Open the full page to inspect the template.'; }
});
addEventListener('popstate', syncFromUrl);
// Keyboard events do not bubble out of an iframe. The local template forwards Escape.
addEventListener('message', event => {
  if (event.origin === location.origin && event.source === frame.contentWindow && event.data === 'oe-preview-escape' && dialog.open) closePreview();
});
new ResizeObserver(sizePreview).observe(stage);
const syncTheme = () => {
  const doc = frame.contentDocument;
  if (!doc) return;
  if (document.documentElement.dataset.theme) doc.documentElement.dataset.theme = document.documentElement.dataset.theme;
  else delete doc.documentElement.dataset.theme;
};
frame.addEventListener('load', syncTheme);
new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
syncFromUrl();

document.querySelectorAll<HTMLElement>('.shell-preview-scaled').forEach(box => {
  const thumbnail = box.querySelector('iframe')!;
  new ResizeObserver(() => {
    const scale = box.clientWidth / WIDE.width;
    thumbnail.style.transform = `scale(${scale})`;
    box.style.height = `${WIDE.height * scale}px`;
  }).observe(box);
});
