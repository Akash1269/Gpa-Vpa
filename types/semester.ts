import { Course } from './course';

export type Semester = {
  semester: string;
  year: number;
  courses: Course[];
  gpa: number;
};