import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StackNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <Stack 
      screenOptions={{ 
        headerBackTitle: " ",
        // Add bottom padding to accommodate the iOS home indicator
        contentStyle: {
          paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : 0,
          backgroundColor: colors.background
        }
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="course/[id]" 
        options={{ 
          presentation: 'modal',
          headerShown: false,
          animation: 'slide_from_bottom'
        }} 
      />
      <Stack.Screen 
        name="semester/[id]" 
        options={{ 
          presentation: 'card',
          headerShown: true,
          headerTitle: "Semester Details",
          animation: 'slide_from_right',
          headerShadowVisible: false,
          headerTitleStyle: {
            fontFamily: 'Inter-SemiBold',
            fontSize: 18,
            color: colors.text
          },
          headerStyle: {
            backgroundColor: colors.card
          },
          headerTintColor: colors.primary
        }}
      />
    </Stack>
  );
}
