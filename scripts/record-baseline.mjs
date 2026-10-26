import { execFileSync, spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';
const commit = 'd93c9d6';
const root = path.resolve('output/release-baseline');
const source = path.join(root, 'source');
await mkdir(source, { recursive: true });
execFileSync('git', ['archive', '--format=tar', '--output', path.join(root, 'source.tar'), commit]);
execFileSync('tar', ['-xf', path.join(root, 'source.tar'), '-C', source]);
await writeFile(path.join(root, 'unit-tests.txt'), execFileSync(process.execPath, ['--test'], { cwd: source }));
const { CHALLENGES, generateChallenge } = await import(pathToFileURL(path.join(source, 'src/mastermind-core.js')));
await writeFile(path.join(root, 'daily-codes.json'), JSON.stringify(CHALLENGES.map(c => generateChallenge('2026-10-25', c.id)), null, 2));
const server = spawn('python3', [path.join(source, 'scripts/serve.py'), '--port', '4182'], { stdio: 'ignore' });
let browser;
try {
  for (let i = 0; i < 100; i++) { try { await fetch('http://127.0.0.1:4182/'); break; } catch { await new Promise(r => setTimeout(r, 100)); } }
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await page.route('https://fonts.*/*', route => route.abort());
  await page.goto('http://127.0.0.1:4182/'); await page.locator('#home-play-stories').waitFor();
  await page.screenshot({ path: path.join(root, 'home.png'), fullPage: true });
  await page.locator('#home-play-stories').click(); await page.locator('#start-adventure-0').click(); await page.locator('#adventure-next').click();
  await page.screenshot({ path: path.join(root, 'story.png'), fullPage: true });
  await writeFile(path.join(root, 'metadata.json'), JSON.stringify({ commit, date: '2026-10-25', expectedUnitTests: 14, note: 'Original network fonts blocked for reproducible fallback-font captures.' }, null, 2));
} finally { await browser?.close(); server.kill(); }
console.log(`Original baseline ${commit} recorded in ${root}`);
