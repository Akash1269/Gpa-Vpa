import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Semester } from '@/types/semester';
import { getGradeColor } from '@/utils/gpaCalculator';
import { useTheme } from '@/hooks/useTheme';
import { useGpa } from '@/hooks/useGpa';

type SemesterProgressProps = {
  semester: Semester;
};

export default function SemesterProgress({ semester }: SemesterProgressProps) {
  const { colors } = useTheme();
  const { targetSemesterGpa, courseGoals } = useGpa();
  const gpaColor = getGradeColor(semester.gpa);
  
  const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);
  const gradedCourses = semester.courses.filter(c => c.grade !== null);
  const isInProgress = semester.status === 'in-progress';
  const hasGoals = isInProgress && semester.courses.some(c => courseGoals[c.id]);
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
      borderRadius: 16,
      padding: 18,
      marginBottom: 16,
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
      marginBottom: 12,
    },
    semesterTitle: {
      fontFamily: 'Inter-Bold',
      fontSize: 18,
      color: colors.text,
    },
    gpaContainer: {
      backgroundColor: gpaColor.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    gpaText: {
      fontFamily: 'Inter-Bold',
      fontSize: 16,
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
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      color: colors.textSecondary,
    },
    metaDot: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      color: colors.textSecondary,
      marginHorizontal: 6,
    },
    goalText: {
      fontFamily: 'Inter-Medium',
      fontSize: 12,
      color: '#9C27B0',
    },
    courseList: {
      marginBottom: 14,
    },
    courseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingLeft: 12,
      borderLeftWidth: 3,
      marginBottom: 2,
    },
    courseInfo: {
      flex: 1,
    },
    courseName: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors.text,
    },
    courseCode: {
      fontFamily: 'Inter-Regular',
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 1,
    },
    gradeSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    gradeBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      minWidth: 32,
      alignItems: 'center',
    },
    gradeBadgeText: {
      fontFamily: 'Inter-Bold',
      fontSize: 13,
    },
    goalBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: '#CE93D8',
      borderStyle: 'dashed',
      gap: 3,
    },
    goalBadgeIcon: {
      fontSize: 10,
    },
    goalBadgeText: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 12,
      color: '#9C27B0',
    },
    editGoalButton: {
      alignSelf: 'flex-start',
      marginBottom: 14,
    },
    editGoalText: {
      fontFamily: 'Inter-Medium',
      fontSize: 12,
      color: colors.primary,
    },
    viewButton: {
      alignItems: 'center',
      paddingVertical: 12,
      backgroundColor: colors.background,
      borderRadius: 10,
    },
    viewButtonText: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
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
          <Text style={{ fontFamily: 'Inter-Medium', fontSize: 13, color: colors.textSecondary }}>In Progress</Text>
        ) : null}
      </View>

      {/* Progress bar + meta line */}
      {isInProgress && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{gradedCount}/{totalCount} graded</Text>
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
                <Text style={styles.courseName} numberOfLines={1}>{course.name}</Text>
                <Text style={styles.courseCode}>{course.code} • {course.credits} CR</Text>
              </View>
              <View style={styles.gradeSection}>
                <View style={[styles.gradeBadge, { backgroundColor: course.grade ? getGradeColor(course.grade).background : colors.background }]}>
                  <Text style={[styles.gradeBadgeText, { color: course.grade ? getGradeColor(course.grade).text : colors.textSecondary }]}>
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