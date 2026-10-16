import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const templatePath = fileURLToPath(import.meta.resolve('expo/template.tgz'));
// Public development key shipped by Expo, never a production signing key.
const expectedKeyHash =
  '221e0a3106aa4c3ccc154e0a418b55020b3f9ea6e84f92e8749cd9e2f39f5e58';

export function ensureAndroidDebugKey(destination) {
  const key = execFileSync('tar', [
    '-xOf',
    templatePath,
    'package/android/app/debug.keystore',
  ]);
  if (createHash('sha256').update(key).digest('hex') !== expectedKeyHash) {
    throw new Error(
      'Expo template debug key changed. Review its SHA-1 registration before building.'
    );
  }
  if (existsSync(destination)) {
    if (!readFileSync(destination).equals(key)) {
      throw new Error(
        `A different debug keystore exists at ${destination}. Back it up before using the shared development key.`
      );
    }
    return;
  }
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, key, { flag: 'wx' });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  ensureAndroidDebugKey(resolve(projectRoot, 'android/app/debug.keystore'));
  console.log('Android development signing ready (Expo public debug key).');
}
