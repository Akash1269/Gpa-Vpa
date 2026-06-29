import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Plus, Search, Filter } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGpa } from '@/hooks/useGpa';
import CourseCard from '@/components/CourseCard';
import SemesterFilter from '@/components/SemesterFilter';
import EmptyState from '@/components/EmptyState';
import Toast from '@/components/Toast';
import { useTheme } from '@/hooks/useTheme';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function CoursesScreen() {
  const { colors } = useTheme();
  const { courses, semesters, lastDeletedCourse, undoDelete } = useGpa();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCourses, setFilteredCourses] = useState(courses);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (lastDeletedCourse) {
      setShowToast(true);
    }
  }, [lastDeletedCourse]);

  const handleUndo = useCallback(() => {
    undoDelete();
    setShowToast(false);
  }, [undoDelete]);

  const dismissToast = useCallback(() => {
    setShowToast(false);
  }, []);

  useEffect(() => {
    let result = courses;
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(course => 
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        course.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply semester filter
    if (selectedSemester) {
      result = result.filter(course => `${course.semester}-${course.year}` === selectedSemester);
    }
    
    setFilteredCourses(result);
  }, [searchQuery, selectedSemester, courses]);

  const handleAddCourse = () => {
    router.push('/course/new');
  };

  const handleSelectSemester = (semesterId: string | null) => {
    setSelectedSemester(semesterId);
    setShowFilters(false);
  };

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
    filterButton: {
      marginLeft: 10,
      width: 46,
      height: 46,
      borderRadius: 12,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    fab: {
      position: 'absolute',
      right: 24,
      bottom: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
    },
    filterContainer: {
      position: 'absolute',
      top: 64,
      left: 16,
      right: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      elevation: 5,
      zIndex: 10,
    },
    filterTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
      color: colors.text,
      marginBottom: 12,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 40,
    },
    emptyStateText: {
      fontFamily: 'Inter-Medium',
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
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
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={selectedSemester ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <Animated.View 
            style={styles.filterContainer}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
          >
            <Text style={styles.filterTitle}>Filter by Semester</Text>
            <SemesterFilter 
              semesters={semesters}
              selectedSemester={selectedSemester}
              onSelectSemester={handleSelectSemester}
            />
          </Animated.View>
        )}

        {filteredCourses.length > 0 ? (
          <FlatList
            data={filteredCourses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CourseCard course={item} />}
            contentContainerStyle={{ paddingBottom: 88 }}
            showsVerticalScrollIndicator={false}
            maxToRenderPerBatch={10}
            windowSize={5}
            getItemLayout={(_, index) => ({ length: 88, offset: 88 * index, index })}
          />
        ) : (
          <EmptyState 
            icon="book-open"
            title="No courses found"
            message={searchQuery || selectedSemester ? "Try adjusting your filters" : "Add your first course to get started"} 
          />
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleAddCourse(); }} accessibilityRole="button" accessibilityLabel="Add new course">
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>

      <Toast
        message="Course deleted"
        visible={showToast}
        onDismiss={dismissToast}
        action={{ label: 'Undo', onPress: handleUndo }}
      />
    </View>
  );
}