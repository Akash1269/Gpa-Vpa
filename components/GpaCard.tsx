import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
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

  const progressWidth = (gpa / 4) * 100;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      padding: 24,
      overflow: 'hidden',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    label: {
      fontFamily: 'Inter-Medium',
      fontSize: 13,
      color: 'rgba(255,255,255,0.75)',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    standingBadge: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
    },
    standingText: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 12,
      color: '#FFFFFF',
    },
    gpaRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 20,
    },
    gpaValue: {
      fontFamily: 'Inter-Bold',
      fontSize: 56,
      color: '#FFFFFF',
      lineHeight: 60,
    },
    gpaScale: {
      fontFamily: 'Inter-Regular',
      fontSize: 18,
      color: 'rgba(255,255,255,0.6)',
      marginLeft: 8,
    },
    progressTrack: {
      height: 6,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
      backgroundColor: '#FFFFFF',
    },
    // Decorative circles
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
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: `${progressWidth}%` }]} />
        </View>
      </View>
    </Animated.View>
  );
});