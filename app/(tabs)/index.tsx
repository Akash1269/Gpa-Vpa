import { StyleSheet, View, Text, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useGpa } from '@/hooks/useGpa';
import GpaCard from '@/components/GpaCard';
import SemesterProgress from '@/components/SemesterProgress';
import { getAcademicStanding } from '@/utils/gpaCalculator';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, spacing, radii, statusColors } from '@/constants/theme';
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
      padding: spacing.xl,
      paddingBottom: 40,
      ...(Platform.OS === 'web' ? { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' as unknown as number } : {}),
    },
    statsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.lg,
    },
    statCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      padding: spacing.md - 2,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.md - 2,
    },
    statIconBg: {
      width: 30,
      height: 30,
      borderRadius: radii.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statValue: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.xl,
      color: colors.text,
    },
    statLabel: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.xs,
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
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.xl,
      color: colors.text,
    },
    sectionBadge: {
      backgroundColor: colors.primary + '15',
      paddingHorizontal: spacing.md - 2,
      paddingVertical: spacing.xs,
      borderRadius: radii.lg,
    },
    sectionBadgeText: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.sm,
      color: colors.primary,
    },
    goalCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginTop: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    goalCardTitle: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.md,
      color: colors.text,
    },
    goalCardSubtitle: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
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
            <View style={[styles.statIconBg, { backgroundColor: statusColors.inProgress.bg }]}>
              <Trophy size={16} color="#1A73E8" />
            </View>
            <View>
              <Text style={styles.statValue}>{semesters.length}</Text>
              <Text style={styles.statLabel}>Semesters</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/courses')} accessibilityLabel="View courses">
            <View style={[styles.statIconBg, { backgroundColor: statusColors.warning.bg }]}>
              <TrendingUp size={16} color={statusColors.warning.text} />
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
                  <View style={[styles.statIconBg, { backgroundColor: statusColors.goal.bg }]}>
                    <Target size={16} color={statusColors.goal.text} />
                  </View>
                  <Text style={{ fontFamily: fonts.semiBold, fontSize: 15, color: colors.text, marginLeft: 10 }}>My Goals</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/(tabs)/goals')} accessibilityLabel="Edit goals">
                  <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.primary }}>Edit</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                {targetCgpa !== null && (
                  <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: radii.lg, padding: spacing.md }}>
                    <Text style={{ fontFamily: fonts.regular, fontSize: fontSizes.xs, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>GPA Goal</Text>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 22, color: cumulativeGpa >= targetCgpa ? statusColors.completed.text : colors.text, marginTop: spacing.xs }}>{targetCgpa.toFixed(2)}</Text>
                    <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 6 }}>
                      <View style={{ height: '100%', backgroundColor: cumulativeGpa >= targetCgpa ? statusColors.completed.text : colors.primary, borderRadius: 2, width: `${Math.min(100, (cumulativeGpa / targetCgpa) * 100)}%` }} />
                    </View>
                    <Text style={{ fontFamily: fonts.regular, fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: spacing.xs }}>
                      {cumulativeGpa >= targetCgpa ? `Achieved ✓` : `Current: ${cumulativeGpa.toFixed(2)}`}
                    </Text>
                  </View>
                )}
                {targetCredits !== null && (
                  <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: radii.lg, padding: spacing.md }}>
                    <Text style={{ fontFamily: fonts.regular, fontSize: fontSizes.xs, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Credits Goal</Text>
                    <Text style={{ fontFamily: fonts.bold, fontSize: fontSizes.xl, color: totalCredits >= targetCredits ? statusColors.completed.text : colors.text, marginTop: spacing.xs }}>{totalCredits}<Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary }}>/{targetCredits}</Text></Text>
                    <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 6 }}>
                      <View style={{ height: '100%', backgroundColor: totalCredits >= targetCredits ? statusColors.completed.text : colors.primary, borderRadius: 2, width: `${Math.min(100, (totalCredits / targetCredits) * 100)}%` }} />
                    </View>
                    <Text style={{ fontFamily: fonts.regular, fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: spacing.xs }}>
                      {totalCredits >= targetCredits ? `Complete ✓` : `${targetCredits - totalCredits} remaining`}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.goalCard}
              onPress={() => router.push('/(tabs)/goals')}
              accessibilityLabel="Open GPA Planner"
            >
              <View style={[styles.statIconBg, { backgroundColor: statusColors.goal.bg }]}>
                <Target size={16} color={statusColors.goal.text} />
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
              <View style={[styles.sectionBadge, { backgroundColor: statusColors.inProgress.bg }]}>
                <Text style={[styles.sectionBadgeText, { color: statusColors.inProgress.text }]}>In Progress</Text>
              </View>
            </View>
            <SemesterProgress semester={inProgressSemester} />
          </Animated.View>
        )}

        {lastCompletedSemester && (
          <Animated.View entering={FadeInDown.delay(250).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Last Semester</Text>
            </View>
            <SemesterProgress semester={lastCompletedSemester} />
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}