import { navigateDemo } from '../demo-navigation.ts';
import { escapeHtml } from './shared.ts';

const stories: Record<string, {title:string; body:string}> = {
  featured: {title:'Small improvements, shared across teams', body:'<p>The planning team started with a familiar problem: gathering the same figures before every weekly review.</p><h3>One place to prepare</h3><p>They brought the workload, available hours and open questions into one view. That made preparation easier and gave everyone the same starting point.</p><h3>Keep the useful parts</h3><p>Start small. Agree on the figures that matter, write down the next action and review the approach together after a few weeks.</p>'},
  tools: {title:'Choose the right tool',body:'<p>Begin with the task you need to complete, then look for the simplest tool that supports it.</p><h3>Three useful questions</h3><ul><li>What decision or task does this help with?</li><li>Who needs to work with the result?</li><li>Where will the information stay up to date?</li></ul><p>Use the app catalog to find the owner if you need help getting started.</p>'},
  handover: {title:'A simpler project handover',body:'<p>A good handover leaves the next person with a clear view of what matters.</p><h3>Make the next step visible</h3><p>Keep decisions, open questions, owners and dates together. Walk through the important parts and agree on who will take the next action.</p>'},
  questions: {title:'Questions that move work forward',body:'<p>A useful planning question has a clear scope and a decision behind it.</p><ul><li>Which jobs are at risk next week?</li><li>Where is demand highest compared with capacity?</li><li>What should we review before accepting more work?</li></ul><p>Start with one question, check the result and ask a follow-up.</p>'},
};
export function mountTemplateActions(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-route]').forEach(button => button.addEventListener('click', () => navigateDemo(button.dataset.route!)));
  root.querySelectorAll<HTMLElement>('[data-dismiss-dialog]').forEach(button => button.addEventListener('click', () => button.closest<HTMLDialogElement>('dialog')!.close()));
  root.querySelectorAll<HTMLElement>('[data-story]').forEach(button => button.addEventListener('click', () => {
    const story = stories[button.dataset.story!];
    if (!story) return;
    root.querySelector('#story-title')!.textContent = story.title;
    root.querySelector('[data-story-body]')!.innerHTML = story.body;
    root.querySelector<HTMLDialogElement>('#story-dialog')!.showModal();
  }));
  root.querySelectorAll<HTMLElement>('[data-app-open]').forEach(button => button.addEventListener('click', () => {
    const card = button.closest<HTMLElement>('[data-catalog-card]')!;
    root.querySelector('#app-dialog-title')!.textContent = card.dataset.name!;
    root.querySelector('[data-app-detail-description]')!.textContent = card.querySelector('[data-app-description]')!.textContent;
    root.querySelector('[data-app-detail-meta]')!.innerHTML = [['Owner',card.dataset.owner!],['Category',card.dataset.category!],['Type',card.dataset.source!],['Availability','Available to the team']].map(([label,value])=>`<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
    root.querySelector<HTMLDialogElement>('#app-dialog')!.showModal();
  }));
  root.querySelectorAll<HTMLButtonElement>('[data-save-report]').forEach(button => button.addEventListener('click', () => {
    button.textContent = 'Report saved'; button.disabled = true;
    root.querySelector('[data-report-status]')!.textContent = 'Weekly capacity saved to your workspace for this session.';
  }));
  root.querySelectorAll<HTMLElement>('[data-workspace-pane]').forEach(button => button.addEventListener('click', () => {
    root.querySelector<HTMLElement>('.oe-chat-workspace-studio')!.dataset.mobilePane = button.dataset.workspacePane!;
    root.querySelectorAll<HTMLElement>('[data-workspace-pane]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  }));
  root.querySelectorAll<HTMLElement>('[data-report-question]').forEach(button => button.addEventListener('click', () => {
    const studio = root.querySelector<HTMLElement>('.oe-chat-workspace-studio');
    if (studio) studio.dataset.mobilePane = 'chat';
    root.querySelectorAll<HTMLElement>('[data-workspace-pane]').forEach(option => option.setAttribute('aria-pressed', String(option.dataset.workspacePane === 'chat')));
    const input = root.querySelector<HTMLTextAreaElement>('[data-chat-input]')!;
    input.value = 'Which Assembly jobs should we review first?';
    input.dispatchEvent(new Event('input', {bubbles:true})); input.focus();
  }));
}
