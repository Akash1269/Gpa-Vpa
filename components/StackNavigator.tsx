import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export default function StackNavigator() {
  const { colors } = useTheme();
  
  return (
    <Stack screenOptions={{ headerBackTitle: " " }}>
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
