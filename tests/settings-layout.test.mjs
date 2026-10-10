import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const settingsScreens = [
  'src/features/settings/screens/LanguageScreen.tsx',
  'src/features/settings/screens/NotificationInboxScreen.tsx',
  'src/features/settings/screens/NotificationSettingsScreen.tsx',
  'src/features/profile/screens/EditProfileScreen.tsx',
  'src/features/profile/screens/NutritionProfileScreen.tsx',
  'src/features/profile/screens/DietaryPreferencesScreen.tsx',
  'src/features/profile/screens/AllergiesSettingsScreen.tsx',
  'src/features/profile/screens/AccountSecurityScreen.tsx',
];

test('setting detail screens share the full-width settings layout', () => {
  for (const screenPath of settingsScreens) {
    const source = readFileSync(new URL(`../${screenPath}`, import.meta.url), 'utf8');

    assert.match(source, /<SettingsScreenLayout\b/, screenPath);
    assert.doesNotMatch(source, /<CustomHeader\b|<BackButton\b/, screenPath);
  }
});

test('the shared settings header background extends through the top safe area', () => {
  const source = readFileSync(
    new URL('../src/components/layout/ScreenWrapper.tsx', import.meta.url),
    'utf8'
  );

  assert.match(source, /header \? colors\.background\.surface : undefined/);
});

const customHeaderHosts = [
  'src/components/layout/SettingsScreenLayout.tsx',
  'src/components/navigation/PlaceholderTabScreen.tsx',
  'src/components/navigation/GuidedPlaceholderScreen.tsx',
  'src/features/tracking/screens/FoodDiaryScreen.tsx',
  'src/features/tracking/screens/WeightTrackingScreen.tsx',
  'src/features/tracking/screens/WaterTrackingScreen.tsx',
  'src/features/tracking/screens/TrackingComingSoonScreen.tsx',
  'src/features/tracking/screens/WeightEntryScreen.tsx',
  'src/features/tracking/screens/DiaryEntryScreen.tsx',
];

test('every custom header is mounted in the fixed screen header slot', () => {
  for (const screenPath of customHeaderHosts) {
    const source = readFileSync(new URL(`../${screenPath}`, import.meta.url), 'utf8');

    assert.match(source, /header=\{/, screenPath);
    assert.doesNotMatch(source, />\s*<CustomHeader\b/, screenPath);
  }
});
