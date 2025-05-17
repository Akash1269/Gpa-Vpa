import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type CreditPickerProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function CreditPicker({ value, onChange }: CreditPickerProps) {
  const { colors } = useTheme();
  
  const creditOptions = [1, 2, 3, 4];

  const styles = StyleSheet.create({
    container: {
      padding: 8,
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
      borderRadius: 8,
      marginHorizontal: 4,
    },
    selectedOption: {
      backgroundColor: colors.primaryLight,
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
      <View style={styles.optionsContainer}>
        {creditOptions.map((credit) => (
          <TouchableOpacity
            key={credit}
            style={[
              styles.option,
              value === credit && styles.selectedOption,
            ]}
            onPress={() => onChange(credit)}
          >
            <Text
              style={[
                styles.optionText,
                value === credit && styles.selectedOptionText,
              ]}
            >
              {credit}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}