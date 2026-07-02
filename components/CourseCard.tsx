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

type CourseCardProps = {
  course: Course;
  showSemester?: boolean;
};

export default React.memo(function CourseCard({ course, showSemester = false }: CourseCardProps) {
  const { colors } = useTheme();
  const { deleteCourse } = useGpa();
  const gradeColor = getGradeColor(course.grade);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    cardContent: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
    },
    gradePill: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: gradeColor.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    gradeText: {
      fontFamily: 'Inter-Bold',
      fontSize: 14,
      color: gradeColor.text,
    },
    infoContainer: {
      flex: 1,
      marginRight: 8,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    courseName: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    courseCode: {
      fontFamily: 'Inter-Medium',
      fontSize: 12,
      color: colors.textSecondary,
    },
    semesterText: {
      fontFamily: 'Inter-Regular',
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    creditBadge: {
      backgroundColor: colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    creditText: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 12,
      color: colors.textSecondary,
    },
    deleteAction: {
      backgroundColor: '#EA4335',
      justifyContent: 'center',
      alignItems: 'center',
      width: 64,
      borderRadius: 12,
      marginBottom: 8,
      marginLeft: 8,
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
        accessibilityLabel={`${course.name}, ${course.code}, grade ${course.grade}, ${course.credits} credits`}
        accessibilityHint="Double tap to edit this course"
      >
        <View style={styles.cardContent}>
          <View style={styles.gradePill}>
            <Text style={styles.gradeText}>{course.grade}</Text>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.topRow}>
              <Text style={styles.courseName} numberOfLines={1}>{course.name}</Text>
            </View>
            <Text style={styles.courseCode}>{course.code}</Text>
            {showSemester && (
              <Text style={styles.semesterText}>{course.semester} {course.year}</Text>
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