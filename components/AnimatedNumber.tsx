import { useEffect, useRef, useState } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

type AnimatedNumberProps = {
  value: number;
  decimals?: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
};

// Counts from the previously shown value to `value` with an ease-out curve
export default function AnimatedNumber({
  value,
  decimals = 2,
  duration = 900,
  style,
}: AnimatedNumberProps) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);
  const shown = useRef(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) return;

    const from = shown.current;
    const start = Date.now();
    let frame: ReturnType<typeof requestAnimationFrame>;

    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      shown.current = from + (value - from) * eased;
      setDisplay(shown.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [value, duration, reduceMotion]);

  // Announce only the final value, not every intermediate frame
  return (
    <Text style={style} accessibilityLabel={value.toFixed(decimals)}>
      {(reduceMotion ? value : display).toFixed(decimals)}
    </Text>
  );
}
