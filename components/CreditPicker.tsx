import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, spacing, radii } from '@/constants/theme';

type CreditPickerProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function CreditPicker({ value, onChange }: CreditPickerProps) {
  const { colors } = useTheme();

  const creditOptions = [1, 2, 3, 4];

  const styles = StyleSheet.create({
    container: {
      padding: spacing.sm,
    },
    optionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    option: {
      flex: 1,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: radii.md,
      marginHorizontal: spacing.xs,
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
      <View style={styles.optionsContainer}>
        {creditOptions.map((credit) => (
          <TouchableOpacity
            key={credit}
            style={[styles.option, value === credit && styles.selectedOption]}
            onPress={() => onChange(credit)}
          >
            <Text style={[styles.optionText, value === credit && styles.selectedOptionText]}>
              {credit}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
