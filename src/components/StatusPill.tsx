import { StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing, typography } from '../constants/theme';

interface StatusPillProps {
  label: string;
  tone: 'good' | 'bad' | 'warn' | 'neutral';
}

const toneStyles = {
  good: { backgroundColor: '#E2F7E7', color: palette.signalGood },
  bad: { backgroundColor: '#FCE5E5', color: palette.signalBad },
  warn: { backgroundColor: '#FFF1D6', color: palette.signalWarn },
  neutral: { backgroundColor: palette.surfaceMuted, color: palette.inkSoft },
};

export function StatusPill({ label, tone }: StatusPillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: toneStyles[tone].backgroundColor }]}>
      <Text style={[styles.label, { color: toneStyles[tone].color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  label: {
    fontFamily: typography.heading,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
