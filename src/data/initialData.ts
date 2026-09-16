import { Subject, StudyTask, Exam, Assignment, StudySession, StudyGoal, StudyScheduleBlock, NoteResource, StudentProfile } from "../types";

// Helper to format dates relative to today
const getRelativeDate = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: "sub-1",
    name: "Organic Chemistry II",
    code: "CHEM-2420",
    color: "#ec4899", // pink
    iconName: "FlaskConical",
    professor: "Dr. Elena Vance",
    credits: 4,
    targetGrade: "A",
    currentGrade: "B+",
    difficulty: "hard",
    confidenceLevel: 2,
    syllabusTopics: [
      "Conjugated Dienes & Diels-Alder",
      "Aromatic Compounds & EAS Reactions",
      "Aldehydes, Ketones & Nucleophilic Additions",
      "Carboxylic Acid Derivatives",
      "NMR & IR Spectroscopy Analysis",
    ],
  },
  {
    id: "sub-2",
    name: "Data Structures & Algorithms",
    code: "CS-3110",
    color: "#6366f1", // indigo
    iconName: "Code2",
    professor: "Prof. Alan Reyes",
    credits: 4,
    targetGrade: "A",
    currentGrade: "A-",
    difficulty: "hard",
    confidenceLevel: 3,
    syllabusTopics: [
      "Balanced Trees (AVL, Red-Black)",
      "Graph Algorithms (Dijkstra, Prim, Kruskal)",
      "Dynamic Programming Patterns",
      "Disjoint Set & Union Find",
      "NP-Completeness Concepts",
    ],
  },
  {
    id: "sub-3",
    name: "Cellular & Molecular Biology",
    code: "BIO-1810",
    color: "#10b981", // emerald
    iconName: "Dna",
    professor: "Dr. Marcus Chen",
    credits: 3,
    targetGrade: "A",
    currentGrade: "A",
    difficulty: "medium",
    confidenceLevel: 4,
    syllabusTopics: [
      "Membrane Transport & Signal Transduction",
      "Cellular Respiration & Glycolysis",
      "DNA Replication & Transcription",
      "Protein Folding & Translation",
      "Cell Cycle & Cancer Biology",
    ],
  },
  {
    id: "sub-4",
    name: "Macroeconomic Theory",
    code: "ECON-2020",
    color: "#f59e0b", // amber
    iconName: "TrendingUp",
    professor: "Prof. Sarah Sterling",
    credits: 3,
    targetGrade: "A-",
    currentGrade: "B",
    difficulty: "medium",
    confidenceLevel: 3,
    syllabusTopics: [
      "IS-LM Curve Equilibrium",
      "Monetary Policy & Central Banking",
      "Inflation & Phillips Curve Dynamics",
      "Solow Growth Model",
      "Open Economy Exchange Rates",
    ],
  },
  {
    id: "sub-5",
    name: "Linear Algebra & Matrices",
    code: "MATH-2210",
    color: "#0ea5e9", // sky blue
    iconName: "Binary",
    professor: "Dr. Isaac Thorne",
    credits: 4,
    targetGrade: "A",
    currentGrade: "A-",
    difficulty: "hard",
    confidenceLevel: 4,
    syllabusTopics: [
      "Vector Spaces & Subspaces",
      "Matrix Factorizations (LU, QR)",
      "Eigenvalues & Diagonalization",
      "Orthogonality & Gram-Schmidt",
      "Singular Value Decomposition (SVD)",
    ],
  },
];

