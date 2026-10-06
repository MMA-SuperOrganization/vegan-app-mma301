import { useNavigation, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppText, BackButton } from '@/components';
import { colors, spacing } from '@/theme';

export function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const navigation = useNavigation();
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.back}>
          <BackButton
            onPress={() =>
              navigation.canGoBack()
                ? router.back()
                : router.replace('/(auth)/welcome')
            }
          />
        </View>
        <AppText
          variant="heading1"
          numberOfLines={1}
          style={[styles.title, title.length > 16 && styles.compactTitle]}
        >
          {title}
        </AppText>
      </View>
      {subtitle ? (
        <AppText
          variant="bodyLarge"
          color={colors.text.secondary}
          style={styles.subtitle}
        >
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing['2xl'] },
  row: { alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  back: { position: 'absolute', left: 0, zIndex: 1 },
  title: { color: colors.text.primary, textAlign: 'center' },
  compactTitle: { fontSize: 24, lineHeight: 32 },
  subtitle: { marginTop: spacing.xl, textAlign: 'left' },
});
