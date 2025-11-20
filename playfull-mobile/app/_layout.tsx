import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

export const unstable_settings = {
  initialRouteName: 'login',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inProtectedGroup = segments[0] === '(tabs)';

    if (!user && inProtectedGroup) {
      router.replace('/login');
      return;
    }

    if (user) {
      // Mapping roles to entry routes inside tabs group
      const roleEntry: Record<string, string> = {
        admin: '/(tabs)/admin',
        docente: '/(tabs)/teacher',
        secretaria: '/(tabs)/secretary',
        estudiante: '/(tabs)/student'
      };
      const target = roleEntry[user.role] || '/(tabs)';
      // If currently outside protected group or at login, redirect to role entry
      if (!inProtectedGroup || segments[0] === 'login') {
        router.replace(target);
      }
    }
  }, [user, segments, isLoading]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