export const INITIAL_TASKS: StudyTask[] = [
  {
    id: "task-1",
    title: "Master EAS Mechanism Pathways & Synthesis",
    subjectId: "sub-1",
    dueDate: getRelativeDate(1),
    dueTime: "18:00",
    priority: "urgent",
    status: "in_progress",
    estimatedMinutes: 60,
    actualMinutes: 30,
    type: "revision",
    notes: "Draw out all resonance contributors for ortho/para directing substituents.",
  },
  {
    id: "task-2",
    title: "Implement Graph BFS & DFS Traversal Code",
    subjectId: "sub-2",
    dueDate: getRelativeDate(2),
    dueTime: "23:59",
    priority: "high",
    status: "in_progress",
    estimatedMinutes: 90,
    actualMinutes: 45,
    type: "assignment",
    notes: "Finish problem set 4 and verify time complexities.",
  },
  {
    id: "task-3",
    title: "IS-LM Equilibrium Problem Set #5",
    subjectId: "sub-4",
    dueDate: getRelativeDate(3),
    dueTime: "17:00",
    priority: "medium",
    status: "todo",
    estimatedMinutes: 45,
    actualMinutes: 0,
    type: "practice",
    notes: "Graph the shift in LM curve following quantitative easing.",
  },
  {
    id: "task-4",
    title: "Review Glycolysis & Krebs Cycle ATP Yields",
    subjectId: "sub-3",
    dueDate: getRelativeDate(0), // today
    dueTime: "20:00",
    priority: "high",
    status: "todo",
    estimatedMinutes: 40,
    actualMinutes: 0,
    type: "reading",
    notes: "Test active recall using blank sheet method.",
  },
  {
    id: "task-5",
    title: "Solve Eigenvalue Diagonalization Matrix Questions",
    subjectId: "sub-5",
    dueDate: getRelativeDate(4),
    dueTime: "16:00",
    priority: "medium",
    status: "todo",
    estimatedMinutes: 50,
    actualMinutes: 0,
    type: "practice",
    notes: "Textbook Chapter 5, questions 14-22 even numbers.",
  },
  {
    id: "task-6",
    title: "Biology Lab Report: Enzyme Kinetics & Vmax",
    subjectId: "sub-3",
    dueDate: getRelativeDate(-1),
    dueTime: "12:00",
    priority: "high",
    status: "completed",
    estimatedMinutes: 120,
    actualMinutes: 110,
    type: "project",
    completedAt: new Date().toISOString(),
    notes: "Michaelis-Menten curve plotted in Python.",
  },
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: "exam-1",
    title: "Midterm Examination II: Organic Chemistry",
    subjectId: "sub-1",
    date: getRelativeDate(3),
    time: "10:30",
    durationMinutes: 120,
    weightPercentage: 25,
    location: "Hallier Hall, Room 304",
    readinessScore: 62,
    topicsToCover: [
      { topic: "Diels-Alder stereochemistry", mastered: true },
      { topic: "EAS directing groups & resonance", mastered: false },
      { topic: "Friedel-Crafts alkylation limits", mastered: true },
      { topic: "Aldehyde oxidation/reduction", mastered: false },
      { topic: "Spectroscopy 1H NMR splitting", mastered: true },
    ],
    notes: "Cheat sheet of reagents permitted (1 page handwritten).",
  },
  {
    id: "exam-2",
    title: "CS Midterm: Advanced Graph Algorithms",
    subjectId: "sub-2",
    date: getRelativeDate(7),
    time: "14:00",
    durationMinutes: 90,
    weightPercentage: 20,
    location: "Turing Auditorium",
    readinessScore: 78,
    topicsToCover: [
      { topic: "BFS & DFS traversal proofs", mastered: true },
      { topic: "Dijkstra with priority queue", mastered: true },
      { topic: "Bellman-Ford negative cycles", mastered: false },
      { topic: "Topological sorting (Kahn's)", mastered: true },
    ],
    notes: "Bring pencils; coding questions in pseudocode.",
  },
  {
    id: "exam-3",
    title: "Macroeconomics Term Quiz 3",
    subjectId: "sub-4",
    date: getRelativeDate(11),
    time: "09:00",
    durationMinutes: 50,
    weightPercentage: 15,
    location: "Online Portal",
    readinessScore: 84,
    topicsToCover: [
      { topic: "Money multiplier calculations", mastered: true },
      { topic: "Fisher equation for real interest", mastered: true },
      { topic: "Liquidity trap conditions", mastered: true },
    ],
  },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: "asg-1",
    title: "Programming Project 2: Maze Solver Graph Engine",
    subjectId: "sub-2",
    dueDate: getRelativeDate(2),
    dueTime: "23:59",
    status: "in_progress",
    weight: 15,
    description: "Build an automated shortest-path maze solver in TypeScript using A* search and Dijkstra.",
  },
  {
    id: "asg-2",
    title: "Spectroscopy Problem Set 6",
    subjectId: "sub-1",
    dueDate: getRelativeDate(1),
    dueTime: "17:00",
    status: "in_progress",
    weight: 10,
    description: "Determine molecular formulas and structures from provided 1H NMR, 13C NMR, and IR spectra.",
  },
  {
    id: "asg-3",
    title: "Monetary Policy Policy Brief",
    subjectId: "sub-4",
    dueDate: getRelativeDate(5),
    dueTime: "15:00",
    status: "not_started",
    weight: 12,
    description: "2-page analysis of the Federal Reserve's balance sheet reduction strategy.",
  },
  {
    id: "asg-4",
    title: "Linear Transformations Worksheet",
    subjectId: "sub-5",
    dueDate: getRelativeDate(-2),
    dueTime: "14:00",
    status: "graded",
    score: 96,
    maxScore: 100,
    weight: 8,
    description: "Proofs on kernel, image, and rank-nullity theorem.",
  },
];

