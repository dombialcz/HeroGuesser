import { readFile } from 'node:fs/promises';
const p = JSON.parse(await readFile('release/publisher.json', 'utf8'));
const missing = [];
for (const field of ['publisherName', 'supportEmail', 'appleTeamId', 'physicalDeviceEvidence', 'voiceOverEvidence', 'upgradeOfflineEvidence', 'testFlightEvidence', 'releaseCommit']) if (!p[field]) missing.push(field);
for (const field of ['appStoreNameConfirmed', 'publicPolicyFinalized', 'assetRightsReviewed', 'disclosuresReviewed', 'publisherSubmissionApproval']) if (p[field] !== true) missing.push(field);
if (!Number.isInteger(p.observedPlaytests) || p.observedPlaytests < 5) missing.push('five observed playtests');
const config = JSON.parse(await readFile('capacitor.config.json', 'utf8'));
if (config.appName !== p.appName || config.appId !== p.bundleId) missing.push('matching native identity');
if (config.server?.url || config.ios?.webContentsDebuggingEnabled !== false || config.loggingBehavior !== 'none') missing.push('production WebView configuration');
if (missing.length) {
  console.error('Store release is not ready. Required publisher/device evidence:\n' + missing.map(x => `- ${x}`).join('\n'));
  process.exitCode = 1;
} else console.log('Recorded publisher/device gates complete. Validate the exact signed archive and current console requirements before submission.');
