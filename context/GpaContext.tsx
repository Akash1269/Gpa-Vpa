import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course } from '@/types/course';
import { Semester } from '@/types/semester';
import { CustomScaleInput, GradingSystem, GradingSystemId } from '@/types/gradingSystem';
import { calculateSemesterGpa, calculateCumulativeGpa } from '@/utils/gpaCalculator';
import { buildCustomSystem, isCustomScaleInput, validateCustomScale } from '@/utils/customScale';
import {
  DEFAULT_GRADING_SYSTEM_ID,
  convertGpa,
  convertGradeLabel,
  getGradingSystem,
  isGradingSystemId,
} from '@/utils/gradingSystems';
import { DEFAULT_PERCENT_FORMULA, PercentFormula, isPercentFormula } from '@/utils/percentage';
import demoCourses from '@/assets/data/demo-courses.json';

// 'new' = fresh install choosing a scale; 'existing' = upgrade from a version without scales
export type GradingSystemPrompt = 'new' | 'existing' | null;
// What to do with existing grades and goals when the scale changes
export type GradingSystemSwitchMode = 'convert' | 'reset';

// Demo data is written with US grades; express it in the given scale
const demoCoursesFor = (system: GradingSystem): Course[] => {
  const us = getGradingSystem('us_4.0');
  return (demoCourses as Course[]).map((c) =>
    c.grade ? { ...c, grade: convertGradeLabel(c.grade, us, system) } : c
  );
};

type GpaContextType = {
  courses: Course[];
  semesters: Semester[];
  cumulativeGpa: number;
  totalCredits: number;
  recentCourses: Course[];
  currentSemester: Semester | null;
  inProgressSemester: Semester | null;
  lastCompletedSemester: Semester | null;
  targetCgpa: number | null;
  targetSemesterGpa: number | null;
  targetCredits: number | null;
  courseGoals: Record<string, string>;
  gradingSystem: GradingSystem;
  gradingSystemPrompt: GradingSystemPrompt;
  setGradingSystem: (id: GradingSystemId, mode?: GradingSystemSwitchMode) => void;
  customScale: CustomScaleInput | null;
  // Saves the user's own scale and switches to it. Returns an error message, or null on success.
  saveCustomScale: (input: CustomScaleInput, mode?: GradingSystemSwitchMode) => string | null;
  percentFormula: PercentFormula;
  setPercentFormula: (formula: PercentFormula) => void;
  setTargetCgpa: (value: number | null) => void;
  setTargetSemesterGpa: (value: number | null) => void;
  setTargetCredits: (value: number | null) => void;
  setCourseGoals: (goals: Record<string, string>) => void;
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
  getCourse: (id: string) => Course | undefined;
  getSemester: (id: string) => Semester | undefined;
  clearAllData: () => void;
  loadDemoData: () => void;
  lastDeletedCourse: Course | null;
  undoDelete: () => void;
  clearLastDeleted: () => void;
};

export const GpaContext = createContext<GpaContextType>({
  courses: [],
  semesters: [],
  cumulativeGpa: 0,
  totalCredits: 0,
  recentCourses: [],
  currentSemester: null,
  inProgressSemester: null,
  lastCompletedSemester: null,
  targetCgpa: null,
  targetSemesterGpa: null,
  targetCredits: null,
  courseGoals: {},
  gradingSystem: getGradingSystem(DEFAULT_GRADING_SYSTEM_ID),
  gradingSystemPrompt: null,
  setGradingSystem: () => {},
  customScale: null,
  saveCustomScale: () => null,
  percentFormula: DEFAULT_PERCENT_FORMULA,
  setPercentFormula: () => {},
  setTargetCgpa: () => {},
  setTargetSemesterGpa: () => {},
  setTargetCredits: () => {},
  setCourseGoals: () => {},
  addCourse: () => {},
  updateCourse: () => {},
  deleteCourse: () => {},
  getCourse: () => undefined,
  getSemester: () => undefined,
  clearAllData: () => {},
  loadDemoData: () => {},
  lastDeletedCourse: null,
  undoDelete: () => {},
  clearLastDeleted: () => {},
});

