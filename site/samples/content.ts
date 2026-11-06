import { button, escapeHtml, type Sample } from './shared.ts';
import { hint } from './overlays.ts';

const configLines = [
  '<span class="oe-syntax-comment">// A fictional report configuration</span>',
  '<span class="oe-syntax-keyword">const</span> report = {',
  '  title: <span class="oe-syntax-string">"Weekly capacity"</span>,',
  '  period: <span class="oe-syntax-string">"next-week"</span>,',
  '  showAvailableHours: <span class="oe-syntax-keyword">true</span>,',
  '};',
];
export const contentSamples: Sample[] = [
  { id: 'kbd', title: 'Keyboard keys and shortcuts', category: 'Content', description: 'Use semantic kbd elements for keys. Keep shortcut hints next to an action; the application must implement the shortcut.', markup: '<div class="oe-stack"><p>Send <kbd class="oe-kbd">Enter</kbd> · New line <kbd class="oe-kbd">Shift</kbd> + <kbd class="oe-kbd">Enter</kbd></p><p>Search <kbd class="oe-kbd">⌘</kbd> + <kbd class="oe-kbd">K</kbd> on Mac, <kbd class="oe-kbd">Ctrl</kbd> + <kbd class="oe-kbd">K</kbd> on Windows.</p><p>Dismiss <kbd class="oe-kbd">Esc</kbd> · Move <kbd class="oe-kbd">↑</kbd> <kbd class="oe-kbd">↓</kbd></p></div>' },
  { id: 'code-blocks', title: 'Code blocks', category: 'Content', description: 'Pre-tokenized syntax uses OE text roles. Copy retrieves the original code without line numbers. Use an accessible, bounded scroll region for long files.', markup: `<div class="oe-stack"><div class="oe-code-panel" data-code-demo><div class="oe-code-head"><strong>report.ts · TypeScript</strong>${button('Copy code', 'data-code-copy', 'secondary oe-btn-sm')}</div><pre tabindex="0" aria-label="report.ts source"><code>${configLines.map((line, i) => `<span class="oe-code-line"${i === 3 ? ' data-highlighted' : ''}><span class="oe-code-number" aria-hidden="true">${i + 1}</span>${line}</span>`).join('\n')}</code></pre><p role="status" data-code-status></p></div><div class="oe-code-panel" data-code-demo><div class="oe-code-head"><span>Shell</span>${button('Copy command', 'data-code-copy', 'secondary oe-btn-sm')}</div><pre tabindex="0" aria-label="Install command"><code>npm install github:Oestergaard-A-S/design-system</code></pre><p role="status" data-code-status></p></div><details><summary>Long configuration example</summary><pre class="oe-code-block oe-code-scroll" tabindex="0" aria-label="Scrollable report settings"><code>${escapeHtml(Array.from({length:24}, (_,i)=>`section_${i + 1}: enabled`).join('\n'))}</code></pre></details></div>` },
  { id: 'timestamp', title: 'Timestamp', category: 'Content', description: 'Use time with an ISO datetime. Relative labels reveal precise, copyable times in Manila, Copenhagen and UTC. Intl handles daylight saving.', markup: `<div class="oe-stack" data-timestamp-demo><p>Updated ${hint('timestamp-detail', '<time class="oe-timestamp" data-relative datetime="2026-11-06T08:00:00Z">2 hours ago</time>', '<strong>Exact time</strong><dl class="oe-dl" data-time-zones></dl>')}</p><p>Absolute: <time class="oe-timestamp" data-absolute datetime="2026-11-06T08:00:00Z">6 November 2026, 08:00 UTC</time></p><p>Older activity: <time class="oe-timestamp" datetime="2026-09-01T08:00:00Z">1 September 2026, 08:00 UTC</time></p><p class="oe-field-help" data-time-status role="status"></p></div>` },
];

export function mountContent(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-code-demo]').forEach(demo => {
    demo.querySelector('[data-code-copy]')!.addEventListener('click', async () => {
      const source = demo.querySelector('code')!.cloneNode(true) as HTMLElement;
      source.querySelectorAll('.oe-code-number').forEach(number => number.remove());
      try { await navigator.clipboard.writeText(source.textContent!); demo.querySelector('[data-code-status]')!.textContent = 'Code copied'; }
      catch { demo.querySelector('[data-code-status]')!.textContent = 'Copy is blocked in this browser. Select the code to copy it.'; }
    });
  });
  root.querySelectorAll<HTMLElement>('[data-timestamp-demo]').forEach(demo => {
    const date = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const relative = demo.querySelector<HTMLTimeElement>('[data-relative]')!;
    relative.dateTime = date.toISOString();
    const absolute = demo.querySelector<HTMLTimeElement>('[data-absolute]')!;
    absolute.dateTime = date.toISOString();
    const format = (zone: string) => new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'long', timeZone: zone }).format(date);
    absolute.textContent = format('UTC');
    const update = () => { relative.textContent = new Intl.RelativeTimeFormat('en', {numeric:'auto'}).format(-Math.round((Date.now() - date.getTime()) / 3600000), 'hour'); };
    update();
    const timer = window.setInterval(update, 60000);
    addEventListener('pagehide', () => clearInterval(timer), {once:true});
    demo.querySelector('[data-time-zones]')!.innerHTML = [['Manila','Asia/Manila'],['Copenhagen','Europe/Copenhagen'],['UTC','UTC']].map(([label, zone]) => `<div><dt>${label}</dt><dd>${escapeHtml(format(zone))}${button(`Copy ${label}`, `data-copy-time="${zone}"`, 'quiet oe-btn-sm')}</dd></div>`).join('');
    demo.querySelectorAll<HTMLElement>('[data-copy-time]').forEach(trigger => trigger.addEventListener('click', async () => {
      const status = demo.querySelector('[data-time-status]')!;
      try { await navigator.clipboard.writeText(format(trigger.dataset.copyTime!)); status.textContent = 'Exact time copied'; }
      catch { status.textContent = 'Copy is blocked in this browser'; }
    }));
  });
}
