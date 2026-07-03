import { StyleSheet, View, Text, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useGpa } from '@/hooks/useGpa';
import GpaCard from '@/components/GpaCard';
import SemesterProgress from '@/components/SemesterProgress';
import { getAcademicStanding } from '@/utils/gpaCalculator';
import { useTheme } from '@/hooks/useTheme';
import { Trophy, TrendingUp, Target } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function Dashboard() {
  const { colors } = useTheme();
  const { cumulativeGpa, totalCredits, inProgressSemester, lastCompletedSemester, semesters, courses, targetCgpa, targetCredits } = useGpa();
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
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    statIconBg: {
      width: 30,
      height: 30,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statValue: {
      fontFamily: 'Inter-Bold',
      fontSize: 18,
      color: colors.text,
    },
    statLabel: {
      fontFamily: 'Inter-Regular',
      fontSize: 11,
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
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/academic-record')} accessibilityLabel="View semesters">
            <View style={[styles.statIconBg, { backgroundColor: '#E3F2FD' }]}>
              <Trophy size={16} color="#1A73E8" />
            </View>
            <View>
              <Text style={styles.statValue}>{semesters.length}</Text>
              <Text style={styles.statLabel}>Semesters</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/courses')} accessibilityLabel="View courses">
            <View style={[styles.statIconBg, { backgroundColor: '#FFF3E0' }]}>
              <TrendingUp size={16} color="#F57C00" />
            </View>
            <View>
              <Text style={styles.statValue}>{courses.length}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(500)}>
          {(targetCgpa !== null || targetCredits !== null) ? (
            <View
              style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, marginTop: 12, borderWidth: 1, borderColor: colors.border }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.statIconBg, { backgroundColor: '#F3E5F5' }]}>
                    <Target size={16} color="#9C27B0" />
                  </View>
                  <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: colors.text, marginLeft: 10 }}>My Goals</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/goal-calculator')} accessibilityLabel="Edit goals">
                  <Text style={{ fontFamily: 'Inter-Medium', fontSize: 13, color: colors.primary }}>Edit</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {targetCgpa !== null && (
                  <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 12 }}>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>GPA Goal</Text>
                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 22, color: cumulativeGpa >= targetCgpa ? '#34A853' : colors.text, marginTop: 4 }}>{targetCgpa.toFixed(2)}</Text>
                    <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 6 }}>
                      <View style={{ height: '100%', backgroundColor: cumulativeGpa >= targetCgpa ? '#34A853' : colors.primary, borderRadius: 2, width: `${Math.min(100, (cumulativeGpa / targetCgpa) * 100)}%` }} />
                    </View>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
                      {cumulativeGpa >= targetCgpa ? `Achieved ✓` : `Current: ${cumulativeGpa.toFixed(2)}`}
                    </Text>
                  </View>
                )}
                {targetCredits !== null && (
                  <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 12 }}>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Credits Goal</Text>
                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 18, color: totalCredits >= targetCredits ? '#34A853' : colors.text, marginTop: 4 }}>{totalCredits}<Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: colors.textSecondary }}>/{targetCredits}</Text></Text>
                    <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 6 }}>
                      <View style={{ height: '100%', backgroundColor: totalCredits >= targetCredits ? '#34A853' : colors.primary, borderRadius: 2, width: `${Math.min(100, (totalCredits / targetCredits) * 100)}%` }} />
                    </View>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
                      {totalCredits >= targetCredits ? `Complete ✓` : `${targetCredits - totalCredits} remaining`}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.goalCard}
              onPress={() => router.push('/goal-calculator')}
              accessibilityLabel="Open GPA Planner"
            >
              <View style={[styles.statIconBg, { backgroundColor: '#F3E5F5' }]}>
                <Target size={16} color="#9C27B0" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.goalCardTitle}>Set Goals</Text>
                <Text style={styles.goalCardSubtitle}>Set your target GPA and graduation credits</Text>
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