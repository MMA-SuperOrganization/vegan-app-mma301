import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('media uploads honor the mobile-safe signed header contract', () => {
  const mediaApi = read('../src/features/media/mediaApi.ts');

  assert.match(mediaApi, /upload\.headers \?\? upload\.requiredHeaders/);
  assert.match(mediaApi, /key\.toLowerCase\(\) !== 'content-length'/);
  assert.match(mediaApi, /apiClient\.post\(`\/media\/\$\{upload\.assetId\}\/confirm`/);
});

test('profile avatar uploads the selected compatible image before saving its media id', () => {
  const profile = read('../src/features/profile/screens/EditProfileScreen.tsx');
  const api = read('../src/features/profile/profileApi.ts');

  assert.match(profile, /mediaApi\.uploadImage\(asset, 'avatar'\)/);
  assert.match(profile, /PreferredAssetRepresentationMode\.Compatible/);
  assert.match(profile, /avatarUpload\.mutateAsync\(avatar\)/);
  assert.match(api, /avatarMediaId: values\.avatarMediaId/);
});
