import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.HERO_GUESSER_BASE_URL ?? 'http://127.0.0.1:4180';
let server;
try {
  try { await fetch(base); }
  catch {
    server = spawn('python3', ['scripts/serve.py'], { stdio: 'ignore' });
    let ready = false;
    for (let i = 0; i < 100; i++) {
      try { await fetch(base); ready = true; break; } catch { await new Promise(r => setTimeout(r, 100)); }
    }
    if (!ready) throw Error('Preview server did not start');
  }
  await mkdir('output/browser-suite', { recursive: true });
  for (const name of ['guild-design', 'daily-row-tools', 'first-run', 'home', 'tutorial', 'adventures', 'story-campaign', 'story-prelude', 'flow', 'party-roll', 'feedback', 'drag', 'mobile-scroll', 'art', 'celebration', 'release', 'placement-audio', 'completion-audio', 'background-music']) {
    const script = { 'guild-design': 'scripts/check-guild-design.mjs', 'daily-row-tools': 'scripts/check-daily-row-tools.mjs', 'first-run': 'scripts/check-first-run.mjs', release: 'scripts/check-release.mjs', 'story-campaign': 'scripts/check-story-campaign.mjs', 'story-prelude': 'scripts/check-story-prelude.mjs', 'placement-audio': 'scripts/check-placement-audio.mjs', 'completion-audio': 'scripts/check-completion-audio.mjs', 'background-music': 'scripts/check-background-music.mjs' }[name] ?? `scripts/check-mastermind-${name}.mjs`;
    let output = '';
    const code = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [script], { env: process.env });
      child.stdout.on('data', data => { output += data; process.stdout.write(data); });
      child.stderr.on('data', data => { output += data; process.stderr.write(data); });
      child.on('error', reject); child.on('close', resolve);
    });
    await writeFile(`output/browser-suite/${name}.txt`, output);
    if (code !== 0) throw Error(`${script} failed (${code})`);
  }
} finally { server?.kill(); }
