import { mountPage } from '../frame.ts';
import { TEMPLATES } from '../nav.ts';
import { code, pageHead } from '../shared.ts';

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
  ${pageHead('Layout', 'One app shell and six page templates, from desktop to phone.')}
  <div class="stack">
    <div class="size-grid">
      ${TEMPLATES.map(
        ({ id, label }) => `<a class="oe-card template-card" href="${id}/">
        <h2 class="card-title">${label}</h2>
        <div class="shell-preview shell-preview-scaled" inert><iframe src="${id}/" title="${label} template" width="${WIDE.width}" height="${WIDE.height}" loading="lazy"></iframe></div>
      </a>`,
      ).join('')}
    </div>
    <div class="oe-card">
      <h2 class="card-title">Desktop</h2>
      <div class="shell-preview shell-preview-wide">
        <iframe src="dashboard/" title="Example app at desktop width" width="${WIDE.width}" height="${WIDE.height}" loading="lazy"></iframe>
      </div>
    </div>
    <div class="oe-card">
      <h2 class="card-title">Sidebar closed</h2>
      <div class="shell-preview shell-preview-wide">
        <iframe src="dashboard/?closed" title="Example app with the sidebar closed" width="${WIDE.width}" height="${WIDE.height}" loading="lazy"></iframe>
      </div>
    </div>
    <div class="oe-card">
      <h2 class="card-title">Phone</h2>
      <div class="shell-preview shell-preview-phone">
        <iframe src="dashboard/" title="Example app at phone width" height="640" loading="lazy"></iframe>
      </div>
    </div>
    <div class="oe-card">
      <h2 class="card-title">Markup</h2>
      ${code(SHELL)}
    </div>
  </div>`;

mountPage('layout', layoutPage());

// The shell changes layout at the frame's own width, so the desktop frame stays wide and scales to fit.
document.querySelectorAll<HTMLElement>('.shell-preview-wide, .shell-preview-scaled').forEach((box) => {
  const frame = box.querySelector('iframe')!;
  new ResizeObserver(() => {
    const scale = box.clientWidth / WIDE.width;
    frame.style.transform = `scale(${scale})`;
    box.style.height = `${WIDE.height * scale}px`;
  }).observe(box);
});
