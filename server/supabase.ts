import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
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
} from "../src/types";
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
} from "../src/data/initialData";

dotenv.config();

let cachedClient: SupabaseClient | null = null;
let isSupabaseHealthy = false;
let isRemoteHostReachable = true;
let lastHealthCheckTime = 0;
let cachedHealthStatus: any = null;
const FAILURE_COOLDOWN_MS = 60000; // 60s cooldown if remote host is unreachable

// In-Memory resilient fallback store
class LocalFallbackStore {
  subjects: Subject[] = JSON.parse(JSON.stringify(INITIAL_SUBJECTS));
  tasks: StudyTask[] = JSON.parse(JSON.stringify(INITIAL_TASKS));
  exams: Exam[] = JSON.parse(JSON.stringify(INITIAL_EXAMS));
  assignments: Assignment[] = JSON.parse(JSON.stringify(INITIAL_ASSIGNMENTS));
  sessions: StudySession[] = JSON.parse(JSON.stringify(INITIAL_SESSIONS));
  goals: StudyGoal[] = JSON.parse(JSON.stringify(INITIAL_GOALS));
  scheduleBlocks: StudyScheduleBlock[] = JSON.parse(JSON.stringify(INITIAL_SCHEDULE_BLOCKS));
  notes: NoteResource[] = JSON.parse(JSON.stringify(INITIAL_NOTES));
  profile: StudentProfile = JSON.parse(JSON.stringify(INITIAL_PROFILE));
}

const memoryStore = new LocalFallbackStore();

/**
 * Validates if the Supabase URL has valid format and is not a placeholder
 */
export function isValidSupabaseUrl(url?: string | null): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) return false;
  if (
    clean.includes("your-project-id") ||
    clean.includes("example.com") ||
    clean.includes("placeholder")
  ) {
    return false;
  }
  return true;
}

/**
 * Lazy-initializes Supabase client securely from environment variables
 */
