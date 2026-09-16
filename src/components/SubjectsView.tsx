import React from "react";
import { useStudy } from "../context/StudyContext";
import {
  BookOpen,
  Plus,
  Sparkles,
  Calendar,
  CheckSquare,
  Clock,
  Trash2,
  Edit2,
  Award,
  Play,
  FileCheck,
} from "lucide-react";

export const SubjectsView: React.FC<{
  onOpenNewSubject: () => void;
  onEditSubject: (subjectId: string) => void;
}> = ({ onOpenNewSubject, onEditSubject }) => {
  const {
    subjects,
    deleteSubject,
    tasks,
    exams,
    assignments,
    setActiveTab,
    setTimerSubject,
    startTimer,
  } = useStudy();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">
            Subjects & Courses
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your academic curriculum, monitor target grades, and track topic mastery
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab("ai-coach")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Syllabus Audit</span>
          </button>
          <button
            id="add-subject-btn"
            onClick={onOpenNewSubject}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Subject</span>
          </button>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((subject) => {
          const subjectTasks = tasks.filter((t) => t.subjectId === subject.id && t.status !== "completed");
          const subjectExams = exams.filter((e) => e.subjectId === subject.id);
          const subjectAssignments = assignments.filter((a) => a.subjectId === subject.id);

          return (
            <div
              key={subject.id}
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Colored Top Banner */}
              <div
                className="h-2.5 w-full"
                style={{ backgroundColor: subject.color }}
              />

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Subject Header with Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {subject.code}
                      </span>
                      <h3 className="font-heading font-bold text-base text-slate-900 mt-1.5 group-hover:text-indigo-600 transition-colors">
                        {subject.name}
                      </h3>
                      {subject.professor && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {subject.professor}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditSubject(subject.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit Course"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove course "${subject.name}"?`)) {
                            deleteSubject(subject.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Academic Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 text-center">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">
                        Credits
                      </div>
                      <div className="font-mono font-bold text-xs text-slate-800 mt-0.5">
                        {subject.credits} CR
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">
                        Grade / Target
                      </div>
                      <div className="font-mono font-bold text-xs text-slate-800 mt-0.5">
                        <span className="text-indigo-600">{subject.currentGrade}</span> / {subject.targetGrade}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">
                        Difficulty
                      </div>
                      <div className="text-xs font-semibold capitalize mt-0.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            subject.difficulty === "hard"
                              ? "bg-rose-100 text-rose-700"
                              : subject.difficulty === "medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {subject.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Level Meter */}
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Confidence Rating</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div
                          key={star}
                          className={`w-3.5 h-1.5 rounded-full ${
                            star <= subject.confidenceLevel
                              ? "bg-indigo-600"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-[11px] font-mono text-slate-600">
                        {subject.confidenceLevel}/5
                      </span>
                    </div>
                  </div>

                  {/* Syllabus Topics Pill Preview */}
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Core Syllabus Modules ({subject.syllabusTopics?.length || 0})
                    </span>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {subject.syllabusTopics?.map((topic, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span className="truncate">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subject Footer with Workload stats & AI actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                      {subjectTasks.length} tasks
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      {subjectExams.length} exams
                    </span>
                    <span className="flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                      {subjectAssignments.length} HWs
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setTimerSubject(subject.id);
                        setActiveTab("timer");
                        startTimer();
                      }}
                      className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-slate-700 text-slate-700" />
                      <span>Focus Session</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("ai-coach");
                      }}
                      className="w-full py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>AI Quiz & Guide</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
