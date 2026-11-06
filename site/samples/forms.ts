import { button, escapeHtml, icon, type Sample } from './shared.ts';

const tokenMarkup = `<div data-tokenizer-demo><label class="oe-field"><span class="oe-field-label">Project tags (up to 3)</span><span class="oe-tokenizer"><span class="oe-tokenizer-tokens" data-tokens></span><input list="project-tags" data-token-input aria-label="Add project tag" placeholder="Search or create a tag…" /><datalist id="project-tags"><option>Planning</option><option>Operations</option><option>Finance</option><option>People</option></datalist></span></label><div class="oe-form-actions">${button('Add tag', 'data-add-token')}${button('Clear all', 'data-clear-tokens')}</div><p class="oe-field-help" data-token-status role="status"></p><label class="oe-field"><span class="oe-field-label">Locked tags</span><span class="oe-tokenizer" aria-disabled="true"><span class="oe-badge oe-badge-neutral">Operations</span><input disabled aria-label="Locked tags" placeholder="Selection locked" /></span></label><label class="oe-field"><span class="oe-field-label">Required tags</span><span class="oe-tokenizer" aria-invalid="true"><input aria-label="Required tags" aria-invalid="true" aria-describedby="tag-error" /></span><small class="oe-field-error" id="tag-error">Select at least one tag.</small></label></div>`;
const rows = [
  { title: 'Capacity review', status: 'Open', owner: 'Maja', type: 'Report' },
  { title: 'Site handover', status: 'Closed', owner: 'Emil', type: 'Task' },
  { title: 'Workshop plan', status: 'Open', owner: 'Sofia', type: 'Task' },
  { title: 'Finance snapshot', status: 'Closed', owner: 'Maja', type: 'Report' },
];
export const formSamples: Sample[] = [
  { id: 'tokenizer', title: 'Tokenizer', category: 'Forms', description: 'Build a set of selections. Use a native datalist for suggestions; Enter or Add tag commits the text. The app owns validation and selected values.', markup: tokenMarkup },
  { id: 'power-search', title: 'Power search', category: 'Forms', wide: true, description: 'Combine field/operator/value tokens with a keyword. All filters apply together to this local dataset.', markup: `<div class="oe-power-search" data-power-search><label class="oe-field"><span class="oe-field-label">Search titles</span><input class="oe-input" type="search" data-keyword /></label><form class="oe-form-row" data-filter-form><label class="oe-field"><span class="oe-field-label">Field</span><select class="oe-input" name="field"><option value="status">Status</option><option value="owner">Owner</option><option value="type">Type</option></select></label><label class="oe-field"><span class="oe-field-label">Operator</span><select class="oe-input" name="operator"><option value="is">is</option><option value="is not">is not</option><option value="contains">contains</option></select></label><label class="oe-field"><span class="oe-field-label">Value</span><input class="oe-input" name="value" list="filter-values" required /><datalist id="filter-values"><option>Open</option><option>Closed</option><option>Maja</option><option>Report</option><option>Task</option></datalist></label><button class="oe-btn oe-btn-secondary" type="submit">Add filter</button></form><div class="oe-tokenizer-tokens" data-filters></div>${button('Clear all', 'data-clear-filters')}<p data-result-count role="status"></p><div class="oe-table-wrap"><table class="oe-table"><thead><tr><th scope="col">Title</th><th scope="col">Status</th><th scope="col">Owner</th><th scope="col">Type</th></tr></thead><tbody data-results></tbody></table></div></div>` },
];

