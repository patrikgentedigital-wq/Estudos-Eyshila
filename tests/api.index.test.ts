import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../api/index.js";

describe("API Regression Tests", () => {
  it("GET /api/health - should return status ok without process details", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.uptime).toBeUndefined();
    expect(res.body.memory).toBeUndefined();
  });

  it("GET /api/ready - should fail closed when critical services are not configured", async () => {
    const res = await request(app).get("/api/ready");
    expect(res.status).toBe(503);
    expect(res.body.status).toBe("not_ready");
    expect(res.body.checks).toMatchObject({
      authentication: false,
      database: false,
      ai: false,
    });
  });

  it("GET /api/exams/blueprints/enare-2026 - should expose the configured form exactly", async () => {
    const res = await request(app).get("/api/exams/blueprints/enare-2026");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      questionCount: 100,
      durationMinutes: 300,
      optionsPerQuestion: 5,
      generalQuestionCount: 20,
      specificQuestionCount: 80,
      minimumPassingPercentage: 50,
      allowPause: false,
      feedbackPolicy: "after_submission",
    });
  });

  it("POST /api/exams/start - should fail closed without authenticated server database access", async () => {
    const res = await request(app)
      .post("/api/exams/start")
      .send({ mode: "benchmark" });
    expect([401, 503]).toContain(res.status);
    expect(res.body.questions).toBeUndefined();
  });

  it("POST /api/generate-study - should return 400 for empty body", async () => {
    const res = await request(app)
      .post("/api/generate-study")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Envie um arquivo PDF/texto ou digite um conteúdo de estudo.");
  });

  it("POST /api/chat-study - should return 400 for empty message", async () => {
    const res = await request(app)
      .post("/api/chat-study")
      .send({ message: "" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Mensagem vazia.");
  });

  it("POST /api/extract-pdf-text - should reject an empty upload", async () => {
    const res = await request(app)
      .post("/api/extract-pdf-text")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
