import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useGpa } from '@/hooks/useGpa';
import { Semester } from '@/types/semester';
import CourseCard from '@/components/CourseCard';
import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { Plus, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SemesterScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSemester } = useGpa();
  const [semester, setSemester] = useState<Semester | null>(null);
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
      paddingHorizontal: 20,
      ...(Platform.OS === 'web' ? { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' as unknown as number } : {}),
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    headerTitle: {
      fontFamily: 'Inter-Bold',
      fontSize: 18,
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
      ...(Platform.OS === 'web' ? { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' as unknown as number } : {}),
    },
    summaryContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      elevation: 1,
    },
    semesterTitle: {
      fontFamily: 'Inter-Bold',
      fontSize: 20,
      color: colors.text,
      marginBottom: 4,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    statContainer: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontFamily: 'Inter-Bold',
      fontSize: 18,
      color: colors.text,
    },
    statLabel: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    coursesContainer: {
      flex: 1,
    },
    sectionTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
      color: colors.text,
      marginBottom: 12,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fab: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
    },
  });

  useEffect(() => {
    if (id) {
      const foundSemester = getSemester(id);
      if (foundSemester) {
        setSemester(foundSemester);
      }
    }
  }, [id, getSemester]);

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
        <Text style={{ fontFamily: 'Inter-Medium', color: colors.textSecondary }}>
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
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.summaryContainer}>
          <Text style={styles.semesterTitle}>
            {semester.semester} {semester.year}
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statContainer}>
              <Text style={styles.statValue}>{semester.gpa.toFixed(2)}</Text>
              <Text style={styles.statLabel}>GPA</Text>
            </View>
            <View style={styles.statContainer}>
              <Text style={styles.statValue}>{semester.courses.length}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statContainer}>
              <Text style={styles.statValue}>
                {semester.courses.reduce((sum, course) => sum + course.credits, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Credits</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Courses</Text>

        {semester.courses.length > 0 ? (
          <FlatList
            data={semester.courses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CourseCard course={item} />}
            contentContainerStyle={{ paddingBottom: 88 }}
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

      <TouchableOpacity style={styles.fab} onPress={handleAddCourse}>
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}