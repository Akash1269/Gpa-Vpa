import { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useGpa } from '@/hooks/useGpa';
import { useTheme } from '@/hooks/useTheme';
import { gradePoints } from '@/utils/gpaCalculator';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '@/components/ScreenHeader';
import SegmentedControl from '@/components/SegmentedControl';

type Tab = 'cumulative' | 'graduation';

export default function GoalCalculatorScreen() {
  const { colors } = useTheme();
  const { cumulativeGpa, totalCredits, courses, semesters, targetCgpa, setTargetCgpa, targetCredits, setTargetCredits } = useGpa();
  const [activeTab, setActiveTab] = useState<Tab>('cumulative');

  // Cumulative goal state
  const [cumulativeTargetGpaInput, setCumulativeTargetGpaInput] = useState(targetCgpa?.toString() ?? '3.5');
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
    if (isNaN(target) || isNaN(numSemesters) || isNaN(creditsPerSem) || target < 0 || target > 4.0 || numSemesters <= 0 || creditsPerSem <= 0) return null;

    const totalFutureCredits = numSemesters * creditsPerSem;
    const currentPoints = cumulativeGpa * totalCredits;
    const totalNeeded = target * (totalCredits + totalFutureCredits);
    const requiredGpaPerSemester = (totalNeeded - currentPoints) / totalFutureCredits;

    const grades = Object.entries(gradePoints).sort((a, b) => b[1] - a[1]);
    const closestGrade = grades.find(([_, val]) => val <= requiredGpaPerSemester) || grades[grades.length - 1];

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
  }, [cumulativeTargetGpaInput, remainingSemesters, futureSemesterCredits, cumulativeGpa, totalCredits]);

  // Persist cumulative goal after render
  useEffect(() => {
    if (cumulativeResult) setTargetCgpa(cumulativeResult.target);
  }, [cumulativeResult]);

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
  }, [graduationCredits, creditsPerSemester, totalCredits, semesters.length, avgCreditsPerSemester]);

  // Persist credits goal after render
  useEffect(() => {
    if (graduationResult) setTargetCredits(graduationResult.target);
  }, [graduationResult]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      ...(Platform.OS === 'web' ? { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' as unknown as number } : {}),
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 15,
      color: colors.text,
      marginBottom: 12,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    inputLabel: {
      fontFamily: 'Inter-Medium',
      fontSize: 13,
      color: colors.textSecondary,
      width: 110,
    },
    input: {
      flex: 1,
      height: 48,
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resultCard: {
      backgroundColor: colors.primary + '08',
      borderRadius: 14,
      padding: 16,
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.primary + '20',
    },
    resultTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 13,
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    resultValue: {
      fontFamily: 'Inter-Bold',
      fontSize: 32,
      color: colors.primary,
      textAlign: 'center',
    },
    resultGradeHint: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors.text,
      textAlign: 'center',
      marginTop: 4,
    },
    resultDivider: {
      height: 1,
      backgroundColor: colors.primary + '20',
      marginVertical: 14,
    },
    breakdownTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 12,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    breakdownRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
    },
    breakdownLabel: {
      fontFamily: 'Inter-Regular',
      fontSize: 13,
      color: colors.textSecondary,
    },
    breakdownValue: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 13,
      color: colors.text,
    },
    resultSubtext: {
      fontFamily: 'Inter-Regular',
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    resultWarning: {
      fontFamily: 'Inter-Medium',
      fontSize: 13,
      color: colors.error,
      marginTop: 10,
      textAlign: 'center',
    },
    progressBarTrack: {
      height: 10,
      backgroundColor: colors.border,
      borderRadius: 5,
      overflow: 'hidden',
      marginTop: 12,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 5,
    },
    progressStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    progressStat: {
      alignItems: 'center',
    },
    progressStatValue: {
      fontFamily: 'Inter-Bold',
      fontSize: 18,
      color: colors.text,
    },
    progressStatLabel: {
      fontFamily: 'Inter-Regular',
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    currentGpaNote: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 12,
      fontStyle: 'italic',
    },
  });

  const renderCumulativeGoal = () => (
    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cumulative GPA Goal</Text>
        <Text style={styles.currentGpaNote}>
          Current: {cumulativeGpa.toFixed(2)} GPA • {totalCredits} credits • {semesters.length} semester{semesters.length !== 1 ? 's' : ''} completed
        </Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Target GPA</Text>
          <TextInput
            style={styles.input}
            value={cumulativeTargetGpaInput}
            onChangeText={setCumulativeTargetGpaInput}
            keyboardType="decimal-pad"
            placeholder="3.5"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Semesters Left</Text>
          <TextInput
            style={styles.input}
            value={remainingSemesters}
            onChangeText={setRemainingSemesters}
            keyboardType="number-pad"
            placeholder="2"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Credits / Semester</Text>
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

      {cumulativeResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Required GPA Per Semester</Text>
          <Text style={styles.resultValue}>{cumulativeResult.requiredGpa.toFixed(2)}</Text>
          <Text style={styles.resultGradeHint}>
            Average {cumulativeResult.closestGrade} or higher each semester
          </Text>

          <View style={styles.resultDivider} />
          <Text style={styles.breakdownTitle}>How it&apos;s calculated</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Current GPA</Text>
            <Text style={styles.breakdownValue}>{cumulativeResult.currentGpa.toFixed(2)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Credits earned so far</Text>
            <Text style={styles.breakdownValue}>{cumulativeResult.currentCredits} CR</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Quality points earned</Text>
            <Text style={styles.breakdownValue}>{(cumulativeResult.currentGpa * cumulativeResult.currentCredits).toFixed(1)}</Text>
          </View>

          <View style={[styles.resultDivider, { marginVertical: 10 }]} />
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Target cumulative GPA</Text>
            <Text style={styles.breakdownValue}>{cumulativeTargetGpaInput}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Semesters remaining</Text>
            <Text style={styles.breakdownValue}>{cumulativeResult.numSemesters}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Future credits planned</Text>
            <Text style={styles.breakdownValue}>{cumulativeResult.totalFutureCredits} CR</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Total points needed</Text>
            <Text style={styles.breakdownValue}>{(parseFloat(cumulativeTargetGpaInput) * (cumulativeResult.currentCredits + cumulativeResult.totalFutureCredits)).toFixed(1)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Points still needed</Text>
            <Text style={styles.breakdownValue}>{(cumulativeResult.requiredGpa * cumulativeResult.totalFutureCredits).toFixed(1)}</Text>
          </View>

          {!cumulativeResult.feasible && (
            <Text style={styles.resultWarning}>
              {cumulativeResult.requiredGpa > 4.0
                ? '⚠️ Not achievable — try adding more semesters or lowering your target'
                : '⚠️ Your current GPA already exceeds this target'}
            </Text>
          )}
        </View>
      )}
    </Animated.View>
  );

  const renderGraduation = () => (
    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Graduation Requirements</Text>
        <Text style={styles.currentGpaNote}>
          Your avg: {avgCreditsPerSemester} credits/semester over {semesters.length} semester{semesters.length !== 1 ? 's' : ''}
        </Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Credits Required</Text>
          <TextInput
            style={styles.input}
            value={graduationCredits}
            onChangeText={setGraduationCredits}
            keyboardType="number-pad"
            placeholder="120"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Credits / Semester</Text>
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

      {graduationResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>
            {graduationResult.remaining > 0 ? 'Progress to Graduation' : '🎓 Ready to Graduate!'}
          </Text>

          <Text style={styles.resultValue}>{Math.round(graduationResult.progress * 100)}%</Text>
          <Text style={styles.resultGradeHint}>
            {graduationResult.earned} / {graduationResult.target} credits
          </Text>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${graduationResult.progress * 100}%` }]} />
          </View>

          <View style={styles.resultDivider} />
          <Text style={styles.breakdownTitle}>Details</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Credits earned</Text>
            <Text style={styles.breakdownValue}>{graduationResult.earned} CR</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Credits remaining</Text>
            <Text style={styles.breakdownValue}>{graduationResult.remaining} CR</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Semesters completed</Text>
            <Text style={styles.breakdownValue}>{graduationResult.semestersCompleted}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Semesters remaining</Text>
            <Text style={styles.breakdownValue}>{graduationResult.semestersLeft}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Estimated total semesters</Text>
            <Text style={styles.breakdownValue}>{graduationResult.totalSemesters}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Credits per semester</Text>
            <Text style={styles.breakdownValue}>{creditsPerSemester || avgCreditsPerSemester} CR</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="GPA Planner" />

      <ScrollView contentContainerStyle={styles.content}>
        <SegmentedControl
          options={['Cumulative', 'Graduation']}
          selected={activeTab === 'cumulative' ? 'Cumulative' : 'Graduation'}
          onChange={(val) => setActiveTab(val === 'Cumulative' ? 'cumulative' : 'graduation')}
        />

        {activeTab === 'cumulative' && renderCumulativeGoal()}
        {activeTab === 'graduation' && renderGraduation()}
      </ScrollView>
    </View>
  );
}
