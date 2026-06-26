import { gitHubContentCache } from "./_shared/cache";

export default async function handler(req: any, res: any) {
  try {
    const standard = await gitHubContentCache.getProjectIdStandard();
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(standard);
  } catch (err: any) {
    console.error("[Vercel Handler] Error serving project standard:", err);
    return res.status(500).json({ error: "Failed to load standards" });
  }
}
