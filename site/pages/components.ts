import { mountPage } from '../frame.ts';
import { code, lucideSvg } from '../shared.ts';
import { legacySamples } from '../samples/legacy.ts';
import { CATEGORIES, sampleHtml } from '../samples/shared.ts';
import { libraryEntries } from '../samples/gallery.ts';
import { formSamples, mountForms } from '../samples/forms.ts';
import { contentSamples, mountContent } from '../samples/content.ts';
import { navigationSamples, mountNavigation } from '../samples/navigation.ts';
import { overlaySamples, mountOverlays } from '../samples/overlays.ts';
import { chatSamples, mountChat } from '../samples/chat.ts';
import { layoutSamples, mountLayoutSamples } from '../samples/layout.ts';

const samples = [...formSamples, ...contentSamples, ...navigationSamples, ...overlaySamples, ...chatSamples(), ...layoutSamples()];
const entries = libraryEntries(legacySamples, samples, sampleHtml);
const categoryId = (name: string) => `category-${name.toLowerCase().replaceAll(' ', '-')}`;
mountPage('components', `
<div id="component-overview">
  <header class="library-intro"><div><p class="library-eyebrow">OE design system</p><h1 class="oe-page-title">Component library</h1><p class="oe-page-subtitle">Familiar building blocks for your next interface.<br />Explore a preview, then try the live example and copy its markup.</p></div></header>
  <div class="library-tools">
    <label class="oe-field"><span class="oe-field-label">Find a component</span><span class="oe-input-group">${lucideSvg('search')}<input class="oe-input" type="search" data-library-search placeholder="Search buttons, forms, chat…" aria-controls="component-categories" /></span></label>
    <div class="library-filter-list" role="group" aria-label="Filter component category"><button class="oe-btn oe-btn-secondary oe-btn-sm" type="button" data-library-category="All" aria-pressed="true">All components <span>${entries.length}</span></button>${CATEGORIES.map(c => `<button class="oe-btn oe-btn-quiet oe-btn-sm" type="button" data-library-category="${c}" aria-pressed="false">${c} <span>${entries.filter(e => e.category === c).length}</span></button>`).join('')}</div>
    <div class="library-results"><p class="note" data-library-count role="status">${entries.length} components</p><div class="component-controls"><button class="oe-btn oe-btn-quiet oe-btn-sm" type="button" data-expand-all>Expand all</button><button class="oe-btn oe-btn-quiet oe-btn-sm" type="button" data-collapse-all>Collapse all</button></div></div>
  </div>
  <div class="component-categories" id="component-categories">${CATEGORIES.map(category => `<details class="component-category" id="${categoryId(category)}" open><summary class="category-summary">${category}<span class="oe-badge oe-badge-neutral" data-category-count>${entries.filter(e => e.category === category).length}</span></summary><div class="component-tile-grid">${entries.filter(e => e.category === category).map(entry => `<article class="component-tile" data-library-tile="${entry.id}"><div class="component-tile-preview" inert aria-hidden="true"><div class="component-miniature">${entry.preview}</div></div><div class="component-tile-footer"><h2><button class="oe-btn oe-btn-quiet component-tile-action" type="button" data-component-open="${entry.id}" aria-label="View ${entry.title}">${entry.title}${lucideSvg('arrow-right')}</button></h2><p>${entry.description}</p></div></article>`).join('')}</div></details>`).join('')}</div>
  <div class="oe-empty" data-library-empty hidden>${lucideSvg('search')}<h2 class="oe-empty-title">No components found</h2><p class="oe-empty-text">Try a different name or browse all categories.</p><button class="oe-btn oe-btn-secondary" type="button" data-library-clear>Clear filters</button></div>
</div>
<div id="component-detail" hidden>
  <div class="library-detail-toolbar"><button class="oe-btn oe-btn-secondary" type="button" data-component-back>${lucideSvg('arrow-left')}All components</button><button class="oe-btn oe-btn-quiet oe-btn-sm" type="button" data-component-permalink>${lucideSvg('copy')}Copy link</button></div>
  <header class="library-detail-head"><p class="library-eyebrow" data-detail-category></p><h1 class="oe-page-title" data-detail-title tabindex="-1"></h1><p class="oe-page-subtitle" data-detail-description></p></header>
  <div class="library-detail-stage">${entries.map(e => e.html).join('')}</div>
</div>`);

const overview = document.querySelector<HTMLElement>('#component-overview')!;
const detail = document.querySelector<HTMLElement>('#component-detail')!;
const categories = [...document.querySelectorAll<HTMLDetailsElement>('.component-category')];
const search = document.querySelector<HTMLInputElement>('[data-library-search]')!;
const tiles = [...document.querySelectorAll<HTMLElement>('[data-library-tile]')];
let selectedCategory = 'All';
let selectedId: string | undefined;
let overviewScroll = {page:0, shell:0};
const shell = document.querySelector<HTMLElement>('.oe-shell-main')!;

for (const entry of entries) {
  const card = document.getElementById(entry.id)!;
  card.dataset.componentDetail = '';
  card.classList.add('component-example');
  card.hidden = true;
  const title = card.querySelector<HTMLElement>('h2');
  if (title?.classList.contains('card-title')) title.hidden = true;
  card.querySelector<HTMLElement>('.sample-description')?.remove();
  if (legacySamples.some(s => s.id === entry.id)) {
    const reference = card.cloneNode(true) as HTMLElement;
    reference.querySelector('h2.card-title')?.remove();
    card.insertAdjacentHTML('beforeend', `<details class="sample-code"><summary>Usage markup</summary>${code(reference.innerHTML)}</details>`);
  }
}

