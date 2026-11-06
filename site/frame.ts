import '../dist/tokens.css';
import '../dist/components.css';
import './site.css';
import { version } from '../package.json';
import { PAGES, type PageId } from './nav.ts';
import { lucideSvg } from './shared.ts';

const THEMES = [
  ['auto', 'Match system theme', 'monitor'],
  ['light', 'Light theme', 'sun'],
  ['dark', 'Dark theme', 'moon'],
];

const mountTheme = () => {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-set-theme]')];
  const apply = (theme: string) => {
    if (theme === 'auto') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setTheme === theme)));
    try {
      if (theme === 'auto') localStorage.removeItem('oe-theme');
      else localStorage.setItem('oe-theme', theme);
    } catch {
      // Storage can be blocked. The theme still applies for this visit.
    }
  };
  apply(document.documentElement.dataset.theme ?? 'auto');
  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.setTheme!)));
};

const mountSidenav = () => {
  const toggle = document.querySelector<HTMLButtonElement>('.oe-shell-toggle')!;
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'false';
    toggle.setAttribute('aria-expanded', String(open));
    try {
      localStorage.setItem('oe-sidenav', open ? 'open' : 'closed');
    } catch {
      // Storage can be blocked. The toggle still works for this visit.
    }
  });
};

const savedSidenav = () => {
  try {
    return localStorage.getItem('oe-sidenav') !== 'closed';
  } catch {
    return true;
  }
};

const mountCopy = () => {
  const toast = document.querySelector<HTMLElement>('#toast')!;
  let timer = 0;
  const copy = async (text: string) => {
    let message = `Copied ${text}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      message = 'Copy is blocked in this browser';
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(timer);
    timer = window.setTimeout(() => toast.classList.remove('show'), 1600);
  };
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const copyable = target.closest<HTMLElement>('[data-copy]');
    if (copyable) copy(copyable.dataset.copy!);
    const codeBtn = target.closest<HTMLElement>('[data-copy-code]');
    if (codeBtn) copy(codeBtn.parentElement!.querySelector('code')!.textContent!);
    if (target.closest('.demo a')) e.preventDefault();
  });
};

export const mountPage = (id: PageId, main: string) => {
  // Relative links, so the site works from any folder on any host.
  const root = id === 'home' ? './' : '../';
  document.body.insertAdjacentHTML(
    'afterbegin',
    `<a class="oe-skip-link" href="#main">Skip to content</a>
    <div class="oe-shell">
      <nav class="oe-sidenav" id="site-nav" popover aria-label="Pages">
        <a class="oe-sidenav-brand" href="${root}"><span class="brand-mark"></span><span class="brand-text">Oestergaard<small>Design system v${version}</small></span></a>
        <div class="oe-sidenav-body">
          <ul class="oe-nav-list">
            ${PAGES.map((p) => `<li><a class="oe-nav-item" href="${root}${p.path}" title="${p.label}"${p.id === id ? ' aria-current="page"' : ''}>${lucideSvg(p.icon)}${p.label}</a></li>`).join('')}
          </ul>
        </div>
        <div class="oe-sidenav-foot">
          <a class="oe-nav-item" href="https://github.com/Oestergaard-A-S/design-system" title="Source">${lucideSvg('code-xml')}Source</a>
        </div>
      </nav>
      <div class="oe-shell-main">
        <header class="oe-topbar">
          <button class="oe-btn oe-btn-ghost oe-btn-icon oe-shell-menu" type="button" popovertarget="site-nav" aria-label="Open navigation">${lucideSvg('menu')}</button>
          <button class="oe-btn oe-btn-ghost oe-btn-icon oe-shell-toggle" type="button" aria-expanded="${savedSidenav()}" aria-controls="site-nav" aria-label="Toggle sidebar" title="Toggle sidebar">${lucideSvg('panel-left')}</button>
          <nav class="oe-breadcrumb" aria-label="Breadcrumb">
            <ol>
              ${id === 'home' ? '' : `<li><a href="${root}">Design system</a></li>`}
              <li aria-current="page">${id === 'home' ? 'Design system' : PAGES.find((p) => p.id === id)!.label}</li>
            </ol>
          </nav>
          <div class="oe-topbar-actions">
            <div class="oe-segmented" role="group" aria-label="Color theme">
              ${THEMES.map(([theme, label, name]) => `<button type="button" data-set-theme="${theme}" aria-label="${label}" title="${label}">${lucideSvg(name)}</button>`).join('')}
            </div>
          </div>
        </header>
        <main class="oe-page" id="main">${main}</main>
      </div>
    </div>
    <div id="toast" class="oe-toast toast" role="status" aria-live="polite"></div>`,
  );
  mountTheme();
  mountSidenav();
  mountCopy();
};
