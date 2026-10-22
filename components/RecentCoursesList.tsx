import { StyleSheet, View, FlatList } from 'react-native';
import { Course } from '@/types/course';
import CourseCard from './CourseCard';
import EmptyState from './EmptyState';

type RecentCoursesListProps = {
  courses: Course[];
};

export default function RecentCoursesList({ courses }: RecentCoursesListProps) {
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
        <EmptyState title="No courses yet" message="Tap the + button to add your first one" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CourseCard course={item} showSemester />}
        scrollEnabled={false}
      />
    </View>
  );
}
