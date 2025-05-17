import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Course } from '@/types/course';
import { getGradeColor } from '@/utils/gpaCalculator';
import { useTheme } from '@/hooks/useTheme';
import Animated, { FadeInRight } from 'react-native-reanimated';

type CourseCardProps = {
  course: Course;
};

export default function CourseCard({ course }: CourseCardProps) {
  const { colors } = useTheme();
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
  });

  const handlePress = () => {
    router.push(`/course/${course.id}`);
  };

  return (
    <Animated.View entering={FadeInRight.duration(300).delay(100)}>
      <TouchableOpacity style={styles.container} onPress={handlePress}>
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
    </Animated.View>
  );
}