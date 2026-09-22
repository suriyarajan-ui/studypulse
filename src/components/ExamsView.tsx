import React from "react";
import { useStudy } from "../context/StudyContext";
import {
  Calendar,
  AlertCircle,
  Plus,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  FileText,
  Award,
  Trash2,
  HelpCircle,
} from "lucide-react";

export const ExamsView: React.FC<{
  onOpenNewExam: () => void;
}> = ({ onOpenNewExam }) => {
  const {
    exams,
    subjects,
    toggleExamTopicMastery,
    deleteExam,
    setActiveTab,
  } = useStudy();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Exams, Midterms & Final Deadlines
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track exam readiness scores, master syllabus topics, and manage high-stakes milestones
          </p>
        </div>

        <button
          id="add-exam-btn"
          onClick={onOpenNewExam}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-sm transition-all min-h-[40px] shrink-0"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Add New Exam</span>
        </button>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {exams.map((exam) => {
          const subject = subjects.find((s) => s.id === exam.subjectId);
          const daysLeft = Math.ceil(
            (new Date(exam.date).getTime() - Date.now()) / (1000 * 3600 * 24)
          );
          const isUrgent = daysLeft <= 3;
          const masteredCount = exam.topicsToCover.filter((t) => t.mastered).length;

          return (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between space-y-4 sm:space-y-5"
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {subject && (
                        <span
                          className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${subject.color}18`,
                            color: subject.color,
                          }}
                        >
                          {subject.code}
                        </span>
                      )}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {exam.weightPercentage}% of Grade
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 mt-1.5">
                      {exam.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                        isUrgent
                          ? "bg-rose-100 text-rose-700 animate-pulse"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {daysLeft <= 0 ? "Today!" : `${daysLeft}d left`}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Delete exam "${exam.title}"?`)) {
                          deleteExam(exam.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Exam Details Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{exam.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{exam.time} ({exam.durationMinutes}m)</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{exam.location || "Online"}</span>
                  </div>
                </div>

                {/* Readiness Score Progress */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/70 border border-slate-200/70">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-600" />
                      AI Exam Readiness Index
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {exam.readinessScore}% ({masteredCount}/{exam.topicsToCover.length} Topics Mastered)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        exam.readinessScore >= 80
                          ? "bg-emerald-500"
                          : exam.readinessScore >= 50
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${exam.readinessScore}%` }}
                    />
                  </div>
                </div>

                {/* Syllabus Topics Checklist */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">
                      Syllabus Topic Mastery Checklist:
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Click to mark mastered
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {exam.topicsToCover.map((topicItem, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleExamTopicMastery(exam.id, idx)}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          topicItem.mastered
                            ? "bg-emerald-50/50 border-emerald-200 text-slate-700"
                            : "bg-white border-slate-200 hover:border-indigo-300 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {topicItem.mastered ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <span
                            className={
                              topicItem.mastered
                                ? "line-through text-slate-400 font-medium"
                                : "font-medium"
                            }
                          >
                            {topicItem.topic}
                          </span>
                        </div>
                        {topicItem.mastered && (
                          <span className="text-[10px] font-bold text-emerald-700 uppercase">
                            Mastered
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {exam.notes && (
                  <div className="p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-900 leading-relaxed">
                    <strong>Note:</strong> {exam.notes}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab("ai-coach");
                  }}
                  className="flex-1 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>AI Practice Quiz for this Exam</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
