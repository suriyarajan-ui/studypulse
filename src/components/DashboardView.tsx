import React from "react";
import { useStudy } from "../context/StudyContext";
import {
  Sparkles,
  Flame,
  Clock,
  Calendar,
  BookOpen,
  CheckCircle2,
  Circle,
  ArrowRight,
  TrendingUp,
  Play,
  Award,
  AlertCircle,
  ChevronRight,
  Zap,
} from "lucide-react";
import { PWAInstallButton } from "./PWAInstallButton";

export const DashboardView: React.FC<{
  onOpenNewTask: () => void;
  onOpenNewExam: () => void;
}> = ({ onOpenNewTask, onOpenNewExam }) => {
  const {
    profile,
    subjects,
    tasks,
    exams,
    assignments,
    sessions,
    scheduleBlocks,
    toggleScheduleBlockCompleted,
    toggleTaskStatus,
    weeklyHoursStudied,
    overallPerformanceGrade,
    setActiveTab,
    startTimer,
    setTimerSubject,
    setTimerTask,
  } = useStudy();

  // Filter tasks due today or urgent
  const todayTasks = tasks.filter((t) => t.status !== "completed");
  const urgentTasks = tasks.filter((t) => (t.priority === "urgent" || t.priority === "high") && t.status !== "completed");

  // Today's schedule blocks
  const todayDate = new Date().toISOString().split("T")[0];
  const todayBlocks = scheduleBlocks.filter((b) => b.date === todayDate || true).slice(0, 4);

  // Nearest upcoming exams
  const upcomingExams = [...exams].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  ).slice(0, 3);

  // Pending assignments
  const pendingAssignments = assignments.filter(
    (a) => a.status !== "submitted" && a.status !== "graded"
  ).slice(0, 3);

  // Recent completed sessions
  const recentSessions = sessions.slice(0, 4);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Personalized Welcome Banner with AI Recommendation */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-300 shrink-0" />
                Personalized Learning Coach Active
              </span>
              <span className="text-xs text-indigo-200/80">
                {profile.institution}
              </span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Ready to excel today, {profile.name}?
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              You have <span className="font-semibold text-white">{upcomingExams.length} exams</span> on the horizon and <span className="font-semibold text-white">{urgentTasks.length} high-priority tasks</span>. Your current recommendation: tackle Organic Chemistry reaction mechanisms before noon.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              id="dash-what-to-study-btn"
              onClick={() => setActiveTab("ai-coach")}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 active:bg-indigo-100 text-xs font-semibold shadow-md hover:shadow-lg transition-all min-h-[40px]"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>What Should I Study Next?</span>
            </button>

            <button
              id="dash-start-focus-btn"
              onClick={() => {
                setActiveTab("timer");
                startTimer();
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 active:bg-indigo-700 text-white border border-indigo-400/40 text-xs font-semibold transition-all min-h-[40px]"
            >
              <Play className="w-3.5 h-3.5 fill-white shrink-0" />
              <span>Launch Focus Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* PWA Install Banner if app is not yet installed */}
      <PWAInstallButton variant="banner" />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Weekly Study Hours */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Weekly Study Hours</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-slate-900">
              {weeklyHoursStudied}h
            </span>
            <span className="text-xs text-slate-400">/ {profile.weeklyGoalHours}h goal</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full"
              style={{
                width: `${Math.min(Math.round((weeklyHoursStudied / profile.weeklyGoalHours) * 100), 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Study Streak */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Active Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-slate-900">
              {profile.streakCount} Days
            </span>
            <span className="text-xs text-amber-600 font-medium">Best: {profile.longestStreak}d</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Keep studying today to protect your streak!
          </p>
        </div>

        {/* Upcoming Exams & Tests */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Exams & Deadlines</span>
            <Calendar className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-slate-900">
              {exams.length}
            </span>
            <span className="text-xs text-rose-600 font-medium">
              Next in {Math.max(1, Math.ceil((new Date(exams[0]?.date || Date.now()).getTime() - Date.now()) / (1000 * 3600 * 24)))}d
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {exams[0]?.title || "No scheduled exams"}
          </p>
        </div>

        {/* Academic Performance */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Overall Standing</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-xl text-slate-900 truncate">
              {overallPerformanceGrade.split(" ")[0]}
            </span>
            <span className="text-xs text-slate-500 truncate">GPA Target: {profile.targetGPA}</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">
            {overallPerformanceGrade}
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Study Plan & Active Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Study Schedule Checklist */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-slate-900 text-sm">
                    Today’s Intelligent Study Plan
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    AI-scheduled deep work blocks and high-impact reviews
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("schedule")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Full Calendar <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {todayBlocks.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No study blocks scheduled for today yet.
                </div>
              ) : (
                todayBlocks.map((block) => {
                  const subject = subjects.find((s) => s.id === block.subjectId);
                  return (
                    <div
                      key={block.id}
                      className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        block.completed
                          ? "bg-slate-50/70 border-slate-200 text-slate-400"
                          : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleScheduleBlockCompleted(block.id)}
                          className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          {block.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-semibold ${
                                block.completed ? "line-through text-slate-400" : "text-slate-800"
                              }`}
                            >
                              {block.title}
                            </span>
                            {subject && (
                              <span
                                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: `${subject.color}18`,
                                  color: subject.color,
                                }}
                              >
                                {subject.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              {block.startTime} - {block.endTime} ({block.durationMinutes}m)
                            </span>
                            {block.technique && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                                {block.technique}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {!block.completed && (
                        <button
                          onClick={() => {
                            if (subject) setTimerSubject(subject.id);
                            setActiveTab("timer");
                            startTimer();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 shrink-0"
                          title="Start timer for this block"
                        >
                          <Play className="w-3 h-3 fill-indigo-600" />
                          <span>Focus</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Want a freshly calculated routine?
              </span>
              <button
                onClick={() => setActiveTab("schedule")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate AI Day Plan
              </button>
            </div>
          </div>

          {/* Pending Tasks & Homework */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-slate-900 text-sm">
                    Active Study Tasks ({todayTasks.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Prioritized according to deadlines and exam weights
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenNewTask}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  + Add Task
                </button>
                <button
                  onClick={() => setActiveTab("tasks")}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {todayTasks.slice(0, 4).map((task) => {
                const subject = subjects.find((s) => s.id === task.subjectId);
                const isUrgent = task.priority === "urgent" || task.priority === "high";

                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-slate-200/80 hover:border-indigo-200 hover:bg-slate-50/50 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-800">
                            {task.title}
                          </span>
                          {subject && (
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${subject.color}15`,
                                color: subject.color,
                              }}
                            >
                              {subject.code}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                          <span>Due: {task.dueDate}</span>
                          <span>•</span>
                          <span>Est: {task.estimatedMinutes}m</span>
                          {task.actualMinutes > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-600 font-medium">
                                Studied: {task.actualMinutes}m
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isUrgent
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <button
                        onClick={() => {
                          if (subject) setTimerSubject(subject.id);
                          setTimerTask(task.id);
                          setActiveTab("timer");
                          startTimer();
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Study this task in focus timer"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Exams, Assignments & Subject Mastery */}
        <div className="space-y-6">
          {/* Upcoming Exams Countdown Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-sm">
                  Upcoming Exams
                </h3>
              </div>
              <button
                onClick={onOpenNewExam}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                + Add
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingExams.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No upcoming exams logged.
                </p>
              ) : (
                upcomingExams.map((exam) => {
                  const subject = subjects.find((s) => s.id === exam.subjectId);
                  const daysLeft = Math.ceil(
                    (new Date(exam.date).getTime() - Date.now()) / (1000 * 3600 * 24)
                  );

                  return (
                    <div
                      key={exam.id}
                      className="p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/40 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">
                            {exam.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            {subject && (
                              <span
                                className="font-semibold"
                                style={{ color: subject.color }}
                              >
                                {subject.code}
                              </span>
                            )}
                            <span>•</span>
                            <span>{exam.date} at {exam.time}</span>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            daysLeft <= 3
                              ? "bg-rose-100 text-rose-700 font-mono"
                              : "bg-amber-100 text-amber-800 font-mono"
                          }`}
                        >
                          {daysLeft <= 0 ? "Today" : `${daysLeft}d left`}
                        </span>
                      </div>

                      {/* Readiness Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Exam Readiness</span>
                          <span className="font-semibold text-slate-700">
                            {exam.readinessScore}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              exam.readinessScore >= 80
                                ? "bg-emerald-500"
                                : exam.readinessScore >= 60
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${exam.readinessScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-2">
              <button
                onClick={() => setActiveTab("exams")}
                className="w-full py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1"
              >
                <span>View Exam Preparation Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Subject-Wise Performance & Confidence */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-sm">
                  Subject Confidence Matrix
                </h3>
              </div>
              <button
                onClick={() => setActiveTab("subjects")}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                All Subjects →
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: subject.color }}
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-800 leading-tight">
                        {subject.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Grade: <strong className="text-slate-600">{subject.currentGrade}</strong> (Target: {subject.targetGrade})
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-semibold text-slate-500">
                      Confidence
                    </div>
                    <div className="flex items-center gap-0.5 mt-0.5 justify-end">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`w-1.5 h-1.5 rounded-full ${
                            star <= subject.confidenceLevel
                              ? "bg-indigo-600"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Completed Sessions */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-sm">
                  Recent Focus Logs
                </h3>
              </div>
              <button
                onClick={() => setActiveTab("analytics")}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Analytics
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {recentSessions.map((session) => {
                const sub = subjects.find((s) => s.id === session.subjectId);
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">
                        {sub?.name || "General Study"}
                      </span>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {session.notes || `${session.type} session`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-indigo-600">
                        {session.durationMinutes}m
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {session.rating} ★ • {session.mood}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
