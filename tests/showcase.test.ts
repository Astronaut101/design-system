import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TEMPLATES } from '../site/nav.ts';
import { CHAT_PARTS } from '../site/samples/chat.ts';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('expanded showcase contracts', () => {
  it('provides unique template ids and descriptions for all previews', () => {
    expect(TEMPLATES).toHaveLength(11);
    expect(new Set(TEMPLATES.map(t => t.id)).size).toBe(TEMPLATES.length);
    for (const template of TEMPLATES) {
      expect(template.description.length).toBeGreaterThan(30);
      expect(template.category.length).toBeGreaterThan(0);
      if (template.reference) expect(new URL(template.reference).protocol).toBe('https:');
    }
    expect(TEMPLATES.filter(t => t.reference)).toHaveLength(5);
  });

  it('covers all fifteen chat parts as distinct samples', () => {
    expect(CHAT_PARTS).toHaveLength(15);
    expect(new Set(CHAT_PARTS).size).toBe(15);
    expect(CHAT_PARTS).toContain('composer-token-element');
    expect(CHAT_PARTS).toContain('layout-scroll-button');
    expect(CHAT_PARTS).toContain('dictation-button');
  });

  it('keeps the package framework-neutral and exports only the existing surface', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.dependencies ?? {}).toEqual({});
    expect(Object.keys(pkg.exports)).toEqual(['.', './tokens.css', './tailwind.css', './components.css', './tokens.light.json', './tokens.dark.json']);
    expect(pkg.files).not.toContain('site');
    expect(pkg.files).not.toContain('tests');
  });

  it('keeps every template copyable without showcase dependencies or scripts', () => {
    for (const template of TEMPLATES) {
      const html = read(`templates/${template.id}.html`);
      expect(html).not.toContain('<script');
      expect(html).not.toContain('site.css');
      expect(html).toContain('../dist/components.css');
      if (template.id !== 'sign-in') expect(html).toContain('oe-skip-link');
    }
  });
  it('uses button actions in the redesigned templates', () => {
    for (const id of ['news-hub','app-catalog','chat-landing','chat-workspace','comparison']) {
      const html = read(`templates/${id}.html`);
      expect(html).not.toMatch(/<a[^>]*class="[^"]*oe-(?:link|btn)\b/);
      expect(html).toContain('<button');
    }
    const preview = read('site/pages/layout.ts');
    expect(preview).not.toContain('preview-reference');
    expect(preview).not.toContain('>Inspiration<');
  });

});
