import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { PAGES, TEMPLATES } from './nav.ts';

const entry = (path: string) => fileURLToPath(new URL(`${path}index.html`, import.meta.url));

const THEME_SCRIPT = `try {
  var saved = localStorage.getItem('oe-theme');
  if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved;
} catch (e) {}`;

// Every page shares this head. The theme script runs before paint, so a saved theme doesn't flash.
// The favicon can't read CSS variables, so it takes the accent from the generated tokens at build time.
const sharedHead = () => ({
  name: 'shared-head',
  transformIndexHtml: (html: string) => {
    const model = JSON.parse(readFileSync(new URL('../dist/model.json', import.meta.url), 'utf8'));
    const accent = model.roles.find((r: { name: string }) => r.name === 'bg-accent-emphasis').light.hex;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect width='16' height='16' rx='4' fill='${accent}'/></svg>`;
    const meta = (attrs: Record<string, string>) => ({ tag: 'meta', attrs, injectTo: 'head-prepend' as const });
    return {
      html,
      tags: [
        meta({ charset: 'utf-8' }),
        meta({ name: 'viewport', content: 'width=device-width, initial-scale=1' }),
        meta({ name: 'color-scheme', content: 'light dark' }),
        meta({ name: 'description', content: 'Color roles, chart palettes, sizing and component styles for every Oestergaard-AS app, generated from one brand color with HCT.' }),
        { tag: 'script', children: THEME_SCRIPT, injectTo: 'head-prepend' as const },
        { tag: 'link', attrs: { rel: 'icon', href: `data:image/svg+xml,${encodeURIComponent(svg)}` }, injectTo: 'head' as const },
      ],
    };
  },
});

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  appType: 'mpa',
  plugins: [sharedHead()],
  server: { port: 5183, fs: { allow: ['..'] } },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries([...PAGES.map((p) => [p.id, entry(p.path)]), ...TEMPLATES.map((t) => [t.id, entry(`layout/${t.id}/`)])]),
    },
  },
});
