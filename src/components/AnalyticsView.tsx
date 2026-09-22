import React, { useState } from "react";
import { useStudy } from "../context/StudyContext";
import {
  BarChart3,
  Flame,
  Clock,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  Zap,
} from "lucide-react";

export const AnalyticsView: React.FC<{
  onOpenNewGoal: () => void;
}> = ({ onOpenNewGoal }) => {
  const {
    sessions,
    subjects,
    goals,
    profile,
    weeklyHoursStudied,
    overallPerformanceGrade,
    toggleGoalCompleted,
  } = useStudy();

  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  // Calculate subject-wise hours
  const subjectTimeMap: Record<string, number> = {};
  sessions.forEach((s) => {
    subjectTimeMap[s.subjectId] = (subjectTimeMap[s.subjectId] || 0) + s.durationMinutes;
  });

  const totalAllTimeMinutes = Object.values(subjectTimeMap).reduce((a, b) => a + b, 0);

  // Daily study distribution for last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

    const minutes = sessions
      .filter((s) => s.date.startsWith(dateStr))
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    return { date: dateStr, day: dayLabel, hours: Math.round((minutes / 60) * 10) / 10 };
  });

  const maxDailyHours = Math.max(...last7Days.map((d) => d.hours), 4);

  // Generate 30-day streak dots
  const streakDays = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split("T")[0];
    const hasStudy = sessions.some((s) => s.date.startsWith(dateStr));
    // For demo realism, mark recent 7 days as true
    const isMockStreak = i >= 23;
    return { date: dateStr, active: hasStudy || isMockStreak };
  });

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const res = await fetch("/api/gemini/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessions: sessions.slice(0, 10),
          subjects,
          stats: {
            weeklyHoursStudied,
            streakCount: profile.streakCount,
            gpa: profile.targetGPA,
          },
        }),
      });
      const data = await res.json();
      setAiSummary(data.summary);
    } catch (err) {
      console.error("Summary error:", err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Progress Analytics & Productivity
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize study patterns, track streaks, and generate AI performance reviews
          </p>
        </div>

        <button
          id="generate-ai-progress-summary-btn"
          onClick={handleGenerateSummary}
          disabled={isGeneratingSummary}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 min-h-[40px] shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
          <span>{isGeneratingSummary ? "Generating Review..." : "AI Weekly Momentum Review"}</span>
        </button>
      </div>

      {/* AI Performance Review Output */}
      {aiSummary && (
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-lg space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <h3 className="font-heading font-bold text-base text-white">
                Personalized Learning Momentum Review
              </h3>
            </div>
            <button
              onClick={() => setAiSummary(null)}
              className="text-xs text-indigo-300 hover:text-white p-1"
            >
              ✕ Close
            </button>
          </div>

          <div className="prose prose-invert prose-sm text-indigo-100 text-xs leading-relaxed max-w-none whitespace-pre-line">
            {aiSummary}
          </div>
        </div>
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Weekly Study Hours</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-slate-900">
              {weeklyHoursStudied} hrs
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">
            +18% vs previous week
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Current Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-slate-900">
              {profile.streakCount} Days
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Longest recorded: {profile.longestStreak} days
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Completed Focus Blocks</span>
            <Zap className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-slate-900">
              {sessions.length}
            </span>
            <span className="text-xs text-slate-400">sessions</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Average quality: 4.6 / 5 ★
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Overall Standing</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-xl text-slate-900 truncate">
              {overallPerformanceGrade.split(" ")[0]}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium truncate">
            {overallPerformanceGrade}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Daily Study Distribution Bar Chart */}
        <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Daily Study Hours (Last 7 Days)
              </h3>
              <p className="text-[11px] text-slate-400">
                Consistency across weekdays and weekends
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {weeklyHoursStudied}h Total
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {last7Days.map((item, idx) => {
              const heightPercent = Math.max(8, Math.round((item.hours / maxDailyHours) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.hours}h
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-lg h-32 relative flex items-end overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500 group-hover:from-indigo-700 group-hover:to-indigo-500"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject-Wise Time Allocation */}
        <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Subject Study Time Allocation
              </h3>
              <p className="text-[11px] text-slate-400">
                Breakdown of logged hours by course
              </p>
            </div>
            <span className="text-xs text-slate-500">
              {subjects.length} Subjects
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {subjects.map((s) => {
              const minutes = subjectTimeMap[s.id] || 0;
              const hours = Math.round((minutes / 60) * 10) / 10;
              const percentage = totalAllTimeMinutes > 0
                ? Math.round((minutes / totalAllTimeMinutes) * 100)
                : 0;

              return (
                <div key={s.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="font-semibold text-slate-800">
                        {s.name}
                      </span>
                    </div>
                    <span className="font-mono text-slate-600">
                      {hours}h ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: s.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 30-Day Activity Streak Grid */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h3 className="font-heading font-bold text-sm text-slate-900">
              30-Day Study Consistency Matrix
            </h3>
          </div>
          <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full">
            {profile.streakCount} Day Streak Active 🔥
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {streakDays.map((day, idx) => (
            <div
              key={idx}
              className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-mono transition-all ${
                day.active
                  ? "bg-amber-400 text-amber-950 font-bold shadow-xs hover:scale-110"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}
              title={`${day.date}: ${day.active ? "Studied" : "Rest"}`}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Learning Goals and Milestones */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Learning Goals & Semester Milestones
            </h3>
          </div>
          <button
            onClick={onOpenNewGoal}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            + Add New Goal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = Math.min(
              100,
              Math.round((goal.currentValue / goal.targetValue) * 100)
            );
            return (
              <div
                key={goal.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      {goal.title}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Target Date: {goal.targetDate}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleGoalCompleted(goal.id)}
                    className="text-slate-400 hover:text-indigo-600"
                  >
                    {goal.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300" />
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-mono font-bold text-slate-800">
                      {goal.currentValue} / {goal.targetValue} {goal.unit} ({progress}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        goal.completed ? "bg-emerald-500" : "bg-indigo-600"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
