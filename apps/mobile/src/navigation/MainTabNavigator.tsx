import { useRef, useState } from 'react';
import { Animated, View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import {
  createBottomTabNavigator,
  type BottomTabBarButtonProps,
  type BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NavigationState } from '@react-navigation/native';
import { TabBarIcon } from '../components/ui/TabBarIcon';
import { NavRail, type NavRailItem } from '../components/layouts/NavRail';
import { Glyph } from '../components/ui/Glyph';
import { borderRadius, layout, spacing, strokeWidth, typography } from '../theme';
import { useTheme } from '../hooks/useTheme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ProfileScreen, TransactionListScreen, WalletsScreen } from './lazyScreens';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

type RailKey = 'Home' | 'Transactions' | 'Wallets' | 'Profile';

const NAV_ITEMS: readonly NavRailItem[] = [
  { key: 'Home', label: 'Inicio', icon: 'home' },
  { key: 'Transactions', label: 'Movimientos', icon: 'swap-horizontal' },
  { key: 'Wallets', label: 'Carteras', icon: 'wallet' },
  { key: 'Profile', label: 'Perfil', icon: 'person' },
];

/** The Add control is a solid steel plate that turns a quarter-turn on press. */
function AddButton({ onPress }: BottomTabBarButtonProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const rotation = useRef(new Animated.Value(0)).current;

  const turn = (toValue: number) => {
    if (reduceMotion) {
      rotation.setValue(0);
      return;
    }
    Animated.spring(rotation, {
      toValue,
      damping: 16,
      stiffness: 260,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => turn(45)}
      onPressOut={() => turn(0)}
      accessibilityRole="button"
      accessibilityLabel="Añadir movimiento"
      accessibilityHint="Abre las opciones para registrar un gasto, ingreso o deuda"
      hitSlop={6}
      style={{ top: -14 }}
    >
      <Animated.View
        style={{
          width: 60,
          height: 60,
          borderRadius: borderRadius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primarySolid,
          borderWidth: strokeWidth.thick,
          borderColor: colors.actionBorder,
          transform: [
            {
              rotate: rotation.interpolate({
                inputRange: [0, 45],
                outputRange: ['0deg', '45deg'],
              }),
            },
          ],
        }}
      >
        <Ionicons accessible={false} name="add" size={28} color={colors.onPrimarySolid} />
      </Animated.View>
    </TouchableOpacity>
  );
}

type AddOptionColor = 'error' | 'success' | 'warning';

const ADD_OPTIONS: {
  key: 'AddExpense' | 'AddEarning' | 'AddDebt';
  icon: 'trending-down' | 'trending-up' | 'receipt';
  label: string;
  description: string;
  color: AddOptionColor;
}[] = [
  { key: 'AddExpense', icon: 'trending-down', label: 'Gasto', description: 'Registra una salida de dinero', color: 'error' },
  { key: 'AddEarning', icon: 'trending-up', label: 'Ingreso', description: 'Registra una entrada de dinero', color: 'success' },
  { key: 'AddDebt', icon: 'receipt', label: 'Deuda', description: 'Registra lo que te deben o debes', color: 'warning' },
];

export function MainTabNavigator() {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { isWide } = useResponsiveLayout();
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeKey, setActiveKey] = useState<RailKey>('Home');
  const tabRef = useRef<BottomTabNavigationProp<MainTabParamList> | null>(null);
  const addNavRef = useRef<BottomTabNavigationProp<MainTabParamList> | null>(null);

  const openAddMenu = () => {
    addNavRef.current = tabRef.current;
    setMenuVisible(true);
  };

  const handleAddPress = (navigation: BottomTabNavigationProp<MainTabParamList>) => {
    addNavRef.current = navigation;
    setMenuVisible(true);
  };

  const handleSelectOption = (key: (typeof ADD_OPTIONS)[number]['key']) => {
    setMenuVisible(false);
    addNavRef.current?.getParent()?.navigate(key as never);
  };

  const handleRailSelect = (key: string) => {
    if (key === 'Add') {
      openAddMenu();
      return;
    }
    tabRef.current?.navigate(key as RailKey);
  };

  const handleStateChange = (state: NavigationState) => {
    const routeName = state.routes[state.index]?.name;
    if (
      routeName === 'Home' ||
      routeName === 'Transactions' ||
      routeName === 'Wallets' ||
      routeName === 'Profile'
    ) {
      setActiveKey(routeName);
    }
  };

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.background }}>
      {isWide && (
        <NavRail
          items={NAV_ITEMS}
          activeKey={activeKey}
          onSelect={handleRailSelect}
          onAdd={openAddMenu}
        />
      )}

      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenListeners={({ navigation }) => {
            tabRef.current = navigation as BottomTabNavigationProp<MainTabParamList>;
            return {
              state: (event) => handleStateChange(event.data.state as NavigationState),
            };
          }}
          screenOptions={{
            headerShown: false,
            tabBarStyle: isWide
              ? { display: 'none' }
              : {
                  backgroundColor: colors.surface,
                  borderTopColor: colors.strokeStrong,
                  borderTopWidth: strokeWidth.thick,
                  elevation: 0,
                  height: layout.touchTarget + 28 + insets.bottom,
                  paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.sm,
                  paddingTop: spacing.sm,
                  shadowOpacity: 0,
                },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.onSurfaceVariant,
            tabBarLabelStyle: {
              fontFamily: typography.labelMd.fontFamily,
              fontSize: 11,
              fontWeight: '700',
              marginTop: spacing.xs,
            },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabBarIcon name="home" focused={focused} />,
              tabBarLabel: 'Inicio',
            }}
          />
          <Tab.Screen
            name="Transactions"
            component={TransactionListScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabBarIcon name="swap-horizontal" focused={focused} />,
              tabBarLabel: 'Movimientos',
            }}
          />
          <Tab.Screen
            name="Add"
            component={View}
            options={{
              tabBarButton: (props) => <AddButton {...props} />,
              tabBarLabel: () => null,
            }}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                e.preventDefault();
                handleAddPress(navigation);
              },
            })}
          />
          <Tab.Screen
            name="Wallets"
            component={WalletsScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabBarIcon name="wallet" focused={focused} />,
              tabBarLabel: 'Carteras',
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabBarIcon name="person" focused={focused} />,
              tabBarLabel: 'Perfil',
            }}
          />
        </Tab.Navigator>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType={reduceMotion ? 'none' : 'slide'}
        statusBarTranslucent
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: colors.scrim, justifyContent: 'flex-end' }}
          onPress={() => setMenuVisible(false)}
        >
          <Pressable
            accessibilityRole="menu"
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: borderRadius['2xl'],
              borderTopRightRadius: borderRadius['2xl'],
              padding: spacing.container,
              paddingBottom: insets.bottom + spacing.md,
              borderTopWidth: strokeWidth.thick,
              borderColor: colors.primary,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              accessible={false}
              style={{
                width: 48,
                height: strokeWidth.thick,
                borderRadius: strokeWidth.thick,
                backgroundColor: colors.primarySolid,
                alignSelf: 'center',
                marginBottom: spacing.lg,
              }}
            />
            <Text accessibilityRole="header" style={[typography.headlineMd, { color: colors.onSurface }]}>
              Nuevo movimiento
            </Text>
            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant, marginTop: spacing.xs, marginBottom: spacing.lg }]}>
              ¿Qué quieres registrar?
            </Text>
            <View style={{ gap: spacing.sm }}>
              {ADD_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => handleSelectOption(option.key)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityHint={option.description}
                  hitSlop={4}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    minHeight: 64,
                    padding: spacing.md,
                    borderRadius: borderRadius.md,
                    backgroundColor: colors.surfaceContainerHigh,
                    borderWidth: strokeWidth.medium,
                    borderColor: colors.stroke,
                  }}
                >
                  <Glyph
                    name={option.icon}
                    tone={option.color === 'warning' ? 'primary' : option.color}
                    size={48}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.titleLg, { color: colors.onSurface }]}>
                      {option.label}
                    </Text>
                    <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
                      {option.description}
                    </Text>
                  </View>
                  <Ionicons accessible={false} name="chevron-forward" size={20} color={colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
