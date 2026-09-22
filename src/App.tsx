import React, { useState } from "react";
import { StudyProvider, useStudy } from "./context/StudyContext";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { DashboardView } from "./components/DashboardView";
import { SubjectsView } from "./components/SubjectsView";
import { TasksView } from "./components/TasksView";
import { ExamsView } from "./components/ExamsView";
import { ScheduleView } from "./components/ScheduleView";
import { FocusTimerView } from "./components/FocusTimerView";
import { AnalyticsView } from "./components/AnalyticsView";
import { NotesView } from "./components/NotesView";
import { AICoachView } from "./components/AICoachView";
import {
  NewTaskModal,
  NewSubjectModal,
  NewExamModal,
  NewAssignmentModal,
  NewScheduleBlockModal,
  NewGoalModal,
  NewNoteModal,
} from "./components/Modals";
import { OfflineIndicator } from "./components/OfflineIndicator";

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useStudy();

  // Modal open states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isScheduleBlockModalOpen, setIsScheduleBlockModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Global Header */}
      <Header />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          onOpenNewTask={() => setIsTaskModalOpen(true)}
          onOpenNewSubject={() => {
            setEditingSubjectId(null);
            setIsSubjectModalOpen(true);
          }}
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto min-h-0 lg:max-h-[calc(100vh-61px)]">
          {activeTab === "dashboard" && (
            <DashboardView
              onOpenNewTask={() => setIsTaskModalOpen(true)}
              onOpenNewExam={() => setIsExamModalOpen(true)}
            />
          )}

          {activeTab === "subjects" && (
            <SubjectsView
              onOpenNewSubject={() => {
                setEditingSubjectId(null);
                setIsSubjectModalOpen(true);
              }}
              onEditSubject={(subId) => {
                setEditingSubjectId(subId);
                setIsSubjectModalOpen(true);
              }}
            />
          )}

          {activeTab === "tasks" && (
            <TasksView
              onOpenNewTask={() => setIsTaskModalOpen(true)}
              onOpenNewAssignment={() => setIsAssignmentModalOpen(true)}
            />
          )}

          {activeTab === "exams" && (
            <ExamsView
              onOpenNewExam={() => setIsExamModalOpen(true)}
            />
          )}

          {activeTab === "schedule" && (
            <ScheduleView
              onOpenNewBlock={() => setIsScheduleBlockModalOpen(true)}
            />
          )}

          {activeTab === "timer" && <FocusTimerView />}

          {activeTab === "analytics" && (
            <AnalyticsView
              onOpenNewGoal={() => setIsGoalModalOpen(true)}
            />
          )}

          {activeTab === "notes" && (
            <NotesView
              onOpenNewNote={() => setIsNoteModalOpen(true)}
            />
          )}

          {activeTab === "ai-coach" && <AICoachView />}
        </main>
      </div>

      {/* Global Dialog Modals */}
      <NewTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      <NewSubjectModal
        isOpen={isSubjectModalOpen}
        editSubjectId={editingSubjectId}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubjectId(null);
        }}
      />

      <NewExamModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
      />

      <NewAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
      />

      <NewScheduleBlockModal
        isOpen={isScheduleBlockModalOpen}
        onClose={() => setIsScheduleBlockModalOpen(false)}
      />

      <NewGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
      />

      <NewNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
      />

      {/* PWA Offline Connectivity Banner */}
      <OfflineIndicator />
    </div>
  );
};

export function App() {
  return (
    <StudyProvider>
      <AppContent />
    </StudyProvider>
  );
}

export default App;
