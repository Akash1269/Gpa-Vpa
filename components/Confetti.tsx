import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const COLORS = ['#F5A623', '#FFC857', '#3B7BEA', '#5B3FD6', '#34A853', '#EA4335', '#FFFFFF'];
const PIECE_COUNT = 44;

// Deterministic pseudo-random in [0, 1) so the pieces are stable across renders
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

function Piece({ index, width, height }: { index: number; width: number; height: number }) {
  const y = useSharedValue(-30);
  const sway = useSharedValue(0);
  const spin = useSharedValue(0);

  const delay = rand(index + 1) * 700;
  const fall = 2200 + rand(index + 2) * 1600;
  const swayBy = 10 + rand(index + 3) * 22;
  const size = 7 + rand(index + 4) * 7;

  useEffect(() => {
    y.set(
      withDelay(delay, withTiming(height + 40, { duration: fall, easing: Easing.in(Easing.quad) }))
    );
    sway.set(
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(swayBy, { duration: 600 }),
            withTiming(-swayBy, { duration: 600 })
          ),
          -1,
          true
        )
      )
    );
    spin.set(
      withDelay(
        delay,
        withRepeat(
          withTiming(360, { duration: 700 + rand(index + 5) * 700, easing: Easing.linear }),
          -1
        )
      )
    );
  }, [y, sway, spin, delay, fall, swayBy, height, index]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.get() },
      { translateX: sway.get() },
      { rotate: `${spin.get()}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: rand(index + 6) * width,
          width: size,
          height: size * (rand(index + 7) > 0.5 ? 1 : 1.8),
          borderRadius: rand(index + 8) > 0.6 ? size / 2 : 2,
          backgroundColor: COLORS[index % COLORS.length],
        },
        style,
      ]}
    />
  );
}

// A one-off burst of confetti that falls across the screen. Draws nothing under reduced motion.
export default function Confetti() {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: PIECE_COUNT }, (_, i) => (
        <Piece key={i} index={i} width={width} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', top: 0 },
});
