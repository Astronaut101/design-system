import { button, escapeHtml, icon, type Sample } from './shared.ts';

export const hint = (id: string, label: string, body: string, tooltip = false) => `<button class="oe-btn oe-btn-quiet${tooltip ? '' : ' oe-hover-trigger'}" type="button" data-hint="${id}" aria-describedby="${id}"${tooltip ? '' : ` aria-expanded="false" aria-controls="${id}"`}>${label}</button><div class="${tooltip ? 'oe-tooltip demo-tooltip' : 'oe-hover-card'} demo-popover" id="${id}" popover="manual"${tooltip ? ' role="tooltip"' : ''}>${body}</div>`;
export const overlaySamples: Sample[] = [
  { id: 'hover-card', title: 'Hover card', category: 'Overlays', description: 'Supplementary context opens on hover, focus or tap. It stays visible while hovered; Escape dismisses it. Keep essential actions outside the card.', markup: `<div class="oe-chat-actions">${hint('hint-definition', 'What is capacity?', '<strong>Capacity</strong><p>The available working hours for a team or work center.</p>')}${hint('hint-profile', 'Maja Holm', '<span class="oe-avatar oe-avatar-lg">MH</span><h3>Maja Holm</h3><p>Planning lead · Northwind</p><p>Coordinates the weekly capacity review.</p>')}${hint('hint-link', 'Preview the handbook', '<strong>Team handbook</strong><p>Practical guides for planning and project handovers.</p><small>Example resource · No navigation required</small>')}</div>` },
  { id: 'tooltip', title: 'Tooltip', category: 'Overlays', description: 'Short, supplementary descriptions open on hover or focus and dismiss with Escape. Every control still has its own accessible name.', markup: `<div class="oe-chat-actions">${hint('hint-save', `${icon('save')}Save report`, 'Save this report to your workspace.', true)}${hint('hint-pin', `${icon('pin')}Pin app`, 'Keep this app at the top of the catalog.', true)}</div>` },
  { id: 'toast', title: 'Toast', category: 'Feedback', description: 'Trigger an announcement. Dismissal pauses during hover or focus; the optional Undo action runs locally. Demo notifications are separate from clipboard feedback.', markup: `<div data-toast-demo><div class="oe-chat-actions">${['info', 'success', 'warning', 'danger'].map(intent => button(`Show ${intent}`, `data-toast-intent="${intent}"`)).join('')}</div><p class="sample-output" data-toast-result role="status"></p><div class="oe-toaster" data-demo-toaster role="status" aria-live="polite" aria-label="Demo notifications"></div></div>` },
];

export function mountHints(root: ParentNode) {
  root.querySelectorAll<HTMLButtonElement>('[data-hint]').forEach(trigger => {
    const popup = document.getElementById(trigger.dataset.hint!)!;
    let hovered = false, suppressed = false, timer = 0;
    const position = () => {
      if (!popup.matches(':popover-open')) return;
      const rect = trigger.getBoundingClientRect();
      popup.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - popup.offsetWidth - 8))}px`;
      popup.style.top = `${Math.max(8, rect.bottom + popup.offsetHeight + 12 > innerHeight ? rect.top - popup.offsetHeight - 8 : rect.bottom + 8)}px`;
    };
    const show = () => {
      clearTimeout(timer);
      if (suppressed) return;
      if (!popup.matches(':popover-open')) popup.showPopover();
      trigger.setAttribute('aria-expanded', 'true'); position();
    };
    const hide = () => { clearTimeout(timer); popup.hidePopover(); trigger.setAttribute('aria-expanded', 'false'); };
    const scheduleHide = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => { if (!hovered && document.activeElement !== trigger && !popup.contains(document.activeElement)) hide(); }, 140);
    };
    trigger.addEventListener('pointerenter', () => { hovered = true; show(); });
    trigger.addEventListener('pointerleave', () => { hovered = false; suppressed = false; scheduleHide(); });
    popup.addEventListener('pointerenter', () => { hovered = true; clearTimeout(timer); });
    popup.addEventListener('pointerleave', () => { hovered = false; scheduleHide(); });
    trigger.addEventListener('focus', show);
    trigger.addEventListener('blur', () => { suppressed = false; scheduleHide(); });
    popup.addEventListener('focusout', scheduleHide);
    trigger.addEventListener('click', show);
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && popup.matches(':popover-open')) { suppressed = true; const returnFocus = popup.contains(document.activeElement); hide(); if (returnFocus) trigger.focus(); event.preventDefault(); } };
    trigger.closest('details.component-category')?.addEventListener('toggle', event => { if (!(event.target as HTMLDetailsElement).open) hide(); });
    trigger.closest('[data-component-detail]')?.addEventListener('component:hide', hide);
    trigger.addEventListener('keydown', escape); popup.addEventListener('keydown', escape);
    // Escape also works when opened only by pointer, without moving keyboard focus.
    document.addEventListener('keydown', escape);
    addEventListener('resize', position); document.addEventListener('scroll', position, true);
  });
}
export function mountOverlays(root: ParentNode) {
  mountHints(root);
  root.querySelectorAll<HTMLElement>('[data-toast-demo]').forEach(demo => {
    const icons: Record<string, string> = { info: 'info', success: 'circle-check', warning: 'triangle-exclamation-point', danger: 'circle-x' };
    demo.querySelectorAll<HTMLButtonElement>('[data-toast-intent]').forEach(trigger => trigger.addEventListener('click', () => {
      const intent = trigger.dataset.toastIntent!;
      const toast = document.createElement('div'); toast.className = `oe-toast oe-toast-${intent}`;
      toast.innerHTML = `${icon(icons[intent])}<div><p class="oe-toast-title">${escapeHtml(intent === 'success' ? 'Report saved' : intent === 'danger' ? 'Could not save report' : intent === 'warning' ? 'Review required' : 'Report ready')}</p><p>Local demonstration notification.</p></div>${button('Undo', 'data-undo', 'secondary oe-btn-sm')}<button class="oe-close" type="button" aria-label="Dismiss notification">${icon('x')}</button>`;
      demo.querySelector('[data-demo-toaster]')!.append(toast);
      let remaining = 5000, started = 0, timer = 0, hovered = false;
      const remove = () => { clearTimeout(timer); if (toast.contains(document.activeElement)) trigger.focus(); toast.remove(); };
      const pause = () => { if (timer) { remaining -= performance.now() - started; clearTimeout(timer); timer = 0; } };
      const resume = () => { pause(); if (!hovered && !toast.contains(document.activeElement)) { started = performance.now(); timer = window.setTimeout(remove, remaining); } };
      toast.addEventListener('pointerenter', () => { hovered = true; pause(); });
      toast.addEventListener('pointerleave', () => { hovered = false; resume(); });
      toast.addEventListener('focusin', pause); toast.addEventListener('focusout', () => queueMicrotask(resume));
      toast.querySelector('.oe-close')!.addEventListener('click', remove);
      toast.querySelector('[data-undo]')!.addEventListener('click', () => { demo.querySelector('[data-toast-result]')!.textContent = 'Demo action undone.'; remove(); });
      resume();
    }));
  });
}
