import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course } from '@/types/course';
import { Semester } from '@/types/semester';
import { calculateSemesterGpa, calculateCumulativeGpa } from '@/utils/gpaCalculator';

type GpaContextType = {
  courses: Course[];
  semesters: Semester[];
  cumulativeGpa: number;
  totalCredits: number;
  recentCourses: Course[];
  currentSemester: Semester | null;
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
  getCourse: (id: string) => Course | undefined;
  getSemester: (id: string) => Semester | undefined;
  clearAllData: () => void;
  loadDemoData: () => void;
  lastDeletedCourse: Course | null;
  undoDelete: () => void;
};

export const GpaContext = createContext<GpaContextType>({
  courses: [],
  semesters: [],
  cumulativeGpa: 0,
  totalCredits: 0,
  recentCourses: [],
  currentSemester: null,
  addCourse: () => {},
  updateCourse: () => {},
  deleteCourse: () => {},
  getCourse: () => undefined,
  getSemester: () => undefined,
  clearAllData: () => {},
  loadDemoData: () => {},
  lastDeletedCourse: null,
  undoDelete: () => {},
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
      typeof c.grade === 'string' &&
      typeof c.semester === 'string' &&
      typeof c.year === 'number'
    );
  };

  const [courses, setCourses] = useState<Course[]>([]);
  const [lastDeletedCourse, setLastDeletedCourse] = useState<Course | null>(null);
  const [loadDemoOnMount, setLoadDemoOnMount] = useState(false);
  const [cumulativeGpa, setCumulativeGpa] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);

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
    
    // Create semester objects with calculated GPAs
    const semestersArray: Semester[] = [];
    
    semesterMap.forEach((semesterCourses, key) => {
      const [semester, yearStr] = key.split('-');
      const year = parseInt(yearStr);
      const gpa = calculateSemesterGpa(semesterCourses);
      
      semestersArray.push({
        semester,
        year,
        courses: semesterCourses,
        gpa,
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
  }, [courses]);

  // Save courses to storage whenever they change
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('courses', JSON.stringify(courses));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
    
    saveData();
  }, [courses]);

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
      console.error('Error clearing data:', error);
    }
  }, []);

  const loadDemoData = useCallback(() => {
    const demoCourses: Course[] = [
      // Fall 2024 - Freshman Year
      { id: 'demo-1', name: 'Introduction to CS', code: 'CS101', credits: 3, grade: 'A', semester: 'Fall', year: 2024 },
      { id: 'demo-2', name: 'Calculus I', code: 'MATH101', credits: 4, grade: 'B+', semester: 'Fall', year: 2024 },
      { id: 'demo-3', name: 'English Composition', code: 'ENG101', credits: 3, grade: 'A-', semester: 'Fall', year: 2024 },
      { id: 'demo-4', name: 'Physics I', code: 'PHY101', credits: 4, grade: 'B', semester: 'Fall', year: 2024 },
      // Spring 2025
      { id: 'demo-5', name: 'Data Structures', code: 'CS201', credits: 3, grade: 'A', semester: 'Spring', year: 2025 },
      { id: 'demo-6', name: 'Calculus II', code: 'MATH202', credits: 4, grade: 'A-', semester: 'Spring', year: 2025 },
      { id: 'demo-7', name: 'Discrete Mathematics', code: 'MATH210', credits: 3, grade: 'B+', semester: 'Spring', year: 2025 },
      { id: 'demo-8', name: 'Technical Writing', code: 'ENG210', credits: 2, grade: 'A', semester: 'Spring', year: 2025 },
      // Fall 2025 - Sophomore Year
      { id: 'demo-9', name: 'Algorithms', code: 'CS301', credits: 3, grade: 'A-', semester: 'Fall', year: 2025 },
      { id: 'demo-10', name: 'Linear Algebra', code: 'MATH301', credits: 3, grade: 'B+', semester: 'Fall', year: 2025 },
      { id: 'demo-11', name: 'Computer Architecture', code: 'CS250', credits: 3, grade: 'A', semester: 'Fall', year: 2025 },
      { id: 'demo-12', name: 'Probability & Stats', code: 'MATH320', credits: 3, grade: 'B+', semester: 'Fall', year: 2025 },
      // Spring 2026 - Current
      { id: 'demo-13', name: 'Operating Systems', code: 'CS310', credits: 3, grade: 'A-', semester: 'Spring', year: 2026 },
      { id: 'demo-14', name: 'Database Systems', code: 'CS340', credits: 3, grade: 'A', semester: 'Spring', year: 2026 },
      { id: 'demo-15', name: 'Software Engineering', code: 'CS350', credits: 3, grade: 'B+', semester: 'Spring', year: 2026 },
    ];
    setCourses(demoCourses);
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
        addCourse,
        updateCourse,
        deleteCourse,
        getCourse,
        getSemester,
        clearAllData,
        loadDemoData,
        lastDeletedCourse,
        undoDelete,
      }}
    >
      {children}
    </GpaContext.Provider>
  );
};