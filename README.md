# Oestergaard design system

Color roles, chart palettes, sizing and component styles for every Oestergaard-AS app, in any framework. Everything is generated from one brand color, `#068B8C`, using [HCT](https://github.com/material-foundation/material-color-utilities).

The package ships tokens, icon sizes and CSS classes for the components apps repeat most. It has no JavaScript, so behavior such as keyboard handling and sorting stays with each app.

## Commands

```bash
npm install
npm run dev            # showcase site at http://localhost:5183
npm test               # build, then check contrast, chart palettes, Tailwind output and components
npm run typecheck
npm run lint           # run oe-lint on the showcase
npm run site:build     # static showcase in site/dist, for any static host
npm run test:browser   # build and test the showcase with Playwright Chromium
```

Install browser test binaries once with `npx playwright install chromium`. Browser tests serve the built site under `/design-system/`, matching a project deployment on GitHub Pages.

## Using it

See the [showcase](https://oestergaard-a-s.github.io/design-system/). The package isn't on npm. Install it from GitHub at a version tag:

```bash
npm install github:Oestergaard-A-S/design-system#v0.3.0
```

Apps without npm can link the CSS directly:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Oestergaard-A-S/design-system@v0.3.0/dist/tokens.css" />
```

**Any framework:**

```css
@import "@oestergaard/design-tokens/tokens.css";

.button {
  background: var(--bg-accent-emphasis);
  color: var(--fg-on-accent);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
}
```

**Tailwind v4:** Sizing utilities stay as they are. Tailwind's stock colors are removed, so every color comes from the system. `fg-` tokens become `text-*`, `bg-` tokens become `bg-*` and `border-` tokens become `border-*`, so a mismatch like `text-accent-emphasis` doesn't exist.

```css
@import "tailwindcss";
@import "@oestergaard/design-tokens/tailwind.css";
```

**Canvas charts and native code:**

```js
import { chart, light, dark } from "@oestergaard/design-tokens";
```

`tokens.light.json` and `tokens.dark.json` use the W3C design token format.

**Light and dark:** The OS setting chooses the mode. To force one, set `data-theme="light"` or `data-theme="dark"` on any element, including part of a page.

## Components

Import the classes after the tokens. They work with or without Tailwind.

```css
@import "@oestergaard/design-tokens/tokens.css";
@import "@oestergaard/design-tokens/components.css";
```

With Tailwind, import `tailwind.css` first instead of `tokens.css`.

```html
<button class="oe-btn oe-btn-primary">Save changes</button>
<span class="oe-badge oe-badge-success">Paid</span>
```

| Component | Classes |
| --- | --- |
| Button | `oe-btn` with `-primary`, `-secondary`, `-ghost`, `-quiet`, `-neutral` or `-danger`, plus `-sm`, `-lg`, `-icon` and `-block`; `oe-btn-group`. Set `aria-busy` or `aria-pressed` for those states |
| Field, form | `oe-field`, `oe-field-label`, `oe-field-required`, `oe-field-help`, `oe-field-error`, `oe-field-inline`; `oe-fieldset`, `oe-fieldset-legend`; `oe-form`, `oe-form-row`, `oe-form-actions`, `oe-form-actions-sticky` |
| Input, select, textarea | `oe-input` with `-sm`, `-lg`, `-autogrow`, `-code`. Set `aria-invalid="true"` for the error state |
| Other inputs | `oe-slider`; `oe-radio-card`, `oe-radio-card-title`, `oe-radio-card-text`; `oe-dropzone` |
| Checkbox, radio | `oe-check`, `oe-check-label` |
| Badge | `oe-badge` with `-accent`, `-neutral`, `-info`, `-success`, `-warning`, `-danger` or `-dot`; `oe-badge-remove` |
| Avatar | `oe-avatar` with `-sm`, `-lg`, `-xl` or `-neutral`; `oe-avatar-group` |
| Alert, banner | `oe-alert` with the same intents, `oe-alert-title`, `oe-alert-actions`; `oe-banner` with `-accent`, `-info`, `-warning` or `-danger`. Put the icon first, then one element of text |
| Close button | `oe-close` |
| Card, stat | `oe-card` with `-flush`, `oe-card-head`, `oe-card-title`, `oe-card-subtitle`, `oe-card-body`, `oe-card-foot`; `oe-stat`, `oe-stat-label`, `oe-stat-value`, `oe-stat-context`, `oe-stat-delta` with `-success` or `-danger` |
| Table | `oe-table-wrap`, `oe-table` with `-compact` or `-sticky`; `oe-table-num`, `oe-table-empty`, `oe-table-sort`, `oe-table-link`, `oe-table-reveal`, `oe-row-selected`. Set `aria-sort` on the sorted `th` |
| Tabs | `oe-tabs` around elements with `aria-selected="true"` or `aria-current="page"` |
| Segmented control | `oe-segmented` around buttons with `aria-pressed` |
| Dialog, drawer | `oe-dialog` with `-sm` or `-lg`, `oe-dialog-head`, `oe-dialog-title`, `oe-dialog-body`, `oe-dialog-actions`; `oe-drawer` with `-left`, `-top` or `-bottom`, on a `<dialog>` |
| Popover | `oe-popover` |
| Menu | `oe-menu`, `oe-menu-item`, `oe-menu-item-danger`, `oe-menu-heading`, `oe-menu-separator`, `oe-menu-shortcut` |
| Toast, tooltip | `oe-toast` with `-info`, `-success`, `-warning` or `-danger`, `oe-toast-title`, `oe-toaster`; `oe-tooltip`. The app places and shows them |
| Loading | `aria-busy="true"` on an `oe-btn`; `oe-spinner`, `oe-skeleton`, `oe-progress` |
| Switch, key hint | `oe-switch`; `oe-kbd` |
| Input with icon | `oe-input-group` |
| Empty state | `oe-empty`, `oe-empty-title`, `oe-empty-text` |
| Pagination, separator, accordion | `oe-pagination`; `oe-separator`; `oe-accordion` |
| Toolbar | `oe-toolbar`, `oe-toolbar-end`, `oe-toolbar-selection` |
| Page layout | `oe-page-narrow`; `oe-skip-link`; `oe-hide-narrow`; `oe-stack`; `oe-stat-grid`; `oe-panels`; `oe-split`, `oe-split-side`; `oe-section`, `oe-section-title`, `oe-section-text`; `oe-auth`, `oe-auth-card`, `oe-auth-brand` |
| Content | `oe-dl`; `oe-list`, `oe-list-item`, `oe-list-text`, `oe-list-title`, `oe-list-subtitle`; `oe-timeline`, `oe-timeline-item`, `oe-timeline-marker`, `oe-timeline-text`, `oe-timeline-time`; `oe-steps`, `oe-step`, `oe-step-done` |
| Text | `oe-link`, `oe-code`, `oe-code-block`, `oe-prose`, `oe-sr-only` |
| Date picker day | `oe-calendar-day`, for a date picker library |
| App shell | `oe-shell`, `oe-shell-main`, `oe-shell-menu`, `oe-shell-toggle`, `oe-topbar`, `oe-topbar-actions`, `oe-breadcrumb`, `oe-sidenav`, `oe-sidenav-brand`, `oe-sidenav-body`, `oe-sidenav-foot`, `oe-nav-heading`, `oe-nav-list`, `oe-nav-item`, `oe-avatar`, `oe-page`, `oe-page-head`, `oe-page-actions`, `oe-page-title`, `oe-page-subtitle` |

- An `svg` placed directly inside a component gets the right size, so a Lucide icon needs no size of its own.
- Buttons and inputs are 32px by default, with `oe-btn-sm` at 28px and `oe-btn-lg` at 40px. On touch screens, targets grow to 44px and inputs use 16px text so iOS doesn't zoom.
- The classes only set the look. Add the behavior and ARIA roles in the app, such as arrow keys for `role="tab"`.
- From 64rem, the page is an inset panel and `oe-shell-main` scrolls rather than the document. An `oe-shell-toggle` button closes the side nav to a rail of icons. Flip its `aria-expanded` between `true` and `false` on click, and the CSS does the rest.
- Below 64rem the side nav becomes a drawer. Give `oe-sidenav` the `popover` attribute and open it from an `oe-shell-menu` button with `popovertarget`, which needs no JavaScript. In a single-page app, call `hidePopover()` on navigation. Set `--oe-sidenav-width` on `oe-shell` to change its width. The showcase's Layout page has the full markup.
- `templates/` in the package has plain HTML for the pages most apps need: data table, dashboard, detail, form, settings, sign-in, news hub, app catalog, chat landing, chat/report workspace and comparison. The showcase's Layout page shows them, and the guide tells agents to start from them.
- Menus, comboboxes, date pickers and data tables need JavaScript. [AGENT-GUIDE.md](AGENT-GUIDE.md) has recipes for putting these classes on Base UI, Bits UI, Reka UI and TanStack Table. They have been run in real React, Svelte and Vue apps.
- Selected states and fills fall back to system colors in Windows high contrast mode, and hover styles only apply on devices that can hover.

The classes are in the `components` CSS layer, so Tailwind utilities override them. Styles outside a layer always beat layered ones, so an app's own reset, such as `button { color: inherit }`, breaks them unless it's in a layer too: `@layer base { ... }`. Tailwind's reset already is.


## Extended patterns

These remain CSS-only. Use the Components showcase for working examples and copyable HTML. Browse compact previews by category or search, then open a focused live example with copyable markup. A sample's URL fragment opens its detail view. The showcase uses local fixtures, simulated chat and no microphone capture.

| Pattern | Classes and behavior |
| --- | --- |
| Product navigation | `oe-topnav`, `oe-topnav-brand`, `oe-topnav-links`; `oe-mega-menu` and `oe-nav-feature` compose rich navigation panels with existing popover and list styles. Use disclosure buttons and native popovers for navigation links; links stay in normal Tab order. App route changes remain your responsibility. |
| Outline | `oe-outline`, links with `aria-current="location"`, and `data-level="2"` for nested headings. Track the actual scrolling container, respect reduced motion and keep target headings below sticky headers. |
| Breadcrumb variants | Keep `oe-breadcrumb` and add `oe-breadcrumb-supporting`, `oe-breadcrumb-chevron`, `oe-breadcrumb-arrow` or `oe-breadcrumb-dot`. Use an ordered list in a named nav, with `aria-current="page"` on the current item. A native select can switch sibling destinations. |
| Tokenizer | `oe-tokenizer`, `oe-tokenizer-tokens`, existing badges and remove buttons. Give the input a visible label; announce selection counts and limits. The wrapper accepts `aria-disabled="true"` or `aria-invalid="true"`; apply the corresponding state and error description to the input too. Apps own selection, search, duplicate prevention and validation. A native datalist supplies suggestions in the demo. |
| Structured search | `oe-power-search` groups keyword input, field/operator/value controls and removable filter badges. Apps own filter evaluation and announce result counts; include clear-all and no-results states. |
| Rich context | `oe-hover-trigger`, `oe-hover-card`, and `oe-timestamp`. Open context on keyboard focus as well as hover; allow pointer travel into the panel, support tap and Escape, and keep it inside the viewport. Use a tooltip only for noninteractive descriptions. Exact-time panels may contain copy buttons; use an accessible popover for those. Format semantic `<time datetime="…">` values with Intl and IANA zone names. |
| Code panels | `oe-code-panel`, `oe-code-head`, `oe-code-line`, `oe-code-number`, `oe-code-scroll`, `oe-syntax-keyword`, `oe-syntax-string`, `oe-syntax-comment`. Add `data-highlighted` to a highlighted line. Apps pre-tokenize and escape code, manage copying and omit gutters from copied text. Keep line numbers `aria-hidden`, provide filenames/language labels and name scroll regions. No syntax-highlighting runtime ships in the package. |
| Comparison | `oe-comparison` on an existing table, `oe-comparison-group` on group rows, `data-best` on highlighted cells and `data-highlight="false"` to turn emphasis off. Keep the table inside `oe-table-wrap`, use real row/column headers and identify best values in text too. The first column stays pinned while scrolling. |
| Content sites | `oe-portal` constrains content width, `oe-feature` gives a featured/main and side column, and `oe-catalog` arranges responsive cards. A catalog card's `data-pinned="true"` moves it first visually; apps own pin state. Keep keyboard and reading order in mind if persisting or sorting cards. |
| Chat composition | `oe-chat`, `oe-chat-workspace`, `oe-chat-thread`, `oe-chat-message`, `oe-chat-bubble`, `oe-chat-meta`, `oe-chat-composer`, `oe-chat-actions`, `oe-chat-system`, `oe-chat-tools`, `oe-chat-attachment`, `oe-chat-scroll`. Set `data-author="user"` for user alignment; set tool status with `data-status="pending"`, `"running"`, `"complete"` or `"error"` and include a visible status label. Reuse badges for context tokens, details for attachment drawers/results, timestamps for metadata, and ordinary buttons for send/stop, dictation and scrolling. |

Chat applications own drafts, stable token values, attachment handling, speech APIs, streaming and cancellation. Label textarea inputs, disable empty sends, preserve Shift+Enter and IME composition, and expose generation status separately from the message log. Auto-scroll only when the reader is already near the latest message; otherwise offer the scroll button. A simulated dictation demo is not a speech implementation.

Toast applications own their queue and timers. Pause expiry while the toast is hovered or contains focus, keep optional actions reachable, and announce updates politely. Tooltip and hover-card behavior also belongs to the application; the classes only provide surfaces.


### Resource and assistant layouts

The news hub, app catalog, chat landing, report workspace and comparison templates use buttons for calls to action. Keep ordinary route navigation in named nav landmarks; connect `data-route` buttons to your application's router. The showcase routes those buttons to its local template pages. Story and app-detail buttons open native dialogs; save, follow-up and comparison choices provide immediate local feedback.

| Layout helpers | Classes |
| --- | --- |
| Content hierarchy | `oe-eyebrow`, `oe-section-head`, `oe-feature-title` |
| Resource cards | `oe-resource-card`, `oe-resource-meta`, `oe-resource-icon`, `oe-resource-option`, alongside existing card head/body/foot classes |
| Featured illustration | `oe-feature-art`, `oe-feature-document`, `oe-feature-document-stat` for a decorative document illustration composed from tokens |
| Catalog filters | `oe-catalog-toolbar` keeps search prominent beside related filters and stacks on phones; `oe-catalog-comfortable` gives resource cards a wider reading measure |
| Assistant start | `oe-chat-start`, `oe-chat-start-head`, `oe-chat-prompts`, `oe-prompt-card`, `oe-prompt-title`, `oe-prompt-text`. Prompt cards are native buttons with a title and supporting description. |
| Report workspace | Add `oe-chat-workspace-studio` to the chat workspace, `oe-chat-panel` to a flush chat card, and `oe-capacity-rows` around labeled progress rows. Keep the report's table available alongside its visual summary. `oe-show-narrow` exposes a segmented mobile switcher; set `data-mobile-pane="chat"` or `"report"` on the studio to choose the visible phone panel without affecting the desktop split view. |

The component library presents compact, inert previews with search and category filters. Selecting a component opens its live example and usage markup in a focused view inside the same OE app shell. Component fragments remain shareable; All components and browser Back restore browsing position. Category sections can still collapse independently. Template previews offer viewport controls, Copy HTML and an Open full page button.

## Agents and the lint check

The package ships [AGENT-GUIDE.md](AGENT-GUIDE.md), a short guide for agents writing UI. Point to it from the app's `AGENTS.md` or `CLAUDE.md`:

```text
Follow node_modules/@oestergaard/design-tokens/AGENT-GUIDE.md for all UI work.
Run npx oe-lint src before finishing, and fix every error.
```

`oe-lint` needs no setup. It reads the installed version's real tokens and classes, so it also works as a check in an app's CI, where it exits with an error if it finds any.

```bash
npx oe-lint src
npx oe-lint src --json
```

| Rule | Catches |
| --- | --- |
| `no-raw-colors` | Hex, `rgb()` and named colors in CSS, style objects, color attributes, Tailwind like `bg-[#fff]` and quoted hex in code |
| `no-ramps` | `--ramp-*` variables |
| `no-dark-overrides` | `prefers-color-scheme`, `[data-theme="dark"]` and `.dark` rules, and `dark:` classes |
| `unknown-token` | `var(--bg-…)`, `--fg-`, `--border-` and `--chart-` names that don't exist, and shadcn names like `--primary` |
| `unknown-class` | `oe-*` classes that don't exist |
| `unknown-utility` | Tailwind's stock colors, and token utilities that don't exist, such as `bg-accent` or `bg-primary` |
| `emphasis-pair` | A solid fill with the wrong text token |
| `deprecated-icons` | Deprecated Lucide packages in `package.json` |
| `icon-button-name` | `oe-btn-icon`, `oe-close` and `oe-badge-remove` with no `aria-label` |
| `input-label` | `oe-input`, `oe-check`, `oe-switch` and `oe-slider` with no label |
| `button-element` | `oe-btn` or `oe-menu-item` on a `<div>` or `<span>` |
| `dialog-element` | `oe-dialog` or `oe-drawer` on anything but a `<dialog>` |
| `switch-role` | `oe-switch` with no `role="switch"` |
| `img-alt` | An `<img>` with no `alt` |
| `table-wrap` | A warning for `oe-table` outside `oe-table-wrap` |
| `unlayered-reset` | A warning for element styles outside a CSS layer, which override the component classes |
| `restyled-component` | A warning when an app changes how an `oe-*` component looks, through a CSS rule, an inline style or a utility. Margins, width, and grid and flex placement are fine. Adding `oe-lint-ignore` with a reason keeps each exception easy to search for |

An app's own variables, `--color-*` theme colors and `.oe-*` classes count as real if the app declares them. Names built at runtime, such as `` var(--fg-on-${intent}) ``, can't be checked and are skipped. The markup rules only check native lowercase elements, because a component like `<Button>` may add the missing part itself. To allow one line, add a comment containing `oe-lint-ignore` on it or the line before.

## Token naming

Tokens are named for the property they color, following the structure of GitHub's Primer.

| Family | Examples |
| --- | --- |
| Text and icons | `fg-default`, `fg-muted`, `fg-disabled`, `fg-link`, `fg-danger`, `fg-on-accent` |
| Surfaces | `bg-page`, `bg-surface`, `bg-raised`, `bg-sunken` |
| States | `bg-hover`, `bg-pressed`, `bg-disabled` |
| Other backgrounds | `bg-inverse`, `bg-scrim` |
| Solid fills | `bg-accent-emphasis`, plus `-hover` and `-active` |
| Quiet fills | `bg-accent-muted`, plus `-hover`. Also used for selected items |
| Borders | `border-default`, `border-strong`, `border-disabled`, `border-danger-emphasis`, `border-danger-muted` |
| Focus | `focus`. Always use an outline offset |
| Shadows | `shadow-raised`, `shadow-overlay`. These adapt to the mode |

Intents are accent, neutral, danger, warning, success and info. Neutral text and borders are the base `fg-` and `border-` tokens. Ramps (`--ramp-*`) are internal and aren't exposed in Tailwind. Every ramp has the same 18 stops as Material's tonal palettes, plus any tones between them that a token uses for contrast.

`bg-hover` and `bg-pressed` are translucent, so they work on every surface. If you need a solid equivalent, composite them over the surface in JS.

Do:

- Pair every `emphasis` fill with its `fg-on-` token.
- Use `bg-hover` and `bg-pressed` for rows and ghost controls.
- Show status with an icon and a label as well as color.

Don't:

- Hard-code hex values or use `--ramp-` variables.
- Write dark-mode overrides. Tokens already flip.
- Use `#068B8C` behind small text. It gets 4.13:1 with white, so keep it for logos and large graphics, where 3:1 is enough.

Solid warning is a light fill by design, so use `border-warning-emphasis` for its edge on light surfaces.

## Why the colors are what they are

The accent keeps the brand's hue and changes only its tone, because `#068B8C` misses the 4.5:1 AA minimum with white text. Light mode uses tone 48 and dark mode uses tone 70. Status hues are fixed rather than blended with the brand, because blending pushed success into the teal accent and danger toward orange.

Stops 51 tones apart always clear 4.5:1, and stops 40 apart always clear 3:1, whatever the hue. Translucent states are measured composited over each surface.

## Changing colors

All color decisions live in [src/spec.ts](src/spec.ts), written as HCT tones. Change them there and run `npm test`. A pair that drops below its contrast minimum fails the suite.

The categorical chart palette is frozen in [src/chart-palette.json](src/chart-palette.json). If the brand hue or the status colors change, regenerate it with `npm run palette:search`, which takes under a minute and gives the same result each time.

## Releasing

`dist/` is committed so apps can install without building. CI fails if it doesn't match the source, so run `npm run build` before committing.

1. Set the new `version` in `package.json` and run `npm test`.
2. Commit to `main` and wait for CI to pass.
3. Tag the commit, such as `v0.3.0`, and push the tag. Apps move up by changing the tag they install.

Every push to `main` that passes CI also updates the showcase.

## Chart colors

Assign the eight colors in order, and keep a color with its series when filters change. The earliest colors are the most distinct, because most charts use few series. Series colors stay clear of the status colors, so a series never reads as an error or a success.

| Series in a chart | Rule |
| --- | --- |
| 1 to 5 | Fine for any chart, including lines and scatter plots |
| 6 to 8 | Stacked or grouped bars only, with a legend and a table view |
| 9 or more | Fold the rest into "Other", or split into small charts |

Give every chart a legend or labels, and a table view. Don't reuse status colors for ordinary series.

The colors came from a search rather than by eye. Distance between colors is OKLab ΔE x100, and the tests enforce at least 25 for the first two colors, 15 for the first five and 10 for all eight. These are calculated, not tested with readers. The limit of five for lines and scatter plots follows research finding that accuracy drops sharply between five and six categories.

The palette isn't color-blind safe, by decision. If that requirement changes, it needs a new search with those checks added.

## Icons

Every app uses [Lucide](https://lucide.dev), which is ISC licensed. Install the package for your framework. This package doesn't depend on Lucide or bundle it, so apps only ship the icons they import.

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

`lucide-vue-next`, `lucide-svelte` and `lucide-angular` are deprecated.

The showcase has every Lucide icon, with search. This package only sets the sizes.

```js
import { iconSizes } from "@oestergaard/design-tokens";

iconSizes.sm; // 4, the spacing step: size-4 or --space-4
```

| Size | Pixels | Tailwind | CSS | Use |
| --- | --- | --- | --- | --- |
| `xs` | 12 | `size-3` | `--space-3` | Badges and dense tables |
| `sm` | 16 | `size-4` | `--space-4` | Buttons, menus and body text |
| `md` | 20 | `size-5` | `--space-5` | Alerts and navigation |
| `lg` | 24 | `size-6` | `--space-6` | Page headers and empty states |

- Color icons with `fg-` tokens. They draw with `currentColor`, so they flip with the mode.
- Keep Lucide's stroke width of 2 at every size.
- Give icon-only buttons an `aria-label`. The framework packages hide an icon from screen readers unless it has a label. `lucide-static` doesn't, so add `aria-hidden` yourself.
- Use Lucide's current names. Old names such as `trash-2` still work as aliases, but Lucide can drop them.

## Layout

| Path | Contents |
| --- | --- |
| `src/spec.ts` | Every color decision |
| `src/icons.ts` | The icon sizes |
| `src/tokens.ts` | Builds the token model and the contrast checks |
| `src/emit.ts` | Writes CSS, Tailwind, JSON and JS |
| `src/components.css` | The component classes |
| `scripts/search-chart-palette.ts` | Finds the chart palette |
| `templates/` | Page templates in plain HTML, shipped in the package for agents to copy |
| `AGENT-GUIDE.md` | The guide for agents in apps. Tests keep its class and token names real |
| `lint/`, `bin/` | The `oe-lint` command, in plain JavaScript with no dependencies |
| `tests/` | Contrast, chart, Tailwind, component and lint checks |
| `site/` | Showcase, which uses only the generated tokens and classes. `site/pages/` has one module per page, and `site/nav.ts` lists the pages |

The published `@material/material-color-utilities` 0.4.0 can't load in plain Node ESM, so scripts run through `tsx` and Vitest inlines it. It's only needed at build time, so apps never load it.
