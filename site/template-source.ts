/// <reference types="vite/client" />
import type { TemplateId } from './nav.ts';

const files = import.meta.glob<string>('../templates/*.html', { query: '?raw', import: 'default', eager: true });
export const templateSource = (id: TemplateId) => files[`../templates/${id}.html`];
