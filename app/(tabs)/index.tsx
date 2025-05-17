import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useGpa } from '@/hooks/useGpa';
import GpaCard from '@/components/GpaCard';
import RecentCoursesList from '@/components/RecentCoursesList';
import SemesterProgress from '@/components/SemesterProgress';
import { getAcademicStanding } from '@/utils/gpaCalculator';
import { useTheme } from '@/hooks/useTheme';

export default function Dashboard() {
  const { colors } = useTheme();
  const { cumulativeGpa, totalCredits, recentCourses, currentSemester } = useGpa();
  const academicStanding = getAcademicStanding(cumulativeGpa);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    sectionTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 18,
      color: colors.text,
      marginBottom: 12,
      marginTop: 24,
    },
    welcomeContainer: {
      marginBottom: 16,
    },
    welcome: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    name: {
      fontFamily: 'Inter-Bold',
      fontSize: 24,
      color: colors.text,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 16,
    },
    statContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      width: '48%',
      elevation: 1,
    },
    statValue: {
      fontFamily: 'Inter-Bold',
      fontSize: 20,
      color: colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcome}>Welcome to</Text>
          <Text style={styles.name}>GPA Calculator</Text>
        </View>

        <GpaCard gpa={cumulativeGpa} academicStanding={academicStanding} />

        <View style={styles.statsRow}>
          <View style={styles.statContainer}>
            <Text style={styles.statValue}>{totalCredits}</Text>
            <Text style={styles.statLabel}>Total Credits</Text>
          </View>
          <View style={styles.statContainer}>
            <Text style={styles.statValue}>{currentSemester?.courses.length || 0}</Text>
            <Text style={styles.statLabel}>Current Courses</Text>
          </View>
        </View>

        {currentSemester && (
          <>
            <Text style={styles.sectionTitle}>Current Semester</Text>
            <SemesterProgress semester={currentSemester} />
          </>
        )}

        <Text style={styles.sectionTitle}>Recent Courses</Text>
        <RecentCoursesList courses={recentCourses} />
      </ScrollView>
    </View>
  );
}