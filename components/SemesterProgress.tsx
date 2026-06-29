import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Semester } from '@/types/semester';
import { getGradeColor } from '@/utils/gpaCalculator';
import { useTheme } from '@/hooks/useTheme';

type SemesterProgressProps = {
  semester: Semester;
};

export default function SemesterProgress({ semester }: SemesterProgressProps) {
  const { colors } = useTheme();
  const gpaColor = getGradeColor(semester.gpa);
  
  const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);
  
  const handlePress = () => {
    router.push(`/semester/${semester.semester}-${semester.year}`);
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      elevation: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    semesterTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 18,
      color: colors.text,
    },
    gpaContainer: {
      backgroundColor: gpaColor.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    gpaText: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 14,
      color: gpaColor.text,
    },
    coursesTitle: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    courseRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastCourseRow: {
      borderBottomWidth: 0,
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
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    courseGrade: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 14,
      color: colors.text,
      textAlign: 'right',
      minWidth: 30,
    },
    viewAllButton: {
      marginTop: 16,
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    viewAllText: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors.primary,
    },
    summaryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    summaryItem: {
      alignItems: 'center',
    },
    summaryValue: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
      color: colors.text,
    },
    summaryLabel: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.semesterTitle}>
          {semester.semester} {semester.year}
        </Text>
        <View style={styles.gpaContainer}>
          <Text style={styles.gpaText}>{semester.gpa.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.coursesTitle}>Current Courses</Text>
      
      {semester.courses.slice(0, 3).map((course, index, array) => (
        <View 
          key={course.id} 
          style={[
            styles.courseRow, 
            index === array.length - 1 && styles.lastCourseRow
          ]}
        >
          <View style={styles.courseInfo}>
            <Text style={styles.courseName}>{course.name}</Text>
            <Text style={styles.courseCode}>{course.code} • {course.credits} CR</Text>
          </View>
          <Text 
            style={[styles.courseGrade, { color: getGradeColor(course.grade).text }]}
          >
            {course.grade}
          </Text>
        </View>
      ))}
      
      {semester.courses.length > 3 && (
        <Text style={[styles.courseCode, { textAlign: 'center', marginTop: 8 }]}>
          +{semester.courses.length - 3} more courses
        </Text>
      )}

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{semester.courses.length}</Text>
          <Text style={styles.summaryLabel}>Courses</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalCredits}</Text>
          <Text style={styles.summaryLabel}>Credits</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{semester.gpa.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>GPA</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.viewAllButton} onPress={handlePress}>
        <Text style={styles.viewAllText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
}