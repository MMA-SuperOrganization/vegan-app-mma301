import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import {
  Button,
  Input,
  Card,
  Chip,
  Toggle,
  Summary,
  Illustration,
  type ButtonVariant,
  type ButtonState,
  type InputType,
  type InputState,
  type CardKind,
  type ChipKind,
  type SummaryKind,
} from '../components/ui';
import {
  componentTokens,
  child,
  colors,
  spacing,
  typography,
  useDesignFonts,
} from '../theme';
import type { DesignNode } from '../theme/designTypes';

function Sample({ prefix, node }: { prefix: string; node: DesignNode }) {
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);
  const parts = Object.fromEntries(node.name.split(', ').map((p) => p.split('=')));
  if (prefix === 'Button')
    return (
      <Button
        preview
        title={child(node, 'Label').text!}
        variant={parts.Style.toLowerCase() as ButtonVariant}
        state={parts.State.toLowerCase() as ButtonState}
        onPress={() => setChecked((v) => !v)}
        accessibilityHint={checked ? 'Đã bấm thử' : 'Bấm để thử'}
      />
    );
  if (prefix === 'Input') {
    const surface = child(node, 'Input surface');
    const sampleValue =
      parts.State === 'Filled' ? child(surface, 'Value').text! : value;
    return (
      <Input
        preview
        type={parts.Type.toLowerCase() as InputType}
        state={parts.State.toLowerCase() as InputState}
        value={sampleValue}
        onChangeText={setValue}
        onSelect={() => setValue((v) => (v ? '' : '2 người'))}
      />
    );
  }
  if (prefix === 'Card')
    return (
      <Card
        preview
        type={parts.Type.toLowerCase() as CardKind}
        state={parts.State.toLowerCase() as 'default' | 'selected'}
        onPress={() => setChecked((v) => !v)}
      />
    );
  if (prefix === 'Chip')
    return (
      <Chip
        preview
        label={child(node, 'Label').text!}
        kind={parts.Kind.toLowerCase() as ChipKind}
        state={parts.State.toLowerCase() as 'default' | 'pressed'}
        onPress={() => setChecked((v) => !v)}
      />
    );
  if (prefix === 'Control')
    return (
      <Toggle
        preview
        value={checked}
        onValueChange={setChecked}
        state={parts.State.toLowerCase() as 'off' | 'on' | 'disabled'}
      />
    );
  if (prefix === 'Summary') {
    const track = child(node, 'UI v2 / progress track');
    const row = child(node, 'Metric row');
    return (
      <Summary
        preview
        kind={node.name.split(' / ')[1].toLowerCase() as SummaryKind}
        value={child(row, 'Value').text!}
        unit={child(row, 'Unit').text}
        hint={child(node, 'Hint').text}
        progress={child(track, 'UI v2 / progress value').width / track.width}
      />
    );
  }
  return (
    <View>
      <Illustration />
      <Text style={styles.note}>
        Thiếu asset SVG Mầm; không dựng lại vector từ JSON.
      </Text>
    </View>
  );
}

export function CorePreview() {
  const [loaded, error] = useDesignFonts();
  const [text, setText] = useState('');
  const [on, setOn] = useState(false);
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  if (error) return <Text>{error.message}</Text>;
  if (!loaded) return <Text>Đang tải Montserrat…</Text>;
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>
        VEGETA v2 · UI core
      </Text>
      <Text style={styles.note}>
        13 family · 57 variant · 7 Summary · Mầm thiếu asset. Preview độc lập với
        screen nghiệp vụ.
      </Text>
      {componentTokens.map((f) => (
        <View key={f.id} style={styles.family}>
          <Text accessibilityRole="header" style={styles.heading}>
            {f.name}
          </Text>
          <View style={styles.grid}>
            {(f.variants.length ? f.variants : [f.master!]).map((n) => (
              <View key={n.id} testID={`sample-${n.id}`} style={styles.sample}>
                <Text style={styles.note}>
                  {n.name} · {n.width}×{n.height}
                </Text>
                <Sample prefix={f.name.split(' / ')[0]} node={n} />
              </View>
            ))}
          </View>
        </View>
      ))}
      <Text accessibilityRole="header" style={styles.heading}>
        Tương tác và nội dung dài
      </Text>
      <View style={styles.sandbox}>
        <Button
          title="Xác nhận nội dung rất dài để kiểm tra xuống dòng và vùng bấm"
          onPress={() => setLoading((v) => !v)}
        />
        <Button
          title="Bật loading"
          loading={loading}
          onPress={() => setLoading(true)}
        />
        <Button
          title="Dừng loading"
          variant="secondary"
          onPress={() => setLoading(false)}
        />
        <Input
          label="Focus / filled tự động"
          value={text}
          onChangeText={setText}
          placeholder="Nhập để kiểm tra"
        />
        <Input
          label="Mật khẩu"
          type="password"
          value={text}
          onChangeText={setText}
        />
        <Input
          label="Error"
          value={text}
          onChangeText={setText}
          error="Thông báo lỗi dài sẽ xuống dòng và được trình đọc màn hình thông báo."
        />
        <Input
          label="Select"
          type="select"
          value={selected ? '2 người' : ''}
          onChangeText={setText}
          onSelect={() => setSelected((v) => !v)}
        />
        <Chip
          label="Nhãn bộ lọc dài để kiểm tra khả năng co giãn"
          selected={selected}
          onPress={() => setSelected((v) => !v)}
        />
        <Toggle label="Cho phép nhắc nhở" value={on} onValueChange={setOn} />
        <Card
          type="recipe"
          title="Tên công thức rất dài để kiểm tra nhiều dòng và chiều cao linh hoạt"
          subtitle="Mô tả rất dài của công thức được truyền qua props để kiểm tra vùng nội dung."
          selected={selected}
          onPress={() => setSelected((v) => !v)}
        />
        <Summary
          kind="water"
          value="1.250"
          unit="/ 2.000 ml"
          hint="Nội dung rất dài để kiểm tra xuống dòng khi người dùng tăng kích thước chữ."
          progress={0.625}
        />
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.base },
  content: { padding: spacing.lg, gap: spacing['2xl'] },
  title: { ...typography.heading1, color: colors.text.primary },
  heading: { ...typography.heading3, color: colors.text.primary },
  note: { ...typography.caption, color: colors.text.secondary },
  family: { gap: spacing.lg },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2xl'],
    alignItems: 'flex-start',
  },
  sample: { gap: spacing.sm },
  sandbox: { maxWidth: 358, gap: spacing.lg },
});
