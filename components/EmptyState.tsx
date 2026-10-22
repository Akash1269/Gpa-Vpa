import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, spacing } from '@/constants/theme';
import Animated, { FadeIn } from 'react-native-reanimated';
import Mascot, { MascotMood } from '@/components/Mascot';

type EmptyStateProps = {
  title: string;
  message: string;
  mood?: MascotMood;
};

export default function EmptyState({ title, message, mood = 'sleepy' }: EmptyStateProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing['2xl'],
    },
    mascot: {
      marginBottom: spacing.lg,
    },
    title: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes['2xl'],
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    message: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.lg,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: 300,
    },
  });

  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(500)}>
      <View style={styles.mascot}>
        <Mascot mood={mood} size={128} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}
