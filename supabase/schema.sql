-- ==============================================================================
-- StudyPulse Management System: Supabase PostgreSQL Schema & Migrations
-- Generated from SRS: Study Planner & Personal Learning Coach
-- Target Database: Supabase PostgreSQL 14+
-- ==============================================================================

-- Enable UUID extension for unique identifier generation if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to automatically maintain updated_at timestamps on record mutations
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 1. SUBJECTS TABLE (Course and curriculum management)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    color TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'BookOpen',
    professor TEXT,
    credits INTEGER NOT NULL DEFAULT 3 CHECK (credits > 0),
    target_grade TEXT NOT NULL DEFAULT 'A',
    current_grade TEXT NOT NULL DEFAULT 'A',
    difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    confidence_level INTEGER NOT NULL DEFAULT 3 CHECK (confidence_level BETWEEN 1 AND 5),
    syllabus_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_subjects_updated_at ON public.subjects;
CREATE TRIGGER trg_subjects_updated_at
    BEFORE UPDATE ON public.subjects
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 2. STUDY TASKS TABLE (Priority-based task & homework tracking)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.study_tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    due_date TEXT NOT NULL,
    due_time TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    estimated_minutes INTEGER NOT NULL DEFAULT 45 CHECK (estimated_minutes >= 0),
    actual_minutes INTEGER NOT NULL DEFAULT 0 CHECK (actual_minutes >= 0),
    type TEXT NOT NULL DEFAULT 'homework' CHECK (type IN ('homework', 'assignment', 'reading', 'revision', 'practice', 'project')),
    notes TEXT,
    completed_at TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_study_tasks_updated_at ON public.study_tasks;
CREATE TRIGGER trg_study_tasks_updated_at
    BEFORE UPDATE ON public.study_tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 3. EXAMS TABLE (Exams, midterms, finals, topic mastery & readiness scores)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.exams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 120 CHECK (duration_minutes > 0),
    weight_percentage INTEGER NOT NULL DEFAULT 25 CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
    location TEXT,
    topics_to_cover JSONB NOT NULL DEFAULT '[]'::jsonb,
    readiness_score INTEGER NOT NULL DEFAULT 50 CHECK (readiness_score BETWEEN 0 AND 100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_exams_updated_at ON public.exams;
CREATE TRIGGER trg_exams_updated_at
    BEFORE UPDATE ON public.exams
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 4. ASSIGNMENTS TABLE (Homework, problem sets, projects, grade weights)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.assignments (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    due_date TEXT NOT NULL,
    due_time TEXT,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'graded')),
    score NUMERIC,
    max_score NUMERIC NOT NULL DEFAULT 100,
    weight NUMERIC NOT NULL DEFAULT 15,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_assignments_updated_at ON public.assignments;
