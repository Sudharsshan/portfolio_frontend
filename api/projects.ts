import { gitHubContentCache } from "./_shared/cache";

export default async function handler(req: any, res: any) {
  try {
    const projects = await gitHubContentCache.getProjects();
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(projects);
  } catch (err: any) {
    console.error("[Vercel Handler] Error serving projects:", err);
    return res.status(500).json({ error: "Failed to load projects" });
  }
}
