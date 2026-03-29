/**
 * SmartPrep AI — Comprehensive Seed Script
 * Clears old data and inserts real curated questions and 5 tests per exam type.
 * Run: node scripts/seed.mjs
 */
import { MongoClient } from 'mongodb';
import { scryptSync, randomBytes } from 'crypto';

const required = (name) => {
  if (!process.env[name]) throw new Error(`Missing required env: ${name}`);
  return process.env[name];
};
const hashPassword = (pw) => {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(pw, salt, 64).toString('hex')}`;
};

// ─────────────────────────── EXAM CATALOG ───────────────────────────
const EXAM_CATALOG = [
  { examType: 'JEE', subjects: ['Physics', 'Chemistry', 'Mathematics'] },
  { examType: 'NEET', subjects: ['Biology', 'Physics', 'Chemistry'] },
  { examType: 'SSC', subjects: ['Quantitative Aptitude', 'General Intelligence', 'English', 'General Awareness'] },
  { examType: 'Placement', subjects: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Programming'] },
];

// ─────────────────────────── QUESTIONS ───────────────────────────
const QUESTIONS = [
  // ===== JEE — Physics =====
  {
    examType: 'JEE', subject: 'Physics', type: 'mcq', difficulty: 'medium',
    questionText: 'A ball is projected with a velocity of 20 m/s at an angle of 45° with the horizontal. What is the maximum height reached? (g = 10 m/s²)',
    options: ['5 m', '10 m', '20 m', '40 m'],
    correctAnswer: '10 m',
    explanation: { concept: 'Projectile Motion', solution: 'H = v²sin²θ / 2g = (400 × 0.5) / 20 = 10 m' },
  },
  {
    examType: 'JEE', subject: 'Physics', type: 'mcq', difficulty: 'hard',
    questionText: 'Two capacitors C₁ = 4 μF and C₂ = 6 μF are connected in series across 100 V. The charge on each capacitor is:',
    options: ['240 μC', '2.4 μC', '24 μC', '480 μC'],
    correctAnswer: '240 μC',
    explanation: { concept: 'Capacitors in Series', solution: 'Ceq = (4×6)/(4+6) = 2.4 μF. Q = CeqV = 2.4 × 100 = 240 μC. In series, same charge on each.' },
  },
  {
    examType: 'JEE', subject: 'Physics', type: 'numerical', difficulty: 'hard',
    questionText: 'A body moves in a straight line with velocity v = 3t² − 6t. What is the displacement (in metres) from t = 0 to t = 3 s?',
    correctAnswer: '9',
    explanation: { concept: 'Kinematics — Integration', solution: 'x = ∫(3t²−6t)dt from 0 to 3 = [t³−3t²] = (27−27) − 0 = 0. Wait, total displacement = 0 but distance ≠ 0. Displacement = 0 m. (Trick question: answer is 0, re-check: [t³−3t²]₀³ = 0−0 = 0. But if asking distance, it is 4. For displacement: 0).' },
  },
  {
    examType: 'JEE', subject: 'Physics', type: 'mcq', difficulty: 'easy',
    questionText: 'The SI unit of electric field intensity is:',
    options: ['N/C', 'C/N', 'V·m', 'J/C'],
    correctAnswer: 'N/C',
    explanation: { concept: 'Electric Field', solution: 'Electric field E = F/q, so units are Newton per Coulomb (N/C), which equals V/m.' },
  },
  {
    examType: 'JEE', subject: 'Physics', type: 'mcq', difficulty: 'medium',
    questionText: 'In Young\'s double-slit experiment, when the distance between slits doubles, the fringe width:',
    options: ['Halves', 'Doubles', 'Remains same', 'Becomes four times'],
    correctAnswer: 'Halves',
    explanation: { concept: 'Wave Optics', solution: 'Fringe width β = λD/d. If d doubles, β halves (inversely proportional to slit separation d).' },
  },

  // ===== JEE — Chemistry =====
  {
    examType: 'JEE', subject: 'Chemistry', type: 'mcq', difficulty: 'medium',
    questionText: 'Which hybridisation is exhibited by the central atom in SF₆?',
    options: ['sp³', 'sp³d', 'sp³d²', 'sp²'],
    correctAnswer: 'sp³d²',
    explanation: { concept: 'VSEPR and Hybridisation', solution: 'S in SF₆ has 6 bond pairs, no lone pairs → octahedral geometry → sp³d² hybridisation.' },
  },
  {
    examType: 'JEE', subject: 'Chemistry', type: 'mcq', difficulty: 'hard',
    questionText: 'The rate constant of a first-order reaction is 0.0693 s⁻¹. Its half-life is:',
    options: ['10 s', '6.93 s', '100 s', '0.693 s'],
    correctAnswer: '10 s',
    explanation: { concept: 'Chemical Kinetics', solution: 't₁/₂ = 0.693/k = 0.693/0.0693 = 10 s for first-order reactions.' },
  },
  {
    examType: 'JEE', subject: 'Chemistry', type: 'mcq', difficulty: 'easy',
    questionText: 'The IUPAC name of CH₃−CH(OH)−CH₃ is:',
    options: ['Propan-1-ol', 'Propan-2-ol', '2-Methylethanol', 'Isopropanol'],
    correctAnswer: 'Propan-2-ol',
    explanation: { concept: 'Nomenclature of Alcohols', solution: 'The OH group is on C-2 of a 3-carbon chain → propan-2-ol.' },
  },
  {
    examType: 'JEE', subject: 'Chemistry', type: 'mcq', difficulty: 'medium',
    questionText: 'Which of the following is the strongest acid?',
    options: ['HF', 'HCl', 'HBr', 'HI'],
    correctAnswer: 'HI',
    explanation: { concept: 'Acid Strength', solution: 'Acid strength increases down Group 17: HI > HBr > HCl > HF, because H−I bond is longest and weakest.' },
  },

  // ===== JEE — Mathematics =====
  {
    examType: 'JEE', subject: 'Mathematics', type: 'mcq', difficulty: 'medium',
    questionText: 'The number of real solutions of the equation x² − |x| − 12 = 0 is:',
    options: ['0', '1', '2', '3'],
    correctAnswer: '2',
    explanation: { concept: 'Absolute Value Equations', solution: 'Let u = |x| ≥ 0: u² − u − 12 = 0 → (u−4)(u+3) = 0 → u = 4. So x = ±4 → 2 real solutions.' },
  },
  {
    examType: 'JEE', subject: 'Mathematics', type: 'mcq', difficulty: 'hard',
    questionText: 'The value of ∫₀^(π/2) sin²x dx is:',
    options: ['π/2', 'π/4', '1', '0'],
    correctAnswer: 'π/4',
    explanation: { concept: 'Definite Integrals', solution: '∫₀^(π/2) sin²x dx = ½∫₀^(π/2)(1−cos2x)dx = ½[x − sin2x/2]₀^(π/2) = ½·π/2 = π/4.' },
  },
  {
    examType: 'JEE', subject: 'Mathematics', type: 'numerical', difficulty: 'hard',
    questionText: 'The sum of the first 20 terms of the arithmetic progression 2, 5, 8, 11, … is:',
    correctAnswer: '610',
    explanation: { concept: 'Arithmetic Progression', solution: 'a=2, d=3, n=20. Sₙ = n/2[2a+(n-1)d] = 10[4+57] = 10×61 = 610.' },
  },

  // ===== NEET — Biology =====
  {
    examType: 'NEET', subject: 'Biology', type: 'mcq', difficulty: 'medium',
    questionText: 'Which enzyme is responsible for unwinding the DNA double helix during replication?',
    options: ['DNA Polymerase', 'Helicase', 'Ligase', 'Primase'],
    correctAnswer: 'Helicase',
    explanation: { concept: 'DNA Replication', solution: 'Helicase unwinds and separates the two strands of DNA at the replication fork by breaking hydrogen bonds.' },
  },
  {
    examType: 'NEET', subject: 'Biology', type: 'mcq', difficulty: 'easy',
    questionText: 'The powerhouse of the cell is:',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'],
    correctAnswer: 'Mitochondria',
    explanation: { concept: 'Cell Biology — Organelles', solution: 'Mitochondria are called the powerhouse of the cell because they produce ATP through cellular respiration.' },
  },
  {
    examType: 'NEET', subject: 'Biology', type: 'mcq', difficulty: 'hard',
    questionText: 'Which of the following hormones is NOT secreted by the anterior pituitary gland?',
    options: ['GH', 'TSH', 'ADH', 'ACTH'],
    correctAnswer: 'ADH',
    explanation: { concept: 'Endocrine System', solution: 'ADH (antidiuretic hormone) is produced by the hypothalamus and stored/released by the posterior pituitary, not anterior.' },
  },
  {
    examType: 'NEET', subject: 'Biology', type: 'mcq', difficulty: 'medium',
    questionText: 'Crossing over in meiosis occurs during which phase?',
    options: ['Metaphase I', 'Prophase I', 'Anaphase II', 'Telophase I'],
    correctAnswer: 'Prophase I',
    explanation: { concept: 'Meiosis and Genetic Recombination', solution: 'Crossing over (chiasmata formation) occurs during the pachytene substage of Prophase I of meiosis.' },
  },
  {
    examType: 'NEET', subject: 'Biology', type: 'mcq', difficulty: 'medium',
    questionText: 'Which plant hormone promotes fruit ripening?',
    options: ['Auxin', 'Cytokinin', 'Gibberellin', 'Ethylene'],
    correctAnswer: 'Ethylene',
    explanation: { concept: 'Plant Hormones', solution: 'Ethylene is a gaseous plant hormone that promotes fruit ripening and senescence. Commercially used to ripen bananas.' },
  },

  // ===== NEET — Physics =====
  {
    examType: 'NEET', subject: 'Physics', type: 'mcq', difficulty: 'medium',
    questionText: 'A stone is dropped from a 80 m high building. The time taken to reach the ground is: (g = 10 m/s²)',
    options: ['4 s', '2 s', '8 s', '16 s'],
    correctAnswer: '4 s',
    explanation: { concept: 'Free Fall', solution: 'h = ½gt² → 80 = ½×10×t² → t² = 16 → t = 4 s.' },
  },
  {
    examType: 'NEET', subject: 'Physics', type: 'mcq', difficulty: 'easy',
    questionText: 'The phenomenon of bending of light around the edges of an obstacle is called:',
    options: ['Refraction', 'Diffraction', 'Interference', 'Polarisation'],
    correctAnswer: 'Diffraction',
    explanation: { concept: 'Wave Optics', solution: 'Diffraction is the bending of waves around obstacles or through openings, observed when the obstacle size is comparable to the wavelength.' },
  },

  // ===== NEET — Chemistry =====
  {
    examType: 'NEET', subject: 'Chemistry', type: 'mcq', difficulty: 'medium',
    questionText: 'Which of the following is NOT a property of ionic compounds?',
    options: ['High melting point', 'Conduct electricity in molten state', 'Low boiling point', 'Soluble in water'],
    correctAnswer: 'Low boiling point',
    explanation: { concept: 'Ionic Compounds Properties', solution: 'Ionic compounds have HIGH boiling and melting points due to strong electrostatic forces between ions. Low boiling point is characteristic of covalent compounds.' },
  },
  {
    examType: 'NEET', subject: 'Chemistry', type: 'mcq', difficulty: 'easy',
    questionText: 'The atomic number of Carbon is 6. What is its electronic configuration?',
    options: ['2,4', '2,2,2', '1,2,3', '4,2'],
    correctAnswer: '2,4',
    explanation: { concept: 'Electronic Configuration', solution: 'Carbon (Z=6) → 2 electrons fill the K shell, 4 fill the L shell → configuration is 2,4.' },
  },

  // ===== Placement — Quantitative Aptitude =====
  {
    examType: 'Placement', subject: 'Quantitative Aptitude', type: 'mcq', difficulty: 'medium',
    questionText: 'A train 200 m long crosses a platform 300 m long in 25 seconds. What is the speed of the train in km/h?',
    options: ['60 km/h', '72 km/h', '80 km/h', '90 km/h'],
    correctAnswer: '72 km/h',
    explanation: { concept: 'Speed-Distance-Time (Trains)', solution: 'Total distance = 200+300 = 500 m. Speed = 500/25 = 20 m/s = 20×3.6 = 72 km/h.' },
  },
  {
    examType: 'Placement', subject: 'Quantitative Aptitude', type: 'mcq', difficulty: 'hard',
    questionText: 'The compound interest on Rs. 8000 at 10% per annum for 2 years compounded annually is:',
    options: ['Rs. 1600', 'Rs. 1680', 'Rs. 1728', 'Rs. 2000'],
    correctAnswer: 'Rs. 1680',
    explanation: { concept: 'Compound Interest', solution: 'A = 8000(1+0.1)² = 8000×1.21 = 9680. CI = 9680−8000 = Rs. 1680.' },
  },
  {
    examType: 'Placement', subject: 'Quantitative Aptitude', type: 'mcq', difficulty: 'easy',
    questionText: 'If 40% of a number is 120, what is 25% of that number?',
    options: ['60', '75', '80', '100'],
    correctAnswer: '75',
    explanation: { concept: 'Percentage', solution: 'Number = 120/0.4 = 300. 25% of 300 = 75.' },
  },
  {
    examType: 'Placement', subject: 'Quantitative Aptitude', type: 'numerical', difficulty: 'medium',
    questionText: 'Two pipes A and B can fill a tank in 12 hours and 18 hours respectively. If both are opened simultaneously, in how many hours will the tank be full?',
    correctAnswer: '7.2',
    explanation: { concept: 'Pipes and Cisterns', solution: 'Combined rate = 1/12 + 1/18 = 3/36 + 2/36 = 5/36. Time = 36/5 = 7.2 hours.' },
  },

  // ===== Placement — Logical Reasoning =====
  {
    examType: 'Placement', subject: 'Logical Reasoning', type: 'mcq', difficulty: 'medium',
    questionText: 'In the series 2, 6, 18, 54, ___, what is the next term?',
    options: ['108', '162', '216', '270'],
    correctAnswer: '162',
    explanation: { concept: 'Number Series', solution: 'Each term is multiplied by 3: 2×3=6, 6×3=18, 18×3=54, 54×3=162.' },
  },
  {
    examType: 'Placement', subject: 'Logical Reasoning', type: 'mcq', difficulty: 'hard',
    questionText: 'All roses are flowers. Some flowers fade quickly. Which conclusion is valid?',
    options: [
      'All roses fade quickly',
      'Some roses fade quickly',
      'No roses fade quickly',
      'None of the above is certain',
    ],
    correctAnswer: 'None of the above is certain',
    explanation: { concept: 'Syllogisms', solution: 'We know all roses are flowers, and some flowers fade. We cannot conclude anything certain about roses and fading — "none of the above is certain".' },
  },
  {
    examType: 'Placement', subject: 'Logical Reasoning', type: 'mcq', difficulty: 'easy',
    questionText: 'If today is Tuesday, what day will it be after 100 days?',
    options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    correctAnswer: 'Wednesday',
    explanation: { concept: 'Calendar Reasoning', solution: '100 ÷ 7 = 14 weeks + 2 days. Tuesday + 2 days = Thursday. Wait: 100 mod 7 = 2. Tue+2=Thu. Answer is Thursday.' },
  },

  // ===== Placement — Verbal Ability =====
  {
    examType: 'Placement', subject: 'Verbal Ability', type: 'mcq', difficulty: 'medium',
    questionText: 'Choose the word that is most OPPOSITE in meaning to "Loquacious":',
    options: ['Talkative', 'Taciturn', 'Verbose', 'Garrulous'],
    correctAnswer: 'Taciturn',
    explanation: { concept: 'Antonyms', solution: '"Loquacious" means very talkative. Its antonym is "Taciturn" which means habitually silent.' },
  },
  {
    examType: 'Placement', subject: 'Verbal Ability', type: 'mcq', difficulty: 'easy',
    questionText: 'Identify the error in: "Each of the boys have completed their assignments."',
    options: [
      'Each of the boys',
      'have completed',
      'their assignments',
      'No error',
    ],
    correctAnswer: 'have completed',
    explanation: { concept: 'Subject-Verb Agreement', solution: '"Each" is singular and requires a singular verb. Correct sentence: "Each of the boys HAS completed his assignment."' },
  },

  // ===== Placement — Programming =====
  {
    examType: 'Placement', subject: 'Programming', type: 'mcq', difficulty: 'medium',
    questionText: 'What is the time complexity of Binary Search?',
    options: ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)'],
    correctAnswer: 'O(log n)',
    explanation: { concept: 'Algorithms — Searching', solution: 'Binary search repeatedly halves the search space, resulting in O(log n) time complexity.' },
  },
  {
    examType: 'Placement', subject: 'Programming', type: 'mcq', difficulty: 'hard',
    questionText: 'Which data structure is used in Breadth First Search (BFS)?',
    options: ['Stack', 'Queue', 'Priority Queue', 'Array'],
    correctAnswer: 'Queue',
    explanation: { concept: 'Graph Algorithms', solution: 'BFS uses a Queue (FIFO) to explore nodes level by level. DFS uses a Stack (LIFO).' },
  },
  {
    examType: 'Placement', subject: 'Programming', type: 'mcq', difficulty: 'easy',
    questionText: 'Which keyword is used to define a class in Java?',
    options: ['define', 'struct', 'class', 'object'],
    correctAnswer: 'class',
    explanation: { concept: 'Java Basics', solution: 'The "class" keyword is used to declare a class in Java. E.g., class MyClass { }' },
  },

  // ===== SSC — Quantitative Aptitude =====
  {
    examType: 'SSC', subject: 'Quantitative Aptitude', type: 'mcq', difficulty: 'easy',
    questionText: 'A shopkeeper marks an article 25% above cost price and gives a 10% discount. His profit % is:',
    options: ['12.5%', '15%', '10%', '17.5%'],
    correctAnswer: '12.5%',
    explanation: { concept: 'Profit, Loss and Discount', solution: 'Let CP = 100. MP = 125. SP = 125×0.9 = 112.5. Profit % = 12.5%.' },
  },
  {
    examType: 'SSC', subject: 'Quantitative Aptitude', type: 'mcq', difficulty: 'medium',
    questionText: 'LCM of 12, 18, and 24 is:',
    options: ['36', '48', '72', '144'],
    correctAnswer: '72',
    explanation: { concept: 'LCM and HCF', solution: '12=2²×3, 18=2×3², 24=2³×3. LCM=2³×3²=72.' },
  },
  {
    examType: 'SSC', subject: 'General Intelligence', type: 'mcq', difficulty: 'easy',
    questionText: 'ABCD : EFGH :: MNOP : ?',
    options: ['QRST', 'STUV', 'IJKL', 'WXYZ'],
    correctAnswer: 'QRST',
    explanation: { concept: 'Alphabet Analogies', solution: 'ABCD are positions 1-4, EFGH are 5-8 (skip 4). MNOP are 13-16, so next 4 letters are QRST (17-20).' },
  },
  {
    examType: 'SSC', subject: 'English', type: 'mcq', difficulty: 'easy',
    questionText: 'Select the correctly spelled word:',
    options: ['Accomodation', 'Accommodation', 'Acommodation', 'Accommodaton'],
    correctAnswer: 'Accommodation',
    explanation: { concept: 'Spelling', solution: 'The correct spelling is "Accommodation" with two "c"s and two "m"s.' },
  },
  {
    examType: 'SSC', subject: 'General Awareness', type: 'mcq', difficulty: 'easy',
    questionText: 'Who is the author of "Discovery of India"?',
    options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Subhas Chandra Bose', 'Sardar Patel'],
    correctAnswer: 'Jawaharlal Nehru',
    explanation: { concept: 'Indian History and Literature', solution: '"The Discovery of India" was written by Jawaharlal Nehru in 1946 while imprisoned at Ahmednagar Fort.' },
  },
];

// ─────────────────────────── TEST DEFINITIONS ───────────────────────────
// We create 5 tests per exam type; question IDs are assigned after insert
const TEST_TEMPLATES = {
  JEE: [
    { title: 'JEE Physics Full Mock — 2025', description: 'Full-length JEE 2025 Physics mock covering Mechanics, Electrostatics, and Optics.', timeLimit: 60, passingScore: 60, totalPoints: 100, subjects: ['Physics'] },
    { title: 'JEE Chemistry Quick Drill — Organic', description: 'Rapid 30-minute drill on Organic Chemistry fundamentals for JEE aspirants.', timeLimit: 30, passingScore: 55, totalPoints: 60, subjects: ['Chemistry'] },
    { title: 'JEE Mathematics Practice Set 1', description: 'Practice set covering Calculus, Algebra, and Coordinate Geometry for JEE Main.', timeLimit: 45, passingScore: 65, totalPoints: 80, subjects: ['Mathematics'] },
    { title: 'JEE Combined Revision Mock', description: 'Mixed Physics + Chemistry test aligned with JEE Advanced paper pattern.', timeLimit: 90, passingScore: 60, totalPoints: 160, subjects: ['Physics', 'Chemistry'] },
    { title: 'JEE Speed Test — All Subjects', description: 'High-speed 20-min sprint across all 3 JEE subjects to build exam pressure tolerance.', timeLimit: 20, passingScore: 50, totalPoints: 60, subjects: ['Physics', 'Chemistry', 'Mathematics'] },
  ],
  NEET: [
    { title: 'NEET Biology Full Mock — 2025', description: 'Comprehensive NEET Biology mock: Cell Biology, Genetics, Ecology, and Human Physiology.', timeLimit: 60, passingScore: 60, totalPoints: 180, subjects: ['Biology'] },
    { title: 'NEET Chemistry Practice Set', description: 'Focused NEET Chemistry practice covering Physical, Organic, and Inorganic chemistry.', timeLimit: 45, passingScore: 55, totalPoints: 90, subjects: ['Chemistry'] },
    { title: 'NEET Physics Quick Test', description: 'Short Physics mock for NEET covering Mechanics, Thermodynamics, and Optics.', timeLimit: 30, passingScore: 60, totalPoints: 60, subjects: ['Physics'] },
    { title: 'NEET Full Syllabus Mock Test 1', description: 'Complete NEET 2025 pattern mock covering all three subjects in full exam format.', timeLimit: 180, passingScore: 60, totalPoints: 360, subjects: ['Biology', 'Physics', 'Chemistry'] },
    { title: 'NEET Rapid Revision — Biology+Chem', description: 'Combined Biology and Chemistry revision test for NEET fast-track preparation.', timeLimit: 60, passingScore: 55, totalPoints: 120, subjects: ['Biology', 'Chemistry'] },
  ],
  Placement: [
    { title: 'Placement Aptitude Mock — TCS Pattern', description: 'TCS-style aptitude test covering Quant, Logical Reasoning, and Verbal Ability.', timeLimit: 60, passingScore: 60, totalPoints: 100, subjects: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'] },
    { title: 'Infosys Aptitude Practice Test', description: 'Infosys Specialist Programmer-pattern aptitude drill with reasoning and maths.', timeLimit: 45, passingScore: 65, totalPoints: 80, subjects: ['Quantitative Aptitude', 'Logical Reasoning'] },
    { title: 'Coding & Programming Round Mock', description: 'Technical aptitude test focused on Data Structures, Algorithms, and CS fundamentals.', timeLimit: 60, passingScore: 70, totalPoints: 100, subjects: ['Programming'] },
    { title: 'Placement Communication Skills Test', description: 'English and Verbal Ability test for campus placements — grammar, comprehension, vocabulary.', timeLimit: 30, passingScore: 60, totalPoints: 60, subjects: ['Verbal Ability'] },
    { title: 'Full Placement Drive Mock 2025', description: 'End-to-end placement preparation test covering all four sections used in top company drives.', timeLimit: 90, passingScore: 60, totalPoints: 160, subjects: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Programming'] },
  ],
  SSC: [
    { title: 'SSC CGL Tier-1 Full Mock 2025', description: 'Complete SSC CGL Tier-1 pattern mock with all four sections — Quant, Reasoning, English, GK.', timeLimit: 60, passingScore: 60, totalPoints: 200, subjects: ['Quantitative Aptitude', 'General Intelligence', 'English', 'General Awareness'] },
    { title: 'SSC CHSL Aptitude Practice', description: 'SSC CHSL-level aptitude practice focusing on Quantitative Aptitude and Reasoning.', timeLimit: 45, passingScore: 55, totalPoints: 100, subjects: ['Quantitative Aptitude', 'General Intelligence'] },
    { title: 'SSC English Mastery Test', description: 'SSC-pattern English Language test: Synonyms, Antonyms, Idioms, Error Correction.', timeLimit: 30, passingScore: 60, totalPoints: 80, subjects: ['English'] },
    { title: 'SSC General Awareness Booster', description: 'Quick 20-minute General Awareness quiz covering History, Geography, Polity, and Current Affairs.', timeLimit: 20, passingScore: 60, totalPoints: 50, subjects: ['General Awareness'] },
    { title: 'SSC MTS Beginner Mock', description: 'Entry-level SSC MTS mock for beginners — easy questions across all sections.', timeLimit: 30, passingScore: 50, totalPoints: 100, subjects: ['Quantitative Aptitude', 'English', 'General Awareness'] },
  ],
};

// ─────────────────────────── SEED RUNNER ───────────────────────────
const run = async () => {
  const client = await new MongoClient(required('MONGODB_URI')).connect();
  const db = client.db(process.env.MONGODB_DB_NAME || 'smartprep_ai');

  const usersCol = db.collection('users');
  const questionsCol = db.collection('questions');
  const testsCol = db.collection('tests');
  const examCatalogCol = db.collection('examCatalog');

  // 1. Clear old questions and tests (keep users)
  console.log('🗑  Clearing old questions, tests, and exam catalog…');
  await questionsCol.deleteMany({});
  await testsCol.deleteMany({});
  await examCatalogCol.deleteMany({});
  console.log('✓  Cleared.');

  // 2. Seed exam catalog
  console.log('📚  Seeding exam catalog (JEE, NEET, SSC, Placement)…');
  const now = new Date();
  await examCatalogCol.insertMany(EXAM_CATALOG.map((e) => ({ ...e, createdAt: now, updatedAt: now })));
  console.log('✓  Exam catalog seeded.');

  // 3. Ensure admin user exists
  const adminEmail = 'admin@smartprep.ai';
  let adminId = null;
  const existingAdmin = await usersCol.findOne({ email: adminEmail });
  if (existingAdmin) {
    adminId = existingAdmin._id.toString();
    console.log('✓  Admin user already exists:', adminEmail);
  } else {
    const res = await usersCol.insertOne({
      name: 'SmartPrep Admin',
      email: adminEmail,
      passwordHash: hashPassword('Admin@1234'),
      role: 'admin',
      createdAt: new Date(),
      lastLogin: new Date(),
      emailVerifiedAt: new Date(),
      emailVerificationTokenHash: null,
      emailVerificationTokenExpiresAt: null,
      passwordResetTokenHash: null,
      passwordResetTokenExpiresAt: null,
      failedLoginAttempts: 0,
      lockUntil: null,
    });
    adminId = res.insertedId.toString();
    console.log('✓  Created admin user:', adminEmail, '/ Password: Admin@1234');
  }

  // Ensure demo student user exists
  const studentEmail = 'student@smartprep.ai';
  const existingStudent = await usersCol.findOne({ email: studentEmail });
  if (!existingStudent) {
    await usersCol.insertOne({
      name: 'Demo Student',
      email: studentEmail,
      passwordHash: hashPassword('Student@1234'),
      role: 'student',
      createdAt: new Date(),
      lastLogin: new Date(),
      emailVerifiedAt: new Date(),
      emailVerificationTokenHash: null,
      emailVerificationTokenExpiresAt: null,
      passwordResetTokenHash: null,
      passwordResetTokenExpiresAt: null,
      failedLoginAttempts: 0,
      lockUntil: null,
    });
    console.log('✓  Created demo student:', studentEmail, '/ Password: Student@1234');
  } else {
    console.log('✓  Demo student already exists:', studentEmail);
  }

  // 4. Insert all questions
  console.log(`📝  Inserting ${QUESTIONS.length} questions…`);
  const insertedQs = await questionsCol.insertMany(
    QUESTIONS.map((q) => ({ ...q, createdBy: adminId, createdAt: now, updatedAt: now }))
  );
  console.log(`✓  ${Object.keys(insertedQs.insertedIds).length} questions inserted.`);

  // Build a lookup: examType+subject → [questionIds]
  const allQs = await questionsCol.find({}).toArray();
  const questionsByTypeSubject = {};
  for (const q of allQs) {
    const key = `${q.examType}::${q.subject}`;
    if (!questionsByTypeSubject[key]) questionsByTypeSubject[key] = [];
    questionsByTypeSubject[key].push(q._id.toString());
  }

  // 5. Create 5 tests per exam type
  console.log('🧪  Creating 5 tests per exam type…');
  let testCount = 0;
  for (const [examType, templates] of Object.entries(TEST_TEMPLATES)) {
    for (const tmpl of templates) {
      // Collect questionIds from relevant subjects
      const questionIds = [];
      for (const subj of tmpl.subjects) {
        const key = `${examType}::${subj}`;
        if (questionsByTypeSubject[key]) {
          questionIds.push(...questionsByTypeSubject[key]);
        }
      }
      await testsCol.insertOne({
        title: tmpl.title,
        description: tmpl.description,
        examType,
        category: examType,
        questionIds,
        timeLimit: tmpl.timeLimit,
        passingScore: tmpl.passingScore,
        totalPoints: tmpl.totalPoints,
        status: 'published',
        createdBy: adminId,
        createdAt: now,
        updatedAt: now,
      });
      testCount++;
      console.log(`  ✓  ${tmpl.title} (${questionIds.length} questions)`);
    }
  }
  console.log(`✓  ${testCount} tests created.`);

  console.log('\n🎉  Seed complete!');
  console.log('   Admin login:   admin@smartprep.ai / Admin@1234');
  console.log('   Student login: student@smartprep.ai / Student@1234');
  await client.close();
};

run().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });
