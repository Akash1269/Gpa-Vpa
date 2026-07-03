import { Course } from './course';

export type SemesterStatus = 'in-progress' | 'completed';

export type Semester = {
  semester: string;
  year: number;
  courses: Course[];
  gpa: number;
  status: SemesterStatus;
};