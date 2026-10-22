import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: 'light' | 'selection';
};

// Pressable that springs down on touch, with optional haptic tick on press
export default function PressableScale({
  style,
  scaleTo = 0.97,
  haptic,
  onPress,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      {...rest}
      style={[style, animatedStyle]}
      onPressIn={(e) => {
        scale.set(withSpring(scaleTo, { damping: 15, stiffness: 400 }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, { damping: 12, stiffness: 300 }));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic === 'light')
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        if (haptic === 'selection') Haptics.selectionAsync().catch(() => {});
        onPress?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
