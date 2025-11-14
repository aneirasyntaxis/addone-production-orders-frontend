// Presentation - App Navigator
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabsParamList } from './types';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { AdvancedProductsScreen } from '../screens/AdvancedProductsScreen';
import { ConsumersScreen } from '../screens/ConsumersScreen';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/Loading';
import { Text } from 'react-native';
import { theme } from '../theme/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSize.xs,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ProductionOrders"
        component={HomeScreen}
        options={{
          title: 'Órdenes de Fabricación',
          tabBarLabel: 'Ordenes',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>🏭</Text>,
        }}
      />
      <Tab.Screen
        name="AdvancedProducts"
        component={AdvancedProductsScreen}
        options={{
          title: 'Avances',
          tabBarLabel: 'Avances',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📦</Text>,
        }}
      />
      <Tab.Screen
        name="Consumers"
        component={ConsumersScreen}
        options={{
          title: 'Consumos',
          tabBarLabel: 'Consumos',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📋</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