const filter = () => {
  const query = search.value.trim().toLowerCase();
  let count = 0;
  tiles.forEach(tile => {
    const entry = entries.find(e => e.id === tile.dataset.libraryTile)!;
    tile.hidden = !((selectedCategory === 'All' || selectedCategory === entry.category) && `${entry.title} ${entry.description} ${entry.category}`.toLowerCase().includes(query));
    if (!tile.hidden) count++;
  });
  categories.forEach(group => {
    const visible = group.querySelectorAll('[data-library-tile]:not([hidden])').length;
    group.hidden = !visible;
    group.querySelector('[data-category-count]')!.textContent = String(visible);
    if (query || selectedCategory !== 'All') group.open = true;
  });
  document.querySelector('[data-library-count]')!.textContent = `${count} ${count === 1 ? 'component' : 'components'}`;
  (document.querySelector('[data-library-empty]') as HTMLElement).hidden = count !== 0;
  document.querySelectorAll<HTMLElement>('[data-library-category]').forEach(button => {
    const active = button.dataset.libraryCategory === selectedCategory;
    button.setAttribute('aria-pressed', String(active));
    button.classList.toggle('oe-btn-secondary', active);
    button.classList.toggle('oe-btn-quiet', !active);
  });
};
search.addEventListener('input', filter);
document.querySelectorAll<HTMLElement>('[data-library-category]').forEach(button => button.addEventListener('click', () => { selectedCategory = button.dataset.libraryCategory!; filter(); }));
document.querySelector('[data-library-clear]')!.addEventListener('click', () => { selectedCategory = 'All'; search.value = ''; filter(); search.focus(); });
document.querySelector('[data-expand-all]')!.addEventListener('click', () => categories.forEach(c => { c.open = true; }));
document.querySelector('[data-collapse-all]')!.addEventListener('click', () => categories.forEach(c => { c.open = false; }));

const syncView = () => {
  let id = '';
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { /* Unknown fragments show the library. */ }
  const entry = entries.find(e => e.id === id);
  document.querySelectorAll<HTMLElement>('[data-component-detail]').forEach(card => {
    const wasVisible = !card.hidden;
    card.hidden = card.id !== entry?.id;
    if (wasVisible && card.hidden) {
      card.querySelectorAll<HTMLElement>('[popover]:popover-open').forEach(popup => popup.hidePopover());
      card.dispatchEvent(new Event('component:hide'));
    }
  });
  overview.hidden = Boolean(entry);
  detail.hidden = !entry;
  if (entry) {
    selectedId = entry.id;
    document.querySelector('[data-detail-category]')!.textContent = entry.category;
    document.querySelector('[data-detail-title]')!.textContent = entry.title;
    document.querySelector('[data-detail-description]')!.textContent = entry.description;
    document.getElementById(entry.id)!.dispatchEvent(new Event('component:show'));
    shell.scrollTop = 0; window.scrollTo({top:0, behavior:'instant'});
    document.querySelector<HTMLElement>('[data-detail-title]')!.focus({preventScroll:true});
    requestAnimationFrame(() => { shell.scrollTop = 0; window.scrollTo({top:0,behavior:'instant'}); });
  } else {
    const opener = selectedId ? document.querySelector<HTMLElement>(`[data-component-open="${selectedId}"]`) : null;
    opener?.focus({preventScroll:true});
    shell.scrollTo({top:overviewScroll.shell,behavior:'instant'}); window.scrollTo({top:overviewScroll.page,behavior:'instant'});
    const group = categories.find(c => c.id === id);
    if (group) { group.hidden = false; group.open = true; group.scrollIntoView({block:'start',behavior:'instant'}); }
    selectedId = undefined;
  }
};
document.querySelectorAll<HTMLElement>('[data-component-open]').forEach(button => button.addEventListener('click', () => {
  overviewScroll = {page:document.documentElement.scrollTop, shell:shell.scrollTop};
  history.pushState({ ...history.state, oeComponentView:true }, '', `#${button.dataset.componentOpen}`);
  syncView();
}));
document.querySelector('[data-component-back]')!.addEventListener('click', () => {
  if (history.state?.oeComponentView) history.back();
  else { history.replaceState(null, '', location.pathname + location.search); syncView(); }
});
document.querySelector('[data-component-permalink]')!.addEventListener('click', async () => {
  const toast = document.querySelector<HTMLElement>('#clipboard-toast')!;
  try { await navigator.clipboard.writeText(location.href); toast.textContent = 'Component link copied'; }
  catch { toast.textContent = 'Copy is blocked in this browser'; }
  toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'),1600);
});
addEventListener('hashchange',syncView); addEventListener('popstate',syncView);
document.addEventListener('submit', event => { if ((event.target as HTMLFormElement).method !== 'dialog') event.preventDefault(); });
document.querySelectorAll<HTMLElement>('[data-open]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.open!)!.dispatchEvent(new Event('demo-open'))));
document.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog => {
  dialog.addEventListener('demo-open', () => dialog.showModal());
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
});
mountForms(document); mountContent(document); mountNavigation(document); mountOverlays(document); mountChat(document); mountLayoutSamples(document);
filter(); syncView();
