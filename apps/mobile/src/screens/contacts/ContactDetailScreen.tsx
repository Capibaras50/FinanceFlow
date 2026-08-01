import { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect, type RouteProp } from '@react-navigation/native';
import { GlassCard } from '../../components/ui/GlassCard';
import { DebtCard } from '../../components/ui/DebtCard';
import { Avatar } from '../../components/ui/Avatar';
import { FocusFadeIn } from '../../components/ui/FocusFadeIn';
import { typography, spacing, borderRadius } from '../../theme';
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
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={[typography.headlineSm, { color: '#FFFFFF', flex: 1 }]}>
              {profile?.name ?? 'Contacto'}
            </Text>
          </View>
          {profile && (
            <View style={{ alignItems: 'center', marginTop: spacing.md, gap: spacing.sm }}>
              <Avatar name={profile.name} avatarUrl={profile.avatarUrl} size={72} />
              <Text style={[typography.headlineMd, { color: '#FFFFFF' }]}>{profile.name}</Text>
              <View style={{ flexDirection: 'row', gap: spacing.lg }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[typography.labelMd, { color: 'rgba(255,255,255,0.75)' }]}>Me deben</Text>
                  <Text style={[typography.titleLg, { color: '#FFFFFF' }]}>
                    {formatCurrency(receivableTotal)}
                  </Text>
                </View>
                <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.25)' }} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={[typography.labelMd, { color: 'rgba(255,255,255,0.75)' }]}>Debo</Text>
                  <Text style={[typography.titleLg, { color: '#FFFFFF' }]}>
                    {formatCurrency(payableTotal)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </LinearGradient>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: spacing['2xl'], paddingTop: spacing.lg }}
          >
            <View style={{ paddingHorizontal: spacing.container, gap: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[typography.titleLg, { color: colors.onSurface }]}>
                  Deudas con {profile?.name.split(' ')[0] ?? 'este contacto'}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AddDebt', { contactId, contactName: profile?.name })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primaryContainer, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.full }}>
                    <Ionicons name="add" size={16} color={colors.onPrimaryContainer} />
                    <Text style={[typography.labelMd, { color: colors.onPrimaryContainer }]}>Deuda</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {debts.length === 0 ? (
                <GlassCard>
                  <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
                    No hay deudas con este contacto todavía
                  </Text>
                </GlassCard>
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
            </View>
          </ScrollView>
        )}
      </View>
    </FocusFadeIn>
  );
}
