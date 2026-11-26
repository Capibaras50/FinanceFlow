import { useState, useCallback, useMemo, type ComponentProps } from 'react';
import { View, Text, ScrollView, Pressable, Modal, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { RootNavigationProp } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FocusFadeIn } from '../../components/ui/FocusFadeIn';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { typography, strokeWidth, spacing, borderRadius, layout, outlineColor } from '../../theme';
import { Glyph } from '../../components/ui/Glyph';
import { SkeletonLine, SkeletonMovementRows, SkeletonWalletCards } from '../../components/ui/Skeleton';
import { useTheme } from '../../hooks/useTheme';
import { useFocusReload } from '../../hooks/useFocusReload';
import { formatCurrency } from '../../utils/format';
import { walletsApi, expensesApi } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import { showAlert } from '../../components/ui/AppAlert';
import type { WalletBalance, Expense } from '@finance-flow/shared-types';

type PressableBaseProps = ComponentProps<typeof Pressable>;

interface LedgerPressableProps extends Omit<PressableBaseProps, 'style' | 'onFocus' | 'onBlur'> {
  style?: StyleProp<ViewStyle>;
  onFocus?: PressableBaseProps['onFocus'];
  onBlur?: PressableBaseProps['onBlur'];
}

/** Quiet press/focus feedback that keeps the web keyboard ring visible. */
function LedgerPressable({ style, onFocus, onBlur, ...rest }: LedgerPressableProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      {...rest}
      onFocus={(event) => { setFocused(true); onFocus?.(event); }}
      onBlur={(event) => { setFocused(false); onBlur?.(event); }}
      style={({ pressed }) => [
        style,
        pressed ? { opacity: 0.88 } : undefined,
        focused ? outlineColor(colors.primary) : undefined,
      ]}
    >
      {rest.children}
    </Pressable>
  );
}

