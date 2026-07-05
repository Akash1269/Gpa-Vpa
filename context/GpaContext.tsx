import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course } from '@/types/course';
import { Semester } from '@/types/semester';
import { calculateSemesterGpa, calculateCumulativeGpa } from '@/utils/gpaCalculator';
import demoCourses from '@/assets/data/demo-courses.json';

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
  const [loadDemoOnMount, setLoadDemoOnMount] = useState(false);
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
      try {
        const storedCourses = await AsyncStorage.getItem('courses');
        if (storedCourses) {
          const parsed = JSON.parse(storedCourses);
          if (Array.isArray(parsed) && parsed.every(isValidCourse)) {
            setCourses(parsed);
          } else {
            console.error('Invalid course data format, resetting');
            await AsyncStorage.removeItem('courses');
          }
        } else {
          // First launch: load demo data so the app isn't empty
          const hasLaunched = await AsyncStorage.getItem('@hasLaunched');
          if (!hasLaunched) {
            await AsyncStorage.setItem('@hasLaunched', 'true');
            // Will be set after loadDemoData is defined
            setLoadDemoOnMount(true);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        await AsyncStorage.removeItem('courses').catch(() => {});
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
    
    courses.forEach(course => {
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
      const gpa = calculateSemesterGpa(semesterCourses);
      const hasUngraded = semesterCourses.some(c => c.grade === null);
      
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
      
      const semesterOrder = { 'Fall': 2, 'Summer': 1, 'Spring': 0 };
      return semesterOrder[b.semester as keyof typeof semesterOrder] - 
             semesterOrder[a.semester as keyof typeof semesterOrder];
    });
    
    setSemesters(semestersArray);
    
    // Calculate cumulative GPA
    const cumGpa = calculateCumulativeGpa(courses);
    setCumulativeGpa(cumGpa);
    
    // Calculate total credits
    const credits = courses.reduce((sum, course) => sum + course.credits, 0);
    setTotalCredits(credits);
    
    // Get recent courses (up to 5)
    const recent = [...courses].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      
      const semesterOrder = { 'Fall': 2, 'Summer': 1, 'Spring': 0 };
      const aSemValue = semesterOrder[a.semester as keyof typeof semesterOrder];
      const bSemValue = semesterOrder[b.semester as keyof typeof semesterOrder];
      
      return bSemValue - aSemValue;
    }).slice(0, 5);
    
    setRecentCourses(recent);
    
    // Set current semester (most recent)
    if (semestersArray.length > 0) {
      setCurrentSemester(semestersArray[0]);
    } else {
      setCurrentSemester(null);
    }

    // Set in-progress semester (first one with ungraded courses)
    const inProgress = semestersArray.find(s => s.status === 'in-progress') || null;
    setInProgressSemester(inProgress);

    // Set last completed semester (most recent fully graded)
    const completed = semestersArray.find(s => s.status === 'completed') || null;
    setLastCompletedSemester(completed);
  }, [courses]);

  // Save courses to storage whenever they change (only after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('courses', JSON.stringify(courses));
      } catch (error) {
        Alert.alert('Save Failed', 'Your changes could not be saved. Please make sure your device has enough storage.');
      }
    };
    
    saveData();
  }, [courses, isLoaded]);

  const addCourse = useCallback((course: Course) => {
    setCourses(prevCourses => [...prevCourses, course]);
  }, []);

  const updateCourse = useCallback((course: Course) => {
    setCourses(prevCourses => 
      prevCourses.map(c => c.id === course.id ? course : c)
    );
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setCourses(prevCourses => {
      const courseToDelete = prevCourses.find(c => c.id === id);
      if (courseToDelete) setLastDeletedCourse(courseToDelete);
      return prevCourses.filter(c => c.id !== id);
    });
  }, []);

  const undoDelete = useCallback(() => {
    if (lastDeletedCourse) {
      setCourses(prev => [...prev, lastDeletedCourse]);
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

  const getCourse = useCallback((id: string) => {
    return courses.find(course => course.id === id);
  }, [courses]);

  const getSemester = useCallback((id: string) => {
    return semesters.find(semester => `${semester.semester}-${semester.year}` === id);
  }, [semesters]);

  const clearAllData = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('courses');
      setCourses([]);
    } catch (error) {
      Alert.alert('Error', 'Could not clear data. Please try again.');
    }
  }, []);

  const loadDemoData = useCallback(() => {
    setCourses(demoCourses as Course[]);
  }, []);

  // Auto-load demo data on first launch
  useEffect(() => {
    if (loadDemoOnMount) {
      loadDemoData();
      setLoadDemoOnMount(false);
    }
  }, [loadDemoOnMount, loadDemoData]);

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