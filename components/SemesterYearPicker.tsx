import React, { useState } from 'react';
import { View, StyleSheet, Platform, ViewStyle, TextStyle, Modal, TouchableOpacity, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/hooks/useTheme';
import { ChevronDown } from 'lucide-react-native';

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
  const [showSemesterPicker, setShowSemesterPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 0,
      margin: 0,
    } as ViewStyle,
    pickerContainer: {
      flex: 1,
    } as ViewStyle,
    pickerButton: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: Platform.OS === 'ios' ? 1 : 0,
      borderColor: colors.border,
    } as ViewStyle,
    pickerText: {
      color: colors.text,
      fontSize: 16,
      fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'Inter-Regular',
    } as TextStyle,
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    } as ViewStyle,
    picker: Platform.select({
      ios: {
        backgroundColor: colors.card,
      },
      android: {
        color: colors.text,
        backgroundColor: colors.card,
        borderRadius: 8,
      },
    }) as TextStyle,
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      paddingTop: 16,
    } as ViewStyle,
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      paddingBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    } as ViewStyle,
    doneButton: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    } as TextStyle,
  });

  const renderIOSPicker = (
    value: string | number,
    items: Array<{ label: string; value: string | number }>,
    isVisible: boolean,
    onClose: () => void,
    onChange: (value: any) => void
  ) => (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => {
              onChange(itemValue);
              onClose();
            }}
          >
            {items.map(({ label, value }) => (
              <Picker.Item
                key={value.toString()}
                label={label}
                value={value}
                color={colors.text}
              />
            ))}
          </Picker>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        {Platform.OS === 'ios' ? (
          <>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowSemesterPicker(true)}
            >
              <Text style={styles.pickerText}>{semester}</Text>
              <ChevronDown size={20} color={colors.text} />
            </TouchableOpacity>
            {renderIOSPicker(
              semester,
              semesters.map(s => ({ label: s, value: s })),
              showSemesterPicker,
              () => setShowSemesterPicker(false),
              onChangeSemester
            )}
          </>
        ) : (
          <Picker
            style={styles.picker}
            selectedValue={semester}
            onValueChange={onChangeSemester}
            dropdownIconColor={colors.text}
          >
            {semesters.map((s) => (
              <Picker.Item
                key={s}
                label={s}
                value={s}
                color={colors.text}
              />
            ))}
          </Picker>
        )}
      </View>

      <View style={styles.pickerContainer}>
        {Platform.OS === 'ios' ? (
          <>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowYearPicker(true)}
            >
              <Text style={styles.pickerText}>{year}</Text>
              <ChevronDown size={20} color={colors.text} />
            </TouchableOpacity>
            {renderIOSPicker(
              year,
              years.map(y => ({ label: y.toString(), value: y })),
              showYearPicker,
              () => setShowYearPicker(false),
              onChangeYear
            )}
          </>
        ) : (
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
        )}
      </View>
    </View>
  );
};

export default SemesterYearPicker;