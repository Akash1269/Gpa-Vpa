import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useGpa } from '@/hooks/useGpa';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, spacing, radii } from '@/constants/theme';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '@/components/ScreenHeader';

export default function CreditsScreen() {
  const { colors } = useTheme();
  const { semesters, totalCredits } = useGpa();
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);

  const toggleSemester = (id: string) => {
    setExpandedSemester((prev) => (prev === id ? null : id));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.xl,
      paddingBottom: 40,
      ...(Platform.OS === 'web'
        ? { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' as unknown as number }
        : {}),
    },
    totalCard: {
      backgroundColor: colors.hero,
      borderRadius: radii.xl,
      padding: spacing.xl,
      marginBottom: spacing['2xl'],
    },
    totalLabel: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: 'rgba(255,255,255,0.75)',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    totalValue: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.hero,
      color: '#FFFFFF',
      marginTop: spacing.xs,
    },
    totalSubtext: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.md,
      color: 'rgba(255,255,255,0.7)',
      marginTop: spacing.xs,
    },
    sectionTitle: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.lg,
      color: colors.text,
      marginBottom: spacing.md,
    },
    semesterRow: {
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    semesterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
    },
    semesterName: {
      fontFamily: fonts.semiBold,
      fontSize: 15,
      color: colors.text,
      flex: 1,
    },
    semesterCredits: {
      fontFamily: fonts.bold,
      fontSize: 15,
      color: colors.primary,
      marginRight: spacing.sm,
    },
    courseRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: spacing.md - 2,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    courseName: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.md,
      color: colors.text,
      flex: 1,
    },
    courseCode: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginRight: spacing.md,
    },
    courseCredits: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Credits Breakdown" />

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Credits Earned</Text>
            <Text style={styles.totalValue}>{totalCredits}</Text>
            <Text style={styles.totalSubtext}>
              Across {semesters.length} semester{semesters.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </Animated.View>

        <Text style={styles.sectionTitle}>By Semester</Text>

        {semesters.map((semester, index) => {
          const semId = `${semester.semester}-${semester.year}`;
          const isExpanded = expandedSemester === semId;
          const semCredits = semester.courses.reduce((sum, c) => sum + c.credits, 0);

          return (
            <Animated.View key={semId} entering={FadeInDown.delay(index * 50).duration(300)}>
              <View style={styles.semesterRow}>
                <TouchableOpacity
                  style={styles.semesterHeader}
                  onPress={() => toggleSemester(semId)}
                  accessibilityLabel={`${semester.semester} ${semester.year}, ${semCredits} credits`}
                  accessibilityHint="Tap to expand and see courses"
                >
                  <Text style={styles.semesterName}>
                    {semester.semester} {semester.year}
                  </Text>
                  <Text style={styles.semesterCredits}>{semCredits} CR</Text>
                  {isExpanded ? (
                    <ChevronDown size={18} color={colors.textSecondary} />
                  ) : (
                    <ChevronRight size={18} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>

                {isExpanded &&
                  semester.courses.map((course) => (
                    <View key={course.id} style={styles.courseRow}>
                      <Text style={styles.courseName}>{course.name}</Text>
                      <Text style={styles.courseCode}>{course.code}</Text>
                      <Text style={styles.courseCredits}>{course.credits} CR</Text>
                    </View>
                  ))}
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}
