import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { AppButton, AppIcon, AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';

// Seconds spent on each step before moving on; the last step stays until the AI answers.
const STEP_SECONDS = 8;

/**
 * Shows that a long AI request is still running: an indeterminate bar,
 * the current processing step, elapsed time and a cancel action.
 *
 * Steps advance on a timer between `stepFloor` and `stepCeiling`, so callers can
 * pin the panel to a real phase (e.g. uploading) and let it move on afterwards.
 */
export function AiProgressPanel({
  title,
  steps,
  elapsedLabel,
  cancelLabel,
  onCancel,
  stepFloor = 0,
  stepCeiling,
}: {
  title: string;
  steps: string[];
  elapsedLabel: (seconds: number) => string;
  cancelLabel: string;
  onCancel: () => void;
  stepFloor?: number;
  stepCeiling?: number;
}) {
  const [seconds, setSeconds] = useState(0);
  const [floorSeconds, setFloorSeconds] = useState(0);
  const secondsRef = useRef(0);
  secondsRef.current = seconds;
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(
      () => setSeconds(Math.floor((Date.now() - startedAt) / 1000)),
      1000
    );
    return () => clearInterval(timer);
  }, []);

  // Restart the step timer whenever the caller moves to a new phase.
  useEffect(() => {
    setFloorSeconds(secondsRef.current);
  }, [stepFloor]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [sweep]);

  const lastStep = Math.min(stepCeiling ?? steps.length - 1, steps.length - 1);
  const current = Math.min(
    stepFloor + Math.floor((seconds - floorSeconds) / STEP_SECONDS),
    lastStep
  );

  return (
    <View
      style={styles.panel}
      accessibilityRole="progressbar"
      accessibilityLabel={`${title}. ${steps[current]}`}
      accessibilityLiveRegion="polite"
      aria-busy
    >
      <AppText variant="heading4">{title}</AppText>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.bar,
            {
              left: sweep.interpolate({
                inputRange: [0, 1],
                outputRange: ['-40%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <View style={styles.steps}>
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <View key={step} style={styles.step}>
              <View
                style={[
                  styles.marker,
                  done && styles.markerDone,
                  active && styles.markerActive,
                ]}
              >
                {done ? (
                  <AppIcon
                    name="check"
                    size={12}
                    color={colors.text.inverse}
                    decorative
                  />
                ) : null}
              </View>
              <AppText
                variant={active ? 'bodyStrong' : 'bodySmall'}
                color={active ? colors.primary[700] : colors.text.secondary}
                style={styles.stepText}
              >
                {step}
              </AppText>
            </View>
          );
        })}
      </View>
      <AppText variant="caption" color={colors.text.secondary}>
        {elapsedLabel(seconds)}
      </AppText>
      <AppButton title={cancelLabel} variant="outline" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.background.surface,
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: colors.background.muted,
  },
  bar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '40%',
    borderRadius: radius.full,
    backgroundColor: colors.primary[700],
  },
  steps: { gap: spacing.sm },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  marker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
  },
  markerActive: { borderColor: colors.primary[700] },
  markerDone: {
    borderColor: colors.primary[700],
    backgroundColor: colors.primary[700],
  },
  stepText: { flex: 1 },
});
