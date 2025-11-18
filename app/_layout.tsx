import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { initDatabase } from '@/utils/database';
import { requestNotificationPermissions } from '@/utils/notifications';

// Keep splash screen visible while we prepare the app
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(drawer)',
};

export default function RootLayout() {
  useEffect(() => {
    const prepareApp = async () => {
      try {
        // Initialize database
        await initDatabase();

        // Request notification permissions
        await requestNotificationPermissions();

        // Hide splash screen
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Error preparing app:', error);
        await SplashScreen.hideAsync();
      }
    };

    prepareApp();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.background.primary,
          },
        }}>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen
          name="camera"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Record Vlog',
            headerStyle: {
              backgroundColor: Colors.background.primary,
            },
            headerTintColor: Colors.text.primary,
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
});
