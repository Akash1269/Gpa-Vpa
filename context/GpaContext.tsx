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
});

export const GpaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
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
          setCourses(JSON.parse(storedCourses));
        }
      } catch (error) {
        console.error('Error loading data:', error);
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
    setCourses(prevCourses => prevCourses.filter(c => c.id !== id));
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
      console.error('Error clearing data:', error);
    }
  }, []);

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
      }}
    >
      {children}
    </GpaContext.Provider>
  );
};