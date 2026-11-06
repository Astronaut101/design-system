/// <reference types="vite/client" />
// Shows a file from templates/ as a page of its own, using only the package's CSS and no site styles.
import '../../dist/tokens.css';
import '../../dist/components.css';
import { lucideSvg } from '../shared.ts';
import { templateSource } from '../template-source.ts';
import type { TemplateId } from '../nav.ts';
import { mountCatalog } from '../samples/forms.ts';
import { mountChat } from '../samples/chat.ts';
import { mountComparison } from '../samples/shared.ts';
import { DEMO_ROUTES } from '../demo-navigation.ts';
import { mountTemplateActions } from '../samples/template-actions.ts';

const doc = new DOMParser().parseFromString(templateSource(document.body.dataset.template as TemplateId), 'text/html');
document.head.append(...doc.head.querySelectorAll('style'));
doc.querySelectorAll<HTMLElement>('[data-lucide]').forEach((icon) => {
  icon.outerHTML = lucideSvg(icon.dataset.lucide!);
});
doc.querySelectorAll('a[href]').forEach((link) => {
  const href = link.getAttribute('href')!;
  if (href.startsWith('#') || /^(https?:|mailto:)/.test(href)) return;
  link.setAttribute('href', DEMO_ROUTES[href] ? `../${DEMO_ROUTES[href]}/` : '#');
});
// A preview on the Layout page mustn't pull focus, and the page's scroll position, into its frame.
if (window !== window.parent) doc.querySelectorAll('[autofocus]').forEach((field) => field.removeAttribute('autofocus'));
// Shell examples stay isolated from the showcase document and its own navigation.
const shellMode = new URLSearchParams(location.search).get('shell');
if (shellMode && ['content', 'top', 'side', 'combined', 'banner'].includes(shellMode)) {
  if (shellMode === 'content' || shellMode === 'top') {
    doc.querySelector('.oe-sidenav')?.remove();
    doc.querySelector('.oe-shell')?.removeAttribute('class');
    doc.querySelector('.oe-shell-main')?.removeAttribute('class');
    doc.querySelector('.oe-page')?.setAttribute('class', 'oe-portal');
    doc.querySelectorAll('.oe-shell-toggle, .oe-shell-menu').forEach(node => node.remove());
    if (shellMode === 'content') doc.querySelector('.oe-topbar')?.remove();
    else {
      const top = doc.querySelector('.oe-topbar')!;
      top.className = 'oe-topnav';
      top.innerHTML = '<a class="oe-topnav-brand" href="../dashboard/">Northwind</a><nav class="oe-topnav-links" aria-label="Product"><a class="oe-link" href="../dashboard/">Overview</a><a class="oe-link" href="../data-table/">Orders</a></nav>';
    }
  }
  if (shellMode === 'side') {
    const menu = doc.querySelector('.oe-shell-menu')!;
    doc.querySelector('main')!.prepend(menu);
    doc.querySelector('.oe-topbar')?.remove();
  }
  if (shellMode === 'banner') doc.querySelector('main')!.insertAdjacentHTML('afterbegin', `<div class="oe-banner oe-banner-info">${lucideSvg('info')}<p>Planning data refreshes every hour.</p></div>`);
}
document.body.prepend(...doc.body.children);
mountCatalog(document);
mountChat(document);
mountComparison(document);
mountTemplateActions(document);

const toggle = document.querySelector<HTMLButtonElement>('.oe-shell-toggle');
if (location.search.includes('closed')) toggle?.setAttribute('aria-expanded', 'false');
toggle?.addEventListener('click', () => {
  toggle.setAttribute('aria-expanded', String(toggle.getAttribute('aria-expanded') === 'false'));
});

document.addEventListener('submit', (e) => {
  if ((e.target as HTMLFormElement).method !== 'dialog') e.preventDefault();
});
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.closest('a[href="#"]')) e.preventDefault();
  const opener = target.closest('[aria-haspopup="dialog"]');
  if (opener) {
    const dialog = document.getElementById(opener.getAttribute('aria-controls')!) as HTMLDialogElement | null;
    if (dialog && !dialog.open) dialog.showModal();
  }
  const reveal = target.closest('.oe-input-group > .oe-close');
  if (reveal) {
    const input = reveal.parentElement!.querySelector('input')!;
    input.type = input.type === 'password' ? 'text' : 'password';
    reveal.setAttribute('aria-pressed', String(input.type === 'text'));
  }
});

// Ticking rows swaps the filters for the bulk actions. In a real app this comes from its own state.
const selection = document.querySelector<HTMLElement>('.oe-toolbar-selection');
if (selection) {
  const filters = selection.previousElementSibling as HTMLElement;
  const status = document.querySelector('.oe-card-flush > [role="status"]')!;
  const all = document.querySelector<HTMLInputElement>('thead .oe-table-select input')!;
  const boxes = [...document.querySelectorAll<HTMLInputElement>('tbody .oe-table-select input')];
  const update = () => {
    const count = boxes.filter((box) => box.checked).length;
    boxes.forEach((box) => box.closest('tr')!.classList.toggle('oe-row-selected', box.checked));
    all.checked = count === boxes.length;
    all.indeterminate = count > 0 && count < boxes.length;
    filters.hidden = count > 0;
    selection.hidden = count === 0;
    status.textContent = count ? `${count} selected` : '';
    selection.querySelector('span')!.textContent = `${count} selected`;
  };
  all.addEventListener('change', () => {
    boxes.forEach((box) => { box.checked = all.checked; });
    update();
  });
  boxes.forEach((box) => box.addEventListener('change', update));
  selection.querySelector('button')!.addEventListener('click', () => {
    boxes.forEach((box) => { box.checked = false; });
    update();
    all.focus();
  });
}

// Follows the showcase's theme switch, which is on another page.
addEventListener('storage', (e) => {
  if (e.key !== 'oe-theme') return;
  if (e.newValue) document.documentElement.dataset.theme = e.newValue;
  else delete document.documentElement.dataset.theme;
});

// Escape from a local preview must also reach the outer native dialog.
addEventListener('keydown', event => {
  if (event.key === 'Escape' && window !== window.parent && !document.querySelector('dialog[open], [popover]:popover-open')) {
    parent.postMessage('oe-preview-escape', location.origin);
  }
});
