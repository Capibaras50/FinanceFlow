import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { createBottomTabNavigator, type BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBarIcon } from '../components/ui/TabBarIcon';
import { typography, borderRadius, spacing } from '../theme';
import { useTheme } from '../hooks/useTheme';
import { HomeScreen } from '../screens/home/HomeScreen';
import { WalletsScreen } from '../screens/wallets/WalletsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { TransactionListScreen } from '../screens/transactions/TransactionListScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function AddButton({ onPress }: BottomTabBarButtonProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Añadir movimiento"
      accessibilityHint="Abre las opciones para registrar un gasto, ingreso o deuda"
      style={{ top: -16 }}
    >
      <LinearGradient
        colors={colors.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.45,
          shadowRadius: 16,
          elevation: 10,
          borderWidth: 3,
          borderColor: colors.background,
        }}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

type AddOptionColor = 'error' | 'success' | 'warning';

const ADD_OPTIONS: { key: string; icon: keyof typeof Ionicons.glyphMap; label: string; description: string; color: AddOptionColor }[] = [
  { key: 'AddExpense', icon: 'trending-down', label: 'Gasto', description: 'Registra una salida de dinero', color: 'error' },
  { key: 'AddEarning', icon: 'trending-up', label: 'Ingreso', description: 'Registra una entrada de dinero', color: 'success' },
  { key: 'AddDebt', icon: 'receipt', label: 'Deuda', description: 'Registra lo que te deben o debes', color: 'warning' },
];

export function MainTabNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const addNavRef = useRef<any>(null);

  const handleAddPress = (navigation: any) => {
    addNavRef.current = navigation;
    setMenuVisible(true);
  };

  const handleSelectOption = (key: string) => {
    setMenuVisible(false);
    addNavRef.current?.getParent()?.navigate(key);
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surfaceContainer,
            borderTopColor: colors.surfaceContainer,
            borderTopWidth: 0,
            elevation: 0,
            height: 72 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
            paddingTop: 8,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.onSurfaceVariant,
          tabBarLabelStyle: {
            fontFamily: typography.labelMd.fontFamily,
            fontSize: 10,
            marginTop: 2,
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

      <Modal visible={menuVisible} transparent animationType="slide" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} onPress={() => setMenuVisible(false)}>
          <Pressable
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: borderRadius['2xl'],
              borderTopRightRadius: borderRadius['2xl'],
              padding: spacing.container,
              paddingBottom: insets.bottom + spacing.md,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginBottom: spacing.lg }} />
            <Text accessibilityRole="header" style={[typography.titleLg, { color: colors.onSurface, marginBottom: spacing.md }]}>
              Nuevo movimiento
            </Text>
            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant, marginBottom: spacing.lg }]}>
              ¿Qué quieres registrar?
            </Text>
            <View style={{ gap: spacing.sm }}>
              {ADD_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => handleSelectOption(option.key)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityHint={option.description}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    padding: spacing.md,
                    borderRadius: borderRadius.lg,
                    backgroundColor: colors.surfaceContainerHigh,
                    borderWidth: 1,
                    borderColor: colors.outlineVariant + '40',
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: colors[option.color] + '1F',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={option.icon} size={20} color={colors[option.color]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.titleMd, { color: colors.onSurface }]}>
                      {option.label}
                    </Text>
                    <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
                      {option.description}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