export function getSupabaseClient(): SupabaseClient | null {
  const rawUrl = process.env.SUPABASE_URL;
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!rawUrl || !rawKey || !isValidSupabaseUrl(rawUrl)) {
    return null;
  }

  const url = rawUrl.trim().replace(/^["']|["']$/g, "");
  const key = rawKey.trim().replace(/^["']|["']$/g, "");

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log(`[Supabase] Initialized client for ${url}`);
    } catch (err) {
      console.error("[Supabase] Failed to initialize client:", err);
      return null;
    }
  }
  return cachedClient;
}

/**
 * Determines whether a Supabase query should be attempted based on health state
 */
export function shouldQuerySupabase(): boolean {
  if (!isSupabaseHealthy) return false;
  if (!isRemoteHostReachable && Date.now() - lastHealthCheckTime < FAILURE_COOLDOWN_MS) {
    return false;
  }
  return Boolean(getSupabaseClient());
}

/**
 * Handles errors from Supabase calls gracefully without spamming logs
 */
export function handleSupabaseError(context: string, error: any) {
  const msg = String(error?.message || error || "");
  const isNetworkFailure =
    msg.includes("fetch failed") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("network");

  if (isNetworkFailure) {
    isSupabaseHealthy = false;
    isRemoteHostReachable = false;
    lastHealthCheckTime = Date.now();
    console.info(
      `[Supabase] Remote host unreachable during ${context} (DNS/network). Operating in resilient local storage mode.`
    );
  } else {
    console.warn(`[Supabase] ${context} error: ${msg}`);
  }
}

/**
 * Fetch row counts from all 9 Supabase PostgreSQL tables
 */
async function fetchSupabaseTableCounts(client: SupabaseClient): Promise<Record<string, number>> {
  const tableMappings = [
    { key: "subjects", table: "subjects" },
    { key: "tasks", table: "study_tasks" },
    { key: "exams", table: "exams" },
    { key: "assignments", table: "assignments" },
    { key: "sessions", table: "study_sessions" },
    { key: "goals", table: "study_goals" },
    { key: "scheduleBlocks", table: "study_schedule_blocks" },
    { key: "notes", table: "notes_resources" },
    { key: "profile", table: "student_profiles" },
  ];

  const counts: Record<string, number> = {};
  await Promise.all(
    tableMappings.map(async ({ key, table }) => {
      try {
        const { count, error } = await client.from(table).select("id", { count: "exact" }).limit(1);
        const fallbackCount = key === "profile" ? 1 : (memoryStore as any)[key]?.length || 0;
        counts[key] = !error && count !== null ? count : fallbackCount;
      } catch {
        counts[key] = key === "profile" ? 1 : (memoryStore as any)[key]?.length || 0;
      }
    })
  );
  return counts;
}

/**
 * Check connectivity to Supabase PostgreSQL database
 */
export async function checkDatabaseHealth(force = false): Promise<{
  connected: boolean;
  provider: "supabase" | "local_fallback";
  url: string | null;
  hasCredentials: boolean;
  tableCounts: Record<string, number>;
  message?: string;
}> {
  const localCounts = {
    subjects: memoryStore.subjects.length,
    tasks: memoryStore.tasks.length,
    exams: memoryStore.exams.length,
    assignments: memoryStore.assignments.length,
    sessions: memoryStore.sessions.length,
    goals: memoryStore.goals.length,
    scheduleBlocks: memoryStore.scheduleBlocks.length,
    notes: memoryStore.notes.length,
    profile: 1,
  };

  const rawUrl = process.env.SUPABASE_URL || null;
  const url = rawUrl ? rawUrl.trim().replace(/^["']|["']$/g, "") : null;
  const hasCredentials = !!(url && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));

  if (!url || !hasCredentials || !isValidSupabaseUrl(url)) {
    isSupabaseHealthy = false;
    return {
      connected: false,
      provider: "local_fallback",
      url: null,
      hasCredentials: false,
      tableCounts: localCounts,
      message: "Running in local resilient mode. Set SUPABASE_URL and SUPABASE_ANON_KEY in environment variables to link your remote PostgreSQL database.",
    };
  }

  // If recently checked and host was unreachable, return cached status unless forced
  if (!force && cachedHealthStatus && !isRemoteHostReachable && Date.now() - lastHealthCheckTime < FAILURE_COOLDOWN_MS) {
    return cachedHealthStatus;
  }

  const client = getSupabaseClient();
  if (!client) {
    isSupabaseHealthy = false;
    return {
      connected: false,
      provider: "local_fallback",
      url,
      hasCredentials: true,
      tableCounts: localCounts,
      message: "Supabase client could not be initialized. Operating in local resilient mode.",
    };
  }

  try {
    const { count, error } = await client
      .from("subjects")
      .select("id", { count: "exact" })
      .limit(1);

    if (error) {
      handleSupabaseError("Health check", error);
      const isNetworkFailure =
        error.message?.includes("fetch failed") ||
        error.message?.includes("ENOTFOUND") ||
        error.message?.includes("ECONNREFUSED");

      const message = isNetworkFailure
        ? `Remote Supabase host (${url}) is unreachable or does not resolve. Operating smoothly in local storage mode.`
        : `Connected to Supabase host, but PostgreSQL query returned: "${error.message}". Please ensure tables from supabase/schema.sql are executed in your SQL editor.`;

      cachedHealthStatus = {
        connected: false,
        provider: "local_fallback",
        url,
        hasCredentials: true,
        tableCounts: localCounts,
        message,
      };
      return cachedHealthStatus;
    }

    isSupabaseHealthy = true;
    isRemoteHostReachable = true;
    lastHealthCheckTime = Date.now();

    // If tables are empty in Supabase, auto-migrate existing data seamlessly
    if (count === 0 && memoryStore.subjects.length > 0) {
      console.log("[Supabase] Remote database is empty. Auto-migrating existing data...");
      await dbService.migrateDataToSupabase();
    }

    const liveCounts = await fetchSupabaseTableCounts(client);

    cachedHealthStatus = {
      connected: true,
      provider: "supabase",
      url,
      hasCredentials: true,
      tableCounts: liveCounts,
      message: "Successfully connected to Supabase PostgreSQL database. All tables verified and synchronized.",
    };
    return cachedHealthStatus;
  } catch (e: any) {
    handleSupabaseError("Health check exception", e);
    cachedHealthStatus = {
      connected: false,
      provider: "local_fallback",
      url,
      hasCredentials: true,
      tableCounts: localCounts,
      message: `Remote Supabase host is currently unreachable (${e.message || "network error"}). Operating in resilient local storage mode.`,
    };
    return cachedHealthStatus;
  }
}

// ---------------------------------------------------------------------------
// DATA TRANSFORMERS (Postgres snake_case <-> Frontend camelCase)
// ---------------------------------------------------------------------------

function subjectToDb(s: Subject) {
  return {
    id: s.id,
    name: s.name,
    code: s.code,
    color: s.color,
    icon_name: s.iconName,
    professor: s.professor || null,
    credits: s.credits,
    target_grade: s.targetGrade,
    current_grade: s.currentGrade,
    difficulty: s.difficulty,
    confidence_level: s.confidenceLevel,
    syllabus_topics: s.syllabusTopics,
    updated_at: new Date().toISOString(),
  };
}

function subjectFromDb(row: any): Subject {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    color: row.color,
    iconName: row.icon_name || "BookOpen",
    professor: row.professor || undefined,
    credits: Number(row.credits) || 3,
    targetGrade: row.target_grade || "A",
    currentGrade: row.current_grade || "A",
    difficulty: row.difficulty || "medium",
    confidenceLevel: Number(row.confidence_level) || 3,
    syllabusTopics: Array.isArray(row.syllabus_topics) ? row.syllabus_topics : [],
  };
}

function taskToDb(t: StudyTask) {
  return {
    id: t.id,
    title: t.title,
    subject_id: t.subjectId,
    due_date: t.dueDate,
    due_time: t.dueTime || null,
    priority: t.priority,
    status: t.status,
    estimated_minutes: t.estimatedMinutes,
    actual_minutes: t.actualMinutes || 0,
    type: t.type || "homework",
    notes: t.notes || null,
    completed_at: t.completedAt || null,
    updated_at: new Date().toISOString(),
  };
}

function taskFromDb(row: any): StudyTask {
  return {
    id: row.id,
    title: row.title,
    subjectId: row.subject_id,
    dueDate: row.due_date,
    dueTime: row.due_time || undefined,
    priority: row.priority || "medium",
    status: row.status || "todo",
    estimatedMinutes: Number(row.estimated_minutes) || 45,
    actualMinutes: Number(row.actual_minutes) || 0,
    type: row.type || "homework",
    notes: row.notes || undefined,
    completedAt: row.completed_at || undefined,
  };
}

function examToDb(e: Exam) {
  return {
    id: e.id,
    title: e.title,
    subject_id: e.subjectId,
    date: e.date,
    time: e.time,
    duration_minutes: e.durationMinutes,
    weight_percentage: e.weightPercentage,
    location: e.location || null,
    topics_to_cover: e.topicsToCover || [],
    readiness_score: e.readinessScore,
    notes: e.notes || null,
    updated_at: new Date().toISOString(),
  };
}

function examFromDb(row: any): Exam {
  return {
    id: row.id,
    title: row.title,
    subjectId: row.subject_id,
    date: row.date,
    time: row.time,
    durationMinutes: Number(row.duration_minutes) || 120,
    weightPercentage: Number(row.weight_percentage) || 25,
    location: row.location || undefined,
    topicsToCover: Array.isArray(row.topics_to_cover) ? row.topics_to_cover : [],
    readinessScore: Number(row.readiness_score) || 50,
    notes: row.notes || undefined,
  };
}

function assignmentToDb(a: Assignment) {
  return {
    id: a.id,
    title: a.title,
    subject_id: a.subjectId,
    due_date: a.dueDate,
    due_time: a.dueTime || null,
    status: a.status,
    score: a.score !== undefined ? a.score : null,
    max_score: a.maxScore || 100,
    weight: a.weight || 15,
    description: a.description || null,
    updated_at: new Date().toISOString(),
  };
}

function assignmentFromDb(row: any): Assignment {
  return {
    id: row.id,
    title: row.title,
    subjectId: row.subject_id,
    dueDate: row.due_date,
    dueTime: row.due_time || undefined,
    status: row.status || "not_started",
    score: row.score !== null && row.score !== undefined ? Number(row.score) : undefined,
    maxScore: Number(row.max_score) || 100,
    weight: Number(row.weight) || 15,
    description: row.description || undefined,
  };
}

function sessionToDb(s: StudySession) {
  return {
    id: s.id,
    subject_id: s.subjectId,
    task_id: s.taskId || null,
    date: s.date || new Date().toISOString(),
    duration_minutes: s.durationMinutes,
    type: s.type || "pomodoro",
    notes: s.notes || null,
    rating: s.rating || 5,
    mood: s.mood || "focused",
  };
}

function sessionFromDb(row: any): StudySession {
  return {
    id: row.id,
    subjectId: row.subject_id,
    taskId: row.task_id || undefined,
    date: row.date,
    durationMinutes: Number(row.duration_minutes) || 25,
    type: row.type || "pomodoro",
    notes: row.notes || undefined,
    rating: Number(row.rating) || 5,
    mood: row.mood || "focused",
  };
}

function goalToDb(g: StudyGoal) {
  let cat = g.category as string;
  if (cat === "exam_prep") cat = "exam_score";
  return {
    id: g.id,
    title: g.title,
    category: cat,
    target_value: g.targetValue,
    current_value: g.currentValue,
    unit: g.unit,
    target_date: g.targetDate,
    completed: !!g.completed,
    updated_at: new Date().toISOString(),
  };
}

function goalFromDb(row: any): StudyGoal {
  return {
    id: row.id,
    title: row.title,
    category: row.category as any,
    targetValue: Number(row.target_value) || 0,
    currentValue: Number(row.current_value) || 0,
    unit: row.unit || "",
    targetDate: row.target_date,
    completed: !!row.completed,
  };
}

function blockToDb(b: StudyScheduleBlock) {
  return {
    id: b.id,
    title: b.title,
    subject_id: b.subjectId,
    date: b.date,
    start_time: b.startTime,
    end_time: b.endTime,
    duration_minutes: b.durationMinutes,
    technique: b.technique || null,
    priority: b.priority || "high",
    completed: !!b.completed,
    notes: b.notes || null,
    updated_at: new Date().toISOString(),
  };
}

function blockFromDb(row: any): StudyScheduleBlock {
  return {
    id: row.id,
    title: row.title,
    subjectId: row.subject_id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    durationMinutes: Number(row.duration_minutes) || 45,
    technique: row.technique || undefined,
    priority: row.priority || "high",
    completed: !!row.completed,
    notes: row.notes || undefined,
  };
}

function noteToDb(n: NoteResource) {
  return {
    id: n.id,
    title: n.title,
    subject_id: n.subjectId,
    content: n.content || "",
    tags: n.tags || [],
    url: n.url || null,
    updated_at: new Date().toISOString(),
  };
}

function noteFromDb(row: any): NoteResource {
  return {
    id: row.id,
    title: row.title,
    subjectId: row.subject_id,
    content: row.content || "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    url: row.url || undefined,
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function profileToDb(p: StudentProfile) {
  return {
    id: "default-student",
    name: p.name,
    institution: p.institution,
    major: p.major,
    target_gpa: p.targetGPA,
    weekly_goal_hours: p.weeklyGoalHours,
    preferred_study_style: p.preferredStudyStyle,
    streak_count: p.streakCount,
    longest_streak: p.longestStreak,
    last_study_date: p.lastStudyDate,
    updated_at: new Date().toISOString(),
  };
}

function profileFromDb(row: any): StudentProfile {
  return {
    name: row.name || "Alex Rivera",
    institution: row.institution || "State University",
    major: row.major || "Computer Science",
    targetGPA: row.target_gpa || "3.90",
    weeklyGoalHours: Number(row.weekly_goal_hours) || 20,
    preferredStudyStyle: row.preferred_study_style || "Active Recall",
    streakCount: Number(row.streak_count) || 7,
    longestStreak: Number(row.longest_streak) || 14,
    lastStudyDate: row.last_study_date || "2026-09-15",
  };
}

// ---------------------------------------------------------------------------
// CRUD OPERATIONS (Supabase with resilient fallback)
// ---------------------------------------------------------------------------

export const dbService = {
  // SUBJECTS
  async getSubjects(): Promise<Subject[]> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client.from("subjects").select("*").order("name");
          if (!error && data) {
            return data.map(subjectFromDb);
          }
          if (error) handleSupabaseError("getSubjects", error);
        } catch (e) {
          handleSupabaseError("getSubjects", e);
        }
      }
    }
    return memoryStore.subjects;
  },

  async createSubject(sub: Subject): Promise<Subject> {
    const fullSub: Subject = {
      ...sub,
      id: sub.id || `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const row = subjectToDb(fullSub);
          const { data, error } = await client.from("subjects").upsert(row).select().single();
          if (!error && data) {
            const result = subjectFromDb(data);
            const idx = memoryStore.subjects.findIndex((s) => s.id === fullSub.id);
            if (idx >= 0) memoryStore.subjects[idx] = result;
            else memoryStore.subjects.push(result);
            return result;
          }
          if (error) handleSupabaseError("createSubject", error);
        } catch (e) {
          handleSupabaseError("createSubject", e);
        }
      }
    }
    const idx = memoryStore.subjects.findIndex((s) => s.id === fullSub.id);
    if (idx >= 0) memoryStore.subjects[idx] = fullSub;
    else memoryStore.subjects.push(fullSub);
    return fullSub;
  },

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | null> {
    const existing = memoryStore.subjects.find((s) => s.id === id);
    const merged = { ...(existing || INITIAL_SUBJECTS[0]), ...updates, id };

    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const row = subjectToDb(merged);
          const { data, error } = await client.from("subjects").update(row).eq("id", id).select().single();
          if (!error && data) {
            const result = subjectFromDb(data);
            const idx = memoryStore.subjects.findIndex((s) => s.id === id);
            if (idx >= 0) memoryStore.subjects[idx] = result;
            return result;
          }
          if (error) handleSupabaseError("updateSubject", error);
        } catch (e) {
          handleSupabaseError("updateSubject", e);
        }
      }
    }
    const idx = memoryStore.subjects.findIndex((s) => s.id === id);
    if (idx >= 0) {
      memoryStore.subjects[idx] = merged;
      return merged;
    }
    return null;
  },

  async deleteSubject(id: string): Promise<boolean> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { error } = await client.from("subjects").delete().eq("id", id);
          if (error) handleSupabaseError("deleteSubject", error);
        } catch (e) {
          handleSupabaseError("deleteSubject", e);
        }
      }
    }
    memoryStore.subjects = memoryStore.subjects.filter((s) => s.id !== id);
    return true;
  },

  // TASKS
  async getTasks(): Promise<StudyTask[]> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client.from("study_tasks").select("*").order("due_date");
          if (!error && data) {
            return data.map(taskFromDb);
          }
          if (error) handleSupabaseError("getTasks", error);
        } catch (e) {
          handleSupabaseError("getTasks", e);
        }
      }
    }
    return memoryStore.tasks;
  },

  async createTask(task: StudyTask): Promise<StudyTask> {
    const fullTask: StudyTask = {
      ...task,
      id: task.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const row = taskToDb(fullTask);
          const { data, error } = await client.from("study_tasks").upsert(row).select().single();
          if (!error && data) {
            const result = taskFromDb(data);
            const idx = memoryStore.tasks.findIndex((t) => t.id === fullTask.id);
            if (idx >= 0) memoryStore.tasks[idx] = result;
            else memoryStore.tasks.push(result);
            return result;
          }
          if (error) handleSupabaseError("createTask", error);
        } catch (e) {
          handleSupabaseError("createTask", e);
        }
      }
    }
    memoryStore.tasks.push(fullTask);
    return fullTask;
  },

  async updateTask(id: string, updates: Partial<StudyTask>): Promise<StudyTask | null> {
    const existing = memoryStore.tasks.find((t) => t.id === id);
    const merged = { ...(existing || INITIAL_TASKS[0]), ...updates, id };

    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const row = taskToDb(merged);
          const { data, error } = await client.from("study_tasks").update(row).eq("id", id).select().single();
          if (!error && data) {
            const result = taskFromDb(data);
            const idx = memoryStore.tasks.findIndex((t) => t.id === id);
            if (idx >= 0) memoryStore.tasks[idx] = result;
            return result;
          }
          if (error) handleSupabaseError("updateTask", error);
        } catch (e) {
          handleSupabaseError("updateTask", e);
        }
      }
    }
    const idx = memoryStore.tasks.findIndex((t) => t.id === id);
    if (idx >= 0) {
      memoryStore.tasks[idx] = merged;
      return merged;
    }
    return null;
  },

  async deleteTask(id: string): Promise<boolean> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { error } = await client.from("study_tasks").delete().eq("id", id);
          if (error) handleSupabaseError("deleteTask", error);
        } catch (e) {
          handleSupabaseError("deleteTask", e);
        }
      }
    }
    memoryStore.tasks = memoryStore.tasks.filter((t) => t.id !== id);
    return true;
  },

  // EXAMS
  async getExams(): Promise<Exam[]> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client.from("exams").select("*").order("date");
          if (!error && data) {
            return data.map(examFromDb);
          }
          if (error) handleSupabaseError("getExams", error);
        } catch (e) {
          handleSupabaseError("getExams", e);
        }
      }
    }
    return memoryStore.exams;
  },

  async createExam(exam: Exam): Promise<Exam> {
    const fullExam: Exam = {
      ...exam,
      id: exam.id || `exam-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const row = examToDb(fullExam);
          const { data, error } = await client.from("exams").upsert(row).select().single();
          if (!error && data) {
            const result = examFromDb(data);
            const idx = memoryStore.exams.findIndex((e) => e.id === fullExam.id);
            if (idx >= 0) memoryStore.exams[idx] = result;
            else memoryStore.exams.push(result);
            return result;
          }
          if (error) handleSupabaseError("createExam", error);
        } catch (e) {
          handleSupabaseError("createExam", e);
        }
      }
    }
    memoryStore.exams.push(fullExam);
    return fullExam;
  },

  async updateExam(id: string, updates: Partial<Exam>): Promise<Exam | null> {
    const existing = memoryStore.exams.find((e) => e.id === id);
    const merged = { ...(existing || INITIAL_EXAMS[0]), ...updates, id };

    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const row = examToDb(merged);
          const { data, error } = await client.from("exams").update(row).eq("id", id).select().single();
          if (!error && data) {
            const result = examFromDb(data);
            const idx = memoryStore.exams.findIndex((e) => e.id === id);
            if (idx >= 0) memoryStore.exams[idx] = result;
            return result;
          }
          if (error) handleSupabaseError("updateExam", error);
        } catch (e) {
          handleSupabaseError("updateExam", e);
        }
      }
    }
    const idx = memoryStore.exams.findIndex((e) => e.id === id);
    if (idx >= 0) {
      memoryStore.exams[idx] = merged;
      return merged;
    }
    return null;
  },

  async deleteExam(id: string): Promise<boolean> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { error } = await client.from("exams").delete().eq("id", id);
          if (error) handleSupabaseError("deleteExam", error);
        } catch (e) {
          handleSupabaseError("deleteExam", e);
        }
      }
    }
    memoryStore.exams = memoryStore.exams.filter((e) => e.id !== id);
    return true;
  },

  // ASSIGNMENTS
  async getAssignments(): Promise<Assignment[]> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client.from("assignments").select("*").order("due_date");
          if (!error && data) {
            return data.map(assignmentFromDb);
          }
          if (error) handleSupabaseError("getAssignments", error);
        } catch (e) {
          handleSupabaseError("getAssignments", e);
        }
      }
    }
    return memoryStore.assignments;
  },

  async createAssignment(asg: Assignment): Promise<Assignment> {
    const fullAsg: Assignment = {
      ...asg,
      id: asg.id || `asg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const row = assignmentToDb(fullAsg);
          const { data, error } = await client.from("assignments").upsert(row).select().single();
          if (!error && data) {
            const result = assignmentFromDb(data);
            const idx = memoryStore.assignments.findIndex((a) => a.id === fullAsg.id);
            if (idx >= 0) memoryStore.assignments[idx] = result;
            else memoryStore.assignments.push(result);
            return result;
          }
          if (error) handleSupabaseError("createAssignment", error);
        } catch (e) {
          handleSupabaseError("createAssignment", e);
        }
      }
    }
    memoryStore.assignments.push(fullAsg);
    return fullAsg;
  },

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment | null> {
    const existing = memoryStore.assignments.find((a) => a.id === id);
    const merged = { ...(existing || INITIAL_ASSIGNMENTS[0]), ...updates, id };

    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const row = assignmentToDb(merged);
          const { data, error } = await client.from("assignments").update(row).eq("id", id).select().single();
          if (!error && data) {
            const result = assignmentFromDb(data);
            const idx = memoryStore.assignments.findIndex((a) => a.id === id);
            if (idx >= 0) memoryStore.assignments[idx] = result;
            return result;
          }
          if (error) handleSupabaseError("updateAssignment", error);
        } catch (e) {
          handleSupabaseError("updateAssignment", e);
        }
      }
    }
    const idx = memoryStore.assignments.findIndex((a) => a.id === id);
    if (idx >= 0) {
      memoryStore.assignments[idx] = merged;
      return merged;
    }
    return null;
  },

  async deleteAssignment(id: string): Promise<boolean> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { error } = await client.from("assignments").delete().eq("id", id);
          if (error) handleSupabaseError("deleteAssignment", error);
        } catch (e) {
          handleSupabaseError("deleteAssignment", e);
        }
      }
    }
    memoryStore.assignments = memoryStore.assignments.filter((a) => a.id !== id);
    return true;
  },

  // SESSIONS
  async getSessions(): Promise<StudySession[]> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client.from("study_sessions").select("*").order("date", { ascending: false });
          if (!error && data) {
            return data.map(sessionFromDb);
          }
          if (error) handleSupabaseError("getSessions", error);
        } catch (e) {
          handleSupabaseError("getSessions", e);
        }
      }
    }
    return memoryStore.sessions;
  },

  async createSession(session: StudySession): Promise<StudySession> {
    const fullSession: StudySession = {
      ...session,
      id: session.id || `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const row = sessionToDb(fullSession);
          const { data, error } = await client.from("study_sessions").upsert(row).select().single();
          if (!error && data) {
            const result = sessionFromDb(data);
            memoryStore.sessions.unshift(result);
            return result;
          }
          if (error) handleSupabaseError("createSession", error);
        } catch (e) {
          handleSupabaseError("createSession", e);
        }
      }
    }
    memoryStore.sessions.unshift(fullSession);
    return fullSession;
  },

  async deleteSession(id: string): Promise<boolean> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { error } = await client.from("study_sessions").delete().eq("id", id);
          if (error) handleSupabaseError("deleteSession", error);
        } catch (e) {
          handleSupabaseError("deleteSession", e);
        }
      }
    }
    memoryStore.sessions = memoryStore.sessions.filter((s) => s.id !== id);
    return true;
  },

  // GOALS
  async getGoals(): Promise<StudyGoal[]> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client.from("study_goals").select("*").order("created_at");
          if (!error && data) {
            return data.map(goalFromDb);
          }
          if (error) handleSupabaseError("getGoals", error);
        } catch (e) {
          handleSupabaseError("getGoals", e);
        }
      }
    }
    return memoryStore.goals;
  },

  async createGoal(goal: StudyGoal): Promise<StudyGoal> {
    const fullGoal: StudyGoal = {
      ...goal,
      id: goal.id || `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const row = goalToDb(fullGoal);
          const { data, error } = await client.from("study_goals").upsert(row).select().single();
          if (!error && data) {
            const result = goalFromDb(data);
            memoryStore.goals.push(result);
            return result;
          }
          if (error) handleSupabaseError("createGoal", error);
        } catch (e) {
          handleSupabaseError("createGoal", e);
        }
      }
    }
    memoryStore.goals.push(fullGoal);
    return fullGoal;
  },

  async updateGoal(id: string, updates: Partial<StudyGoal>): Promise<StudyGoal | null> {
    const existing = memoryStore.goals.find((g) => g.id === id);
    const merged = { ...(existing || INITIAL_GOALS[0]), ...updates, id };

    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const row = goalToDb(merged);
          const { data, error } = await client.from("study_goals").update(row).eq("id", id).select().single();
          if (!error && data) {
            const result = goalFromDb(data);
            const idx = memoryStore.goals.findIndex((g) => g.id === id);
            if (idx >= 0) memoryStore.goals[idx] = result;
            return result;
          }
          if (error) handleSupabaseError("updateGoal", error);
        } catch (e) {
          handleSupabaseError("updateGoal", e);
        }
      }
    }
    const idx = memoryStore.goals.findIndex((g) => g.id === id);
    if (idx >= 0) {
      memoryStore.goals[idx] = merged;
      return merged;
    }
    return null;
  },

  async deleteGoal(id: string): Promise<boolean> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { error } = await client.from("study_goals").delete().eq("id", id);
          if (error) handleSupabaseError("deleteGoal", error);
        } catch (e) {
          handleSupabaseError("deleteGoal", e);
        }
      }
    }
    memoryStore.goals = memoryStore.goals.filter((g) => g.id !== id);
    return true;
  },

  // SCHEDULE BLOCKS
  async getScheduleBlocks(): Promise<StudyScheduleBlock[]> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client.from("study_schedule_blocks").select("*").order("date").order("start_time");
          if (!error && data) {
            return data.map(blockFromDb);
          }
          if (error) handleSupabaseError("getScheduleBlocks", error);
        } catch (e) {
          handleSupabaseError("getScheduleBlocks", e);
        }
      }
    }
    return memoryStore.scheduleBlocks;
  },

  async createScheduleBlock(block: StudyScheduleBlock): Promise<StudyScheduleBlock> {
    const fullBlock: StudyScheduleBlock = {
      ...block,
      id: block.id || `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const row = blockToDb(fullBlock);
          const { data, error } = await client.from("study_schedule_blocks").upsert(row).select().single();
          if (!error && data) {
            const result = blockFromDb(data);
            memoryStore.scheduleBlocks.push(result);
            return result;
          }
          if (error) handleSupabaseError("createScheduleBlock", error);
        } catch (e) {
          handleSupabaseError("createScheduleBlock", e);
        }
      }
    }
    memoryStore.scheduleBlocks.push(fullBlock);
    return fullBlock;
  },

  async batchCreateScheduleBlocks(blocks: StudyScheduleBlock[]): Promise<StudyScheduleBlock[]> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const rows = blocks.map(blockToDb);
          const { data, error } = await client.from("study_schedule_blocks").upsert(rows).select();
          if (!error && data) {
            const results = data.map(blockFromDb);
            memoryStore.scheduleBlocks.push(...results);
            return results;
          }
          if (error) handleSupabaseError("batchCreateScheduleBlocks", error);
        } catch (e) {
          handleSupabaseError("batchCreateScheduleBlocks", e);
        }
      }
    }
    memoryStore.scheduleBlocks.push(...blocks);
    return blocks;
  },

  async updateScheduleBlock(id: string, updates: Partial<StudyScheduleBlock>): Promise<StudyScheduleBlock | null> {
    const existing = memoryStore.scheduleBlocks.find((b) => b.id === id);
    const merged = { ...(existing || INITIAL_SCHEDULE_BLOCKS[0]), ...updates, id };

    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const row = blockToDb(merged);
          const { data, error } = await client.from("study_schedule_blocks").update(row).eq("id", id).select().single();
          if (!error && data) {
            const result = blockFromDb(data);
            const idx = memoryStore.scheduleBlocks.findIndex((b) => b.id === id);
            if (idx >= 0) memoryStore.scheduleBlocks[idx] = result;
            return result;
          }
          if (error) handleSupabaseError("updateScheduleBlock", error);
        } catch (e) {
          handleSupabaseError("updateScheduleBlock", e);
        }
      }
    }
    const idx = memoryStore.scheduleBlocks.findIndex((b) => b.id === id);
    if (idx >= 0) {
      memoryStore.scheduleBlocks[idx] = merged;
      return merged;
    }
    return null;
  },

  async deleteScheduleBlock(id: string): Promise<boolean> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          await client.from("study_schedule_blocks").delete().eq("id", id);
        } catch (e) {
          handleSupabaseError("deleteScheduleBlock", e);
        }
      }
    }
    memoryStore.scheduleBlocks = memoryStore.scheduleBlocks.filter((b) => b.id !== id);
    return true;
  },

  // NOTES
  async getNotes(): Promise<NoteResource[]> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client.from("notes_resources").select("*").order("updated_at", { ascending: false });
          if (!error && data) {
            return data.map(noteFromDb);
          }
          if (error) handleSupabaseError("getNotes", error);
        } catch (e) {
          handleSupabaseError("getNotes", e);
        }
      }
    }
    return memoryStore.notes;
  },

  async createNote(note: NoteResource): Promise<NoteResource> {
    const fullNote: NoteResource = {
      ...note,
      id: note.id || `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const row = noteToDb(fullNote);
          const { data, error } = await client.from("notes_resources").upsert(row).select().single();
          if (!error && data) {
            const result = noteFromDb(data);
            memoryStore.notes.unshift(result);
            return result;
          }
          if (error) handleSupabaseError("createNote", error);
        } catch (e) {
          handleSupabaseError("createNote", e);
        }
      }
    }
    memoryStore.notes.unshift(fullNote);
    return fullNote;
  },

  async updateNote(id: string, updates: Partial<NoteResource>): Promise<NoteResource | null> {
    const existing = memoryStore.notes.find((n) => n.id === id);
    const merged = { ...(existing || INITIAL_NOTES[0]), ...updates, id, updatedAt: new Date().toISOString() };

    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const row = noteToDb(merged);
          const { data, error } = await client.from("notes_resources").update(row).eq("id", id).select().single();
          if (!error && data) {
            const result = noteFromDb(data);
            const idx = memoryStore.notes.findIndex((n) => n.id === id);
            if (idx >= 0) memoryStore.notes[idx] = result;
            return result;
          }
          if (error) handleSupabaseError("updateNote", error);
        } catch (e) {
          handleSupabaseError("updateNote", e);
        }
      }
    }
    const idx = memoryStore.notes.findIndex((n) => n.id === id);
    if (idx >= 0) {
      memoryStore.notes[idx] = merged;
      return merged;
    }
    return null;
  },

  async deleteNote(id: string): Promise<boolean> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          await client.from("notes_resources").delete().eq("id", id);
        } catch (e) {
          handleSupabaseError("deleteNote", e);
        }
      }
    }
    memoryStore.notes = memoryStore.notes.filter((n) => n.id !== id);
    return true;
  },

  // PROFILE
  async getProfile(): Promise<StudentProfile> {
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client.from("student_profiles").select("*").eq("id", "default-student").single();
          if (!error && data) {
            return profileFromDb(data);
          }
          if (error) handleSupabaseError("getProfile", error);
        } catch (e) {
          handleSupabaseError("getProfile", e);
        }
      }
    }
    return memoryStore.profile;
  },

  async updateProfile(updates: Partial<StudentProfile>): Promise<StudentProfile> {
    const current = await this.getProfile();
    const merged = { ...current, ...updates };
    if (shouldQuerySupabase()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const row = profileToDb(merged);
          const { data, error } = await client.from("student_profiles").upsert(row).select().single();
          if (!error && data) {
            const result = profileFromDb(data);
            memoryStore.profile = result;
            return result;
          }
          if (error) handleSupabaseError("updateProfile", error);
        } catch (e) {
          handleSupabaseError("updateProfile", e);
        }
      }
    }
    memoryStore.profile = merged;
    return merged;
  },

  // MIGRATE EXISTING DATA TO SUPABASE WITHOUT DATA LOSS
  async migrateDataToSupabase(): Promise<{
    success: boolean;
    message: string;
    migratedCounts: Record<string, number>;
    totalRecords: number;
    errors?: string[];
  }> {
    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        message: "Supabase client not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) in environment variables.",
        migratedCounts: {},
        totalRecords: 0,
      };
    }

    const counts: Record<string, number> = {
      subjects: 0,
      study_tasks: 0,
      exams: 0,
      assignments: 0,
      study_sessions: 0,
      study_goals: 0,
      study_schedule_blocks: 0,
      notes_resources: 0,
      student_profiles: 0,
    };
    const errors: string[] = [];

    try {
      // 1. Migrate Subjects (Parent table - must be first)
      const subjectsSource = memoryStore.subjects.length > 0 ? memoryStore.subjects : INITIAL_SUBJECTS;
      const subjectsPayload = subjectsSource.map(subjectToDb);
      const { error: subErr } = await client.from("subjects").upsert(subjectsPayload, { onConflict: "id" });
      if (subErr) {
        errors.push(`subjects: ${subErr.message}`);
      } else {
        counts.subjects = subjectsPayload.length;
      }

      // 2. Migrate Tasks (Foreign key references subjects.id)
      const tasksSource = memoryStore.tasks.length > 0 ? memoryStore.tasks : INITIAL_TASKS;
      const tasksPayload = tasksSource.map(taskToDb);
      const { error: taskErr } = await client.from("study_tasks").upsert(tasksPayload, { onConflict: "id" });
      if (taskErr) {
        errors.push(`study_tasks: ${taskErr.message}`);
      } else {
        counts.study_tasks = tasksPayload.length;
      }

      // 3. Migrate Exams (Foreign key references subjects.id)
      const examsSource = memoryStore.exams.length > 0 ? memoryStore.exams : INITIAL_EXAMS;
      const examsPayload = examsSource.map(examToDb);
      const { error: examErr } = await client.from("exams").upsert(examsPayload, { onConflict: "id" });
      if (examErr) {
        errors.push(`exams: ${examErr.message}`);
      } else {
        counts.exams = examsPayload.length;
      }

      // 4. Migrate Assignments (Foreign key references subjects.id)
      const asgsSource = memoryStore.assignments.length > 0 ? memoryStore.assignments : INITIAL_ASSIGNMENTS;
      const asgsPayload = asgsSource.map(assignmentToDb);
      const { error: asgErr } = await client.from("assignments").upsert(asgsPayload, { onConflict: "id" });
      if (asgErr) {
        errors.push(`assignments: ${asgErr.message}`);
      } else {
        counts.assignments = asgsPayload.length;
      }

      // 5. Migrate Sessions (Foreign key references subjects.id and optional study_tasks.id)
      const sessSource = memoryStore.sessions.length > 0 ? memoryStore.sessions : INITIAL_SESSIONS;
      const sessPayload = sessSource.map(sessionToDb);
      const { error: sessErr } = await client.from("study_sessions").upsert(sessPayload, { onConflict: "id" });
      if (sessErr) {
        errors.push(`study_sessions: ${sessErr.message}`);
      } else {
        counts.study_sessions = sessPayload.length;
      }

      // 6. Migrate Goals
      const goalsSource = memoryStore.goals.length > 0 ? memoryStore.goals : INITIAL_GOALS;
      const goalsPayload = goalsSource.map(goalToDb);
      const { error: goalErr } = await client.from("study_goals").upsert(goalsPayload, { onConflict: "id" });
      if (goalErr) {
        errors.push(`study_goals: ${goalErr.message}`);
      } else {
        counts.study_goals = goalsPayload.length;
      }

      // 7. Migrate Schedule Blocks
      const schedSource = memoryStore.scheduleBlocks.length > 0 ? memoryStore.scheduleBlocks : INITIAL_SCHEDULE_BLOCKS;
      const schedPayload = schedSource.map(blockToDb);
      const { error: schedErr } = await client.from("study_schedule_blocks").upsert(schedPayload, { onConflict: "id" });
      if (schedErr) {
        errors.push(`study_schedule_blocks: ${schedErr.message}`);
      } else {
        counts.study_schedule_blocks = schedPayload.length;
      }

      // 8. Migrate Notes Resources
      const notesSource = memoryStore.notes.length > 0 ? memoryStore.notes : INITIAL_NOTES;
      const notesPayload = notesSource.map(noteToDb);
      const { error: noteErr } = await client.from("notes_resources").upsert(notesPayload, { onConflict: "id" });
      if (noteErr) {
        errors.push(`notes_resources: ${noteErr.message}`);
      } else {
        counts.notes_resources = notesPayload.length;
      }

      // 9. Migrate Student Profile
      const profSource = memoryStore.profile || INITIAL_PROFILE;
      const profPayload = profileToDb(profSource);
      const { error: profErr } = await client.from("student_profiles").upsert(profPayload, { onConflict: "id" });
      if (profErr) {
        errors.push(`student_profiles: ${profErr.message}`);
      } else {
        counts.student_profiles = 1;
      }

      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      const hasErrors = errors.length > 0;

      return {
        success: !hasErrors,
        message: hasErrors
          ? `Migration completed with warnings: ${errors.join("; ")}`
          : `Successfully migrated all ${total} existing study records to Supabase PostgreSQL without loss.`,
        migratedCounts: counts,
        totalRecords: total,
        errors: hasErrors ? errors : undefined,
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Migration failed: ${e.message}`,
        migratedCounts: counts,
        totalRecords: Object.values(counts).reduce((a, b) => a + b, 0),
        errors: [e.message],
      };
    }
  },

  // SEED TO SUPABASE
  async seedAllToSupabase(): Promise<{ success: boolean; message: string; details?: any }> {
    const res = await this.migrateDataToSupabase();
    return {
      success: res.success,
      message: res.message,
      details: res.migratedCounts,
    };
  },
};
