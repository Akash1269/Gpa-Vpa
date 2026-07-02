import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Semester } from '@/types/semester';
import { useTheme } from '@/hooks/useTheme';
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type GpaChartProps = {
  semesters: Semester[];
};

export default function GpaChart({ semesters }: GpaChartProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [chartWidth, setChartWidth] = useState(0);

  const sortedSemesters = [...semesters].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const semesterOrder = { 'Spring': 0, 'Summer': 1, 'Fall': 2 };
    return semesterOrder[a.semester as keyof typeof semesterOrder] - 
           semesterOrder[b.semester as keyof typeof semesterOrder];
  });

  const maxGpa = 4.0;
  const chartHeight = 120;
  const dotPadding = 16; // horizontal padding so dots don't clip edges

  const styles = StyleSheet.create({
    container: {},
    toggleHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 40,
    },
    toggleLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    toggleTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 14,
      color: colors.text,
      marginLeft: 8,
    },
    chartArea: {
      marginTop: 8,
      marginBottom: 4,
    },
    chartCanvas: {
      height: chartHeight,
      position: 'relative',
    },
    trendLine: {
      position: 'absolute',
      height: 2,
      backgroundColor: colors.primary,
    },
    trendDot: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.card,
    },
    gpaLabel: {
      position: 'absolute',
      fontFamily: 'Inter-Bold',
      fontSize: 10,
      color: colors.primary,
      width: 40,
      textAlign: 'center',
    },
    xLabelsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingHorizontal: dotPadding,
    },
    xLabel: {
      fontFamily: 'Inter-Regular',
      fontSize: 10,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    noDataText: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 12,
    },
  });

  if (sortedSemesters.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No GPA data available yet</Text>
      </View>
    );
  }

  // Calculate points in pixels once we know the chart width
  const usableWidth = chartWidth - dotPadding * 2;
  const points = sortedSemesters.map((sem, index) => {
    const xFraction = sortedSemesters.length > 1
      ? index / (sortedSemesters.length - 1)
      : 0.5;
    const x = dotPadding + xFraction * usableWidth;
    const y = (1 - sem.gpa / maxGpa) * chartHeight;
    return { x, y, gpa: sem.gpa, label: `${sem.semester.substring(0, 2)} ${String(sem.year).slice(-2)}` };
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.toggleHeader} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
        <View style={styles.toggleLeft}>
          <TrendingUp size={16} color={colors.primary} />
          <Text style={styles.toggleTitle}>GPA Progression</Text>
        </View>
        {expanded ? (
          <ChevronUp size={16} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={16} color={colors.textSecondary} />
        )}
      </TouchableOpacity>

      {expanded && (
        <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)} style={styles.chartArea}>
          <View
            style={styles.chartCanvas}
            onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
          >
            {chartWidth > 0 && (
              <>
                {/* Connecting lines */}
                {points.map((point, index) => {
                  if (index === 0) return null;
                  const prev = points[index - 1];
                  const dx = point.x - prev.x;
                  const dy = point.y - prev.y;
                  const length = Math.sqrt(dx * dx + dy * dy);
                  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                  return (
                    <View
                      key={`line-${index}`}
                      style={[
                        styles.trendLine,
                        {
                          left: prev.x,
                          top: prev.y - 1,
                          width: length,
                          transform: [{ rotate: `${angle}deg` }],
                          transformOrigin: 'left center',
                        },
                      ]}
                    />
                  );
                })}

                {/* Dots and GPA labels */}
                {points.map((point, index) => (
                  <View key={`dot-${index}`}>
                    <View
                      style={[
                        styles.trendDot,
                        {
                          left: point.x - 4,
                          top: point.y - 4,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.gpaLabel,
                        {
                          left: point.x - 20,
                          top: point.y - 20,
                        },
                      ]}
                    >
                      {point.gpa.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>

          {/* X-axis labels */}
          <View style={styles.xLabelsRow}>
            {sortedSemesters.map((sem, index) => (
              <Text key={index} style={styles.xLabel}>
                {`${sem.semester.substring(0, 2)} ${String(sem.year).slice(-2)}`}
              </Text>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
}