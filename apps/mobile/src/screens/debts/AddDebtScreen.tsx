import { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { DateTimePickerModal } from '../../components/ui/DateTimePickerModal';
import { contactsApi, debtsApi } from '../../services/api';
import { getErrorMessage, formatCurrencyInput, parseCurrencyInput } from '../../utils/format';
import { DEBT_TYPE_LABELS } from '../../utils/debts';
import { getOtherProfile } from '../../utils/debts';
import type { RootNavigationProp, RootStackParamList } from '../../navigation/types';
import type { Contact, DebtType, DebtPriority, DebtDirection } from '@finance-flow/shared-types';

const DEBT_TYPES: DebtType[] = ['personal', 'bank', 'credit_card', 'loan', 'commercial', 'fiscal', 'other'];
const PRIORITIES: DebtPriority[] = ['low', 'medium', 'high'];

const PRIORITY_LABELS: Record<DebtPriority, string> = { low: 'Baja', medium: 'Media', high: 'Alta' };

export function AddDebtScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddDebt'>>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showError, showSuccess } = useSnackbar();
  const myProfileId = user?.profile?.id ?? 0;

  const initialContactId = route.params?.contactId;
  const initialContactName = route.params?.contactName;

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactId, setContactId] = useState<number | undefined>(initialContactId);
  const [contactName, setContactName] = useState(initialContactName ?? '');
  const [name, setName] = useState('');
  const [amountText, setAmountText] = useState('');
  const [direction, setDirection] = useState<DebtDirection>('receivable');
  const [debtType, setDebtType] = useState<DebtType>('personal');
  const [priority, setPriority] = useState<DebtPriority>('medium');
  const [interestText, setInterestText] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    contactsApi.getAll().then(setContacts).catch(() => {});
  }, []);

  const selectContact = (c: Contact) => {
    const profile = getOtherProfile(c, myProfileId);
    setContactId(c.id);
    setContactName(profile.name);
  };

  const formattedDate = useMemo(() => {
    if (!dueDate) return null;
    return dueDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  }, [dueDate]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedContact = contactName.trim();
    if (!trimmedName || !trimmedContact) return;
    const numValue = parseFloat(parseCurrencyInput(amountText));
    if (isNaN(numValue) || numValue <= 0) return;

    const interest = parseFloat(parseCurrencyInput(interestText));
    const interestRate = !isNaN(interest) && interest >= 0 ? interest : undefined;

    setLoading(true);
    try {
      await debtsApi.create({
        name: trimmedName,
        description: description.trim() || undefined,
        contactName: trimmedContact,
        contactId,
        amount: numValue,
        direction,
        debtType,
        priority,
        interestRate,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
      });
      showSuccess('Deuda registrada');
      navigation.goBack();
    } catch (e) {
      showError(getErrorMessage(e, 'Error al registrar la deuda'));
    } finally {
      setLoading(false);
    }
  };

  const numValue = parseFloat(parseCurrencyInput(amountText));
  const isValueValid = !isNaN(numValue) && numValue > 0;
  const canSave = name.trim() && contactName.trim() && isValueValid;

  const DirectionButton = ({ value, label, icon }: { value: DebtDirection; label: string; icon: 'arrow-down-circle' | 'arrow-up-circle' }) => {
    const active = direction === value;
    const color = value === 'receivable' ? colors.success : colors.error;
    return (
      <TouchableOpacity
        onPress={() => setDirection(value)}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.xs,
          paddingVertical: spacing.md,
          borderRadius: borderRadius.lg,
          backgroundColor: active ? color + '1F' : colors.surfaceContainerHigh,
          borderWidth: 1,
          borderColor: active ? color : colors.outlineVariant,
        }}
      >
        <Ionicons name={icon} size={18} color={active ? color : colors.onSurfaceVariant} />
        <Text style={[typography.labelLg, { color: active ? color : colors.onSurfaceVariant }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const Chip = <T extends string>({ value, label, selected, onSelect, color }: { value: T; label: string; selected: boolean; onSelect: () => void; color?: string }) => (
    <TouchableOpacity
      onPress={onSelect}
      style={{
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        backgroundColor: selected ? (color ?? colors.primary) : colors.surfaceContainerHigh,
      }}
    >
      <Text
        style={[
          typography.labelMd,
          { color: selected ? '#FFFFFF' : colors.onSurfaceVariant },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={colors.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.lg, paddingHorizontal: spacing.container }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="receipt" size={20} color="#FFFFFF" />
          </View>
          <Text style={[typography.headlineSm, { color: '#FFFFFF', flex: 1 }]}>
            Nueva Deuda
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: spacing.container }}
        contentContainerStyle={{ paddingBottom: spacing['2xl'], gap: spacing.md, paddingTop: spacing.lg }}
      >
        <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
          <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginBottom: spacing.sm }]}>
            Monto de la deuda
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceContainerHigh,
            borderRadius: borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.outlineVariant,
            paddingHorizontal: spacing.md,
          }}>
            <Text style={[typography.displayMd, { color: colors.primary, marginRight: spacing.xs }]}>$</Text>
            <TextInput
              value={amountText}
              onChangeText={(text) => setAmountText(formatCurrencyInput(text))}
              placeholder="0.00"
              placeholderTextColor={colors.onSurfaceVariant}
              keyboardType="decimal-pad"
              style={[
                typography.bodyLg,
                { flex: 1, color: colors.onSurface, paddingVertical: spacing.md, textAlign: 'center' },
              ]}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <DirectionButton value="receivable" label="Me deben" icon="arrow-down-circle" />
          <DirectionButton value="payable" label="Debo" icon="arrow-up-circle" />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginLeft: 4 }]}>
            Persona (contacto)
          </Text>
          <Input
            placeholder="Ej: Juan Pérez"
            value={contactName}
            onChangeText={setContactName}
          />
          {contacts.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
              {contacts.map((c) => {
                const profile = getOtherProfile(c, myProfileId);
                return (
                  <Chip
                    key={c.id}
                    value={profile.name}
                    label={profile.name}
                    selected={contactId === c.id}
                    onSelect={() => selectContact(c)}
                  />
                );
              })}
            </ScrollView>
          )}
        </View>

        <Input
          label="Concepto"
          placeholder="Ej: Renta de julio, préstamo del carro"
          value={name}
          onChangeText={setName}
        />

        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginLeft: 4 }]}>
            Tipo de deuda
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {DEBT_TYPES.map((t) => (
              <Chip
                key={t}
                value={t}
                label={DEBT_TYPE_LABELS[t]}
                selected={debtType === t}
                onSelect={() => setDebtType(t)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginLeft: 4 }]}>
            Prioridad
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {PRIORITIES.map((p) => (
              <Chip
                key={p}
                value={p}
                label={PRIORITY_LABELS[p]}
                selected={priority === p}
                onSelect={() => setPriority(p)}
                color={p === 'high' ? colors.error : p === 'low' ? colors.success : colors.primary}
              />
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.lg,
            backgroundColor: colors.surfaceContainerHigh,
            borderWidth: 1,
            borderColor: colors.outlineVariant,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={[typography.bodyMd, { color: dueDate ? colors.onSurface : colors.onSurfaceVariant }]}>
              {dueDate ? `Vence: ${formattedDate}` : 'Vencimiento (opcional)'}
            </Text>
          </View>
          {dueDate && (
            <TouchableOpacity onPress={() => setDueDate(null)} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <DateTimePickerModal
          visible={showDatePicker}
          value={dueDate ?? new Date()}
          mode="date"
          onClose={() => setShowDatePicker(false)}
          onConfirm={(date) => {
            setDueDate(date);
            setShowDatePicker(false);
          }}
        />

        <Input
          label="Interés mensual (opcional)"
          placeholder="Ej: 5"
          prefix="%"
          value={interestText}
          onChangeText={(text) => setInterestText(formatCurrencyInput(text))}
          keyboardType="decimal-pad"
        />

        <Input
          label="Descripción (opcional)"
          placeholder="Añade detalles..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <GradientButton
          title="Guardar Deuda"
          onPress={handleSave}
          disabled={loading || !canSave}
        />
      </ScrollView>
    </View>
  );
}
