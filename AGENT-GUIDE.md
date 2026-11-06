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
| Button | `oe-btn` with one of `oe-btn-primary`, `oe-btn-secondary`, `oe-btn-ghost`, `oe-btn-quiet`, `oe-btn-neutral`, `oe-btn-danger`. Ghost is accent colored and quiet is neutral, for low-priority actions. Add `oe-btn-sm` (28px) or `oe-btn-lg` (40px) to change the default 32px, and `oe-btn-icon` for a square icon button, which needs an `aria-label` |
| Button states | `aria-busy="true"` shows a spinner: keep the label and stop repeat clicks. `aria-pressed="true"` shows a toggled button |
| Button group | `oe-btn-group` around `oe-btn oe-btn-secondary` buttons. With `aria-pressed`, it's a toggle group |
| Field | `oe-field` around `oe-field-label`, an input and `oe-field-help` or `oe-field-error`. Add `oe-field-required` to the label and `required` to the input. Add `oe-field-inline` to put the label beside the input |
| Form layout | `oe-form` around fields, `oe-form-row` for fields side by side, `oe-form-actions` for its buttons |
| Group of options | `oe-fieldset` on a `<fieldset>`, with `oe-fieldset-legend` on its `<legend>` |
| Input, select, textarea | `oe-input`, with `oe-input-sm` or `oe-input-lg` to match button sizes. Set `aria-invalid="true"` for errors. Add `oe-input-autogrow` to a textarea, and `oe-input-code` to a single one-time-code input with `autocomplete="one-time-code"` |
| Input with icon | `oe-input-group` around an `svg` and an `oe-input`, with an optional `oe-kbd` key hint |
| Checkbox, radio | `oe-check` inside `oe-check-label` |
| Switch | `oe-switch` on `<input type="checkbox" role="switch">`, inside `oe-check-label` |
| Radio cards | `oe-radio-card` on a `<label>`, around an `oe-check` radio and `oe-radio-card-title` and `oe-radio-card-text` |
| Slider | `oe-slider` on `<input type="range">` |
| File upload | `oe-dropzone` on a `<label>`, around an `svg`, text and `<input type="file">`. Dropping a file works without JavaScript. A plain file input takes `oe-input` |
| Badge | `oe-badge` with one of `oe-badge-accent`, `oe-badge-neutral`, `oe-badge-info`, `oe-badge-success`, `oe-badge-warning`, `oe-badge-danger`. Add `oe-badge-dot` for a status dot, or put an `oe-badge-remove` button inside for a removable tag |
| Avatar | `oe-avatar` with initials or an `<img>`. Sizes are `oe-avatar-sm`, `oe-avatar-lg` and `oe-avatar-xl`. Use `oe-avatar-neutral` for a "+3" count, and `oe-avatar-group` to overlap several |
| Alert | `oe-alert` with one of `oe-alert-accent`, `oe-alert-info`, `oe-alert-success`, `oe-alert-warning`, `oe-alert-danger`. Put the icon first, then one element of text, which can hold `oe-alert-title` and `oe-alert-actions`. An `oe-close` can come last |
| Banner | `oe-banner` across the top of the page, with `oe-banner-accent`, `oe-banner-info`, `oe-banner-warning` or `oe-banner-danger`. Put the icon first, then one element of text |
| Close button | `oe-close`, with an `aria-label` and an X icon |
| Card | `oe-card`, with `oe-card-head` around `oe-card-title` and `oe-card-subtitle`, and `oe-card-foot` for buttons. A table directly inside lines up with the title. For a table running edge to edge, add `oe-card-flush`, which has no padding, and wrap anything else that needs padding in `oe-card-body` |
| Stat | `oe-stat` around `oe-stat-label`, `oe-stat-value` and `oe-stat-delta`, with `oe-stat-delta-success` or `oe-stat-delta-danger`. It has a line above it and no box, so don't wrap each one in a card |
| Table | `oe-table-wrap` around `oe-table`, which has no outer frame, with `oe-table-compact` or `oe-table-sticky`. Cells can use `oe-table-num`, `oe-table-empty`, `oe-table-actions`, `oe-table-select` and `oe-table-truncate`. Rows can use `oe-row-selected`. Sort buttons use `oe-table-sort`, with `aria-sort` on the `th` |
| Toolbar | `oe-toolbar` directly above or below an `oe-table-wrap` or other content, with `oe-toolbar-end` for the right side |
| Pagination | `oe-pagination` around links, with `aria-current="page"` on the current one. Use `<span aria-disabled="true">…</span>` for a gap |
| Tabs | `oe-tabs` around elements with `aria-selected="true"` or `aria-current="page"`. Inside `oe-topbar` they fill the bar's height and scroll rather than wrap |
| Segmented control | `oe-segmented` around buttons with `aria-pressed` |
| Dialog | `oe-dialog` on a `<dialog>`, with `oe-dialog-sm` or `oe-dialog-lg`. Use `oe-dialog-head` around `oe-dialog-title` and an `oe-close`, then `oe-dialog-body`, which scrolls, then `oe-dialog-actions` |
| Drawer | `oe-drawer` on a `<dialog>`, from the right, or with `oe-drawer-left`, `oe-drawer-top` or `oe-drawer-bottom`. It uses the same head, body and actions as a dialog |
| Menu | `oe-menu` around `oe-menu-item`, with `oe-menu-item-danger`, `oe-menu-heading`, `oe-menu-separator` and `oe-menu-shortcut`. Use `aria-checked="true"` for a check mark and `disabled` for a disabled item |
| Popover | `oe-popover`. Without a library, see below |
| Toast | `oe-toast`, or `oe-toast-info`, `oe-toast-success`, `oe-toast-warning` or `oe-toast-danger` for a colored icon. It can hold `oe-toast-title`, one `oe-btn` and an `oe-close`. Stack toasts in `oe-toaster`, with `role="status"` and `aria-live="polite"` |
| Tooltip | `oe-tooltip`, which wraps at 240px. You place and show it, usually with a library. For an icon button, `title` is often enough |
| Loading | `oe-spinner`, sized by font size. `oe-skeleton`, sized to match the real content. `oe-progress` on a `<progress>` |
| Empty state | `oe-empty` around an `svg`, `oe-empty-title`, `oe-empty-text` and one `oe-btn` as the next step |
| Description list | `oe-dl` on a `<dl>`, with each `<dt>` and `<dd>` in a `<div>` |
| List rows | `oe-list` on a `<ul>`, with `oe-list-item` in each `<li>`, around an optional icon, `oe-list-text` with `oe-list-title` and `oe-list-subtitle`, and any buttons |
| Timeline | `oe-timeline` on an `<ol>`, with `oe-timeline-item` around `oe-timeline-marker` and `oe-timeline-text`, which can hold `oe-timeline-time` |
| Stepper | `oe-steps` on an `<ol>`, with `oe-step` on each `<li>`. Mark finished steps with `oe-step-done` and the current one with `aria-current="step"` |
| Accordion | `oe-accordion` on each `<details>`, with a `<summary>` |
| Separator | `oe-separator` on an `<hr>`. Add `aria-orientation="vertical"` inside a row |
| Key hint | `oe-kbd` on a `<kbd>` |
| Text | `oe-link` on a link, `oe-code` on inline `<code>`, `oe-code-block` on a `<pre>`, `oe-prose` around long text that can't carry classes, such as Markdown output, and `oe-sr-only` for text only screen readers should get |
| App shell | See below |

