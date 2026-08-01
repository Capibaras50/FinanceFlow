import { useState, useEffect, useMemo, type ComponentProps } from 'react';
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
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { DateTimePickerModal } from '../../components/ui/DateTimePickerModal';
import { contactsApi, debtsApi } from '../../services/api';
import { getErrorMessage, formatCurrencyInput, parseCurrencyInput } from '../../utils/format';
import { DEBT_TYPE_LABELS } from '../../utils/debts';
import { getOtherProfile } from '../../utils/debts';
import { goBackOrHome } from '../../utils/navigation';
import type { RootNavigationProp, RootStackParamList } from '../../navigation/types';
import type { Contact, DebtType, DebtPriority, DebtDirection } from '@finance-flow/shared-types';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const DEBT_TYPES: DebtType[] = ['personal', 'bank', 'credit_card', 'loan', 'commercial', 'fiscal', 'other'];
const PRIORITIES: DebtPriority[] = ['low', 'medium', 'high'];

const PRIORITY_LABELS: Record<DebtPriority, string> = { low: 'Baja', medium: 'Media', high: 'Alta' };

const DEBT_TYPE_ICONS: Record<DebtType, IoniconName> = {
  personal: 'person-outline',
  bank: 'business-outline',
  credit_card: 'card-outline',
  loan: 'swap-horizontal-outline',
  commercial: 'storefront-outline',
  fiscal: 'receipt-outline',
  other: 'ellipsis-horizontal-outline',
};

