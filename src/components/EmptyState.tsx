import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing, typography } from '../constants/theme';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 24,
    padding: spacing.xl,
  },
  title: {
    color: palette.ink,
    fontFamily: typography.heading,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: palette.inkSoft,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
