import { useState, useEffect, useMemo, type ComponentProps } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { typography, strokeWidth, spacing, borderRadius, layout } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { DateTimePickerModal } from '../../components/ui/DateTimePickerModal';
import { contactsApi, debtsApi } from '../../services/api';
import { getErrorMessage, formatCurrencyInput, parsePositiveAmount } from '../../utils/format';
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
  const { width } = useWindowDimensions();
  const amountType = width < 380 ? typography.headlineMd : typography.displayLg;
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
    const numValue = parsePositiveAmount(amountText);
    if (numValue === null) return;

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

  const isValueValid = parsePositiveAmount(amountText) !== null;
  const canSave = name.trim() && contactName.trim() && isValueValid;
  const directionColor = direction === 'receivable' ? colors.success : colors.error;

  const iconButton = {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: strokeWidth.medium,
    borderColor: colors.outlineVariant,
  };

  const section = (icon: IoniconName, title: string, children: React.ReactNode) => (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <View
          accessible={false}
          style={{
            width: 32,
            height: 32,
            borderRadius: borderRadius.md,
            backgroundColor: colors.primaryContainer,
            borderWidth: strokeWidth.medium,
            borderColor: colors.outline,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={16} color={colors.primary} />
        </View>
        <Text accessibilityRole="header" style={[typography.titleMd, { color: colors.onSurface }]}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const DirectionButton = ({ value, label, icon }: { value: DebtDirection; label: string; icon: IoniconName }) => {
    const active = direction === value;
    const tone = value === 'receivable' ? colors.success : colors.error;
    return (
      <TouchableOpacity
        onPress={() => setDirection(value)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={label}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          minHeight: 88,
          paddingVertical: spacing.md,
          borderRadius: borderRadius.lg,
          backgroundColor: active ? colors.primaryContainer : colors.surfaceContainerHigh,
          borderWidth: strokeWidth.medium,
          borderColor: active ? colors.primary : colors.outlineVariant,
        }}
      >
        <Ionicons accessible={false} name={icon} size={22} color={active ? tone : colors.onSurfaceVariant} />
        <Text style={[typography.labelLg, { color: active ? colors.onPrimaryContainer : colors.onSurfaceVariant }]}>
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
    icon,
  }: {
    value: T;
    label: string;
    selected: boolean;
    onSelect: () => void;
    icon?: IoniconName;
  }) => (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      hitSlop={4}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        minHeight: layout.touchTarget - 6,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        backgroundColor: selected ? colors.primaryContainer : colors.surfaceContainerHigh,
        borderWidth: strokeWidth.medium,
        borderColor: selected ? colors.primary : colors.outlineVariant,
      }}
    >
      {icon && <Ionicons accessible={false} name={icon} size={15} color={colors.primary} />}
      <Text
        style={[
          typography.labelMd,
          { color: selected ? colors.onPrimaryContainer : colors.onSurfaceVariant, fontWeight: '600' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomWidth: strokeWidth.medium,
          borderBottomColor: colors.outlineVariant,
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.md,
          paddingHorizontal: spacing.container,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, width: '100%', maxWidth: layout.readingMaxWidth, alignSelf: 'center' }}>
          <TouchableOpacity
            onPress={() => goBackOrHome(navigation)}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            hitSlop={4}
            style={iconButton}
          >
            <Ionicons accessible={false} name="close" size={20} color={colors.onSurface} />
          </TouchableOpacity>
          <View accessible={false} style={iconButton}>
            <Ionicons name="receipt" size={20} color={colors.primary} />
          </View>
          <Text accessibilityRole="header" style={[typography.headlineSm, { color: colors.onSurface, flex: 1 }]}>
            {debtId ? 'Editar Deuda' : 'Nueva Deuda'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          width: '100%',
          maxWidth: layout.readingMaxWidth,
          alignSelf: 'center',
          padding: spacing.container,
          paddingBottom: spacing['2xl'] + insets.bottom,
          gap: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            alignItems: 'center',
            gap: spacing.sm,
            paddingVertical: spacing.lg,
            backgroundColor: colors.surfaceContainerHigh,
            borderRadius: borderRadius.lg,
            borderWidth: strokeWidth.medium,
            borderColor: colors.outlineVariant,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Ionicons accessible={false} name={direction === 'receivable' ? 'arrow-down-circle' : 'arrow-up-circle'} size={15} color={directionColor} />
            <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>
              {direction === 'receivable' ? 'Te deben' : 'Debes'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            <Text
              style={[
                amountType,
                { width: 28, flexShrink: 0, textAlign: 'center', color: directionColor, marginRight: spacing.xs },
              ]}
            >
              $
            </Text>
            <TextInput
              value={amountText}
              onChangeText={(text) => setAmountText(formatCurrencyInput(text))}
              placeholder="0.00"
              placeholderTextColor={colors.onSurfaceVariant}
              keyboardType="decimal-pad"
              accessibilityLabel="Monto de la deuda en pesos mexicanos"
              style={[
                amountType,
                { flex: 1, minWidth: 0, color: colors.onSurface, paddingVertical: spacing.xs, textAlign: 'center' },
              ]}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <DirectionButton value="receivable" label="Me deben" icon="arrow-down-circle" />
          <DirectionButton value="payable" label="Debo" icon="arrow-up-circle" />
        </View>

        {section(
          'people-outline',
          'Persona (contacto)',
          <>
            <Input
              placeholder="Ej: Juan Pérez"
              accessibilityLabel="Nombre del contacto"
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
          </>
        )}

        {section(
          'pricetag-outline',
          'Detalles',
          <>
            <Input
              label="Concepto"
              placeholder="Ej: Renta de julio, préstamo del carro"
              value={name}
              onChangeText={setName}
            />
            <View style={{ gap: spacing.sm }}>
              <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>
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
              <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>
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
                    icon={PRIORITY_ICONS[p]}
                  />
                ))}
              </View>
            </View>
          </>
        )}

        {section(
          'calendar-outline',
          'Plazos y condiciones',
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            accessibilityRole="button"
            accessibilityLabel={dueDate ? `Vence: ${formattedDate}` : 'Vencimiento (opcional)'}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: layout.touchTarget,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderRadius: borderRadius.md,
              backgroundColor: colors.surfaceContainerHigh,
              borderWidth: strokeWidth.medium,
              borderColor: colors.outlineVariant,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons accessible={false} name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[typography.bodyMd, { color: dueDate ? colors.onSurface : colors.onSurfaceVariant }]}>
                {dueDate ? `Vence: ${formattedDate}` : 'Vencimiento (opcional)'}
              </Text>
            </View>
            {dueDate && (
              <TouchableOpacity
                onPress={() => setDueDate(null)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Quitar vencimiento"
              >
                <Ionicons accessible={false} name="close-circle" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}

        {section(
          'document-text-outline',
          'Notas',
          <Input
            label="Descripción (opcional)"
            placeholder="Añade detalles..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        )}

        <GradientButton
          title={debtId ? 'Actualizar Deuda' : 'Guardar Deuda'}
          onPress={handleSave}
          disabled={loading || !canSave}
          loading={loading}
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
    </KeyboardAvoidingView>
  );
}
