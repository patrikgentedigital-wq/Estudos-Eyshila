import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser setup with 20MB limit for base64 file uploads (PDFs)
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // Initialize Gemini client lazily to avoid crashing on missing environment keys at startup
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("A chave GEMINI_API_KEY não foi encontrada nos segredos do projeto. Por favor, adicione-a no painel 'Settings > Secrets'.");
      }
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (error?.status === 429 && retries > 0) {
        console.warn(`Quota exceeded for Gemini API, retrying in ${delay}ms... (retries left: ${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  // API endpoint to expose Firebase configuration to the frontend
  app.get("/api/config", (req, res) => {
    res.json({
      firebase: {
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.VITE_FIREBASE_APP_ID,
      }
    });
  });

  // API endpoint to generate study summary and questions
  app.post("/api/generate-study", async (req, res) => {
    try {
      const { fileData, fileName, mimeType, text } = req.body;

      if (!fileData && !text) {
        return res.status(400).json({ error: "Missing study material data (fileData or text)." });
      }

      const ai = getGeminiClient();
      let contents: any[] = [];

      if (fileData) {
        contents = [
          {
            inlineData: {
              data: fileData,
              mimeType: mimeType || "application/pdf"
            }
          },
          "Gere um resumo de estudos completo, exatamente 5 questões de múltipla escolha com explicações, e exatamente 6 flashcards (perguntas/respostas curtas de active recall) baseados neste documento anexado."
        ];
      } else {
        contents = [
          `Por favor, gere um resumo de estudos completo, exatamente 5 questões de múltipla escolha com explicações, e exatamente 6 flashcards (perguntas/respostas curtas de active recall) baseados no seguinte texto:\n\n${text}`
        ];
      }

      const response = await retryWithBackoff(() => ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contents,
        config: {
          systemInstruction: "Você é o Mentor Inteligente do 'Você Aprovado', um assistente acadêmico especialista em elaborar materiais e questões didáticas de alto nível para concurseiros e candidatos à residência em Enfermagem (ENARE). Escreva tudo em Português.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: "Um resumo de fixação detalhado, bem estruturado e focado nas principais condutas, definições e conceitos do material. Use formatação Markdown (títulos, negritos, tópicos)."
              },
              questions: {
                type: Type.ARRAY,
                description: "Uma lista com exatamente 5 questões inéditas de múltipla escolha no padrão ENARE.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: {
                      type: Type.STRING,
                      description: "O enunciado da questão com um contexto clínico ou regulatório."
                    },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Exatamente 4 opções, iniciando respectivamente por 'A) ', 'B) ', 'C) ', 'D) '."
                    },
                    answer: {
                      type: Type.STRING,
                      description: "A letra da alternativa correta ('A', 'B', 'C' ou 'D')."
                    },
                    explanation: {
                      type: Type.STRING,
                      description: "Uma explicação didática clara e aprofundada de por que essa alternativa é a correta e por que as outras estão incorretas."
                    }
                  },
                  required: ["question", "options", "answer", "explanation"]
                }
              },
              flashcards: {
                type: Type.ARRAY,
                description: "Uma lista com exatamente 6 flashcards de fixação (active recall).",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: {
                      type: Type.STRING,
                      description: "Uma pergunta ou conceito direto para desafiar a memória do aluno (Frente do cartão)."
                    },
                    back: {
                      type: Type.STRING,
                      description: "A resposta correta e sucinta ou explicação direta (Verso do cartão)."
                    }
                  },
                  required: ["front", "back"]
                }
              }
            },
            required: ["summary", "questions", "flashcards"]
          }
        }
      }));

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Gemini returned an empty response.");
      }

      const parsedData = JSON.parse(responseText);
      res.json(parsedData);

    } catch (error: any) {
      console.error("Gemini Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate study materials." });
    }
  });

  // API endpoint for AI study chat/search
  app.post("/api/chat-study", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Missing message." });
      }

      const ai = getGeminiClient();
      
      const chat = ai.chats.create({
        model: "gemini-2.0-flash",
        config: {
          systemInstruction: "Você é o Mentor Inteligente do 'Você Aprovado', um assistente acadêmico especialista em Enfermagem e SUS para o ENARE. Responda de forma didática, objetiva e em Português do Brasil. Se o usuário pedir para adicionar um assunto, explique o conceito e forneça um resumo estruturado.",
        }
      });

      // Simple history mapping if provided
      const response = await retryWithBackoff(() => chat.sendMessage({ message }));
      
      res.json({ text: response.text });

    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({ error: error.message || "Failed to process AI chat." });
    }
  });

  // Vite middleware for development vs static asset serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // Fallback all routes to index.html for SPA router (Vite SPA template)
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production build from dist/");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express application running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server startup crash:", err);
});
