import React from 'react';
import { StyleSheet, View } from 'react-native';

import { CustomHeader, ScreenWrapper } from '@/components/layout';
import { AppText } from '@/components/ui';
import { colors, spacing } from '@/theme';

export function PlaceholderTabScreen({ title }: { title: string }) {
  return (
    <ScreenWrapper
      edges={['top', 'left', 'right']}
      keyboardAvoiding={false}
      header={<CustomHeader title={title} showBack={false} />}
    >
      <View style={styles.content}>
        <AppText variant="bodyDefault" color={colors.text.secondary}>
          {title}
        </AppText>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
