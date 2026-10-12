import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DefaultTheme,
  ThemeProvider,
  Slot,
  useRouter,
  useSegments,
} from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';

export {
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [colorMode] = useState<'light' | 'dark' | 'system'>('light');

  // Lógica de redirección
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    // Si no está en ningún grupo, asumimos que es el index de presentación raíz (app/index.tsx)
    const isRootIndex = !inAuthGroup && !inAppGroup;

    if (token) {
      if (isRootIndex || inAuthGroup) {
        router.replace('/(app)/home');
      }
    } else {
      if (inAppGroup) {
        router.replace('/');
      }
    }
  }, [token, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GluestackUIProvider mode={colorMode}>
          <SafeAreaProvider>
            <StatusBar style={'dark'} />
            <Slot />
          </SafeAreaProvider>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}