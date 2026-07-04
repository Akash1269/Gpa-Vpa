import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, spacing, radii, statusColors } from '@/constants/theme';

type GradePickerProps = {
  value: string | null;
  onChange: (value: string | null) => void;
};

export default function GradePicker({ value, onChange }: GradePickerProps) {
  const { colors } = useTheme();
  
  const gradeOptions = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];
  const allOptions: (string | null)[] = [null, ...gradeOptions];

  const styles = StyleSheet.create({
    container: {
      padding: spacing.sm,
    },
    scrollView: {
      flexDirection: 'row',
    },
    option: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: radii.md,
      marginRight: spacing.sm,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    selectedOption: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primary,
    },
    optionText: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.lg,
      color: colors.text,
    },
    selectedOptionText: {
      color: colors.primary,
      fontFamily: fonts.semiBold,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
      >
        {allOptions.map((grade) => (
          <TouchableOpacity
            key={grade ?? 'na'}
            style={[
              styles.option,
              grade === null && { backgroundColor: value === null ? statusColors.na.bg : colors.card, borderColor: value === null ? statusColors.na.text : colors.border },
              grade !== null && value === grade && styles.selectedOption,
            ]}
            onPress={() => onChange(grade)}
          >
            <Text
              style={[
                styles.optionText,
                grade === null && { fontSize: fontSizes.sm, color: value === null ? statusColors.na.text : colors.textSecondary },
                grade !== null && value === grade && styles.selectedOptionText,
              ]}
            >
              {grade ?? 'N/A'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}