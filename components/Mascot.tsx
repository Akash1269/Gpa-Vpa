import { useEffect, useId, useState } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

export type MascotMood = 'happy' | 'sleepy' | 'cheer';

type MascotProps = {
  mood?: MascotMood;
  size?: number;
  animated?: boolean;
};

const INK = '#1B1F3B';
const GOLD = '#F5A623';

// Vee, the owl in a graduation cap. Drawn on a 120x120 grid.
export default function Mascot({ mood = 'happy', size = 120, animated = true }: MascotProps) {
  const { colors, isDark } = useTheme();
  const reduceMotion = useReducedMotion();
  const gradientId = `vee${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [blink, setBlink] = useState(false);
  const bob = useSharedValue(0);
  const live = animated && !reduceMotion;

  useEffect(() => {
    if (!live) return;
    bob.set(
      withRepeat(
        withSequence(
          withTiming(-3, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) })
        ),
        -1
      )
    );
  }, [live, bob]);

  // Quick blink every few seconds, only while the eyes are open
  useEffect(() => {
    if (!live || mood !== 'happy') return;
    let reopen: ReturnType<typeof setTimeout>;
    const timer = setInterval(() => {
      setBlink(true);
      reopen = setTimeout(() => setBlink(false), 140);
    }, 3600);
    return () => {
      clearInterval(timer);
      clearTimeout(reopen);
    };
  }, [live, mood]);

  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.get() }] }));

  const bodyTop = isDark ? '#6C8CF0' : '#3B7BEA';
  const bodyBottom = isDark ? '#5B4FD0' : '#5B3FD6';
  const belly = isDark ? '#DDE5FF' : '#F4F7FF';
  const wing = isDark ? '#4A44B8' : '#2F4FC4';

  const eyesClosed = mood === 'cheer' || blink;
  const sleepy = mood === 'sleepy';

  return (
    <Animated.View style={[{ width: size, height: size }, bobStyle]} accessibilityElementsHidden>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0.6" y2="1">
            <Stop offset="0" stopColor={bodyTop} />
            <Stop offset="1" stopColor={bodyBottom} />
          </LinearGradient>
        </Defs>

        {/* feet */}
        <Rect x="42" y="104" width="14" height="6" rx="3" fill={GOLD} />
        <Rect x="64" y="104" width="14" height="6" rx="3" fill={GOLD} />

        {/* wings */}
        <G rotation={mood === 'cheer' ? -35 : 8} origin="24, 74">
          <Ellipse cx="22" cy="78" rx="8" ry="19" fill={wing} />
        </G>
        <G rotation={mood === 'cheer' ? 35 : -8} origin="98, 74">
          <Ellipse cx="98" cy="78" rx="8" ry="19" fill={wing} />
        </G>

        {/* body + belly */}
        <Ellipse cx="60" cy="72" rx="38" ry="38" fill={`url(#${gradientId})`} />
        <Ellipse cx="60" cy="86" rx="23" ry="21" fill={belly} />
        <Path
          d="M50 82 q4 4 8 0 M62 82 q4 4 8 0 M56 92 q4 4 8 0"
          stroke={bodyTop}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* eyes */}
        {eyesClosed ? (
          <>
            <Path
              d={mood === 'cheer' ? 'M36 64 Q46 52 56 64' : 'M36 62 Q46 68 56 62'}
              stroke={INK}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d={mood === 'cheer' ? 'M64 64 Q74 52 84 64' : 'M64 62 Q74 68 84 62'}
              stroke={INK}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : (
          <>
            <Circle cx="46" cy="62" r="12" fill="#FFFFFF" />
            <Circle cx="74" cy="62" r="12" fill="#FFFFFF" />
            <Circle cx="47" cy={sleepy ? 66 : 63} r="6" fill={INK} />
            <Circle cx="73" cy={sleepy ? 66 : 63} r="6" fill={INK} />
            {!sleepy && (
              <>
                <Circle cx="49" cy="60.5" r="2" fill="#FFFFFF" />
                <Circle cx="75" cy="60.5" r="2" fill="#FFFFFF" />
              </>
            )}
            {sleepy && (
              <>
                {/* heavy eyelids */}
                <Path d="M34 62 a12 12 0 0 1 24 0 Z" fill={bodyTop} />
                <Path d="M62 62 a12 12 0 0 1 24 0 Z" fill={bodyTop} />
              </>
            )}
          </>
        )}

        {/* beak */}
        <Path d="M55 71 L65 71 L60 80 Z" fill={GOLD} />

        {/* graduation cap */}
        <G y={-5}>
          <Path d="M42 44 L42 55 Q60 63 78 55 L78 44 Z" fill={INK} />
          <Path d="M16 40 L60 22 L104 40 L60 58 Z" fill="#2B3070" />
          <Path d="M60 22 L104 40 L60 58 Z" fill={INK} opacity="0.35" />
          <Circle cx="60" cy="40" r="3" fill={GOLD} />
          <Path
            d="M60 40 L100 42 L100 58"
            stroke={GOLD}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <Circle cx="100" cy="60" r="3.5" fill={GOLD} />
        </G>

        {/* mood extras */}
        {mood === 'cheer' && (
          <>
            <Path d="M14 22 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 Z" fill={colors.accent} />
            <Path
              d="M104 14 l1.5 4.5 4.5 1.5 -4.5 1.5 -1.5 4.5 -1.5 -4.5 -4.5 -1.5 4.5 -1.5 Z"
              fill={colors.accent}
            />
          </>
        )}
        {sleepy && (
          <Path
            d="M92 28 h8 l-8 9 h8 M104 14 h6 l-6 7 h6"
            stroke={colors.textSecondary}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}
      </Svg>
    </Animated.View>
  );
}
