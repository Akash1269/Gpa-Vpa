import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Dimensions, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGpa } from '@/hooks/useGpa';
import { Course } from '@/types/course';
import { calculateGradeValue } from '@/utils/gpaCalculator';
import GradePicker from '@/components/GradePicker';
import CreditPicker from '@/components/CreditPicker';
import SemesterYearPicker from '@/components/SemesterYearPicker';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, spacing, radii } from '@/constants/theme';
import { X, Save, Trash2, PlusCircle, Pencil } from 'lucide-react-native';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function CourseScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { getCourse, addCourse, updateCourse, deleteCourse, courses } = useGpa();
  
  const [course, setCourse] = useState<Course>(() => {
    if (!isNew) {
      const existingCourse = getCourse(id);
      if (existingCourse) return existingCourse;
    }
    return {
      id: isNew ? generateId() : id,
      name: '',
      code: '',
      credits: 3,
      grade: 'A',
      semester: 'Fall',
      year: new Date().getFullYear(),
    };
  });

  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});

  const handleSave = () => {
    const trimmedName = course.name.trim();
    const trimmedCode = course.code.trim();
    const newErrors: { name?: string; code?: string } = {};

    if (!trimmedName) {
      newErrors.name = 'Course name is required';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Name must be 100 characters or fewer';
    }

    if (!trimmedCode) {
      newErrors.code = 'Course code is required';
    } else if (trimmedCode.length < 2) {
      newErrors.code = 'Code must be at least 2 characters';
    } else if (trimmedCode.length > 10) {
      newErrors.code = 'Code must be 10 characters or fewer';
    }

    // Duplicate detection
    if (!newErrors.code && trimmedCode) {
      const duplicate = courses.find(
        c => c.code.toLowerCase() === trimmedCode.toLowerCase() &&
             c.semester === course.semester &&
             c.year === course.year &&
             c.id !== course.id
      );
      if (duplicate) {
        newErrors.code = `A course with code "${trimmedCode}" already exists in ${course.semester} ${course.year}`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setErrors({});
    const courseToSave = { ...course, name: trimmedName, code: trimmedCode };

    if (isNew) {
      addCourse(courseToSave);
    } else {
      updateCourse(courseToSave);
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Course",
      "Are you sure you want to delete this course?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteCourse(course.id);
            router.back();
          }
        }
      ]
    );
  };

  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const isDesktopWeb = Platform.OS === 'web' && screenWidth >= 768;
  const drawerHeight = screenHeight * 0.8;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: isDesktopWeb ? 'center' : 'flex-end',
      alignItems: isDesktopWeb ? 'center' : 'stretch',
    },
    drawer: {
      backgroundColor: colors.background,
      overflow: 'hidden' as const,
      ...(isDesktopWeb
        ? { width: 500, maxHeight: '85%' as unknown as number, borderRadius: 20 }
        : { height: drawerHeight, borderTopLeftRadius: 24, borderTopRightRadius: 24 }),
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 6,
      ...(isDesktopWeb ? { display: 'none' as const } : {}),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    headerTitle: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.xl,
      color: colors.text,
      marginLeft: spacing.md - 2,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: radii.md,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    content: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
    },
    formGroup: {
      marginBottom: spacing.xl,
    },
    label: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.lg,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    input: {
      height: 48,
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      paddingHorizontal: spacing.lg,
      fontFamily: fonts.regular,
      fontSize: fontSizes.lg,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: colors.error,
      marginTop: spacing.xs,
    },
    pickerContainer: {
      borderRadius: radii.sm,
    },
    gradeInfo: {
      marginTop: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
    },
    gradeValue: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: colors.textSecondary,
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.primary,
      height: 54,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    saveButtonText: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.lg,
      color: '#FFFFFF',
      marginLeft: spacing.sm,
    },
    deleteButton: {
      width: 54,
      height: 54,
      backgroundColor: colors.error,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.md,
    },
  });

  return (
    <Pressable style={styles.overlay} onPress={() => router.back()}>
      {!isDesktopWeb && <View style={{ flex: 1 }} />}
      <Pressable style={styles.drawer} onPress={(e) => e.stopPropagation()}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isNew ? <PlusCircle size={20} color={colors.primary} /> : <Pencil size={18} color={colors.primary} />}
            <Text style={styles.headerTitle}>
              {isNew ? 'Add New Course' : 'Edit Course'}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close">
            <X size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Course Name</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : undefined]}
              value={course.name}
              onChangeText={(text) => { setCourse({ ...course, name: text }); if (errors.name) setErrors(e => ({ ...e, name: undefined })); }}
              placeholder="Introduction to Computer Science"
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel="Course name"
              maxLength={100}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Course Code</Text>
            <TextInput
              style={[styles.input, errors.code ? styles.inputError : undefined]}
              value={course.code}
              onChangeText={(text) => { setCourse({ ...course, code: text }); if (errors.code) setErrors(e => ({ ...e, code: undefined })); }}
              placeholder="CS101"
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel="Course code"
              maxLength={10}
            />
            {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Grade</Text>
            <View style={styles.pickerContainer}>
              <GradePicker
                value={course.grade}
                onChange={(grade) => setCourse({ ...course, grade })}
              />
            </View>
            <View style={styles.gradeInfo}>
              <Text style={styles.gradeValue}>
                {course.grade === null
                  ? 'Not yet graded — tracked as in-progress'
                  : `Grade Value: ${calculateGradeValue(course.grade).toFixed(1)}`}
              </Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Credits</Text>
            <View style={styles.pickerContainer}>
              <CreditPicker
                value={course.credits}
                onChange={(credits) => setCourse({ ...course, credits })}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Semester & Year</Text>
            <View style={styles.pickerContainer}>
              <SemesterYearPicker
                semester={course.semester}
                year={course.year}
                onChangeSemester={(semester) => setCourse({ ...course, semester })}
                onChangeYear={(year) => setCourse({ ...course, year })}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} accessibilityRole="button" accessibilityLabel="Save course">
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Course</Text>
          </TouchableOpacity>
          
          {!isNew && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} accessibilityRole="button" accessibilityLabel="Delete course">
              <Trash2 size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
    </Pressable>
  );
}