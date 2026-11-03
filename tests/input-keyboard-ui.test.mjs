import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('birth date field restricts typing and opens the branded calendar', () => {
  const field = read('../src/components/ui/DateInputField/DateInputField.tsx');
  const calendarField = read(
    '../src/components/ui/CalendarInputField/CalendarInputField.tsx'
  );
  const calendar = read(
    '../src/components/ui/CalendarDatePicker/CalendarDatePicker.tsx'
  );
  const onboarding = read(
    '../src/features/onboarding/screens/NutritionProfileScreen.tsx'
  );

  assert.match(field, /<CalendarInputField/);
  assert.match(calendarField, /keyboardType="numbers-and-punctuation"/);
  assert.match(calendarField, /<CalendarDatePicker/);
  assert.match(calendarField, /trailingIcon="calendar"/);
  assert.doesNotMatch(calendarField, /<Button/);
  assert.doesNotMatch(field, /DateTimePicker|RNCDatePicker/);
  assert.match(calendar, /view === 'month'/);
  assert.match(calendar, /view === 'year'/);
  assert.match(calendar, /maximumDate/);
  assert.match(onboarding, /<DateInputField/);
});

test('manually editable dates expose the shared branded calendar button', () => {
  for (const file of [
    '../src/features/pantry/screens/PantryItemEditorScreen.tsx',
    '../src/features/pantry/components/IngredientReviewEditor.tsx',
    '../src/features/reminders/screens/RemindersScreen.tsx',
    '../src/features/tracking/components/WeightLogModal.tsx',
    '../src/features/ai/screens/AiMealPlannerScreen.tsx',
  ]) {
    assert.match(read(file), /<CalendarInputField/);
  }
});

test('application dialogs replace native phone alerts across feature screens', () => {
  const layout = read('../src/app/_layout.tsx');
  const dialog = read('../src/components/ui/AppDialog/AppDialogProvider.tsx');

  assert.match(layout, /<AppDialogProvider>/);
  assert.match(dialog, /statusBarTranslucent/);
  assert.match(dialog, /navigationBarTranslucent/);
  assert.match(dialog, /variant=\{destructive \? 'danger' : 'primary'\}/);

  for (const file of [
    '../src/features/grocery/screens/GroceryDetailScreen.tsx',
    '../src/features/meal-plan/screens/MealPlanScreen.tsx',
    '../src/features/profile/screens/AccountSecurityScreen.tsx',
    '../src/features/recipes/screens/MyRecipesScreen.tsx',
    '../src/features/community/screens/CommunityScreen.tsx',
  ]) {
    const source = read(file);
    assert.match(source, /appDialog\.alert/);
    assert.doesNotMatch(source, /Alert\.alert/);
  }
});

test('AI bottom sheet resizes and scrolls its composer above the Android keyboard', () => {
  const sheet = read('../src/components/ui/BottomSheet/BottomSheet.tsx');
  const chat = read('../src/features/ai/components/AiChatWidget.tsx');

  assert.match(sheet, /Platform\.OS === 'ios' \? 'padding' : 'height'/);
  assert.match(chat, /useKeyboardInsets\(\)/);
  assert.match(chat, /keyboard\.visible/);
  assert.match(chat, /scrollToEnd/);
});

test('bottom sheet fully covers and clips its bottom surface on Android', () => {
  const sheet = read('../src/components/ui/BottomSheet/BottomSheet.tsx');

  assert.match(sheet, /statusBarTranslucent/);
  assert.match(sheet, /navigationBarTranslucent/);
  assert.match(sheet, /overflow: 'hidden'/);
  assert.match(sheet, /backgroundColor: colors\.background\.surface/);
});

test('password input renders eye and eye-off toggle icon instead of text dot', () => {
  const input = read('../src/components/ui/Input/Input.tsx');
  const assets = read('../src/theme/assets.ts');

  assert.match(assets, /eye:\s*\{/);
  assert.match(assets, /'eye-off':\s*\{/);
  assert.match(input, /visible \? 'eye-off' : 'eye'/);
  assert.doesNotMatch(
    input,
    /kind === 'password'[\s\S]*?<AppText[^>]*>\{icon\.text\}<\/AppText>/
  );
});
