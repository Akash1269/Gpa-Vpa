import { StyleSheet, View, Text, ScrollView, Platform } from 'react-native';
import { useGpa } from '@/hooks/useGpa';
import SemesterCard from '@/components/SemesterCard';
import GpaChart from '@/components/GpaChart';
import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';

export default function AcademicRecord() {
  const { colors } = useTheme();
  const { semesters, cumulativeGpa, totalCredits } = useGpa();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      ...(Platform.OS === 'web' ? { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' as unknown as number } : {}),
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontFamily: 'Inter-Bold',
      fontSize: 22,
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    summaryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    summaryItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      width: '48%',
      elevation: 1,
    },
    summaryValue: {
      fontFamily: 'Inter-Bold',
      fontSize: 24,
      color: colors.text,
      marginBottom: 4,
    },
    summaryLabel: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
    sectionTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 18,
      color: colors.text,
      marginBottom: 16,
      marginTop: 24,
    },
    chartContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 4,
      marginBottom: 8,
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
            <GpaChart semesters={semesters} />
          </View>

          <Text style={styles.sectionTitle}>Semesters</Text>
          {semesters.map((semester) => (
            <SemesterCard key={`${semester.semester}-${semester.year}`} semester={semester} />
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          icon="bar-chart-3"
          title="No academic records yet"
          message="Add courses to see your academic progress and GPA statistics"
        />
      )}
    </View>
  );
}