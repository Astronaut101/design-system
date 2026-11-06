/// <reference types="vite/client" />
// Shows a file from templates/ as a page of its own, using only the package's CSS and no site styles.
import '../../dist/tokens.css';
import '../../dist/components.css';
import { lucideSvg } from '../shared.ts';

const FILES = import.meta.glob<string>('../../templates/*.html', { query: '?raw', import: 'default', eager: true });

// The templates link to the routes a real app would have, so here those lead to each other.
const ROUTES: Record<string, string> = {
  '/': 'dashboard',
  '/orders': 'data-table',
  '/orders/new': 'form',
  '/orders/2041': 'detail',
  '/settings': 'settings',
  '/sign-in': 'sign-in',
};

const doc = new DOMParser().parseFromString(FILES[`../../templates/${document.body.dataset.template}.html`], 'text/html');
document.head.append(...doc.head.querySelectorAll('style'));
doc.querySelectorAll<HTMLElement>('[data-lucide]').forEach((icon) => {
  icon.outerHTML = lucideSvg(icon.dataset.lucide!);
});
doc.querySelectorAll('a[href]').forEach((link) => {
  const href = link.getAttribute('href')!;
  if (href.startsWith('#')) return;
  link.setAttribute('href', ROUTES[href] ? `../${ROUTES[href]}/` : '#');
});
// A preview on the Layout page mustn't pull focus, and the page's scroll position, into its frame.
if (window !== window.parent) doc.querySelectorAll('[autofocus]').forEach((field) => field.removeAttribute('autofocus'));
document.body.prepend(...doc.body.children);

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
  if (opener) document.querySelector<HTMLDialogElement>(`#${opener.getAttribute('aria-controls')}`)!.showModal();
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
