import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';

import { Colors, IconConfig, Typography } from '@/constants/theme';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background.primary,
        },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: {
          fontFamily: Typography.fontFamily.primary,
          fontSize: Typography.fontSize.xl,
          fontWeight: Typography.fontWeight.semibold,
        },
        drawerStyle: {
          backgroundColor: Colors.background.primary,
        },
        drawerActiveTintColor: Colors.interactive.primary,
        drawerInactiveTintColor: Colors.text.secondary,
        drawerLabelStyle: {
          fontFamily: Typography.fontFamily.primary,
          fontSize: Typography.fontSize.base,
        },
      }}>
      <Drawer.Screen
        name="index"
        options={{
          title: 'Check-In',
          drawerLabel: 'Check-In',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="happy-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="history"
        options={{
          title: 'History',
          drawerLabel: 'History',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          drawerLabel: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
