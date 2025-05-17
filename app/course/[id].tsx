import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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
  const { getCourse, addCourse, updateCourse, deleteCourse } = useGpa();
  
  const [course, setCourse] = useState<Course>({
    id: isNew ? Date.now().toString() : id,
    name: '',
    code: '',
    credits: 3,
    grade: 'A',
    semester: 'Fall',
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (!isNew) {
      const existingCourse = getCourse(id);
      if (existingCourse) {
        setCourse(existingCourse);
      }
    }
  }, [id, isNew, getCourse]);

  const handleSave = () => {
    // Validate input
    if (!course.name.trim()) {
      Alert.alert('Error', 'Course name is required');
      return;
    }
    
    if (!course.code.trim()) {
      Alert.alert('Error', 'Course code is required');
      return;
    }

    if (isNew) {
      addCourse(course);
    } else {
      updateCourse(course);
    }
    
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
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      height: 60,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 18,
      color: colors.text,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: 16,
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
      borderRadius: 8,
      paddingHorizontal: 16,
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.card,
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
      height: 56,
      borderRadius: 8,
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
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isNew ? 'Add New Course' : 'Edit Course'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Course Name</Text>
          <TextInput
            style={styles.input}
            value={course.name}
            onChangeText={(text) => setCourse({ ...course, name: text })}
            placeholder="Introduction to Computer Science"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Course Code</Text>
          <TextInput
            style={styles.input}
            value={course.code}
            onChangeText={(text) => setCourse({ ...course, code: text })}
            placeholder="CS101"
            placeholderTextColor={colors.textSecondary}
          />
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
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
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