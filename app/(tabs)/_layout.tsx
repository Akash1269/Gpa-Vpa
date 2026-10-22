import { Tabs, router } from 'expo-router';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  House,
  BookOpen,
  Layers,
  Crosshair,
  Plus,
  Settings2,
  GraduationCap,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, spacing } from '@/constants/theme';
import { TAB_BAR_HEIGHT, useTabBarOffset } from '@/hooks/useTabBarClearance';

const WEB_MAX_WIDTH = 1200;

function CustomHeader() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderBottomWidth: 0,
        paddingTop: insets.top,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
          paddingHorizontal: 20,
          ...(Platform.OS === 'web'
            ? {
                maxWidth: WEB_MAX_WIDTH,
                alignSelf: 'center' as const,
                width: '100%' as unknown as number,
              }
            : {}),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: colors.primary + '15',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <GraduationCap size={18} color={colors.primary} strokeWidth={2.5} />
          </View>
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: fontSizes.xl,
              color: colors.text,
              marginLeft: spacing.md - 2,
            }}
          >
            GPA-VPA
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: colors.card,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
            accessibilityLabel="Settings"
            accessibilityHint="Navigate to settings"
          >
            <Settings2 size={18} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
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
            <Plus size={18} color={colors.onPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors, isDark } = useTheme();
  const bottomSpacing = useTabBarOffset();

  return (
    <View
      style={{
        position: 'absolute',
        bottom: bottomSpacing,
        left: 36,
        right: 36,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.3 : 0.12,
        shadowRadius: 16,
        elevation: 8,
        ...(Platform.OS === 'web'
          ? ({
              maxWidth: 400,
              marginLeft: 'auto' as unknown as number,
              marginRight: 'auto' as unknown as number,
              left: 0,
              right: 0,
              backdropFilter: 'blur(4px) saturate(200%)',
              WebkitBackdropFilter: 'blur(4px) saturate(200%)',
              boxShadow: isDark
                ? '0 0px 24px rgba(0,0,0,0.2)'
                : '0 0px 24px rgba(164, 164, 164, 0.1)',
              overflow: 'hidden',
              backgroundColor: isDark ? 'rgba(28,28,30,0.4)' : 'rgba(255,255,255,0.4)',
            } as any)
          : {
              // No backdrop blur on native, so a translucent bar lets content show through
              // and Android renders the elevation shadow through it. Keep it opaque.
              backgroundColor: colors.card,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
            }),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          height: TAB_BAR_HEIGHT,
          alignItems: 'center',
          paddingHorizontal: 12,
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;
          const color = isFocused ? colors.primary : colors.textSecondary;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
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
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: isFocused ? colors.primary + '15' : 'transparent',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {icon}
              </View>
              <Text
                style={{
                  fontFamily: isFocused ? fonts.semiBold : fonts.medium,
                  fontSize: 10,
                  color,
                  marginTop: 3,
                }}
              >
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
          fontFamily: fonts.medium,
          fontSize: fontSizes.xs,
          marginTop: -2,
        },
        header: () => <CustomHeader />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <House
              size={size - 2}
              strokeWidth={isFocusedStroke(color, colors.primary)}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => (
            <BookOpen
              size={size - 2}
              strokeWidth={isFocusedStroke(color, colors.primary)}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="academic-record"
        options={{
          title: 'Semesters',
          tabBarIcon: ({ color, size }) => (
            <Layers
              size={size - 2}
              strokeWidth={isFocusedStroke(color, colors.primary)}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color, size }) => (
            <Crosshair
              size={size - 2}
              strokeWidth={isFocusedStroke(color, colors.primary)}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

function isFocusedStroke(color: any, primary: string) {
  return color === primary ? 2 : 1.5;
}
