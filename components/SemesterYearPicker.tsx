import React, { useState } from 'react';
import { View, StyleSheet, Platform, ViewStyle, TextStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
  onChangeYear,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    } as ViewStyle,
    pickerContainer: {
      flex: 1,
    } as ViewStyle,
    picker: Platform.select({
      android: {
        color: colors.text,
        backgroundColor: colors.card,
        borderRadius: 8,
      },
    }) as TextStyle,
  });

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <Picker
          style={styles.picker}
          selectedValue={semester}
          onValueChange={onChangeSemester}
          dropdownIconColor={colors.text}
        >
          {semesters.map((s) => (
            <Picker.Item key={s} label={s} value={s} color={colors.text} />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          style={styles.picker}
          selectedValue={year}
          onValueChange={onChangeYear}
          dropdownIconColor={colors.text}
        >
          {years.map((y) => (
            <Picker.Item
              key={y}
              label={y.toString()}
              value={y}
              color={colors.text}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

export default SemesterYearPicker;
