import { StyleSheet, View, Text, FlatList } from 'react-native';
import { Course } from '@/types/course';
import CourseCard from './CourseCard';
import EmptyState from './EmptyState';
import { useTheme } from '@/hooks/useTheme';

type RecentCoursesListProps = {
  courses: Course[];
};

export default function RecentCoursesList({ courses }: RecentCoursesListProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    emptyContainer: {
      height: 200,
    },
  });

  if (courses.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <EmptyState
          icon="book-plus"
          title="No courses yet"
          message="Add your first course to see it here"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CourseCard course={item} />}
        scrollEnabled={false}
      />
    </View>
  );
}