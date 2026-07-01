import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

export const passwordRules = [
  { key: 'min', label: 'Al menos 8 caracteres', test: (p: string) => p.length >= 8 },
  { key: 'upper', label: 'Al menos una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'Mínimo 5 minúsculas', test: (p: string) => (p.match(/[a-z]/g) || []).length >= 5 },
  { key: 'number', label: 'Al menos un número', test: (p: string) => /[0-9]/.test(p) },
  { key: 'symbol', label: 'Al menos un símbolo', test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

function RequirementRow({ label, met }: { label: string; met: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={s.row}>
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

export function PasswordRequirements({ password }: { password: string }) {
  return (
    <View style={{ gap: 2 }}>
      {passwordRules.map(r => (
        <RequirementRow key={r.key} label={r.label} met={r.test(password)} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
