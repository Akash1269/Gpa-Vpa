import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { useGpa } from '@/hooks/useGpa';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CreditsScreen() {
  const { colors } = useTheme();
  const { semesters, totalCredits } = useGpa();
  const insets = useSafeAreaInsets();
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);

  const toggleSemester = (id: string) => {
    setExpandedSemester(prev => prev === id ? null : id);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: insets.top + 8,
      paddingBottom: 12,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontFamily: 'Inter-Bold',
      fontSize: 18,
      color: colors.text,
      marginLeft: 12,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
      ...(Platform.OS === 'web' ? { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' as unknown as number } : {}),
    },
    totalCard: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
    },
    totalLabel: {
      fontFamily: 'Inter-Medium',
      fontSize: 13,
      color: 'rgba(255,255,255,0.75)',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    totalValue: {
      fontFamily: 'Inter-Bold',
      fontSize: 40,
      color: '#FFFFFF',
      marginTop: 4,
    },
    totalSubtext: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: 'rgba(255,255,255,0.7)',
      marginTop: 4,
    },
    sectionTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
      color: colors.text,
      marginBottom: 12,
    },
    semesterRow: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 8,
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
      fontFamily: 'Inter-SemiBold',
      fontSize: 15,
      color: colors.text,
      flex: 1,
    },
    semesterCredits: {
      fontFamily: 'Inter-Bold',
      fontSize: 15,
      color: colors.primary,
      marginRight: 8,
    },
    courseRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    courseName: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    courseCode: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      color: colors.textSecondary,
      marginRight: 12,
    },
    courseCredits: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Credits Breakdown</Text>
      </View>

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

                {isExpanded && semester.courses.map(course => (
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
