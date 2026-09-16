import { createClient, SupabaseClient } from "@supabase/supabase-js";
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

let cachedClient: SupabaseClient | null = null;
let connectionAttempted = false;
let isSupabaseHealthy = false;

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
 * Lazy-initializes Supabase client securely from environment variables
 */
export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

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
 * Check connectivity to Supabase PostgreSQL database
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  provider: "supabase" | "local_fallback";
  url: string | null;
  hasCredentials: boolean;
  tableCounts: Record<string, number>;
  message?: string;
}> {
  const client = getSupabaseClient();
  const url = process.env.SUPABASE_URL || null;
  const hasCredentials = !!(url && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));

  if (!client || !hasCredentials) {
    return {
      connected: false,
      provider: "local_fallback",
      url: null,
      hasCredentials: false,
      tableCounts: {
        subjects: memoryStore.subjects.length,
        tasks: memoryStore.tasks.length,
        exams: memoryStore.exams.length,
        assignments: memoryStore.assignments.length,
        sessions: memoryStore.sessions.length,
        goals: memoryStore.goals.length,
        scheduleBlocks: memoryStore.scheduleBlocks.length,
        notes: memoryStore.notes.length,
      },
      message: "Running in local resilient mode. Set SUPABASE_URL and SUPABASE_ANON_KEY in environment variables to link your remote PostgreSQL database.",
    };
  }

  try {
    const { data, error, count } = await client
      .from("subjects")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.warn("[Supabase] Health check returned error:", error.message);
      return {
        connected: false,
        provider: "local_fallback",
        url,
        hasCredentials: true,
        tableCounts: {
          subjects: memoryStore.subjects.length,
          tasks: memoryStore.tasks.length,
          exams: memoryStore.exams.length,
          assignments: memoryStore.assignments.length,
          sessions: memoryStore.sessions.length,
          goals: memoryStore.goals.length,
          scheduleBlocks: memoryStore.scheduleBlocks.length,
          notes: memoryStore.notes.length,
        },
        message: `Connected to Supabase URL, but database returned: "${error.message}". Please ensure tables from supabase/schema.sql are executed.`,
      };
    }

    isSupabaseHealthy = true;
    return {
      connected: true,
      provider: "supabase",
      url,
      hasCredentials: true,
      tableCounts: {
        subjects: count ?? memoryStore.subjects.length,
        tasks: memoryStore.tasks.length,
        exams: memoryStore.exams.length,
        assignments: memoryStore.assignments.length,
        sessions: memoryStore.sessions.length,
        goals: memoryStore.goals.length,
        scheduleBlocks: memoryStore.scheduleBlocks.length,
        notes: memoryStore.notes.length,
      },
      message: "Successfully connected to Supabase PostgreSQL database.",
    };
  } catch (e: any) {
    console.warn("[Supabase] Health check failed with exception:", e.message);
    return {
      connected: false,
      provider: "local_fallback",
      url,
      hasCredentials: true,
      tableCounts: {
        subjects: memoryStore.subjects.length,
        tasks: memoryStore.tasks.length,
        exams: memoryStore.exams.length,
        assignments: memoryStore.assignments.length,
        sessions: memoryStore.sessions.length,
        goals: memoryStore.goals.length,
        scheduleBlocks: memoryStore.scheduleBlocks.length,
        notes: memoryStore.notes.length,
      },
      message: e.message || "Failed to reach Supabase PostgreSQL",
    };
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
  return {
    id: g.id,
    title: g.title,
    category: g.category,
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
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("subjects").select("*").order("name");
        if (!error && data) {
          return data.map(subjectFromDb);
        }
        console.warn("[Supabase] getSubjects error:", error?.message);
      } catch (e) {
        console.warn("[Supabase] getSubjects exception, using fallback");
      }
    }
    return memoryStore.subjects;
  },

  async createSubject(sub: Subject): Promise<Subject> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const row = subjectToDb(sub);
        const { data, error } = await client.from("subjects").upsert(row).select().single();
        if (!error && data) {
          const result = subjectFromDb(data);
          // keep fallback in sync
          const idx = memoryStore.subjects.findIndex((s) => s.id === sub.id);
          if (idx >= 0) memoryStore.subjects[idx] = result;
          else memoryStore.subjects.push(result);
          return result;
        }
      } catch (e) {
        console.warn("[Supabase] createSubject exception, using fallback");
      }
    }
    memoryStore.subjects.push(sub);
    return sub;
  },

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | null> {
    const client = getSupabaseClient();
    const existing = memoryStore.subjects.find((s) => s.id === id);
    const merged = { ...(existing || INITIAL_SUBJECTS[0]), ...updates, id };

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
      } catch (e) {
        console.warn("[Supabase] updateSubject exception, using fallback");
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
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from("subjects").delete().eq("id", id);
        if (error) console.warn("[Supabase] deleteSubject error:", error.message);
      } catch (e) {
        console.warn("[Supabase] deleteSubject exception");
      }
    }
    memoryStore.subjects = memoryStore.subjects.filter((s) => s.id !== id);
    return true;
  },

  // TASKS
  async getTasks(): Promise<StudyTask[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("study_tasks").select("*").order("due_date");
        if (!error && data) {
          return data.map(taskFromDb);
        }
      } catch (e) {
        console.warn("[Supabase] getTasks exception, using fallback");
      }
    }
    return memoryStore.tasks;
  },

  async createTask(task: StudyTask): Promise<StudyTask> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const row = taskToDb(task);
        const { data, error } = await client.from("study_tasks").upsert(row).select().single();
        if (!error && data) {
          const result = taskFromDb(data);
          const idx = memoryStore.tasks.findIndex((t) => t.id === task.id);
          if (idx >= 0) memoryStore.tasks[idx] = result;
          else memoryStore.tasks.push(result);
          return result;
        }
      } catch (e) {
        console.warn("[Supabase] createTask exception, using fallback");
      }
    }
    memoryStore.tasks.push(task);
    return task;
  },

  async updateTask(id: string, updates: Partial<StudyTask>): Promise<StudyTask | null> {
    const client = getSupabaseClient();
    const existing = memoryStore.tasks.find((t) => t.id === id);
    const merged = { ...(existing || INITIAL_TASKS[0]), ...updates, id };

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
      } catch (e) {
        console.warn("[Supabase] updateTask exception, using fallback");
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
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from("study_tasks").delete().eq("id", id);
      } catch (e) {
        console.warn("[Supabase] deleteTask exception");
      }
    }
    memoryStore.tasks = memoryStore.tasks.filter((t) => t.id !== id);
    return true;
  },

  // EXAMS
  async getExams(): Promise<Exam[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("exams").select("*").order("date");
        if (!error && data) {
          return data.map(examFromDb);
        }
      } catch (e) {
        console.warn("[Supabase] getExams exception, using fallback");
      }
    }
    return memoryStore.exams;
  },

  async createExam(exam: Exam): Promise<Exam> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const row = examToDb(exam);
        const { data, error } = await client.from("exams").upsert(row).select().single();
        if (!error && data) {
          const result = examFromDb(data);
          const idx = memoryStore.exams.findIndex((e) => e.id === exam.id);
          if (idx >= 0) memoryStore.exams[idx] = result;
          else memoryStore.exams.push(result);
          return result;
        }
      } catch (e) {
        console.warn("[Supabase] createExam exception, using fallback");
      }
    }
    memoryStore.exams.push(exam);
    return exam;
  },

  async updateExam(id: string, updates: Partial<Exam>): Promise<Exam | null> {
    const client = getSupabaseClient();
    const existing = memoryStore.exams.find((e) => e.id === id);
    const merged = { ...(existing || INITIAL_EXAMS[0]), ...updates, id };

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
      } catch (e) {
        console.warn("[Supabase] updateExam exception, using fallback");
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
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from("exams").delete().eq("id", id);
      } catch (e) {
        console.warn("[Supabase] deleteExam exception");
      }
    }
    memoryStore.exams = memoryStore.exams.filter((e) => e.id !== id);
    return true;
  },

  // ASSIGNMENTS
  async getAssignments(): Promise<Assignment[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("assignments").select("*").order("due_date");
        if (!error && data) {
          return data.map(assignmentFromDb);
        }
      } catch (e) {
        console.warn("[Supabase] getAssignments exception, using fallback");
      }
    }
    return memoryStore.assignments;
  },

  async createAssignment(asg: Assignment): Promise<Assignment> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const row = assignmentToDb(asg);
        const { data, error } = await client.from("assignments").upsert(row).select().single();
        if (!error && data) {
          const result = assignmentFromDb(data);
          const idx = memoryStore.assignments.findIndex((a) => a.id === asg.id);
          if (idx >= 0) memoryStore.assignments[idx] = result;
          else memoryStore.assignments.push(result);
          return result;
        }
      } catch (e) {
        console.warn("[Supabase] createAssignment exception, using fallback");
      }
    }
    memoryStore.assignments.push(asg);
    return asg;
  },

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment | null> {
    const client = getSupabaseClient();
    const existing = memoryStore.assignments.find((a) => a.id === id);
    const merged = { ...(existing || INITIAL_ASSIGNMENTS[0]), ...updates, id };

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
      } catch (e) {
        console.warn("[Supabase] updateAssignment exception, using fallback");
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
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from("assignments").delete().eq("id", id);
      } catch (e) {
        console.warn("[Supabase] deleteAssignment exception");
      }
    }
    memoryStore.assignments = memoryStore.assignments.filter((a) => a.id !== id);
    return true;
  },

  // SESSIONS
  async getSessions(): Promise<StudySession[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("study_sessions").select("*").order("date", { ascending: false });
        if (!error && data) {
          return data.map(sessionFromDb);
        }
      } catch (e) {
        console.warn("[Supabase] getSessions exception, using fallback");
      }
    }
    return memoryStore.sessions;
  },

  async createSession(session: StudySession): Promise<StudySession> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const row = sessionToDb(session);
        const { data, error } = await client.from("study_sessions").upsert(row).select().single();
        if (!error && data) {
          const result = sessionFromDb(data);
          memoryStore.sessions.unshift(result);
          return result;
        }
      } catch (e) {
        console.warn("[Supabase] createSession exception, using fallback");
      }
    }
    memoryStore.sessions.unshift(session);
    return session;
  },

  async deleteSession(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from("study_sessions").delete().eq("id", id);
      } catch (e) {
        console.warn("[Supabase] deleteSession exception");
      }
    }
    memoryStore.sessions = memoryStore.sessions.filter((s) => s.id !== id);
    return true;
  },

  // GOALS
  async getGoals(): Promise<StudyGoal[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("study_goals").select("*").order("created_at");
        if (!error && data) {
          return data.map(goalFromDb);
        }
      } catch (e) {
        console.warn("[Supabase] getGoals exception, using fallback");
      }
    }
    return memoryStore.goals;
  },

  async createGoal(goal: StudyGoal): Promise<StudyGoal> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const row = goalToDb(goal);
        const { data, error } = await client.from("study_goals").upsert(row).select().single();
        if (!error && data) {
          const result = goalFromDb(data);
          memoryStore.goals.push(result);
          return result;
        }
      } catch (e) {
        console.warn("[Supabase] createGoal exception, using fallback");
      }
    }
    memoryStore.goals.push(goal);
    return goal;
  },

  async updateGoal(id: string, updates: Partial<StudyGoal>): Promise<StudyGoal | null> {
    const client = getSupabaseClient();
    const existing = memoryStore.goals.find((g) => g.id === id);
    const merged = { ...(existing || INITIAL_GOALS[0]), ...updates, id };

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
      } catch (e) {
        console.warn("[Supabase] updateGoal exception, using fallback");
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
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from("study_goals").delete().eq("id", id);
      } catch (e) {
        console.warn("[Supabase] deleteGoal exception");
      }
    }
    memoryStore.goals = memoryStore.goals.filter((g) => g.id !== id);
    return true;
  },

  // SCHEDULE BLOCKS
  async getScheduleBlocks(): Promise<StudyScheduleBlock[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("study_schedule_blocks").select("*").order("date").order("start_time");
        if (!error && data) {
          return data.map(blockFromDb);
        }
      } catch (e) {
        console.warn("[Supabase] getScheduleBlocks exception, using fallback");
      }
    }
    return memoryStore.scheduleBlocks;
  },

  async createScheduleBlock(block: StudyScheduleBlock): Promise<StudyScheduleBlock> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const row = blockToDb(block);
        const { data, error } = await client.from("study_schedule_blocks").upsert(row).select().single();
        if (!error && data) {
          const result = blockFromDb(data);
          memoryStore.scheduleBlocks.push(result);
          return result;
        }
      } catch (e) {
        console.warn("[Supabase] createScheduleBlock exception, using fallback");
      }
    }
    memoryStore.scheduleBlocks.push(block);
    return block;
  },

  async batchCreateScheduleBlocks(blocks: StudyScheduleBlock[]): Promise<StudyScheduleBlock[]> {
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
      } catch (e) {
        console.warn("[Supabase] batchCreateScheduleBlocks exception, using fallback");
      }
    }
    memoryStore.scheduleBlocks.push(...blocks);
    return blocks;
  },

  async updateScheduleBlock(id: string, updates: Partial<StudyScheduleBlock>): Promise<StudyScheduleBlock | null> {
    const client = getSupabaseClient();
    const existing = memoryStore.scheduleBlocks.find((b) => b.id === id);
    const merged = { ...(existing || INITIAL_SCHEDULE_BLOCKS[0]), ...updates, id };

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
      } catch (e) {
        console.warn("[Supabase] updateScheduleBlock exception, using fallback");
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
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from("study_schedule_blocks").delete().eq("id", id);
      } catch (e) {
        console.warn("[Supabase] deleteScheduleBlock exception");
      }
    }
    memoryStore.scheduleBlocks = memoryStore.scheduleBlocks.filter((b) => b.id !== id);
    return true;
  },

  // NOTES
  async getNotes(): Promise<NoteResource[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("notes_resources").select("*").order("updated_at", { ascending: false });
        if (!error && data) {
          return data.map(noteFromDb);
        }
      } catch (e) {
        console.warn("[Supabase] getNotes exception, using fallback");
      }
    }
    return memoryStore.notes;
  },

  async createNote(note: NoteResource): Promise<NoteResource> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const row = noteToDb(note);
        const { data, error } = await client.from("notes_resources").upsert(row).select().single();
        if (!error && data) {
          const result = noteFromDb(data);
          memoryStore.notes.unshift(result);
          return result;
        }
      } catch (e) {
        console.warn("[Supabase] createNote exception, using fallback");
      }
    }
    memoryStore.notes.unshift(note);
    return note;
  },

  async updateNote(id: string, updates: Partial<NoteResource>): Promise<NoteResource | null> {
    const client = getSupabaseClient();
    const existing = memoryStore.notes.find((n) => n.id === id);
    const merged = { ...(existing || INITIAL_NOTES[0]), ...updates, id, updatedAt: new Date().toISOString() };

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
      } catch (e) {
        console.warn("[Supabase] updateNote exception, using fallback");
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
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from("notes_resources").delete().eq("id", id);
      } catch (e) {
        console.warn("[Supabase] deleteNote exception");
      }
    }
    memoryStore.notes = memoryStore.notes.filter((n) => n.id !== id);
    return true;
  },

  // PROFILE
  async getProfile(): Promise<StudentProfile> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("student_profiles").select("*").eq("id", "default-student").single();
        if (!error && data) {
          return profileFromDb(data);
        }
      } catch (e) {
        console.warn("[Supabase] getProfile exception, using fallback");
      }
    }
    return memoryStore.profile;
  },

  async updateProfile(updates: Partial<StudentProfile>): Promise<StudentProfile> {
    const merged = { ...memoryStore.profile, ...updates };
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
      } catch (e) {
        console.warn("[Supabase] updateProfile exception, using fallback");
      }
    }
    memoryStore.profile = merged;
    return merged;
  },

  // SEED TO SUPABASE
  async seedAllToSupabase(): Promise<{ success: boolean; message: string; details?: any }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: "Supabase client not configured with SUPABASE_URL and key" };
    }

    try {
      // 1. Seed Subjects
      const subjectsPayload = INITIAL_SUBJECTS.map(subjectToDb);
      const { error: subErr } = await client.from("subjects").upsert(subjectsPayload);
      if (subErr) throw new Error(`Subjects seed error: ${subErr.message}`);

      // 2. Seed Tasks
      const tasksPayload = INITIAL_TASKS.map(taskToDb);
      const { error: taskErr } = await client.from("study_tasks").upsert(tasksPayload);
      if (taskErr) throw new Error(`Tasks seed error: ${taskErr.message}`);

      // 3. Seed Exams
      const examsPayload = INITIAL_EXAMS.map(examToDb);
      const { error: examErr } = await client.from("exams").upsert(examsPayload);
      if (examErr) throw new Error(`Exams seed error: ${examErr.message}`);

      // 4. Seed Assignments
      const asgsPayload = INITIAL_ASSIGNMENTS.map(assignmentToDb);
      const { error: asgErr } = await client.from("assignments").upsert(asgsPayload);
      if (asgErr) throw new Error(`Assignments seed error: ${asgErr.message}`);

      // 5. Seed Sessions
      const sessionsPayload = INITIAL_SESSIONS.map(sessionToDb);
      const { error: sessErr } = await client.from("study_sessions").upsert(sessionsPayload);
      if (sessErr) throw new Error(`Sessions seed error: ${sessErr.message}`);

      // 6. Seed Goals
      const goalsPayload = INITIAL_GOALS.map(goalToDb);
      const { error: goalErr } = await client.from("study_goals").upsert(goalsPayload);
      if (goalErr) throw new Error(`Goals seed error: ${goalErr.message}`);

      // 7. Seed Schedule
      const schedulePayload = INITIAL_SCHEDULE_BLOCKS.map(blockToDb);
      const { error: schedErr } = await client.from("study_schedule_blocks").upsert(schedulePayload);
      if (schedErr) throw new Error(`Schedule seed error: ${schedErr.message}`);

      // 8. Seed Notes
      const notesPayload = INITIAL_NOTES.map(noteToDb);
      const { error: noteErr } = await client.from("notes_resources").upsert(notesPayload);
      if (noteErr) throw new Error(`Notes seed error: ${noteErr.message}`);

      // 9. Seed Profile
      const profilePayload = profileToDb(INITIAL_PROFILE);
      const { error: profErr } = await client.from("student_profiles").upsert(profilePayload);
      if (profErr) throw new Error(`Profile seed error: ${profErr.message}`);

      return {
        success: true,
        message: "Successfully synchronized all study management entities to Supabase PostgreSQL.",
      };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },
};
