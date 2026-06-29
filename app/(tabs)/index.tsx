import { StyleSheet, View, Text, ScrollView, Platform } from 'react-native';
import { useGpa } from '@/hooks/useGpa';
import GpaCard from '@/components/GpaCard';
import RecentCoursesList from '@/components/RecentCoursesList';
import SemesterProgress from '@/components/SemesterProgress';
import { getAcademicStanding } from '@/utils/gpaCalculator';
import { useTheme } from '@/hooks/useTheme';
import { BookOpen, Trophy, TrendingUp } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function Dashboard() {
  const { colors } = useTheme();
  const { cumulativeGpa, totalCredits, recentCourses, currentSemester, semesters, courses } = useGpa();
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
      padding: 20,
      paddingBottom: 40,
      ...(Platform.OS === 'web' ? { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' as unknown as number } : {}),
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    statIconBg: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statValue: {
      fontFamily: 'Inter-Bold',
      fontSize: 24,
      color: colors.text,
      marginBottom: 2,
    },
    statLabel: {
      fontFamily: 'Inter-Regular',
      fontSize: 13,
      color: colors.textSecondary,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 28,
      marginBottom: 14,
    },
    sectionTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 18,
      color: colors.text,
    },
    sectionBadge: {
      backgroundColor: colors.primary + '15',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    sectionBadgeText: {
      fontFamily: 'Inter-Medium',
      fontSize: 12,
      color: colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <GpaCard gpa={cumulativeGpa} academicStanding={academicStanding} />

        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <View style={[styles.statIconBg, { backgroundColor: '#E8F5E9' }]}>
                <BookOpen size={18} color="#4CAF50" />
              </View>
            </View>
            <Text style={styles.statValue}>{totalCredits}</Text>
            <Text style={styles.statLabel}>Total Credits</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <View style={[styles.statIconBg, { backgroundColor: '#E3F2FD' }]}>
                <Trophy size={18} color="#1A73E8" />
              </View>
            </View>
            <Text style={styles.statValue}>{semesters.length}</Text>
            <Text style={styles.statLabel}>Semesters</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <View style={[styles.statIconBg, { backgroundColor: '#FFF3E0' }]}>
                <TrendingUp size={18} color="#F57C00" />
              </View>
            </View>
            <Text style={styles.statValue}>{courses.length}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
        </Animated.View>

        {currentSemester && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Current Semester</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{currentSemester.semester} {currentSemester.year}</Text>
              </View>
            </View>
            <SemesterProgress semester={currentSemester} />
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Courses</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{recentCourses.length} latest</Text>
            </View>
          </View>
          <RecentCoursesList courses={recentCourses} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}