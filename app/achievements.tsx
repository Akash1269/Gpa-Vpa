import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useAchievements } from '@/hooks/useAchievementQueue';
import { fonts, fontSizes, radii, spacing } from '@/constants/theme';
import ScreenHeader from '@/components/ScreenHeader';
import GradientBackground from '@/components/GradientBackground';
import Mascot from '@/components/Mascot';
import AchievementIcon from '@/components/AchievementIcon';
import { Achievement } from '@/utils/achievements';

export default function AchievementsScreen() {
  const { colors } = useTheme();
  const achievements = useAchievements();
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing['3xl'],
      ...(Platform.OS === 'web'
        ? { maxWidth: 720, alignSelf: 'center' as const, width: '100%' as unknown as number }
        : {}),
    },
    summary: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radii.xl + 4,
      overflow: 'hidden',
      backgroundColor: colors.heroGradient[0],
      padding: spacing.xl,
      marginBottom: spacing.xl,
    },
    summaryText: { flex: 1 },
    summaryCount: { fontFamily: fonts.bold, fontSize: 40, color: '#FFFFFF', lineHeight: 44 },
    summaryLabel: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 2,
    },
    sectionTitle: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.lg,
      color: colors.text,
      marginBottom: spacing.md,
      marginTop: spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Achievements" />
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.summary}>
          <GradientBackground colors={colors.heroGradient} />
          <View style={styles.summaryText}>
            <Text style={styles.summaryCount}>
              {unlocked.length}
              <Text style={{ fontSize: 22, color: 'rgba(255,255,255,0.7)' }}>
                {' '}
                / {achievements.length}
              </Text>
            </Text>
            <Text style={styles.summaryLabel}>achievements unlocked</Text>
          </View>
          <Mascot mood={unlocked.length > 0 ? 'cheer' : 'sleepy'} size={96} />
        </Animated.View>

        {unlocked.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Unlocked</Text>
            {unlocked.map((a, i) => (
              <AchievementRow key={a.id} achievement={a} index={i} />
            ))}
          </>
        )}

        {locked.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Still to unlock</Text>
            {locked.map((a, i) => (
              <AchievementRow key={a.id} achievement={a} index={unlocked.length + i} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function AchievementRow({ achievement, index }: { achievement: Achievement; index: number }) {
  const { colors } = useTheme();
  const { unlocked, progress } = achievement;
  const share =
    progress && progress.target > 0 ? Math.min(1, progress.current / progress.target) : 0;

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: unlocked ? colors.accent : colors.border,
      padding: spacing.lg,
      marginBottom: spacing.sm,
      opacity: unlocked ? 1 : 0.85,
    },
    iconWrap: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: unlocked ? colors.accent : colors.background,
      borderWidth: unlocked ? 0 : 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    body: { flex: 1 },
    title: { fontFamily: fonts.semiBold, fontSize: fontSizes.lg, color: colors.text },
    description: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    track: {
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.border,
      marginTop: spacing.sm,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 3,
      backgroundColor: colors.primary,
      width: `${share * 100}%`,
    },
    progressText: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginTop: 3,
    },
  });

  // The entrance animation lives on a wrapper so it cannot clash with the row's own opacity
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50).duration(350)}>
      <View
        style={styles.row}
        accessible
        accessibilityLabel={`${achievement.title}, ${unlocked ? 'unlocked' : 'locked'}. ${achievement.description}`}
      >
        <View style={styles.iconWrap}>
          <AchievementIcon
            name={achievement.icon}
            color={unlocked ? colors.onAccent : colors.textSecondary}
          />
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>{achievement.title}</Text>
          <Text style={styles.description}>{achievement.description}</Text>
          {!unlocked && progress && (
            <>
              <View style={styles.track}>
                <View style={styles.fill} />
              </View>
              <Text style={styles.progressText}>
                {Number(progress.current.toFixed(2))} of {Number(progress.target.toFixed(2))}
              </Text>
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
