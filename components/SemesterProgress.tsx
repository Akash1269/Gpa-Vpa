import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Semester } from '@/types/semester';
import { getGradeColor } from '@/utils/gpaCalculator';
import { useTheme } from '@/hooks/useTheme';
import { useGpa } from '@/hooks/useGpa';
import { fonts, fontSizes, spacing, radii, statusColors } from '@/constants/theme';

type SemesterProgressProps = {
  semester: Semester;
};

export default function SemesterProgress({ semester }: SemesterProgressProps) {
  const { colors } = useTheme();
  const { targetSemesterGpa, courseGoals } = useGpa();
  const gpaColor = getGradeColor(semester.gpa);

  const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);
  const gradedCourses = semester.courses.filter((c) => c.grade !== null);
  const isInProgress = semester.status === 'in-progress';
  const hasGoals = isInProgress && semester.courses.some((c) => courseGoals[c.id]);
  const gradedCount = gradedCourses.length;
  const totalCount = semester.courses.length;
  const progress = totalCount > 0 ? gradedCount / totalCount : 0;

  const getCourseBorderColor = (grade: string | null): string => {
    if (!grade) return colors.border;
    const value = getGradeColor(grade);
    return value.text;
  };

  const handlePress = () => {
    router.push(`/semester/${semester.semester}-${semester.year}`);
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: radii.xl,
      padding: spacing.xl - 2,
      marginBottom: spacing.lg,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    semesterTitle: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.xl,
      color: colors.text,
    },
    gpaContainer: {
      backgroundColor: gpaColor.background,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radii.lg,
    },
    gpaText: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.lg,
      color: gpaColor.text,
    },
    progressSection: {
      marginBottom: 14,
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: 6,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    metaText: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    metaDot: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginHorizontal: 6,
    },
    goalText: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.sm,
      color: statusColors.goal.text,
    },
    courseList: {
      marginBottom: 14,
    },
    courseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md - 2,
      paddingLeft: spacing.md,
      borderLeftWidth: 3,
      marginBottom: 2,
    },
    courseInfo: {
      flex: 1,
    },
    courseName: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: colors.text,
    },
    courseCode: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginTop: 1,
    },
    gradeSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    gradeBadge: {
      paddingHorizontal: spacing.md - 2,
      paddingVertical: spacing.xs,
      borderRadius: radii.sm,
      minWidth: 32,
      alignItems: 'center',
    },
    gradeBadgeText: {
      fontFamily: fonts.bold,
      fontSize: 13,
    },
    goalBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radii.sm,
      borderWidth: 1.5,
      borderColor: '#CE93D8',
      borderStyle: 'dashed',
      gap: 3,
    },
    goalBadgeIcon: {
      fontSize: 10,
    },
    goalBadgeText: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.sm,
      color: statusColors.goal.text,
    },
    editGoalButton: {
      alignSelf: 'flex-start',
      marginBottom: 14,
    },
    editGoalText: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.sm,
      color: colors.primary,
    },
    viewButton: {
      alignItems: 'center',
      paddingVertical: spacing.md,
      backgroundColor: colors.background,
      borderRadius: radii.md,
    },
    viewButtonText: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.semesterTitle}>
          {semester.semester} {semester.year}
        </Text>
        {semester.gpa > 0 ? (
          <View style={styles.gpaContainer}>
            <Text style={styles.gpaText}>{semester.gpa.toFixed(2)}</Text>
          </View>
        ) : isInProgress ? (
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary }}>
            In Progress
          </Text>
        ) : null}
      </View>

      {/* Progress bar + meta line */}
      {isInProgress && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {gradedCount}/{totalCount} graded
            </Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{totalCredits} CR</Text>
            {targetSemesterGpa !== null && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <TouchableOpacity onPress={() => router.push('/semester-goal')}>
                  <Text style={styles.goalText}>🎯 {targetSemesterGpa.toFixed(2)}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}

      {/* Set goal prompt (no goal yet) */}
      {isInProgress && targetSemesterGpa === null && (
        <TouchableOpacity
          style={styles.editGoalButton}
          onPress={() => router.push('/semester-goal')}
        >
          <Text style={styles.editGoalText}>+ Set semester goal</Text>
        </TouchableOpacity>
      )}

      {/* Course list with colored borders */}
      <View style={styles.courseList}>
        {semester.courses.map((course) => {
          const rowContent = (
            <>
              <View style={styles.courseInfo}>
                <Text style={styles.courseName} numberOfLines={1}>
                  {course.name}
                </Text>
                <Text style={styles.courseCode}>
                  {course.code} • {course.credits} CR
                </Text>
              </View>
              <View style={styles.gradeSection}>
                <View
                  style={[
                    styles.gradeBadge,
                    {
                      backgroundColor: course.grade
                        ? getGradeColor(course.grade).background
                        : colors.background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.gradeBadgeText,
                      {
                        color: course.grade
                          ? getGradeColor(course.grade).text
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {course.grade ?? '—'}
                  </Text>
                </View>
                {hasGoals && courseGoals[course.id] && (
                  <View style={styles.goalBadge}>
                    <Text style={styles.goalBadgeIcon}>🎯</Text>
                    <Text style={styles.goalBadgeText}>{courseGoals[course.id]}</Text>
                  </View>
                )}
              </View>
            </>
          );

          return isInProgress ? (
            <TouchableOpacity
              key={course.id}
              style={[styles.courseRow, { borderLeftColor: getCourseBorderColor(course.grade) }]}
              onPress={() => router.push(`/course/${course.id}`)}
              accessibilityLabel={`Edit ${course.name}`}
            >
              {rowContent}
            </TouchableOpacity>
          ) : (
            <View
              key={course.id}
              style={[styles.courseRow, { borderLeftColor: getCourseBorderColor(course.grade) }]}
            >
              {rowContent}
            </View>
          );
        })}
      </View>

      {/* View details */}
      <TouchableOpacity style={styles.viewButton} onPress={handlePress}>
        <Text style={styles.viewButtonText}>View Semester →</Text>
      </TouchableOpacity>
    </View>
  );
}