export const INITIAL_SESSIONS: StudySession[] = [
  {
    id: "sess-1",
    subjectId: "sub-2",
    taskId: "task-2",
    date: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    durationMinutes: 45,
    type: "deep_work",
    notes: "Implemented adjacency list and visited set logic for graph traversal.",
    rating: 5,
    mood: "focused",
  },
  {
    id: "sess-2",
    subjectId: "sub-1",
    taskId: "task-1",
    date: new Date(Date.now() - 3600 * 1000 * 25).toISOString(),
    durationMinutes: 50,
    type: "pomodoro",
    notes: "Reviewed Friedel-Crafts acylation and carbocation rearrangement traps.",
    rating: 4,
    mood: "energized",
  },
  {
    id: "sess-3",
    subjectId: "sub-3",
    date: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    durationMinutes: 60,
    type: "review",
    notes: "Flashcards on ATP synthase rotational mechanics.",
    rating: 5,
    mood: "focused",
  },
  {
    id: "sess-4",
    subjectId: "sub-5",
    date: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
    durationMinutes: 40,
    type: "pomodoro",
    notes: "Practiced 3x3 matrix determinant and eigenvalue formulas.",
    rating: 4,
    mood: "focused",
  },
  {
    id: "sess-5",
    subjectId: "sub-4",
    date: new Date(Date.now() - 3600 * 1000 * 96).toISOString(),
    durationMinutes: 55,
    type: "deep_work",
    notes: "Solved multiplier equations and central bank open market operations.",
    rating: 4,
    mood: "neutral",
  },
  {
    id: "sess-6",
    subjectId: "sub-1",
    date: new Date(Date.now() - 3600 * 1000 * 120).toISOString(),
    durationMinutes: 45,
    type: "quiz",
    notes: "AI practice quiz on Diels-Alder stereochemistry (scored 80%).",
    rating: 5,
    mood: "energized",
  },
];

export const INITIAL_GOALS: StudyGoal[] = [
  {
    id: "goal-1",
    title: "Achieve 20 Hours of Focused Study this Week",
    category: "hours",
    targetValue: 20,
    currentValue: 14.5,
    unit: "hrs",
    targetDate: getRelativeDate(4),
    completed: false,
  },
  {
    id: "goal-2",
    title: "Score 85%+ on Organic Chemistry Midterm",
    category: "grade",
    targetValue: 85,
    currentValue: 62,
    unit: "%",
    targetDate: getRelativeDate(3),
    completed: false,
  },
  {
    id: "goal-3",
    title: "10-Day Continuous Daily Study Streak",
    category: "streak",
    targetValue: 10,
    currentValue: 7,
    unit: "days",
    targetDate: getRelativeDate(3),
    completed: false,
  },
  {
    id: "goal-4",
    title: "Complete All 5 Graph Homework Modules Early",
    category: "exam_prep",
    targetValue: 5,
    currentValue: 4,
    unit: "modules",
    targetDate: getRelativeDate(2),
    completed: false,
  },
];

export const INITIAL_SCHEDULE_BLOCKS: StudyScheduleBlock[] = [
  {
    id: "sched-1",
    title: "Deep Work: Organic Chemistry Reaction Mapping",
    subjectId: "sub-1",
    date: getRelativeDate(0),
    startTime: "10:00",
    endTime: "11:00",
    durationMinutes: 60,
    technique: "Active Recall",
    priority: "urgent",
    completed: false,
    notes: "Focus on electrophilic aromatic substitution ortho/para directing mechanisms.",
  },
  {
    id: "sched-2",
    title: "Code Practice: Graph BFS & Maze Solver",
    subjectId: "sub-2",
    date: getRelativeDate(0),
    startTime: "14:30",
    endTime: "15:30",
    durationMinutes: 60,
    technique: "Hands-on Coding",
    priority: "high",
    completed: false,
    notes: "Complete BFS queue and queue cycle checks.",
  },
  {
    id: "sched-3",
    title: "Review: Cellular Respiration Flashcards",
    subjectId: "sub-3",
    date: getRelativeDate(0),
    startTime: "19:00",
    endTime: "19:40",
    durationMinutes: 40,
    technique: "Spaced Repetition",
    priority: "medium",
    completed: false,
  },
  {
    id: "sched-4",
    title: "Synthesis Problem Solving Drill",
    subjectId: "sub-1",
    date: getRelativeDate(1),
    startTime: "09:30",
    endTime: "11:00",
    durationMinutes: 90,
    technique: "Practice Exams",
    priority: "urgent",
    completed: false,
  },
  {
    id: "sched-5",
    title: "Macroeconomics IS-LM Model Analysis",
    subjectId: "sub-4",
    date: getRelativeDate(1),
    startTime: "15:00",
    endTime: "16:00",
    durationMinutes: 60,
    technique: "Feynman Technique",
    priority: "medium",
    completed: false,
  },
  {
    id: "sched-6",
    title: "Linear Algebra Matrix Orthogonality & QR",
    subjectId: "sub-5",
    date: getRelativeDate(2),
    startTime: "11:00",
    endTime: "12:15",
    durationMinutes: 75,
    technique: "Problem Sets",
    priority: "medium",
    completed: false,
  },
];

