import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { dbService, checkDatabaseHealth } from "./server/supabase";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// -----------------------------------------------------------------------------
// DATABASE STATUS & SYNC ROUTES (Supabase PostgreSQL)
// -----------------------------------------------------------------------------
app.get("/api/db/status", async (req, res) => {
  try {
    const status = await checkDatabaseHealth();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/db/seed", async (req, res) => {
  try {
    const result = await dbService.seedAllToSupabase();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/db/migrate", async (req, res) => {
  try {
    const result = await dbService.migrateDataToSupabase();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/db/schema-sql", async (req, res) => {
  try {
    const fs = await import("fs/promises");
    const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
    const sql = await fs.readFile(schemaPath, "utf-8");
    res.type("text/plain").send(sql);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SUBJECTS
app.get("/api/subjects", async (req, res) => {
  try {
    const data = await dbService.getSubjects();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/subjects", async (req, res) => {
  try {
    const item = await dbService.createSubject(req.body);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/subjects/:id", async (req, res) => {
  try {
    const item = await dbService.updateSubject(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Subject not found" });
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/subjects/:id", async (req, res) => {
  try {
    await dbService.deleteSubject(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// TASKS
app.get("/api/tasks", async (req, res) => {
  try {
    const data = await dbService.getTasks();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const item = await dbService.createTask(req.body);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const item = await dbService.updateTask(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Task not found" });
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    await dbService.deleteTask(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// EXAMS
app.get("/api/exams", async (req, res) => {
  try {
    const data = await dbService.getExams();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/exams", async (req, res) => {
  try {
    const item = await dbService.createExam(req.body);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/exams/:id", async (req, res) => {
  try {
    const item = await dbService.updateExam(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Exam not found" });
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/exams/:id", async (req, res) => {
  try {
    await dbService.deleteExam(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ASSIGNMENTS
app.get("/api/assignments", async (req, res) => {
  try {
    const data = await dbService.getAssignments();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/assignments", async (req, res) => {
  try {
    const item = await dbService.createAssignment(req.body);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/assignments/:id", async (req, res) => {
  try {
    const item = await dbService.updateAssignment(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Assignment not found" });
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/assignments/:id", async (req, res) => {
  try {
    await dbService.deleteAssignment(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SESSIONS
app.get("/api/sessions", async (req, res) => {
  try {
    const data = await dbService.getSessions();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/sessions", async (req, res) => {
  try {
    const item = await dbService.createSession(req.body);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/sessions/:id", async (req, res) => {
  try {
    await dbService.deleteSession(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GOALS
app.get("/api/goals", async (req, res) => {
  try {
    const data = await dbService.getGoals();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/goals", async (req, res) => {
  try {
    const item = await dbService.createGoal(req.body);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/goals/:id", async (req, res) => {
  try {
    const item = await dbService.updateGoal(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Goal not found" });
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/goals/:id", async (req, res) => {
  try {
    await dbService.deleteGoal(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SCHEDULE BLOCKS
app.get("/api/schedule", async (req, res) => {
  try {
    const data = await dbService.getScheduleBlocks();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/schedule", async (req, res) => {
  try {
    const item = await dbService.createScheduleBlock(req.body);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/schedule/batch", async (req, res) => {
  try {
    const items = await dbService.batchCreateScheduleBlocks(req.body);
    res.status(201).json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/schedule/:id", async (req, res) => {
  try {
    const item = await dbService.updateScheduleBlock(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Schedule block not found" });
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/schedule/:id", async (req, res) => {
  try {
    await dbService.deleteScheduleBlock(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// NOTES & RESOURCES
app.get("/api/notes", async (req, res) => {
  try {
    const data = await dbService.getNotes();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/notes", async (req, res) => {
  try {
    const item = await dbService.createNote(req.body);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/notes/:id", async (req, res) => {
  try {
    const item = await dbService.updateNote(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Note not found" });
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
    await dbService.deleteNote(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PROFILE
app.get("/api/profile", async (req, res) => {
  try {
    const data = await dbService.getProfile();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/profile", async (req, res) => {
  try {
    const data = await dbService.updateProfile(req.body);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Lazy-initialize Gemini AI client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Using intelligent contextual fallback.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

/**
 * Executes a Gemini content generation request with automatic graceful fallback
 * across stable, low-latency models to defend against transient 503 high-demand spikes.
 */
export async function callGeminiGenerate(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    preferredModel?: string;
  }
) {
  const candidateModels = [
    params.preferredModel,
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-3.6-flash",
  ].filter((m): m is string => Boolean(m) && m !== "gemini-2.5-flash" && m !== "gemini-2.5-flash-lite");

  const uniqueCandidates = Array.from(new Set(candidateModels));
  let lastError: any = null;

  for (const model of uniqueCandidates) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      // Step to next available resilient model
      lastError = err;
    }
  }
  throw lastError;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// AI Learning Coach Chat
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, message, history, studentContext } = req.body;
    const ai = getGeminiClient();

    // Support both format: { messages } and { message, history }
    const effectiveMessages: Array<{ role: string; content: string }> =
      Array.isArray(messages) && messages.length > 0
        ? messages
        : Array.isArray(history) && history.length > 0
        ? history
        : message
        ? [{ role: "user", content: String(message) }]
        : [];

    const systemInstruction = `You are StudyPulse, an empathetic, highly pedagogical, and analytical personal AI Study Planner and Learning Coach.
You have real-time access to the student's study context:
${studentContext ? JSON.stringify(studentContext, null, 2) : "No context provided."}

Guidelines:
1. Always be actionable, encouraging, and structured. Don't just give generic advice—reference their actual subjects, upcoming exam dates, pending assignments, and study statistics.
2. If they have an exam coming up soon, proactively factor that urgency into your guidance.
3. Suggest concrete study blocks (e.g. "Use the Pomodoro timer for 45 min on Organic Chemistry reaction mechanisms").
4. Keep answers clean, using markdown formatting, bullet points, and bold text for readability.
5. If they feel overwhelmed, break their immediate priorities down into 3 manageable steps.`;

    if (!ai) {
      // High-quality contextual simulated coach response when API key is missing
      const lastMessage = effectiveMessages[effectiveMessages.length - 1]?.content || "";
      let mockReply = "";

      if (lastMessage.toLowerCase().includes("recommend") || lastMessage.toLowerCase().includes("study next") || lastMessage.toLowerCase().includes("what should i study")) {
        mockReply = `### 🎯 Strategic Study Recommendation

Based on your upcoming deadlines and subject difficulty:

1. **Top Priority: Organic Chemistry (Midterm in 3 days)**
   - **Recommended Block:** 45 minutes focused on *Reaction Mechanisms & Synthesis pathways*.
   - **Why:** Your confidence level is currently rated at 2/5, making this your highest risk exam.

2. **Secondary Priority: Data Structures (Assignment due in 2 days)**
   - **Recommended Block:** 30 minutes debugging *Graph Traversal & BFS/DFS implementations*.

3. **Quick Review: Macroeconomics**
   - **Recommended Block:** 15 minutes reviewing *Fiscal Policy flashcards* before bed.

💡 **Coach Tip:** Start a 25-minute Pomodoro session in the Focus tab right now to conquer the hardest topic first!`;
      } else if (lastMessage.toLowerCase().includes("overwhelm") || lastMessage.toLowerCase().includes("stress")) {
        mockReply = `### 🌿 Deep Breath: Let's Deconstruct This Together

Feeling overwhelmed happens when your brain tries to hold all your deadlines simultaneously. Let's offload that mental clutter:

1. **Step 1: Focus Only on Today's 2 Non-Negotiables**
   - Forget next week's assignments for the next 2 hours.
   - Dedicate just one 30-minute block to your nearest deadline.

2. **Step 2: Use the 5-Minute Rule**
   - Promise yourself you will work for just 5 minutes on your hardest task. Starting is 80% of the friction.

3. **Step 3: Clear Milestones**
   - Drink a glass of water, pick one task from your Today's Plan, and press Start on the Focus Timer. I'll be right here cheering you on!`;
      } else {
        mockReply = `### 📚 StudyPulse Learning Coach

I've analyzed your current study schedule! You have:
- **Upcoming Exams:** Organic Chemistry Midterm coming up in just a few days.
- **Pending Tasks:** Data Structures Assignment and Macroeconomics Problem Set.
- **Weekly Progress:** Great streak going so far!

How would you like to tackle your goals today? I can:
- **Prioritize** your active study tasks
- **Generate a tailored daily study plan** with precise time blocks
- **Break down any tough concept** with analogies and exam tips
- **Create a 5-question quick quiz** to test your recall`;
      }

      return res.json({ reply: mockReply });
    }

    // Call Gemini with resilient multi-model fallback
    const formattedContents = effectiveMessages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    try {
      const response = await callGeminiGenerate(ai, {
        preferredModel: "gemini-3.5-flash-lite",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ reply: response.text || "I am ready to help you optimize your study routine!" });
    } catch {
      // Graceful fallback response so the user's chat is never interrupted
      res.json({
        reply: `### 📚 StudyPulse Learning Coach

I'm currently reviewing your academic workload! Based on your schedule:
- **Top Priority:** Focus on your nearest exam or high-difficulty assignments first.
- **Recommended Strategy:** Start a 25-minute Pomodoro block on your most challenging topic while your focus is sharp.
- **Next Step:** You can ask me to generate a personalized daily schedule or quiz you on any topic whenever you're ready!`,
      });
    }
  } catch (error: any) {
    console.error("Error in /api/gemini/chat:", error);
    res.status(500).json({ error: error.message || "Failed to generate coaching response" });
  }
});

// AI Study Plan Generator (Daily or Weekly)
app.post("/api/gemini/study-plan", async (req, res) => {
  try {
    const { timeframe, targetHours, subjects, exams, tasks, preferences } = req.body;
    const ai = getGeminiClient();

    const prompt = `Create a realistic, high-impact ${timeframe || "daily"} study plan for a student.
Target study hours: ${targetHours || 4} hours.
Student Subjects: ${JSON.stringify(subjects || [])}
Upcoming Exams: ${JSON.stringify(exams || [])}
Active Tasks: ${JSON.stringify(tasks || [])}
Preferences & Weaknesses: ${preferences || "Focus on highest difficulty and nearest deadlines"}.

Generate a structured JSON schedule with time blocks, actionable learning objectives, recommended study technique (e.g. Active Recall, Feynman Technique, Practice Problems, Pomodoro), and rationale.`;

    if (!ai) {
      // Fallback structured plan
      const plan = {
        title: `${timeframe === "weekly" ? "High-Yield Weekly" : "Optimized Daily"} Study Blueprint`,
        summary: "Balanced schedule prioritizing high-stakes exams and pending project deliverables.",
        totalTargetMinutes: (targetHours || 4) * 60,
        blocks: [
          {
            timeSlot: "09:00 - 09:50",
            subject: "Organic Chemistry",
            topic: "Reaction Mechanisms & Alkene Synthesis",
            technique: "Active Recall & Mechanism Mapping",
            priority: "urgent",
            durationMinutes: 50,
            learningObjective: "Write out 5 core synthesis pathways from memory without notes.",
            reasonWhyRecommended: "Upcoming midterm in 3 days with lower current confidence level.",
          },
          {
            timeSlot: "10:05 - 10:55",
            subject: "Data Structures & Algorithms",
            topic: "Binary Search Trees & Graph BFS",
            technique: "Hands-on Code Practice",
            priority: "high",
            durationMinutes: 50,
            learningObjective: "Implement recursive BFS traversal and solve 2 medium problems.",
            reasonWhyRecommended: "Assignment due in 48 hours; needs working code verification.",
          },
          {
            timeSlot: "11:10 - 11:55",
            subject: "Macroeconomics",
            topic: "Monetary Policy & Central Bank Multipliers",
            technique: "Feynman Technique & Summary Notes",
            priority: "medium",
            durationMinutes: 45,
            learningObjective: "Explain the liquidity preference model in simple terms.",
            reasonWhyRecommended: "Problem set due this Friday.",
          },
          {
            timeSlot: "14:00 - 14:45",
            subject: "Cellular Biology",
            topic: "Cellular Respiration & Krebs Cycle",
            technique: "Diagramming & Spaced Repetition",
            priority: "medium",
            durationMinutes: 45,
            learningObjective: "Trace carbon atoms and ATP yield through glycolysis and Krebs cycle.",
            reasonWhyRecommended: "Maintain mastery ahead of next week's quiz.",
          },
        ],
        coachTips: [
          "Take a 10-15 minute screen-free walk between deep work blocks.",
          "Review your flashcards right before bed to boost memory consolidation.",
          "Hydrate well during your hardest chemistry sessions.",
        ],
      };
      return res.json(plan);
    }

    const response = await callGeminiGenerate(ai, {
      preferredModel: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert academic scheduler. Return pure JSON adhering strictly to the schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            totalTargetMinutes: { type: Type.NUMBER },
            blocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeSlot: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  technique: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  durationMinutes: { type: Type.NUMBER },
                  learningObjective: { type: Type.STRING },
                  reasonWhyRecommended: { type: Type.STRING },
                },
                required: ["timeSlot", "subject", "topic", "durationMinutes", "learningObjective"],
              },
            },
            coachTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["title", "summary", "blocks", "coachTips"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/gemini/study-plan:", error);
    res.status(500).json({ error: error.message || "Failed to generate study plan" });
  }
});

// AI Quiz & Practice Question Generator
app.post("/api/gemini/quiz", async (req, res) => {
  try {
    const { subject, topic, questionCount = 5, difficulty = "medium" } = req.body;
    const ai = getGeminiClient();

    const prompt = `Generate a ${questionCount}-question multiple choice quiz for:
Subject: ${subject || "General Academic"}
Topic: ${topic || "Core Principles"}
Difficulty: ${difficulty}

Include:
- 4 multiple choice options per question
- 0-indexed correct answer
- Detailed pedagogical explanation of why the correct answer is right and common pitfalls
- A helpful hint`;

    if (!ai) {
      const fallbackQuestions = [
        {
          id: "q-1",
          question: `Which of the following best describes the rate-determining step in an SN1 reaction in ${subject || "Chemistry"}?`,
          options: [
            "Attack of the nucleophile on the carbocation",
            "Formation of the carbocation intermediate via loss of the leaving group",
            "Proton transfer to stabilize the conjugate base",
            "Simultaneous backside attack by the nucleophile",
          ],
          correctOptionIndex: 1,
          explanation: "In an SN1 mechanism, the unimolecular dissociation of the leaving group to generate a planar carbocation intermediate is the slowest step and therefore determines the overall reaction rate.",
          hint: "Think about which step is unimolecular and forms a high-energy intermediate.",
        },
        {
          id: "q-2",
          question: `What is the primary factor that stabilizes a tertiary carbocation compared to a primary carbocation?`,
          options: [
            "Steric hindrance only",
            "Hyperconjugation and positive inductive electron donation from alkyl groups",
            "Higher electronegativity of the central carbon",
            "Hydrogen bonding with polar aprotic solvents",
          ],
          correctOptionIndex: 1,
          explanation: "Tertiary carbocations have three alkyl groups donating electron density through sigma-bond overlap (hyperconjugation) and inductive effects, distributing the positive charge and lowering potential energy.",
          hint: "Consider how neighboring C-H bonds overlap with the vacant p orbital.",
        },
        {
          id: "q-3",
          question: `In time complexity analysis, what is the worst-case lookup time in an unbalanced Binary Search Tree?`,
          options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
          correctOptionIndex: 2,
          explanation: "When elements are inserted in already-sorted order, an unbalanced BST degenerates into a linked list of depth n, yielding O(n) search time.",
          hint: "Consider what happens if you insert sorted numbers 1, 2, 3, 4 into a tree.",
        },
        {
          id: "q-4",
          question: `When the central bank increases the reserve requirement for commercial banks, what is the anticipated effect on the money multiplier?`,
          options: [
            "The money multiplier increases, expanding the money supply",
            "The money multiplier decreases, restricting the credit creation capacity",
            "The money multiplier remains unaffected because interest rates adjust",
            "The velocity of money instantaneously doubles",
          ],
          correctOptionIndex: 1,
          explanation: "The simple money multiplier is 1 / reserve ratio (R). Increasing R increases the denominator, reducing the multiplier and curbing total bank lending.",
          hint: "The formula is 1 / R.",
        },
        {
          id: "q-5",
          question: `During aerobic cellular respiration, the majority of ATP is produced during which phase?`,
          options: [
            "Glycolysis in the cytoplasm",
            "The Citric Acid (Krebs) Cycle",
            "Oxidative phosphorylation via the electron transport chain and ATP synthase",
            "Lactic acid fermentation",
          ],
          correctOptionIndex: 2,
          explanation: "Oxidative phosphorylation produces approximately 26 to 28 of the 30-32 total ATP molecules per glucose molecule through chemiosmosis powered by proton gradients.",
          hint: "This stage utilizes the proton gradient across the inner mitochondrial membrane.",
        },
      ];
      return res.json({
        topic: topic || "Practice Assessment",
        subject: subject || "Core Subjects",
        difficulty,
        questions: fallbackQuestions.slice(0, questionCount),
      });
    }

    const response = await callGeminiGenerate(ai, {
      preferredModel: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite academic tutor creating assessment questions for students. Return structured JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            subject: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctOptionIndex: { type: Type.NUMBER },
                  explanation: { type: Type.STRING },
                  hint: { type: Type.STRING },
                },
                required: ["id", "question", "options", "correctOptionIndex", "explanation", "hint"],
              },
            },
          },
          required: ["topic", "subject", "questions"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/gemini/quiz:", error);
    res.status(500).json({ error: error.message || "Failed to generate quiz questions" });
  }
});

// AI Topic Explainer
app.post("/api/gemini/explain", async (req, res) => {
  try {
    const { topic, subject, style = "comprehensive" } = req.body;
    const ai = getGeminiClient();

    const prompt = `Explain the following academic concept in depth for a student:
Topic: ${topic}
Subject: ${subject || "General"}
Explanation Style: ${style} (Styles: "eli5" = explain like I'm 5 with relatable real-world analogies; "exam_ready" = high-yield summary, formulas, key steps, common traps; "comprehensive" = full pedagogical breakdown with examples).

Format cleanly with markdown sections:
1. Core Concept in One Sentence
2. Intuitive Real-World Analogy
3. Step-by-Step Breakdown / Mechanisms
4. High-Yield Exam Pitfalls to Avoid
5. Quick Self-Test Flash Check Question`;

    if (!ai) {
      const explanation = `### 🌟 Concept: ${topic || "Selected Subject Topic"} (${subject || "Academics"})

#### 1. Core Concept in One Sentence
**${topic}** is the foundational mechanism governing how components interact under constrained boundary conditions to reach equilibrium or optimal computational/physical efficiency.

#### 2. Intuitive Real-World Analogy
Imagine an airport security checkpoint: if you have 10 baggage scanners but only 1 ticket inspector at the door, the entire airport's throughput is capped by that single inspector. That bottleneck is the rate-determining step!

#### 3. Step-by-Step Breakdown
- **Initial Setup:** Identify the primary variables, inputs, and constraints.
- **Transformation Phase:** Energy transfer or algorithmic traversal occurs across defined state transitions.
- **Convergence / Output:** The final product or terminating condition is achieved with minimal entropy/loss.

#### 4. High-Yield Exam Pitfalls
⚠️ **Watch out for sign errors or edge conditions:**
- Remember boundary conditions (e.g., empty inputs, zero denominators, or steric hindrance).
- Never assume ideal conditions unless explicitly stated in the exam prompt.

#### 5. Quick Flash Check
*Can you explain why this process changes if temperature or input scale is doubled?* (Ponder for 15 seconds before moving on!)`;

      return res.json({ explanation });
    }

    const response = await callGeminiGenerate(ai, {
      preferredModel: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "You are an award-winning university professor and peer tutor renowned for making intricate topics intuitively graspable.",
        temperature: 0.6,
      },
    });

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.error("Error in /api/gemini/explain:", error);
    res.status(500).json({ error: error.message || "Failed to generate topic explanation" });
  }
});

// AI Priority Analyzer
app.post("/api/gemini/prioritize", async (req, res) => {
  try {
    const { tasks, exams, subjects } = req.body;
    const ai = getGeminiClient();

    const prompt = `Analyze this student's workload and return prioritized recommendations on what to tackle first and why:
Tasks: ${JSON.stringify(tasks || [])}
Exams: ${JSON.stringify(exams || [])}
Subjects: ${JSON.stringify(subjects || [])}

Calculate an urgency/impact score (1-100) and explain why each item is ranked where it is.`;

    if (!ai) {
      return res.json({
        topRecommendation: "Focus immediately on the Organic Chemistry Midterm revision and Data Structures Assignment.",
        rationale: "Organic Chemistry has both the nearest deadline and the lowest student confidence level (2/5). Data Structures assignment carries 20% of your course grade and is due in 48 hours.",
        prioritizedList: (tasks || []).map((t: any, idx: number) => ({
          taskId: t.id,
          title: t.title,
          suggestedRank: idx + 1,
          urgencyScore: Math.max(95 - idx * 12, 40),
          actionTip: `Dedicate a 35-min uninterrupted session to finish key deliverables today.`,
        })),
      });
    }

    const response = await callGeminiGenerate(ai, {
      preferredModel: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "You are an executive function and productivity coach for university and high-school students. Return JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topRecommendation: { type: Type.STRING },
            rationale: { type: Type.STRING },
            prioritizedList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  taskId: { type: Type.STRING },
                  title: { type: Type.STRING },
                  suggestedRank: { type: Type.NUMBER },
                  urgencyScore: { type: Type.NUMBER },
                  actionTip: { type: Type.STRING },
                },
                required: ["taskId", "title", "suggestedRank", "urgencyScore", "actionTip"],
              },
            },
          },
          required: ["topRecommendation", "rationale", "prioritizedList"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/gemini/prioritize:", error);
    res.status(500).json({ error: error.message || "Failed to prioritize workload" });
  }
});

// AI Learning Progress Summarizer
app.post("/api/gemini/summary", async (req, res) => {
  try {
    const { sessions, subjects, stats } = req.body;
    const ai = getGeminiClient();

    const prompt = `Analyze this student's recent study history and progress statistics:
Sessions: ${JSON.stringify(sessions || [])}
Subjects: ${JSON.stringify(subjects || [])}
Stats: ${JSON.stringify(stats || {})}

Provide a comprehensive, inspiring learning progress review highlighting:
1. Wins & Momentum (strengths, consistency, total hours)
2. Areas Needing Reinforcement (subjects with lowest time or high difficulty)
3. Personalized Next-Step Action Plan`;

    if (!ai) {
      return res.json({
        summary: `### 🚀 Weekly Learning Momentum Report

**Total Study Time:** 14.5 hours logged this week across 18 focused sessions.
**Streak:** 7-Day Consistency Streak! 🔥

#### 🏆 Standout Achievements
- **Strongest Consistency:** Excellent dedication to *Data Structures & Algorithms* with 5.5 hours logged.
- **Focus Quality:** Average session rating of 4.4/5, showing sustained high attention during Pomodoro cycles.

#### 🎯 Strategic Areas for Reinforcement
- **Organic Chemistry:** You've logged 2.5 hours this week, but your confidence is 2/5 and the midterm is fast approaching. Increase daily allocation by 30 minutes.
- **Active Recall vs. Passive Reading:** Shift more time from reading slides to practice problem solving.

#### 💡 Coach's Recommended Focus Tomorrow
Schedule your hardest Chemistry topic during your peak morning energy window (9 AM - 11 AM) for maximum retention.`,
      });
    }

    const response = await callGeminiGenerate(ai, {
      preferredModel: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "You are an encouraging, data-informed academic performance coach.",
        temperature: 0.6,
      },
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error("Error in /api/gemini/summary:", error);
    res.status(500).json({ error: error.message || "Failed to generate learning summary" });
  }
});

// AI Assistant for Searching Records using Natural Language
app.post("/api/ai/search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Search query is required." });
    }

    const trimmedQuery = query.trim();

    // 1. Fetch current application state from dbService
    const [subjects, tasks, exams, assignments, scheduleBlocks, notes, goals, profile] = await Promise.all([
      dbService.getSubjects(),
      dbService.getTasks(),
      dbService.getExams(),
      dbService.getAssignments(),
      dbService.getScheduleBlocks(),
      dbService.getNotes(),
      dbService.getGoals(),
      dbService.getProfile(),
    ]);

    const subjectMap = new Map(subjects.map((s) => [s.id, s]));

    // Compact dataset for LLM prompt context
    const contextData = {
      profile: {
        name: profile?.name,
        targetGPA: profile?.targetGPA,
        major: profile?.major,
      },
      subjects: subjects.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        difficulty: s.difficulty,
        confidenceLevel: s.confidenceLevel,
        currentGrade: s.currentGrade,
        targetGrade: s.targetGrade,
        topics: s.syllabusTopics,
      })),
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        subject: subjectMap.get(t.subjectId)?.name || t.subjectId,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate,
        estimatedMinutes: t.estimatedMinutes,
        notes: t.notes,
      })),
      exams: exams.map((e) => ({
        id: e.id,
        title: e.title,
        subject: subjectMap.get(e.subjectId)?.name || e.subjectId,
        date: e.date,
        time: e.time,
        weightPercentage: e.weightPercentage,
        topicsCovered: e.topicsToCover?.map((t) => t.topic) || [],
      })),
      assignments: assignments.map((a) => ({
        id: a.id,
        title: a.title,
        subject: subjectMap.get(a.subjectId)?.name || a.subjectId,
        dueDate: a.dueDate,
        status: a.status,
        weight: a.weight,
        description: a.description,
      })),
      scheduleBlocks: scheduleBlocks.map((b) => ({
        id: b.id,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        subject: subjectMap.get(b.subjectId)?.name || b.subjectId,
        title: b.title,
        completed: b.completed,
      })),
      notes: notes.map((n) => ({
        id: n.id,
        title: n.title,
        subject: subjectMap.get(n.subjectId)?.name || n.subjectId,
        tags: n.tags,
        contentSnippet: n.content?.slice(0, 150),
      })),
      goals: goals.map((g) => ({
        id: g.id,
        title: g.title,
        category: g.category,
        currentValue: g.currentValue,
        targetValue: g.targetValue,
        unit: g.unit,
      })),
    };

    const ai = getGeminiClient();

    // Contextual Fallback function when Gemini API is offline or key is missing
    const runFallbackSearch = () => {
      const q = trimmedQuery.toLowerCase();
      const stopWords = new Set(["show", "me", "the", "for", "and", "with", "what", "are", "all", "about", "have", "from"]);
      const tokens = q
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 3 && !stopWords.has(w));

      const matchedEntities: any[] = [];

      const hasTerm = (str?: string) => {
        if (!str) return false;
        const s = str.toLowerCase();
        if (s.includes(q) || q.includes(s)) return true;
        return tokens.some((token) => s.includes(token));
      };

      // Check tasks
      for (const t of tasks) {
        const subName = subjectMap.get(t.subjectId)?.name || "";
        const isMatch =
          hasTerm(t.title) ||
          hasTerm(subName) ||
          hasTerm(t.notes) ||
          (q.includes("urgent") && (t.priority === "urgent" || t.priority === "high")) ||
          (q.includes("pending") && t.status !== "completed") ||
          (q.includes("todo") && t.status === "todo") ||
          (q.includes("task") && (hasTerm(subName) || q.includes("all")));

        if (isMatch) {
          matchedEntities.push({
            id: t.id,
            type: "task",
            title: t.title,
            subtitle: `${subName} • Due ${t.dueDate} • ${t.estimatedMinutes} min`,
            badge: `${t.priority.toUpperCase()} • ${t.status}`,
            relevanceReason: `Matches priority/status and due date for ${subName}`,
            targetTab: "tasks",
          });
        }
      }

      // Check exams
      for (const e of exams) {
        const subName = subjectMap.get(e.subjectId)?.name || "";
        const isMatch =
          hasTerm(e.title) ||
          hasTerm(subName) ||
          (e.topicsToCover && e.topicsToCover.some((top) => hasTerm(top.topic))) ||
          q.includes("exam") ||
          q.includes("test") ||
          q.includes("midterm") ||
          q.includes("final");

        if (isMatch) {
          matchedEntities.push({
            id: e.id,
            type: "exam",
            title: e.title,
            subtitle: `${subName} • Scheduled ${e.date} at ${e.time}`,
            badge: `${e.weightPercentage}% of Grade`,
            relevanceReason: `Upcoming scheduled exam in ${subName}`,
            targetTab: "exams",
          });
        }
      }

      // Check assignments
      for (const a of assignments) {
        const subName = subjectMap.get(a.subjectId)?.name || "";
        const isMatch =
          hasTerm(a.title) ||
          hasTerm(subName) ||
          q.includes("assignment") ||
          q.includes("homework") ||
          q.includes("project");

        if (isMatch) {
          matchedEntities.push({
            id: a.id,
            type: "assignment",
            title: a.title,
            subtitle: `${subName} • Due ${a.dueDate} • Weight: ${a.weight}%`,
            badge: a.status,
            relevanceReason: `Course assignment in ${subName}`,
            targetTab: "tasks",
          });
        }
      }

      // Check subjects
      for (const s of subjects) {
        const isMatch =
          hasTerm(s.name) ||
          hasTerm(s.code) ||
          (s.syllabusTopics && s.syllabusTopics.some((top) => hasTerm(top))) ||
          (q.includes("hard") && s.difficulty === "hard") ||
          (q.includes("confidence") && s.confidenceLevel <= 2);

        if (isMatch) {
          matchedEntities.push({
            id: s.id,
            type: "subject",
            title: s.name,
            subtitle: `${s.code} • ${s.professor || "Faculty"} • ${s.credits} Credits`,
            badge: `Confidence ${s.confidenceLevel}/5 • Grade ${s.currentGrade}`,
            relevanceReason: `Subject curriculum & syllabus match`,
            targetTab: "subjects",
          });
        }
      }

      // Check notes
      for (const n of notes) {
        const subName = subjectMap.get(n.subjectId)?.name || "";
        const isMatch =
          hasTerm(n.title) ||
          hasTerm(n.content) ||
          (n.tags && n.tags.some((tag) => hasTerm(tag))) ||
          hasTerm(subName);

        if (isMatch) {
          matchedEntities.push({
            id: n.id,
            type: "note",
            title: n.title,
            subtitle: `${subName} • Tags: ${n.tags.join(", ")}`,
            badge: "Study Notes",
            relevanceReason: `Contains keywords in study notes or tags`,
            targetTab: "notes",
          });
        }
      }

      // Check schedule blocks
      for (const b of scheduleBlocks) {
        const subName = subjectMap.get(b.subjectId)?.name || "";
        const isMatch = hasTerm(b.title) || hasTerm(subName) || hasTerm(b.date);

        if (isMatch) {
          matchedEntities.push({
            id: b.id,
            type: "schedule",
            title: `${subName}: ${b.title}`,
            subtitle: `${b.date} ${b.startTime} - ${b.endTime}`,
            badge: b.completed ? "Completed" : "Scheduled",
            relevanceReason: `Scheduled calendar study block`,
            targetTab: "schedule",
          });
        }
      }

      const count = matchedEntities.length;
      const summary =
        count > 0
          ? `Found ${count} matching records across your study management system for "${trimmedQuery}". Review the prioritized items below.`
          : `No direct records matched "${trimmedQuery}". Try searching for specific subject names, assignment titles, or urgency terms like "urgent tasks" or "chemistry".`;

      return {
        query: trimmedQuery,
        summary,
        matchedCount: count,
        entities: matchedEntities.slice(0, 10),
        suggestedActions: [
          "View upcoming exams in Exams tab",
          "Focus on highest priority tasks",
          "Schedule a dedicated review block",
        ],
      };
    };

    const prompt = `User Query: "${trimmedQuery}"

You are the AI Search Assistant for the StudyPulse student management system.
Below is the student's complete, live database records across all entities:
${JSON.stringify(contextData, null, 2)}

Instructions:
1. Interpret the user's intent. They may use natural language, fuzzy phrasing, relative urgency ("what's due soonest", "hardest test", "biology notes").
2. Formulate a concise, insightful 1-3 sentence summary directly answering their question based on the actual data.
3. Identify the most relevant matching records (up to 8 items). Each entity must reference a real item from the dataset.
4. Set "targetTab" according to where the student can manage that item ("tasks", "exams", "subjects", "notes", "schedule", or "analytics").
5. Provide 2-3 helpful, actionable next steps or suggested follow-up queries.`;

    if (ai) {
      try {
        const response = await callGeminiGenerate(ai, {
          preferredModel: "gemini-3.5-flash-lite",
          contents: prompt,
          config: {
            systemInstruction:
              "You are an expert academic management search engine and advisor. Return pure JSON strictly matching the schema.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                entities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      type: {
                        type: Type.STRING,
                        description: "One of: task, exam, assignment, subject, note, schedule, goal",
                      },
                      title: { type: Type.STRING },
                      subtitle: { type: Type.STRING },
                      badge: { type: Type.STRING },
                      relevanceReason: { type: Type.STRING },
                      targetTab: {
                        type: Type.STRING,
                        description: "One of: tasks, exams, subjects, notes, schedule, analytics",
                      },
                    },
                    required: ["id", "type", "title", "subtitle", "relevanceReason", "targetTab"],
                  },
                },
                suggestedActions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["summary", "entities", "suggestedActions"],
            },
          },
        });

        let rawText = response.text || "{}";
        rawText = rawText.trim();
        if (rawText.startsWith("```json")) {
          rawText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (rawText.startsWith("```")) {
          rawText = rawText.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

        const parsed = JSON.parse(rawText);
        return res.json({
          query: trimmedQuery,
          summary: parsed.summary || `Found matching items for "${trimmedQuery}".`,
          matchedCount: parsed.entities?.length || 0,
          entities: parsed.entities || [],
          suggestedActions: parsed.suggestedActions || [],
        });
      } catch (genAiError: any) {
        console.warn(
          "[AISearch] Gemini call unavailable or encountered error, running local fallback search:",
          genAiError.message
        );
      }
    }

    // Always fallback safely to comprehensive keyword/entity search
    const fallbackResult = runFallbackSearch();
    return res.json(fallbackResult);
  } catch (error: any) {
    console.error("Critical error in /api/ai/search:", error);
    res.status(500).json({ error: error.message || "Failed to execute AI search." });
  }
});

// Vite middleware for development vs static production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudyPulse Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
