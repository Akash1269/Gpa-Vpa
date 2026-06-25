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

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      elevation: 1,
    },
    title: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    gpaContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: 16,
    },
    gpaValue: {
      fontFamily: 'Inter-Bold',
      fontSize: 48,
      color: colors.text,
    },
    gpaScale: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
      marginBottom: 8,
    },
    academicStandingContainer: {
      backgroundColor: colors.background,
      padding: 8,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    academicStandingLabel: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.background,
      borderRadius: 4,
      marginTop: 16,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
  });

  // Calculate width percentage based on GPA (0-4 scale)
  const progressWidth = (gpa / 4) * 100;

  return (
    <Animated.View entering={FadeIn.duration(800)}>
      <View style={styles.container}>
        <Text style={styles.title}>CUMULATIVE GPA</Text>
        <View style={styles.gpaContainer}>
          <Text style={styles.gpaValue}>{gpa.toFixed(2)}</Text>
          <Text style={styles.gpaScale}>/ 4.0</Text>
        </View>
        
        <View style={styles.academicStandingContainer}>
          <Text style={[styles.academicStandingLabel, { color: academicStanding.color }]}>
            {academicStanding.label}
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { 
                width: `${progressWidth}%`, 
                backgroundColor: academicStanding.color 
              }
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
});