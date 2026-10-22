import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Semester } from '@/types/semester';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, spacing } from '@/constants/theme';
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type GpaChartProps = {
  semesters: Semester[];
  maxGpa: number;
};

export default function GpaChart({ semesters, maxGpa: scaleMax }: GpaChartProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [chartWidth, setChartWidth] = useState(0);

  const sortedSemesters = [...semesters]
    .filter((s) => s.status === 'completed')
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      const semesterOrder = { Spring: 0, Summer: 1, Fall: 2 };
      return (
        semesterOrder[a.semester as keyof typeof semesterOrder] -
        semesterOrder[b.semester as keyof typeof semesterOrder]
      );
    });

  const chartHeight = 120;
  const dotPadding = 16; // horizontal padding so dots don't clip edges
  const labelSpace = 24; // room above the highest dot for its GPA label
  const bottomPadding = 8;

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
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.md,
      color: colors.text,
      marginLeft: spacing.sm,
    },
    chartArea: {
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
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
      fontFamily: fonts.bold,
      fontSize: 10,
      color: colors.primary,
      width: 40,
      textAlign: 'center',
    },
    xLabelsRow: {
      height: 14,
      marginTop: spacing.sm,
    },
    xLabel: {
      position: 'absolute',
      width: 40,
      fontFamily: fonts.regular,
      fontSize: 10,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    noDataText: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.md,
    },
  });

  if (sortedSemesters.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No GPA data available yet</Text>
      </View>
    );
  }

  // Fit the y-axis to the data (with some margin) so small changes are visible
  // instead of every point sitting along the top of a fixed 0–4 scale
  const gpas = sortedSemesters.map((sem) => sem.gpa);
  const unit = scaleMax / 4; // margins below are written for a 4.0 scale
  const minGpa = Math.max(0, Math.min(...gpas) - 0.5 * unit);
  const maxGpa = Math.min(scaleMax, Math.max(...gpas) + 0.25 * unit);
  const usableHeight = chartHeight - labelSpace - bottomPadding;

  // Calculate points in pixels once we know the chart width
  const usableWidth = chartWidth - dotPadding * 2;
  const bestGpa = Math.max(...gpas);
  const points = sortedSemesters.map((sem, index) => {
    const xFraction = sortedSemesters.length > 1 ? index / (sortedSemesters.length - 1) : 0.5;
    const x = dotPadding + xFraction * usableWidth;
    const y = labelSpace + (1 - (sem.gpa - minGpa) / (maxGpa - minGpa)) * usableHeight;
    return {
      x,
      y,
      gpa: sem.gpa,
      isBest: sortedSemesters.length > 1 && sem.gpa === bestGpa,
      label: `${sem.semester.substring(0, 2)} ${String(sem.year).slice(-2)}`,
    };
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggleHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
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
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(150)}
          style={styles.chartArea}
        >
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
                        point.isBest && {
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: colors.accent,
                        },
                        {
                          left: point.x - (point.isBest ? 6 : 4),
                          top: point.y - (point.isBest ? 6 : 4),
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.gpaLabel,
                        point.isBest && { color: colors.accentText },
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
            {chartWidth > 0 &&
              points.map((point, index) => (
                <Text key={index} style={[styles.xLabel, { left: point.x - 20 }]}>
                  {point.label}
                </Text>
              ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
}
