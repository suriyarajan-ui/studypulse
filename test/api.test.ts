import assert from "node:assert/strict";
import { describe, it } from "node:test";

const BASE_URL = "http://localhost:3000";

describe("StudyPulse REST API Endpoints", () => {
  it("GET /api/db/status returns valid health report", async () => {
    const res = await fetch(`${BASE_URL}/api/db/status`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.provider === "supabase" || data.provider === "local_fallback");
    assert.ok(typeof data.tableCounts === "object");
    assert.ok(data.tableCounts.subjects >= 4);
    assert.ok(data.tableCounts.tasks >= 5);
  });

  it("GET /api/subjects returns subject list", async () => {
    const res = await fetch(`${BASE_URL}/api/subjects`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 4);
    assert.ok(data[0].id);
    assert.ok(data[0].name);
    assert.ok(data[0].code);
  });

  it("POST, PUT, and DELETE /api/tasks manages task lifecycle", async () => {
    // 1. Get subjects to find a valid foreign key
    const subRes = await fetch(`${BASE_URL}/api/subjects`);
    const subjects = await subRes.json();
    const validSubjectId = subjects[0].id;

    // 2. Create task
    const createRes = await fetch(`${BASE_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Automated Verification Task",
        subjectId: validSubjectId,
        dueDate: "2026-09-30",
        dueTime: "23:59",
        priority: "high",
        status: "todo",
        estimatedMinutes: 45,
        type: "practice",
        notes: "Automated test notes",
      }),
    });
    assert.equal(createRes.status, 201);
    const created = await createRes.json();
    assert.ok(created.id);
    assert.equal(created.title, "Test Automated Verification Task");

    // 3. Update task
    const updateRes = await fetch(`${BASE_URL}/api/tasks/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "completed",
        actualMinutes: 40,
        completedAt: new Date().toISOString(),
      }),
    });
    assert.equal(updateRes.status, 200);
    const updated = await updateRes.json();
    assert.equal(updated.status, "completed");
    assert.equal(updated.actualMinutes, 40);

    // 4. Delete task
    const delRes = await fetch(`${BASE_URL}/api/tasks/${created.id}`, {
      method: "DELETE",
    });
    assert.equal(delRes.status, 200);
    const delData = await delRes.json();
    assert.equal(delData.success, true);
  });

  it("GET /api/exams returns scheduled exams", async () => {
    const res = await fetch(`${BASE_URL}/api/exams`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 3);
  });

  it("GET /api/assignments returns active assignments", async () => {
    const res = await fetch(`${BASE_URL}/api/assignments`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 3);
  });

  it("GET /api/goals and /api/schedule return goals and time blocks", async () => {
    const [goalsRes, schedRes] = await Promise.all([
      fetch(`${BASE_URL}/api/goals`),
      fetch(`${BASE_URL}/api/schedule`),
    ]);
    assert.equal(goalsRes.status, 200);
    assert.equal(schedRes.status, 200);
    const goals = await goalsRes.json();
    const schedule = await schedRes.json();
    assert.ok(Array.isArray(goals));
    assert.ok(Array.isArray(schedule));
  });

  it("GET and PUT /api/profile handles student profile", async () => {
    const getRes = await fetch(`${BASE_URL}/api/profile`);
    assert.equal(getRes.status, 200);
    const prof = await getRes.json();
    assert.ok(prof.name);

    const updateRes = await fetch(`${BASE_URL}/api/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ streakCount: prof.streakCount }),
    });
    assert.equal(updateRes.status, 200);
    const updated = await updateRes.json();
    assert.equal(updated.name, prof.name);
  });

  it("POST /api/ai/search processes natural language search queries", async () => {
    // 1. Natural language query for exams and subjects
    const res = await fetch(`${BASE_URL}/api/ai/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "Organic Chemistry exam and midterm" }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.query, "Organic Chemistry exam and midterm");
    assert.ok(typeof data.summary === "string" && data.summary.length > 0);
    assert.ok(typeof data.matchedCount === "number");
    assert.ok(Array.isArray(data.entities));
    assert.ok(data.entities.length > 0);
    assert.ok(data.entities[0].id);
    assert.ok(data.entities[0].type);
    assert.ok(data.entities[0].title);
    assert.ok(data.entities[0].targetTab);
    assert.ok(Array.isArray(data.suggestedActions));

    // 2. Natural language query for tasks
    const taskRes = await fetch(`${BASE_URL}/api/ai/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "Show urgent pending tasks" }),
    });

    assert.equal(taskRes.status, 200);
    const taskData = await taskRes.json();
    assert.ok(Array.isArray(taskData.entities));
    assert.ok(taskData.entities.length > 0);

    // 3. Validation error on empty query
    const emptyRes = await fetch(`${BASE_URL}/api/ai/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "   " }),
    });
    assert.equal(emptyRes.status, 400);
    const errData = await emptyRes.json();
    assert.ok(errData.error);
  });

  it("POST /api/gemini/chat answers questions with student context", async () => {
    const res = await fetch(`${BASE_URL}/api/gemini/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "What should I study next right now?",
        studentContext: {
          subjects: [{ name: "Organic Chemistry" }],
        },
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.reply);
    assert.ok(typeof data.reply === "string" && data.reply.length > 0);
  });
});
