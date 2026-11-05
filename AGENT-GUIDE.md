# Oestergaard design system: guide for agents

Follow this when you write UI in an app that uses `@oestergaard/design-tokens`. Run `npx oe-lint src` before you finish, and fix every error it reports.

## Choosing what to use

Use the first option that fits:

1. A component class from the table below.
2. A token: `var(--bg-surface)` in CSS, or `bg-surface` in Tailwind.
3. Tailwind utilities or `--space-*` for layout and spacing.

Never write a raw color, a `--ramp-*` variable or a dark-mode override. Tokens already change with the mode.

## Setup

Without Tailwind:

```css
@import "@oestergaard/design-tokens/tokens.css";
@import "@oestergaard/design-tokens/components.css";
```

With Tailwind v4:

```css
@import "tailwindcss";
@import "@oestergaard/design-tokens/tailwind.css";
@import "@oestergaard/design-tokens/components.css";
```

Tailwind's stock colors don't exist here, so `bg-red-500` produces nothing. An app's own reset must be in a layer, such as `@layer base { ... }`, or it overrides the component classes.

## Components

The classes set the look only. You add behavior and ARIA, such as arrow keys for tabs.

| Component | Classes |
| --- | --- |
| Button | `oe-btn` with one of `oe-btn-primary`, `oe-btn-secondary`, `oe-btn-ghost`, `oe-btn-neutral`, `oe-btn-danger`. Add `oe-btn-sm` (28px) or `oe-btn-lg` (40px) to change the default 32px, and `oe-btn-icon` for a square icon button. Icon-only buttons need an `aria-label` |
| Field | `oe-field` around `oe-field-label`, an input and `oe-field-help` or `oe-field-error` |
| Input, select, textarea | `oe-input`. Set `aria-invalid="true"` for errors |
| Checkbox, radio | `oe-check` inside `oe-check-label` |
| Badge | `oe-badge` with one of `oe-badge-accent`, `oe-badge-neutral`, `oe-badge-info`, `oe-badge-success`, `oe-badge-warning`, `oe-badge-danger` |
| Alert | `oe-alert` with one of `oe-alert-accent`, `oe-alert-info`, `oe-alert-success`, `oe-alert-warning`, `oe-alert-danger`. Put the icon first, then one element of text |
| Card | `oe-card` |
| Stat | `oe-stat` around `oe-stat-label`, `oe-stat-value` and `oe-stat-delta`, with `oe-stat-delta-success` or `oe-stat-delta-danger`. It has a line above it and no box, so don't wrap each one in a card |
| Table | `oe-table-wrap` around `oe-table`, which has no outer frame, with `oe-table-compact` or `oe-table-sticky`. Cells can use `oe-table-num` and `oe-table-empty`. Rows can use `oe-row-selected`. Sort buttons use `oe-table-sort`, with `aria-sort` on the `th` |
| Tabs | `oe-tabs` around elements with `aria-selected="true"` or `aria-current="page"` |
| Segmented control | `oe-segmented` around buttons with `aria-pressed` |
| Dialog | `oe-dialog` on a `<dialog>`, with `oe-dialog-title` and `oe-dialog-actions` |
| Menu | `oe-menu` around `oe-menu-item`, with `oe-menu-item-danger` |
| Toast, tooltip | `oe-toast`, `oe-tooltip`. You place and show them |
| Loading | On a button, set `aria-busy="true"`, keep the label and stop repeat clicks. Otherwise `oe-spinner` (sized by font size), `oe-skeleton` (set its size to match the real content), and `oe-progress` on a `<progress>` |
| Switch | `oe-switch` on `<input type="checkbox" role="switch">`, inside `oe-check-label` |
| Input with icon | `oe-input-group` around an `svg` and an `oe-input`, with an optional `oe-kbd` for a key hint |
| Key hint | `oe-kbd` on a `<kbd>` |
| Empty state | `oe-empty` around an `svg`, `oe-empty-title`, `oe-empty-text` and one `oe-btn` as the next step |
| Pagination | `oe-pagination` around links, with `aria-current="page"` on the current one. Use `<span aria-disabled="true">…</span>` for a gap |
| Separator | `oe-separator` on an `<hr>`. Add `aria-orientation="vertical"` inside a row |
| Accordion | `oe-accordion` on each `<details>`, with a `<summary>` |
| App shell | See below |

An `svg` placed directly inside a component gets the right size, so don't size it yourself.

For data tables, use TanStack Table or similar for the logic and render a normal `<table>` with these classes.

### App shell

Put each thing where it goes:

- Side nav: brand at the top, pages in the middle, settings and the user at the bottom.
- Top bar: the sidebar toggle and breadcrumb on the left. Search, notifications and other tools for the whole app on the right.
- Page head: the title on the left, and that page's main actions in `oe-page-actions` on the right.

