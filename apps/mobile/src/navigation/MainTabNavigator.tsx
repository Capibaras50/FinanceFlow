import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBarIcon } from '../components/ui/TabBarIcon';
import { typography, borderRadius } from '../theme';
import { useTheme } from '../hooks/useTheme';
import { showAlert } from '../components/ui/AppAlert';
import { HomeScreen } from '../screens/home/HomeScreen';
import { WalletsScreen } from '../screens/wallets/WalletsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { TransactionListScreen } from '../screens/transactions/TransactionListScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function AddButton({ onPress }: { onPress?: (...args: any[]) => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress as any} style={{ top: -16 }}>
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

export function MainTabNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const handleAddPress = (navigation: any) => {
    showAlert({
      title: 'Nuevo movimiento',
      message: '¿Qué tipo de movimiento quieres registrar?',
      buttons: [
        { text: 'Gasto', onPress: () => navigation.getParent()?.navigate('AddExpense') },
        { text: 'Ingreso', onPress: () => navigation.getParent()?.navigate('AddEarning') },
        { text: 'Cancelar', style: 'cancel' },
      ],
    });
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainer,
          borderTopColor: colors.surfaceContainer,
          borderTopWidth: 0,
          elevation: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
          paddingTop: 8,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: [typography.labelMd, { fontSize: 11, marginTop: 2 }],
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
  );
}