CREATE TRIGGER trg_assignments_updated_at
    BEFORE UPDATE ON public.assignments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. STUDY SESSIONS TABLE (Focus timer logs, pomodoros, duration, mood & ratings)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    task_id TEXT REFERENCES public.study_tasks(id) ON DELETE SET NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_minutes INTEGER NOT NULL DEFAULT 25 CHECK (duration_minutes > 0),
    type TEXT NOT NULL DEFAULT 'pomodoro' CHECK (type IN ('pomodoro', 'deep_work', 'review', 'quiz')),
    notes TEXT,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    mood TEXT NOT NULL DEFAULT 'focused' CHECK (mood IN ('energized', 'focused', 'neutral', 'tired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. STUDY GOALS TABLE (Learning targets, weekly milestones & progress)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.study_goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'hours' CHECK (category IN ('hours', 'weekly_hours', 'tasks', 'exam_score', 'exam_prep', 'grade', 'streak', 'syllabus')),
    target_value NUMERIC NOT NULL,
    current_value NUMERIC NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    target_date TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_study_goals_updated_at ON public.study_goals;
CREATE TRIGGER trg_study_goals_updated_at
    BEFORE UPDATE ON public.study_goals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 7. STUDY SCHEDULE BLOCKS TABLE (AI schedule blocks, time-blocking, techniques)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.study_schedule_blocks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 45 CHECK (duration_minutes > 0),
    technique TEXT,
    priority TEXT NOT NULL DEFAULT 'high' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_study_schedule_blocks_updated_at ON public.study_schedule_blocks;
CREATE TRIGGER trg_study_schedule_blocks_updated_at
    BEFORE UPDATE ON public.study_schedule_blocks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 8. NOTES & RESOURCES TABLE (Lecture notes, cheat-sheets, resource links)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notes_resources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_notes_resources_updated_at ON public.notes_resources;
CREATE TRIGGER trg_notes_resources_updated_at
    BEFORE UPDATE ON public.notes_resources
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 9. STUDENT PROFILE TABLE (Student profile, target GPA, streaks & settings)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id TEXT PRIMARY KEY DEFAULT 'default-student',
    name TEXT NOT NULL DEFAULT 'Alex Rivera',
    institution TEXT NOT NULL DEFAULT 'State University',
    major TEXT NOT NULL DEFAULT 'Computer Science & Pre-Med',
    target_gpa TEXT NOT NULL DEFAULT '3.90',
    weekly_goal_hours NUMERIC NOT NULL DEFAULT 20,
    preferred_study_style TEXT NOT NULL DEFAULT 'Active Recall & Pomodoro',
    streak_count INTEGER NOT NULL DEFAULT 7,
    longest_streak INTEGER NOT NULL DEFAULT 14,
    last_study_date TEXT NOT NULL DEFAULT '2026-09-15',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER trg_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_subject_id ON public.study_tasks(subject_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.study_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.study_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.study_tasks(priority);

CREATE INDEX IF NOT EXISTS idx_exams_subject_id ON public.exams(subject_id);
CREATE INDEX IF NOT EXISTS idx_exams_date ON public.exams(date);

CREATE INDEX IF NOT EXISTS idx_assignments_subject_id ON public.assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.assignments(status);

CREATE INDEX IF NOT EXISTS idx_sessions_subject_id ON public.study_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_sessions_task_id ON public.study_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON public.study_sessions(date);

CREATE INDEX IF NOT EXISTS idx_schedule_date ON public.study_schedule_blocks(date);
CREATE INDEX IF NOT EXISTS idx_schedule_subject_id ON public.study_schedule_blocks(subject_id);

CREATE INDEX IF NOT EXISTS idx_notes_subject_id ON public.notes_resources(subject_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Allow read & write access for authenticated users, service role, and anon client
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public access to subjects" ON public.subjects;
    CREATE POLICY "Public access to subjects" ON public.subjects FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to tasks" ON public.study_tasks;
    CREATE POLICY "Public access to tasks" ON public.study_tasks FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to exams" ON public.exams;
    CREATE POLICY "Public access to exams" ON public.exams FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to assignments" ON public.assignments;
    CREATE POLICY "Public access to assignments" ON public.assignments FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to sessions" ON public.study_sessions;
    CREATE POLICY "Public access to sessions" ON public.study_sessions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to goals" ON public.study_goals;
    CREATE POLICY "Public access to goals" ON public.study_goals FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to schedule" ON public.study_schedule_blocks;
    CREATE POLICY "Public access to schedule" ON public.study_schedule_blocks FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to notes" ON public.notes_resources;
    CREATE POLICY "Public access to notes" ON public.notes_resources FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to profiles" ON public.student_profiles;
    CREATE POLICY "Public access to profiles" ON public.student_profiles FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ==============================================================================
-- INITIAL SEED / MIGRATION DATA
-- ==============================================================================
INSERT INTO public.subjects (id, name, code, color, icon_name, professor, credits, target_grade, current_grade, difficulty, confidence_level, syllabus_topics)
VALUES 
    ('sub-1', 'Organic Chemistry II', 'CHEM 232', '#6366f1', 'FlaskConical', 'Dr. Sarah Vance', 4, 'A', 'B+', 'hard', 2, '["Stereochemistry & Enantiomers", "Electrophilic Aromatic Substitution", "NMR & IR Spectroscopy", "Carboxylic Acids & Derivatives", "Aldol & Claisen Condensations"]'::jsonb),
    ('sub-2', 'Data Structures & Algorithms', 'CS 301', '#0ea5e9', 'Binary', 'Prof. Alan Turing', 4, 'A', 'A', 'hard', 4, '["Asymptotic Analysis & Big O", "Self-Balancing Binary Search Trees", "Graph Algorithms (Dijkstra, Bellman-Ford)", "Dynamic Programming & Memoization", "NP-Completeness & Approximation"]'::jsonb),
    ('sub-3', 'Macroeconomics', 'ECON 202', '#10b981', 'BarChart3', 'Dr. Robert Solow', 3, 'A-', 'A', 'medium', 4, '["Aggregate Demand & Supply Model", "IS-LM Equilibrium", "Monetary & Fiscal Multipliers", "Phillips Curve & Inflation Dynamics", "Solow-Swan Economic Growth Model"]'::jsonb),
    ('sub-4', 'Cellular & Molecular Biology', 'BIO 210', '#ec4899', 'Dna', 'Dr. Rosalind Franklin', 4, 'A', 'A-', 'medium', 3, '["Cell Membrane Transport Mechanisms", "Glycolysis, Krebs Cycle & ATP Synthase", "DNA Replication & Repair Enzymes", "Transcriptional Regulation & Operons", "Signal Transduction Pathways"]'::jsonb),
    ('sub-5', 'Linear Algebra & Matrices', 'MATH-2210', '#0ea5e9', 'Binary', 'Dr. Isaac Thorne', 4, 'A', 'A-', 'hard', 4, '["Vector Spaces & Subspaces", "Matrix Factorizations (LU, QR)", "Eigenvalues & Diagonalization", "Orthogonality & Gram-Schmidt", "Singular Value Decomposition (SVD)"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    color = EXCLUDED.color,
    icon_name = EXCLUDED.icon_name,
    credits = EXCLUDED.credits,
    current_grade = EXCLUDED.current_grade,
    updated_at = NOW();

INSERT INTO public.study_tasks (id, title, subject_id, due_date, due_time, priority, status, estimated_minutes, actual_minutes, type, notes)
VALUES
    ('task-1', 'Complete Problem Set 4: Electrophilic Substitution Mechanisms', 'sub-1', '2026-09-17', '23:59', 'urgent', 'in_progress', 60, 25, 'homework', 'Draw out complete arrow-pushing mechanisms for Friedel-Crafts acylation and sulfonation problems.'),
    ('task-2', 'Implement Red-Black Tree Deletion & Rebalancing', 'sub-2', '2026-09-18', '17:00', 'high', 'todo', 90, 0, 'assignment', 'Handle double-black cases in Java and verify rotation invariance using unit tests.'),
    ('task-3', 'Read Chapter 12: Central Bank Monetary Policy Multipliers', 'sub-3', '2026-09-19', '12:00', 'medium', 'todo', 45, 0, 'reading', 'Highlight differences between quantitative easing and conventional open-market bond operations.'),
    ('task-4', 'Active Recall Review: Electron Transport Chain & ATP Synthase', 'sub-4', '2026-09-16', '20:00', 'high', 'in_progress', 45, 20, 'revision', 'Trace H+ electrochemical proton gradient across inner mitochondrial membrane.'),
    ('task-5', 'Practice Midterm 2 Mock Exam Questions', 'sub-1', '2026-09-20', '18:00', 'urgent', 'todo', 120, 0, 'practice', 'Timed 2-hour practice exam under strict exam conditions without mechanism sheet.')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    status = EXCLUDED.status,
    priority = EXCLUDED.priority,
    actual_minutes = EXCLUDED.actual_minutes,
    updated_at = NOW();

INSERT INTO public.exams (id, title, subject_id, date, time, duration_minutes, weight_percentage, location, topics_to_cover, readiness_score, notes)
VALUES
    ('exam-1', 'Midterm Examination II', 'sub-1', '2026-09-22', '09:00', 120, 30, 'Hall B - Science Complex', '[{"topic": "Stereochemistry & Chiral Centers", "mastered": true}, {"topic": "Electrophilic Aromatic Reactions", "mastered": false}, {"topic": "Spectroscopic Structure Elucidation", "mastered": false}, {"topic": "Conjugated Dienes & Diels-Alder", "mastered": true}]'::jsonb, 55, 'Allowed items: Molecular model kit, non-programmable scientific calculator. No formula sheets.'),
    ('exam-2', 'Algorithms Comprehensive Midterm', 'sub-2', '2026-09-28', '14:30', 90, 25, 'Auditorium 101 - CS Center', '[{"topic": "Master Theorem & Recurrence Relations", "mastered": true}, {"topic": "AVL & Red-Black Trees", "mastered": true}, {"topic": "Dijkstra & Prim-Jarnik Algorithms", "mastered": true}, {"topic": "Dynamic Programming (Knapsack & LCS)", "mastered": false}]'::jsonb, 78, 'One double-sided handwritten 8.5x11 reference sheet allowed.'),
    ('exam-3', 'Macroeconomic Policy Term Exam', 'sub-3', '2026-10-05', '11:00', 75, 20, 'Social Sciences 304', '[{"topic": "Classical vs Keynesian AS/AD", "mastered": true}, {"topic": "IS-LM Equilibrium Equations", "mastered": true}, {"topic": "Central Bank Balance Sheets", "mastered": false}]'::jsonb, 82, 'Multiple choice + 3 analytical policy free-response questions.')
ON CONFLICT (id) DO UPDATE SET
    readiness_score = EXCLUDED.readiness_score,
    topics_to_cover = EXCLUDED.topics_to_cover,
    updated_at = NOW();

INSERT INTO public.assignments (id, title, subject_id, due_date, due_time, status, score, max_score, weight, description)
VALUES
    ('asg-1', 'Programming Project 2: Network Routing with Dijkstra', 'sub-2', '2026-09-18', '23:59', 'in_progress', NULL, 100, 20, 'Build an efficient graph routing simulator handling at least 100,000 vertices within 200ms.'),
    ('asg-2', 'Organic Chemistry Synthesis Portfolio', 'sub-1', '2026-09-25', '17:00', 'not_started', NULL, 50, 15, 'Multi-step retrosynthetic pathways for 3 target pharmaceutical compounds.'),
    ('asg-3', 'Fiscal Policy Macroeconomic Case Study', 'sub-3', '2026-09-15', '23:59', 'submitted', 94, 100, 10, 'Analysis of 2008 vs 2020 fiscal response multipliers on GDP recovery rates.')
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    score = EXCLUDED.score,
    updated_at = NOW();

INSERT INTO public.study_sessions (id, subject_id, task_id, date, duration_minutes, type, notes, rating, mood)
VALUES
    ('sess-1', 'sub-2', 'task-2', NOW() - INTERVAL '4 hours', 50, 'pomodoro', 'Completed Red-black tree left and right rotations correctly.', 5, 'focused'),
    ('sess-2', 'sub-1', 'task-1', NOW() - INTERVAL '1 day', 45, 'deep_work', 'Worked on aromatic substitution mechanism arrow pushing.', 4, 'energized'),
    ('sess-3', 'sub-4', 'task-4', NOW() - INTERVAL '2 days', 35, 'review', 'Active recall on mitochondrial ATP synthase subunits.', 4, 'focused'),
    ('sess-4', 'sub-3', NULL, NOW() - INTERVAL '3 days', 60, 'deep_work', 'Finalized macroeconomic case study draft citations.', 5, 'focused')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.study_goals (id, title, category, target_value, current_value, unit, target_date, completed)
VALUES
    ('goal-1', 'Complete 20 Hours of Focused Study This Week', 'weekly_hours', 20, 14.5, 'hours', '2026-09-20', FALSE),
    ('goal-2', 'Achieve 85%+ Readiness for Chemistry Midterm', 'exam_score', 85, 55, '%', '2026-09-22', FALSE),
    ('goal-3', 'Maintain 14-Day Study Consistency Streak', 'streak', 14, 7, 'days', '2026-09-27', FALSE),
    ('goal-4', 'Master 100% of Data Structures Syllabus Modules', 'syllabus', 100, 80, '%', '2026-10-01', FALSE)
ON CONFLICT (id) DO UPDATE SET
    current_value = EXCLUDED.current_value,
    completed = EXCLUDED.completed,
    updated_at = NOW();

INSERT INTO public.study_schedule_blocks (id, title, subject_id, date, start_time, end_time, duration_minutes, technique, priority, completed, notes)
VALUES
    ('blk-1', 'Deep Work: Reaction Mechanism Synthesis', 'sub-1', '2026-09-16', '09:00', '09:50', 50, 'Active Recall & Mapping', 'urgent', TRUE, 'Finished Friedel-Crafts and benzene nitration.'),
    ('blk-2', 'Coding Sprint: Red-Black Tree Rebalance', 'sub-2', '2026-09-16', '10:15', '11:15', 60, 'Pomodoro Technique', 'high', FALSE, 'Focus on double-black node recoloring.'),
    ('blk-3', 'Macro Reading: Fiscal Stimulus Multipliers', 'sub-3', '2026-09-16', '13:30', '14:15', 45, 'Feynman Technique', 'medium', FALSE, 'Explain liquidity trap concept in simple terms.'),
    ('blk-4', 'Active Recall: Electron Transport Chain', 'sub-4', '2026-09-16', '15:00', '15:45', 45, 'Spaced Repetition', 'high', FALSE, 'Trace proton pump complex I, III, and IV.')
ON CONFLICT (id) DO UPDATE SET
    completed = EXCLUDED.completed,
    updated_at = NOW();

INSERT INTO public.notes_resources (id, title, subject_id, content, tags, url)
VALUES
    ('note-1', 'Aromatic Substitution Cheat Sheet', 'sub-1', E'# Electrophilic Aromatic Substitution (EAS)\n\n### Activating Groups (Ortho/Para Directors)\n- Strongly Activating: -OH, -NH2, -NR2\n- Moderately Activating: -OCH3, -NHCOCH3\n- Weakly Activating: -CH3, -R\n\n### Deactivating Groups (Meta Directors)\n- Strongly Deactivating: -NO2, -CF3, -NR3+\n- Moderately Deactivating: -CN, -SO3H, -CHO, -COR, -COOH\n\n*Exception:* Halogens (-F, -Cl, -Br, -I) are weakly deactivating but ortho/para directing due to resonance electron donation.', '["chemistry", "reactions", "midterm-prep"]'::jsonb, 'https://chem.libretexts.org'),
    ('note-2', 'Red-Black Tree Invariants & Rotation Rules', 'sub-2', E'# Red-Black Tree Invariants\n\n1. Every node is either **RED** or **BLACK**.\n2. The root node is always **BLACK**.\n3. Every leaf (NIL node) is **BLACK**.\n4. If a node is **RED**, both its children must be **BLACK** (no two consecutive red nodes).\n5. Every simple path from a node to descendant leaves contains the same number of **BLACK** nodes (Black-Height).', '["data-structures", "trees", "algorithms"]'::jsonb, 'https://en.wikipedia.org/wiki/Red%E2%80%93black_tree'),
    ('note-3', 'Solow-Swan Growth Equation Summary', 'sub-3', E'# Solow-Swan Growth Model\n\n- Production function: Y = F(K, L) = A * K^alpha * L^(1-alpha)\n- Capital accumulation equation: dk/dt = s * f(k) - (n + g + delta) * k\n- Steady state condition: s * f(k*) = (n + g + delta) * k*', '["economics", "macro", "formulas"]'::jsonb, NULL)
ON CONFLICT (id) DO UPDATE SET
    content = EXCLUDED.content,
    tags = EXCLUDED.tags,
    updated_at = NOW();

INSERT INTO public.student_profiles (id, name, institution, major, target_gpa, weekly_goal_hours, preferred_study_style, streak_count, longest_streak, last_study_date)
VALUES
    ('default-student', 'Alex Rivera', 'State University', 'Computer Science & Pre-Med', '3.90', 20, 'Active Recall & Pomodoro', 7, 14, '2026-09-15')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    target_gpa = EXCLUDED.target_gpa,
    streak_count = EXCLUDED.streak_count,
    updated_at = NOW();
