import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, spacing, radii } from '@/constants/theme';
import Animated, { FadeIn } from 'react-native-reanimated';
import GradientBackground from '@/components/GradientBackground';
import AnimatedNumber from '@/components/AnimatedNumber';

type GpaCardProps = {
  gpa: number;
  scaleLabel: string;
  academicStanding: {
    label: string;
    color: string;
  };
};

export default React.memo(function GpaCard({ gpa, scaleLabel, academicStanding }: GpaCardProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.heroGradient[0], // shown until the gradient has measured itself
      borderRadius: radii.xl + 4,
      padding: spacing['2xl'],
      overflow: 'hidden',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.xl,
    },
    label: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: 'rgba(255,255,255,0.75)',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    standingBadge: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
      borderRadius: radii.xl + 4,
    },
    standingText: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.sm,
      color: '#FFFFFF',
    },
    gpaRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    gpaValue: {
      fontFamily: fonts.bold,
      fontSize: 56,
      color: '#FFFFFF',
      lineHeight: 60,
    },
    gpaScale: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.xl,
      color: 'rgba(255,255,255,0.6)',
      marginLeft: spacing.sm,
    },
    decorCircle1: {
      position: 'absolute',
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(255,255,255,0.06)',
      top: -30,
      right: -20,
    },
    decorCircle2: {
      position: 'absolute',
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.04)',
      bottom: -20,
      left: 40,
    },
  });

  return (
    <Animated.View entering={FadeIn.duration(600)}>
      <View style={styles.container}>
        <GradientBackground colors={colors.heroGradient} />
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.topRow}>
          <Text style={styles.label}>Cumulative GPA</Text>
          <View style={styles.standingBadge}>
            <Text style={styles.standingText}>{academicStanding.label}</Text>
          </View>
        </View>
        <View style={styles.gpaRow}>
          <AnimatedNumber value={gpa} style={styles.gpaValue} />
          <Text style={styles.gpaScale}>/ {scaleLabel}</Text>
        </View>
      </View>
    </Animated.View>
  );
});
