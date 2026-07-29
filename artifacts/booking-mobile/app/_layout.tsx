import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
  Barlow_700Bold,
  useFonts as useBarlowFonts,
} from '@expo-google-fonts/barlow';
import {
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
  BarlowCondensed_800ExtraBold,
  useFonts as useBarlowCondensedFonts,
} from '@expo-google-fonts/barlow-condensed';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { setBaseUrl } from '@workspace/api-client-react';

// Set API base URL — Expo bundles run outside the web proxy and need absolute URLs
setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);

// Dark brand background for splash
SystemUI.setBackgroundColorAsync('#0d0d0d');

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="book" />
      <Stack.Screen name="confirmation" />
    </Stack>
  );
}

export default function RootLayout() {
  const [barlowLoaded, barlowError] = useBarlowFonts({
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    Barlow_700Bold,
  });

  const [condensedLoaded, condensedError] = useBarlowCondensedFonts({
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
    BarlowCondensed_800ExtraBold,
  });

  const fontsLoaded = barlowLoaded && condensedLoaded;
  const fontError = barlowError || condensedError;

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
