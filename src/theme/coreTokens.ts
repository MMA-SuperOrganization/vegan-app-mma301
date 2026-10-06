import type { TextStyle, ViewStyle } from 'react-native';
import { child, family, variantNode } from './componentTheme';
import { colors } from './colors';
import { radius } from './radius';
import { spacing } from './spacing';
import { sizes } from './sizes';
import { typography } from './typography';
import { controlMetrics, screenPatternTokens } from './designTokens';

const card = variantNode('Card /', 'Type=Recipe, State=Default');
const selectedCard = variantNode('Card /', 'Type=Recipe, State=Selected');
const content = child(card, 'Content');
const badge = child(content, 'Badge');
const selectedBadge = child(child(selectedCard, 'Content'), 'Badge');
const input = variantNode('Input /', 'Type=Text, State=Default');
const summary = family('Summary / Energy').master!;
const water = family('Summary / Water').master!;
const progress = child(summary, 'UI v2 / progress track');
const waterProgress = child(water, 'UI v2 / progress track');

/** Derived-master typography, with generic convenience styles explicitly proposed. */
export const textTokens = {
  ...typography,
  button: child(variantNode('Button /', 'Style=Primary, State=Default'), 'Label')
    .style,
  fieldLabel: child(input, 'Field label').style,
  input: child(child(input, 'Input surface'), 'Value').style,
  cardTitle: child(content, 'Title').style,
  cardSubtitle: child(content, 'Subtitle').style,
  badge: child(badge, 'Badge label').style,
  metric: child(child(summary, 'Metric row'), 'Value').style,
} satisfies Record<string, TextStyle>;

export const componentPresets = {
  master: {
    buttonHeight: controlMetrics.buttonHeight,
    inputHeight: controlMetrics.inputHeight,
    chipHeight: family('Chip /').variants[0].height,
  },
  // Screen examples are opt-in for future migration; never default master overrides.
  screen: {
    buttonHeight: screenPatternTokens.buttonHeight,
    inputHeight: controlMetrics.inputHeight,
    chipHeight: screenPatternTokens.chipHeight,
  },
};
export type ComponentPreset = keyof typeof componentPresets;

export const coreTokens = {
  surface: {
    tones: {
      surface: colors.background.surface,
      base: colors.background.base,
      muted: colors.background.muted,
      selected: colors.background.selected,
    },
    border: { width: card.style.borderWidth, color: colors.border.default },
    radius: radius.xl,
  },
  badge: {
    default: badge.style,
    selected: selectedBadge.style,
    label: child(badge, 'Badge label').style,
    selectedLabel: child(selectedBadge, 'Badge label').style,
    minHeight: badge.height,
    small: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs / 2 },
    // Extra legacy status tones are semantic extensions, not additional Figma variants.
    status: {
      success: colors.status.success,
      warning: colors.status.warning,
      danger: colors.status.danger,
      info: colors.status.info,
    },
  },
  thumbnail: Object.fromEntries(
    ['recipe', 'ingredient', 'nutrition', 'reminder'].map((type) => {
      const node = child(
        variantNode(
          'Card /',
          `Type=${type.charAt(0).toUpperCase() + type.slice(1)}, State=Default`
        ),
        'Thumbnail'
      );
      return [type, { node, glyph: child(node, 'Glyph') }];
    })
  ),
  icon: { defaultSize: sizes.icon.md, defaultColor: colors.primary[700] },
  back: screenPatternTokens.back,
  formField: {
    gap: input.style.gap,
    label: child(input, 'Field label').style,
    helper: typography.helper,
    helperColor: colors.text.secondary,
    errorColor: colors.status.danger,
    requiredMark: ' *',
  },
  progress: {
    track: progress.style,
    fill: child(progress, 'UI v2 / progress value').style,
    height: progress.height,
    waterTrack: waterProgress.style,
    waterFill: child(waterProgress, 'UI v2 / progress value').style,
  },
  media: {
    imageFill: { width: '100%', height: '100%' } satisfies ViewStyle,
    clipping: { overflow: 'hidden' } satisfies ViewStyle,
  },
};
