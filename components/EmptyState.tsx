import { StyleSheet, View, Text } from 'react-native';
import { BookOpen, ChartBar as BarChart3, BookPlus } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, spacing } from '@/constants/theme';
import Animated, { FadeIn } from 'react-native-reanimated';

type EmptyStateProps = {
  icon: 'book-open' | 'bar-chart-3' | 'book-plus';
  title: string;
  message: string;
};

export default function EmptyState({ icon, title, message }: EmptyStateProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing['2xl'],
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing['2xl'],
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

  const renderIcon = () => {
    switch (icon) {
      case 'book-open':
        return <BookOpen size={40} color={colors.primary} />;
      case 'bar-chart-3':
        return <BarChart3 size={40} color={colors.primary} />;
      case 'book-plus':
        return <BookPlus size={40} color={colors.primary} />;
      default:
        return <BookOpen size={40} color={colors.primary} />;
    }
  };

  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(500)}>
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}