import { Tabs } from 'expo-router';
import { router } from 'expo-router';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  LayoutDashboard, 
  GraduationCap, 
  BarChart3, 
  Settings2,
  Plus,
  Search,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

const WEB_MAX_WIDTH = 1200;

function CustomHeader() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      backgroundColor: colors.background,
      borderBottomWidth: 0,
      paddingTop: insets.top,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        paddingHorizontal: 20,
        ...(Platform.OS === 'web' ? { maxWidth: WEB_MAX_WIDTH, alignSelf: 'center' as const, width: '100%' as unknown as number } : {}),
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: colors.primary + '15',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <GraduationCap size={18} color={colors.primary} strokeWidth={2.5} />
          </View>
          <Text style={{
            fontFamily: 'Inter-Bold',
            fontSize: 18,
            color: colors.text,
            marginLeft: 10,
          }}>
            GPA Tracker
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/course/new')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          accessibilityLabel="Add new course"
          accessibilityHint="Navigate to add a new course"
        >
          <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      backgroundColor: colors.background,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
      paddingBottom: insets.bottom,
    }}>
      <View style={{
        flexDirection: 'row',
        height: 54,
        alignItems: 'center',
        paddingHorizontal: 8,
        ...(Platform.OS === 'web' ? { maxWidth: WEB_MAX_WIDTH, alignSelf: 'center' as const, width: '100%' as unknown as number } : {}),
      }}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;
          const color = isFocused ? colors.primary : colors.textSecondary;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const icon = options.tabBarIcon?.({ focused: isFocused, color, size: 22 });

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 }}
            >
              {icon}
              <Text style={{
                fontFamily: isFocused ? 'Inter-SemiBold' : 'Inter-Medium',
                fontSize: 11,
                color,
                marginTop: 3,
              }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 11,
          marginTop: -2,
        },
        header: () => <CustomHeader />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size-2} strokeWidth={1.5} color={color} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => <GraduationCap size={size-2} strokeWidth={1.5} color={color} />,
        }}
      />
      <Tabs.Screen
        name="academic-record"
        options={{
          title: 'Semesters',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size-2} strokeWidth={1.5} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings2 size={size-2} strokeWidth={1.5} color={color} />,
        }}
      />
    </Tabs>
  );
}