import React, { useState } from "react";
import { useStudy } from "../context/StudyContext";
import {
  CheckSquare,
  Plus,
  Sparkles,
  Search,
  Filter,
  Circle,
  CheckCircle2,
  Clock,
  Play,
  Trash2,
  Calendar,
  AlertCircle,
  FileCheck,
  ChevronDown,
} from "lucide-react";
import { PriorityLevel, TaskStatus } from "../types";

export const TasksView: React.FC<{
  onOpenNewTask: () => void;
  onOpenNewAssignment: () => void;
}> = ({ onOpenNewTask, onOpenNewAssignment }) => {
  const {
    tasks,
    subjects,
    assignments,
    toggleTaskStatus,
    deleteTask,
    updateAssignment,
    deleteAssignment,
    setActiveTab,
    setTimerSubject,
    setTimerTask,
    startTimer,
    searchQuery,
  } = useStudy();

  const [activeStatusTab, setActiveStatusTab] = useState<"all" | TaskStatus>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"tasks" | "assignments">("tasks");
  const [localSearch, setLocalSearch] = useState<string>("");

  // AI prioritization state
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [priorityAnalysis, setPriorityAnalysis] = useState<{
    topRecommendation: string;
    rationale: string;
  } | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (activeStatusTab !== "all" && task.status !== activeStatusTab) return false;
    if (selectedSubject !== "all" && task.subjectId !== selectedSubject) return false;
    if (selectedPriority !== "all" && task.priority !== selectedPriority) return false;

    const term = (localSearch || searchQuery).toLowerCase();
    if (term) {
      const matchTitle = task.title.toLowerCase().includes(term);
      const matchSubject = subjects.find((s) => s.id === task.subjectId)?.name.toLowerCase().includes(term);
      const matchNotes = task.notes?.toLowerCase().includes(term);
      if (!matchTitle && !matchSubject && !matchNotes) return false;
    }
    return true;
  });

  // Filter assignments
  const filteredAssignments = assignments.filter((asg) => {
    if (selectedSubject !== "all" && asg.subjectId !== selectedSubject) return false;
    const term = (localSearch || searchQuery).toLowerCase();
    if (term) {
      const matchTitle = asg.title.toLowerCase().includes(term);
      const matchDesc = asg.description?.toLowerCase().includes(term);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const handleAIPrioritize = async () => {
    setIsPrioritizing(true);
    try {
      const res = await fetch("/api/gemini/prioritize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: tasks.filter((t) => t.status !== "completed"),
          subjects,
        }),
      });
      const data = await res.json();
      setPriorityAnalysis({
        topRecommendation: data.topRecommendation || "Focus on Organic Chemistry and Algorithm implementations first.",
        rationale: data.rationale || "Highest weighted deliverables with closest deadlines.",
      });
    } catch (err) {
      console.error("AI Prioritize error:", err);
      setPriorityAnalysis({
        topRecommendation: "Target your Organic Chemistry reaction mechanisms and Programming Project 2 first.",
        rationale: "They combine the highest grade weight and nearest deadlines.",
      });
    } finally {
      setIsPrioritizing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Tasks, Assignments & Homework
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize coursework, prioritize high-yield milestones, and track deadlines
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            id="ai-auto-prioritize-btn"
            onClick={handleAIPrioritize}
            disabled={isPrioritizing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 text-xs font-semibold transition-colors disabled:opacity-50 min-h-[40px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{isPrioritizing ? "Analyzing Workload..." : "AI Auto-Prioritize"}</span>
          </button>

          {viewMode === "tasks" ? (
            <button
              id="add-task-btn"
              onClick={onOpenNewTask}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-sm transition-all min-h-[40px]"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Add Study Task</span>
            </button>
          ) : (
            <button
              id="add-assignment-btn"
              onClick={onOpenNewAssignment}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-sm transition-all min-h-[40px]"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Add Assignment</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Prioritization Recommendation Banner */}
      {priorityAnalysis && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-sky-50 to-indigo-50 border border-indigo-200/80 shadow-xs flex items-start justify-between gap-4 animate-in fade-in duration-150">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-heading font-bold text-sm text-indigo-950">
                  AI Coach Prioritization
                </h4>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-800">
                  Smart Plan
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800">
                {priorityAnalysis.topRecommendation}
              </p>
              <p className="text-xs text-slate-600">
                {priorityAnalysis.rationale}
              </p>
            </div>
          </div>
          <button
            onClick={() => setPriorityAnalysis(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* View Switcher: Study Tasks vs Major Assignments */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto touch-pan-x pb-0.5 scrollbar-none">
          <button
            onClick={() => setViewMode("tasks")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 min-h-[38px] ${
              viewMode === "tasks"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Study Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setViewMode("assignments")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 min-h-[38px] ${
              viewMode === "assignments"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Assignments & Projects ({assignments.length})
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Subject selector */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 outline-none focus:border-indigo-500 min-h-[38px]"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {viewMode === "tasks" && (
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 outline-none focus:border-indigo-500 min-h-[38px]"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          )}
        </div>
      </div>

      {viewMode === "tasks" ? (
        <div className="space-y-4">
          {/* Status Sub-tabs */}
          <div className="flex items-center gap-2 overflow-x-auto touch-pan-x pb-1 scrollbar-none">
            {(["all", "todo", "in_progress", "completed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveStatusTab(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all shrink-0 min-h-[32px] ${
                  activeStatusTab === tab
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab === "all" ? "All Tasks" : tab.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Tasks List */}
          <div className="space-y-2.5">
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No tasks found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust your search or click "+ Add Study Task" to log a new task.
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const subject = subjects.find((s) => s.id === task.subjectId);
                const isDone = task.status === "completed";

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDone
                        ? "bg-slate-50/70 border-slate-200 opacity-70"
                        : "bg-white border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-semibold ${
                              isDone ? "line-through text-slate-400" : "text-slate-900"
                            }`}
                          >
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
                              {subject.name}
                            </span>
                          )}
                          <span
                            className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              task.priority === "urgent"
                                ? "bg-rose-100 text-rose-700"
                                : task.priority === "high"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 capitalize">
                            {task.type}
                          </span>
                        </div>

                        {task.notes && (
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {task.notes}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-slate-400 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Due: {task.dueDate} {task.dueTime ? `at ${task.dueTime}` : ""}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Est: {task.estimatedMinutes}m
                          </span>
                          {task.actualMinutes > 0 && (
                            <span className="font-medium text-indigo-600">
                              Logged: {task.actualMinutes}m
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!isDone && (
                        <button
                          onClick={() => {
                            if (subject) setTimerSubject(subject.id);
                            setTimerTask(task.id);
                            setActiveTab("timer");
                            startTimer();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Play className="w-3 h-3 fill-indigo-600" />
                          <span>Focus Timer</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Assignments & Projects View */
        <div className="space-y-3">
          {filteredAssignments.map((asg) => {
            const subject = subjects.find((s) => s.id === asg.subjectId);
            return (
              <div
                key={asg.id}
                className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-sm text-slate-900">
                        {asg.title}
                      </h3>
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
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {asg.weight}% of Final Grade
                      </span>
                    </div>
                    {asg.description && (
                      <p className="text-xs text-slate-500 mt-1">
                        {asg.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={asg.status}
                      onChange={(e) =>
                        updateAssignment(asg.id, {
                          status: e.target.value as any,
                        })
                      }
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="submitted">Submitted</option>
                      <option value="graded">Graded</option>
                    </select>

                    <button
                      onClick={() => deleteAssignment(asg.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
                  <span>Due: {asg.dueDate} {asg.dueTime ? `at ${asg.dueTime}` : ""}</span>
                  {asg.score !== undefined && (
                    <span className="font-mono font-bold text-emerald-600">
                      Score: {asg.score}/{asg.maxScore || 100}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
