import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, spacing } from '../../theme';
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
        contentContainerStyle={{ paddingTop: insets.top + spacing['2xl'], paddingHorizontal: spacing.container }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[s.backButton, { backgroundColor: colors.surfaceContainerHigh }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.onSurface} />
        </TouchableOpacity>

        <Text style={[typography.headlineLg, { color: colors.onSurface }]}>
          Nueva contraseña
        </Text>
        <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, marginTop: spacing.xs }]}>
          Ingresa tu nueva contraseña
        </Text>

        <View style={{ marginTop: spacing['2xl'], gap: spacing.md }}>
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
              style={{ position: 'absolute', right: 12, bottom: 14 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>

          <PasswordRequirements password={password} />
        </View>

        <GradientButton
          title="Restablecer contraseña"
          onPress={handleReset}
          disabled={loading || !allMet}
          style={{ marginTop: spacing['2xl'] }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
});
