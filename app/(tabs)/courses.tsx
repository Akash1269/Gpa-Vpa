import { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, SectionList, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Search } from 'lucide-react-native';
import { useGpa } from '@/hooks/useGpa';
import CourseCard from '@/components/CourseCard';
import EmptyState from '@/components/EmptyState';
import Toast from '@/components/Toast';
import { useTheme } from '@/hooks/useTheme';
import { Course } from '@/types/course';

export default function CoursesScreen() {
  const { colors } = useTheme();
  const { courses, lastDeletedCourse, undoDelete, clearLastDeleted } = useGpa();
  const [searchQuery, setSearchQuery] = useState('');
  const showToast = !!lastDeletedCourse;

  const handleUndo = useCallback(() => {
    undoDelete();
  }, [undoDelete]);

  const dismissToast = useCallback(() => {
    clearLastDeleted();
  }, [clearLastDeleted]);

  const sections = useMemo(() => {
    let filtered = courses;

    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Group by semester-year
    const grouped: Record<string, Course[]> = {};
    filtered.forEach(course => {
      const key = `${course.semester}-${course.year}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(course);
    });

    // Sort semesters: latest first
    const semesterOrder = ['Summer', 'Spring', 'Fall', 'Winter'];
    return Object.entries(grouped)
      .sort(([a], [b]) => {
        const [semA, yearA] = a.split('-');
        const [semB, yearB] = b.split('-');
        const yearDiff = Number(yearB) - Number(yearA);
        if (yearDiff !== 0) return yearDiff;
        return semesterOrder.indexOf(semA) - semesterOrder.indexOf(semB);
      })
      .map(([key, data]) => {
        const [sem, year] = key.split('-');
        return { title: `${sem} ${year}`, data, key };
      });
  }, [courses, searchQuery]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
      ...(Platform.OS === 'web' ? { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' as unknown as number } : {}),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 46,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      fontFamily: 'Inter-Regular',
      fontSize: 15,
      color: colors.text,
      marginLeft: 10,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 4,
      marginTop: 8,
    },
    sectionTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 15,
      color: colors.text,
    },
    sectionCount: {
      fontFamily: 'Inter-Medium',
      fontSize: 12,
      color: colors.textSecondary,
      backgroundColor: colors.card,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {sections.length > 0 ? (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CourseCard course={item} />}
            renderSectionHeader={({ section }) => {
              const hasUngraded = section.data.some((c: Course) => c.grade === null);
              return (
                <View style={styles.sectionHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    {hasUngraded && (
                      <Text style={{ fontFamily: 'Inter-Medium', fontSize: 11, color: '#F57C00', backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' }}>In Progress</Text>
                    )}
                  </View>
                  <Text style={styles.sectionCount}>{section.data.length} course{section.data.length !== 1 ? 's' : ''}</Text>
                </View>
              );
            }}
            contentContainerStyle={{ paddingBottom: 88 }}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
          />
        ) : (
          <EmptyState
            icon="book-open"
            title="No courses found"
            message={searchQuery ? "Try adjusting your search" : "Add your first course to get started"}
          />
        )}
      </View>

      <Toast
        message="Course deleted"
        visible={showToast}
        onDismiss={dismissToast}
        action={{ label: 'Undo', onPress: handleUndo }}
      />
    </View>
  );
}