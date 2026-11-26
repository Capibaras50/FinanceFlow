import { lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import { View } from 'react-native';
import {
  SkeletonBlock,
  SkeletonCategoryRows,
  SkeletonCategorySummary,
  SkeletonChatBubble,
  SkeletonDebtRows,
  SkeletonDetailBody,
  SkeletonLine,
  SkeletonScreen,
  SkeletonTransactionRows,
} from '../components/ui/Skeleton';
import { borderRadius, layout, spacing, strokeWidth } from '../theme';
import { useTheme } from '../hooks/useTheme';

/**
 * Web-only route chunks. `LoginScreen`, `HomeScreen` and `MainTabNavigator`
 * stay eager so the first paint does not wait for a second request. Every other
 * screen is loaded on demand via Metro's web async imports. Each fallback
 * mirrors the shell of the route it stands in for — no universal list skeleton.
 */

function FormFallback() {
  const { colors } = useTheme();
  return (
    <SkeletonScreen
      label="Cargando pantalla"
      style={{
        width: '100%',
        maxWidth: layout.readingMaxWidth,
        alignSelf: 'center',
        paddingHorizontal: spacing.container,
        paddingTop: spacing.xl,
        gap: spacing.md,
      }}
    >
      <SkeletonLine width="58%" height={28} radius={borderRadius.md} />
      <SkeletonLine width="42%" height={14} />
      <SkeletonBlock height={56} radius={borderRadius.md} style={{ marginTop: spacing.md, borderWidth: strokeWidth.medium, borderColor: colors.outlineVariant }} />
      <SkeletonBlock height={56} radius={borderRadius.md} style={{ borderWidth: strokeWidth.medium, borderColor: colors.outlineVariant }} />
      <SkeletonBlock height={56} radius={borderRadius.md} style={{ borderWidth: strokeWidth.medium, borderColor: colors.outlineVariant }} />
      <SkeletonBlock height={layout.primaryButtonHeight} radius={borderRadius.md} style={{ marginTop: spacing.md }} />
    </SkeletonScreen>
  );
}

function ListFallback() {
  return (
    <View style={{ flex: 1 }}>
      <SkeletonTransactionRows
        rows={4}
        label="Cargando transacciones…"
        style={{
          width: '100%',
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
          paddingHorizontal: spacing.container,
          paddingTop: spacing.lg,
        }}
      />
    </View>
  );
}

function CategoryFallback() {
  return (
    <View style={{ flex: 1 }}>
      <SkeletonCategorySummary
        rows={3}
        style={{ width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center', paddingHorizontal: spacing.container, paddingTop: spacing.lg }}
      />
      <SkeletonCategoryRows rows={3} style={{ width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center', paddingHorizontal: spacing.container }} />
    </View>
  );
}

function DebtFallback() {
  return (
    <View style={{ flex: 1 }}>
      <SkeletonDebtRows
        rows={3}
        style={{
          width: '100%',
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
          paddingHorizontal: spacing.container,
          paddingTop: spacing.lg,
        }}
      />
    </View>
  );
}

function DetailFallback() {
  return (
    <View style={{ flex: 1 }}>
      <SkeletonDetailBody rows={4} actions={1} label="Cargando detalle…" />
    </View>
  );
}

function TransactionDetailFallback() {
  return (
    <View style={{ flex: 1 }}>
      <SkeletonDetailBody
        rows={5}
        actions={2}
        framed={false}
        actionsLayout="split"
        label="Cargando transacción…"
      />
    </View>
  );
}

function ChatFallback() {
  return (
    <SkeletonScreen
      label="Cargando conversación"
      style={{
        width: '100%',
        maxWidth: layout.readingMaxWidth,
        alignSelf: 'center',
        padding: spacing.container,
      }}
    >
      <SkeletonChatBubble role="user" lines={1} width="64%" />
      <SkeletonChatBubble role="assistant" lines={2} width="82%" />
      <SkeletonChatBubble role="user" lines={1} width="52%" />
    </SkeletonScreen>
  );
}

function ScannerFallback() {
  const { colors } = useTheme();
  return (
    <SkeletonScreen
      label="Cargando escáner"
      style={{
        width: '100%',
        maxWidth: layout.readingMaxWidth,
        alignSelf: 'center',
        padding: spacing.container,
        gap: spacing.md,
      }}
    >
      <SkeletonLine width="58%" height={28} radius={borderRadius.md} />
      <SkeletonBlock height={280} radius={borderRadius.lg} style={{ borderWidth: strokeWidth.medium, borderColor: colors.outlineVariant }} />
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <SkeletonBlock height={layout.primaryButtonHeight} radius={borderRadius.md} style={{ flex: 1 }} />
        <SkeletonBlock height={layout.primaryButtonHeight} radius={borderRadius.md} style={{ flex: 1 }} />
      </View>
    </SkeletonScreen>
  );
}

function withSuspense<P extends object>(
  Component: LazyExoticComponent<ComponentType<P>>,
  fallback: ReactNode = <FormFallback />
) {
  return function LoadableScreen(props: P) {
    const { colors } = useTheme();
    return (
      <Suspense
        fallback={
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            {fallback}
          </View>
        }
      >
        <Component {...props} />
      </Suspense>
    );
  };
}

export const RegisterScreen = withSuspense(
  lazy(() => import('../screens/auth/RegisterScreen').then(m => ({ default: m.RegisterScreen })))
);
export const ForgotPasswordScreen = withSuspense(
  lazy(() => import('../screens/auth/ForgotPasswordScreen').then(m => ({ default: m.ForgotPasswordScreen })))
);
export const ResetPasswordScreen = withSuspense(
  lazy(() => import('../screens/auth/ResetPasswordScreen').then(m => ({ default: m.ResetPasswordScreen })))
);
export const WalletsScreen = withSuspense(
  lazy(() => import('../screens/wallets/WalletsScreen').then(m => ({ default: m.WalletsScreen }))),
  <ListFallback />
);
export const ProfileScreen = withSuspense(
  lazy(() => import('../screens/profile/ProfileScreen').then(m => ({ default: m.ProfileScreen })))
);
export const TransactionListScreen = withSuspense(
  lazy(() => import('../screens/transactions/TransactionListScreen').then(m => ({ default: m.TransactionListScreen }))),
  <ListFallback />
);
export const AddExpenseScreen = withSuspense(
  lazy(() => import('../screens/transactions/AddExpenseScreen').then(m => ({ default: m.AddExpenseScreen })))
);
export const AddEarningScreen = withSuspense(
  lazy(() => import('../screens/transactions/AddEarningScreen').then(m => ({ default: m.AddEarningScreen })))
);
export const TransactionDetailScreen = withSuspense(
  lazy(() => import('../screens/transactions/TransactionDetailScreen').then(m => ({ default: m.TransactionDetailScreen }))),
  <TransactionDetailFallback />
);
export const ChatScreen = withSuspense(
  lazy(() => import('../screens/chat/ChatScreen').then(m => ({ default: m.ChatScreen }))),
  <ChatFallback />
);
export const ReceiptScannerScreen = withSuspense(
  lazy(() => import('../screens/scanner/ReceiptScannerScreen').then(m => ({ default: m.ReceiptScannerScreen }))),
  <ScannerFallback />
);
export const CategoriesScreen = withSuspense(
  lazy(() => import('../screens/categories/CategoriesScreen').then(m => ({ default: m.CategoriesScreen }))),
  <CategoryFallback />
);
export const DebtsScreen = withSuspense(
  lazy(() => import('../screens/debts/DebtsScreen').then(m => ({ default: m.DebtsScreen }))),
  <DebtFallback />
);
export const DebtDetailScreen = withSuspense(
  lazy(() => import('../screens/debts/DebtDetailScreen').then(m => ({ default: m.DebtDetailScreen }))),
  <DetailFallback />
);
export const AddDebtScreen = withSuspense(
  lazy(() => import('../screens/debts/AddDebtScreen').then(m => ({ default: m.AddDebtScreen })))
);
export const ContactsScreen = withSuspense(
  lazy(() => import('../screens/contacts/ContactsScreen').then(m => ({ default: m.ContactsScreen }))),
  <DebtFallback />
);
export const ContactDetailScreen = withSuspense(
  lazy(() => import('../screens/contacts/ContactDetailScreen').then(m => ({ default: m.ContactDetailScreen }))),
  <DetailFallback />
);
