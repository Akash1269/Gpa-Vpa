import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type GradePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function GradePicker({ value, onChange }: GradePickerProps) {
  const { colors } = useTheme();
  
  const gradeOptions = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

  const styles = StyleSheet.create({
    container: {
      padding: 8,
    },
    scrollView: {
      flexDirection: 'row',
    },
    option: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      marginRight: 8,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    selectedOption: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primary,
    },
    optionText: {
      fontFamily: 'Inter-Medium',
      fontSize: 16,
      color: colors.text,
    },
    selectedOptionText: {
      color: colors.primary,
      fontFamily: 'Inter-SemiBold',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
      >
        {gradeOptions.map((grade) => (
          <TouchableOpacity
            key={grade}
            style={[
              styles.option,
              value === grade && styles.selectedOption,
            ]}
            onPress={() => onChange(grade)}
          >
            <Text
              style={[
                styles.optionText,
                value === grade && styles.selectedOptionText,
              ]}
            >
              {grade}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}