import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { SectionCard } from '../../components/SectionCard';
import { palette, radius, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

export function LoginScreen() {
  const { login, loading, isConfigured, firebaseReady } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    try {
      await login(email, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.hero}>
        <Text style={styles.kicker}>Civil Workforce Control</Text>
        <Text style={styles.title}>SiteTrack Attendance</Text>
        <Text style={styles.subtitle}>
          Live check-ins, location-backed attendance, and instant site-level visibility.
        </Text>
      </View>

      <SectionCard>
        <Text style={styles.formTitle}>Sign in</Text>
        <Text style={styles.helper}>
          Use the email account assigned to you by the company administrator.
        </Text>

        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={palette.inkSoft}
          style={styles.input}
          value={email}
        />
        <TextInput
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={palette.inkSoft}
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {!isConfigured ? (
          <Text style={styles.configWarning}>
            Firebase is not configured yet. Add the `EXPO_PUBLIC_FIREBASE_*` variables before signing in.
          </Text>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!firebaseReady ? (
          <ActivityIndicator color={palette.accent} />
        ) : (
          <PrimaryButton
            disabled={!email || !password || !isConfigured}
            label="Log In"
            loading={loading}
            onPress={handleLogin}
          />
        )}
      </SectionCard>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Phone number can still be stored on the user profile for site records.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.canvas,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  hero: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  kicker: {
    color: palette.accentDeep,
    fontFamily: typography.heading,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.ink,
    fontFamily: typography.heading,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
  },
  subtitle: {
    color: palette.inkSoft,
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 320,
  },
  formTitle: {
    color: palette.ink,
    fontFamily: typography.heading,
    fontSize: 22,
    fontWeight: '700',
  },
  helper: {
    color: palette.inkSoft,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: palette.canvasAlt,
    borderColor: palette.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: palette.ink,
    fontFamily: typography.body,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  error: {
    color: palette.signalBad,
    fontFamily: typography.body,
    fontSize: 14,
  },
  configWarning: {
    color: palette.signalWarn,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: spacing.lg,
  },
  footerText: {
    color: palette.inkSoft,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
  },
});
