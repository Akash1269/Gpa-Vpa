import { Tabs } from 'expo-router';
import { 
  LayoutDashboard, 
  GraduationCap, 
  BarChart3, 
  Settings2 
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          elevation: 0,
          shadowOpacity: 0,
          height: 58,
          paddingBottom: 8,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 11,
          marginTop: -2,
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          fontFamily: 'Inter-SemiBold',
          fontSize: 18,
          color: colors.text,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size-2} strokeWidth={1.5} color={color} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => <GraduationCap size={size-2} strokeWidth={1.5} color={color} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="academic-record"
        options={{
          title: 'Record',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size-2} strokeWidth={1.5} color={color} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings2 size={size-2} strokeWidth={1.5} color={color} />,
          headerShown: true,
        }}
      />
    </Tabs>
  );
}