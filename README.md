# Oestergaard design tokens

Color roles, chart palettes and sizing for every Oestergaard-AS app, in any framework. Everything is generated from one brand color, `#068B8C`, using [HCT](https://github.com/material-foundation/material-color-utilities).

The package ships tokens and icon sizes only. Components stay with each app or framework until apps show a repeated need.

## Commands

```bash
npm install
npm run dev            # showcase site at http://localhost:5183
npm test               # build tokens, then check contrast, chart palettes and Tailwind output
npm run typecheck
npm run site:build     # static showcase in site/dist, for any static host
```

## Using it

See the [showcase](https://oestergaard-a-s.github.io/design-system/). The package isn't on npm. Install it from GitHub at a version tag:

```bash
npm install github:Oestergaard-A-S/design-system#v0.1.1
```

Apps without npm can link the CSS directly:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Oestergaard-A-S/design-system@v0.1.1/dist/tokens.css" />
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
3. Tag the commit, such as `v0.2.0`, and push the tag. Apps move up by changing the tag they install.

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
| `scripts/search-chart-palette.ts` | Finds the chart palette |
| `tests/` | Contrast, chart and Tailwind checks |
| `site/` | Showcase, which uses only the generated tokens |

The published `@material/material-color-utilities` 0.4.0 can't load in plain Node ESM, so scripts run through `tsx` and Vitest inlines it. It's only needed at build time, so apps never load it.
