import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createAsyncActionController,
  AsyncActionBusyError,
  AsyncActionDiscardedError,
} from '../src/hooks/asyncAction.ts';
import { normalizeSelection, toggleSelection } from '../src/hooks/selection.ts';
import { scheduleDebounced } from '../src/hooks/debounce.ts';
import {
  createKeyboardObserver,
  hiddenKeyboard,
  keyboardOverlap,
} from '../src/hooks/keyboardObserver.ts';
import { contentWidthForViewport } from '../src/hooks/responsiveLayout.ts';
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
test('async locks synchronously, resolves and can run again without retry', async () => {
  const controller = createAsyncActionController();
  const task = deferred();
  let calls = 0;
  const action = () => {
    calls++;
    return task.promise;
  };
  const first = controller.run(action);
  await assert.rejects(controller.run(action), AsyncActionBusyError);
  assert.equal(calls, 1);
  assert.equal(controller.getSnapshot().pending, true);
  task.resolve('ok');
  assert.equal(await first, 'ok');
  assert.deepEqual(controller.getSnapshot(), { pending: false, error: null });
  assert.equal(await controller.run(async (value) => value, 'again'), 'again');
});
test('async rejects with original error and reset clears it', async () => {
  const controller = createAsyncActionController();
  const error = new Error('failed');
  await assert.rejects(
    controller.run(() => {
      throw error;
    }),
    (candidate) => candidate === error
  );
  assert.equal(controller.getSnapshot().error, error);
  controller.reset();
  assert.deepEqual(controller.getSnapshot(), { pending: false, error: null });
});
test('reset while pending discards stale resolution and keeps lock until settle', async () => {
  const controller = createAsyncActionController();
  const task = deferred();
  const first = controller.run(() => task.promise);
  controller.reset();
  assert.equal(controller.getSnapshot().pending, true);
  await assert.rejects(
    controller.run(async () => 'new'),
    AsyncActionBusyError
  );
  task.resolve('old');
  await assert.rejects(first, AsyncActionDiscardedError);
  assert.deepEqual(controller.getSnapshot(), { pending: false, error: null });
  assert.equal(await controller.run(async () => 'new'), 'new');
});
test('stale rejection does not overwrite reset error', async () => {
  const controller = createAsyncActionController();
  const task = deferred();
  const run = controller.run(() => task.promise);
  controller.reset();
  task.reject(new Error('old'));
  await assert.rejects(run, AsyncActionDiscardedError);
  assert.equal(controller.getSnapshot().error, null);
});
test('unmount suppresses notifications; activate supports strict effect replay', async () => {
  const controller = createAsyncActionController();
  const task = deferred();
  let updates = 0;
  const stop = controller.subscribe(() => updates++);
  const run = controller.run(() => task.promise);
  assert.equal(updates, 1);
  controller.deactivate();
  stop();
  task.resolve('old');
  await assert.rejects(run, AsyncActionDiscardedError);
  assert.equal(updates, 1);
  await assert.rejects(
    controller.run(async () => 'inactive'),
    AsyncActionDiscardedError
  );
  controller.activate();
  assert.equal(controller.getSnapshot().pending, false);
  assert.equal(await controller.run(async () => 'live'), 'live');
});
test('two async controllers own independent pending/errors', async () => {
  const a = createAsyncActionController(),
    b = createAsyncActionController(),
    task = deferred();
  const run = a.run(() => task.promise);
  assert.equal(await b.run(async () => 'b'), 'b');
  assert.equal(a.getSnapshot().pending, true);
  assert.equal(b.getSnapshot().pending, false);
  task.resolve('a');
  await run;
});
test('selection single/multi/clear input ownership and removed-key retain policy', () => {
  const input = Object.freeze(['a', 'b', 'a']);
  assert.deepEqual(normalizeSelection(input, 'single'), ['a']);
  assert.deepEqual(normalizeSelection(input, 'multi'), ['a', 'b']);
  assert.deepEqual(toggleSelection(input, 'a', 'multi'), ['b']);
  assert.deepEqual(toggleSelection(['a'], 'b', 'single'), ['b']);
  assert.deepEqual(toggleSelection(['a'], 'b', 'multi'), ['a', 'b']);
  assert.deepEqual(toggleSelection(['a'], 'a', 'single'), []);
  // Selection does not know items/filter; caller explicitly clears retained keys.
  assert.deepEqual(normalizeSelection(['removed'], 'multi'), ['removed']);
  assert.deepEqual(normalizeSelection([], 'multi'), []);
  assert.deepEqual(input, ['a', 'b', 'a']);
});
test('debounce publishes only last value; changing delay cancels previous timer', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const values = [];
  let cancel = scheduleDebounced('a', 300, (value) => values.push(value));
  t.mock.timers.tick(100);
  cancel();
  cancel = scheduleDebounced('ab', 300, (value) => values.push(value));
  t.mock.timers.tick(100);
  cancel();
  scheduleDebounced('abc', 100, (value) => values.push(value));
  t.mock.timers.tick(99);
  assert.deepEqual(values, []);
  t.mock.timers.tick(1);
  assert.deepEqual(values, ['abc']);
  t.mock.timers.tick(1000);
  assert.deepEqual(values, ['abc']);
});
test('debounce cleanup/unmount cancels callbacks; delay is normalized', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let calls = 0;
  const stop = scheduleDebounced('unmounted', 100, () => calls++);
  stop();
  t.mock.timers.tick(1000);
  assert.equal(calls, 0);
  scheduleDebounced('now', NaN, () => calls++);
  t.mock.timers.tick(1);
  assert.equal(calls, 1);
});
test('keyboard adapter subscription shared by two consumers and cleaned after last', () => {
  let starts = 0,
    stops = 0,
    emit,
    aUpdates = 0,
    bUpdates = 0;
  const observer = createKeyboardObserver({
    read: () => hiddenKeyboard,
    listen: (publish) => {
      starts++;
      emit = publish;
      return () => stops++;
    },
  });
  const a = observer.subscribe(() => aUpdates++),
    b = observer.subscribe(() => bUpdates++);
  assert.equal(starts, 1);
  emit({ visible: true, height: 300, screenY: 500 });
  assert.equal(aUpdates, 1);
  assert.equal(bUpdates, 1);
  assert.equal(keyboardOverlap(observer.getSnapshot(), 800), 300);
  assert.equal(keyboardOverlap(observer.getSnapshot(), 600), 100);
  assert.equal(keyboardOverlap(observer.getSnapshot(), 500), 0);
  a();
  assert.equal(stops, 0);
  emit(hiddenKeyboard);
  assert.equal(aUpdates, 1);
  assert.equal(bUpdates, 2);
  b();
  assert.equal(stops, 1);
  assert.equal(observer.getSnapshot(), hiddenKeyboard);
  const c = observer.subscribe(() => {});
  assert.equal(starts, 2);
  c();
  assert.equal(stops, 2);
});
test('responsive content cap changes with viewport without font scaling', () => {
  assert.deepEqual(contentWidthForViewport(320, 640, 16), {
    contentWidth: 288,
    compact: true,
    wide: false,
  });
  assert.deepEqual(contentWidthForViewport(1000, 640, 16), {
    contentWidth: 640,
    compact: false,
    wide: true,
  });
  assert.equal(contentWidthForViewport(0, 640, 16).contentWidth, 0);
});
