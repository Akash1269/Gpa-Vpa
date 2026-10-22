import { StyleSheet, View, Text, ScrollView, Platform } from 'react-native';
import { useGpa } from '@/hooks/useGpa';
import SemesterCard from '@/components/SemesterCard';
import GpaChart from '@/components/GpaChart';
import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { useTabBarClearance } from '@/hooks/useTabBarClearance';
import { fonts, fontSizes, spacing, radii } from '@/constants/theme';

export default function AcademicRecord() {
  const { colors } = useTheme();
  const tabBarClearance = useTabBarClearance();
  const { semesters, cumulativeGpa, totalCredits, gradingSystem } = useGpa();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.xl,
      paddingBottom: tabBarClearance,
      ...(Platform.OS === 'web'
        ? { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' as unknown as number }
        : {}),
    },
    header: {
      marginBottom: spacing['2xl'],
    },
    title: {
      fontFamily: fonts.bold,
      fontSize: 22,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.md,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
    summaryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing['2xl'],
    },
    summaryItem: {
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      padding: spacing.lg,
      width: '48%',
      elevation: 1,
    },
    summaryValue: {
      fontFamily: fonts.bold,
      fontSize: fontSizes['3xl'],
      color: colors.text,
      marginBottom: spacing.xs,
    },
    summaryLabel: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.md,
      color: colors.textSecondary,
    },
    sectionTitle: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.xl,
      color: colors.text,
      marginBottom: spacing.lg,
      marginTop: spacing['2xl'],
    },
    chartContainer: {
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      paddingHorizontal: 14,
      paddingVertical: spacing.xs,
      marginBottom: spacing.sm,
      elevation: 1,
    },
  });

  const hasSemesters = semesters.length > 0;

  return (
    <View style={styles.container}>
      {hasSemesters ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Semesters</Text>
            <Text style={styles.subtitle}>Your semester-by-semester academic performance</Text>
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{cumulativeGpa.toFixed(2)}</Text>
              <Text style={styles.summaryLabel}>Cumulative GPA</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalCredits}</Text>
              <Text style={styles.summaryLabel}>Total Credits</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <GpaChart semesters={semesters} maxGpa={gradingSystem.maxGpa} />
          </View>

          <Text style={styles.sectionTitle}>Semesters</Text>
          {semesters.map((semester) => (
            <SemesterCard key={`${semester.semester}-${semester.year}`} semester={semester} />
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          title="Nothing to chart yet"
          message="Add a few courses and Vee will start tracking your semesters"
        />
      )}
    </View>
  );
}
