import { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGpa } from '@/hooks/useGpa';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, spacing, radii } from '@/constants/theme';
import { calculateGradeValue } from '@/utils/gpaCalculator';
import { Check } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '@/components/ScreenHeader';
import SegmentedControl from '@/components/SegmentedControl';

type Mode = 'by-course' | 'by-gpa';

const gradeOptions = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

export default function SemesterGoalScreen() {
  const { colors } = useTheme();
  const {
    inProgressSemester,
    courseGoals,
    setCourseGoals,
    setTargetSemesterGpa,
    targetSemesterGpa,
  } = useGpa();

  const [mode, setMode] = useState<Mode>('by-course');
  const [perCourseGoals, setPerCourseGoals] = useState<Record<string, string>>(() => {
    if (!inProgressSemester) return {};
    const initial: Record<string, string> = {};
    inProgressSemester.courses.forEach((c) => {
      initial[c.id] = courseGoals[c.id] || 'A';
    });
    return initial;
  });
  const [selectedGpaGrade, setSelectedGpaGrade] = useState<string>(() => {
    // Find grade closest to target semester GPA
    if (targetSemesterGpa) {
      const closest = gradeOptions.find((g) => calculateGradeValue(g) <= targetSemesterGpa);
      return closest || 'A';
    }
    return 'A';
  });

  const courses = useMemo(() => inProgressSemester?.courses ?? [], [inProgressSemester]);

  // Calculate projected GPA from per-course goals
  const projectedGpa = useMemo(() => {
    if (courses.length === 0) return 0;
    let totalPoints = 0;
    let totalCredits = 0;
    courses.forEach((c) => {
      const grade = mode === 'by-course' ? perCourseGoals[c.id] : selectedGpaGrade;
      if (grade) {
        totalPoints += calculateGradeValue(grade) * c.credits;
        totalCredits += c.credits;
      }
    });
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }, [perCourseGoals, selectedGpaGrade, mode, courses]);

  const handleSave = () => {
    if (mode === 'by-course') {
      setCourseGoals(perCourseGoals);
      setTargetSemesterGpa(projectedGpa);
    } else {
      // Distribute selected grade to all courses
      const distributed: Record<string, string> = {};
      courses.forEach((c) => {
        distributed[c.id] = selectedGpaGrade;
      });
      setCourseGoals(distributed);
      setTargetSemesterGpa(calculateGradeValue(selectedGpaGrade));
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const updateCourseGoal = (courseId: string, grade: string) => {
    setPerCourseGoals((prev) => ({ ...prev, [courseId]: grade }));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
      ...(Platform.OS === 'web'
        ? { maxWidth: 600, alignSelf: 'center' as const, width: '100%' as unknown as number }
        : {}),
    },
    projectedCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: spacing.lg,
      marginBottom: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    projectedLabel: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: colors.textSecondary,
    },
    projectedValue: {
      fontFamily: fonts.bold,
      fontSize: fontSizes['4xl'],
      color: colors.primary,
      marginTop: spacing.xs,
    },
    courseCard: {
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      padding: 14,
      marginBottom: spacing.md - 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    courseHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md - 2,
    },
    courseName: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: colors.text,
      flex: 1,
    },
    courseCredits: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    gradeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    gradeChip: {
      paddingHorizontal: spacing.md - 2,
      paddingVertical: 6,
      borderRadius: radii.sm,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    gradeChipActive: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primary,
    },
    gradeChipText: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: colors.text,
    },
    gradeChipTextActive: {
      color: colors.primary,
      fontFamily: fonts.semiBold,
    },
    totalGpaSection: {
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      padding: spacing.lg,
      marginBottom: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    totalGpaLabel: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: colors.text,
      marginBottom: spacing.md,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      height: 54,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      marginTop: spacing.sm,
    },
    saveButtonText: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.lg,
      color: colors.onPrimary,
      marginLeft: spacing.sm,
    },
  });

  if (!inProgressSemester || courses.length === 0) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Semester Goal" showBorder={false} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text
            style={{
              fontFamily: fonts.regular,
              fontSize: 15,
              color: colors.textSecondary,
              textAlign: 'center',
            }}
          >
            No in-progress semester found. Add courses without grades to set semester goals.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Semester Goal" showBorder={false} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Mode Toggle */}
        <SegmentedControl
          options={['By Course', 'By Target GPA']}
          selected={mode === 'by-course' ? 'By Course' : 'By Target GPA'}
          onChange={(val) => setMode(val === 'By Course' ? 'by-course' : 'by-gpa')}
        />

        {/* Projected GPA */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.projectedCard}>
          <Text style={styles.projectedLabel}>Projected Semester GPA</Text>
          <Text style={styles.projectedValue}>{projectedGpa.toFixed(2)}</Text>
        </Animated.View>

        {/* By Course Mode */}
        {mode === 'by-course' && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            {courses.map((course) => (
              <View key={course.id} style={styles.courseCard}>
                <View style={styles.courseHeader}>
                  <Text style={styles.courseName} numberOfLines={1}>
                    {course.name}
                  </Text>
                  <Text style={styles.courseCredits}>{course.credits} CR</Text>
                </View>
                <View style={styles.gradeRow}>
                  {gradeOptions.map((grade) => (
                    <TouchableOpacity
                      key={grade}
                      style={[
                        styles.gradeChip,
                        perCourseGoals[course.id] === grade && styles.gradeChipActive,
                      ]}
                      onPress={() => updateCourseGoal(course.id, grade)}
                    >
                      <Text
                        style={[
                          styles.gradeChipText,
                          perCourseGoals[course.id] === grade && styles.gradeChipTextActive,
                        ]}
                      >
                        {grade}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* By GPA Mode */}
        {mode === 'by-gpa' && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <View style={styles.totalGpaSection}>
              <Text style={styles.totalGpaLabel}>Target grade for all courses</Text>
              <View style={styles.gradeRow}>
                {gradeOptions.map((grade) => (
                  <TouchableOpacity
                    key={grade}
                    style={[styles.gradeChip, selectedGpaGrade === grade && styles.gradeChipActive]}
                    onPress={() => setSelectedGpaGrade(grade)}
                  >
                    <Text
                      style={[
                        styles.gradeChipText,
                        selectedGpaGrade === grade && styles.gradeChipTextActive,
                      ]}
                    >
                      {grade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text
                style={{
                  fontFamily: fonts.regular,
                  fontSize: fontSizes.sm,
                  color: colors.textSecondary,
                  marginTop: spacing.md,
                }}
              >
                This will set {selectedGpaGrade} ({calculateGradeValue(selectedGpaGrade).toFixed(1)}
                ) as the target for all {courses.length} courses
              </Text>
            </View>

            {/* Preview per-course distribution */}
            {courses.map((course) => (
              <View
                key={course.id}
                style={[
                  styles.courseCard,
                  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseName} numberOfLines={1}>
                    {course.name}
                  </Text>
                  <Text style={styles.courseCredits}>
                    {course.code} • {course.credits} CR
                  </Text>
                </View>
                <View style={[styles.gradeChip, styles.gradeChipActive]}>
                  <Text style={styles.gradeChipTextActive}>{selectedGpaGrade}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Save semester goal"
          >
            <Check size={20} color={colors.onPrimary} />
            <Text style={styles.saveButtonText}>Save Goal</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