export const INITIAL_NOTES: NoteResource[] = [
  {
    id: "note-1",
    title: "Electrophilic Aromatic Substitution (EAS) Cheat Sheet",
    subjectId: "sub-1",
    content: `# EAS Mechanism & Directing Groups

### Key Principles
1. **Activating Groups (Ortho/Para Directors):**
   - Strong: -OH, -NH2, -NR2 (lone pair donation stabilizes arenium ion)
   - Moderate: -OCH3, -NHCOCH3
   - Weak: Alkyl groups (-CH3, -R) via hyperconjugation

2. **Deactivating Groups (Meta Directors):**
   - Strong: -NO2, -CF3, -NR3+
   - Moderate: -CN, -SO3H, -CHO, -COR
   - **Exception:** Halogens (-Cl, -Br) are deactivating due to induction, yet **ortho/para directing** due to resonance!

### Exam Traps
- Friedel-Crafts alkylation suffers from **carbocation rearrangements** and **polyalkylation**. Use Acylation followed by Clemmensen or Wolff-Kishner reduction instead!`,
    tags: ["reactions", "mechanisms", "synthesis", "midterm"],
    updatedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  },
  {
    id: "note-2",
    title: "Graph Traversal & Shortest Path Complexities",
    subjectId: "sub-2",
    content: `# Graph Algorithms Quick Reference

### Breadth-First Search (BFS)
- **Data Structure:** FIFO Queue
- **Time Complexity:** O(V + E)
- **Use Case:** Shortest path in unweighted graphs, level-order traversal.

### Depth-First Search (DFS)
- **Data Structure:** LIFO Stack (or recursion)
- **Time Complexity:** O(V + E)
- **Use Case:** Topological sort, cycle detection in directed graphs, connected components.

### Dijkstra's Algorithm
- **Data Structure:** Min-Priority Queue (Fibonacci or Binary Heap)
- **Time Complexity:** O((V + E) log V)
- **Constraint:** Does NOT support negative edge weights! Use Bellman-Ford for negative weights.`,
    tags: ["algorithms", "graphs", "complexity", "coding"],
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  },
  {
    id: "note-3",
    title: "Cellular Respiration ATP Accounting",
    subjectId: "sub-3",
    content: `# ATP Balance Sheet per Glucose Molecule

1. **Glycolysis (Cytoplasm):**
   - Net 2 ATP (substrate-level phosphorylation)
   - 2 NADH (generates ~3-5 ATP via malate-aspartate shuttle)
2. **Pyruvate Oxidation:**
   - 2 NADH (~5 ATP)
3. **Citric Acid (Krebs) Cycle:**
   - 2 GTP/ATP
   - 6 NADH (~15 ATP)
   - 2 FADH2 (~3 ATP)
4. **Total Theoretical Yield:** ~30 to 32 ATP per glucose.

*Remember: In the presence of uncouplers (like DNP), protons leak across the inner membrane without passing through ATP synthase, dissipating energy as pure heat.*`,
    tags: ["biology", "metabolism", "biochem"],
    updatedAt: new Date(Date.now() - 3600 * 1000 * 36).toISOString(),
  },
];

export const INITIAL_PROFILE: StudentProfile = {
  name: "Alex Morgan",
  institution: "Stanford University",
  major: "Computer Science & Pre-Med",
  targetGPA: "3.92",
  weeklyGoalHours: 20,
  preferredStudyStyle: "Active Recall & Pomodoro",
  streakCount: 7,
  longestStreak: 14,
  lastStudyDate: getRelativeDate(0),
};
