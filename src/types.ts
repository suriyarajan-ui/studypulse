export type PriorityLevel = "low" | "medium" | "high" | "urgent";

export type TaskStatus = "todo" | "in_progress" | "completed";

export type TaskType = "homework" | "assignment" | "reading" | "revision" | "practice" | "project";

export type AmbientSoundType = "none" | "rain" | "stream" | "white_noise" | "calm_drone";

export interface AIChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface AIQuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint?: string;
}

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  iconName: string;
  professor?: string;
  credits: number;
  targetGrade: string;
  currentGrade: string;
  difficulty: DifficultyLevel;
  confidenceLevel: number; // 1 to 5
  syllabusTopics: string[];
}

export interface StudyTask {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: PriorityLevel;
  status: TaskStatus;
  estimatedMinutes: number;
  actualMinutes: number;
  type: TaskType;
  notes?: string;
  completedAt?: string;
}

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  weightPercentage: number;
  location?: string;
  topicsToCover: { topic: string; mastered: boolean }[];
  readinessScore: number; // 0-100
  notes?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string;
  dueTime?: string;
  status: "not_started" | "in_progress" | "submitted" | "graded";
  score?: number;
  maxScore?: number;
  weight: number; // percentage of grade
  description?: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  taskId?: string;
  date: string; // ISO string
  durationMinutes: number;
  type: "pomodoro" | "deep_work" | "review" | "quiz";
  notes?: string;
  rating: number; // 1 to 5 stars
  mood: "energized" | "focused" | "neutral" | "tired";
}

export interface StudyGoal {
  id: string;
  title: string;
  category: "hours" | "exam_prep" | "grade" | "streak" | "weekly_hours" | "exam_score" | "syllabus";
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: string;
  completed: boolean;
}

export interface StudyScheduleBlock {
  id: string;
  title: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  technique?: string;
  priority: PriorityLevel;
  completed: boolean;
  notes?: string;
}

export interface NoteResource {
  id: string;
  title: string;
  subjectId: string;
  content: string;
  tags: string[];
  url?: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  hint: string;
}

export interface QuizResult {
  topic: string;
  subject: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export interface StudentProfile {
  name: string;
  institution: string;
  major: string;
  targetGPA: string;
  weeklyGoalHours: number;
  preferredStudyStyle: string;
  streakCount: number;
  longestStreak: number;
  lastStudyDate: string;
}
