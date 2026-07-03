import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

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
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
  },
  textActive: {
    color: '#FFFFFF',
  },
});
