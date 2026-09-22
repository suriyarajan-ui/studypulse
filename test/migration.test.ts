import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dbService } from "../server/supabase";
import {
  INITIAL_SUBJECTS,
  INITIAL_TASKS,
  INITIAL_EXAMS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SESSIONS,
  INITIAL_GOALS,
  INITIAL_SCHEDULE_BLOCKS,
  INITIAL_NOTES,
  INITIAL_PROFILE,
} from "../src/data/initialData";

describe("Database Schema & Migration Validation", () => {
  it("should have initial records for all 9 SRS entities", () => {
    assert.ok(INITIAL_SUBJECTS.length > 0, "Subjects initial data present");
    assert.ok(INITIAL_TASKS.length > 0, "Tasks initial data present");
    assert.ok(INITIAL_EXAMS.length > 0, "Exams initial data present");
    assert.ok(INITIAL_ASSIGNMENTS.length > 0, "Assignments initial data present");
    assert.ok(INITIAL_SESSIONS.length > 0, "Sessions initial data present");
    assert.ok(INITIAL_GOALS.length > 0, "Goals initial data present");
    assert.ok(INITIAL_SCHEDULE_BLOCKS.length > 0, "Schedule blocks initial data present");
    assert.ok(INITIAL_NOTES.length > 0, "Notes initial data present");
    assert.ok(INITIAL_PROFILE.name.length > 0, "Student profile initial data present");
  });

  it("should enforce valid relational foreign keys for all child entities", () => {
    const subjectIds = new Set(INITIAL_SUBJECTS.map((s) => s.id));

    // Tasks -> Subjects
    for (const task of INITIAL_TASKS) {
      assert.ok(subjectIds.has(task.subjectId), `Task ${task.id} references valid subjectId ${task.subjectId}`);
    }

    // Exams -> Subjects
    for (const exam of INITIAL_EXAMS) {
      assert.ok(subjectIds.has(exam.subjectId), `Exam ${exam.id} references valid subjectId ${exam.subjectId}`);
    }

    // Assignments -> Subjects
    for (const asg of INITIAL_ASSIGNMENTS) {
      assert.ok(subjectIds.has(asg.subjectId), `Assignment ${asg.id} references valid subjectId ${asg.subjectId}`);
    }

    // Sessions -> Subjects
    for (const sess of INITIAL_SESSIONS) {
      assert.ok(subjectIds.has(sess.subjectId), `Session ${sess.id} references valid subjectId ${sess.subjectId}`);
    }

    // Schedule Blocks -> Subjects
    for (const block of INITIAL_SCHEDULE_BLOCKS) {
      assert.ok(subjectIds.has(block.subjectId), `Schedule block ${block.id} references valid subjectId ${block.subjectId}`);
    }

    // Notes -> Subjects
    for (const note of INITIAL_NOTES) {
      assert.ok(subjectIds.has(note.subjectId), `Note ${note.id} references valid subjectId ${note.subjectId}`);
    }
  });

  it("should retrieve all entities from dbService without data loss", async () => {
    const subjects = await dbService.getSubjects();
    const tasks = await dbService.getTasks();
    const exams = await dbService.getExams();
    const assignments = await dbService.getAssignments();
    const sessions = await dbService.getSessions();
    const goals = await dbService.getGoals();
    const schedule = await dbService.getScheduleBlocks();
    const notes = await dbService.getNotes();
    const profile = await dbService.getProfile();

    assert.ok(subjects.length >= INITIAL_SUBJECTS.length, "All subjects preserved");
    assert.ok(tasks.length >= INITIAL_TASKS.length, "All tasks preserved");
    assert.ok(exams.length >= INITIAL_EXAMS.length, "All exams preserved");
    assert.ok(assignments.length >= INITIAL_ASSIGNMENTS.length, "All assignments preserved");
    assert.ok(sessions.length >= INITIAL_SESSIONS.length, "All sessions preserved");
    assert.ok(goals.length >= INITIAL_GOALS.length, "All goals preserved");
    assert.ok(schedule.length >= INITIAL_SCHEDULE_BLOCKS.length, "All schedule blocks preserved");
    assert.ok(notes.length >= INITIAL_NOTES.length, "All notes preserved");
    assert.ok(profile.name, "Student profile preserved");
  });

  it("should support CRUD on subjects without side-effects", async () => {
    const newSubject = await dbService.createSubject({
      id: "sub-biochem-test",
      name: "Biochemistry I",
      code: "CHEM 301",
      color: "#8b5cf6",
      iconName: "FlaskConical",
      professor: "Dr. Lisa Wong",
      credits: 4,
      targetGrade: "A",
      currentGrade: "A",
      difficulty: "hard",
      confidenceLevel: 3,
      syllabusTopics: ["Enzyme Kinetics", "Metabolic Pathways"],
    });

    assert.ok(newSubject.id, "Generated subject ID exists");
    assert.equal(newSubject.name, "Biochemistry I");

    const updated = await dbService.updateSubject(newSubject.id, {
      currentGrade: "A+",
      confidenceLevel: 4,
    });
    assert.equal(updated?.currentGrade, "A+");
    assert.equal(updated?.confidenceLevel, 4);

    const deleted = await dbService.deleteSubject(newSubject.id);
    assert.equal(deleted, true);

    const remaining = await dbService.getSubjects();
    assert.equal(remaining.find((s) => s.id === newSubject.id), undefined);
  });
});
