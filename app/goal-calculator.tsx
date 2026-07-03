import { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { useGpa } from '@/hooks/useGpa';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft, Target, GraduationCap, TrendingUp, Plus, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gradePoints } from '@/utils/gpaCalculator';
import Animated, { FadeInDown } from 'react-native-reanimated';

type PlannedCourse = {
  id: string;
  name: string;
  credits: number;
};

type Tab = 'semester' | 'cumulative' | 'graduation';

export default function GoalCalculatorScreen() {
  const { colors } = useTheme();
  const { cumulativeGpa, totalCredits, courses, semesters } = useGpa();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<Tab>('semester');

  // Semester goal state
  const [semesterTargetGpa, setSemesterTargetGpa] = useState('3.5');
  const [plannedCourses, setPlannedCourses] = useState<PlannedCourse[]>([
    { id: '1', name: 'Course 1', credits: 3 },
    { id: '2', name: 'Course 2', credits: 3 },
  ]);

  // Cumulative goal state
  const [cumulativeTargetGpa, setCumulativeTargetGpa] = useState('3.5');
  const [remainingSemesters, setRemainingSemesters] = useState('2');
  const [futureSemesterCredits, setFutureSemesterCredits] = useState('15');

  // Graduation state
  const [graduationCredits, setGraduationCredits] = useState('120');
  const [creditsPerSemester, setCreditsPerSemester] = useState('15');

  // Compute average credits per semester from past data
  const avgCreditsPerSemester = useMemo(() => {
    if (semesters.length === 0) return 15;
    return Math.round(totalCredits / semesters.length);
  }, [totalCredits, semesters]);

  // Semester goal calculation
  const semesterResult = useMemo(() => {
    const target = parseFloat(semesterTargetGpa);
    if (isNaN(target) || target < 0 || target > 4.0) return null;

    const totalPlannedCredits = plannedCourses.reduce((sum, c) => sum + c.credits, 0);
    if (totalPlannedCredits === 0) return null;

    const requiredPoints = target * totalPlannedCredits;
    const avgGradeNeeded = requiredPoints / totalPlannedCredits;

    // Find closest grade
    const grades = Object.entries(gradePoints).sort((a, b) => b[1] - a[1]);
    const closestGrade = grades.find(([_, val]) => val <= avgGradeNeeded) || grades[grades.length - 1];

    return {
      avgGradeNeeded,
      closestGrade: closestGrade[0],
      totalCredits: totalPlannedCredits,
      feasible: avgGradeNeeded <= 4.0,
    };
  }, [semesterTargetGpa, plannedCourses]);

  // Cumulative goal calculation (multi-semester)
  const cumulativeResult = useMemo(() => {
    const target = parseFloat(cumulativeTargetGpa);
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
      requiredGpa: requiredGpaPerSemester,
      closestGrade: closestGrade[0],
      feasible: requiredGpaPerSemester <= 4.0 && requiredGpaPerSemester >= 0,
      currentGpa: cumulativeGpa,
      currentCredits: totalCredits,
      numSemesters,
      creditsPerSem,
      totalFutureCredits,
    };
  }, [cumulativeTargetGpa, remainingSemesters, futureSemesterCredits, cumulativeGpa, totalCredits]);

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

  const addPlannedCourse = () => {
    setPlannedCourses(prev => [
      ...prev,
      { id: Date.now().toString(), name: `Course ${prev.length + 1}`, credits: 3 },
    ]);
  };

  const removePlannedCourse = (id: string) => {
    setPlannedCourses(prev => prev.filter(c => c.id !== id));
  };

  const updateCourseCredits = (id: string, credits: string) => {
    const num = parseInt(credits) || 0;
    setPlannedCourses(prev => prev.map(c => c.id === id ? { ...c, credits: num } : c));
  };

  const updateCourseName = (id: string, name: string) => {
    setPlannedCourses(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: insets.top + 8,
      paddingBottom: 12,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontFamily: 'Inter-Bold',
      fontSize: 18,
      color: colors.text,
      marginLeft: 12,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
      ...(Platform.OS === 'web' ? { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' as unknown as number } : {}),
    },
    tabRow: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 4,
      marginBottom: 20,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 10,
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontFamily: 'Inter-Medium',
      fontSize: 12,
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: '#FFFFFF',
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
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontFamily: 'Inter-Medium',
      fontSize: 14,
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
    courseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    courseNameInput: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      fontFamily: 'Inter-Regular',
      fontSize: 13,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    courseCreditInput: {
      width: 50,
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 8,
      fontFamily: 'Inter-Medium',
      fontSize: 13,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      textAlign: 'center',
      marginRight: 8,
    },
    removeButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary + '40',
      borderStyle: 'dashed',
      marginTop: 4,
    },
    addButtonText: {
      fontFamily: 'Inter-Medium',
      fontSize: 13,
      color: colors.primary,
      marginLeft: 6,
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

  const renderSemesterGoal = () => (
    <Animated.View entering={FadeInDown.duration(300)}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Target Semester GPA</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Target GPA</Text>
          <TextInput
            style={styles.input}
            value={semesterTargetGpa}
            onChangeText={setSemesterTargetGpa}
            keyboardType="decimal-pad"
            placeholder="3.5"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Planned Courses</Text>
        {plannedCourses.map(course => (
          <View key={course.id} style={styles.courseRow}>
            <TextInput
              style={styles.courseNameInput}
              value={course.name}
              onChangeText={(text) => updateCourseName(course.id, text)}
              placeholder="Course name"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={styles.courseCreditInput}
              value={course.credits > 0 ? course.credits.toString() : ''}
              onChangeText={(text) => updateCourseCredits(course.id, text)}
              keyboardType="number-pad"
              placeholder="CR"
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removePlannedCourse(course.id)}
            >
              <Trash2 size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={addPlannedCourse}>
          <Plus size={14} color={colors.primary} />
          <Text style={styles.addButtonText}>Add Course</Text>
        </TouchableOpacity>
      </View>

      {semesterResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Result</Text>
          <Text style={styles.resultValue}>{semesterResult.avgGradeNeeded.toFixed(2)}</Text>
          <Text style={styles.resultGradeHint}>
            Average {semesterResult.closestGrade} or higher per course
          </Text>

          <View style={styles.resultDivider} />
          <Text style={styles.breakdownTitle}>Breakdown</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Target semester GPA</Text>
            <Text style={styles.breakdownValue}>{semesterTargetGpa}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Total planned credits</Text>
            <Text style={styles.breakdownValue}>{semesterResult.totalCredits} CR</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Quality points needed</Text>
            <Text style={styles.breakdownValue}>{(semesterResult.avgGradeNeeded * semesterResult.totalCredits).toFixed(1)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Required avg grade point</Text>
            <Text style={styles.breakdownValue}>{semesterResult.avgGradeNeeded.toFixed(2)} / 4.0</Text>
          </View>

          {!semesterResult.feasible && (
            <Text style={styles.resultWarning}>
              ⚠️ Not achievable — maximum possible GPA is 4.0
            </Text>
          )}
        </View>
      )}
    </Animated.View>
  );

  const renderCumulativeGoal = () => (
    <Animated.View entering={FadeInDown.duration(300)}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cumulative GPA Goal</Text>
        <Text style={styles.currentGpaNote}>
          Current: {cumulativeGpa.toFixed(2)} GPA • {totalCredits} credits • {semesters.length} semester{semesters.length !== 1 ? 's' : ''} completed
        </Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Target GPA</Text>
          <TextInput
            style={styles.input}
            value={cumulativeTargetGpa}
            onChangeText={setCumulativeTargetGpa}
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
            <Text style={styles.breakdownValue}>{cumulativeTargetGpa}</Text>
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
            <Text style={styles.breakdownValue}>{(parseFloat(cumulativeTargetGpa) * (cumulativeResult.currentCredits + cumulativeResult.totalFutureCredits)).toFixed(1)}</Text>
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
    <Animated.View entering={FadeInDown.duration(300)}>
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goal Calculator</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'semester' && styles.tabActive]}
            onPress={() => setActiveTab('semester')}
          >
            <Text style={[styles.tabText, activeTab === 'semester' && styles.tabTextActive]}>Semester</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'cumulative' && styles.tabActive]}
            onPress={() => setActiveTab('cumulative')}
          >
            <Text style={[styles.tabText, activeTab === 'cumulative' && styles.tabTextActive]}>Cumulative</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'graduation' && styles.tabActive]}
            onPress={() => setActiveTab('graduation')}
          >
            <Text style={[styles.tabText, activeTab === 'graduation' && styles.tabTextActive]}>Graduation</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'semester' && renderSemesterGoal()}
        {activeTab === 'cumulative' && renderCumulativeGoal()}
        {activeTab === 'graduation' && renderGraduation()}
      </ScrollView>
    </View>
  );
}