```html
<div class="oe-shell">
  <nav class="oe-sidenav" id="nav" popover aria-label="Pages">
    <a class="oe-sidenav-brand" href="/"><!-- logo svg -->App name</a>
    <div class="oe-sidenav-body">
      <ul class="oe-nav-list">
        <li><a class="oe-nav-item" href="/" title="Overview" aria-current="page"><!-- icon -->Overview</a></li>
      </ul>
      <p class="oe-nav-heading">Team</p>
      <ul class="oe-nav-list">
        <li><a class="oe-nav-item" href="/customers" title="Customers"><!-- icon -->Customers<span class="oe-badge oe-badge-neutral">3</span></a></li>
      </ul>
    </div>
    <div class="oe-sidenav-foot">
      <a class="oe-nav-item" href="/me" title="Maja Holm"><span class="oe-avatar">MH</span>Maja Holm</a>
    </div>
  </nav>
  <div class="oe-shell-main">
    <header class="oe-topbar">
      <button class="oe-btn oe-btn-ghost oe-btn-icon oe-shell-menu" popovertarget="nav" aria-label="Open navigation"><!-- menu icon --></button>
      <button class="oe-btn oe-btn-ghost oe-btn-icon oe-shell-toggle" aria-expanded="true" aria-controls="nav" aria-label="Toggle sidebar"><!-- panel-left icon --></button>
      <nav class="oe-breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li><a href="/">App name</a></li>
          <li aria-current="page">Overview</li>
        </ol>
      </nav>
      <div class="oe-topbar-actions"><!-- search, notifications --></div>
    </header>
    <main class="oe-page">
      <header class="oe-page-head">
        <div>
          <h1 class="oe-page-title">Overview</h1>
          <p class="oe-page-subtitle">Summary</p>
        </div>
        <div class="oe-page-actions"><!-- primary action --></div>
      </header>
    </main>
  </div>
</div>
```

From 64rem, the page is an inset panel and `oe-shell-main` scrolls rather than the document, so call `scrollTo` on that element. `oe-shell-toggle` closes the side nav to a rail of icons. Flip its `aria-expanded` between `true` and `false` on click, and the CSS does the rest. Keep that value in your app's state, and save it if it should survive a reload. In the rail, the brand needs a logo, every item needs an icon, and the `title` shows the name.

Below 64rem, the document scrolls and the side nav is a drawer opened by `oe-shell-menu`, with no JavaScript. In a single-page app, call `hidePopover()` on it when the route changes. The breadcrumb shows only the current page on phones.

## Tokens

The CSS variable is on the left. In Tailwind, `fg-` becomes `text-`, and `bg-` and `border-` stay as they are, so `--fg-muted` is `text-muted`.

| Use | Token |
| --- | --- |
| Text and icons | `fg-default`, `fg-muted`, `fg-disabled`, `fg-link`, `fg-link-hover` |
| Status text on surfaces | `fg-accent`, `fg-danger`, `fg-warning`, `fg-success`, `fg-info` |
| Page and surfaces | `bg-page`, `bg-surface`, `bg-raised`, `bg-sunken` |
| Rows and ghost controls | `bg-hover`, `bg-pressed` |
| Disabled | `bg-disabled`, `fg-disabled`, `border-disabled` |
| Solid fills | `bg-accent-emphasis`, plus `-hover` and `-active`, and the same for `neutral`, `danger`, `warning`, `success`, `info` |
| Text on solid fills | `fg-on-accent`, and the same for `neutral`, `danger`, `warning`, `success`, `info` |
| Quiet fills and selected items | `bg-accent-muted`, plus `-hover`, and the same for each intent |
| Borders | `border-default`, `border-strong`, `border-accent-emphasis`, `border-accent-muted`, and the same for `danger`, `warning`, `success`, `info` |
| Focus ring | `focus`, always with an outline offset |
| Overlays | `bg-inverse` with `fg-on-inverse`, `bg-scrim`, `shadow-raised`, `shadow-overlay` |

Rules:

- Pair every `emphasis` fill with its own `fg-on-` token, such as `bg-danger-emphasis` with `fg-on-danger`.
- Solid warning is a light fill. On light surfaces, give it `border-warning-emphasis`.
- Show status with an icon and a label, never color alone.
- `#068B8C` is the brand color, for logos and large graphics only. It fails contrast behind small text, so use `bg-accent-emphasis`.

To force a mode on an element or part of a page, set `data-theme="light"` or `data-theme="dark"`.

## Icons

Use [Lucide](https://lucide.dev) with its current names. `trash-2` still works as an alias, but `trash` is the current name and aliases can be removed.

| Framework | Package |
| --- | --- |
| React | `lucide-react` |
| Vue | `@lucide/vue` |
| Svelte | `@lucide/svelte` |
| Angular | `@lucide/angular` |
| Solid | `lucide-solid` |
| Preact | `lucide-preact` |
| Plain JavaScript | `lucide` |
| Templates and server rendering | `lucide-static` |

Outside components, size icons with `size-3` (badges, dense tables), `size-4` (buttons, menus, body text), `size-5` (alerts, navigation) or `size-6` (page headers, empty states). Keep the stroke width at 2 and color them with `fg-` tokens.

## Charts

Use `var(--chart-1)` to `var(--chart-8)`, or `import { chart } from "@oestergaard/design-tokens"` for libraries that can't read CSS variables. Other scales are `--chart-seq-*` for magnitude and `--chart-div-*` for values around a midpoint. Grid lines and axes use `--chart-grid` and `--chart-axis`.

- Assign colors in order, and keep a color with its series when filters change.
- Lines and scatter plots can have up to 5 series. Stacked or grouped bars can have up to 8, with a legend and a table view. For more, fold the rest into "Other" or split into small charts.
- Give every chart a legend or labels, and a table view.
- Don't use status colors for ordinary series.

## The lint check

`npx oe-lint src` checks for raw colors, ramp variables, dark-mode overrides, names that don't exist and fills with the wrong text color. It exits with an error if it finds any.

Fix the code rather than silencing the check. If a line truly needs an exception, such as a third-party brand color, add a comment containing `oe-lint-ignore` on that line or the one before it.
