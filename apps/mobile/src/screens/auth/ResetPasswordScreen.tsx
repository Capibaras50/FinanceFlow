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
import { GradientButton } from '../../components/ui/GradientButton';
import { PasswordRequirements, passwordRules } from '../../components/auth/PasswordRequirements';
import { authApi } from '../../services/api';
import { getErrorMessage } from '../../utils/format';
import type { AuthNavigationProp, RootStackParamList } from '../../navigation/types';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';

export function ResetPasswordScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'ResetPassword'>>();
  const { showSuccess, showError } = useSnackbar();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const allMet = passwordRules.every(r => r.test(password));

  const handleReset = async () => {
    if (!allMet) return;
    setLoading(true);
    try {
      await authApi.resetPassword(route.params.token, password);
      showSuccess('Contraseña actualizada correctamente');
      navigation.navigate('Login');
    } catch (e) {
      showError(getErrorMessage(e, 'Error al restablecer contraseña'));
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

        <Text accessibilityRole="header" style={[typography.headlineLg, { color: colors.onSurface }]}>
          Nueva contraseña
        </Text>
        <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, marginTop: spacing.xs }]}>
          Ingresa tu nueva contraseña
        </Text>

        <View style={s.form}>
          <View>
            <Input
              label="Nueva contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={s.eyeIcon}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              accessibilityState={{ selected: showPassword }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={colors.onSurfaceVariant}
                accessible={false}
              />
            </TouchableOpacity>
          </View>

          <PasswordRequirements password={password} />
        </View>

        <GradientButton
          title="Restablecer contraseña"
          onPress={handleReset}
          loading={loading}
          disabled={!allMet}
          style={{ marginTop: spacing.xl }}
        />
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
    marginBottom: spacing.lg,
  },
  form: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  eyeIcon: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    minHeight: layout.touchTarget,
    minWidth: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
