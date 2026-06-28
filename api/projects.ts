import { handleProjects } from "../lib/server/handler.js";

export default async function handler(req: any, res: any) {
  return handleProjects(req, res);
}
