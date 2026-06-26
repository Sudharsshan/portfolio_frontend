import { gitHubContentCache } from "./_shared/cache";

export default async function handler(req: any, res: any) {
  try {
    const internship = await gitHubContentCache.getInternship();
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(internship);
  } catch (err: any) {
    console.error("[Vercel Handler] Error serving internship:", err);
    return res.status(500).json({ error: "Failed to load internship" });
  }
}
