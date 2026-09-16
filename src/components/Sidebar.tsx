import React from "react";
import { useStudy } from "../context/StudyContext";
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Calendar,
  Clock,
  BarChart3,
  FileText,
  Sparkles,
  Flame,
  Award,
} from "lucide-react";

interface SidebarProps {
  onOpenNewTask: () => void;
  onOpenNewSubject: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenNewTask }) => {
  const { activeTab, setActiveTab, tasks, exams, profile, weeklyHoursStudied } = useStudy();

  const pendingTasksCount = tasks.filter((t) => t.status !== "completed").length;
  const upcomingExamsCount = exams.length;

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "subjects",
      label: "Subjects & Courses",
      icon: BookOpen,
      badge: null,
    },
    {
      id: "tasks",
      label: "Tasks & Homework",
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
      badgeColor: "bg-indigo-100 text-indigo-700",
    },
    {
      id: "exams",
      label: "Exams & Deadlines",
      icon: Calendar,
      badge: upcomingExamsCount > 0 ? upcomingExamsCount : null,
      badgeColor: "bg-rose-100 text-rose-700",
    },
    {
      id: "schedule",
      label: "Study Schedule",
      icon: Calendar,
      badge: "AI Plan",
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
    {
      id: "timer",
      label: "Focus & Pomodoro",
      icon: Clock,
      badge: null,
    },
    {
      id: "analytics",
      label: "Progress Analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "notes",
      label: "Notes & Resources",
      icon: FileText,
      badge: null,
    },
    {
      id: "ai-coach",
      label: "AI Learning Coach",
      icon: Sparkles,
      highlight: true,
      badge: "Coach",
      badgeColor: "bg-indigo-600 text-white shadow-sm",
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 lg:min-h-[calc(100vh-61px)]">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Study Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? item.highlight
                      ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20"
                      : "bg-indigo-50/80 text-indigo-700 font-semibold border border-indigo-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? item.highlight
                          ? "text-white"
                          : "text-indigo-600"
                        : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive && item.highlight
                        ? "bg-white/20 text-white"
                        : item.badgeColor || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Action Button */}
        <div className="pt-2">
          <button
            id="quick-add-task-sidebar-btn"
            onClick={onOpenNewTask}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50/70 hover:border-indigo-400 text-xs font-semibold transition-all"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>+ Quick Add Task</span>
          </button>
        </div>
      </div>

      {/* Weekly Progress Mini-Card in sidebar footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              Weekly Goal
            </span>
            <span className="font-mono text-slate-500 font-medium text-[11px]">
              {weeklyHoursStudied}h / {profile.weeklyGoalHours}h
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  Math.round((weeklyHoursStudied / profile.weeklyGoalHours) * 100),
                  100
                )}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500" />
              {profile.streakCount} day streak
            </span>
            <span className="text-indigo-600 font-medium">
              {Math.min(
                Math.round((weeklyHoursStudied / profile.weeklyGoalHours) * 100),
                100
              )}
              % done
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
