import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist);
for (const name of ['index.html', 'mastermind.css', 'src', 'assets']) {
  await cp(path.join(root, name), path.join(dist, name), {
    recursive: true,
    filter: source => !source.endsWith('.json'),
  });
}
await writeFile(path.join(dist, '.nojekyll'), '');
console.log('Built independent static site in dist/');
