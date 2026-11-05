import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('admin navigation reuses the same configurable bottom tab as user navigation', () => {
  const adminLayout = read('../src/app/admin/_layout.tsx');
  const userLayout = read('../src/app/(tabs)/_layout.tsx');
  const tabBar = read('../src/components/navigation/CustomTabBar.tsx');
  assert.match(adminLayout, /<CustomTabBar/);
  assert.match(userLayout, /<CustomTabBar/);
  assert.match(tabBar, /config = TAB_CONFIG/);
  assert.match(tabBar, /order = TAB_ORDER/);
  assert.doesNotMatch(adminLayout, /AdminTabBar/);
});

test('admin post management exposes list, create, edit and delete actions', () => {
  const screen = read('../src/features/admin/AdminContentScreen.tsx');
  const api = read('../src/features/admin/adminApi.ts');
  assert.match(screen, /adminApi\.posts/);
  assert.match(screen, /community\/editor/);
  assert.match(screen, /adminApi\.removePost/);
  assert.match(api, /apiClient\.get\('\/admin\/content\/pending'/);
  assert.match(api, /apiClient\.delete\(`\/posts\/\$\{id\}`\)/);
});

test('admin dashboard renders system engagement metrics', () => {
  const screen = read('../src/features/admin/AdminDashboardScreen.tsx');
  assert.match(screen, /summary\.data\.engagement\.comments/);
  assert.match(screen, /summary\.data\.engagement\.reactions/);
  assert.match(screen, /summary\.data\.engagement\.savedItems/);
  assert.match(screen, /summary\.data\.engagement\.postTotals\.views/);
});
