import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { gitHubContentCache } from "./src/services/GitHubContentCache";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to fetch projects from GitHub (with caching and freshness check)
  app.get("/api/projects", async (req, res) => {
    try {
      const result = await gitHubContentCache.getProjects();
      return res.json(result);
    } catch (err: any) {
      console.error("[Server] Error serving projects:", err);
      // Ensure we don't throw 500, but fallback graciously
      return res.json({ projects: [], source: "error" });
    }
  });

  // API Route to fetch internship markdown and convert to HTML (cached)
  app.get("/api/internship", async (req, res) => {
    try {
      const result = await gitHubContentCache.getInternship();
      return res.json(result);
    } catch (err: any) {
      console.error("[Server] Error serving internship:", err);
      return res.status(500).json({ error: "Failed to parse internship markdown" });
    }
  });

  // API Route to fetch project standard markdown and convert to HTML (cached)
  app.get("/api/project-id-standard", async (req, res) => {
    try {
      const result = await gitHubContentCache.getProjectIdStandard();
      return res.json(result);
    } catch (err: any) {
      console.error("[Server] Error serving project standard:", err);
      return res.status(500).json({ error: "Failed to parse standards markdown" });
    }
  });

  // Serve static assets in production, or mount Vite dev server in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
