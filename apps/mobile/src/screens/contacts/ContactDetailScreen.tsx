import { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect, type RouteProp } from '@react-navigation/native';
import { DebtCard } from '../../components/ui/DebtCard';
import { Avatar } from '../../components/ui/Avatar';
import { FocusFadeIn } from '../../components/ui/FocusFadeIn';
import { StatePanel } from '../../components/ui/StatePanel';
import { SkeletonContactDetailBody, SkeletonContactProfile } from '../../components/ui/Skeleton';
import { typography, strokeWidth, spacing, borderRadius, layout } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import { formatCurrency } from '../../utils/format';
import { getOtherProfile, getMyDirection, isDebtOutstanding } from '../../utils/debts';
import { goBackOrHome } from '../../utils/navigation';
import { contactsApi, debtsApi } from '../../services/api';
import type { RootNavigationProp, RootStackParamList } from '../../navigation/types';
import type { Contact, Debt } from '@finance-flow/shared-types';

export function ContactDetailScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'ContactDetail'>>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showError } = useSnackbar();
  const { contactId } = route.params;
  const myProfileId = user?.profile?.id ?? 0;

  const [contact, setContact] = useState<Contact | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [contactData, debtsData] = await Promise.all([
        contactsApi.getById(contactId),
        debtsApi.getAll({ limit: 100 }),
      ]);
      setContact(contactData);
      const otherProfile = getOtherProfile(contactData, myProfileId);
      const filtered = debtsData.filter(
        (d) => d.contact?.id === contactId || d.contactName === otherProfile.name
      );
      setDebts(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      showError('Error al cargar el contacto');
    } finally {
      setLoading(false);
    }
  }, [contactId, myProfileId, showError]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const { receivableTotal, payableTotal } = useMemo(() => {
    let rec = 0;
    let pay = 0;
    for (const debt of debts) {
      if (!isDebtOutstanding(debt.status)) continue;
      const direction = getMyDirection(debt, myProfileId);
      if (direction === 'receivable') rec += Number(debt.amount);
      else pay += Number(debt.amount);
    }
    return { receivableTotal: rec, payableTotal: pay };
  }, [debts, myProfileId]);

  const profile = contact ? getOtherProfile(contact, myProfileId) : null;

  return (
    <FocusFadeIn>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderBottomWidth: strokeWidth.medium,
            borderBottomColor: colors.outlineVariant,
            paddingTop: insets.top + spacing.md,
            paddingBottom: spacing.lg,
            paddingHorizontal: spacing.container,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, width: '100%', maxWidth: layout.readingMaxWidth, alignSelf: 'center' }}>
            <TouchableOpacity
              onPress={() => goBackOrHome(navigation)}
              accessibilityRole="button"
              accessibilityLabel="Volver"
              hitSlop={4}
              style={{
                width: 40,
                height: 40,
                borderRadius: borderRadius.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surfaceContainerHigh,
                borderWidth: strokeWidth.medium,
                borderColor: colors.outlineVariant,
              }}
            >
              <Ionicons accessible={false} name="arrow-back" size={20} color={colors.onSurface} />
            </TouchableOpacity>
            <Text accessibilityRole="header" numberOfLines={1} style={[typography.headlineSm, { color: colors.onSurface, flex: 1 }]}>
              {profile?.name ?? 'Contacto'}
            </Text>
          </View>
          {profile ? (
            <View style={{ width: '100%', maxWidth: layout.readingMaxWidth, alignSelf: 'center', alignItems: 'center', marginTop: spacing.md, gap: spacing.sm }}>
              <Avatar name={profile.name} avatarUrl={profile.avatarUrl} size={72} />
              <Text style={[typography.headlineMd, { color: colors.onSurface }]}>{profile.name}</Text>
              <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs }}>
                <View style={{ alignItems: 'center', gap: spacing.xs }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Ionicons accessible={false} name="arrow-down-circle" size={14} color={colors.success} />
                    <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>Me deben</Text>
                  </View>
                  <Text accessibilityLabel={`Me deben ${formatCurrency(receivableTotal)}`} style={[typography.titleLg, { color: colors.success }]}>
                    +{formatCurrency(receivableTotal)}
                  </Text>
                </View>
                <View style={{ width: strokeWidth.medium, backgroundColor: colors.outlineVariant }} />
                <View style={{ alignItems: 'center', gap: spacing.xs }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Ionicons accessible={false} name="arrow-up-circle" size={14} color={colors.error} />
                    <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>Debo</Text>
                  </View>
                  <Text accessibilityLabel={`Debo ${formatCurrency(payableTotal)}`} style={[typography.titleLg, { color: colors.error }]}>
                    −{formatCurrency(payableTotal)}
                  </Text>
                </View>
              </View>
            </View>
          ) : loading ? (
            <SkeletonContactProfile />
          ) : null}
        </View>

        {loading ? (
          <SkeletonContactDetailBody />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              width: '100%',
              maxWidth: layout.readingMaxWidth,
              alignSelf: 'center',
              paddingHorizontal: spacing.container,
              paddingBottom: spacing['2xl'],
              paddingTop: spacing.lg,
              gap: spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: layout.touchTarget }}>
              <Text accessibilityRole="header" style={[typography.titleLg, { color: colors.onSurface, flex: 1 }]}>
                Deudas con {profile?.name.split(' ')[0] ?? 'este contacto'}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddDebt', { contactId, contactName: profile?.name })}
                accessibilityRole="button"
                accessibilityLabel="Agregar deuda con este contacto"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  minHeight: layout.touchTarget - 8,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.primaryContainer,
                  borderWidth: strokeWidth.medium,
                  borderColor: colors.outline,
                }}
              >
                <Ionicons accessible={false} name="add" size={16} color={colors.primary} />
                <Text style={[typography.labelMd, { color: colors.primary }]}>Deuda</Text>
              </TouchableOpacity>
            </View>

            {debts.length === 0 ? (
              <StatePanel
                state="empty"
                title="No hay deudas con este contacto todavía"
                message="Registra una deuda para empezar."
              />
            ) : (
              debts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  myProfileId={myProfileId}
                  onPress={() => navigation.navigate('DebtDetail', { debtId: debt.id })}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
    </FocusFadeIn>
  );
}
