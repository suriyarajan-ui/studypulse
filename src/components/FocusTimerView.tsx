import React, { useState } from "react";
import { useStudy } from "../context/StudyContext";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  CheckSquare,
  Flame,
  Award,
  Clock,
  Music,
  Smile,
  Zap,
} from "lucide-react";
import { AmbientSoundType } from "../types";

export const FocusTimerView: React.FC = () => {
  const {
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimerMode,
    setTimerSubject,
    setTimerTask,
    setTimerAmbient,
    subjects,
    tasks,
    sessions,
    addSession,
    profile,
  } = useStudy();

  const [manualMinutes, setManualMinutes] = useState(25);
  const [sessionNotes, setSessionNotes] = useState("");
  const [rating, setRating] = useState(5);
  const [mood, setMood] = useState<"energized" | "focused" | "neutral" | "tired">("focused");

  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      ((timerState.totalTimeSeconds - timerState.timeLeftSeconds) /
        timerState.totalTimeSeconds) *
        100
    )
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const activeSubject = subjects.find((s) => s.id === timerState.subjectId);
  const activeTask = tasks.find((t) => t.id === timerState.taskId);

  const handleManualLog = () => {
    if (!manualMinutes || manualMinutes <= 0) return;
    addSession({
      subjectId: timerState.subjectId || subjects[0]?.id || "sub-1",
      taskId: timerState.taskId || undefined,
      date: new Date().toISOString(),
      durationMinutes: manualMinutes,
      type: "deep_work",
      notes: sessionNotes || "Offline manual study log",
      rating,
      mood,
    });
    setSessionNotes("");
    alert(`Logged ${manualMinutes} minutes of study! 🎉`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Deep Work & Focus Timer
        </h1>
        <p className="text-xs text-slate-500">
          Eliminate distractions, log deliberate study minutes, and reinforce retention
        </p>
      </div>

      {/* Main Focus Console */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
        {/* Subtle theme background aura */}
        <div
          className="absolute -top-32 -left-32 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: activeSubject?.color || "#6366f1" }}
        />

        {/* Mode Selectors */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setTimerMode("pomodoro")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              timerState.mode === "pomodoro"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            onClick={() => setTimerMode("short_break")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              timerState.mode === "short_break"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => setTimerMode("long_break")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              timerState.mode === "long_break"
                ? "bg-white text-sky-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Big Circular Dial Display */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* SVG Progress Ring */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
            <circle
              cx="120"
              cy="120"
              r="100"
              className="text-slate-100"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="120"
              cy="120"
              r="100"
              stroke={activeSubject?.color || "#6366f1"}
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 100}
              strokeDashoffset={
                2 * Math.PI * 100 * (1 - progressPercent / 100)
              }
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300"
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-heading font-extrabold text-5xl sm:text-6xl text-slate-900 font-mono tracking-tight">
              {formatTime(timerState.timeLeftSeconds)}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: activeSubject?.color || "#6366f1" }}
              />
              <span className="text-xs font-semibold text-slate-700">
                {activeSubject?.name || "General Study"}
              </span>
            </div>
            {activeTask && (
              <span className="text-[11px] text-slate-400 mt-0.5 max-w-[180px] truncate">
                {activeTask.title}
              </span>
            )}
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => resetTimer()}
            className="p-3.5 rounded-2xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            id="timer-play-pause-btn"
            onClick={timerState.isRunning ? pauseTimer : startTimer}
            className={`px-8 py-4 rounded-2xl text-white font-bold text-base shadow-lg transition-all flex items-center gap-3 ${
              timerState.isRunning
                ? "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30 scale-105"
            }`}
          >
            {timerState.isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Start Focus</span>
              </>
            )}
          </button>
        </div>

        {/* Subject & Task Linking Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Link to Subject:
            </label>
            <select
              value={timerState.subjectId}
              onChange={(e) => setTimerSubject(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Link to Active Task (Optional):
            </label>
            <select
              value={timerState.taskId}
              onChange={(e) => setTimerTask(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
            >
              <option value="">None (General Topic)</option>
              {tasks
                .filter((t) => t.status !== "completed")
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Ambient Sound Player (Synthesized via Web Audio API) */}
        <div className="w-full max-w-lg p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Music className="w-4 h-4 text-indigo-600" />
              Focus Background Audio (Web Audio Synthesizer)
            </span>
            <span className="text-[11px] text-slate-400">
              Plays during active timer
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {(
              [
                { id: "none", label: "Mute" },
                { id: "rain", label: "🌧️ Soft Rain" },
                { id: "stream", label: "🌊 Gentle Stream" },
                { id: "white_noise", label: "📻 Pink Noise" },
                { id: "calm_drone", label: "🧘 Lo-Fi Drone (174Hz)" },
              ] as const
            ).map((sound) => (
              <button
                key={sound.id}
                onClick={() => setTimerAmbient(sound.id as AmbientSoundType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  timerState.ambientSound === sound.id
                    ? "bg-indigo-600 text-white shadow-xs font-semibold"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {sound.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Study Log Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="font-heading font-bold text-sm text-slate-800">
              Offline Study Logger
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Studied from physical books or library? Log it here
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Minutes Studied:
            </label>
            <input
              type="number"
              min="5"
              max="600"
              value={manualMinutes}
              onChange={(e) => setManualMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono font-bold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Topic Notes / Reflection:
            </label>
            <input
              type="text"
              placeholder="e.g., Reviewed chapter 4 formulas and did 10 practice problems"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <button
              onClick={handleManualLog}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              + Log Study Session
            </button>
          </div>
        </div>
      </div>

      {/* Recent Completed Sessions History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-sm text-slate-800">
          Recent Study Session History ({sessions.length})
        </h3>

        <div className="space-y-2">
          {sessions.slice(0, 6).map((s) => {
            const sub = subjects.find((sub) => sub.id === s.subjectId);
            return (
              <div
                key={s.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: sub?.color || "#6366f1" }}
                  />
                  <div>
                    <span className="font-semibold text-slate-800">
                      {sub?.name || "General Study"}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {s.notes || `${s.type} session`}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-indigo-600 text-sm">
                    {s.durationMinutes} min
                  </span>
                  <div className="text-[10px] text-slate-400">
                    {new Date(s.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    • {s.rating}★
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
