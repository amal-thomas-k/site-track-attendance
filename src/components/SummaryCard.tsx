import { StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing, typography } from '../constants/theme';

interface SummaryCardProps {
  label: string;
  value: string;
  accent: string;
}

export function SummaryCard({ label, value, accent }: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.bar, { backgroundColor: accent }]} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 120,
    overflow: 'hidden',
    padding: spacing.md,
  },
  bar: {
    borderRadius: radius.pill,
    height: 6,
    marginBottom: spacing.md,
    width: 48,
  },
  value: {
    color: palette.ink,
    fontFamily: typography.heading,
    fontSize: 28,
    fontWeight: '700',
  },
  label: {
    color: palette.inkSoft,
    fontFamily: typography.body,
    fontSize: 14,
    marginTop: 4,
  },
});
