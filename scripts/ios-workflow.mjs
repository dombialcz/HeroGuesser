import { spawn, execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const [mode = 'open', ...args] = process.argv.slice(2);
if (!['open', 'run', 'test'].includes(mode) || args.includes('--help')) {
  console.log('npm run ios                  Build, sync and open Xcode');
  console.log('npm run ios:run              Build, install and launch in an iPhone simulator');
  console.log('npm run ios:test             Run native UI tests in an iPhone simulator');
  console.log('Optional: -- --simulator "iPhone 18 Pro" (or an exact simulator UDID)');
  process.exit(args.includes('--help') ? 0 : 1);
}
if (process.platform !== 'darwin') throw Error('The iPhone workflow requires a Mac with Xcode. Use npm run serve for web development.');
if (!existsSync(path.join(root, 'node_modules/@capacitor/cli'))) throw Error('Install dependencies first: npm ci');
if (!existsSync(path.join(root, 'ios/App/App.xcodeproj'))) throw Error('The tracked iOS project is missing: restore ios/ from the repository.');
let requested;
for (let i = 0; i < args.length; i++) {
  if (args[i] !== '--simulator' || !args[i + 1]) throw Error('Expected --simulator followed by an iPhone simulator name or UDID.');
  requested = args[++i];
}

async function run(command, parameters) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, parameters, { cwd: root, stdio: 'inherit' });
    child.once('error', reject);
    child.once('close', (code, signal) => code === 0 ? resolve() : reject(Error(`${command} failed (${signal ?? code}). See the output above.`)));
  });
}
function selectSimulator() {
  let data;
  try { data = JSON.parse(execFileSync('xcrun', ['simctl', 'list', 'devices', 'available', '--json'], { encoding: 'utf8' })); }
  catch { throw Error('Xcode simulator tools are unavailable. Select Xcode in Settings → Locations → Command Line Tools, and install an iOS simulator runtime.'); }
  const phones = Object.entries(data.devices)
    .sort(([a], [b]) => b.localeCompare(a, undefined, { numeric: true }))
    .flatMap(([runtime, devices]) => devices.filter(d => d.isAvailable && d.name.startsWith('iPhone')).map(d => ({ ...d, runtime })));
  if (!phones.length) throw Error('No iPhone simulator is installed. Add one in Xcode → Settings → Components.');
  if (requested) {
    const matches = phones.filter(d => d.udid === requested || d.name === requested);
    if (matches.length !== 1) throw Error(`Choose an exact simulator UDID. Available iPhones:\n${phones.map(d => `${d.name}: ${d.udid} (${d.runtime})`).join('\n')}`);
    return matches[0];
  }
  return phones.find(d => d.state === 'Booted') ?? phones[0];
}

try {
  const simulator = mode === 'open' ? null : selectSimulator();
  console.log('Building the shared game and syncing bundled iPhone assets…');
  await run('npm', ['run', 'ios:sync']);
  if (mode === 'open') {
    console.log('Opening Xcode. Select scheme App, an iPhone destination, then press ⌘R.');
    await run('npm', ['run', 'ios:open']);
  } else {
    console.log(`Using ${simulator.name} (${simulator.udid}).`);
    if (simulator.state !== 'Booted') await run('xcrun', ['simctl', 'boot', simulator.udid]);
    await run('xcrun', ['simctl', 'bootstatus', simulator.udid, '-b']);
    const developer = execFileSync('xcode-select', ['-p'], { encoding: 'utf8' }).trim();
    const classic = path.join(developer, 'Applications/Simulator.app');
    const hub = [path.join(developer, '../Applications/DeviceHub.app'), path.join(developer, 'Applications/DeviceHub.app')].find(p => existsSync(p));
    if (existsSync(classic)) {
      await run('open', ['-a', classic, '--args', '-CurrentDeviceUDID', simulator.udid]);
    } else if (hub) {
      await run('open', ['-a', hub, `devices://device/open?id=${encodeURIComponent(simulator.udid)}`]);
    } else {
      throw Error('No Simulator or Device Hub application was found in the selected Xcode installation.');
    }
    await run('xcodebuild', [mode === 'test' ? 'test' : 'build', '-quiet',
      '-project', 'ios/App/App.xcodeproj', '-scheme', 'App', '-configuration', 'Release',
      '-destination', `platform=iOS Simulator,id=${simulator.udid}`,
      '-derivedDataPath', 'output/ios-build', 'CODE_SIGNING_ALLOWED=NO']);
    if (mode === 'run') {
      const { appId } = JSON.parse(readFileSync(path.join(root, 'capacitor.config.json'), 'utf8'));
      await run('xcrun', ['simctl', 'install', simulator.udid, path.join(root, 'output/ios-build/Build/Products/Release-iphonesimulator/App.app')]);
      await run('xcrun', ['simctl', 'launch', '--terminate-running-process', simulator.udid, appId]);
      console.log('Guild of Wits is running. After editing JS/CSS, run npm run ios:run again.');
    }
  }
} catch (error) {
  console.error(`\n${error.message}`);
  process.exitCode = 1;
}
