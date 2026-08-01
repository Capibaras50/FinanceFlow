import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootNavigationProp } from '../../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/ui/GlassCard';
import { FocusFadeIn } from '../../components/ui/FocusFadeIn';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/format';
import { useFocusEffect } from '@react-navigation/native';
import { walletsApi, expensesApi } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import { showAlert } from '../../components/ui/AppAlert';
import type { WalletBalance, Expense } from '@finance-flow/shared-types';

const walletColors = ['#7C3AED', '#EC4899', '#06B6D4', '#4ADE80', '#F59E0B', '#8B5CF6'];

export function WalletsScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showError } = useSnackbar();
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editWallet, setEditWallet] = useState<WalletBalance | null>(null);
  const [walletName, setWalletName] = useState('');

  useFocusEffect(
    useCallback(() => { loadData(); }, [])
  );

  const loadData = async () => {
    try {
      const [balData, expData] = await Promise.all([
        walletsApi.getBalance(),
        expensesApi.getAll({ sortBy: 'createdAt', sortOrder: 'DESC', limit: 5 }),
      ]);
      setBalances(balData);
      setRecentExpenses(expData);
    } catch {
      showError('Error al cargar carteras');
    }
  };

  const openCreate = () => {
    setEditWallet(null);
    setWalletName('');
    setModalVisible(true);
  };

  const openEdit = (w: WalletBalance) => {
    setEditWallet(w);
    setWalletName(w.name);
    setModalVisible(true);
  };

  const handleDelete = (w: WalletBalance) => {
    const hasTransactions = Number(w.totalExpenses) > 0 || Number(w.totalEarnings) > 0;
    if (hasTransactions) {
      showAlert({
        title: 'Eliminar cartera',
        message: `Si borras "${w.name}", también se eliminarán todos los ingresos y gastos asociados a esta cartera.`,
        buttons: [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar todo',
            style: 'destructive',
            onPress: async () => {
              try {
                await walletsApi.delete(w.id);
                loadData();
              } catch {
                showError('Error al eliminar cartera');
              }
            },
          },
        ],
      });
    } else {
      showAlert({
        title: 'Eliminar cartera',
        message: `¿Eliminar "${w.name}"?`,
        buttons: [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                await walletsApi.delete(w.id);
                loadData();
              } catch {
                showError('Error al eliminar cartera');
              }
            },
          },
        ],
      });
    }
  };

  const handleSave = async () => {
    if (!walletName.trim()) return;
    try {
      if (editWallet) {
        await walletsApi.update(editWallet.id, { name: walletName });
      } else {
        await walletsApi.create({ name: walletName });
      }
      setModalVisible(false);
      loadData();
    } catch {
      showError('Error al guardar cartera');
    }
  };

  const totalBalance = balances.reduce((sum, w) => sum + Number(w.balance), 0);

  return (
    <FocusFadeIn>
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
      >
        <View style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.container, gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <LinearGradient
                colors={colors.gradient.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="wallet" size={22} color="#FFFFFF" />
              </LinearGradient>
              <View>
                <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>
                  Finance Flow
                </Text>
                <Text style={[typography.titleMd, { color: colors.onSurface }]}>
                  Mis Carteras
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={openCreate}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primaryContainer, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.full }}>
                <Ionicons name="add" size={18} color={colors.onPrimaryContainer} />
                <Text style={[typography.labelMd, { color: colors.onPrimaryContainer }]}>Nueva</Text>
              </View>
            </TouchableOpacity>
          </View>

          <GlassCard glowColor={colors.primary}>
            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
              Saldo Total
            </Text>
            <Text style={[typography.displayMd, { color: colors.onSurface, marginTop: spacing.xs }]}>
              {formatCurrency(totalBalance)}
            </Text>
          </GlassCard>

          <View>
            <Text style={[typography.titleLg, { color: colors.onSurface, marginBottom: spacing.md }]}>
              Tus Carteras
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
              {balances.map((wallet, index) => {
                const color = walletColors[index % walletColors.length];
                return (
                  <TouchableOpacity key={wallet.id} onPress={() => openEdit(wallet)} onLongPress={() => handleDelete(wallet)}>
                    <GlassCard
                      glowColor={color}
                      style={{ width: 170, gap: spacing.sm }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 14,
                          backgroundColor: `${color}20`,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name="wallet" size={20} color={color} />
                      </View>
                      <View>
                        <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>
                          {wallet.name}
                        </Text>
                        <Text style={[typography.titleLg, { color: colors.onSurface, marginTop: 2 }]}>
                          {formatCurrency(wallet.balance)}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                        <Text style={[typography.bodySm, { color: colors.success }]}>
                          +{formatCurrency(wallet.totalEarnings)}
                        </Text>
                        <Text style={[typography.bodySm, { color: colors.error }]}>
                          -{formatCurrency(wallet.totalExpenses)}
                        </Text>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={[typography.titleLg, { color: colors.onSurface }]}>
                Movimientos Recientes
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Transactions' })}>
                <Text style={[typography.bodySm, { color: colors.primary }]}>Ver todo</Text>
              </TouchableOpacity>
            </View>
            {recentExpenses.length === 0 ? (
              <GlassCard>
                <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
                  Sin movimientos recientes
                </Text>
              </GlassCard>
            ) : (
              recentExpenses.map((expense) => (
                <GlassCard key={expense.id} style={{ marginBottom: spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: colors.error + '15',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="trending-down" size={20} color={colors.error} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.titleMd, { color: colors.onSurface }]}>
                        {expense.name}
                      </Text>
                      <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
                        {expense.wallet?.name}
                      </Text>
                    </View>
                    <Text style={[typography.titleMd, { color: colors.error }]}>
                      -{formatCurrency(expense.value)}
                    </Text>
                  </View>
                </GlassCard>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: borderRadius['2xl'], borderTopRightRadius: borderRadius['2xl'], padding: spacing.container, paddingBottom: insets.bottom + spacing.md }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginBottom: spacing.lg }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
              <Text style={[typography.titleLg, { color: colors.onSurface }]}>
                {editWallet ? 'Editar cartera' : 'Nueva cartera'}
              </Text>
              {editWallet && (
                <TouchableOpacity onPress={() => { setModalVisible(false); handleDelete(editWallet); }}>
                  <Ionicons name="trash-outline" size={24} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
            <Input label="Nombre" placeholder="Ej: Efectivo, Bancolombia" value={walletName} onChangeText={setWalletName} />
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
              <GradientButton title="Cancelar" variant="outlined" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
              <GradientButton title="Guardar" onPress={handleSave} style={{ flex: 1 }} disabled={!walletName.trim()} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
    </FocusFadeIn>
  );
}
