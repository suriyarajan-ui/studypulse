import React, { useState, useEffect, useRef } from "react";
import { useStudy } from "../context/StudyContext";
import {
  Sparkles,
  Search,
  X,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  Clock,
  Award,
  AlertCircle,
  CornerDownLeft,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { AISearchResponse, AISearchMatch, EntityType } from "../types";

interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const AISearchModal: React.FC<AISearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = "",
}) => {
  const { setActiveTab } = useStudy();
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AISearchResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial query when opened
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setQuery(initialQuery);
        executeSearch(initialQuery);
      }
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    } else {
      setError(null);
    }
  }, [isOpen, initialQuery]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const executeSearch = async (searchQuery: string) => {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: cleanQuery }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data: AISearchResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error("AI Search failed:", err);
      setError(err.message || "Failed to execute AI search. Please verify your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleSelectEntity = (match: AISearchMatch) => {
    setActiveTab(match.targetTab);
    onClose();
  };

  const quickPrompts = [
    "Upcoming exams this month",
    "High priority pending tasks",
    "Hardest subjects with low confidence",
    "Notes on reaction mechanisms",
    "Assignments due soon",
    "Organic Chemistry study blocks",
  ];

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case "task":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "exam":
        return <Calendar className="w-4 h-4 text-rose-500" />;
      case "assignment":
        return <FileText className="w-4 h-4 text-amber-500" />;
      case "subject":
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case "note":
        return <FileText className="w-4 h-4 text-sky-500" />;
      case "schedule":
        return <Clock className="w-4 h-4 text-purple-500" />;
      case "goal":
        return <Award className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="ai-search-modal-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:p-10 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="ai-search-modal"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[88vh]"
      >
        {/* Search Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-b from-indigo-50/40 to-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 tracking-tight flex items-center gap-2">
                  AI Smart Search & Query Assistant
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                    Gemini 3.8 Flash
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Search across subjects, tasks, exams, schedule, and notes using natural language
                </p>
              </div>
            </div>
            <button
              id="ai-search-modal-close"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Natural Language Query Form */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-indigo-500 absolute left-3.5 pointer-events-none" />
              <input
                ref={inputRef}
                id="ai-search-query-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything (e.g., 'What are my hardest exams?' or 'Pending chemistry tasks')..."
                className="w-full pl-10 pr-24 py-2.5 text-sm bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-indigo-200 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 transition-all outline-none shadow-xs font-medium"
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  id="ai-search-submit-btn"
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Ask AI</span>
                      <CornerDownLeft className="w-3 h-3 hidden sm:inline" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Quick Prompts Bar */}
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mr-1">
              Suggestions:
            </span>
            {quickPrompts.slice(0, 4).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(prompt);
                  executeSearch(prompt);
                }}
                className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors shadow-2xs font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body / Results Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Loading State */}
          {isLoading && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 animate-pulse">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-sm text-slate-800">
                  Analyzing Management Database...
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Scanning subjects, deadlines, assignments, exam weights, and study blocks to synthesize relevant matches.
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                  Search Encountered An Issue
                </h4>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
                <button
                  onClick={() => executeSearch(query)}
                  className="mt-2 text-xs font-semibold text-rose-800 underline hover:text-rose-900 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Retry query
                </button>
              </div>
            </div>
          )}

          {/* Empty Query / Idle State */}
          {!result && !isLoading && !error && (
            <div className="py-8 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-sm text-slate-700">
                  Natural Language Record Assistant
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Type questions naturally to locate records, calculate urgencies, or find notes across all 9 application modules without needing exact keyword matches.
                </p>
              </div>
            </div>
          )}

          {/* Results State */}
          {result && !isLoading && !error && (
            <div className="space-y-4">
              {/* AI Summary Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-950">
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Synthesis for &quot;{result.query}&quot;</span>
                </div>
                <p className="text-xs sm:text-sm text-indigo-900/90 leading-relaxed font-medium">
                  {result.summary}
                </p>

                {/* Suggested actions chips */}
                {result.suggestedActions && result.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-indigo-200/50 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Recommended Next Step:
                    </span>
                    {result.suggestedActions.map((action, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 text-indigo-800 border border-indigo-200/70 font-medium"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Matched Entities Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Matched Records ({result.entities.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Click any item to jump directly to its tab
                  </span>
                </div>

                {result.entities.length === 0 ? (
                  <div className="py-6 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                    <p className="text-xs text-slate-500">
                      No specific records directly matched this query. Try broadening your terms or asking about general subjects.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {result.entities.map((match) => (
                      <div
                        key={match.id}
                        onClick={() => handleSelectEntity(match)}
                        className="group p-3 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors mt-0.5">
                            {getEntityIcon(match.type)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-heading font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                {match.title}
                              </span>
                              {match.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  {match.badge}
                                </span>
                              )}
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                                {match.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              {match.subtitle}
                            </p>
                            <p className="text-[11px] text-indigo-700/80 mt-1 flex items-center gap-1 font-medium">
                              <span>•</span>
                              <span>{match.relevanceReason}</span>
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors">
                          <span className="hidden sm:inline capitalize">Open in {match.targetTab}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">Esc</kbd> to exit</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">Enter</kbd> to search</span>
          </div>
          <span className="text-slate-400">StudyPulse AI Assistant</span>
        </div>
      </div>
    </div>
  );
};
