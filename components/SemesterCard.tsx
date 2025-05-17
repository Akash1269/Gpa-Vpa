import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Semester } from '@/types/semester';
import { getGradeColor } from '@/utils/gpaCalculator';
import { useTheme } from '@/hooks/useTheme';
import { ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type SemesterCardProps = {
  semester: Semester;
};

export default function SemesterCard({ semester }: SemesterCardProps) {
  const { colors } = useTheme();
  const gpaColor = getGradeColor(semester.gpa ?? 0) ?? {
    background: '#FCE8E6',
    text: '#EA4335',
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 16,
      elevation: 1,
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
  });

  const handlePress = () => {
    router.push(`/semester/${semester.semester}-${semester.year}`);
  };

  return (
    <Animated.View entering={FadeInDown.duration(300).delay(100)}>
      <TouchableOpacity style={styles.container} onPress={handlePress}>
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
            <Text style={styles.viewDetailsText}>View Details</Text>
            <ChevronRight size={20} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}