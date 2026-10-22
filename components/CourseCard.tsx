import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Course } from '@/types/course';
import { getGradeColor } from '@/utils/gpaCalculator';
import { useTheme } from '@/hooks/useTheme';
import { useGpa } from '@/hooks/useGpa';
import { fonts, fontSizes, spacing, radii } from '@/constants/theme';

type CourseCardProps = {
  course: Course;
  showSemester?: boolean;
};

export default React.memo(function CourseCard({ course, showSemester = false }: CourseCardProps) {
  const { colors, isDark } = useTheme();
  const { deleteCourse } = useGpa();
  const gradeColor = course.grade
    ? getGradeColor(course.grade, isDark)
    : { background: colors.border, text: colors.textSecondary };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    cardContent: {
      paddingVertical: spacing.md,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
    },
    gradePill: {
      width: 40,
      height: 40,
      borderRadius: radii.md,
      backgroundColor: gradeColor.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    gradeText: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.md,
      color: gradeColor.text,
    },
    infoContainer: {
      flex: 1,
      marginRight: spacing.sm,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    courseName: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.md,
      color: colors.text,
      flex: 1,
    },
    courseCode: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    semesterText: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    creditBadge: {
      backgroundColor: colors.background,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    creditText: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    deleteAction: {
      backgroundColor: '#EA4335',
      justifyContent: 'center',
      alignItems: 'center',
      width: 64,
      borderRadius: radii.lg,
      marginBottom: spacing.sm,
      marginLeft: spacing.sm,
    },
  });

  const handlePress = () => {
    router.push(`/course/${course.id}`);
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteCourse(course.id);
  };

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={handleDelete}
      accessibilityRole="button"
      accessibilityLabel="Delete course"
    >
      <Trash2 size={18} color="#FFFFFF" />
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${course.name}, ${course.code}, grade ${course.grade ?? 'pending'}, ${course.credits} credits`}
        accessibilityHint="Double tap to edit this course"
      >
        <View style={styles.cardContent}>
          <View style={styles.gradePill}>
            <Text style={styles.gradeText}>{course.grade ?? '—'}</Text>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.topRow}>
              <Text style={styles.courseName} numberOfLines={1}>
                {course.name}
              </Text>
            </View>
            <Text style={styles.courseCode}>{course.code}</Text>
            {showSemester && (
              <Text style={styles.semesterText}>
                {course.semester} {course.year}
              </Text>
            )}
          </View>
          <View style={styles.creditBadge}>
            <Text style={styles.creditText}>{course.credits} CR</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
});
