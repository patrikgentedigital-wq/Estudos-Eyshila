import path from "path";
import { createServer as createViteServer } from "vite";
import app from "./api/index.js"; // Note: using .js extension for ES modules or rely on esbuild bundling

async function startServer() {
  const PORT = process.env.PORT || 3000;

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
    const express = (await import("express")).default;
    app.use(express.static(distPath));
    
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production build from dist/");
  }

  app.listen(PORT, () => {
    console.log(`Express application running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server startup crash:", err?.message || err);
});
