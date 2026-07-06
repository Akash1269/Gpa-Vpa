import { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useGpa } from '@/hooks/useGpa';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, spacing, radii, statusColors } from '@/constants/theme';
import { gradePoints } from '@/utils/gpaCalculator';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Target, GraduationCap, TrendingUp, ChevronRight } from 'lucide-react-native';

type Tab = 'gpa' | 'graduation';

export default function GoalsScreen() {
  const { colors } = useTheme();
  const {
    cumulativeGpa,
    totalCredits,
    semesters,
    targetCgpa,
    setTargetCgpa,
    targetCredits,
    setTargetCredits,
    inProgressSemester,
  } = useGpa();
  const [activeTab, setActiveTab] = useState<Tab>('gpa');

  // Cumulative goal state
  const [cumulativeTargetGpaInput, setCumulativeTargetGpaInput] = useState(
    targetCgpa?.toString() ?? '3.5'
  );
  const [remainingSemesters, setRemainingSemesters] = useState('2');
  const [futureSemesterCredits, setFutureSemesterCredits] = useState('15');

  // Graduation state
  const [graduationCredits, setGraduationCredits] = useState(targetCredits?.toString() ?? '120');
  const [creditsPerSemester, setCreditsPerSemester] = useState('15');

  // Compute average credits per semester from past data
  const avgCreditsPerSemester = useMemo(() => {
    if (semesters.length === 0) return 15;
    return Math.round(totalCredits / semesters.length);
  }, [totalCredits, semesters]);

  // Cumulative goal calculation (multi-semester)
  const cumulativeResult = useMemo(() => {
    const target = parseFloat(cumulativeTargetGpaInput);
    const numSemesters = parseInt(remainingSemesters);
    const creditsPerSem = parseInt(futureSemesterCredits);
    if (
      isNaN(target) ||
      isNaN(numSemesters) ||
      isNaN(creditsPerSem) ||
      target < 0 ||
      target > 4.0 ||
      numSemesters <= 0 ||
      creditsPerSem <= 0
    )
      return null;

    const totalFutureCredits = numSemesters * creditsPerSem;
    const currentPoints = cumulativeGpa * totalCredits;
    const totalNeeded = target * (totalCredits + totalFutureCredits);
    const requiredGpaPerSemester = (totalNeeded - currentPoints) / totalFutureCredits;

    const grades = Object.entries(gradePoints).sort((a, b) => b[1] - a[1]);
    const closestGrade =
      grades.find(([_, val]) => val <= requiredGpaPerSemester) || grades[grades.length - 1];

    return {
      target,
      requiredGpa: requiredGpaPerSemester,
      closestGrade: closestGrade[0],
      feasible: requiredGpaPerSemester <= 4.0 && requiredGpaPerSemester >= 0,
      currentGpa: cumulativeGpa,
      currentCredits: totalCredits,
      numSemesters,
      creditsPerSem,
      totalFutureCredits,
    };
  }, [
    cumulativeTargetGpaInput,
    remainingSemesters,
    futureSemesterCredits,
    cumulativeGpa,
    totalCredits,
  ]);

  // Persist cumulative goal after render
  useEffect(() => {
    if (cumulativeResult) setTargetCgpa(cumulativeResult.target);
  }, [cumulativeResult, setTargetCgpa]);

  // Graduation progress
  const graduationResult = useMemo(() => {
    const target = parseInt(graduationCredits);
    const perSem = parseInt(creditsPerSemester) || avgCreditsPerSemester;
    if (isNaN(target) || target <= 0 || perSem <= 0) return null;

    const remaining = Math.max(0, target - totalCredits);
    const semestersLeft = remaining > 0 ? Math.ceil(remaining / perSem) : 0;
    const semestersCompleted = semesters.length;
    const progress = Math.min(1, totalCredits / target);

    return {
      target,
      earned: totalCredits,
      remaining,
      semestersLeft,
      semestersCompleted,
      totalSemesters: semestersCompleted + semestersLeft,
      progress,
      avgCredits: avgCreditsPerSemester,
    };
  }, [
    graduationCredits,
    creditsPerSemester,
    totalCredits,
    semesters.length,
    avgCreditsPerSemester,
  ]);

  // Persist credits goal after render
  useEffect(() => {
    if (graduationResult) setTargetCredits(graduationResult.target);
  }, [graduationResult, setTargetCredits]);

  const gpaProgress = useMemo(() => {
    const target = parseFloat(cumulativeTargetGpaInput);
    if (isNaN(target) || target <= 0) return 0;
    return Math.min(1, cumulativeGpa / target);
  }, [cumulativeGpa, cumulativeTargetGpaInput]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: 100,
      ...(Platform.OS === 'web'
        ? { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' as unknown as number }
        : {}),
    },
    // Tab switcher
    tabRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.xl,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      borderRadius: radii.lg,
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    tabActive: {
      backgroundColor: colors.primary + '12',
      borderColor: colors.primary,
    },
    tabText: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: colors.textSecondary,
    },
    tabTextActive: {
      fontFamily: fonts.semiBold,
      color: colors.primary,
    },
    // Summary banner
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: radii.xl,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    summaryLeft: {
      flex: 1,
    },
    summaryLabel: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    summaryValue: {
      fontFamily: fonts.bold,
      fontSize: fontSizes['3xl'],
      color: colors.text,
      marginTop: spacing.xs,
    },
    summaryTarget: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.md,
      color: colors.textSecondary,
      marginTop: 2,
    },
    progressRing: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 6,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressRingText: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.md,
      color: colors.primary,
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
      marginTop: spacing.lg,
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    // Input section
    inputSection: {
      backgroundColor: colors.card,
      borderRadius: radii.xl,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputSectionTitle: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.lg,
      color: colors.text,
      marginBottom: spacing.lg,
    },
    inputGroup: {
      marginBottom: spacing.md,
    },
    inputLabel: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs + 2,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    input: {
      height: 48,
      backgroundColor: colors.background,
      borderRadius: radii.md,
      paddingHorizontal: spacing.lg,
      fontFamily: fonts.medium,
      fontSize: fontSizes.lg,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputFocused: {
      borderColor: colors.primary,
    },
    // Result card
    resultCard: {
      borderRadius: radii.xl,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      borderWidth: 1,
    },
    resultHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    resultIconBg: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    resultTitle: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.md,
      color: colors.text,
    },
    resultHero: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
    },
    resultHeroValue: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.hero,
    },
    resultHeroLabel: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      marginTop: spacing.xs,
    },
    resultDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.lg,
    },
    // Stats grid
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    statItem: {
      flex: 1,
      minWidth: '45%' as unknown as number,
      backgroundColor: colors.background,
      borderRadius: radii.md,
      padding: spacing.md,
    },
    statValue: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.xl,
      color: colors.text,
    },
    statLabel: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    // Warning
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF3E0',
      borderRadius: radii.md,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    warningText: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.sm,
      color: '#E65100',
      marginLeft: spacing.sm,
      flex: 1,
    },
    // Semester goals link
    semesterLink: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radii.xl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.lg,
    },
    semesterLinkIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    semesterLinkText: {
      flex: 1,
    },
    semesterLinkTitle: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.md,
      color: colors.text,
    },
    semesterLinkSubtitle: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });

  const renderCumulativeGoal = () => {
    const isFeasible = cumulativeResult?.feasible ?? true;
    const resultColor = isFeasible ? colors.primary : colors.error;
    const progressPercent = Math.round(gpaProgress * 100);

    return (
      <>
        {/* Summary Banner */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <Text style={styles.summaryLabel}>Current GPA</Text>
                <Text style={styles.summaryValue}>{cumulativeGpa.toFixed(2)}</Text>
                <Text style={styles.summaryTarget}>Target: {cumulativeTargetGpaInput || '—'}</Text>
              </View>
              <View style={[styles.progressRing, { borderColor: colors.border }]}>
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      borderRadius: 36,
                      borderWidth: 6,
                      borderColor: resultColor,
                      borderTopColor: gpaProgress >= 0.25 ? resultColor : 'transparent',
                      borderRightColor: gpaProgress >= 0.5 ? resultColor : 'transparent',
                      borderBottomColor: gpaProgress >= 0.75 ? resultColor : 'transparent',
                      borderLeftColor: gpaProgress >= 1 ? resultColor : 'transparent',
                    },
                  ]}
                />
                <Text style={[styles.progressRingText, { color: resultColor }]}>
                  {progressPercent}%
                </Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercent}%`, backgroundColor: resultColor },
                ]}
              />
            </View>
          </View>
        </Animated.View>

        {/* Input Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={styles.inputSection}>
            <Text style={styles.inputSectionTitle}>Plan Your Path</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target GPA</Text>
              <TextInput
                style={[
                  styles.input,
                  cumulativeTargetGpaInput !== '' &&
                  (parseFloat(cumulativeTargetGpaInput) > 4.0 ||
                    parseFloat(cumulativeTargetGpaInput) < 0)
                    ? { borderColor: colors.error }
                    : {},
                ]}
                value={cumulativeTargetGpaInput}
                onChangeText={setCumulativeTargetGpaInput}
                keyboardType="decimal-pad"
                placeholder="3.5"
                placeholderTextColor={colors.textSecondary}
                maxLength={4}
              />
              {cumulativeTargetGpaInput !== '' &&
                (parseFloat(cumulativeTargetGpaInput) > 4.0 ||
                  parseFloat(cumulativeTargetGpaInput) < 0) && (
                  <Text
                    style={{
                      fontFamily: fonts.medium,
                      fontSize: 12,
                      color: colors.error,
                      marginTop: 4,
                    }}
                  >
                    GPA must be between 0.0 and 4.0
                  </Text>
                )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Semesters Remaining</Text>
              <TextInput
                style={styles.input}
                value={remainingSemesters}
                onChangeText={setRemainingSemesters}
                keyboardType="number-pad"
                placeholder="2"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={[styles.inputGroup, { marginBottom: 0 }]}>
              <Text style={styles.inputLabel}>Credits per Semester</Text>
              <TextInput
                style={styles.input}
                value={futureSemesterCredits}
                onChangeText={setFutureSemesterCredits}
                keyboardType="number-pad"
                placeholder={avgCreditsPerSemester.toString()}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
        </Animated.View>

        {/* Result */}
        {cumulativeResult && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <View
              style={[
                styles.resultCard,
                { backgroundColor: resultColor + '08', borderColor: resultColor + '25' },
              ]}
            >
              <View style={styles.resultHeader}>
                <View style={[styles.resultIconBg, { backgroundColor: resultColor + '15' }]}>
                  <TrendingUp size={18} color={resultColor} />
                </View>
                <Text style={styles.resultTitle}>Required GPA Each Semester</Text>
              </View>

              <View style={styles.resultHero}>
                <Text style={[styles.resultHeroValue, { color: resultColor }]}>
                  {cumulativeResult.requiredGpa.toFixed(2)}
                </Text>
                <Text style={[styles.resultHeroLabel, { color: colors.textSecondary }]}>
                  Avg. {cumulativeResult.closestGrade} or higher
                </Text>
              </View>

              {!isFeasible && (
                <View style={styles.warningBanner}>
                  <Text style={styles.warningText}>
                    {cumulativeResult.requiredGpa > 4.0
                      ? 'Not achievable — try adding more semesters or lowering your target'
                      : 'Your current GPA already exceeds this target!'}
                  </Text>
                </View>
              )}

              <View style={styles.resultDivider} />

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{cumulativeResult.currentCredits}</Text>
                  <Text style={styles.statLabel}>Credits earned</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{cumulativeResult.totalFutureCredits}</Text>
                  <Text style={styles.statLabel}>Credits planned</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{cumulativeResult.numSemesters}</Text>
                  <Text style={styles.statLabel}>Semesters left</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {(cumulativeResult.requiredGpa * cumulativeResult.totalFutureCredits).toFixed(
                      0
                    )}
                  </Text>
                  <Text style={styles.statLabel}>Points needed</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Semester Goals Link */}
        {inProgressSemester && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <TouchableOpacity
              style={styles.semesterLink}
              onPress={() => router.push('/semester-goal')}
              accessibilityLabel="Set semester course goals"
            >
              <View style={[styles.semesterLinkIcon, { backgroundColor: statusColors.goal.bg }]}>
                <Target size={20} color={statusColors.goal.text} />
              </View>
              <View style={styles.semesterLinkText}>
                <Text style={styles.semesterLinkTitle}>Semester Course Goals</Text>
                <Text style={styles.semesterLinkSubtitle}>
                  Set target grades for {inProgressSemester.courses.length} in-progress courses
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </>
    );
  };

  const renderGraduation = () => {
    const progress = graduationResult?.progress ?? 0;
    const progressPercent = Math.round(progress * 100);
    const isComplete = progress >= 1;
    const progressColor = isComplete ? statusColors.completed.text : colors.primary;

    return (
      <>
        {/* Summary Banner */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <Text style={styles.summaryLabel}>Credits Earned</Text>
                <Text style={styles.summaryValue}>{totalCredits}</Text>
                <Text style={styles.summaryTarget}>of {graduationCredits || '—'} required</Text>
              </View>
              <View style={[styles.progressRing, { borderColor: colors.border }]}>
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      borderRadius: 36,
                      borderWidth: 6,
                      borderColor: progressColor,
                      borderTopColor: progress >= 0.25 ? progressColor : 'transparent',
                      borderRightColor: progress >= 0.5 ? progressColor : 'transparent',
                      borderBottomColor: progress >= 0.75 ? progressColor : 'transparent',
                      borderLeftColor: progress >= 1 ? progressColor : 'transparent',
                    },
                  ]}
                />
                <Text style={[styles.progressRingText, { color: progressColor }]}>
                  {progressPercent}%
                </Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercent}%`, backgroundColor: progressColor },
                ]}
              />
            </View>
          </View>
        </Animated.View>

        {/* Input Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={styles.inputSection}>
            <Text style={styles.inputSectionTitle}>Graduation Requirements</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Total Credits Required</Text>
              <TextInput
                style={styles.input}
                value={graduationCredits}
                onChangeText={setGraduationCredits}
                keyboardType="number-pad"
                placeholder="120"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={[styles.inputGroup, { marginBottom: 0 }]}>
              <Text style={styles.inputLabel}>Credits per Semester</Text>
              <TextInput
                style={styles.input}
                value={creditsPerSemester}
                onChangeText={setCreditsPerSemester}
                keyboardType="number-pad"
                placeholder={avgCreditsPerSemester.toString()}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
        </Animated.View>

        {/* Result */}
        {graduationResult && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <View
              style={[
                styles.resultCard,
                { backgroundColor: progressColor + '08', borderColor: progressColor + '25' },
              ]}
            >
              <View style={styles.resultHeader}>
                <View style={[styles.resultIconBg, { backgroundColor: progressColor + '15' }]}>
                  <GraduationCap size={18} color={progressColor} />
                </View>
                <Text style={styles.resultTitle}>
                  {isComplete ? '🎓 Ready to Graduate!' : 'Graduation Timeline'}
                </Text>
              </View>

              {!isComplete && (
                <View style={styles.resultHero}>
                  <Text style={[styles.resultHeroValue, { color: progressColor }]}>
                    {graduationResult.semestersLeft}
                  </Text>
                  <Text style={[styles.resultHeroLabel, { color: colors.textSecondary }]}>
                    semester{graduationResult.semestersLeft !== 1 ? 's' : ''} remaining
                  </Text>
                </View>
              )}

              <View style={styles.resultDivider} />

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{graduationResult.earned}</Text>
                  <Text style={styles.statLabel}>Credits earned</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{graduationResult.remaining}</Text>
                  <Text style={styles.statLabel}>Credits remaining</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{graduationResult.semestersCompleted}</Text>
                  <Text style={styles.statLabel}>Semesters done</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {creditsPerSemester || avgCreditsPerSemester}
                  </Text>
                  <Text style={styles.statLabel}>Credits/semester</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'gpa' && styles.tabActive]}
            onPress={() => setActiveTab('gpa')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'gpa' }}
          >
            <Target size={16} color={activeTab === 'gpa' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'gpa' && styles.tabTextActive]}>
              GPA Goal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'graduation' && styles.tabActive]}
            onPress={() => setActiveTab('graduation')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'graduation' }}
          >
            <GraduationCap
              size={16}
              color={activeTab === 'graduation' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'graduation' && styles.tabTextActive]}>
              Graduation
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'gpa' && renderCumulativeGoal()}
        {activeTab === 'graduation' && renderGraduation()}
      </ScrollView>
    </View>
  );
}
