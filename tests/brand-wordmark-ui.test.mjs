import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('VEGETA wordmark uses a two-leaf V and uppercase remaining letters', () => {
  const wordmark = read('../src/components/ui/BrandWordmark/BrandWordmark.tsx');
  const homeHeader = read(
    '../src/features/community/components/HomeSocialHeader.tsx'
  );
  const register = read('../src/features/auth/screens/RegisterScreen.tsx');

  assert.match(wordmark, /accessibilityLabel="VEGETA"/);
  assert.match(wordmark, />\s*EGETA\s*</);
  assert.equal((wordmark.match(/<Path/g) ?? []).length, 2);
  assert.match(homeHeader, /<BrandWordmark size=\{26\}/);
  assert.doesNotMatch(homeHeader, />Vegata</);
  assert.match(register, /<BrandWordmark size=\{24\}/);
});
