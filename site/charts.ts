// Hand-written SVG charts. All colors are CSS variables, so theme changes need no re-render.
const series = (n: number) => `var(--chart-${n})`;
const seq = (n: number) => `var(--chart-seq-${n})`;
const div = (n: number) => `var(--chart-div-${n})`;
const compact = (v: number) => (Math.abs(v) >= 1000 ? `${+(v / 1000).toFixed(1)}K` : `${v}`);

interface TipRow {
  color?: string;
  value: string;
  label: string;
}

const svgEl = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, text?: string) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  if (text !== undefined) el.textContent = text;
  return el;
};

const niceMax = (v: number) => {
  const pow = 10 ** Math.floor(Math.log10(v));
  const step = [0.5, 1, 2, 2.5, 5, 10].find((s) => v / (s * pow) <= 5)! * pow;
  return { max: Math.ceil(v / step) * step, step };
};

class Tooltip {
  el = document.createElement('div');
  constructor(private host: HTMLElement) {
    this.el.className = 'tooltip';
    this.el.hidden = true;
    host.append(this.el);
  }
  show(x: number, y: number, title: string, rows: TipRow[]) {
    this.el.replaceChildren();
    const head = document.createElement('div');
    head.className = 'tt-title';
    head.textContent = title;
    this.el.append(head);
    for (const r of rows) {
      const row = document.createElement('div');
      row.className = 'tt-row';
      const key = document.createElement('i');
      if (r.color) key.style.background = r.color;
      const value = document.createElement('b');
      value.textContent = r.value;
      const label = document.createElement('span');
      label.textContent = r.label;
      row.append(key, value, label);
      this.el.append(row);
    }
    this.el.hidden = false;
    const hostW = this.host.clientWidth;
    const { offsetWidth: w, offsetHeight: h } = this.el;
    const left = x + 14 + w > hostW ? Math.max(0, x - w - 14) : x + 14;
    this.el.style.left = `${left}px`;
    this.el.style.top = `${Math.max(0, y - h - 8)}px`;
  }
  hide() {
    this.el.hidden = true;
  }
}

interface Figure {
  id: string;
  title: string;
  subtitle: string;
  wide?: boolean;
  legend?: { name: string; color: string; kind: 'rect' | 'line' | 'dot' }[];
  scale?: { low: string; high: string; colors: string[] };
  table: { head: string[]; rows: (string | number)[][] };
  render: (plot: HTMLElement, width: number, tip: Tooltip) => void;
}

/** Arrow keys walk the marks, so everything on hover is also reachable by keyboard. */
const keyboardWalk = (svg: SVGSVGElement, count: number, activate: (i: number) => void, clear: () => void, label: string) => {
  let index = -1;
  svg.setAttribute('tabindex', '0');
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', `${label}. Use the left and right arrow keys to read values, or show the table.`);
  svg.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    index = e.key === 'ArrowRight' ? Math.min(count - 1, index + 1) : Math.max(0, index - 1);
    activate(index);
  });
  svg.addEventListener('focus', () => {
    if (index < 0) index = 0;
    if (svg.matches(':focus-visible')) activate(index);
  });
  svg.addEventListener('blur', clear);
};

// Line ----------------------------------------------------------------------------
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LINE_SERIES = [
  { name: 'Field', values: [1240, 1310, 1420, 1490, 1610, 1750, 1720, 1810, 1960, 2080, 2150, 2290] },
  { name: 'Ledger', values: [880, 930, 910, 1020, 1090, 1120, 1210, 1260, 1240, 1330, 1410, 1470] },
  { name: 'Portal', values: [420, 460, 530, 520, 610, 690, 680, 760, 840, 830, 920, 1010] },
];

