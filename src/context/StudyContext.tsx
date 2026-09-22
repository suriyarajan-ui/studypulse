import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  Subject,
  StudyTask,
  Exam,
  Assignment,
  StudySession,
  StudyGoal,
  StudyScheduleBlock,
  NoteResource,
  StudentProfile,
  AmbientSoundType,
} from "../types";
import {
  INITIAL_SUBJECTS,
  INITIAL_TASKS,
  INITIAL_EXAMS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SESSIONS,
  INITIAL_GOALS,
  INITIAL_SCHEDULE_BLOCKS,
  INITIAL_NOTES,
  INITIAL_PROFILE,
} from "../data/initialData";
import { playTimerCompletionChime, playAmbientSound, stopAmbientSound } from "../utils/audio";

export interface DatabaseStatus {
  connected: boolean;
  provider: "supabase" | "local_fallback";
  url: string | null;
  hasCredentials: boolean;
  tableCounts?: Record<string, number>;
  message?: string;
}

interface NotificationItem {
  id: string;
  type: "exam" | "assignment" | "streak" | "goal";
  title: string;
  message: string;
  dueSoon: boolean;
  timeLabel: string;
  urgent: boolean;
}

interface TimerState {
  isRunning: boolean;
  timeLeftSeconds: number;
  totalTimeSeconds: number;
  mode: "pomodoro" | "short_break" | "long_break";
  subjectId: string;
  taskId: string;
  ambientSound: AmbientSoundType;
}

interface StudyContextType {
  subjects: Subject[];
  tasks: StudyTask[];
  exams: Exam[];
  assignments: Assignment[];
  sessions: StudySession[];
  goals: StudyGoal[];
  scheduleBlocks: StudyScheduleBlock[];
  notes: NoteResource[];
  profile: StudentProfile;

  // Supabase PostgreSQL status and operations
  dbStatus: DatabaseStatus;
  isDbLoading: boolean;
  refreshFromDb: () => Promise<void>;
  seedToSupabase: () => Promise<{ success: boolean; message: string }>;
  migrateToSupabase: () => Promise<{ success: boolean; message: string; migratedCounts?: Record<string, number>; totalRecords?: number }>;

  // Active Timer state
  timerState: TimerState;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (newTotalSeconds?: number) => void;
  setTimerMode: (mode: "pomodoro" | "short_break" | "long_break") => void;
  setTimerSubject: (subjectId: string) => void;
  setTimerTask: (taskId: string) => void;
  setTimerAmbient: (sound: AmbientSoundType) => void;

