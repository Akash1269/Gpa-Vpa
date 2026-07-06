import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, spacing, radii } from '@/constants/theme';
import Animated, { FadeIn } from 'react-native-reanimated';

type GpaCardProps = {
  gpa: number;
  academicStanding: {
    label: string;
    color: string;
  };
};

export default React.memo(function GpaCard({ gpa, academicStanding }: GpaCardProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.primary,
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
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.topRow}>
          <Text style={styles.label}>Cumulative GPA</Text>
          <View style={styles.standingBadge}>
            <Text style={styles.standingText}>{academicStanding.label}</Text>
          </View>
        </View>
        <View style={styles.gpaRow}>
          <Text style={styles.gpaValue}>{gpa.toFixed(2)}</Text>
          <Text style={styles.gpaScale}>/ 4.0</Text>
        </View>
      </View>
    </Animated.View>
  );
});
