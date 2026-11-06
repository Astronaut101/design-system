import { button, icon, type Sample } from './shared.ts';

const topnav = `<header class="oe-topnav"><a class="oe-topnav-brand" href="#top-navigation">${icon('sparkles')}Northwind</a><nav class="oe-topnav-links" aria-label="Product"><a class="oe-link" href="#top-navigation" aria-current="page">Overview</a><button class="oe-btn oe-btn-quiet" type="button" popovertarget="product-menu" style="anchor-name:--product-menu">Products</button><button class="oe-btn oe-btn-quiet" type="button" popovertarget="resources-menu" style="anchor-name:--resources-menu">Resources</button></nav></header>
<nav class="oe-popover oe-mega-menu" id="product-menu" popover style="position-anchor:--product-menu" aria-label="Products"><div class="oe-stack"><strong>Plan and deliver</strong><a class="oe-list-item oe-link" href="#navigation-destination">${icon('chart-column')}Capacity planner</a><a class="oe-list-item oe-link" href="#navigation-destination">${icon('file-text')}Project reports</a></div><a class="oe-nav-feature oe-link" href="#navigation-destination"><strong>New: shared workspaces</strong><p>Keep decisions and reports in one place.</p></a></nav>
<nav class="oe-popover" id="resources-menu" popover style="position-anchor:--resources-menu" aria-label="Resources"><ul class="oe-nav-list"><li><a class="oe-nav-item" href="#navigation-destination">${icon('file-text')}Handbook</a></li><li><a class="oe-nav-item" href="#navigation-destination">${icon('users')}Support team</a></li></ul></nav><p class="oe-field-help" id="navigation-destination" role="status">Choose a product or resource to preview navigation.</p>`;
const crumb = (label: string, content: string, variant = '') => `<nav class="oe-breadcrumb ${variant}" aria-label="${label}"><ol>${content}</ol></nav>`;
const item = (label: string) => `<li><a href="#breadcrumbs">${label}</a></li>`;
const current = (label: string) => `<li aria-current="page">${label}</li>`;
export const navigationSamples: Sample[] = [
  { id: 'top-navigation', title: 'Top navigation and mega menu', category: 'Navigation', wide: true, description: 'Product branding, nav items and icons, a dropdown, and a rich mega menu with a featured card. Native popovers use Tab to visit links and Escape to close.', markup: topnav },
  { id: 'navigation-heading', title: 'Navigation heading switcher', category: 'Navigation', description: 'A native selector provides a keyboard-accessible workspace switcher. Side-nav headings, sections, icons and collapse controls reuse the app shell.', markup: `<div data-workspace-switcher><label class="oe-field"><span class="oe-field-label">Workspace</span><select class="oe-input" data-workspace-select><option>Northwind planning</option><option>Northwind operations</option><option>Northwind finance</option></select></label><p class="oe-field-help" data-workspace-status role="status">Northwind planning selected</p></div>` },
  { id: 'outline', title: 'Outline', category: 'Navigation', description: 'A same-page table of contents tracks the active section inside its own scroll container. Nested headings use a second indentation level.', markup: `<div class="oe-split" data-outline-demo><nav class="oe-outline" aria-label="In this guide"><a href="#outline-overview" aria-current="location">Overview</a><a href="#outline-setup" data-level="2">Setup</a><a href="#outline-review">Review</a></nav><div class="demo-outline-content" tabindex="0" aria-label="Guide content"><article id="outline-overview"><h3>Overview</h3><p>Start by describing the decision you need to make.</p></article><article id="outline-setup"><h3>Setup</h3><p>Choose the data and people involved in the review.</p></article><article id="outline-review"><h3>Review</h3><p>Share the report and agree on the next action.</p></article></div></div>` },
  { id: 'breadcrumbs', title: 'Breadcrumbs', category: 'Navigation', wide: true, description: 'The final item is the current page. These examples cover deep paths, icons, supporting text, separator variants and a native sibling selector. On phones the parent link remains reachable.', markup: `<div class="oe-stack">${crumb('Default example', item('Home') + item('Projects') + current('Capacity'))}${crumb('Deep path example', item('Home') + item('Operations') + item('Projects') + item('North site') + current('Capacity'))}${crumb('Icons example', item(`${icon('house')} Home`) + item(`${icon('settings')} Settings`) + current('Profile'))}${crumb('Supporting example', item('Home') + item('Projects') + current('Capacity'), 'oe-breadcrumb-supporting')}${['chevron','arrow','dot'].map(v => crumb(`${v} separator example`, item('Home') + item('Docs') + current('Guide'), `oe-breadcrumb-${v}`)).join('')}${crumb('Sibling switcher example', item('Home') + `<li><label class="oe-sr-only" for="breadcrumb-team">Switch team</label><select class="oe-input oe-input-sm" id="breadcrumb-team"><option>Planning</option><option>Operations</option><option>Finance</option></select></li>` + current('Overview'))}</div>` },
];

export function mountNavigation(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-outline-demo]').forEach(demo => {
    const content = demo.querySelector<HTMLElement>('.demo-outline-content')!;
    const links = [...demo.querySelectorAll<HTMLAnchorElement>('.oe-outline a')];
    const headings = [...content.querySelectorAll<HTMLElement>('article')];
    const update = () => {
      if (!content.clientHeight) return;
      const top = content.getBoundingClientRect().top;
      const atEnd = content.scrollHeight - content.scrollTop - content.clientHeight < 2;
      const active = atEnd ? headings[headings.length - 1] : headings.reduce((best, heading) => heading.getBoundingClientRect().top <= top + 40 ? heading : best, headings[0]);
      links.forEach(link => { if (link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
    };
    links.forEach(link => link.addEventListener('click', event => {
      event.preventDefault(); const target = headings.find(h => `#${h.id}` === link.hash)!;
      content.scrollTo({ top: target.offsetTop, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }));
    content.addEventListener('scroll', update); demo.closest('details.component-category')?.addEventListener('toggle', update); demo.closest('[data-component-detail]')?.addEventListener('component:show', update); update();
  });
  root.querySelectorAll<HTMLElement>('[data-workspace-switcher]').forEach(demo => {
    const select = demo.querySelector<HTMLSelectElement>('select')!;
    select.addEventListener('change', () => { demo.querySelector('[data-workspace-status]')!.textContent = `${select.value} selected`; });
  });
  const top = root.querySelector('#top-navigation');
  top?.querySelectorAll<HTMLAnchorElement>('a[href="#navigation-destination"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    top.querySelector('#navigation-destination')!.textContent = `${link.textContent!.trim()} selected — example destination`;
    link.closest<HTMLElement>('[popover]')?.hidePopover();
  }));
}