const renderLine: Figure['render'] = (plot, width, tip) => {
  const H = 260;
  const m = { t: 8, r: width < 320 ? 12 : 56, b: 24, l: 38 };
  const svg = svgEl('svg', { viewBox: `0 0 ${width} ${H}`, height: H });
  const { max, step } = niceMax(Math.max(...LINE_SERIES.flatMap((s) => s.values)));
  const x = (i: number) => m.l + (i * (width - m.l - m.r)) / (MONTHS.length - 1);
  const y = (v: number) => H - m.b - (v / max) * (H - m.t - m.b);
  for (let v = 0; v <= max; v += step) {
    svg.append(svgEl('line', { class: v === 0 ? 'axis' : 'grid', x1: m.l, x2: width - m.r, y1: y(v), y2: y(v) }));
    svg.append(svgEl('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, compact(v)));
  }
  MONTHS.forEach((label, i) => {
    if (width < 400 && i % 2) return;
    svg.append(svgEl('text', { x: x(i), y: H - 6, 'text-anchor': 'middle' }, label));
  });
  LINE_SERIES.forEach((s, si) => {
    const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join('');
    svg.append(svgEl('path', { d, fill: 'none', stroke: series(si + 1), 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    const last = s.values.length - 1;
    svg.append(svgEl('circle', { cx: x(last), cy: y(s.values[last]), r: 4, fill: series(si + 1), stroke: 'var(--bg-surface)', 'stroke-width': 2 }));
    if (width >= 320) svg.append(svgEl('text', { class: 'end-label', x: x(last) + 10, y: y(s.values[last]) + 4 }, s.name));
  });
  const cross = svgEl('line', { class: 'crosshair', y1: m.t, y2: H - m.b, visibility: 'hidden' });
  svg.append(cross);
  const dots = LINE_SERIES.map((_, si) => {
    const dot = svgEl('circle', { r: 4, fill: series(si + 1), stroke: 'var(--bg-surface)', 'stroke-width': 2, visibility: 'hidden' });
    svg.append(dot);
    return dot;
  });
  const activate = (i: number) => {
    cross.setAttribute('x1', String(x(i)));
    cross.setAttribute('x2', String(x(i)));
    cross.setAttribute('visibility', 'visible');
    LINE_SERIES.forEach((s, si) => {
      dots[si].setAttribute('cx', String(x(i)));
      dots[si].setAttribute('cy', String(y(s.values[i])));
      dots[si].setAttribute('visibility', 'visible');
    });
    tip.show(x(i), y(LINE_SERIES[0].values[i]), `${MONTHS[i]} 2026`, LINE_SERIES.map((s, si) => ({ color: series(si + 1), value: s.values[i].toLocaleString('en'), label: s.name })));
  };
  const clear = () => {
    cross.setAttribute('visibility', 'hidden');
    dots.forEach((d) => d.setAttribute('visibility', 'hidden'));
    tip.hide();
  };
  svg.addEventListener('pointermove', (e) => {
    const scale = width / svg.getBoundingClientRect().width;
    const px = (e.clientX - svg.getBoundingClientRect().left) * scale;
    activate(Math.max(0, Math.min(MONTHS.length - 1, Math.round(((px - m.l) / (width - m.l - m.r)) * (MONTHS.length - 1)))));
  });
  svg.addEventListener('pointerleave', clear);
  keyboardWalk(svg, MONTHS.length, activate, clear, 'Line chart of monthly active users for three products');
  plot.replaceChildren(svg, tip.el);
};

// Stacked columns -----------------------------------------------------------------
const REGIONS = ['North', 'South', 'East', 'West', 'Central', 'Coastal', 'Inland', 'Export'];
const PERIODS = ['Q1 25', 'Q2 25', 'Q3 25', 'Q4 25', 'Q1 26', 'Q2 26', 'Q3 26', 'Q4 26'];
const STACKS = PERIODS.map((_, p) => REGIONS.map((__, r) => 18 + ((p * 7 + r * 13 + (p * r) % 11) % 26) + p * 2));

const renderStack: Figure['render'] = (plot, width, tip) => {
  const H = 280;
  const m = { t: 8, r: 8, b: 24, l: 38 };
  const svg = svgEl('svg', { viewBox: `0 0 ${width} ${H}`, height: H });
  const totals = STACKS.map((s) => s.reduce((a, b) => a + b, 0));
  const { max, step } = niceMax(Math.max(...totals));
  const y = (v: number) => H - m.b - (v / max) * (H - m.t - m.b);
  for (let v = 0; v <= max; v += step) {
    svg.append(svgEl('line', { class: v === 0 ? 'axis' : 'grid', x1: m.l, x2: width - m.r, y1: y(v), y2: y(v) }));
    svg.append(svgEl('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, String(v)));
  }
  const band = (width - m.l - m.r) / PERIODS.length;
  const barW = Math.min(24, band * 0.7);
  const columns: SVGGElement[] = [];
  const activate = (p: number) => {
    columns.forEach((c, i) => c.classList.toggle('is-active', i === p));
    tip.show(m.l + band * p + band / 2, y(totals[p]), `${PERIODS[p]}, total ${totals[p]}`, REGIONS.map((name, r) => ({ color: series(r + 1), value: String(STACKS[p][r]), label: name })));
  };
  const clear = () => {
    columns.forEach((c) => c.classList.remove('is-active'));
    tip.hide();
  };
  STACKS.forEach((stack, p) => {
    const g = svgEl('g', { class: 'mark' });
    const cx = m.l + band * p + band / 2;
    let acc = 0;
    stack.forEach((v, r) => {
      const top = y(acc + v);
      const bottom = y(acc);
      const h = Math.max(1, bottom - top - 2);
      const left = cx - barW / 2;
      // Only the top segment gets the rounded data end. The 2px gap separates the rest.
      const d = r === stack.length - 1
        ? `M${left} ${top + h}V${top + 4}Q${left} ${top} ${left + 4} ${top}H${left + barW - 4}Q${left + barW} ${top} ${left + barW} ${top + 4}V${top + h}Z`
        : `M${left} ${top}H${left + barW}V${top + h}H${left}Z`;
      g.append(svgEl('path', { d, fill: series(r + 1) }));
      acc += v;
    });
    g.append(svgEl('rect', { x: m.l + band * p, y: m.t, width: band, height: H - m.t - m.b, fill: 'transparent' }));
    g.addEventListener('pointerenter', () => activate(p));
    g.addEventListener('pointerleave', clear);
    columns.push(g);
    svg.append(g);
    if (width >= 420 || p % 2 === 0) svg.append(svgEl('text', { x: cx, y: H - 6, 'text-anchor': 'middle' }, PERIODS[p]));
  });
  keyboardWalk(svg, PERIODS.length, activate, clear, 'Stacked columns of revenue by region for eight quarters');
  plot.replaceChildren(svg, tip.el);
};

// Scatter -------------------------------------------------------------------------
const SCATTER_GROUPS = ['Small', 'Medium', 'Large'];
const SCATTER = SCATTER_GROUPS.flatMap((group, g) =>
  Array.from({ length: 12 }, (_, i) => ({
    group,
    g,
    name: `${group} ${i + 1}`,
    x: 12 + g * 22 + ((i * 37 + g * 11) % 29),
    y: 15 + g * 16 + ((i * 53 + g * 7) % 31),
  })),
);

const renderScatter: Figure['render'] = (plot, width, tip) => {
  const H = 280;
  const m = { t: 24, r: 12, b: 38, l: 38 };
  const svg = svgEl('svg', { viewBox: `0 0 ${width} ${H}`, height: H });
  svg.append(svgEl('text', { x: 0, y: 12 }, 'Handling time, minutes'));
  const x = (v: number) => m.l + (v / 100) * (width - m.l - m.r);
  const y = (v: number) => H - m.b - (v / 100) * (H - m.t - m.b);
  for (let v = 0; v <= 100; v += 25) {
    svg.append(svgEl('line', { class: v === 0 ? 'axis' : 'grid', x1: m.l, x2: width - m.r, y1: y(v), y2: y(v) }));
    svg.append(svgEl('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, String(v)));
    svg.append(svgEl('text', { x: x(v), y: H - m.b + 16, 'text-anchor': 'middle' }, String(v)));
  }
  svg.append(svgEl('text', { x: (m.l + width - m.r) / 2, y: H - 4, 'text-anchor': 'middle' }, 'Orders per week'));
  const points = SCATTER.map((p) => {
    const dot = svgEl('circle', { class: 'mark', cx: x(p.x), cy: y(p.y), r: 4, fill: series(p.g + 1), stroke: 'var(--bg-surface)', 'stroke-width': 2 });
    const hit = svgEl('circle', { cx: x(p.x), cy: y(p.y), r: 12, fill: 'transparent' });
    return { p, dot, hit };
  });
  const activate = (i: number) => {
    points.forEach((pt, k) => pt.dot.classList.toggle('is-active', k === i));
    const { p } = points[i];
    tip.show(x(p.x), y(p.y), p.name, [
      { color: series(p.g + 1), value: String(p.x), label: 'Orders per week' },
      { color: series(p.g + 1), value: `${p.y} min`, label: 'Handling time' },
    ]);
  };
  const clear = () => {
    points.forEach((pt) => pt.dot.classList.remove('is-active'));
    tip.hide();
  };
  points.forEach(({ dot }) => svg.append(dot));
  points.forEach(({ hit }, i) => {
    hit.addEventListener('pointerenter', () => activate(i));
    hit.addEventListener('pointerleave', clear);
    svg.append(hit);
  });
  keyboardWalk(svg, points.length, activate, clear, 'Scatter plot of orders per week against handling time for three customer sizes');
  plot.replaceChildren(svg, tip.el);
};

// Heatmap -------------------------------------------------------------------------
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17'];
const HEAT = DAYS.map((_, d) =>
  HOURS.map((__, h) => {
    const weekday = d < 5 ? 1 : 0.28;
    const peak = 1 - Math.abs(h - 4) / 6;
    return Math.round(weekday * (24 + 72 * peak) + ((d * 5 + h * 3) % 9));
  }),
);

const renderHeat: Figure['render'] = (plot, width, tip) => {
  const m = { t: 4, r: 0, b: 22, l: 36 };
  const cellW = (width - m.l - m.r) / HOURS.length;
  const cellH = 30;
  const H = m.t + m.b + cellH * DAYS.length;
  const svg = svgEl('svg', { viewBox: `0 0 ${width} ${H}`, height: H });
  const all = HEAT.flat();
  const max = Math.max(...all);
  const min = Math.min(...all);
  const bucket = (v: number) => Math.min(7, 1 + Math.floor(((v - min) / (max - min + 1)) * 7));
  const cells: { el: SVGRectElement; d: number; h: number }[] = [];
  const activate = (i: number) => {
    const { d, h } = cells[i];
    cells.forEach((c, k) => c.el.classList.toggle('is-active', k === i));
    tip.show(m.l + cellW * (h + 0.5), m.t + cellH * d, `${DAYS[d]} ${HOURS[h]}:00`, [{ value: String(HEAT[d][h]), label: 'support tickets' }]);
  };
  const clear = () => {
    cells.forEach((c) => c.el.classList.remove('is-active'));
    tip.hide();
  };
  DAYS.forEach((day, d) => {
    svg.append(svgEl('text', { x: 0, y: m.t + cellH * d + cellH / 2 + 4 }, day));
    HOURS.forEach((_, h) => {
      const el = svgEl('rect', { class: 'mark', x: m.l + cellW * h + 1, y: m.t + cellH * d + 1, width: Math.max(1, cellW - 2), height: cellH - 2, rx: 2, fill: seq(bucket(HEAT[d][h])) });
      const index = cells.length;
      el.addEventListener('pointerenter', () => activate(index));
      el.addEventListener('pointerleave', clear);
      cells.push({ el, d, h });
      svg.append(el);
    });
  });
  HOURS.forEach((hour, h) => {
    if (width >= 420 || h % 2 === 0) svg.append(svgEl('text', { x: m.l + cellW * h + cellW / 2, y: H - 6, 'text-anchor': 'middle' }, hour));
  });
  keyboardWalk(svg, cells.length, activate, clear, 'Heatmap of support tickets by weekday and hour');
  plot.replaceChildren(svg, tip.el);
};

// Diverging bars ------------------------------------------------------------------
const DEPARTMENTS = [
  { name: 'Logistics', value: 18 },
  { name: 'Sales', value: 11 },
  { name: 'Service', value: 6 },
  { name: 'Support', value: 2 },
  { name: 'Admin', value: -3 },
  { name: 'Purchasing', value: -8 },
  { name: 'Marketing', value: -14 },
];

const renderDiverging: Figure['render'] = (plot, width, tip) => {
  const rowH = 34;
  const m = { t: 4, r: 40, b: 4, l: width < 420 ? 76 : 92 };
  const H = m.t + m.b + rowH * DEPARTMENTS.length;
  const svg = svgEl('svg', { viewBox: `0 0 ${width} ${H}`, height: H });
  const span = 20;
  const x = (v: number) => m.l + ((v + span) / (2 * span)) * (width - m.l - m.r - 18);
  // Index into the 9-step scale: 0 is the strongest negative, 8 the strongest positive.
  const step = (v: number) => 4 + Math.sign(v) * Math.min(4, Math.ceil(Math.abs(v) / 5));
  const bars: SVGPathElement[] = [];
  const activate = (i: number) => {
    const row = DEPARTMENTS[i];
    bars.forEach((b, k) => b.classList.toggle('is-active', k === i));
    tip.show(x(row.value), m.t + rowH * i, row.name, [{ color: div(step(row.value) + 1), value: `${row.value > 0 ? '+' : ''}${row.value}%`, label: 'vs budget' }]);
  };
  const clear = () => {
    bars.forEach((b) => b.classList.remove('is-active'));
    tip.hide();
  };
  DEPARTMENTS.forEach((row, i) => {
    const yc = m.t + rowH * i + rowH / 2;
    const barH = 18;
    svg.append(svgEl('text', { class: 'cat-label', x: 0, y: yc + 4 }, row.name));
    const x0 = x(0);
    const x1 = x(row.value);
    const r = 4;
    const dir = Math.sign(row.value);
    const d = `M${x0} ${yc - barH / 2}H${x1 - dir * r}Q${x1} ${yc - barH / 2} ${x1} ${yc - barH / 2 + r}V${yc + barH / 2 - r}Q${x1} ${yc + barH / 2} ${x1 - dir * r} ${yc + barH / 2}H${x0}Z`;
    const bar = svgEl('path', { class: 'mark', d, fill: div(step(row.value) + 1) });
    bars.push(bar);
    svg.append(bar);
    svg.append(svgEl('text', { class: 'value-label', x: x1 + dir * 6, y: yc + 4, 'text-anchor': dir > 0 ? 'start' : 'end' }, `${dir > 0 ? '+' : ''}${row.value}%`));
    const hit = svgEl('rect', { x: 0, y: m.t + rowH * i, width, height: rowH, fill: 'transparent' });
    hit.addEventListener('pointerenter', () => activate(i));
    hit.addEventListener('pointerleave', clear);
    svg.append(hit);
  });
  svg.append(svgEl('line', { class: 'axis', x1: x(0), x2: x(0), y1: m.t, y2: H - m.b }));
  keyboardWalk(svg, DEPARTMENTS.length, activate, clear, 'Diverging bars of spending against budget by department');
  plot.replaceChildren(svg, tip.el);
};

// Figure wrapper ------------------------------------------------------------------
export const FIGURES: Figure[] = [
  {
    id: 'line',
    title: 'Monthly active users',
    subtitle: 'Line chart, three series. Sample data.',
    legend: LINE_SERIES.map((s, i) => ({ name: s.name, color: series(i + 1), kind: 'line' })),
    table: { head: ['Month', ...LINE_SERIES.map((s) => s.name)], rows: MONTHS.map((m, i) => [m, ...LINE_SERIES.map((s) => s.values[i])]) },
    render: renderLine,
  },
  {
    id: 'scatter',
    title: 'Orders against handling time',
    subtitle: 'Scatter plot, three groups. Sample data.',
    legend: SCATTER_GROUPS.map((name, i) => ({ name, color: series(i + 1), kind: 'dot' })),
    table: { head: ['Customer', 'Orders per week', 'Handling time (min)'], rows: SCATTER.map((p) => [p.name, p.x, p.y]) },
    render: renderScatter,
  },
  {
    id: 'stack',
    title: 'Revenue by region',
    subtitle: 'Stacked columns, all eight colors. Sample data, millions.',
    wide: true,
    legend: REGIONS.map((name, i) => ({ name, color: series(i + 1), kind: 'rect' })),
    table: { head: ['Quarter', ...REGIONS], rows: PERIODS.map((p, i) => [p, ...STACKS[i]]) },
    render: renderStack,
  },
  {
    id: 'heat',
    title: 'Support tickets by hour',
    subtitle: 'Sequential scale, one hue. Sample data.',
    scale: { low: 'Fewer', high: 'More', colors: [1, 2, 3, 4, 5, 6, 7].map(seq) },
    table: { head: ['Day', ...HOURS], rows: DAYS.map((d, i) => [d, ...HEAT[i]]) },
    render: renderHeat,
  },
  {
    id: 'diverging',
    title: 'Spending against budget',
    subtitle: 'Diverging scale, two hues around a neutral midpoint. Sample data.',
    scale: { low: 'Under', high: 'Over', colors: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(div) },
    table: { head: ['Department', 'vs budget'], rows: DEPARTMENTS.map((d) => [d.name, `${d.value > 0 ? '+' : ''}${d.value}%`]) },
    render: renderDiverging,
  },
];

const buildTable = (t: Figure['table']) => {
  const wrap = document.createElement('div');
  wrap.className = 'chart-table';
  const table = document.createElement('table');
  table.className = 'data-table';
  const headRow = table.createTHead().insertRow();
  for (const h of t.head) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = h;
    headRow.append(th);
  }
  const body = table.createTBody();
  for (const row of t.rows) {
    const tr = body.insertRow();
    for (const cell of row) tr.insertCell().textContent = String(cell);
  }
  wrap.append(table);
  return wrap;
};

export const mountCharts = (host: HTMLElement) => {
  for (const f of FIGURES) {
    const card = document.createElement('figure');
    card.className = `chart-card${f.wide ? ' wide' : ''}`;
    const head = document.createElement('div');
    head.className = 'chart-head';
    const titles = document.createElement('div');
    const h4 = document.createElement('h4');
    h4.textContent = f.title;
    const sub = document.createElement('p');
    sub.textContent = f.subtitle;
    titles.append(h4, sub);
    const toggle = document.createElement('button');
    toggle.className = 'table-toggle';
    toggle.type = 'button';
    toggle.textContent = 'Show table';
    toggle.setAttribute('aria-expanded', 'false');
    head.append(titles, toggle);
    card.append(head);

    if (f.legend) {
      const ul = document.createElement('ul');
      ul.className = 'legend';
      for (const item of f.legend) {
        const li = document.createElement('li');
        const key = document.createElement('i');
        key.style.background = item.color;
        if (item.kind !== 'rect') key.className = item.kind;
        li.append(key, document.createTextNode(item.name));
        ul.append(li);
      }
      card.append(ul);
    }
    if (f.scale) {
      const scale = document.createElement('div');
      scale.className = 'scale-legend';
      const low = document.createElement('span');
      low.textContent = f.scale.low;
      const steps = document.createElement('span');
      steps.className = 'steps';
      for (const c of f.scale.colors) {
        const i = document.createElement('i');
        i.style.background = c;
        steps.append(i);
      }
      const high = document.createElement('span');
      high.textContent = f.scale.high;
      scale.append(low, steps, high);
      card.append(scale);
    }

    const plot = document.createElement('div');
    plot.className = 'plot';
    const tip = new Tooltip(plot);
    const table = buildTable(f.table);
    table.hidden = true;
    card.append(plot, table);
    toggle.addEventListener('click', () => {
      const showTable = table.hidden;
      table.hidden = !showTable;
      plot.hidden = showTable;
      toggle.textContent = showTable ? 'Show chart' : 'Show table';
      toggle.setAttribute('aria-expanded', String(showTable));
    });
    host.append(card);

    let lastWidth = 0;
    new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      if (width > 0 && width !== lastWidth) {
        lastWidth = width;
        f.render(plot, width, tip);
      }
    }).observe(plot);
  }
};
