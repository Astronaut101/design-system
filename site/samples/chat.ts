import { navigateDemo } from '../demo-navigation.ts';
import { button, escapeHtml, icon, templatePart, type Sample } from './shared.ts';

const uniqueComposer = (suffix: string) => templatePart('chat-landing', '[data-chat-composer]').replaceAll('composer-help', `composer-help-${suffix}`);
export const CHAT_PARTS = ['composer','composer-drawer','composer-input','composer-token-element','dictation-button','layout','layout-scroll-button','message','message-bubble','message-list','message-metadata','send-button','system-message','tokenized-text','tool-calls'] as const;
export const chatSamples = (): Sample[] => {
  const message = templatePart('chat-workspace', '[data-author="assistant"]');
  const thread = templatePart('chat-workspace', '[data-chat-thread]');
  const examples: Record<typeof CHAT_PARTS[number], [string, string, string]> = {
    composer: ['Composer', 'A complete composer with context drawer, mentions, send/stop and simulated dictation. Enter sends; Shift+Enter adds a line.', `<div class="oe-chat" data-chat-demo>${uniqueComposer('full')}</div>`],
    'composer-drawer': ['Composer drawer', 'Native details holds removable local attachment context. No files are uploaded.', `<div data-chat-demo>${uniqueComposer('drawer')}</div>`],
    'composer-input': ['Composer input', 'Use a labeled textarea. Empty drafts cannot send; disabled input explains its state.', `<label class="oe-field"><span class="oe-field-label">Draft message</span><textarea class="oe-input" placeholder="Write a message…"></textarea></label><label class="oe-field"><span class="oe-field-label">Unavailable composer</span><textarea class="oe-input" disabled aria-describedby="offline-help">Connecting…</textarea><small class="oe-field-help" id="offline-help">Sending is unavailable while reconnecting.</small></label>`],
    'composer-token-element': ['Composer token element', 'A removable context chip is separate from the plain-text draft. The application stores its stable value.', `<div data-chat-demo>${uniqueComposer('tokens')}</div>`],
    'dictation-button': ['Dictation button', 'Idle and listening are simulated. Unsupported browsers should retain a normal text composer.', `<div data-chat-demo>${uniqueComposer('mic')}<p>Unsupported state: ${button('Voice input unavailable', 'disabled aria-label="Dictation unavailable in this browser"')}</p></div>`],
    layout: ['Layout', 'A transcript, scroll control and persistent composer form a complete local conversation.', `<div class="oe-chat" data-chat-demo>${thread}${button('Latest messages ↓', 'data-chat-scroll hidden', 'secondary oe-chat-scroll')}${uniqueComposer('layout')}</div>`],
    'layout-scroll-button': ['Layout scroll button', 'Scroll away from the latest message to reveal the button. New responses preserve your reading position.', `<div class="oe-chat" data-chat-demo>${thread}${button('Add sample message', 'data-add-message')}${button('Latest messages ↓', 'data-chat-scroll hidden', 'secondary oe-chat-scroll')}</div>`],
    message: ['Message', 'Group author metadata, tool activity, content and actions in a semantic article.', `<div data-chat-demo>${message}</div>`],
    'message-bubble': ['Message bubble', 'Use distinct alignment and surface treatment for user and assistant content.', '<div class="oe-chat"><article class="oe-chat-message" data-author="user"><div class="oe-chat-bubble">Can you summarize this week?</div></article><article class="oe-chat-message" data-author="assistant"><div class="oe-chat-bubble">Here is a short summary of the sample workload.</div></article></div>'],
    'message-list': ['Message list', 'An accessible log retains chronological reading order. Announce new messages politely.', thread],
    'message-metadata': ['Message metadata', 'Show author, exact time and delivery state without relying on color.', `<div class="oe-chat-meta"><span class="oe-avatar oe-avatar-sm">MH</span><strong>Maja Holm</strong><time datetime="2026-11-06T08:00:00Z">08:00 UTC</time><span>Delivered</span></div>`],
    'send-button': ['Send button', 'Empty drafts disable Send. During simulated generation the same action becomes Stop.', `<div data-chat-demo>${uniqueComposer('send')}</div>`],
    'system-message': ['System message', 'Separate contextual events from participant messages.', `<p class="oe-chat-system">${icon('info')}New conversation started · Sample workspace</p>`],
    'tokenized-text': ['Tokenized text', 'Render recognized context as inline chips while preserving surrounding text and reading order.', '<p>Compare <span class="oe-badge oe-badge-neutral">@Capacity</span> with <span class="oe-badge oe-badge-neutral">@Available hours</span> for next week.</p>'],
    'tool-calls': ['Tool calls', 'Single and grouped calls expose pending, running, complete and error states. Expand a result to inspect sample output.', `<details class="oe-chat-tools" open><summary>4 tool calls · sample states</summary><p data-status="pending">○ Pending · Read planning scope</p><p data-status="running">${icon('sparkles')}Running · Fetch capacity</p><details><summary>✓ Complete · Read hours · 0.4s</summary><pre class="oe-code-block"><code>Available hours: 144</code></pre></details><p data-status="error">${icon('circle-x')}Error · Refresh report — retry available</p></details>`],
  };
  return CHAT_PARTS.map(id => ({ id: `chat-${id}`, title: `Chat ${examples[id][0].toLowerCase()}`, category: 'Chat', description: examples[id][1], markup: examples[id][2], wide: id === 'layout' }));
};

