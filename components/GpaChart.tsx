import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { Semester } from '@/types/semester';
import { useTheme } from '@/hooks/useTheme';
import Animated, { FadeInUp } from 'react-native-reanimated';

type GpaChartProps = {
  semesters: Semester[];
};

export default function GpaChart({ semesters }: GpaChartProps) {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width - 64; // Accounting for padding

  // Sort semesters by year and semester
  const sortedSemesters = [...semesters].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const semesterOrder = { 'Spring': 0, 'Summer': 1, 'Fall': 2 };
    return semesterOrder[a.semester as keyof typeof semesterOrder] - 
           semesterOrder[b.semester as keyof typeof semesterOrder];
  });

  const maxGpa = 4.0; // Maximum possible GPA

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    chartContainer: {
      height: 160,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginTop: 24,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    barContainer: {
      alignItems: 'center',
      flex: 1,
    },
    bar: {
      width: 24,
      backgroundColor: colors.primary,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      marginHorizontal: 4,
    },
    axisLabel: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: 'center',
    },
    yAxisContainer: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 24,
      justifyContent: 'space-between',
    },
    yAxisLabel: {
      fontFamily: 'Inter-Regular',
      fontSize: 10,
      color: colors.textSecondary,
      textAlign: 'right',
      width: 30,
    },
    yAxisLine: {
      position: 'absolute',
      left: 36,
      right: 0,
      height: 1,
      backgroundColor: colors.border,
      opacity: 0.3,
    },
    noDataText: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 20,
    },
  });

  if (sortedSemesters.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No GPA data available yet</Text>
      </View>
    );
  }

  // Create y-axis labels (4.0 at top, 0.0 at bottom)
  const yAxisLabels = [4.0, 3.0, 2.0, 1.0, 0];

  return (
    <View style={styles.container}>
      {/* Y-axis labels */}
      <View style={styles.yAxisContainer}>
        {yAxisLabels.map((label, index) => (
          <View key={index} style={{ position: 'relative' }}>
            <Text style={styles.yAxisLabel}>{label.toFixed(1)}</Text>
            <View style={styles.yAxisLine} />
          </View>
        ))}
      </View>

      {/* Chart bars */}
      <View style={styles.chartContainer}>
        {sortedSemesters.map((semester, index) => {
          const barHeight = (semester.gpa / maxGpa) * 140; // 140px is the max height
          
          return (
            <Animated.View 
              key={`${semester.semester}-${semester.year}`} 
              style={styles.barContainer}
              entering={FadeInUp.delay(index * 100).duration(400)}
            >
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: Math.max(barHeight, 4),
                    backgroundColor: semester.gpa >= 3.0 
                      ? colors.success 
                      : semester.gpa >= 2.0 
                        ? colors.warning 
                        : colors.error 
                  }
                ]}
              />
              <Text style={styles.axisLabel} numberOfLines={2}>
                {`${semester.semester.substring(0, 2)}\n${semester.year}`}
              </Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}