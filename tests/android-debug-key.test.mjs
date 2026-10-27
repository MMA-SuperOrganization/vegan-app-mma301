import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
import test from 'node:test';
import { ensureAndroidDebugKey } from '../scripts/setup-android-debug-key.mjs';

const gitBashTar = join(
  process.env.ProgramFiles ?? 'C:/Program Files',
  'Git/usr/bin/tar.exe'
);

test(
  'setup works with GNU tar from Git Bash and Windows paths containing spaces',
  {
    skip: process.platform !== 'win32' || !existsSync(gitBashTar),
  },
  () => {
    const directory = mkdtempSync(join(tmpdir(), 'vegeta debug key '));
    try {
      const destination = join(directory, 'android/app/debug.keystore');
      const scriptUrl = new URL(
        '../scripts/setup-android-debug-key.mjs',
        import.meta.url
      ).href;
      const pathKey =
        Object.keys(process.env).find((key) => key.toLowerCase() === 'path') ??
        'PATH';
      execFileSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          `const { ensureAndroidDebugKey } = await import(${JSON.stringify(scriptUrl)}); ensureAndroidDebugKey(process.argv[1]);`,
          destination,
        ],
        {
          env: {
            ...process.env,
            [pathKey]: `${dirname(gitBashTar)}${delimiter}${process.env[pathKey] ?? ''}`,
          },
        }
      );
      assert.equal(
        createHash('sha256').update(readFileSync(destination)).digest('hex'),
        '221e0a3106aa4c3ccc154e0a418b55020b3f9ea6e84f92e8749cd9e2f39f5e58'
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }
);

test('fresh checkouts get the same development key and setup is repeatable', () => {
  const directory = mkdtempSync(join(tmpdir(), 'vegeta-debug-key-'));
  try {
    const destination = join(directory, 'android/app/debug.keystore');
    ensureAndroidDebugKey(destination);
    const key = readFileSync(destination);
    assert.equal(
      createHash('sha256').update(key).digest('hex'),
      '221e0a3106aa4c3ccc154e0a418b55020b3f9ea6e84f92e8749cd9e2f39f5e58'
    );
    ensureAndroidDebugKey(destination);
    assert.deepEqual(readFileSync(destination), key);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('setup preserves an existing custom keystore and reports the conflict', () => {
  const directory = mkdtempSync(join(tmpdir(), 'vegeta-debug-key-'));
  try {
    const destination = join(directory, 'debug.keystore');
    writeFileSync(destination, 'existing custom key');
    assert.throws(
      () => ensureAndroidDebugKey(destination),
      /different debug keystore/
    );
    assert.equal(readFileSync(destination, 'utf8'), 'existing custom key');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('Windows native builds keep vector-icon codegen paths short', () => {
  const appGradle = readFileSync(
    new URL('../android/app/build.gradle', import.meta.url),
    'utf8'
  );
  const lock = JSON.parse(
    readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8')
  );

  assert.match(appGradle, /\.vc\/\$\{checkoutId\}/);
  assert.equal(
    lock.packages[''].dependencies[
      '@react-native-vector-icons/material-design-icons'
    ],
    '13.1.5'
  );
  assert.equal(
    lock.packages[
      'node_modules/@ronradtke/react-native-markdown-display/node_modules/@react-native-vector-icons/material-design-icons'
    ],
    undefined
  );
});
