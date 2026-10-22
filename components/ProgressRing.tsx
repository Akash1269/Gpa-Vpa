import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { fonts, fontSizes } from '@/constants/theme';

type ProgressRingProps = {
  progress: number; // 0–1
  color: string;
  trackColor: string;
  label: string;
  size?: number;
  strokeWidth?: number;
};

export default function ProgressRing({
  progress,
  color,
  trackColor,
  label,
  size = 72,
  strokeWidth = 6,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={{ width: size, height: size }} accessibilityLabel={`${label} progress`}>
      {/* Rotate so the arc starts at 12 o'clock and fills clockwise */}
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {clamped > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - clamped)}
            strokeLinecap="round"
            fill="none"
          />
        )}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.labelContainer]}>
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
  },
});
