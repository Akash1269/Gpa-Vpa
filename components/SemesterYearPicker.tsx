import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal, FlatList, Pressable } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
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

function DropdownSelect<T extends string | number>({
  value,
  options,
  onSelect,
  label,
}: {
  value: T;
  options: T[];
  onSelect: (val: T) => void;
  label: string;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 48,
          paddingHorizontal: 14,
          backgroundColor: colors.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
        onPress={() => setOpen(!open)}
        accessibilityLabel={`${label}: ${value}`}
      >
        <Text style={{ fontFamily: 'Inter-Medium', fontSize: 15, color: colors.text }}>
          {String(value)}
        </Text>
        <ChevronDown size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      {open && (
        <View style={{
          position: 'absolute',
          top: 52,
          left: 0,
          right: 0,
          backgroundColor: colors.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          zIndex: 100,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          maxHeight: 200,
          overflow: 'hidden',
        }}>
          {options.map((option, idx) => (
            <TouchableOpacity
              key={String(option)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 14,
                backgroundColor: option === value ? colors.primary + '12' : 'transparent',
                borderBottomWidth: idx < options.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
              onPress={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              <Text style={{
                fontFamily: option === value ? 'Inter-SemiBold' : 'Inter-Regular',
                fontSize: 15,
                color: option === value ? colors.primary : colors.text,
              }}>
                {String(option)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const SemesterYearPicker: React.FC<SemesterYearPickerProps> = ({
  semester,
  year,
  onChangeSemester,
  onChangeYear,
}) => {
  return (
    <View style={{ flexDirection: 'row', gap: 12, zIndex: 10 }}>
      <DropdownSelect
        value={semester}
        options={semesters}
        onSelect={onChangeSemester}
        label="Semester"
      />
      <DropdownSelect
        value={year}
        options={years}
        onSelect={onChangeYear}
        label="Year"
      />
    </View>
  );
};

export default SemesterYearPicker;
