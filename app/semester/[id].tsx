import { useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useGpa } from '@/hooks/useGpa';
import { Semester } from '@/types/semester';
import CourseCard from '@/components/CourseCard';
import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { getGradeColor } from '@/utils/gpaCalculator';
import { fonts, fontSizes, spacing, radii, statusColors } from '@/constants/theme';
import { Plus, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SemesterScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSemester, targetSemesterGpa } = useGpa();
  const semester = useMemo(() => id ? getSemester(id) ?? null : null, [id, getSemester]);
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.background,
      paddingTop: insets.top,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    headerInner: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 56,
      paddingHorizontal: spacing.xl,
      ...(Platform.OS === 'web' ? { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' as unknown as number } : {}),
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: radii.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.xl,
      color: colors.text,
      flex: 1,
      marginLeft: spacing.md,
    },
    content: {
      flex: 1,
      padding: spacing.xl,
      ...(Platform.OS === 'web' ? { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' as unknown as number } : {}),
    },
    summaryContainer: {
      backgroundColor: colors.card,
      borderRadius: radii.xl,
      padding: spacing.xl,
      marginBottom: spacing['2xl'],
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    semesterTitle: {
      fontFamily: fonts.bold,
      fontSize: fontSizes['2xl'],
      color: colors.text,
    },
    statusBadge: {
      paddingHorizontal: spacing.md - 2,
      paddingVertical: spacing.xs,
      borderRadius: radii.lg,
    },
    statusText: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    gpaSection: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    gpaValue: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.hero,
    },
    gpaLabel: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    progressSection: {
      marginBottom: spacing.lg,
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: 6,
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    progressText: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    statsRow: {
      flexDirection: 'row',
      gap: spacing.md - 2,
    },
    statPill: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: radii.md,
      paddingVertical: spacing.md - 2,
      alignItems: 'center',
    },
    statPillValue: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.lg,
      color: colors.text,
    },
    statPillLabel: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    coursesContainer: {
      flex: 1,
    },
    sectionTitle: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.lg,
      color: colors.text,
      marginBottom: spacing.md,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButton: {
      width: 36,
      height: 36,
      borderRadius: radii.md,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 'auto',
    },
  });

  const handleAddCourse = () => {
    router.push({
      pathname: "/course/[id]",
      params: { 
        id: "new",
        semester: semester?.semester,
        year: semester?.year.toString()
      }
    });
  };

  if (!semester) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontFamily: fonts.medium, color: colors.textSecondary }}>
          Semester not found
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
            <ArrowLeft size={18} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Semester Details</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddCourse} accessibilityLabel="Add course">
            <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryTop}>
            <Text style={styles.semesterTitle}>
              {semester.semester} {semester.year}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: semester.status === 'in-progress' ? statusColors.warning.bg : statusColors.completed.bg }]}>
              <Text style={[styles.statusText, { color: semester.status === 'in-progress' ? statusColors.warning.text : statusColors.completed.text }]}>
                {semester.status === 'in-progress' ? 'In Progress' : 'Completed'}
              </Text>
            </View>
          </View>

          {semester.gpa > 0 && (
            <View style={styles.gpaSection}>
              <Text style={[styles.gpaValue, { color: getGradeColor(semester.gpa).text }]}>
                {semester.gpa.toFixed(2)}
              </Text>
              <Text style={styles.gpaLabel}>Semester GPA</Text>
            </View>
          )}

          {semester.status === 'in-progress' && (() => {
            const gradedCount = semester.courses.filter(c => c.grade !== null).length;
            const totalCount = semester.courses.length;
            const progress = totalCount > 0 ? gradedCount / totalCount : 0;
            return (
              <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
                </View>
                <Text style={styles.progressText}>{gradedCount}/{totalCount} courses graded</Text>
              </View>
            );
          })()}

          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statPillValue}>{semester.courses.length}</Text>
              <Text style={styles.statPillLabel}>Courses</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statPillValue}>
                {semester.courses.reduce((sum, course) => sum + course.credits, 0)}
              </Text>
              <Text style={styles.statPillLabel}>Credits</Text>
            </View>
            {semester.status === 'in-progress' && targetSemesterGpa !== null && (
              <View style={styles.statPill}>
                <Text style={[styles.statPillValue, { color: statusColors.goal.text }]}>🎯 {targetSemesterGpa.toFixed(2)}</Text>
                <Text style={styles.statPillLabel}>Goal</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Courses</Text>

        {semester.courses.length > 0 ? (
          <FlatList
            data={semester.courses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CourseCard course={item} />}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState
            icon="book-open"
            title="No courses yet"
            message="Add courses to this semester to calculate your GPA"
          />
        )}
      </View>
    </View>
  );
}