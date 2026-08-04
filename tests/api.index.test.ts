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
