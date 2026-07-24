import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "./index.js";

// Mock the openrouter fetch globally if needed or just test the health endpoint
describe("API Regression Tests", () => {
  it("GET /api/health - should return status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.uptime).toBeDefined();
    expect(res.body.memory).toBeDefined();
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
});
