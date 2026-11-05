import { contrast } from '../../src/color-math.ts';
import { mountPage } from '../frame.ts';
import { MODES, lucideSvg, model, pageHead, type Mode } from '../shared.ts';

const INTENTS = ['accent', 'neutral', 'danger', 'warning', 'success', 'info'] as const;
const role = (name: string) => model.roles.find((r) => r.name === name)!;
const rampInfo: Record<string, { note: string; tint?: boolean }> = model.rampInfo;
const passCount = model.contrast.filter((c) => c.pass).length;

const accentSection = () => {
  const a = role('bg-accent-emphasis');
  const on = role('fg-on-accent');
  const cards = [
    { title: 'Light accent', theme: 'light', hex: a.light.hex, text: on.light.hex },
    { title: 'Dark accent', theme: 'dark', hex: a.dark.hex, text: on.dark.hex },
  ];
  return `
  <section id="accent">
    <div class="section-head">
      <h2>Accent</h2>
      <p>Derived from ${model.seed.hex} for each mode.</p>
    </div>
    <div class="accent-grid">
      ${cards
        .map(
          (c) => `<div class="accent-card" data-theme="${c.theme}">
            <div class="accent-fill" style="background:${c.hex};color:${c.text}">Save changes</div>
            <div class="accent-body">
              <h3>${c.title}</h3>
              <button class="copy-hex" type="button" data-copy="${c.hex}" aria-label="Copy ${c.hex}">${c.hex}</button>
            </div>
          </div>`,
        )
        .join('')}
    </div>
  </section>`;
};

// One block per token, labeled in the color it pairs with, so the map also teaches the pairings.
const mapCell = (name: string, label: string, style: string, modifier = '') =>
  model.roles.some((r) => r.name === name)
    ? `<button class="map-cell ${modifier}" type="button" data-copy="var(--${name})" title="--${name}" aria-label="Copy --${name}" style="${style}">${label}</button>`
    : `<span class="map-cell map-empty ${modifier}"></span>`;

const intentColumn = (i: string) => {
  const fill = (name: string, label: string, modifier = '') => mapCell(name, label, `background:var(--${name});color:var(--fg-on-${i})`, modifier);
  const quiet = (name: string, label: string, modifier = '') => mapCell(name, label, `background:var(--${name});color:var(--fg-${i === 'neutral' ? 'default' : i})`, modifier);
  const edge = (name: string, label: string) => mapCell(name, label, `background:var(--bg-surface);border-color:var(--${name})`, 'map-edge');
  return `<div class="map-column">
    <h3>${i[0].toUpperCase() + i.slice(1)}</h3>
    ${fill(`bg-${i}-emphasis`, 'Emphasis', 'map-tall')}
    ${fill(`bg-${i}-emphasis-hover`, 'Hover')}
    ${fill(`bg-${i}-emphasis-active`, 'Active')}
    ${mapCell(`fg-on-${i}`, 'On fill', `background:var(--fg-on-${i});color:var(--bg-${i}-emphasis)`)}
    ${quiet(`bg-${i}-muted`, 'Muted', 'map-tall')}
    ${quiet(`bg-${i}-muted-hover`, 'Muted hover')}
    ${mapCell(`fg-${i}`, 'Text', `background:var(--bg-surface);color:var(--fg-${i})`)}
    ${edge(`border-${i}-emphasis`, 'Border')}
    ${edge(`border-${i}-muted`, 'Muted border')}
  </div>`;
};

const mapGroup = (title: string, cells: string[]) => `
  <div class="map-group" style="--blocks:${cells.length}">
    <h3>${title}</h3>
    <div class="map-blocks">${cells.join('')}</div>
  </div>`;

const baseGroups = () => {
  const surface = (name: string, modifier = '') => mapCell(name, name, `background:var(--${name});color:var(--fg-default)`, modifier);
  const state = (name: string, text = 'fg-default') => mapCell(name, name, `background:linear-gradient(var(--${name}),var(--${name})),var(--bg-surface);color:var(--${text})`);
  const ink = (name: string) => mapCell(name, name, `background:var(--bg-surface);color:var(--${name})`);
  const edge = (name: string) => mapCell(name, name, `background:var(--bg-surface);border-color:var(--${name})`, 'map-edge');
  return [
    mapGroup('Surfaces', [surface('bg-sunken'), surface('bg-page'), surface('bg-surface'), surface('bg-raised', 'map-raised')]),
    mapGroup('States', [state('bg-hover'), state('bg-pressed'), state('bg-disabled', 'fg-disabled')]),
    mapGroup('Overlays', [
      mapCell('bg-inverse', 'bg-inverse', 'background:var(--bg-inverse);color:var(--fg-on-inverse)'),
      mapCell('fg-on-inverse', 'fg-on-inverse', 'background:var(--fg-on-inverse);color:var(--bg-inverse)'),
      mapCell('bg-scrim', '<span>bg-scrim</span>', 'background:linear-gradient(var(--bg-scrim),var(--bg-scrim)),var(--bg-surface)', 'map-scrim'),
    ]),
    mapGroup('Text', [ink('fg-default'), ink('fg-muted'), ink('fg-disabled'), ink('fg-link'), ink('fg-link-hover')]),
    mapGroup('Borders and focus', [edge('border-default'), edge('border-strong'), edge('border-disabled'), mapCell('focus', 'focus', 'background:var(--bg-surface);outline:2px solid var(--focus);outline-offset:-4px')]),
  ].join('');
};