  // CRUD handlers
  addSubject: (subject: Omit<Subject, "id">) => void;
  updateSubject: (id: string, subject: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  addTask: (task: Omit<StudyTask, "id" | "actualMinutes">) => void;
  updateTask: (id: string, task: Partial<StudyTask>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;

  addExam: (exam: Omit<Exam, "id">) => void;
  updateExam: (id: string, exam: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  toggleExamTopicMastery: (examId: string, topicIndex: number) => void;

  addAssignment: (asg: Omit<Assignment, "id">) => void;
  updateAssignment: (id: string, asg: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  addSession: (session: Omit<StudySession, "id">) => void;
  deleteSession: (id: string) => void;

  addGoal: (goal: Omit<StudyGoal, "id">) => void;
  updateGoal: (id: string, goal: Partial<StudyGoal>) => void;
  deleteGoal: (id: string) => void;

  addScheduleBlock: (block: Omit<StudyScheduleBlock, "id">) => void;
  updateScheduleBlock: (id: string, block: Partial<StudyScheduleBlock>) => void;
  deleteScheduleBlock: (id: string) => void;
  toggleScheduleBlockCompleted: (id: string) => void;
  batchAddScheduleBlocks: (blocks: Omit<StudyScheduleBlock, "id">[]) => void;

  addNote: (note: Omit<NoteResource, "id" | "updatedAt">) => void;
  updateNote: (id: string, note: Partial<NoteResource>) => void;
  deleteNote: (id: string) => void;

  updateProfile: (profile: Partial<StudentProfile>) => void;

  // Derived Analytics
  notifications: NotificationItem[];
  weeklyHoursStudied: number;
  overallPerformanceGrade: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Active Tab navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedSubjectFilter: string;
  setSelectedSubjectFilter: (id: string) => void;

  // Trigger celebration confetti
  triggerCelebration: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = "studypulse_";

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>(() => loadFromStorage("subjects", INITIAL_SUBJECTS));
  const [tasks, setTasks] = useState<StudyTask[]>(() => loadFromStorage("tasks", INITIAL_TASKS));
  const [exams, setExams] = useState<Exam[]>(() => loadFromStorage("exams", INITIAL_EXAMS));
  const [assignments, setAssignments] = useState<Assignment[]>(() => loadFromStorage("assignments", INITIAL_ASSIGNMENTS));
  const [sessions, setSessions] = useState<StudySession[]>(() => loadFromStorage("sessions", INITIAL_SESSIONS));
  const [goals, setGoals] = useState<StudyGoal[]>(() => loadFromStorage("goals", INITIAL_GOALS));
  const [scheduleBlocks, setScheduleBlocks] = useState<StudyScheduleBlock[]>(() => loadFromStorage("scheduleBlocks", INITIAL_SCHEDULE_BLOCKS));
  const [notes, setNotes] = useState<NoteResource[]>(() => loadFromStorage("notes", INITIAL_NOTES));
  const [profile, setProfile] = useState<StudentProfile>(() => loadFromStorage("profile", INITIAL_PROFILE));

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");

  const [isDbLoading, setIsDbLoading] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    connected: false,
    provider: "local_fallback",
    url: null,
    hasCredentials: false,
    message: "Initializing database connection...",
  });

  // Timer State
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    timeLeftSeconds: 25 * 60,
    totalTimeSeconds: 25 * 60,
    mode: "pomodoro",
    subjectId: INITIAL_SUBJECTS[0]?.id || "",
    taskId: INITIAL_TASKS[0]?.id || "",
    ambientSound: "none",
  });

  // Persist to local storage backup
  useEffect(() => saveToStorage("subjects", subjects), [subjects]);
  useEffect(() => saveToStorage("tasks", tasks), [tasks]);
  useEffect(() => saveToStorage("exams", exams), [exams]);
  useEffect(() => saveToStorage("assignments", assignments), [assignments]);
  useEffect(() => saveToStorage("sessions", sessions), [sessions]);
  useEffect(() => saveToStorage("goals", goals), [goals]);
  useEffect(() => saveToStorage("scheduleBlocks", scheduleBlocks), [scheduleBlocks]);
  useEffect(() => saveToStorage("notes", notes), [notes]);
  useEffect(() => saveToStorage("profile", profile), [profile]);

