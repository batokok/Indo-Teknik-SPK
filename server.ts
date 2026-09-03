import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();

  // In production (Cloud Run), listen on the PORT provided by the environment (default 8080).
  // In development, bind strictly to port 3000 as required by the dev reverse proxy.
  const isProduction = process.env.NODE_ENV === "production";
  const PORT = isProduction ? (Number(process.env.PORT) || 8080) : 3000;

  app.use(express.json());

  // API routes go here FIRST
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      environment: isProduction ? "production" : "development",
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware for development vs static serve for production
  if (!isProduction) {
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
    console.log(`Server running on http://0.0.0.0:${PORT} (mode: ${isProduction ? "production" : "development"})`);
  });
}

startServer();
