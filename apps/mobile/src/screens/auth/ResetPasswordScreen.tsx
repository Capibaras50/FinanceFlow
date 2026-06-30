import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useSnackbar } from '../../context/SnackbarContext';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { authApi } from '../../services/api';
import type { AuthNavigationProp, RootStackParamList } from '../../navigation/types';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';

const passwordRules = [
  { key: 'min', label: 'Al menos 8 caracteres', test: (p: string) => p.length >= 8 },
  { key: 'upper', label: 'Al menos una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'Mínimo 5 minúsculas', test: (p: string) => (p.match(/[a-z]/g) || []).length >= 5 },
  { key: 'number', label: 'Al menos un número', test: (p: string) => /[0-9]/.test(p) },
  { key: 'symbol', label: 'Al menos un símbolo', test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

function RequirementRow({ label, met }: { label: string; met: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={requirementStyles.row}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={met ? colors.success : colors.onSurfaceVariant}
      />
      <Text style={[typography.bodySm, { color: met ? colors.success : colors.onSurfaceVariant }]}>
        {label}
      </Text>
    </View>
  );
}

const requirementStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});

export function ResetPasswordScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'ResetPassword'>>();
  const { showSuccess, showError } = useSnackbar();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const rules = useMemo(() =>
    passwordRules.map(r => ({ ...r, met: r.test(password) })),
    [password]
  );

  const allMet = rules.every(r => r.met);

  const handleReset = async () => {
    if (!allMet) return;
    setLoading(true);
    try {
      await authApi.resetPassword(route.params.token, password);
      showSuccess('Contraseña actualizada correctamente');
      navigation.navigate('Login');
    } catch (e: any) {
      showError(e?.message || 'Error al restablecer contraseña');
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

          <View style={{ gap: 2 }}>
            {rules.map(r => (
              <RequirementRow key={r.key} label={r.label} met={r.met} />
            ))}
          </View>
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
