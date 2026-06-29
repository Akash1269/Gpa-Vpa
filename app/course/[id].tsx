import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGpa } from '@/hooks/useGpa';
import { Course } from '@/types/course';
import { gradePoints, calculateGradeValue } from '@/utils/gpaCalculator';
import GradePicker from '@/components/GradePicker';
import CreditPicker from '@/components/CreditPicker';
import SemesterYearPicker from '@/components/SemesterYearPicker';
import { useTheme } from '@/hooks/useTheme';
import { X, Save, Trash2 } from 'lucide-react-native';

export default function CourseScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { getCourse, addCourse, updateCourse, deleteCourse, courses } = useGpa();
  
  const [course, setCourse] = useState<Course>({
    id: isNew ? crypto.randomUUID() : id,
    name: '',
    code: '',
    credits: 3,
    grade: 'A',
    semester: 'Fall',
    year: new Date().getFullYear(),
  });

  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});

  useEffect(() => {
    if (!isNew) {
      const existingCourse = getCourse(id);
      if (existingCourse) {
        setCourse(existingCourse);
      }
    }
  }, [id, isNew, getCourse]);

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      ...(Platform.OS === 'web' ? { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' as unknown as number } : {}),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      height: 60,
      paddingHorizontal: 20,
      borderBottomWidth: 0,
    },
    headerTitle: {
      fontFamily: 'Inter-Bold',
      fontSize: 18,
      color: colors.text,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: 20,
    },
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontFamily: 'Inter-Medium',
      fontSize: 16,
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      height: 48,
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      fontFamily: 'Inter-Regular',
      fontSize: 13,
      color: colors.error,
      marginTop: 4,
    },
    pickerContainer: {
      borderRadius: 8,
    },
    gradeInfo: {
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    gradeValue: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors.textSecondary,
    },
    buttonContainer: {
      flexDirection: 'row',
      marginTop: 32,
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
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
      color: '#FFFFFF',
      marginLeft: 8,
    },
    deleteButton: {
      width: 56,
      height: 56,
      backgroundColor: colors.error,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 16,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close">
          <X size={18} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isNew ? 'Add New Course' : 'Edit Course'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
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
              Grade Value: {calculateGradeValue(course.grade).toFixed(1)}
            </Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Credit Hours</Text>
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

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} accessibilityRole="button" accessibilityLabel="Save course">
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Course</Text>
          </TouchableOpacity>
          
          {!isNew && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Trash2 size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}