export type GradingSystemId = 'us_4.0' | 'india_10';

// Colour family used for a grade chip or academic standing; resolved to real colours per theme
export type GradeTone = 'green' | 'blue' | 'yellow' | 'orange' | 'red';

export type GradeOption = {
  label: string; // shown to the user: "A", "O", "B+"
  value: number; // grade points on this system's scale
  description: string;
};

export type StandingBand = {
  min: number; // lowest GPA (inclusive) that falls in this band
  label: string;
  tone: GradeTone;
};

export type GradingSystem = {
  id: GradingSystemId;
  name: string;
  country: string;
  flag: string;
  maxGpa: number;
  scaleLabel: string; // "4.0", "10": how the maximum is written next to a GPA
  defaultTargetGpa: number; // suggested CGPA goal when the user has not set one
  grades: GradeOption[]; // best to worst
  creditOptions: number[];
  degreeCredits: number; // typical credits for a bachelor's degree
  bands: StandingBand[]; // highest `min` first; the last band must have min 0
};
