import { handleProjectIdStandard } from "../lib/server/handler.js";

export default async function handler(req: any, res: any) {
  return handleProjectIdStandard(req, res);
}
