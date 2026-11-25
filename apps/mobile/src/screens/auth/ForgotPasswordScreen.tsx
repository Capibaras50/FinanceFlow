import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, strokeWidth, spacing, borderRadius, layout } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useSnackbar } from '../../context/SnackbarContext';
import { Input } from '../../components/ui/Input';
import { Glyph } from '../../components/ui/Glyph';
import { GradientButton } from '../../components/ui/GradientButton';
import { authApi } from '../../services/api';
import { getErrorMessage } from '../../utils/format';
import type { AuthNavigationProp } from '../../navigation/types';
import { useNavigation } from '@react-navigation/native';

export function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AuthNavigationProp>();
  const { showSuccess, showError } = useSnackbar();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      showSuccess('Correo enviado. Revisa tu bandeja de entrada.');
    } catch (e) {
      showError(getErrorMessage(e, 'Error al enviar correo'));
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          width: '100%',
          maxWidth: layout.readingMaxWidth,
          alignSelf: 'center',
          paddingTop: insets.top + spacing['2xl'],
          paddingBottom: insets.bottom + spacing['2xl'],
          paddingHorizontal: spacing.container,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[s.backButton, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outlineVariant }]}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          accessibilityHint="Regresa a la pantalla anterior"
        >
          <Ionicons name="arrow-back" size={20} color={colors.onSurface} accessible={false} />
        </TouchableOpacity>

        <View accessible={false} style={s.logoMark}>
          <Glyph
            name={sent ? 'checkmark-outline' : 'lock-open-outline'}
            tone={sent ? 'success' : 'primary'}
            size={64}
            active={sent}
          />
        </View>

        <Text accessibilityRole="header" style={[typography.headlineLg, { color: colors.onSurface }]}>
          Recuperar contraseña
        </Text>
        <Text
          style={[typography.bodyMd, { color: colors.onSurfaceVariant, marginTop: spacing.xs }]}
          accessibilityLiveRegion="polite"
        >
          {sent
            ? 'Te hemos enviado un correo con las instrucciones para restablecer tu contraseña.'
            : 'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.'}
        </Text>

        {!sent && (
          <>
            <View style={s.field}>
              <Input
                label="Correo electrónico"
                placeholder="tu@correo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <GradientButton
              title="Enviar enlace"
              onPress={handleSend}
              loading={loading}
              disabled={!email}
              style={{ marginTop: spacing.xl }}
            />
          </>
        )}

        {sent && (
          <GradientButton
            title="Volver al inicio"
            onPress={() => navigation.navigate('Login')}
            variant="outlined"
            style={{ marginTop: spacing.xl }}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  backButton: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    borderRadius: borderRadius.md,
    borderWidth: strokeWidth.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  field: {
    marginTop: spacing.xl,
  },
});
