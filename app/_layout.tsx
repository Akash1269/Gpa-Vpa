import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import Head from 'expo-router/head';
import { GpaProvider } from '@/context/GpaContext';
import StackNavigator from '@/components/StackNavigator';
import ErrorBoundary from '@/components/ErrorBoundary';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const router = useRouter();
  const segments = useSegments();
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    AsyncStorage.getItem('@hasSeenOnboarding').then((value) => {
      setOnboardingChecked(true);
      if (!value && (segments[0] as string) !== 'onboarding') {
        router.replace('/onboarding' as any);
      }
    });
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }  return (
    <ErrorBoundary>
      <Head>
        <meta name="description" content="Track courses, compute semester & cumulative GPA, and monitor academic standing. Free, private, no sign-up required." />
        <meta property="og:title" content="GPA Calculator — Academic Tracker" />
        <meta property="og:description" content="Track courses, compute GPA, and monitor academic standing. All data stored locally." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://akash1269.github.io/Gpa-Vpa/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="theme-color" content="#1A73E8" />
      </Head>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GpaProvider>
          <StackNavigator />
          <StatusBar style="auto" />
        </GpaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}