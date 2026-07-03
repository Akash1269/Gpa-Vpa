export type Course = {
  id: string;
  name: string;
  code: string;
  credits: number;
  grade: string | null;
  semester: string;
  year: number;
};