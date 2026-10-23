import { useEffect } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useAchievementQueue } from '@/hooks/useAchievementQueue';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, radii, spacing } from '@/constants/theme';
import Confetti from '@/components/Confetti';
import Mascot from '@/components/Mascot';
import AchievementIcon from '@/components/AchievementIcon';

// Shows the "achievement unlocked" popup with confetti and a cheering Vee. Mount once, in the root.
export default function CelebrationHost() {
  const { colors } = useTheme();
  const { pending, dismiss } = useAchievementQueue();
  const current = pending[0];

  useEffect(() => {
    if (current)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [current?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const others = pending.length - 1;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing['2xl'],
    },
    card: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: colors.card,
      borderRadius: 24,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl,
      paddingTop: spacing.md,
      alignItems: 'center',
    },
    kicker: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.xs,
      color: colors.accentText,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginTop: spacing.sm,
    },
    badge: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.md,
    },
    title: {
      fontFamily: fonts.bold,
      fontSize: fontSizes['3xl'],
      color: colors.text,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    description: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    more: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginTop: spacing.md,
    },
    button: {
      alignSelf: 'stretch',
      height: 50,
      borderRadius: radii.lg,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    buttonText: { fontFamily: fonts.semiBold, fontSize: fontSizes.lg, color: colors.onPrimary },
    link: { marginTop: spacing.md, padding: spacing.xs },
    linkText: { fontFamily: fonts.medium, fontSize: fontSizes.md, color: colors.primary },
  });

  return (
    <Modal
      visible={!!current}
      transparent
      animationType="fade"
      onRequestClose={dismiss}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {current && (
          <>
            <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.card}>
              <Mascot mood="cheer" size={120} />
              <Text style={styles.kicker}>Achievement unlocked</Text>
              <View style={styles.badge}>
                <AchievementIcon name={current.icon} size={26} color={colors.onAccent} />
              </View>
              <Text style={styles.title}>{current.title}</Text>
              <Text style={styles.description}>{current.description}</Text>
              {others > 0 && (
                <Text style={styles.more}>
                  and {others} more {others === 1 ? 'achievement' : 'achievements'}
                </Text>
              )}
              <TouchableOpacity style={styles.button} onPress={dismiss} accessibilityRole="button">
                <Text style={styles.buttonText}>Nice!</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.link}
                onPress={() => {
                  dismiss();
                  router.push('/achievements');
                }}
                accessibilityRole="button"
              >
                <Text style={styles.linkText}>See all achievements</Text>
              </TouchableOpacity>
            </Animated.View>
            <Confetti />
          </>
        )}
      </View>
    </Modal>
  );
}
