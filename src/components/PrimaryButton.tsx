import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { palette, radius, spacing, typography } from '../constants/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
}: PrimaryButtonProps) {
  const backgroundStyle = variant === 'primary' ? styles.primary : styles.secondary;
  const textStyle = variant === 'primary' ? styles.primaryText : styles.secondaryText;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        backgroundStyle,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? palette.white : palette.ink} />
      ) : (
        <Text style={[styles.text, textStyle]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: palette.accent,
  },
  secondary: {
    backgroundColor: palette.surfaceMuted,
    borderColor: palette.border,
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  text: {
    fontFamily: typography.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  primaryText: {
    color: palette.white,
  },
  secondaryText: {
    color: palette.ink,
  },
});
