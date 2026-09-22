import React, { useState } from "react";
import { useStudy } from "../context/StudyContext";
import {
  Sparkles,
  Send,
  HelpCircle,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Flame,
  Brain,
  MessageSquare,
  FileCheck,
  ChevronRight,
  ListOrdered,
} from "lucide-react";
import { AIChatMessage, AIQuizQuestion } from "../types";
import confetti from "canvas-confetti";

export const AICoachView: React.FC = () => {
  const {
    subjects,
    tasks,
    exams,
    profile,
    weeklyHoursStudied,
  } = useStudy();

  const [activeTab, setActiveTab] = useState<"chat" | "quiz" | "explain">("chat");

  // Chat State
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "msg-welcome",
      role: "model",
      content: `Hello ${profile.name}! 👋 I am your dedicated AI Learning Coach. I have full context on your **${subjects.length} subjects**, **${tasks.filter(t => t.status !== 'completed').length} pending tasks**, and upcoming exams (including **${exams[0]?.title || 'your next test'}**). \n\nHow can I support your study momentum today? You can ask me what to study next, request a breakdown of a tough topic, or generate an exam practice quiz.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Quiz State
  const [quizSubject, setQuizSubject] = useState(subjects[0]?.id || "");
  const [quizTopic, setQuizTopic] = useState("");
  const [quizDifficulty, setQuizDifficulty] = useState<"beginner" | "intermediate" | "hard">("intermediate");
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<AIQuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Explainer State
  const [explainTopic, setExplainTopic] = useState("");
  const [explainSubject, setExplainSubject] = useState(subjects[0]?.id || "");
  const [explainStyle, setExplainStyle] = useState<"intuitive" | "exam_ready" | "analogy" | "step_by_step">("intuitive");
  const [explanationResult, setExplanationResult] = useState<string | null>(null);
  const [isExplainLoading, setIsExplainLoading] = useState(false);

  // Send message to Gemini server endpoint
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isChatLoading) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: newHistory.map((m) => ({ role: m.role, content: m.content })),
          studentContext: {
            profile,
            subjects,
            tasks: tasks.filter((t) => t.status !== "completed"),
            exams,
            weeklyHoursStudied,
          },
        }),
      });

      const data = await res.json();
      const modelMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: "model",
        content: data.reply || "I encountered an issue processing your request. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages([...newHistory, modelMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: "model",
        content: "Sorry, I had trouble reaching the AI Coach backend. Please ensure your connection is active and retry.",
        timestamp: new Date().toISOString(),
      };
      setMessages([...newHistory, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Generate Practice Quiz
  const handleGenerateQuiz = async () => {
    const subjectObj = subjects.find((s) => s.id === quizSubject);
    setIsQuizLoading(true);
    setQuizQuestions([]);
    setSelectedAnswers({});
    setQuizSubmitted(false);

    try {
      const res = await fetch("/api/gemini/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subjectObj?.name || "General Science",
          topic: quizTopic || subjectObj?.syllabusTopics?.[0] || "Core Concepts",
          difficulty: quizDifficulty,
          count: 4,
        }),
      });

      const data = await res.json();
      if (data.questions && Array.isArray(data.questions)) {
        setQuizQuestions(data.questions);
      }
    } catch (err) {
      console.error("Quiz generation error:", err);
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleSelectQuizAnswer = (qIndex: number, optIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    if (correctCount >= quizQuestions.length / 2) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Confetti fallback
      }
    }
  };

  // Generate Explanation
  const handleGenerateExplanation = async () => {
    if (!explainTopic.trim()) return;
    const subObj = subjects.find((s) => s.id === explainSubject);
    setIsExplainLoading(true);
    setExplanationResult(null);

    try {
      const res = await fetch("/api/gemini/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: explainTopic,
          subject: subObj?.name || "General",
          style: explainStyle,
        }),
      });
      const data = await res.json();
      setExplanationResult(data.explanation);
    } catch (err) {
      console.error("Explanation error:", err);
    } finally {
      setIsExplainLoading(false);
    }
  };

  // Preset coaching suggestions
  const promptSuggestions = [
    "What should I study next right now?",
    "Prioritize my tasks for upcoming exams",
    "How can I improve my Organic Chemistry retention?",
    "Create a 2-hour Pomodoro study strategy for today",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              AI Learning Coach & Quiz Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Personalized academic mentorship, active-recall quizzes, and concept explanations
          </p>
        </div>

        {/* Feature Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto touch-pan-x scrollbar-none max-w-full">
          <button
            id="tab-coach-chat"
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 min-h-[38px] ${
              activeTab === "chat"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Coach Chat</span>
          </button>
          <button
            id="tab-quiz-hub"
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 min-h-[38px] ${
              activeTab === "quiz"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Practice Quiz Hub</span>
          </button>
          <button
            id="tab-concept-explainer"
            onClick={() => setActiveTab("explain")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 min-h-[38px] ${
              activeTab === "explain"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Topic Explainer</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Interactive Chatbot */}
      {activeTab === "chat" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-[520px] sm:h-[650px] overflow-hidden">
          {/* Coach Status Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-700">
                AI Coach Synced with Student Profile
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-slate-500 text-[11px] sm:text-xs">
              <span>{subjects.length} Subjects</span>
              <span>•</span>
              <span>GPA Target: {profile.targetGPA}</span>
              <span>•</span>
              <span className="text-amber-600 font-semibold">{profile.streakCount}d Streak</span>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? "bg-slate-900 text-white"
                        : "bg-indigo-600 text-white shadow-xs"
                    }`}
                  >
                    {isUser ? "You" : <Sparkles className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] whitespace-pre-line ${
                      isUser
                        ? "bg-indigo-600 text-white font-medium rounded-tr-none"
                        : "bg-slate-50 text-slate-800 border border-slate-200/70 rounded-tl-none shadow-2xs"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-10">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                <span>Coach is formulating your personalized guidance...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">
              Quick Asks:
            </span>
            {promptSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 text-xs shrink-0 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              id="coach-chat-input"
              type="text"
              placeholder="Ask your coach anything (e.g. recommend what to study next, advice for calculus exam)..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isChatLoading}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
            <button
              id="coach-chat-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isChatLoading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Practice Quiz Hub */}
      {activeTab === "quiz" && (
        <div className="space-y-6">
          {/* Configuration Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-800">
              Generate Instant Active-Recall Practice Quiz
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Subject:
                </label>
                <select
                  value={quizSubject}
                  onChange={(e) => setQuizSubject(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Specific Topic / Chapter:
                </label>
                <input
                  type="text"
                  placeholder="e.g. SN1 vs SN2 Reactions, Sorting Algorithms"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Difficulty Level:
                </label>
                <select
                  value={quizDifficulty}
                  onChange={(e) => setQuizDifficulty(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                >
                  <option value="beginner">Beginner (Foundational)</option>
                  <option value="intermediate">Intermediate (Exam-Standard)</option>
                  <option value="hard">Hard (Challenging & Deep)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  id="generate-quiz-btn"
                  onClick={handleGenerateQuiz}
                  disabled={isQuizLoading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isQuizLoading ? "Crafting Quiz..." : "Generate Quiz"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Quiz Player */}
          {quizQuestions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Practice Test: {subjects.find((s) => s.id === quizSubject)?.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {quizQuestions.length} Practice Questions • {quizDifficulty} level
                  </p>
                </div>

                {quizSubmitted && (
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs border border-emerald-200">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>
                      Score:{" "}
                      {
                        quizQuestions.filter(
                          (q, i) => selectedAnswers[i] === q.correctAnswerIndex
                        ).length
                      }{" "}
                      / {quizQuestions.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {quizQuestions.map((q, qIndex) => {
                  const userAnswer = selectedAnswers[qIndex];
                  const isCorrect = userAnswer === q.correctAnswerIndex;

                  return (
                    <div
                      key={qIndex}
                      className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                          Q{qIndex + 1}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                          {q.question}
                        </h4>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, optIndex) => {
                          const isOptionSelected = userAnswer === optIndex;
                          const isThisOptionCorrect = q.correctAnswerIndex === optIndex;

                          let optionStyle = "bg-white border-slate-200 hover:border-indigo-300";
                          if (quizSubmitted) {
                            if (isThisOptionCorrect) {
                              optionStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold";
                            } else if (isOptionSelected && !isCorrect) {
                              optionStyle = "bg-rose-50 border-rose-400 text-rose-900";
                            }
                          } else if (isOptionSelected) {
                            optionStyle = "bg-indigo-50 border-indigo-600 text-indigo-900 font-semibold";
                          }

                          return (
                            <button
                              key={optIndex}
                              onClick={() => handleSelectQuizAnswer(qIndex, optIndex)}
                              className={`p-3 rounded-xl border text-xs text-left transition-all flex items-start gap-2.5 ${optionStyle}`}
                            >
                              <span className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-bold">
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Feedback Explanation after submit */}
                      {quizSubmitted && (
                        <div
                          className={`p-3 rounded-xl text-xs leading-relaxed ${
                            isCorrect
                              ? "bg-emerald-100/60 text-emerald-900 border border-emerald-200"
                              : "bg-amber-100/60 text-amber-900 border border-amber-200"
                          }`}
                        >
                          <strong>{isCorrect ? "Correct! 🎉" : "Correction:"} </strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit / Reset Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                {!quizSubmitted ? (
                  <button
                    id="submit-quiz-btn"
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length === 0}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-40"
                  >
                    Submit Quiz & See Score
                  </button>
                ) : (
                  <button
                    onClick={handleGenerateQuiz}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Another Set</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Topic Explainer */}
      {activeTab === "explain" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-800">
              Demystify Any Concept with Adaptive AI Explanations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Subject Context:
                </label>
                <select
                  value={explainSubject}
                  onChange={(e) => setExplainSubject(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Topic / Question:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fourier Transform, Bayes Theorem, SN1 vs SN2"
                  value={explainTopic}
                  onChange={(e) => setExplainTopic(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Explanation Style:
                </label>
                <select
                  value={explainStyle}
                  onChange={(e) => setExplainStyle(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                >
                  <option value="intuitive">Intuitive / Visual Concept (ELI5)</option>
                  <option value="exam_ready">Exam-Ready Technical Breakdown</option>
                  <option value="analogy">Analogy-Rich Everyday Parallel</option>
                  <option value="step_by_step">Step-by-Step Derivation / Algorithm</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  id="explain-topic-btn"
                  onClick={handleGenerateExplanation}
                  disabled={isExplainLoading || !explainTopic.trim()}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isExplainLoading ? "Analyzing..." : "Explain Concept"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Explanation Output Card */}
          {explanationResult && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <h4 className="font-heading font-bold text-sm text-slate-900">
                    Explanation: {explainTopic} ({explainStyle.replace("_", " ")})
                  </h4>
                </div>
                <button
                  onClick={() => setExplanationResult(null)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕ Close
                </button>
              </div>

              <div className="prose prose-sm max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans">
                {explanationResult}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
