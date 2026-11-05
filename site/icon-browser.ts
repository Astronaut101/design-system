import { createElement, type IconNode } from 'lucide';
import { lucideSvg } from './icons.ts';

// Names rank above keywords, so "trash" leads with the trash icons rather than everything tagged with the word.
export const searchIcons = (query: string, names: string[], tags: Record<string, string[]>) => {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return names;
  const rank = (name: string, term: string) => {
    if (name === term) return 0;
    if (name.startsWith(term)) return 1;
    if (name.includes(term)) return 2;
    const keywords = tags[name] ?? [];
    if (keywords.includes(term)) return 3;
    return keywords.some((keyword) => keyword.includes(term)) ? 4 : Infinity;
  };
  return names
    .map((name) => ({ name, score: terms.reduce((sum, term) => sum + rank(name, term), 0) }))
    .filter((hit) => hit.score < Infinity)
    .sort((a, b) => a.score - b.score)
    .map((hit) => hit.name);
};

// Both files are large, so the icons load near the section and the keywords when the search is first used.
export const mountIconBrowser = (root: HTMLElement) => {
  root.innerHTML = `
    <div class="icon-toolbar">
      <label class="icon-search oe-input-group">
        ${lucideSvg('search')}
        <input class="oe-input" type="search" placeholder="Search icons" aria-label="Search icons" autocomplete="off" spellcheck="false" />
      </label>
      <span class="icon-count" role="status"></span>
    </div>
    <div class="icon-panel">
      <div class="icon-tiles" role="group" aria-label="Lucide icons"></div>
      <p class="icon-empty" hidden>No matching icons</p>
    </div>
    <div class="oe-tooltip icon-tip" hidden></div>`;

  const input = root.querySelector<HTMLInputElement>('input')!;
  const count = root.querySelector<HTMLElement>('.icon-count')!;
  const panel = root.querySelector<HTMLElement>('.icon-panel')!;
  const grid = root.querySelector<HTMLElement>('.icon-tiles')!;
  const empty = root.querySelector<HTMLElement>('.icon-empty')!;
  const tip = root.querySelector<HTMLElement>('.icon-tip')!;

  const tiles = new Map<string, HTMLButtonElement>();
  let names: string[] = [];
  let tags: Record<string, string[]> = {};
  let tagsRequested = false;

  // One tile is in the tab order and arrow keys move between them, so two thousand tiles aren't two thousand tab stops.
  let current: HTMLButtonElement | undefined;
  const setCurrent = (tile?: HTMLButtonElement) => {
    if (current) current.tabIndex = -1;
    current = tile;
    if (current) current.tabIndex = 0;
  };

  const applySearch = () => {
    const found = searchIcons(input.value, names, tags);
    grid.replaceChildren(...found.map((name) => tiles.get(name)!));
    panel.scrollTop = 0;
    setCurrent(tiles.get(found[0]));
    count.textContent = `${found.length.toLocaleString('en')} ${found.length === 1 ? 'icon' : 'icons'}`;
    empty.hidden = found.length > 0;
  };

  const loadIcons = async () => {
    try {
      const nodes = (await import('lucide-static/icon-nodes.json')).default as unknown as Record<string, IconNode>;
      names = Object.keys(nodes);
      for (const [name, node] of Object.entries(nodes)) {
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'icon-tile';
        tile.tabIndex = -1;
        tile.dataset.copy = name;
        tile.setAttribute('aria-label', `Copy ${name}`);
        tile.append(createElement(node, { class: 'ic', 'aria-hidden': 'true' }));
        tiles.set(name, tile);
      }
      applySearch();
    } catch {
      empty.textContent = "Icons couldn't load";
      empty.hidden = false;
    }
  };

  const loadTags = async () => {
    if (tagsRequested) return;
    tagsRequested = true;
    try {
      tags = (await import('lucide-static/tags.json')).default;
      if (names.length && input.value.trim()) applySearch();
    } catch {
      // Name search still works. The next focus tries again.
      tagsRequested = false;
    }
  };

  new IntersectionObserver(
    ([entry], observer) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      loadIcons();
    },
    { rootMargin: '600px' },
  ).observe(root);

  input.addEventListener('focus', loadTags);
  input.addEventListener('input', () => {
    loadTags();
    if (names.length) applySearch();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' || !current) return;
    e.preventDefault();
    current.focus();
  });

  grid.addEventListener('keydown', (e) => {
    const items = [...grid.children] as HTMLButtonElement[];
    const at = items.indexOf(e.target as HTMLButtonElement);
    const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const moves: Record<string, number> = {
      ArrowRight: at + 1,
      ArrowLeft: at - 1,
      ArrowDown: at + columns,
      ArrowUp: at - columns,
      Home: 0,
      End: items.length - 1,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    items[moves[e.key]]?.focus();
  });
  grid.addEventListener('focusin', (e) => setCurrent(e.target as HTMLButtonElement));

  // Fixed position, because the panel's scrolling would clip a tooltip placed inside it.
  const showTip = (tile: HTMLElement) => {
    tip.textContent = tile.dataset.copy!;
    tip.hidden = false;
    const box = tile.getBoundingClientRect();
    const left = box.left + box.width / 2 - tip.offsetWidth / 2;
    tip.style.left = `${Math.max(8, Math.min(left, innerWidth - tip.offsetWidth - 8))}px`;
    tip.style.top = `${box.top - tip.offsetHeight - 4}px`;
  };
  const hideTip = () => {
    tip.hidden = true;
  };
  grid.addEventListener('mouseover', (e) => {
    const tile = (e.target as HTMLElement).closest<HTMLElement>('.icon-tile');
    if (tile) showTip(tile);
  });
  grid.addEventListener('mouseleave', hideTip);
  grid.addEventListener('focusin', (e) => {
    const tile = e.target as HTMLElement;
    if (tile.matches(':focus-visible')) showTip(tile);
  });
  grid.addEventListener('focusout', hideTip);
  document.addEventListener(
    'scroll',
    () => {
      const focused = grid.querySelector<HTMLElement>('.icon-tile:focus-visible');
      if (focused) showTip(focused);
      else hideTip();
    },
    { capture: true, passive: true },
  );
};
