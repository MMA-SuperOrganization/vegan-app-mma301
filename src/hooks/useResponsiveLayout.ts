import { useWindowDimensions } from 'react-native';
import { spacing, type ComponentPreset } from '@/theme';
import { contentWidthForViewport } from './responsiveLayout';
export interface ResponsiveLayoutOptions {
  maxWidth?: number;
  gutter?: number;
  preset?: ComponentPreset;
}
/** Proposed content cap, independent of the master component's design sizes. */
export function useResponsiveLayout({
  maxWidth = 640,
  gutter = spacing.lg,
  preset = 'master',
}: ResponsiveLayoutOptions = {}) {
  const dimensions = useWindowDimensions();
  return {
    ...dimensions,
    ...contentWidthForViewport(dimensions.width, maxWidth, gutter),
    preset,
  };
}
