import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, Chip, Input, Surface } from '@/components/ui';
import {
  useAppTheme,
  useResponsiveLayout,
  useKeyboardInsets,
  useFieldState,
  useSelection,
  useDisclosure,
  useDebouncedValue,
  useAsyncAction,
  AsyncActionBusyError,
  AsyncActionDiscardedError,
} from '@/hooks';

const keys = ['rau', 'đậu', 'hạt'] as const;
function KeyboardProbe() {
  const keyboard = useKeyboardInsets();
  return (
    <AppText testID="keyboard-second">
      Keyboard B: {keyboard.visible ? 'visible' : 'hidden'} / {keyboard.height} /
      overlap {keyboard.overlap} · supported={String(keyboard.supported)}
    </AppText>
  );
}
function DebounceProbe({ value, delay }: { value: string; delay: number }) {
  const debounced = useDebouncedValue(value, delay);
  return <AppText testID="debounced-value">Debounced: {debounced}</AppText>;
}
function AsyncProbe({
  action,
  scope,
  onOutcome,
}: {
  action: () => Promise<string>;
  scope: number;
  onOutcome: (message: string) => void;
}) {
  const task = useAsyncAction(action, { scopeKey: scope });
  const start = () => {
    void task
      .run()
      .then((value) => onOutcome(value))
      .catch((error) =>
        onOutcome(
          error instanceof AsyncActionBusyError
            ? 'busy: duplicate blocked'
            : error instanceof AsyncActionDiscardedError
              ? 'discarded: reset/unmount'
              : 'rejected: preview error'
        )
      );
  };
  return (
    <View>
      <Button
        testID="hook-async-run"
        title="Chạy tác vụ local"
        loading={task.pending}
        onPress={start}
      />
      <Button
        testID="hook-async-double"
        title="Hai run cùng tick"
        onPress={() => {
          start();
          start();
        }}
      />
      <Button
        testID="hook-async-reset"
        title="Reset khi pending"
        variant="secondary"
        onPress={task.reset}
      />
      <AppText testID="hook-async-state">
        Pending: {String(task.pending)} · error:{' '}
        {task.error instanceof Error ? task.error.message : 'none'}
      </AppText>
    </View>
  );
}
/** Local fixtures exercise hooks; no API, persistence, navigation or global presenter. */
export function HooksPreview() {
  const theme = useAppTheme();
  const sameTheme = useAppTheme();
  const viewport = useResponsiveLayout();
  const keyboard = useKeyboardInsets();
  const keyboardProbe = useDisclosure({ initialOpen: true });
  const field = useFieldState();
  const fieldB = useFieldState();
  const [value, setValue] = useState('');
  const [valueB, setValueB] = useState('');
  const single = useSelection<string>();
  const multi = useSelection<string>({ mode: 'multi' });
  const [controlledKeys, setControlledKeys] = useState<readonly string[]>(
    Object.freeze([])
  );
  const [changes, setChanges] = useState(0);
  const controlled = useSelection({
    mode: 'multi',
    selectedKeys: controlledKeys,
    onChange: (next) => {
      setControlledKeys(Object.freeze([...next]));
      setChanges((n) => n + 1);
    },
  });
  const panel = useDisclosure();
  const panelB = useDisclosure();
  const [open, setOpen] = useState(false);
  const controlledPanel = useDisclosure({ isOpen: open, onOpenChange: setOpen });
  const debounceProbe = useDisclosure({ initialOpen: true });
  const [delay, setDelay] = useState(300);
  const asyncProbe = useDisclosure({ initialOpen: true });
  const pending = useRef<{
    resolve: (value: string) => void;
    reject: (error: Error) => void;
  } | null>(null);
  const [scope, setScope] = useState(0);
  const [starts, setStarts] = useState(0);
  const [outcome, setOutcome] = useState('none');
  const action = () => {
    setStarts((n) => n + 1);
    return new Promise<string>((resolve, reject) => {
      pending.current = { resolve, reject };
    });
  };
  const finish = (reject: boolean) => {
    if (reject) pending.current?.reject(new Error('Preview failure'));
    else pending.current?.resolve('resolved: local task');
    pending.current = null;
  };
  return (
    <Surface bordered padding="lg" style={{ gap: theme.spacing.lg }}>
      <AppText variant="heading3">Shared hooks · sandbox</AppText>
      <AppText testID="hook-viewport">
        Viewport: {viewport.width}×{viewport.height} · content{' '}
        {viewport.contentWidth} · {viewport.compact ? 'compact' : 'wide'} · preset{' '}
        {viewport.preset}
      </AppText>
      <AppText>
        Theme chung: {String(theme === sameTheme)} · Button{' '}
        {theme.componentPresets.master.buttonHeight} · Chip{' '}
        {theme.componentPresets.master.chipHeight}
      </AppText>
      <AppText testID="keyboard-first">
        Keyboard A: {keyboard.visible ? 'visible' : 'hidden'} / {keyboard.height} /
        overlap {keyboard.overlap} · supported={String(keyboard.supported)}
      </AppText>
      {keyboardProbe.isOpen ? <KeyboardProbe /> : null}
      <Button
        title="Mount/unmount keyboard observer B"
        variant="secondary"
        onPress={keyboardProbe.toggle}
      />
      <AppText>
        Observer không cộng padding. Login giữ KeyboardAvoidingView; web Keyboard
        không cung cấp soft keyboard metrics.
      </AppText>
      <Input
        testID="hook-field-a"
        label="Hook field A / Search"
        type="search"
        value={value}
        onChangeText={setValue}
        onFocus={field.onFocus}
        onBlur={field.onBlur}
      />
      <Input
        testID="hook-field-b"
        label="Hook field B / Password"
        type="password"
        value={valueB}
        onChangeText={setValueB}
        onFocus={fieldB.onFocus}
        onBlur={fieldB.onBlur}
      />
      <AppText testID="hook-fields">
        A focused={String(field.focused)} touched={String(field.touched)}; B focused=
        {String(fieldB.focused)} touched={String(fieldB.touched)}
      </AppText>
      <Button
        title="Reset field A metadata"
        variant="secondary"
        onPress={field.reset}
      />
      <AppText>Debounce delay: {delay}ms</AppText>
      <Button
        testID="hook-delay"
        title="Đổi delay 100/500"
        variant="secondary"
        onPress={() => setDelay((v) => (v === 100 ? 500 : 100))}
      />
      {debounceProbe.isOpen ? <DebounceProbe value={value} delay={delay} /> : null}
      <Button
        testID="hook-debounce-mount"
        title="Mount/unmount debounce"
        variant="secondary"
        onPress={debounceProbe.toggle}
      />
      {(
        [
          ['Single', single],
          ['Multi', multi],
          ['Controlled', controlled],
        ] as const
      ).map(([label, selection]) => (
        <View key={label} style={{ gap: theme.spacing.sm }}>
          <AppText testID={`selection-${label}`}>
            {label}: {selection.selectedKeys.join(', ') || 'empty'}
          </AppText>
          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}
          >
            {keys.map((key) => (
              <Chip
                key={key}
                testID={`${label}-${key}`}
                label={`${label} ${key}`}
                selected={selection.isSelected(key)}
                onPress={() => selection.toggle(key)}
              />
            ))}
          </View>
          <Button
            testID={`clear-${label}`}
            title={`Clear ${label}`}
            variant="secondary"
            onPress={selection.clear}
          />
        </View>
      ))}
      <AppText testID="selection-callbacks">Controlled callbacks: {changes}</AppText>
      <AppText>
        Key bị bỏ khỏi items được giữ đến khi caller xóa key hoặc clear; không reset
        lựa chọn ngầm khi filter đổi.
      </AppText>
      <Button
        testID="disclosure-a"
        title="Toggle panel A"
        variant="secondary"
        onPress={panel.toggle}
      />
      <Button
        testID="disclosure-b"
        title="Toggle panel B"
        variant="secondary"
        onPress={panelB.toggle}
      />
      <Button
        testID="disclosure-controlled"
        title="Toggle controlled panel"
        variant="secondary"
        onPress={controlledPanel.toggle}
      />
      <AppText testID="disclosures">
        A={String(panel.isOpen)}; B={String(panelB.isOpen)}; controlled=
        {String(controlledPanel.isOpen)}
      </AppText>
      {panel.isOpen ? <AppText>Panel A · local</AppText> : null}
      {panelB.isOpen ? <AppText>Panel B · local</AppText> : null}
      {controlledPanel.isOpen ? (
        <AppText>Panel controlled · state caller</AppText>
      ) : null}
      <AppText variant="heading3">
        AsyncAction · điều khiển resolve/reject, không API
      </AppText>
      {asyncProbe.isOpen ? (
        <AsyncProbe action={action} scope={scope} onOutcome={setOutcome} />
      ) : null}
      <Button
        testID="hook-async-scope"
        title="Đổi scope/entity"
        variant="secondary"
        onPress={() => setScope((v) => v + 1)}
      />
      <Button
        testID="hook-async-resolve"
        title="Resolve tác vụ local"
        variant="secondary"
        onPress={() => finish(false)}
      />
      <Button
        testID="hook-async-reject"
        title="Reject tác vụ local"
        variant="danger"
        onPress={() => finish(true)}
      />
      <Button
        testID="hook-async-mount"
        title="Mount/unmount async consumer"
        variant="secondary"
        onPress={asyncProbe.toggle}
      />
      <AppText testID="hook-async-outcome">
        Scope: {scope} · Started: {starts} · outcome: {outcome}
      </AppText>
      <AppText>
        Reset không hủy server và giữ khóa đến khi tác vụ settle; kết quả cũ bị
        discard.
      </AppText>
    </Surface>
  );
}
