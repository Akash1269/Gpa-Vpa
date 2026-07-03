import { StyleSheet, View, Text, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useGpa } from '@/hooks/useGpa';
import GpaCard from '@/components/GpaCard';
import SemesterProgress from '@/components/SemesterProgress';
import { getAcademicStanding } from '@/utils/gpaCalculator';
import { useTheme } from '@/hooks/useTheme';
import { BookOpen, Trophy, TrendingUp, Target } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function Dashboard() {
  const { colors } = useTheme();
  const { cumulativeGpa, totalCredits, inProgressSemester, lastCompletedSemester, semesters, courses, targetCgpa, targetSemesterGpa } = useGpa();
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
    goalCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    goalCardTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 14,
      color: colors.text,
    },
    goalCardSubtitle: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <GpaCard gpa={cumulativeGpa} academicStanding={academicStanding} />

        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/credits')} accessibilityLabel="View credits breakdown">
            <View style={styles.statIconRow}>
              <View style={[styles.statIconBg, { backgroundColor: '#E8F5E9' }]}>
                <BookOpen size={18} color="#4CAF50" />
              </View>
            </View>
            <Text style={styles.statValue}>{totalCredits}</Text>
            <Text style={styles.statLabel}>Total Credits</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/academic-record')} accessibilityLabel="View semesters">
            <View style={styles.statIconRow}>
              <View style={[styles.statIconBg, { backgroundColor: '#E3F2FD' }]}>
                <Trophy size={18} color="#1A73E8" />
              </View>
            </View>
            <Text style={styles.statValue}>{semesters.length}</Text>
            <Text style={styles.statLabel}>Semesters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/courses')} accessibilityLabel="View courses">
            <View style={styles.statIconRow}>
              <View style={[styles.statIconBg, { backgroundColor: '#FFF3E0' }]}>
                <TrendingUp size={18} color="#F57C00" />
              </View>
            </View>
            <Text style={styles.statValue}>{courses.length}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(500)}>
          {(targetCgpa !== null || targetSemesterGpa !== null) ? (
            <TouchableOpacity
              style={{ backgroundColor: colors.card, borderRadius: 14, padding: 16, marginTop: 12, borderWidth: 1, borderColor: colors.border }}
              onPress={() => router.push('/goal-calculator')}
              accessibilityLabel="View GPA goals"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={[styles.statIconBg, { backgroundColor: '#F3E5F5' }]}>
                  <Target size={18} color="#9C27B0" />
                </View>
                <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 16, color: colors.text, marginLeft: 10 }}>My Goals</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {targetCgpa !== null && (
                  <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 10, padding: 12 }}>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: colors.textSecondary }}>Target CGPA</Text>
                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 20, color: cumulativeGpa >= targetCgpa ? '#34A853' : colors.text, marginTop: 4 }}>{targetCgpa.toFixed(2)}</Text>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                      Current: {cumulativeGpa.toFixed(2)} {cumulativeGpa >= targetCgpa ? '✓' : `(${(targetCgpa - cumulativeGpa).toFixed(2)} to go)`}
                    </Text>
                  </View>
                )}
                {targetSemesterGpa !== null && (
                  <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 10, padding: 12 }}>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: colors.textSecondary }}>Semester Goal</Text>
                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 20, color: colors.text, marginTop: 4 }}>{targetSemesterGpa.toFixed(2)}</Text>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                      {inProgressSemester ? `${inProgressSemester.semester} ${inProgressSemester.year}` : 'This semester'}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.goalCard}
              onPress={() => router.push('/goal-calculator')}
              accessibilityLabel="Open GPA Goal Calculator"
            >
              <View style={[styles.statIconBg, { backgroundColor: '#F3E5F5' }]}>
                <Target size={18} color="#9C27B0" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.goalCardTitle}>Set GPA Goals</Text>
                <Text style={styles.goalCardSubtitle}>Set your target CGPA and semester goals</Text>
              </View>
            </TouchableOpacity>
          )}
        </Animated.View>

        {inProgressSemester && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>This Semester</Text>
              <View style={[styles.sectionBadge, { backgroundColor: '#FFF3E0' }]}>
                <Text style={[styles.sectionBadgeText, { color: '#F57C00' }]}>{inProgressSemester.semester} {inProgressSemester.year} • In Progress</Text>
              </View>
            </View>
            <SemesterProgress semester={inProgressSemester} />
          </Animated.View>
        )}

        {lastCompletedSemester && (
          <Animated.View entering={FadeInDown.delay(250).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Last Semester</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{lastCompletedSemester.semester} {lastCompletedSemester.year}</Text>
              </View>
            </View>
            <SemesterProgress semester={lastCompletedSemester} />
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}