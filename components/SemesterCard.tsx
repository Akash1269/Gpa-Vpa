import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Semester } from '@/types/semester';
import { getGradeColor } from '@/utils/gpaCalculator';
import { useTheme } from '@/hooks/useTheme';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';

type SemesterCardProps = {
  semester: Semester;
};

export default React.memo(function SemesterCard({ semester }: SemesterCardProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const gpaColor = getGradeColor(semester.gpa ?? 0) ?? {
    background: '#FCE8E6',
    text: '#EA4335',
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    cardContent: {
      padding: 16,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    semesterTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 18,
      color: colors.text,
    },
    gpaContainer: {
      backgroundColor: gpaColor.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    gpaText: {
      fontFamily: 'Inter-Bold',
      fontSize: 14,
      color: gpaColor.text,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    statItem: {
      flex: 1,
    },
    statValue: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
      color: colors.text,
    },
    statLabel: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
      marginTop: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    viewDetailsText: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors.primary,
    },
    coursesContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 12,
      paddingTop: 12,
    },
    courseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    courseRowLast: {
      borderBottomWidth: 0,
    },
    courseGradePill: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    courseGradeText: {
      fontFamily: 'Inter-Bold',
      fontSize: 12,
    },
    courseInfo: {
      flex: 1,
    },
    courseName: {
      fontFamily: 'Inter-Medium',
      fontSize: 13,
      color: colors.text,
    },
    courseCode: {
      fontFamily: 'Inter-Regular',
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 1,
    },
    courseCredits: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 12,
      color: colors.textSecondary,
    },
  });

  return (
    <Animated.View entering={FadeInDown.duration(300).delay(100)}>
      <TouchableOpacity style={styles.container} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
        <View style={styles.cardContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.semesterTitle}>
              {semester.semester} {semester.year}
            </Text>
            <View style={styles.gpaContainer}>
              <Text style={styles.gpaText}>GPA: {semester.gpa?.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{semester.courses.length}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {semester.courses.reduce((sum, course) => sum + course.credits, 0)}
              </Text>
              <Text style={styles.statLabel}>Credit Hours</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.viewDetailsText}>
              {expanded ? 'Hide Courses' : 'View Courses'}
            </Text>
            {expanded ? (
              <ChevronUp size={20} color={colors.primary} />
            ) : (
              <ChevronDown size={20} color={colors.primary} />
            )}
          </View>

          {expanded && (
            <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)} style={styles.coursesContainer}>
              {semester.courses.map((course, index) => {
                const courseGradeColor = getGradeColor(course.grade);
                const isLast = index === semester.courses.length - 1;
                return (
                  <View key={course.id} style={[styles.courseRow, isLast && styles.courseRowLast]}>
                    <View style={[styles.courseGradePill, { backgroundColor: courseGradeColor.background }]}>
                      <Text style={[styles.courseGradeText, { color: courseGradeColor.text }]}>{course.grade}</Text>
                    </View>
                    <View style={styles.courseInfo}>
                      <Text style={styles.courseName}>{course.name}</Text>
                      <Text style={styles.courseCode}>{course.code}</Text>
                    </View>
                    <Text style={styles.courseCredits}>{course.credits} CR</Text>
                  </View>
                );
              })}
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});