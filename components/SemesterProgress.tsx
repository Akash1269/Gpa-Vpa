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
  const { targetSemesterGpa } = useGpa();
  const gpaColor = getGradeColor(semester.gpa);
  
  const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);
  const gradedCourses = semester.courses.filter(c => c.grade !== null);
  const ungradedCourses = semester.courses.filter(c => c.grade === null);
  const isInProgress = semester.status === 'in-progress';
  
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
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
    },
    gpaText: {
      fontFamily: 'Inter-Bold',
      fontSize: 18,
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
        {semester.gpa > 0 && (
          <View style={styles.gpaContainer}>
            <Text style={styles.gpaText}>{semester.gpa.toFixed(2)}</Text>
          </View>
        )}
      </View>

      {isInProgress && targetSemesterGpa !== null && (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E5F5', borderRadius: 8, padding: 10, marginBottom: 12 }}>
          <Text style={{ fontFamily: 'Inter-Medium', fontSize: 13, color: '#9C27B0' }}>
            🎯 Semester Goal: {targetSemesterGpa.toFixed(2)}
          </Text>
        </View>
      )}

      <Text style={styles.coursesTitle}>Courses</Text>
      
      {semester.courses.map((course, index) => (
        <View 
          key={course.id} 
          style={[
            styles.courseRow, 
            index === semester.courses.length - 1 && styles.lastCourseRow
          ]}
        >
          <View style={styles.courseInfo}>
            <Text style={styles.courseName}>{course.name}</Text>
            <Text style={styles.courseCode}>{course.code} • {course.credits} CR</Text>
          </View>
          <Text 
            style={[styles.courseGrade, { color: course.grade ? getGradeColor(course.grade).text : colors.textSecondary }]}
          >
            {course.grade ?? '—'}
          </Text>
        </View>
      ))}

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{semester.courses.length}</Text>
          <Text style={styles.summaryLabel}>Courses</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalCredits}</Text>
          <Text style={styles.summaryLabel}>Credits</Text>
        </View>
        {semester.gpa > 0 && (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{semester.gpa.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>{isInProgress ? 'GPA so far' : 'GPA'}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.viewAllButton} onPress={handlePress}>
        <Text style={styles.viewAllText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
}