import { StyleSheet, View, Text } from 'react-native';
import { BookOpen, ChartBar as BarChart3, BookPlus } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
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
      padding: 24,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 20,
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    message: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
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