export const GpaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isValidCourse = (item: unknown): item is Course => {
    if (typeof item !== 'object' || item === null) return false;
    const c = item as Record<string, unknown>;
    return (
      typeof c.id === 'string' &&
      typeof c.name === 'string' &&
      typeof c.code === 'string' &&
      typeof c.credits === 'number' &&
      (typeof c.grade === 'string' || c.grade === null) &&
      typeof c.semester === 'string' &&
      typeof c.year === 'number'
    );
  };

  const [courses, setCourses] = useState<Course[]>([]);
  const [lastDeletedCourse, setLastDeletedCourse] = useState<Course | null>(null);
  const [gradingSystemId, setGradingSystemId] =
    useState<GradingSystemId>(DEFAULT_GRADING_SYSTEM_ID);
  const [gradingSystemPrompt, setGradingSystemPrompt] = useState<GradingSystemPrompt>(null);
  const [customScale, setCustomScaleState] = useState<CustomScaleInput | null>(null);
  const customSystem = useMemo(
    () => (customScale ? buildCustomSystem(customScale) : null),
    [customScale]
  );
  const gradingSystem: GradingSystem =
    gradingSystemId === 'custom' && customSystem
      ? customSystem
      : getGradingSystem(
          gradingSystemId === 'custom' ? DEFAULT_GRADING_SYSTEM_ID : gradingSystemId
        );
  const [percentFormula, setPercentFormulaState] =
    useState<PercentFormula>(DEFAULT_PERCENT_FORMULA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cumulativeGpa, setCumulativeGpa] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
  const [inProgressSemester, setInProgressSemester] = useState<Semester | null>(null);
  const [lastCompletedSemester, setLastCompletedSemester] = useState<Semester | null>(null);
  const [targetCgpa, setTargetCgpaState] = useState<number | null>(null);
  const [targetSemesterGpa, setTargetSemesterGpaState] = useState<number | null>(null);
  const [targetCredits, setTargetCreditsState] = useState<number | null>(null);
  const [courseGoals, setCourseGoalsState] = useState<Record<string, string>>({});

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      let loadedCourseCount = 0;
      try {
        const storedCourses = await AsyncStorage.getItem('courses');
        if (storedCourses) {
          const parsed = JSON.parse(storedCourses);
          if (Array.isArray(parsed) && parsed.every(isValidCourse)) {
            setCourses(parsed);
            loadedCourseCount = parsed.length;
          } else {
            console.error('Invalid course data format, resetting');
            await AsyncStorage.removeItem('courses');
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        await AsyncStorage.removeItem('courses').catch(() => {});
      }

      // Grading system: a stored choice wins; otherwise ask once. A fresh install also gets demo
      // data, but only after the choice so that it is written in the chosen scale.
      try {
        let hasValidCustomScale = false;
        const storedCustom = await AsyncStorage.getItem('@customScale');
        if (storedCustom) {
          const parsed = JSON.parse(storedCustom);
          if (isCustomScaleInput(parsed)) {
            setCustomScaleState(parsed);
            hasValidCustomScale = true;
          }
        }

        const storedSystem = await AsyncStorage.getItem('@gradingSystem');
        if (isGradingSystemId(storedSystem) && (storedSystem !== 'custom' || hasValidCustomScale)) {
          setGradingSystemId(storedSystem);
        } else {
          const hasLaunched = await AsyncStorage.getItem('@hasLaunched');
          const isFreshInstall = !hasLaunched && loadedCourseCount === 0;
          setGradingSystemPrompt(isFreshInstall ? 'new' : 'existing');
        }
      } catch (error) {
        console.error('Error loading grading system:', error);
      }

      try {
        const storedFormula = await AsyncStorage.getItem('@percentFormula');
        if (storedFormula) {
          const parsed = JSON.parse(storedFormula);
          if (isPercentFormula(parsed)) setPercentFormulaState(parsed);
        }
      } catch (error) {
        console.error('Error loading percentage formula:', error);
      }

      // Load GPA goals
      try {
        const storedTargetCgpa = await AsyncStorage.getItem('@targetCgpa');
        const storedTargetSemGpa = await AsyncStorage.getItem('@targetSemesterGpa');
        const storedTargetCredits = await AsyncStorage.getItem('@targetCredits');
        const storedCourseGoals = await AsyncStorage.getItem('@courseGoals');
        if (storedTargetCgpa) setTargetCgpaState(parseFloat(storedTargetCgpa));
        if (storedTargetSemGpa) setTargetSemesterGpaState(parseFloat(storedTargetSemGpa));
        if (storedTargetCredits) setTargetCreditsState(parseInt(storedTargetCredits));
        if (storedCourseGoals) setCourseGoalsState(JSON.parse(storedCourseGoals));
      } catch (error) {
        console.error('Error loading goals:', error);
      }

      setIsLoaded(true);
    };

    loadData();
  }, []);

  // Process courses into semesters and calculate GPAs
  useEffect(() => {
    // Group courses by semester and year
    const semesterMap = new Map<string, Course[]>();

    courses.forEach((course) => {
      const key = `${course.semester}-${course.year}`;
      if (!semesterMap.has(key)) {
        semesterMap.set(key, []);
      }
      semesterMap.get(key)!.push(course);
    });

    // Create semester objects with calculated GPAs and status
    const semestersArray: Semester[] = [];

    semesterMap.forEach((semesterCourses, key) => {
      const [semester, yearStr] = key.split('-');
      const year = parseInt(yearStr);
      const gpa = calculateSemesterGpa(semesterCourses, gradingSystem);
      const hasUngraded = semesterCourses.some((c) => c.grade === null);

      semestersArray.push({
        semester,
        year,
        courses: semesterCourses,
        gpa,
        status: hasUngraded ? 'in-progress' : 'completed',
      });
    });

    // Sort semesters by year and semester
    semestersArray.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year; // Most recent year first

      const semesterOrder = { Fall: 2, Summer: 1, Spring: 0 };
      return (
        semesterOrder[b.semester as keyof typeof semesterOrder] -
        semesterOrder[a.semester as keyof typeof semesterOrder]
      );
    });

    setSemesters(semestersArray);

    // Calculate cumulative GPA
    const cumGpa = calculateCumulativeGpa(courses, gradingSystem);
    setCumulativeGpa(cumGpa);

    // Calculate total credits
    const credits = courses.reduce((sum, course) => sum + course.credits, 0);
    setTotalCredits(credits);

    // Get recent courses (up to 5)
    const recent = [...courses]
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;

        const semesterOrder = { Fall: 2, Summer: 1, Spring: 0 };
        const aSemValue = semesterOrder[a.semester as keyof typeof semesterOrder];
        const bSemValue = semesterOrder[b.semester as keyof typeof semesterOrder];

        return bSemValue - aSemValue;
      })
      .slice(0, 5);

    setRecentCourses(recent);

    // Set current semester (most recent)
    if (semestersArray.length > 0) {
      setCurrentSemester(semestersArray[0]);
    } else {
      setCurrentSemester(null);
    }

    // Set in-progress semester (first one with ungraded courses)
    const inProgress = semestersArray.find((s) => s.status === 'in-progress') || null;
    setInProgressSemester(inProgress);

    // Set last completed semester (most recent fully graded)
    const completed = semestersArray.find((s) => s.status === 'completed') || null;
    setLastCompletedSemester(completed);
  }, [courses, gradingSystem]);

  // Save courses to storage whenever they change (only after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('courses', JSON.stringify(courses));
      } catch (error) {
        Alert.alert(
          'Save Failed',
          'Your changes could not be saved. Please make sure your device has enough storage.'
        );
      }
    };

    saveData();
  }, [courses, isLoaded]);

  const addCourse = useCallback((course: Course) => {
    setCourses((prevCourses) => [...prevCourses, course]);
  }, []);

  const updateCourse = useCallback((course: Course) => {
    setCourses((prevCourses) => prevCourses.map((c) => (c.id === course.id ? course : c)));
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setCourses((prevCourses) => {
      const courseToDelete = prevCourses.find((c) => c.id === id);
      if (courseToDelete) setLastDeletedCourse(courseToDelete);
      return prevCourses.filter((c) => c.id !== id);
    });
  }, []);

  const undoDelete = useCallback(() => {
    if (lastDeletedCourse) {
      setCourses((prev) => [...prev, lastDeletedCourse]);
      setLastDeletedCourse(null);
    }
  }, [lastDeletedCourse]);

  const clearLastDeleted = useCallback(() => {
    setLastDeletedCourse(null);
  }, []);

  const setTargetCgpa = useCallback(async (value: number | null) => {
    setTargetCgpaState(value);
    try {
      if (value !== null) {
        await AsyncStorage.setItem('@targetCgpa', value.toString());
      } else {
        await AsyncStorage.removeItem('@targetCgpa');
      }
    } catch (error) {
      Alert.alert('Save Failed', 'Could not save your goal. Please try again.');
    }
  }, []);

  const setTargetSemesterGpa = useCallback(async (value: number | null) => {
    setTargetSemesterGpaState(value);
    try {
      if (value !== null) {
        await AsyncStorage.setItem('@targetSemesterGpa', value.toString());
      } else {
        await AsyncStorage.removeItem('@targetSemesterGpa');
      }
    } catch (error) {
      Alert.alert('Save Failed', 'Could not save your goal. Please try again.');
    }
  }, []);

  const setTargetCredits = useCallback(async (value: number | null) => {
    setTargetCreditsState(value);
    try {
      if (value !== null) {
        await AsyncStorage.setItem('@targetCredits', value.toString());
      } else {
        await AsyncStorage.removeItem('@targetCredits');
      }
    } catch (error) {
      Alert.alert('Save Failed', 'Could not save your goal. Please try again.');
    }
  }, []);

  const setCourseGoals = useCallback(async (goals: Record<string, string>) => {
    setCourseGoalsState(goals);
    try {
      await AsyncStorage.setItem('@courseGoals', JSON.stringify(goals));
    } catch (error) {
      Alert.alert('Save Failed', 'Could not save your goals. Please try again.');
    }
  }, []);

  const getCourse = useCallback(
    (id: string) => {
      return courses.find((course) => course.id === id);
    },
    [courses]
  );

  const getSemester = useCallback(
    (id: string) => {
      return semesters.find((semester) => `${semester.semester}-${semester.year}` === id);
    },
    [semesters]
  );

  const clearAllData = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('courses');
      setCourses([]);
    } catch (error) {
      Alert.alert('Error', 'Could not clear data. Please try again.');
    }
  }, []);

  const loadDemoData = useCallback(() => {
    setCourses(demoCoursesFor(gradingSystem));
  }, [gradingSystem]);

  const setPercentFormula = useCallback((formula: PercentFormula) => {
    setPercentFormulaState(formula);
    AsyncStorage.setItem('@percentFormula', JSON.stringify(formula)).catch(() => {});
  }, []);

  const applySystem = useCallback(
    (to: GradingSystem, mode: GradingSystemSwitchMode) => {
      const from = gradingSystem;

      AsyncStorage.setItem('@gradingSystem', to.id).catch(() => {});
      setGradingSystemPrompt(null);
      setLastDeletedCourse(null); // an undo would bring back a grade from the old scale

      if (gradingSystemPrompt === 'new') {
        AsyncStorage.setItem('@hasLaunched', 'true').catch(() => {});
        setGradingSystemId(to.id);
        setCourses(demoCoursesFor(to));
        return;
      }

      if (to.id === from.id) return;
      setGradingSystemId(to.id);

      // A degree-credit goal that is still the old scale's default follows the new scale's default
      if (targetCredits === from.degreeCredits) setTargetCredits(to.degreeCredits);

      if (mode === 'reset') {
        setCourses([]);
        setTargetCgpa(null);
        setTargetSemesterGpa(null);
        setCourseGoals({});
        return;
      }

      // Convert by closest equivalent, so a "3.5/4.0" goal becomes "8.75/10"
      setCourses((prev) =>
        prev.map((c) => (c.grade ? { ...c, grade: convertGradeLabel(c.grade, from, to) } : c))
      );
      if (targetCgpa !== null) setTargetCgpa(convertGpa(targetCgpa, from, to));
      if (targetSemesterGpa !== null) {
        setTargetSemesterGpa(convertGpa(targetSemesterGpa, from, to));
      }
      setCourseGoals(
        Object.fromEntries(
          Object.entries(courseGoals).map(([courseId, grade]) => [
            courseId,
            convertGradeLabel(grade, from, to),
          ])
        )
      );
    },
    [
      gradingSystem,
      gradingSystemPrompt,
      targetCgpa,
      targetSemesterGpa,
      targetCredits,
      courseGoals,
      setTargetCgpa,
      setTargetSemesterGpa,
      setTargetCredits,
      setCourseGoals,
    ]
  );

  const setGradingSystem = useCallback(
    (id: GradingSystemId, mode: GradingSystemSwitchMode = 'convert') => {
      const to = id === 'custom' ? customSystem : getGradingSystem(id);
      if (to) applySystem(to, mode);
    },
    [customSystem, applySystem]
  );

  const saveCustomScale = useCallback(
    (input: CustomScaleInput, mode: GradingSystemSwitchMode = 'convert'): string | null => {
      const error = validateCustomScale(input);
      if (error) return error;
      const system = buildCustomSystem(input);

      if (gradingSystem.id === 'custom') {
        // Editing the scale in use: a grade that disappears would silently count as 0 points
        const kept = new Set(system.grades.map((g) => g.label));
        const used = new Set<string>(Object.values(courseGoals));
        courses.forEach((c) => c.grade && used.add(c.grade));
        const missing = [...used].filter((label) => !kept.has(label));
        if (missing.length > 0) {
          return `Your courses or goals still use ${missing.map((m) => `"${m}"`).join(', ')}. Keep those grades in the table, or change those courses first.`;
        }
      }

      AsyncStorage.setItem('@customScale', JSON.stringify(input)).catch(() => {});
      setCustomScaleState(input);
      if (gradingSystem.id !== 'custom') applySystem(system, mode);
      return null;
    },
    [gradingSystem, courses, courseGoals, applySystem]
  );

  return (
    <GpaContext.Provider
      value={{
        courses,
        semesters,
        cumulativeGpa,
        totalCredits,
        recentCourses,
        currentSemester,
        inProgressSemester,
        lastCompletedSemester,
        targetCgpa,
        targetSemesterGpa,
        targetCredits,
        courseGoals,
        gradingSystem,
        gradingSystemPrompt,
        setGradingSystem,
        customScale,
        saveCustomScale,
        percentFormula,
        setPercentFormula,
        setTargetCgpa,
        setTargetSemesterGpa,
        setTargetCredits,
        setCourseGoals,
        addCourse,
        updateCourse,
        deleteCourse,
        getCourse,
        getSemester,
        clearAllData,
        loadDemoData,
        lastDeletedCourse,
        undoDelete,
        clearLastDeleted,
      }}
    >
      {children}
    </GpaContext.Provider>
  );
};