const tabularNumbers: TextStyle['fontVariant'] = ['tabular-nums'];

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
  const [loading, setLoading] = useState(true);

  const walletAccents = useMemo(
    () => [
      colors.primary,
      colors.secondary,
      colors.success,
      colors.tertiary,
      colors.inversePrimary,
      colors.onPrimaryContainer,
    ],
    [colors]
  );

  const loadData = useCallback(async () => {
    try {
      const [balData, expData] = await Promise.all([
        walletsApi.getBalance(),
        expensesApi.getAll({ sortBy: 'createdAt', sortOrder: 'DESC', limit: 5 }),
      ]);
      setBalances(balData);
      setRecentExpenses(expData);
    } catch {
      showError('Error al cargar carteras');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useFocusReload(loadData);

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
          <View
            style={{
              width: '100%',
              maxWidth: layout.contentMaxWidth,
              alignSelf: 'center',
              paddingTop: insets.top + spacing.md,
              paddingHorizontal: spacing.container,
              gap: spacing.xl,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Glyph name="wallet" tone="primary" size={48} />
                <View>
                  <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>
                    Finance Flow
                  </Text>
                  <Text style={[typography.titleMd, { color: colors.onSurface }]}>
                    Mis Carteras
                  </Text>
                </View>
              </View>
              <LedgerPressable
                onPress={openCreate}
                accessibilityRole="button"
                accessibilityLabel="Crear nueva cartera"
                hitSlop={8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  minHeight: layout.touchTarget,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.full,
                  borderWidth: strokeWidth.medium,
                  borderColor: colors.outline,
                }}
              >
                <Ionicons name="add" size={18} color={colors.primary} />
                <Text style={[typography.labelMd, { color: colors.primary }]}>Nueva</Text>
              </LedgerPressable>
            </View>

            {loading ? (
              <View
                accessible
                accessibilityRole="text"
                accessibilityLiveRegion="polite"
                accessibilityLabel="Cargando saldo de carteras"
                style={{ gap: 0 }}
              >
                <SkeletonLine width={110} height={16} />
                <SkeletonLine width="65%" height={48} radius={borderRadius.md} style={{ marginTop: spacing.xs }} />
                <View accessible={false} style={{ height: strokeWidth.thick, backgroundColor: colors.strokeStrong, marginTop: spacing.md }} />
              </View>
            ) : (
              <View accessible accessibilityRole="text" accessibilityLabel={`Saldo total: ${formatCurrency(totalBalance)}`}>
                <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>
                  Saldo total
                </Text>
                <Text style={[typography.displayLg, { color: colors.onSurface, marginTop: spacing.xs, fontVariant: tabularNumbers }]}>
                  {formatCurrency(totalBalance)}
                </Text>
                <View style={{ height: strokeWidth.thick, backgroundColor: colors.strokeStrong, marginTop: spacing.md }} />
              </View>
            )}

            <View style={{ gap: spacing.md }}>
              <Text style={[typography.headlineSm, { color: colors.onSurface }]}>
                Tus Carteras
              </Text>
              {loading ? (
                <SkeletonWalletCards count={2} label="Cargando carteras" />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
                  {balances.map((wallet, index) => {
                  const accent = walletAccents[index % walletAccents.length];
                  return (
                    <LedgerPressable
                      key={wallet.id}
                      onPress={() => openEdit(wallet)}
                      onLongPress={() => handleDelete(wallet)}
                      accessibilityRole="button"
                      accessibilityLabel={`Cartera ${wallet.name}, saldo ${formatCurrency(wallet.balance)}`}
                      accessibilityHint="Toca para editar. Mantén presionado para eliminar."
                      style={{
                        width: 170,
                        gap: spacing.sm,
                        padding: spacing.md,
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.md,
                        borderWidth: strokeWidth.medium,
                        borderColor: colors.outlineVariant,
                      }}
                    >
                      <View
                        accessible={false}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: borderRadius.sm,
                          backgroundColor: colors.surfaceContainer,
                          borderWidth: strokeWidth.medium,
                          borderColor: colors.outlineVariant,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name="wallet" size={20} color={accent} />
                      </View>
                      <View>
                        <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>
                          {wallet.name}
                        </Text>
                        <Text style={[typography.titleLg, { color: colors.onSurface, marginTop: 2, fontVariant: tabularNumbers }]}>
                          {formatCurrency(wallet.balance)}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                        <Text style={[typography.bodySm, { color: colors.success, fontVariant: tabularNumbers }]}>
                          +{formatCurrency(wallet.totalEarnings)}
                        </Text>
                        <Text style={[typography.bodySm, { color: colors.error, fontVariant: tabularNumbers }]}>
                          -{formatCurrency(wallet.totalExpenses)}
                        </Text>
                      </View>
                    </LedgerPressable>
                  );
                  })}
                </ScrollView>
              )}
            </View>

            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
                <Text style={[typography.headlineSm, { color: colors.onSurface }]}>
                  Movimientos Recientes
                </Text>
                <LedgerPressable
                  onPress={() => navigation.navigate('MainTabs', { screen: 'Transactions' })}
                  accessibilityRole="button"
                  accessibilityLabel="Ver todas las transacciones"
                  hitSlop={8}
                >
                  <Text style={[typography.bodySm, { color: colors.primary }]}>Ver todo</Text>
                </LedgerPressable>
              </View>
              {loading ? (
                <SkeletonMovementRows rows={4} label="Cargando movimientos recientes" />
              ) : recentExpenses.length === 0 ? (
                <View
                  style={{
                    alignItems: 'center',
                    paddingVertical: spacing.lg,
                    borderRadius: borderRadius.md,
                    borderWidth: strokeWidth.medium,
                    borderColor: colors.outlineVariant,
                  }}
                >
                  <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
                    Sin movimientos recientes
                  </Text>
                </View>
              ) : (
                recentExpenses.map((expense, index) => (
                  <View
                    key={expense.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                      paddingVertical: spacing.md,
                      borderBottomWidth: index === recentExpenses.length - 1 ? 0 : strokeWidth.medium,
                      borderBottomColor: colors.outlineVariant,
                    }}
                  >
                    <View
                      accessible={false}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: borderRadius.sm,
                        backgroundColor: colors.surfaceContainer,
                        borderWidth: strokeWidth.medium,
                        borderColor: colors.outlineVariant,
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
                    <Text style={[typography.titleMd, { color: colors.error, fontVariant: tabularNumbers }]}>
                      -{formatCurrency(expense.value)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>

        <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View
              accessible={false}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: colors.background,
                opacity: 0.7,
              }}
            />
            <View
              style={{
                backgroundColor: colors.surface,
                borderTopLeftRadius: borderRadius['2xl'],
                borderTopRightRadius: borderRadius['2xl'],
                borderTopWidth: strokeWidth.medium,
                borderTopColor: colors.outlineVariant,
                padding: spacing.container,
                paddingBottom: insets.bottom + spacing.md,
              }}
            >
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginBottom: spacing.lg }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
                <Text style={[typography.titleLg, { color: colors.onSurface }]}>
                  {editWallet ? 'Editar cartera' : 'Nueva cartera'}
                </Text>
                {editWallet && (
                  <LedgerPressable
                    onPress={() => { setModalVisible(false); handleDelete(editWallet); }}
                    accessibilityRole="button"
                    accessibilityLabel={`Eliminar cartera ${editWallet.name}`}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={24} color={colors.error} />
                  </LedgerPressable>
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
