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
import Animated, { FadeInRight } from 'react-native-reanimated';

type CourseCardProps = {
  course: Course;
};

export default React.memo(function CourseCard({ course }: CourseCardProps) {
  const { colors } = useTheme();
  const { deleteCourse } = useGpa();
  const gradeColor = getGradeColor(course.grade);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 12,
      elevation: 1,
      overflow: 'hidden',
    },
    cardContent: {
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoContainer: {
      flex: 1,
    },
    courseName: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
      color: colors.text,
      marginBottom: 4,
    },
    courseCode: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
    semesterText: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    gradeContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: gradeColor.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 16,
    },
    gradeText: {
      fontFamily: 'Inter-Bold',
      fontSize: 16,
      color: gradeColor.text,
    },
    creditText: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 2,
    },
    deleteAction: {
      backgroundColor: '#EA4335',
      justifyContent: 'center',
      alignItems: 'center',
      width: 72,
      borderRadius: 12,
      marginBottom: 12,
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
      <Trash2 size={20} color="#FFFFFF" />
    </TouchableOpacity>
  );

  return (
    <Animated.View entering={FadeInRight.duration(300).delay(100)}>
      <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
        <TouchableOpacity
          style={styles.container}
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={`${course.name}, ${course.code}, grade ${course.grade}, ${course.credits} credits, ${course.semester} ${course.year}`}
          accessibilityHint="Double tap to edit this course"
        >
          <View style={styles.cardContent}>
            <View style={styles.infoContainer}>
              <Text style={styles.courseName}>{course.name}</Text>
              <Text style={styles.courseCode}>{course.code}</Text>
              <Text style={styles.semesterText}>
                {course.semester} {course.year}
              </Text>
            </View>
            <View>
              <View style={styles.gradeContainer}>
                <Text style={styles.gradeText}>{course.grade}</Text>
              </View>
              <Text style={styles.creditText}>{course.credits} CR</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
});