import React, { useState } from "react";
import { useStudy } from "../context/StudyContext";
import {
  FileText,
  Plus,
  Sparkles,
  Search,
  Tag,
  Trash2,
  Calendar,
  BookOpen,
} from "lucide-react";
import { NoteResource } from "../types";

export const NotesView: React.FC<{
  onOpenNewNote: () => void;
}> = ({ onOpenNewNote }) => {
  const { notes, subjects, deleteNote, searchQuery } = useStudy();

  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [activeNote, setActiveNote] = useState<NoteResource | null>(notes[0] || null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const filteredNotes = notes.filter((note) => {
    if (selectedSubject !== "all" && note.subjectId !== selectedSubject) return false;
    const term = searchQuery.toLowerCase();
    if (term) {
      const matchTitle = note.title.toLowerCase().includes(term);
      const matchContent = note.content.toLowerCase().includes(term);
      const matchTags = note.tags.some((t) => t.toLowerCase().includes(term));
      if (!matchTitle && !matchContent && !matchTags) return false;
    }
    return true;
  });

  const handleAISummarizeNote = async () => {
    if (!activeNote) return;
    setIsSummarizing(true);
    try {
      const res = await fetch("/api/gemini/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: activeNote.title,
          subject: subjects.find((s) => s.id === activeNote.subjectId)?.name,
          style: "exam_ready",
        }),
      });
      const data = await res.json();
      setAiSummary(data.explanation);
    } catch (err) {
      console.error("AI summary error:", err);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">
            Notes & Learning Resources
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture lecture notes, cheat sheets, formulas, and generate AI synthesis
          </p>
        </div>

        <button
          id="add-note-btn"
          onClick={onOpenNewNote}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Two Column Layout: Note List & Note Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 Col): Note List */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
            {filteredNotes.map((note) => {
              const sub = subjects.find((s) => s.id === note.subjectId);
              const isSelected = activeNote?.id === note.id;

              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setActiveNote(note);
                    setAiSummary(null);
                  }}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-indigo-50/80 border-indigo-300 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {note.title}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                        if (activeNote?.id === note.id) setActiveNote(null);
                      }}
                      className="text-slate-300 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {note.content.replace(/[#*`]/g, "")}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100/80 text-[10px]">
                    {sub && (
                      <span
                        className="font-semibold"
                        style={{ color: sub.color }}
                      >
                        {sub.code}
                      </span>
                    )}
                    <span className="text-slate-400">
                      {new Date(note.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (2 Cols): Active Note Content & AI Tools */}
        <div className="lg:col-span-2 space-y-4">
          {activeNote ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                    {subjects.find((s) => s.id === activeNote.subjectId)?.name}
                  </span>
                  <h2 className="font-heading font-bold text-xl text-slate-900 mt-0.5">
                    {activeNote.title}
                  </h2>
                </div>

                <button
                  onClick={handleAISummarizeNote}
                  disabled={isSummarizing}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isSummarizing ? "Synthesizing..." : "AI Exam Cheatsheet"}</span>
                </button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {activeNote.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* AI Generated Study Guide if triggered */}
              {aiSummary && (
                <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs text-indigo-900 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      AI High-Yield Exam Summary:
                    </span>
                    <button
                      onClick={() => setAiSummary(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-normal"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {aiSummary}
                  </div>
                </div>
              )}

              {/* Note Content */}
              <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-100 whitespace-pre-line font-mono text-xs text-slate-800 leading-relaxed max-h-[500px] overflow-y-auto">
                {activeNote.content}
              </div>
            </div>
          ) : (
            <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">Select a note to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