const PRIORITY_ICONS: Record<DebtPriority, IoniconName> = {
  low: 'arrow-down-circle-outline',
  medium: 'remove-circle-outline',
  high: 'arrow-up-circle-outline',
};

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
  const debtId = route.params?.debtId;

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

  useEffect(() => {
    if (!debtId) return;
    debtsApi
      .getById(debtId)
      .then((debt) => {
        setName(debt.name);
        setDescription(debt.description ?? '');
        setContactName(debt.contactName);
        setContactId(debt.contact?.id ?? undefined);
        setAmountText(formatCurrencyInput(String(debt.amount)));
        setDirection(debt.direction);
        setDebtType(debt.debtType);
        setPriority(debt.priority);
        if (debt.interestRate != null) {
          setInterestText(formatCurrencyInput(String(Math.round(debt.interestRate * 10000) / 100)));
        }
        if (debt.dueDate) setDueDate(new Date(debt.dueDate));
      })
      .catch(() => {});
  }, [debtId]);

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
      const dto = {
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
      };
      if (debtId) {
        await debtsApi.update(debtId, dto);
        showSuccess('Deuda actualizada');
      } else {
        await debtsApi.create(dto);
        showSuccess('Deuda registrada');
      }
      goBackOrHome(navigation);
    } catch (e) {
      showError(getErrorMessage(e, 'Error al registrar la deuda'));
    } finally {
      setLoading(false);
    }
  };

  const numValue = parseFloat(parseCurrencyInput(amountText));
  const isValueValid = !isNaN(numValue) && numValue > 0;
  const canSave = name.trim() && contactName.trim() && isValueValid;
  const directionColor = direction === 'receivable' ? colors.success : colors.error;

  const SectionHeader = ({ icon, title, color }: { icon: IoniconName; title: string; color?: string }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: (color ?? colors.primary) + '1F',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={16} color={color ?? colors.primary} />
      </View>
      <Text style={[typography.titleMd, { color: colors.onSurface }]}>{title}</Text>
    </View>
  );

  const DirectionButton = ({ value, label, icon }: { value: DebtDirection; label: string; icon: IoniconName }) => {
    const active = direction === value;
    const color = value === 'receivable' ? colors.success : colors.error;
    return (
      <TouchableOpacity
        onPress={() => setDirection(value)}
        activeOpacity={0.8}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          paddingVertical: spacing.md,
          borderRadius: borderRadius.lg,
          backgroundColor: active ? color + '1F' : colors.surfaceContainerHigh,
          borderWidth: 1.5,
          borderColor: active ? color : colors.outlineVariant,
        }}
      >
        <Ionicons name={icon} size={22} color={active ? color : colors.onSurfaceVariant} />
        <Text style={[typography.labelLg, { color: active ? color : colors.onSurfaceVariant }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const Chip = <T extends string>({
    value,
    label,
    selected,
    onSelect,
    color,
    icon,
  }: {
    value: T;
    label: string;
    selected: boolean;
    onSelect: () => void;
    color?: string;
    icon?: IoniconName;
  }) => {
    const accent = color ?? colors.primary;
    return (
      <TouchableOpacity
        onPress={onSelect}
        activeOpacity={0.8}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          paddingVertical: spacing.sm + 2,
          paddingHorizontal: spacing.md,
          borderRadius: borderRadius.full,
          backgroundColor: selected ? accent + '1F' : colors.surfaceContainerHigh,
          borderWidth: 1,
          borderColor: selected ? accent : colors.outlineVariant,
        }}
      >
        {icon && <Ionicons name={icon} size={14} color={selected ? accent : colors.onSurfaceVariant} />}
        <Text
          style={[
            typography.labelMd,
            { color: selected ? accent : colors.onSurfaceVariant, fontWeight: '600' },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

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
            onPress={() => goBackOrHome(navigation)}
            style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="receipt" size={20} color="#FFFFFF" />
          </View>
          <Text style={[typography.headlineSm, { color: '#FFFFFF', flex: 1 }]}>
            {debtId ? 'Editar Deuda' : 'Nueva Deuda'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.container, paddingBottom: spacing['2xl'], gap: spacing.lg }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <GlassCard glowColor={directionColor} style={{ alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm }}>
          <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>
            Monto de la deuda
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[typography.displayLg, { color: directionColor, marginRight: spacing.xs }]}>$</Text>
            <TextInput
              value={amountText}
              onChangeText={(text) => setAmountText(formatCurrencyInput(text))}
              placeholder="0.00"
              placeholderTextColor={colors.onSurfaceVariant}
              keyboardType="decimal-pad"
              style={[
                typography.displayLg,
                { flex: 1, color: colors.onSurface, paddingVertical: spacing.xs, textAlign: 'center' },
              ]}
            />
          </View>
        </GlassCard>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <DirectionButton value="receivable" label="Me deben" icon="arrow-down-circle" />
          <DirectionButton value="payable" label="Debo" icon="arrow-up-circle" />
        </View>

        <GlassCard style={{ gap: spacing.md }}>
          <SectionHeader icon="people-outline" title="Persona (contacto)" />
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
                    icon="person-circle-outline"
                  />
                );
              })}
            </ScrollView>
          )}
        </GlassCard>

        <GlassCard style={{ gap: spacing.md }}>
          <SectionHeader icon="pricetag-outline" title="Detalles" />
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
                  icon={DEBT_TYPE_ICONS[t]}
                />
              ))}
            </ScrollView>
          </View>
          <View style={{ gap: spacing.sm }}>
            <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginLeft: 4 }]}>
              Prioridad
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {PRIORITIES.map((p) => (
                <Chip
                  key={p}
                  value={p}
                  label={PRIORITY_LABELS[p]}
                  selected={priority === p}
                  onSelect={() => setPriority(p)}
                  color={p === 'high' ? colors.error : p === 'low' ? colors.success : colors.warning}
                  icon={PRIORITY_ICONS[p]}
                />
              ))}
            </View>
          </View>
        </GlassCard>

        <GlassCard style={{ gap: spacing.md }}>
          <SectionHeader icon="calendar-outline" title="Plazos y condiciones" />
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
          <Input
            label="Interés mensual (opcional)"
            placeholder="Ej: 5"
            prefix="%"
            value={interestText}
            onChangeText={(text) => setInterestText(formatCurrencyInput(text))}
            keyboardType="decimal-pad"
          />
        </GlassCard>

        <GlassCard style={{ gap: spacing.md }}>
          <SectionHeader icon="document-text-outline" title="Notas" />
          <Input
            label="Descripción (opcional)"
            placeholder="Añade detalles..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </GlassCard>

        <GradientButton
          title={debtId ? 'Actualizar Deuda' : 'Guardar Deuda'}
          onPress={handleSave}
          disabled={loading || !canSave}
        />
      </ScrollView>

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
    </View>
  );
}
