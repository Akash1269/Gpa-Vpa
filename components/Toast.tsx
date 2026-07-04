import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { fonts, fontSizes, spacing, radii } from '@/constants/theme';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

type ToastProps = {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
  duration?: number;
};

export default function Toast({ message, visible, onDismiss, action, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      exiting={FadeOutDown.duration(200)}
      style={styles.container}
    >
      <Text style={styles.message}>{message}</Text>
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <Text style={styles.actionText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: '#323232',
    borderRadius: radii.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  message: {
    color: '#FFFFFF',
    fontSize: fontSizes.md,
    fontFamily: fonts.medium,
    flex: 1,
  },
  actionButton: {
    marginLeft: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actionText: {
    color: '#8AB4F8',
    fontSize: fontSizes.md,
    fontFamily: fonts.semiBold,
    textTransform: 'uppercase',
  },
});
