import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Semester } from '@/types/semester';
import { getGradeColor } from '@/utils/gpaCalculator';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, spacing, radii } from '@/constants/theme';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';

type SemesterCardProps = {
  semester: Semester;
};

export default React.memo(function SemesterCard({ semester }: SemesterCardProps) {
  const { colors, isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const isInProgress = semester.status === 'in-progress';
  const gpaColor =
    !isInProgress || semester.gpa > 0
      ? getGradeColor(semester.gpa ?? 0, isDark)
      : { background: colors.status.warning.bg, text: colors.status.warning.text };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: radii.xl,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    cardContent: {
      padding: spacing.lg,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    semesterTitle: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.xl,
      color: colors.text,
    },
    gpaContainer: {
      backgroundColor: gpaColor.background,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radii.xl,
    },
    gpaText: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.md,
      color: gpaColor.text,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    statItem: {
      flex: 1,
    },
    statValue: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.lg,
      color: colors.text,
    },
    statLabel: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.md,
      color: colors.textSecondary,
      marginTop: 2,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.md,
      marginTop: spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    viewDetailsText: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: colors.primary,
    },
    coursesContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: spacing.md,
      paddingTop: spacing.md,
    },
    courseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    courseRowLast: {
      borderBottomWidth: 0,
    },
    courseGradePill: {
      width: 32,
      height: 32,
      borderRadius: radii.sm,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md - 2,
    },
    courseGradeText: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.sm,
    },
    courseInfo: {
      flex: 1,
    },
    courseName: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: colors.text,
    },
    courseCode: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginTop: 1,
    },
    courseCredits: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
  });

  return (
    <Animated.View entering={FadeInDown.duration(300).delay(100)}>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.semesterTitle}>
              {semester.semester} {semester.year}
            </Text>
            <View style={styles.gpaContainer}>
              <Text style={styles.gpaText}>
                {isInProgress && semester.gpa === 0
                  ? 'In Progress'
                  : `GPA: ${semester.gpa?.toFixed(2)}`}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{semester.courses.length}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {semester.courses.reduce((sum, course) => sum + course.credits, 0)}
              </Text>
              <Text style={styles.statLabel}>Credits</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.viewDetailsText}>{expanded ? 'Hide Courses' : 'View Courses'}</Text>
            {expanded ? (
              <ChevronUp size={20} color={colors.primary} />
            ) : (
              <ChevronDown size={20} color={colors.primary} />
            )}
          </View>

          {expanded && (
            <Animated.View
              entering={FadeIn.duration(250)}
              exiting={FadeOut.duration(150)}
              style={styles.coursesContainer}
            >
              {semester.courses.map((course, index) => {
                const courseGradeColor = course.grade
                  ? getGradeColor(course.grade, isDark)
                  : { background: colors.border, text: colors.textSecondary };
                const isLast = index === semester.courses.length - 1;
                return (
                  <View key={course.id} style={[styles.courseRow, isLast && styles.courseRowLast]}>
                    <View
                      style={[
                        styles.courseGradePill,
                        { backgroundColor: courseGradeColor.background },
                      ]}
                    >
                      <Text style={[styles.courseGradeText, { color: courseGradeColor.text }]}>
                        {course.grade ?? '—'}
                      </Text>
                    </View>
                    <View style={styles.courseInfo}>
                      <Text style={styles.courseName}>{course.name}</Text>
                      <Text style={styles.courseCode}>{course.code}</Text>
                    </View>
                    <Text style={styles.courseCredits}>{course.credits} CR</Text>
                  </View>
                );
              })}
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});
