import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// The favicon can't read CSS variables, so it takes the accent from the generated tokens at build time.
const accentFavicon = () => ({
  name: 'accent-favicon',
  transformIndexHtml: (html: string) => {
    const model = JSON.parse(readFileSync(new URL('../dist/model.json', import.meta.url), 'utf8'));
    const accent = model.roles.find((r: { name: string }) => r.name === 'bg-accent-emphasis').light.hex;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect width='16' height='16' rx='4' fill='${accent}'/></svg>`;
    return {
      html,
      tags: [{ tag: 'link', attrs: { rel: 'icon', href: `data:image/svg+xml,${encodeURIComponent(svg)}` }, injectTo: 'head' as const }],
    };
  },
});

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  plugins: [accentFavicon()],
  server: { port: 5183, fs: { allow: ['..'] } },
  build: { outDir: 'dist', emptyOutDir: true },
});