export function mountChat(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-chat-demo]').forEach(demo => {
    const form = demo.querySelector<HTMLFormElement>('[data-chat-composer]');
    const input = form?.querySelector<HTMLTextAreaElement>('[data-chat-input]');
    const send = form?.querySelector<HTMLButtonElement>('[data-send]');
    let thread = demo.querySelector<HTMLElement>('[data-chat-thread]');
    const scroll = demo.querySelector<HTMLElement>('[data-chat-scroll]');
    let busy = false, timer = 0, response: HTMLElement | undefined;
    const atBottom = () => !thread || thread.scrollHeight - thread.scrollTop - thread.clientHeight < 48;
    const updateScroll = () => { if (scroll) scroll.hidden = atBottom(); };
    const bindThread = () => thread?.addEventListener('scroll', updateScroll);
    bindThread();
    const updateSend = () => { if (send) { send.disabled = !busy && !input?.value.trim(); send.textContent = busy ? 'Stop' : 'Send'; send.setAttribute('aria-label', busy ? 'Stop response' : 'Send message'); } };
    const status = (text: string) => { const node = form?.querySelector('[data-chat-status]'); if (node) node.textContent = text; };
    const append = (author: string, text: string) => {
      if (!thread) {
        thread = document.createElement('div'); thread.className = 'oe-chat-thread'; thread.dataset.chatThread = ''; thread.setAttribute('role','log'); thread.setAttribute('aria-label','Conversation'); thread.setAttribute('aria-live','polite'); thread.tabIndex = 0;
        demo.prepend(thread); bindThread();
      }
      const follow = atBottom();
      const article = document.createElement('article'); article.className = 'oe-chat-message'; article.dataset.author = author;
      article.innerHTML = `<div class="oe-chat-meta">${author === 'user' ? 'You' : 'Northwind assistant'} · <time datetime="${new Date().toISOString()}">${new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'UTC'}).format(new Date())} UTC</time></div><div class="oe-chat-bubble">${escapeHtml(text)}</div>`;
      thread.append(article);
      if (follow) thread.scrollTop = thread.scrollHeight;
      updateScroll(); return article;
    };
    const finish = (stopped = false) => {
      clearTimeout(timer); busy = false;
      if (response) {
        response.querySelector('.oe-chat-bubble')!.textContent = stopped ? 'Response stopped. You can send another message.' : 'In this sample, Assembly has the highest load at 82%. Review available hours before adding work.';
        response.setAttribute('aria-busy', 'false');
      }
      status(stopped ? 'Response stopped' : 'Sample response complete'); updateSend(); updateScroll();
    };
    form?.addEventListener('submit', event => {
      event.preventDefault();
      if (busy) { finish(true); return; }
      const text = input!.value.trim(); if (!text) return;
      if (demo.hasAttribute('data-landing')) {
        // Session-only draft handoff to the local workspace; no network request.
        try { sessionStorage.setItem('oe-demo-prompt', text); } catch { /* The workspace also works without storage. */ }
        navigateDemo(demo.dataset.workspaceRoute || '/workspace'); return;
      }
      append('user', text); input!.value = ''; busy = true; updateSend(); status('Generating a local sample response…');
      response = append('assistant', 'Reviewing the sample capacity…');
      response.setAttribute('aria-busy', 'true');
      const words = 'In this sample, Assembly has the highest load at 82%. Review available hours before adding work.'.split(' ');
      let count = 0;
      const stream = () => {
        if (!busy) return;
        const follow = atBottom();
        count += 2;
        response!.querySelector('.oe-chat-bubble')!.textContent = words.slice(0, count).join(' ');
        if (follow) thread!.scrollTop = thread!.scrollHeight;
        updateScroll();
        if (count >= words.length) finish();
        else timer = window.setTimeout(stream, 180);
      };
      timer = window.setTimeout(stream, 180);
    });
    input?.addEventListener('input', updateSend);
    input?.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); if (!busy && input.value.trim()) form!.requestSubmit(); } });
    demo.querySelectorAll<HTMLButtonElement>('[data-prompt]').forEach(button => button.addEventListener('click', () => { input!.value = button.dataset.promptText || button.textContent!.trim(); updateSend(); input!.focus(); }));
    demo.querySelectorAll<HTMLButtonElement>('[data-remove-attachment]').forEach(button => button.addEventListener('click', () => { button.closest('.oe-chat-attachment')!.remove(); form?.querySelector<HTMLElement>('summary')?.focus(); status('Sample attachment removed'); }));
    demo.querySelectorAll<HTMLButtonElement>('[data-mention]').forEach(button => button.addEventListener('click', () => {
      const tokens = form!.querySelector('[data-chat-tokens]')!;
      if (!tokens.childElementCount) {
        tokens.innerHTML = `<span class="oe-badge oe-badge-neutral">@Capacity<button class="oe-badge-remove" type="button" aria-label="Remove Capacity mention">${icon('x')}</button></span>`;
        tokens.querySelector('button')!.addEventListener('click', () => { tokens.replaceChildren(); input!.focus(); });
      }
      input!.value += `${input!.value ? ' ' : ''}@Capacity `; updateSend(); input!.focus();
    }));
    demo.querySelectorAll<HTMLButtonElement>('[data-dictation]').forEach(button => button.addEventListener('click', () => {
      const listening = button.getAttribute('aria-pressed') !== 'true'; button.setAttribute('aria-pressed', String(listening)); button.innerHTML = icon(listening ? 'x' : 'mic');
      if (listening) { input!.value += 'Show next week’s capacity'; updateSend(); }
      status(listening ? 'Simulated listening. No microphone is being used.' : 'Simulated dictation stopped.');
    }));
    demo.querySelectorAll<HTMLButtonElement>('[data-copy-response]').forEach(button => button.addEventListener('click', async () => {
      const original = button.textContent!;
      try { await navigator.clipboard.writeText(button.closest('.oe-chat-message')!.querySelector('.oe-chat-bubble')!.textContent!); button.textContent = 'Copied'; }
      catch { button.textContent = 'Copy blocked'; }
      window.setTimeout(() => { button.textContent = original; }, 1600);
    }));
    scroll?.addEventListener('click', () => { thread!.scrollTop = thread!.scrollHeight; updateScroll(); });
    demo.querySelector('[data-add-message]')?.addEventListener('click', () => { append('assistant', 'Another sample update. Review the planning details before your next handover.'); });
    // A collapsed category has no layout yet; measure when its details opens.
    demo.closest('details.component-category')?.addEventListener('toggle', updateScroll);
    demo.closest('[data-component-detail]')?.addEventListener('component:show', updateScroll);
    updateSend(); updateScroll();
    addEventListener('pagehide', () => clearTimeout(timer), {once:true});
    if (document.body.dataset.template === 'chat-workspace' && input) {
      try { const prompt = sessionStorage.getItem('oe-demo-prompt'); if (prompt) { input.value = prompt; sessionStorage.removeItem('oe-demo-prompt'); updateSend(); form!.requestSubmit(); } } catch { /* Optional draft handoff. */ }
    }
  });
}