const roleMap = (mode: Mode) => `
  <div class="mode-panel role-map" data-theme="${mode}">
    <p class="mode-label">${mode === 'light' ? 'Light' : 'Dark'}</p>
    <div class="map-columns">${INTENTS.map(intentColumn).join('')}</div>
    <div class="map-groups">${baseGroups()}</div>
  </div>`;

const rolesSection = () => `
  <section id="roles">
    <div class="section-head">
      <h2>Color tokens</h2>
      <p>Click a block to copy its token.</p>
    </div>
    <div class="stack">${MODES.map(roleMap).join('')}</div>
  </section>`;

const rampsSection = () => {
  const cell = (ramp: string, tone: string, hex: string) => {
    // oe-lint-ignore: measures the label's contrast, which isn't styling.
    const onWhite = contrast(hex, '#ffffff');
    // oe-lint-ignore
    const onDark = contrast(hex, '#000000');
    const text = onWhite > onDark ? 'white' : 'black';
    // oe-lint-ignore: this page shows the ramps themselves.
    return `<button type="button" data-copy="var(--ramp-${ramp}-${tone})" title="--ramp-${ramp}-${tone} ${hex}" aria-label="Copy --ramp-${ramp}-${tone}" style="background:${hex};color:${text}">${tone}</button>`;
  };
  const row = ([name, stops]: [string, Record<string, string>]) => `<div class="ramp">
      <strong title="${rampInfo[name].note}">${name}</strong>
      <div class="ramp-cells">${model.rampStops.map((tone) => cell(name, String(tone), stops[tone])).join('')}</div>
    </div>`;
  const ramps: [string, Record<string, string>][] = Object.entries(model.ramps);
  return `
  <section id="ramps">
    <div class="section-head">
      <h2>Tonal ramps</h2>
      <p>What the tokens are built from.</p>
    </div>
    <div class="ramps">${ramps.filter(([name]) => !rampInfo[name].tint).map(row).join('')}</div>
    <h3 class="ramps-sub">Tints</h3>
    <div class="ramps">${ramps.filter(([name]) => rampInfo[name].tint).map(row).join('')}</div>
  </section>`;
};

const reportSection = () => {
  const sorted = [...model.contrast].sort((a, b) => a.ratio / a.min - b.ratio / b.min);
  const row = (c: (typeof sorted)[number]) => `<tr>
    <td><span class="aa" style="background:${c.bgHex};color:${c.fgHex}">Aa</span></td>
    <td class="mono" style="font-size:var(--text-xs)">${c.fg}</td>
    <td class="mono" style="font-size:var(--text-xs)">${c.bg}</td>
    <td>${c.mode}</td>
    <td class="num">${c.ratio.toFixed(2)}:1</td>
    <td class="num">${c.min}:1</td>
    <td>${c.pass ? `<span class="pass-mark">${lucideSvg('circle-check')}Pass</span>` : `<span class="fail-mark">${lucideSvg('circle-x')}Fail</span>`}</td>
  </tr>`;
  const allPass = passCount === model.contrast.length;
  return `
  <section id="report">
    <div class="section-head">
      <h2>Contrast report</h2>
      <p>Measured on every build.</p>
    </div>
    <div class="report-grid">
      <div class="oe-card report-score">
        <span style="color:var(--fg-${allPass ? 'success' : 'danger'});display:flex;--ic-size:var(--space-8)">${lucideSvg(allPass ? 'circle-check' : 'circle-x')}</span>
        <strong class="num">${passCount}/${model.contrast.length}</strong>
        <span class="note">pairs pass, in light and dark</span>
      </div>
      <div class="oe-card">
        <h3>Tightest pairs</h3>
        <div class="pair-grid">
          ${sorted
            .slice(0, 6)
            .map(
              (c) => `<div class="pair">
                <span class="aa aa-lg" style="background:${c.bgHex};color:${c.fgHex}">Aa</span>
                <span class="pair-text"><b class="num">${c.ratio.toFixed(2)}:1</b> <small>needs ${c.min}:1, ${c.mode}</small><code>${c.fg}</code></span>
              </div>`,
            )
            .join('')}
        </div>
      </div>
    </div>
    <details class="report">
      <summary>Show all ${model.contrast.length} pairs</summary>
      <div class="oe-table-wrap"><table class="oe-table">
        <thead><tr><th scope="col">Sample</th><th scope="col">Foreground</th><th scope="col">Background</th><th scope="col">Mode</th><th scope="col">Ratio</th><th scope="col">Needs</th><th scope="col">Result</th></tr></thead>
        <tbody>${sorted.map(row).join('')}</tbody>
      </table></div>
    </details>
  </section>`;
};

mountPage('colors', `${pageHead('Colors', `Every color comes from ${model.seed.hex}.`)}${accentSection()}${rolesSection()}${rampsSection()}${reportSection()}`);
