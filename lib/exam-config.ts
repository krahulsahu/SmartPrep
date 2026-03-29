export const DEFAULT_EXAM_SUBJECTS = {
  JEE: ['Physics', 'Chemistry', 'Mathematics'],
  SSC: ['Quantitative Aptitude', 'General Intelligence', 'English', 'General Awareness'],
  Aptitude: [
    'Arithmetic Aptitude',
    'Logical Reasoning',
    'Verbal Ability',
    'Data Interpretation',
    'General Knowledge',
  ],
  Placement: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Programming'],
} as const;

export const DEFAULT_EXAM_TYPES = Object.keys(DEFAULT_EXAM_SUBJECTS);
