import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type SemesterYearPickerProps = {
  semester: string;
  year: number;
  onChangeSemester: (semester: string) => void;
  onChangeYear: (year: number) => void;
};

const semesters = ['Fall', 'Spring', 'Summer'];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

const SemesterYearPicker: React.FC<SemesterYearPickerProps> = ({ 
  semester, 
  year, 
  onChangeSemester, 
  onChangeYear 
}) => {
  const { colors } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: 10,
    },
    pickerContainer: {
      flex: 1,
      marginHorizontal: 5,
    },
    optionsContainer: {
      backgroundColor: colors.card,
      borderRadius: 8,
      overflow: 'hidden',
    },
    option: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionText: {
      fontSize: 16,
      color: colors.text,
      fontFamily: 'Inter-Regular',
    },
    selectedOption: {
      backgroundColor: colors.primary,
    },
    selectedOptionText: {
      color: '#FFFFFF',
      fontFamily: 'Inter-Medium',
    },
    label: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
      fontFamily: 'Inter-Medium',
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Semester</Text>
        <View style={styles.optionsContainer}>
          {semesters.map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.option,
                semester === s && styles.selectedOption
              ]}
              onPress={() => onChangeSemester(s)}
            >
              <Text style={[
                styles.optionText,
                semester === s && styles.selectedOptionText
              ]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Year</Text>
        <View style={styles.optionsContainer}>
          {years.map((y) => (
            <TouchableOpacity
              key={y}
              style={[
                styles.option,
                year === y && styles.selectedOption
              ]}
              onPress={() => onChangeYear(y)}
            >
              <Text style={[
                styles.optionText,
                year === y && styles.selectedOptionText
              ]}>
                {y}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

export default SemesterYearPicker;