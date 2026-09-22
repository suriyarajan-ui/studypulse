import React, { useState } from "react";
import { useStudy } from "../context/StudyContext";
import {
  Calendar,
  Clock,
  Sparkles,
  Plus,
  CheckCircle2,
  Circle,
  Play,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { StudyScheduleBlock } from "../types";

export const ScheduleView: React.FC<{
  onOpenNewBlock: () => void;
}> = ({ onOpenNewBlock }) => {
  const {
    scheduleBlocks,
    subjects,
    exams,
    tasks,
    toggleScheduleBlockCompleted,
    deleteScheduleBlock,
    batchAddScheduleBlocks,
    setTimerSubject,
    setActiveTab,
    startTimer,
  } = useStudy();

  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<{
    title: string;
    summary: string;
    blocks: any[];
    coachTips: string[];
  } | null>(null);

  // Helper to format date string
  const getDateForOffset = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
  };

  const selectedDateStr = getDateForOffset(selectedDayOffset);

  // Filter blocks for selected date
  const blocksForDay = scheduleBlocks.filter((b) => b.date === selectedDateStr);

  // AI Plan Generator handler
  const handleGenerateAIPlan = async (timeframe: "daily" | "weekly") => {
    setIsGeneratingPlan(true);
    try {
      const res = await fetch("/api/gemini/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeframe,
          targetHours: 4,
          subjects,
          exams,
          tasks,
        }),
      });
      const data = await res.json();
      setGeneratedPlan(data);
    } catch (err) {
      console.error("Failed to generate plan:", err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleApplyAIPlan = () => {
    if (!generatedPlan || !generatedPlan.blocks) return;

    const newBlocks: Omit<StudyScheduleBlock, "id">[] = generatedPlan.blocks.map(
      (b: any) => {
        const matchedSubject = subjects.find(
          (s) =>
            s.name.toLowerCase().includes(b.subject.toLowerCase()) ||
            b.subject.toLowerCase().includes(s.name.toLowerCase())
        );

        const [start = "09:00", end = "10:00"] = (b.timeSlot || "").split(" - ");

        return {
          title: `${b.topic} (${b.technique || "Active Study"})`,
          subjectId: matchedSubject?.id || subjects[0]?.id || "sub-1",
          date: selectedDateStr,
          startTime: start.trim(),
          endTime: end.trim(),
          durationMinutes: b.durationMinutes || 50,
          technique: b.technique || "Pomodoro",
          priority: b.priority || "high",
          completed: false,
          notes: b.learningObjective || b.reasonWhyRecommended,
        };
      }
    );

    batchAddScheduleBlocks(newBlocks);
    setGeneratedPlan(null);
  };

  const daysOfWeek = [-1, 0, 1, 2, 3, 4, 5];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Study Schedule & Timetable
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured daily and weekly study blocks powered by personalized AI scheduling
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            id="generate-ai-plan-btn"
            onClick={() => handleGenerateAIPlan("daily")}
            disabled={isGeneratingPlan}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 text-xs font-semibold transition-colors disabled:opacity-50 min-h-[40px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{isGeneratingPlan ? "Synthesizing AI Plan..." : "AI Generate Schedule"}</span>
          </button>

          <button
            id="add-schedule-block-btn"
            onClick={onOpenNewBlock}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-sm transition-all min-h-[40px]"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Study Block</span>
          </button>
        </div>
      </div>

      {/* Generated AI Study Plan Preview Modal / Panel */}
      {generatedPlan && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/40 text-indigo-200 border border-indigo-400/30">
                  AI Recommended Schedule
                </span>
                <span className="text-xs text-indigo-200">
                  Target: {Math.round((generatedPlan.blocks.reduce((acc, b) => acc + (b.durationMinutes || 0), 0) / 60) * 10) / 10} hours
                </span>
              </div>
              <h3 className="font-heading font-bold text-lg text-white">
                {generatedPlan.title}
              </h3>
              <p className="text-xs text-indigo-200 leading-relaxed max-w-2xl">
                {generatedPlan.summary}
              </p>
            </div>

            <button
              onClick={() => setGeneratedPlan(null)}
              className="text-indigo-300 hover:text-white text-xs p-1"
            >
              ✕ Close
            </button>
          </div>

          {/* Blocks List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {generatedPlan.blocks.map((b: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">
                    {b.subject}: {b.topic}
                  </span>
                  <span className="font-mono text-indigo-200 font-semibold">
                    {b.timeSlot}
                  </span>
                </div>
                <p className="text-xs text-indigo-100/90 leading-relaxed">
                  {b.learningObjective}
                </p>
                <div className="flex items-center justify-between text-[11px] text-indigo-300 pt-1">
                  <span>Method: {b.technique}</span>
                  <span className="text-amber-300 capitalize font-medium">
                    {b.priority} Priority
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Coach Tips */}
          {generatedPlan.coachTips && (
            <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-xs text-indigo-200 space-y-1">
              <span className="font-bold text-indigo-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                Coach Productivity Tips:
              </span>
              <ul className="list-disc pl-5 space-y-0.5 text-indigo-200/90">
                {generatedPlan.coachTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setGeneratedPlan(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-200 hover:text-white"
            >
              Discard
            </button>
            <button
              id="apply-ai-plan-btn"
              onClick={handleApplyAIPlan}
              className="px-5 py-2 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Apply to {selectedDateStr === getDateForOffset(0) ? "Today's" : "Selected"} Schedule</span>
            </button>
          </div>
        </div>
      )}

      {/* Days Strip Navigator */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/80 p-2 overflow-x-auto touch-pan-x scrollbar-none gap-2">
        {daysOfWeek.map((offset) => {
          const d = new Date();
          d.setDate(d.getDate() + offset);
          const isSelected = selectedDayOffset === offset;
          const isToday = offset === 0;

          return (
            <button
              key={offset}
              onClick={() => setSelectedDayOffset(offset)}
              className={`flex-1 min-w-[80px] sm:min-w-[90px] py-2.5 px-2.5 sm:px-3 rounded-xl text-center transition-all flex flex-col items-center gap-1 shrink-0 ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-sm font-semibold"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                {d.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="font-heading text-lg font-bold">
                {d.getDate()}
              </span>
              {isToday && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    isSelected ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-700"
                  }`}
                >
                  TODAY
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Timetable Blocks for Selected Day */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="font-heading font-bold text-sm text-slate-800">
              Schedule for {new Date(selectedDateStr + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {blocksForDay.length} study block{blocksForDay.length === 1 ? "" : "s"} scheduled
          </span>
        </div>

        {blocksForDay.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">
              No study sessions scheduled for this date.
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click "+ Add Study Block" or use the "AI Generate Schedule" tool above to build your daily routine!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {blocksForDay.map((block) => {
              const subject = subjects.find((s) => s.id === block.subjectId);
              return (
                <div
                  key={block.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    block.completed
                      ? "bg-slate-50 border-slate-200 text-slate-400 opacity-80"
                      : "bg-white border-slate-200 hover:border-indigo-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleScheduleBlockCompleted(block.id)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {block.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold ${
                            block.completed ? "line-through text-slate-400" : "text-slate-900"
                          }`}
                        >
                          {block.title}
                        </span>
                        {subject && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${subject.color}15`,
                              color: subject.color,
                            }}
                          >
                            {subject.name}
                          </span>
                        )}
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            block.priority === "urgent"
                              ? "bg-rose-100 text-rose-700"
                              : block.priority === "high"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {block.priority}
                        </span>
                      </div>

                      {block.notes && (
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {block.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="font-mono font-medium text-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {block.startTime} - {block.endTime} ({block.durationMinutes} min)
                        </span>
                        {block.technique && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[10px]">
                            Method: {block.technique}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!block.completed && (
                      <button
                        onClick={() => {
                          if (subject) setTimerSubject(subject.id);
                          setActiveTab("timer");
                          startTimer();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3 h-3 fill-indigo-600" />
                        <span>Start Session</span>
                      </button>
                    )}
                    <button
                      onClick={() => deleteScheduleBlock(block.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
