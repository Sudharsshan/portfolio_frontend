import { gitHubContentCache } from "./_shared/cache";
import { handleRequest } from "./_shared/handler";

export default async function handler(req: any, res: any) {
  return handleRequest(req, res, "ProjectIDStandard", async () => {
    return await gitHubContentCache.getProjectIdStandard();
  });
}
