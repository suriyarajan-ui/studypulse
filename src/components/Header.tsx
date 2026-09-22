import React, { useState, useEffect } from "react";
import { useStudy } from "../context/StudyContext";
import {
  Sparkles,
  Flame,
  Bell,
  Play,
  Pause,
  Clock,
  Search,
  BookOpen,
  Calendar,
  X,
  GraduationCap,
  Database,
} from "lucide-react";
import { DatabaseStatusModal } from "./Modals";
import { AISearchModal } from "./AISearchModal";
import { PWAInstallButton } from "./PWAInstallButton";

export const Header: React.FC<{ onOpenProfile?: () => void }> = ({ onOpenProfile }) => {
  const {
    profile,
    timerState,
    startTimer,
    pauseTimer,
    notifications,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    subjects,
    dbStatus,
  } = useStudy();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);
  const [showAISearch, setShowAISearch] = useState(false);

  // Global keyboard shortcut: Cmd+K / Ctrl+K opens AI Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowAISearch(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Format timer seconds into MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const activeSubject = subjects.find((s) => s.id === timerState.subjectId);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3.5 transition-all">
      <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
        {/* Brand & Mobile tab indicator */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            id="brand-logo"
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-heading font-bold text-base sm:text-lg tracking-tight text-slate-900">
                  StudyPulse
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Smart Study Planner & Personal Tutor
              </p>
            </div>
          </div>
        </div>

        {/* Global Quick Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setShowAISearch(true);
                }
              }}
              placeholder="Search or ask AI in natural language..."
              className="w-full pl-9 pr-20 py-2 text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                id="header-ai-search-trigger"
                onClick={() => setShowAISearch(true)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 text-[10px] font-bold shadow-2xs transition-colors"
                title="Open AI Natural Language Search (Cmd+K)"
              >
                <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                <span>AI</span>
                <span className="hidden lg:inline text-[9px] opacity-60">⌘K</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile AI Search Trigger */}
          <button
            id="mobile-ai-search-btn"
            onClick={() => setShowAISearch(true)}
            className="md:hidden p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 rounded-xl border border-indigo-200/60 transition-colors"
            title="Ask AI Search Assistant"
            aria-label="AI Search"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          {/* Quick Focus Timer widget */}
          <div
            id="header-timer-pill"
            onClick={() => setActiveTab("timer")}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all ${
              timerState.isRunning
                ? "bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm ring-2 ring-indigo-500/20"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            title="Open Focus Timer"
          >
            <Clock
              className={`w-3.5 h-3.5 ${
                timerState.isRunning ? "text-indigo-600 animate-pulse" : "text-slate-500"
              }`}
            />
            <span className="font-mono font-semibold">
              {formatTimer(timerState.timeLeftSeconds)}
            </span>
            {activeSubject && (
              <span
                className="w-2 h-2 rounded-full hidden md:inline-block"
                style={{ backgroundColor: activeSubject.color }}
              />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (timerState.isRunning) {
                  pauseTimer();
                } else {
                  startTimer();
                }
              }}
              className="p-1 rounded-full hover:bg-indigo-200/50 text-indigo-700 ml-0.5"
            >
              {timerState.isRunning ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3 fill-indigo-600" />
              )}
            </button>
          </div>

          {/* Streak Badge */}
          <div
            id="streak-badge"
            onClick={() => setActiveTab("analytics")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold cursor-pointer hover:bg-amber-100/70 transition-colors"
            title={`${profile.streakCount} day study streak! Click to view analytics.`}
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-400 animate-bounce" />
            <span>{profile.streakCount}d</span>
          </div>

          {/* Supabase PostgreSQL Database Status Indicator */}
          <button
            id="supabase-status-btn"
            onClick={() => setShowDbModal(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
              dbStatus.connected
                ? "bg-emerald-50 border-emerald-200/80 text-emerald-800 hover:bg-emerald-100/70"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            title="View Supabase PostgreSQL Status & Sync"
          >
            <Database
              className={`w-3.5 h-3.5 ${
                dbStatus.connected ? "text-emerald-600" : "text-slate-500"
              }`}
            />
            <span className="hidden sm:inline">
              {dbStatus.connected ? "Supabase Live" : "Supabase DB"}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                dbStatus.connected ? "bg-emerald-500 animate-pulse" : "bg-sky-500"
              }`}
            />
          </button>

          {/* In-App PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* Quick AI Coach Button */}
          <button
            id="header-ai-coach-btn"
            onClick={() => setActiveTab("ai-coach")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 hover:shadow transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span className="hidden sm:inline">Ask AI Coach</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              title="Notifications & upcoming deadlines"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] max-w-xs sm:max-w-none sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-600 shrink-0" />
                      <h4 className="font-semibold text-sm text-slate-800">
                        Upcoming Deadlines & Alerts
                      </h4>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 shrink-0">
                      {notifications.length} active
                    </span>
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setShowNotifications(false);
                          if (notif.type === "exam") setActiveTab("exams");
                          else if (notif.type === "assignment") setActiveTab("tasks");
                          else setActiveTab("analytics");
                        }}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          notif.urgent
                            ? "bg-rose-50/70 border-rose-200 hover:bg-rose-50"
                            : "bg-slate-50 border-slate-200/80 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-medium text-xs text-slate-800">
                            {notif.type === "exam" && (
                              <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            )}
                            {notif.type === "assignment" && (
                              <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            )}
                            {notif.type === "streak" && (
                              <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            )}
                            <span className="truncate">{notif.title}</span>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                              notif.urgent
                                ? "bg-rose-100 text-rose-700"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {notif.timeLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 pl-5">
                          {notif.message}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveTab("exams");
                      }}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View All Exams →
                    </button>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Student Profile Avatar */}
          <button
            id="student-profile-btn"
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
            title="Edit student profile & goals"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-white text-[11px] font-bold flex items-center justify-center">
              {profile.name.charAt(0)}
            </div>
            <span className="text-xs font-medium text-slate-700 hidden lg:inline max-w-[90px] truncate">
              {profile.name}
            </span>
          </button>
        </div>
      </div>

      {/* Supabase Status and Sync Modal */}
      <DatabaseStatusModal isOpen={showDbModal} onClose={() => setShowDbModal(false)} />

      {/* AI Natural Language Search & Query Assistant Modal */}
      <AISearchModal
        isOpen={showAISearch}
        onClose={() => setShowAISearch(false)}
        initialQuery={searchQuery}
      />
    </header>
  );
};
