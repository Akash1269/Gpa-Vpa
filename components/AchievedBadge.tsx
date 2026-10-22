import { StyleSheet, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, spacing } from '@/constants/theme';

type AchievedBadgeProps = {
  label?: string;
};

// Gold pill that pops in and gives its sparkle a few twinkles, for goals that have been met
export default function AchievedBadge({ label = 'Achieved' }: AchievedBadgeProps) {
  const { colors } = useTheme();
  const twinkle = useSharedValue(1);

  useEffect(() => {
    twinkle.value = withDelay(
      400,
      withRepeat(
        withSequence(withTiming(1.35, { duration: 350 }), withTiming(1, { duration: 350 })),
        3
      )
    );
  }, [twinkle]);

  const sparkleStyle = useAnimatedStyle(() => ({ transform: [{ scale: twinkle.value }] }));

  return (
    <Animated.View
      entering={ZoomIn.springify().damping(12).delay(200)}
      style={[styles.badge, { backgroundColor: colors.accentSoft }]}
      accessibilityLabel={label}
    >
      <Animated.View style={sparkleStyle}>
        <Sparkles size={12} color={colors.accentText} strokeWidth={2.5} />
      </Animated.View>
      <Text style={[styles.text, { color: colors.accentText }]}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
  },
});