An `svg` placed directly inside a component gets the right size, so don't size it yourself.

### Popovers and menus without a library

The `popover` attribute handles opening, closing and Escape. Anchor the popup to its trigger, using a different name for each pair:

```html
<button class="oe-btn oe-btn-secondary" popovertarget="more" style="anchor-name: --more">More</button>
<div class="oe-popover" id="more" popover style="position-anchor: --more">Panel</div>
```

This suits simple panels. A menu that needs arrow keys should use a library.

### Components that need JavaScript

Use the browser first, because it gets accessibility and phones right for free:

| Need | Use |
| --- | --- |
| Pick from a short list | `<select class="oe-input">` |
| Pick a date | `<input type="date" class="oe-input">` |
| Dialog or drawer | `<dialog>`, opened with `showModal()` |
| Collapsible section | `<details>` |

When that isn't enough, don't build the keyboard handling yourself. Use these libraries and put the classes on their parts:

| Need | React | Svelte | Vue |
| --- | --- | --- | --- |
| Menu, select, combobox, popover, tooltip | `@base-ui/react` | `bits-ui` | `reka-ui` |
| Command palette | `cmdk` | `bits-ui` Command | `reka-ui` Combobox |
| Date picker | `react-day-picker` | `bits-ui` Calendar | `reka-ui` Calendar |
| Data table | `@tanstack/react-table` | `@tanstack/svelte-table` | `@tanstack/vue-table` |

