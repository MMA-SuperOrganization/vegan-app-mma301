import { HooksPreview } from './HooksPreview';
import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import {
  AppText,
  AppIcon,
  Surface,
  Badge,
  Thumbnail,
  BackButton,
  FormField,
  ProgressBar,
  Button,
  Input,
  Chip,
  Toggle,
  type ButtonVariant,
  type ButtonState,
  type InputType,
  type InputState,
  type ChipKind,
} from '../components/ui';
import {
  assetRegistry,
  type AssetName,
  componentTokens,
  child,
  colors,
  spacing,
  typography,
  textTokens,
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
  return null;
}

export function CorePreview() {
  const [count, setCount] = useState(0);
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
        Giai đoạn 0–2 · 49 variant master · 7 SVG gốc. Primitive proposed và
        derived-master được phân loại trong DESIGN_SYSTEM.md.
      </Text>
      <React.StrictMode>
        <HooksPreview />
      </React.StrictMode>
      {componentTokens
        .filter((f) =>
          ['Button', 'Input', 'Chip', 'Control'].includes(f.name.split(' / ')[0])
        )
        .map((f) => (
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
        <Button
          title="Chữ lớn mô phỏng 160% · nội dung dài vẫn xuống dòng"
          textStyle={{
            fontSize: textTokens.button.fontSize! * 1.6,
            lineHeight: textTokens.button.lineHeight! * 1.6,
          }}
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
        <AppText testID="callback-count">Callback: {count}</AppText>
        <Button
          testID="blocked-button"
          title="Disabled"
          disabled
          onPress={() => setCount((v) => v + 1)}
        />
        <Button
          testID="loading-button"
          title="Gửi thử"
          loading={loading}
          onPress={() => {
            setCount((v) => v + 1);
            setLoading(true);
          }}
        />
        <BackButton onPress={() => setCount((v) => v + 1)} />
        <BackButton disabled onPress={() => setCount((v) => v + 1)} />
        <FormField
          label="FormField proposed"
          required
          helper="Helper do caller cung cấp"
        >
          <AppText>Không có validation nghiệp vụ.</AppText>
        </FormField>
        <Surface bordered padding="lg">
          <AppText variant="heading3">Primitive derived-master</AppText>
          <Badge label="Thực vật" selected={false} />
          <Badge label="Đã chọn" selected />
          {(['recipe', 'ingredient', 'nutrition', 'reminder'] as const).map(
            (kind) => (
              <Thumbnail key={kind} kind={kind} />
            )
          )}
        </Surface>
        <AppText variant="heading3">SVG gốc · AppIcon proposed</AppText>
        <View style={styles.grid}>
          {(Object.keys(assetRegistry) as AssetName[]).map((name) => (
            <View key={name}>
              <AppIcon name={name} accessibilityLabel={name} />
              <AppText variant="caption">{name}</AppText>
            </View>
          ))}
        </View>
        <AppText variant="heading3">ProgressBar derived-master · clamp</AppText>
        {[0, 25, 120, -10].map((value) => (
          <Surface key={value} tone="muted" padding="md">
            <AppText>{value}/100</AppText>
            <ProgressBar value={value} max={100} />
          </Surface>
        ))}
        <Surface tone="muted" padding="md">
          <AppText>max=0</AppText>
          <ProgressBar value={10} max={0} tone="water" />
        </Surface>
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
