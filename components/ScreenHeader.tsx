import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

type ScreenHeaderProps = {
  title: string;
  showBorder?: boolean;
  rightElement?: React.ReactNode;
};

export default function ScreenHeader({ title, showBorder = true, rightElement }: ScreenHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, borderBottomColor: colors.border, borderBottomWidth: showBorder ? 1 : 0 }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
        <ArrowLeft size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {rightElement ? rightElement : <View style={styles.placeholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginLeft: 12,
  },
  placeholder: {
    width: 36,
  },
});
