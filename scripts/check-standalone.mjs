import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(process.argv[2] ?? '.');
const visited = new Set();
async function visit(relative) {
  const file = path.resolve(root, relative);
  assert.ok(file.startsWith(root + path.sep), `Escaping dependency: ${relative}`);
  if (visited.has(file)) return;
  visited.add(file);
  assert.ok((await stat(file)).isFile(), `Not a file: ${relative}`);
  if (!/\.(html|css|js)$/.test(file)) return;
  const text = await readFile(file, 'utf8');
  assert.ok(!/(?:dungeon\.html|fantango\.git|(?:\.\.\/)+fantango|["']\.\/generator\.js)/i.test(text), `Cross-game reference: ${relative}`);
  const references = [];
  if (file.endsWith('.html')) for (const m of text.matchAll(/(?:src|href)="([^"]+)"/g)) references.push(m[1]);
  if (file.endsWith('.css')) for (const m of text.matchAll(/url\(["']?([^"')]+)["']?\)/g)) references.push(m[1]);
  if (file.endsWith('.js')) {
    for (const m of text.matchAll(/(?:from\s+|import\s*)["'](\.[^"']+)["']/g)) references.push(m[1]);
    for (const m of text.matchAll(/["'](assets\/[^"'`]+\.(?:webp|svg|png|jpg))["']/g)) references.push(m[1]);
  }
  for (const reference of references) {
    if (/^(?:https?:|data:|#)/.test(reference) || reference.includes('${')) continue;
    assert.ok(!reference.startsWith('/'), `Non-relative Pages asset: ${reference}`);
    const clean = reference.split(/[?#]/)[0];
    if (!clean || clean === './') continue;
    // Asset URLs in game JS are relative to the HTML document, as used by img.src.
    const dependency = clean.startsWith('assets/') ? clean : path.join(path.dirname(relative), clean);
    await visit(dependency);
  }
}
await visit('index.html');
// Template-based portrait paths are not visible to a string-reference scan.
for (const piece of ['thief','knight','bard','cleric','barbarian','ranger','mage','ale','zombie','king']) await visit(`assets/mastermind/${piece}.webp`);
for (const piece of ['coin','window','bell']) await visit(`assets/mastermind/${piece}.svg`);
console.log(`Independent runtime graph verified: ${visited.size} files under ${root}`);
