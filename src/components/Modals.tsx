import React, { useState } from "react";
import { useStudy } from "../context/StudyContext";
import { X, Calendar, Clock, BookOpen, AlertCircle, Award, Database, CheckCircle2, RefreshCw, Server, Check } from "lucide-react";
import { PriorityLevel, TaskStatus, TaskType } from "../types";

// ==================== TASK MODAL ====================
export const NewTaskModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { subjects, addTask } = useStudy();
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueTime, setDueTime] = useState("17:00");
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [priority, setPriority] = useState<PriorityLevel>("high");
  const [type, setType] = useState<TaskType>("homework");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      subjectId,
      dueDate,
      dueTime,
      estimatedMinutes: Number(estimatedMinutes),
      actualMinutes: 0,
      priority,
      status: "todo",
      type,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-heading font-bold text-base text-slate-900">
            Add New Study Task
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Read Chapter 4 & complete practice problem set"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Course / Subject</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Est. Minutes</label>
              <input
                type="number"
                min="10"
                max="600"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Task Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TaskType)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none capitalize"
            >
              <option value="homework">Homework</option>
              <option value="assignment">Assignment</option>
              <option value="revision">Revision</option>
              <option value="practice">Practice Problems</option>
              <option value="reading">Reading</option>
              <option value="project">Project Work</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes & Instructions (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Include problem 4 bonus question"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-colors"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== SUBJECT MODAL ====================
export const NewSubjectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  editSubjectId?: string | null;
}> = ({ isOpen, onClose, editSubjectId }) => {
  const { subjects, addSubject, updateSubject } = useStudy();

  const editingSubject = editSubjectId ? subjects.find((s) => s.id === editSubjectId) : null;

  const [name, setName] = useState(editingSubject?.name || "");
  const [code, setCode] = useState(editingSubject?.code || "");
  const [professor, setProfessor] = useState(editingSubject?.professor || "");
  const [credits, setCredits] = useState(editingSubject?.credits || 3);
  const [targetGrade, setTargetGrade] = useState(editingSubject?.targetGrade || "A");
  const [currentGrade, setCurrentGrade] = useState(editingSubject?.currentGrade || "B+");
  const [difficulty, setDifficulty] = useState(editingSubject?.difficulty || "medium");
  const [confidenceLevel, setConfidenceLevel] = useState(editingSubject?.confidenceLevel || 3);
  const [color, setColor] = useState(editingSubject?.color || "#4f46e5");
  const [topicsText, setTopicsText] = useState(
    editingSubject?.syllabusTopics?.join(", ") || "Foundations, Core Theory, Practice Cases"
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const topics = topicsText.split(",").map((t) => t.trim()).filter(Boolean);

    if (editingSubject) {
      updateSubject(editingSubject.id, {
        name,
        code,
        professor,
        credits: Number(credits),
        targetGrade,
        currentGrade,
        difficulty: difficulty as any,
        confidenceLevel: Number(confidenceLevel),
        color,
        syllabusTopics: topics,
      });
    } else {
      addSubject({
        name,
        code: code || name.slice(0, 4).toUpperCase(),
        professor,
        credits: Number(credits),
        targetGrade,
        currentGrade,
        difficulty: difficulty as any,
        confidenceLevel: Number(confidenceLevel),
        color,
        syllabusTopics: topics,
      });
    }
    onClose();
  };

  const palette = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-heading font-bold text-base text-slate-900">
            {editingSubject ? "Edit Course Details" : "Add New Subject & Course"}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Organic Chemistry II"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
              <input
                type="text"
                placeholder="e.g. CHEM-240"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Instructor / Professor</label>
              <input
                type="text"
                placeholder="e.g. Dr. Jennifer Clark"
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Credits</label>
              <input
                type="number"
                min="1"
                max="10"
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Grade</label>
              <input
                type="text"
                value={currentGrade}
                onChange={(e) => setCurrentGrade(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Grade</label>
              <input
                type="text"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono font-bold text-indigo-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none capitalize"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Confidence Rating: {confidenceLevel}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Syllabus Topics (comma-separated):
            </label>
            <input
              type="text"
              value={topicsText}
              onChange={(e) => setTopicsText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Course Theme Color</label>
            <div className="flex items-center gap-2 pt-1">
              {palette.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setColor(p)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === p ? "ring-2 ring-indigo-500 scale-110" : ""
                  }`}
                  style={{ backgroundColor: p }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs"
            >
              {editingSubject ? "Save Changes" : "Create Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== EXAM MODAL ====================
export const NewExamModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { subjects, addExam } = useStudy();
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [weightPercentage, setWeightPercentage] = useState(30);
  const [location, setLocation] = useState("Hall B, Room 102");
  const [topicsStr, setTopicsStr] = useState("Midterm Review, Chapters 1-5, Practice Sets");
  const [notes, setNotes] = useState("Bring scientific calculator & 1 sheet of handwritten notes.");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const topicsArray = topicsStr
      .split(",")
      .map((t) => ({ topic: t.trim(), mastered: false }))
      .filter((t) => t.topic.length > 0);

    addExam({
      title: title.trim(),
      subjectId,
      date,
      time,
      durationMinutes: Number(durationMinutes),
      location,
      weightPercentage: Number(weightPercentage),
      readinessScore: 50,
      topicsToCover: topicsArray,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-heading font-bold text-base text-slate-900">
            Schedule Upcoming Exam / Test
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Exam Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Organic Chemistry Midterm 2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Course</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grade Weight (%)</label>
              <input
                type="number"
                min="5"
                max="100"
                value={weightPercentage}
                onChange={(e) => setWeightPercentage(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration (min)</label>
              <input
                type="number"
                min="15"
                max="360"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Room / Location</label>
            <input
              type="text"
              placeholder="e.g. Science Hall 301 or Online Portal"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Topics to Cover (comma-separated):
            </label>
            <input
              type="text"
              value={topicsStr}
              onChange={(e) => setTopicsStr(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Cheat Sheet Rules</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs"
            >
              Save Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== ASSIGNMENT MODAL ====================
export const NewAssignmentModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { subjects, addAssignment } = useStudy();
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueTime, setDueTime] = useState("23:59");
  const [weight, setWeight] = useState(15);
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addAssignment({
      title: title.trim(),
      subjectId,
      dueDate,
      dueTime,
      weight: Number(weight),
      status: "not_started",
      description,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-heading font-bold text-base text-slate-900">
            Add Assignment / Project
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assignment Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Term Paper: Quantum Cryptography"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Course</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Weight (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Requirements & Rubric</label>
            <textarea
              rows={3}
              placeholder="e.g. 5 pages, APA format, 3 peer-reviewed citations"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs"
            >
              Save Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== SCHEDULE BLOCK MODAL ====================
export const NewScheduleBlockModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { subjects, addScheduleBlock } = useStudy();
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [technique, setTechnique] = useState("Feynman Technique");
  const [priority, setPriority] = useState<PriorityLevel>("high");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addScheduleBlock({
      title: title.trim(),
      subjectId,
      date,
      startTime,
      endTime,
      durationMinutes: 60,
      technique,
      priority,
      completed: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-heading font-bold text-base text-slate-900">
            Add Study Schedule Block
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Study Objective / Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Deep Practice: Graph Traversal Algorithms"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Course</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Study Technique</label>
              <select
                value={technique}
                onChange={(e) => setTechnique(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="Pomodoro">Pomodoro (25/5)</option>
                <option value="Feynman Technique">Feynman Technique</option>
                <option value="Active Recall">Active Recall Quiz</option>
                <option value="Spaced Repetition">Spaced Repetition</option>
                <option value="Deep Practice">Deep Practice Drills</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs"
            >
              Add Block
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== LEARNING GOAL MODAL ====================
export const NewGoalModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { addGoal } = useStudy();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"weekly_hours" | "exam_score" | "streak" | "syllabus">("weekly_hours");
  const [targetValue, setTargetValue] = useState(25);
  const [unit, setUnit] = useState("hours");
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split("T")[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addGoal({
      title: title.trim(),
      category,
      targetValue: Number(targetValue),
      currentValue: 0,
      unit,
      targetDate,
      completed: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-heading font-bold text-base text-slate-900">
            Set Academic Learning Goal
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Goal Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. Complete 50 Practice Algorithm Questions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="weekly_hours">Study Hours</option>
                <option value="exam_score">Exam Score Target</option>
                <option value="streak">Study Streak</option>
                <option value="syllabus">Syllabus Completion</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Value</label>
              <input
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit of Measure</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. hours, questions, days"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs"
            >
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== NOTE MODAL ====================
export const NewNoteModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { subjects, addNote } = useStudy();
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [tagsStr, setTagsStr] = useState("cheatsheet, summary");
  const [content, setContent] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addNote({
      title: title.trim(),
      subjectId,
      content: content.trim(),
      tags: tagsStr.split(",").map((t) => t.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-heading font-bold text-base text-slate-900">
            Create Learning Resource / Note
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Organic Chemistry Reaction Cheat Sheet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Course</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="e.g. formulas, exam1, midterm"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Note Body / Markdown Content *</label>
            <textarea
              rows={6}
              required
              placeholder="Type or paste lecture notes, formulas, theorems..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs"
            >
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== SUPABASE DATABASE STATUS MODAL ====================
export const DatabaseStatusModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { dbStatus, isDbLoading, refreshFromDb, seedToSupabase } = useStudy();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSqlPath, setCopiedSqlPath] = useState(false);

  if (!isOpen) return null;

  const handleSeed = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await seedToSupabase();
      setSyncResult(res);
    } catch (e: any) {
      setSyncResult({ success: false, message: e.message || "Sync failed" });
    } finally {
      setSyncing(false);
    }
  };

  const copyPath = () => {
    navigator.clipboard?.writeText("supabase/schema.sql");
    setCopiedSqlPath(true);
    setTimeout(() => setCopiedSqlPath(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Supabase PostgreSQL Database
              </h3>
              <p className="text-[11px] text-slate-500">
                Relational persistence & real-time synchronization
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Card */}
        <div
          className={`p-4 rounded-xl border ${
            dbStatus.connected
              ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
              : "bg-slate-50 border-slate-200 text-slate-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  dbStatus.connected ? "bg-emerald-500 animate-pulse" : "bg-sky-500"
                }`}
              />
              <span className="font-bold text-sm">
                {dbStatus.connected
                  ? "Connected to Supabase PostgreSQL"
                  : "Local Resilient Mode (Supabase Ready)"}
              </span>
            </div>
            <span className="text-[11px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-white/80 border border-slate-200">
              {dbStatus.provider}
            </span>
          </div>

          <p className="text-xs mt-2 text-slate-600">
            {dbStatus.message ||
              (dbStatus.connected
                ? "All study management tables are connected to your Supabase PostgreSQL database."
                : "The application is running with full CRUD functionality. Set SUPABASE_URL and SUPABASE_ANON_KEY to link your remote instance.")}
          </p>

          {dbStatus.url && (
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] flex items-center gap-1.5 text-slate-500 font-mono truncate">
              <Server className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{dbStatus.url}</span>
            </div>
          )}
        </div>

        {/* Database Tables Overview */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Schema Tables (PostgreSQL)
          </h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { name: "subjects", count: dbStatus.tableCounts?.subjects ?? 4 },
              { name: "study_tasks", count: dbStatus.tableCounts?.tasks ?? 5 },
              { name: "exams", count: dbStatus.tableCounts?.exams ?? 3 },
              { name: "assignments", count: dbStatus.tableCounts?.assignments ?? 3 },
              { name: "study_sessions", count: dbStatus.tableCounts?.sessions ?? 4 },
              { name: "study_goals", count: dbStatus.tableCounts?.goals ?? 4 },
              { name: "study_schedule", count: dbStatus.tableCounts?.scheduleBlocks ?? 4 },
              { name: "notes_resources", count: dbStatus.tableCounts?.notes ?? 3 },
              { name: "student_profiles", count: 1 },
            ].map((tbl) => (
              <div
                key={tbl.name}
                className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between"
              >
                <span className="font-mono text-[11px] text-slate-700 truncate">{tbl.name}</span>
                <span className="text-[10px] font-bold text-indigo-600 px-1.5 py-0.2 rounded bg-indigo-50">
                  {tbl.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Schema Migration File Notice */}
        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-indigo-900">PostgreSQL Migration Script:</span>
            <button
              onClick={copyPath}
              className="text-[11px] font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-indigo-200"
            >
              {copiedSqlPath ? <Check className="w-3 h-3" /> : null}
              {copiedSqlPath ? "Copied" : "Copy Path"}
            </button>
          </div>
          <p className="text-[11px] text-indigo-800 leading-relaxed">
            The complete schema with tables, foreign keys, and RLS policies is ready in{" "}
            <code className="bg-white/80 px-1 py-0.5 rounded border border-indigo-200 font-mono text-[10px]">
              supabase/schema.sql
            </code>
            . Run it in your Supabase SQL Editor.
          </p>
        </div>

        {/* Sync Result Banner */}
        {syncResult && (
          <div
            className={`p-3 rounded-xl text-xs border ${
              syncResult.success
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            {syncResult.message}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            disabled={isDbLoading}
            onClick={() => refreshFromDb()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDbLoading ? "animate-spin" : ""}`} />
            Recheck Connection
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Close
            </button>
            <button
              type="button"
              disabled={syncing}
              onClick={handleSeed}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              {syncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              {syncing ? "Synchronizing..." : "Seed / Sync Tables"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