| Part | Classes |
| --- | --- |
| Menu, select or combobox popup | `oe-menu` |
| Item in that popup | `oe-menu-item` |
| Group label, empty message | `oe-menu-heading` |
| Separator | `oe-menu-separator` |
| Select trigger | `oe-input oe-input-select` |
| Combobox input | `oe-input` |
| Popover popup | `oe-popover` |
| Tooltip popup | `oe-tooltip` |
| Command palette | `oe-dialog` on a `<dialog>`, `oe-input`, `oe-menu-item` |
| Calendar day button | `oe-calendar-day`. The library builds the grid |
| Data table | `oe-table-wrap` and `oe-table` on a normal `<table>` you render, with `oe-table-sort` and `aria-sort` |

```tsx
// React. Offset the popup from its trigger with sideOffset.
<Menu.Root>
  <Menu.Trigger className="oe-btn oe-btn-secondary">Actions</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner sideOffset={4}>
      <Menu.Popup className="oe-menu">
        <Menu.Item className="oe-menu-item">Edit</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
```

```svelte
<!-- Svelte -->
<DropdownMenu.Root>
  <DropdownMenu.Trigger class="oe-btn oe-btn-secondary">Actions</DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content class="oe-menu" sideOffset={4}>
      <DropdownMenu.Item class="oe-menu-item">Edit</DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
```

```vue
<!-- Vue -->
<DropdownMenuRoot>
  <DropdownMenuTrigger class="oe-btn oe-btn-secondary">Actions</DropdownMenuTrigger>
  <DropdownMenuPortal>
    <DropdownMenuContent class="oe-menu" :side-offset="4">
      <DropdownMenuItem class="oe-menu-item">Edit</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenuPortal>
</DropdownMenuRoot>
```

A few things to get right:

- To open a select below its trigger, use `alignItemWithTrigger={false}` in Base UI and `position="popper"` in Reka UI.
- TanStack Table v9 uses `useTable` in React and `createTable` in Svelte, with `tableFeatures()`. Older examples using `useReactTable` are for v8. Check the version you install.
- Check each library's own docs for its current API, because these move faster than this guide.

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

`npx oe-lint src` checks for raw colors, ramp variables, dark-mode overrides, names that don't exist and fills with the wrong text color. It also checks the markup: icon buttons need a name, inputs need a label, images need `alt`, and `oe-dialog` goes on a `<dialog>`. It exits with an error if it finds any.

It also warns when an app restyles an `oe-*` component with a CSS rule, an inline style or a utility. Placing one is fine: margins, width, and grid and flex placement. For anything else, use a variant, or add what's missing to the design system so every app gets it.

Fix the code rather than silencing the check. If a line truly needs an exception, such as a third-party brand color, add a comment containing `oe-lint-ignore` on that line or the one before it.
