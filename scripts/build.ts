import { mkdirSync, writeFileSync } from 'node:fs';
import { emitDtcg, emitDts, emitJs, emitTailwindCss, emitTokensCss } from '../src/emit.ts';
import { buildModel } from '../src/tokens.ts';

const dist = new URL('../dist/', import.meta.url);
mkdirSync(dist, { recursive: true });
const write = (file: string, content: string) => writeFileSync(new URL(file, dist), content);
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n';

const model = buildModel();
write('tokens.css', emitTokensCss(model));
write('tailwind.css', emitTailwindCss(model));
write('tokens.light.json', json(emitDtcg(model, 'light')));
write('tokens.dark.json', json(emitDtcg(model, 'dark')));
write('index.js', emitJs(model));
write('index.d.ts', emitDts(model));
write('model.json', json(model));

const failed = model.contrast.filter((c) => !c.pass);
console.log(`Built ${model.roles.length} roles. Contrast: ${model.contrast.length - failed.length}/${model.contrast.length} pass.`);
for (const c of failed) console.log(`  FAIL ${c.mode} ${c.fg} on ${c.bg}: ${c.ratio} (needs ${c.min})`);
