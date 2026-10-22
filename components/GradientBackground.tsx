import { useId, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

type GradientBackgroundProps = {
  colors: [string, string];
};

// Diagonal two-stop gradient that fills its parent. The parent should clip it (overflow: 'hidden').
export default function GradientBackground({ colors }: GradientBackgroundProps) {
  // useId returns ':r1:'-style ids; colons break url(#id) references on web
  const id = `grad${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [size, setSize] = useState({ width: 0, height: 0 });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  // Percentage sizes are unreliable on Android inside animated parents, so draw at the measured size
  return (
    <View style={StyleSheet.absoluteFill} onLayout={handleLayout} pointerEvents="none">
      {size.width > 0 && (
        <Svg width={size.width} height={size.height}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors[0]} />
              <Stop offset="1" stopColor={colors[1]} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={size.width} height={size.height} fill={`url(#${id})`} />
        </Svg>
      )}
    </View>
  );
}
