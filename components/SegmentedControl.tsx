import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { fonts, radii } from '@/constants/theme';

type SegmentedControlProps = {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
};

export default function SegmentedControl({ options, selected, onChange }: SegmentedControlProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]} accessibilityRole="tablist">
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.button, selected === option && { backgroundColor: colors.primary }]}
          onPress={() => onChange(option)}
          accessibilityRole="tab"
          accessibilityState={{ selected: selected === option }}
          accessibilityLabel={option}
        >
          <Text style={[styles.text, { color: colors.textSecondary }, selected === option && styles.textActive]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radii.lg,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  textActive: {
    color: '#FFFFFF',
  },
});