  // Fetch from backend (Supabase PostgreSQL or fallback)
  const refreshFromDb = useCallback(async () => {
    setIsDbLoading(true);
    try {
      // 1. Fetch DB Status
      const statusRes = await fetch("/api/db/status");
      if (statusRes.ok) {
        const statusData: DatabaseStatus = await statusRes.json();
        setDbStatus(statusData);
      }

      // 2. Fetch all collections in parallel
      const [
        subsRes,
        tasksRes,
        examsRes,
        asgsRes,
        sessRes,
        goalsRes,
        schedRes,
        notesRes,
        profRes,
      ] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/tasks"),
        fetch("/api/exams"),
        fetch("/api/assignments"),
        fetch("/api/sessions"),
        fetch("/api/goals"),
        fetch("/api/schedule"),
        fetch("/api/notes"),
        fetch("/api/profile"),
      ]);

      if (subsRes.ok) {
        const data = await subsRes.json();
        if (Array.isArray(data) && data.length > 0) setSubjects(data);
      }
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        if (Array.isArray(data)) setTasks(data);
      }
      if (examsRes.ok) {
        const data = await examsRes.json();
        if (Array.isArray(data)) setExams(data);
      }
      if (asgsRes.ok) {
        const data = await asgsRes.json();
        if (Array.isArray(data)) setAssignments(data);
      }
      if (sessRes.ok) {
        const data = await sessRes.json();
        if (Array.isArray(data)) setSessions(data);
      }
      if (goalsRes.ok) {
        const data = await goalsRes.json();
        if (Array.isArray(data)) setGoals(data);
      }
      if (schedRes.ok) {
        const data = await schedRes.json();
        if (Array.isArray(data)) setScheduleBlocks(data);
      }
      if (notesRes.ok) {
        const data = await notesRes.json();
        if (Array.isArray(data)) setNotes(data);
      }
      if (profRes.ok) {
        const data = await profRes.json();
        if (data && data.name) setProfile(data);
      }
    } catch (e) {
      console.warn("Failed to fetch from backend database, using local fallback state:", e);
    } finally {
      setIsDbLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshFromDb();
  }, [refreshFromDb]);

  // Seed to Supabase trigger
  const seedToSupabase = useCallback(async () => {
    try {
      const res = await fetch("/api/db/seed", { method: "POST" });
      const data = await res.json();
      await refreshFromDb();
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to seed to Supabase" };
    }
  }, [refreshFromDb]);

  // Migrate existing data without loss to Supabase
  const migrateToSupabase = useCallback(async () => {
    try {
      const res = await fetch("/api/db/migrate", { method: "POST" });
      const data = await res.json();
      await refreshFromDb();
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to migrate data to Supabase" };
    }
  }, [refreshFromDb]);

  // Confetti helper
  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#10b981", "#ec4899", "#f59e0b", "#3b82f6"],
      });
    } catch {}
  }, []);

  // Timer countdown hook
  useEffect(() => {
    let interval: any = null;
    if (timerState.isRunning && timerState.timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimerState((prev) => ({
          ...prev,
          timeLeftSeconds: prev.timeLeftSeconds - 1,
        }));
      }, 1000);
    } else if (timerState.isRunning && timerState.timeLeftSeconds === 0) {
      playTimerCompletionChime();
      stopAmbientSound();
      triggerCelebration();

      if (timerState.mode === "pomodoro") {
        const durationMins = Math.round(timerState.totalTimeSeconds / 60);
        const newSession: StudySession = {
          id: "sess-" + Date.now(),
          subjectId: timerState.subjectId || subjects[0]?.id || "sub-1",
          taskId: timerState.taskId || undefined,
          date: new Date().toISOString(),
          durationMinutes: durationMins,
          type: "pomodoro",
          notes: "Completed Pomodoro focus session.",
          rating: 5,
          mood: "focused",
        };

        setSessions((prev) => [newSession, ...prev]);

        // Save session to backend
        fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSession),
        }).catch(console.error);

        if (timerState.taskId) {
          setTasks((prev) =>
            prev.map((t) => {
              if (t.id === timerState.taskId) {
                const updated = { ...t, actualMinutes: (t.actualMinutes || 0) + durationMins };
                fetch(`/api/tasks/${t.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ actualMinutes: updated.actualMinutes }),
                }).catch(console.error);
                return updated;
              }
              return t;
            })
          );
        }
      }

      setTimerState((prev) => ({
        ...prev,
        isRunning: false,
        ambientSound: "none",
        mode: prev.mode === "pomodoro" ? "short_break" : "pomodoro",
        totalTimeSeconds: prev.mode === "pomodoro" ? 5 * 60 : 25 * 60,
        timeLeftSeconds: prev.mode === "pomodoro" ? 5 * 60 : 25 * 60,
      }));
    }

    return () => clearInterval(interval);
  }, [
    timerState.isRunning,
    timerState.timeLeftSeconds,
    timerState.totalTimeSeconds,
    timerState.mode,
    timerState.subjectId,
    timerState.taskId,
    subjects,
    triggerCelebration,
  ]);

  const startTimer = () => {
    setTimerState((prev) => ({ ...prev, isRunning: true }));
    if (timerState.ambientSound !== "none") {
      playAmbientSound(timerState.ambientSound);
    }
  };

  const pauseTimer = () => {
    setTimerState((prev) => ({ ...prev, isRunning: false }));
    stopAmbientSound();
  };

  const resetTimer = (newTotalSeconds?: number) => {
    stopAmbientSound();
    setTimerState((prev) => {
      const total = newTotalSeconds ?? prev.totalTimeSeconds;
      return {
        ...prev,
        isRunning: false,
        totalTimeSeconds: total,
        timeLeftSeconds: total,
      };
    });
  };

  const setTimerMode = (mode: "pomodoro" | "short_break" | "long_break") => {
    stopAmbientSound();
    const durations = {
      pomodoro: 25 * 60,
      short_break: 5 * 60,
      long_break: 15 * 60,
    };
    const total = durations[mode];
    setTimerState((prev) => ({
      ...prev,
      mode,
      isRunning: false,
      totalTimeSeconds: total,
      timeLeftSeconds: total,
    }));
  };

  const setTimerSubject = (subjectId: string) => {
    setTimerState((prev) => ({ ...prev, subjectId }));
  };

  const setTimerTask = (taskId: string) => {
    setTimerState((prev) => ({ ...prev, taskId }));
  };

  const setTimerAmbient = (sound: AmbientSoundType) => {
    setTimerState((prev) => ({ ...prev, ambientSound: sound }));
    if (timerState.isRunning) {
      if (sound === "none") {
        stopAmbientSound();
      } else {
        playAmbientSound(sound);
      }
    }
  };

  // CRUD Implementations with Backend Synchronization

  // SUBJECTS
  const addSubject = (subject: Omit<Subject, "id">) => {
    const newSubject: Subject = { ...subject, id: "sub-" + Date.now() };
    setSubjects((prev) => [...prev, newSubject]);
    fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSubject),
    }).catch(console.error);
  };

  const updateSubject = (id: string, updated: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    fetch(`/api/subjects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch(console.error);
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    fetch(`/api/subjects/${id}`, {
      method: "DELETE",
    }).catch(console.error);
  };

  // TASKS
  const addTask = (task: Omit<StudyTask, "id" | "actualMinutes">) => {
    const newTask: StudyTask = {
      ...task,
      id: "task-" + Date.now(),
      actualMinutes: 0,
    };
    setTasks((prev) => [newTask, ...prev]);
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    }).catch(console.error);
  };

  const updateTask = (id: string, updated: Partial<StudyTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch(console.error);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    }).catch(console.error);
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const newStatus = t.status === "completed" ? "todo" : "completed";
        const completedAt = newStatus === "completed" ? new Date().toISOString() : undefined;
        if (newStatus === "completed") {
          triggerCelebration();
        }
        const updated = { ...t, status: newStatus, completedAt };
        fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus, completedAt }),
        }).catch(console.error);
        return updated;
      })
    );
  };

  // EXAMS
  const addExam = (exam: Omit<Exam, "id">) => {
    const newExam: Exam = { ...exam, id: "exam-" + Date.now() };
    setExams((prev) => [...prev, newExam]);
    fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newExam),
    }).catch(console.error);
  };

  const updateExam = (id: string, updated: Partial<Exam>) => {
    setExams((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
    fetch(`/api/exams/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch(console.error);
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    fetch(`/api/exams/${id}`, {
      method: "DELETE",
    }).catch(console.error);
  };

  const toggleExamTopicMastery = (examId: string, topicIndex: number) => {
    setExams((prev) =>
      prev.map((e) => {
        if (e.id !== examId) return e;
        const newTopics = [...e.topicsToCover];
        newTopics[topicIndex] = {
          ...newTopics[topicIndex],
          mastered: !newTopics[topicIndex].mastered,
        };
        const masteredCount = newTopics.filter((t) => t.mastered).length;
        const newReadiness = Math.round((masteredCount / (newTopics.length || 1)) * 100);
        const updated = {
          ...e,
          topicsToCover: newTopics,
          readinessScore: newReadiness,
        };
        fetch(`/api/exams/${examId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicsToCover: newTopics, readinessScore: newReadiness }),
        }).catch(console.error);
        return updated;
      })
    );
  };

  // ASSIGNMENTS
  const addAssignment = (asg: Omit<Assignment, "id">) => {
    const newAsg: Assignment = { ...asg, id: "asg-" + Date.now() };
    setAssignments((prev) => [newAsg, ...prev]);
    fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAsg),
    }).catch(console.error);
  };

  const updateAssignment = (id: string, updated: Partial<Assignment>) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
    fetch(`/api/assignments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch(console.error);
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    fetch(`/api/assignments/${id}`, {
      method: "DELETE",
    }).catch(console.error);
  };

  // SESSIONS
  const addSession = (session: Omit<StudySession, "id">) => {
    const newSession: StudySession = { ...session, id: "sess-" + Date.now() };
    setSessions((prev) => [newSession, ...prev]);
    triggerCelebration();
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSession),
    }).catch(console.error);
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    fetch(`/api/sessions/${id}`, {
      method: "DELETE",
    }).catch(console.error);
  };

  // GOALS
  const addGoal = (goal: Omit<StudyGoal, "id">) => {
    const newGoal: StudyGoal = { ...goal, id: "goal-" + Date.now() };
    setGoals((prev) => [...prev, newGoal]);
    fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGoal),
    }).catch(console.error);
  };

  const updateGoal = (id: string, updated: Partial<StudyGoal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updated } : g)));
    fetch(`/api/goals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch(console.error);
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    fetch(`/api/goals/${id}`, {
      method: "DELETE",
    }).catch(console.error);
  };

  // SCHEDULE BLOCKS
  const addScheduleBlock = (block: Omit<StudyScheduleBlock, "id">) => {
    const newBlock: StudyScheduleBlock = { ...block, id: "sched-" + Date.now() };
    setScheduleBlocks((prev) => [...prev, newBlock]);
    fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBlock),
    }).catch(console.error);
  };

  const updateScheduleBlock = (id: string, updated: Partial<StudyScheduleBlock>) => {
    setScheduleBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    fetch(`/api/schedule/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch(console.error);
  };

  const deleteScheduleBlock = (id: string) => {
    setScheduleBlocks((prev) => prev.filter((b) => b.id !== id));
    fetch(`/api/schedule/${id}`, {
      method: "DELETE",
    }).catch(console.error);
  };

  const toggleScheduleBlockCompleted = (id: string) => {
    setScheduleBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const comp = !b.completed;
        if (comp) triggerCelebration();
        const updated = { ...b, completed: comp };
        fetch(`/api/schedule/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: comp }),
        }).catch(console.error);
        return updated;
      })
    );
  };

  const batchAddScheduleBlocks = (blocks: Omit<StudyScheduleBlock, "id">[]) => {
    const newBlocks: StudyScheduleBlock[] = blocks.map((b, i) => ({
      ...b,
      id: "sched-" + (Date.now() + i),
    }));
    setScheduleBlocks((prev) => [...prev, ...newBlocks]);
    triggerCelebration();
    fetch("/api/schedule/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBlocks),
    }).catch(console.error);
  };

  // NOTES
  const addNote = (note: Omit<NoteResource, "id" | "updatedAt">) => {
    const newNote: NoteResource = {
      ...note,
      id: "note-" + Date.now(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNote),
    }).catch(console.error);
  };

  const updateNote = (id: string, updated: Partial<NoteResource>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...updated, updatedAt: new Date().toISOString() } : n
      )
    );
    fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch(console.error);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    fetch(`/api/notes/${id}`, {
      method: "DELETE",
    }).catch(console.error);
  };

  // PROFILE
  const updateProfile = (updated: Partial<StudentProfile>) => {
    setProfile((prev) => {
      const merged = { ...prev, ...updated };
      fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      }).catch(console.error);
      return merged;
    });
  };

  // Derived calculations
  const weeklyHoursStudied = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const recent = sessions.filter((s) => new Date(s.date).getTime() >= oneWeekAgo);
    const totalMinutes = recent.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    return Math.round((totalMinutes / 60) * 10) / 10;
  }, [sessions]);

  const overallPerformanceGrade = useMemo(() => {
    if (subjects.length === 0) return "N/A";
    const gradePoints: Record<string, number> = {
      "A+": 4.0,
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
    };
    let totalPoints = 0;
    let totalCredits = 0;
    subjects.forEach((s) => {
      const g = gradePoints[s.currentGrade] || 3.0;
      totalPoints += g * (s.credits || 3);
      totalCredits += s.credits || 3;
    });
    const gpa = totalPoints / (totalCredits || 1);
    if (gpa >= 3.8) return "A (High Distinction)";
    if (gpa >= 3.5) return "A- (Dean's Honor)";
    if (gpa >= 3.0) return "B+ (Solid Progress)";
    return "B (Developing)";
  }, [subjects]);

  // Notifications calculation
  const notifications = useMemo(() => {
    const list: NotificationItem[] = [];
    const now = new Date();

    // Upcoming exams within 7 days
    exams.forEach((exam) => {
      const examDate = new Date(exam.date);
      const diffDays = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      if (diffDays >= 0 && diffDays <= 7) {
        list.push({
          id: "notif-exam-" + exam.id,
          type: "exam",
          title: `Upcoming Exam: ${exam.title}`,
          message: `${diffDays === 0 ? "Today!" : diffDays === 1 ? "Tomorrow!" : `In ${diffDays} days`} • Readiness: ${exam.readinessScore}%`,
          dueSoon: diffDays <= 2,
          timeLabel: `${diffDays}d left`,
          urgent: diffDays <= 3,
        });
      }
    });

    // Pending assignments due within 4 days
    assignments
      .filter((a) => a.status !== "submitted" && a.status !== "graded")
      .forEach((asg) => {
        const dueDate = new Date(asg.dueDate);
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (diffDays >= 0 && diffDays <= 4) {
          list.push({
            id: "notif-asg-" + asg.id,
            type: "assignment",
            title: `Assignment Due: ${asg.title}`,
            message: `${diffDays === 0 ? "Due Today" : `Due in ${diffDays} days`} (${asg.weight}% of grade)`,
            dueSoon: diffDays <= 1,
            timeLabel: `${diffDays}d left`,
            urgent: diffDays <= 1,
          });
        }
      });

    // Streak protection notification
    list.push({
      id: "notif-streak-1",
      type: "streak",
      title: `${profile.streakCount}-Day Streak Active! 🔥`,
      message: "Complete at least one 25-minute study session today to keep your momentum going.",
      dueSoon: false,
      timeLabel: "Today",
      urgent: false,
    });

    return list;
  }, [exams, assignments, profile.streakCount]);

  return (
    <StudyContext.Provider
      value={{
        subjects,
        tasks,
        exams,
        assignments,
        sessions,
        goals,
        scheduleBlocks,
        notes,
        profile,
        dbStatus,
        isDbLoading,
        refreshFromDb,
        seedToSupabase,
        migrateToSupabase,
        timerState,
        startTimer,
        pauseTimer,
        resetTimer,
        setTimerMode,
        setTimerSubject,
        setTimerTask,
        setTimerAmbient,
        addSubject,
        updateSubject,
        deleteSubject,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        addExam,
        updateExam,
        deleteExam,
        toggleExamTopicMastery,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        addSession,
        deleteSession,
        addGoal,
        updateGoal,
        deleteGoal,
        addScheduleBlock,
        updateScheduleBlock,
        deleteScheduleBlock,
        toggleScheduleBlockCompleted,
        batchAddScheduleBlocks,
        addNote,
        updateNote,
        deleteNote,
        updateProfile,
        notifications,
        weeklyHoursStudied,
        overallPerformanceGrade,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        selectedSubjectFilter,
        setSelectedSubjectFilter,
        triggerCelebration,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error("useStudy must be used within a StudyProvider");
  }
  return context;
};