export function mountForms(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-tokenizer-demo]').forEach(demo => {
    const tokens = new Set(['Planning']);
    const input = demo.querySelector<HTMLInputElement>('[data-token-input]')!;
    const status = demo.querySelector<HTMLElement>('[data-token-status]')!;
    const add = demo.querySelector<HTMLButtonElement>('[data-add-token]')!;
    const render = () => {
      const box = demo.querySelector('[data-tokens]')!;
      box.replaceChildren();
      for (const value of tokens) {
        const chip = document.createElement('span'); chip.className = 'oe-badge oe-badge-neutral'; chip.append(value);
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'oe-badge-remove'; remove.setAttribute('aria-label', `Remove ${value}`); remove.innerHTML = icon('x');
        remove.addEventListener('click', () => { tokens.delete(value); render(); input.focus(); });
        chip.append(remove); box.append(chip);
      }
      input.disabled = tokens.size >= 3; add.disabled = input.disabled;
      status.textContent = tokens.size >= 3 ? '3 of 3 selected. Remove a tag to add another.' : `${tokens.size} of 3 selected`;
    };
    const commit = () => {
      const value = input.value.trim();
      if (!value || tokens.size >= 3) return;
      if ([...tokens].some(t => t.toLowerCase() === value.toLowerCase())) { status.textContent = 'That tag is already selected.'; return; }
      tokens.add(value); input.value = ''; render();
    };
    add.addEventListener('click', commit);
    input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.isComposing) { event.preventDefault(); commit(); } });
    demo.querySelector('[data-clear-tokens]')!.addEventListener('click', () => { tokens.clear(); render(); input.focus(); });
    render();
  });
  root.querySelectorAll<HTMLElement>('[data-power-search]').forEach(demo => {
    type Filter = { field: keyof typeof rows[number]; operator: string; value: string };
    let filters: Filter[] = [];
    const keyword = demo.querySelector<HTMLInputElement>('[data-keyword]')!;
    const form = demo.querySelector<HTMLFormElement>('[data-filter-form]')!;
    const render = () => {
      const matches = rows.filter(row => row.title.toLowerCase().includes(keyword.value.toLowerCase()) && filters.every(f => {
        const actual = row[f.field].toLowerCase(), value = f.value.toLowerCase();
        return f.operator === 'contains' ? actual.includes(value) : f.operator === 'is not' ? actual !== value : actual === value;
      }));
      demo.querySelector('[data-filters]')!.innerHTML = filters.map((f, i) => `<span class="oe-badge oe-badge-neutral">${escapeHtml(`${f.field} ${f.operator} ${f.value}`)}<button class="oe-badge-remove" type="button" data-remove-filter="${i}" aria-label="Remove filter ${i + 1}">${icon('x')}</button></span>`).join('');
      demo.querySelector('[data-result-count]')!.textContent = `${matches.length} results`;
      demo.querySelector('[data-results]')!.innerHTML = matches.length ? matches.map(row => `<tr>${Object.values(row).map(v => `<td>${escapeHtml(v)}</td>`).join('')}</tr>`).join('') : '<tr><td colspan="4" class="oe-table-empty">No results. Try removing a filter.</td></tr>';
    };
    form.addEventListener('submit', event => {
      event.preventDefault(); const data = new FormData(form); const value = String(data.get('value') ?? '').trim();
      if (!value) return;
      filters.push({ field: String(data.get('field')) as Filter['field'], operator: String(data.get('operator')), value });
      (form.elements.namedItem('value') as HTMLInputElement).value = ''; render();
    });
    demo.addEventListener('click', event => {
      const remove = (event.target as HTMLElement).closest<HTMLElement>('[data-remove-filter]');
      if (remove) { filters.splice(Number(remove.dataset.removeFilter), 1); render(); keyword.focus(); }
    });
    keyword.addEventListener('input', render);
    demo.querySelector('[data-clear-filters]')!.addEventListener('click', () => { filters = []; keyword.value = ''; render(); keyword.focus(); });
    render();
  });
}

export function mountCatalog(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-catalog-demo]').forEach(demo => {
    const search = demo.querySelector<HTMLInputElement>('[data-catalog-search]')!;
    const category = demo.querySelector<HTMLSelectElement>('[data-catalog-category]')!;
    const source = demo.querySelector<HTMLSelectElement>('[data-catalog-source]')!;
    const cards = [...demo.querySelectorAll<HTMLElement>('[data-catalog-card]')];
    const pinnedOnly = demo.querySelector<HTMLButtonElement>('[data-pinned-only]');
    let onlyPins = false;
    const update = () => {
      let count = 0;
      cards.forEach(card => { card.hidden = !(card.textContent!.toLowerCase().includes(search.value.toLowerCase()) && (category.selectedIndex === 0 || card.dataset.category === category.value) && (source.selectedIndex === 0 || card.dataset.source === source.value) && (!onlyPins || card.dataset.pinned === 'true')); if (!card.hidden) count++; });
      demo.querySelector('[data-catalog-count]')!.textContent = `${count} ${count === 1 ? 'app' : 'apps'}`;
      (demo.querySelector('[data-catalog-empty]') as HTMLElement).hidden = count !== 0;
      const heading = demo.querySelector('[data-catalog-heading]');
      if (heading) heading.textContent = onlyPins ? 'Pinned applications' : 'All applications';
      pinnedOnly?.setAttribute('aria-pressed', String(onlyPins));
    };
    search.addEventListener('input', update); category.addEventListener('change', update); source.addEventListener('change', update);
    demo.querySelectorAll('[data-catalog-clear]').forEach(button => button.addEventListener('click', () => { search.value = ''; category.selectedIndex = source.selectedIndex = 0; onlyPins = false; update(); search.focus(); }));
    pinnedOnly?.addEventListener('click', () => { onlyPins = !onlyPins; update(); });
    demo.querySelectorAll<HTMLButtonElement>('[data-pin]').forEach(button => button.addEventListener('click', () => {
      const card = button.closest<HTMLElement>('[data-catalog-card]')!; const pinned = card.dataset.pinned !== 'true';
      card.dataset.pinned = String(pinned);
      const grid = card.parentElement!;
      [...cards.filter(c => c.dataset.pinned === 'true'), ...cards.filter(c => c.dataset.pinned !== 'true')].forEach(c => grid.append(c));
      button.setAttribute('aria-pressed', String(pinned)); button.setAttribute('aria-label', `${pinned ? 'Unpin' : 'Pin'} ${card.dataset.name}`); update();
    }));
    update();
  });
}
