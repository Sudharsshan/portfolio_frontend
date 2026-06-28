import { validateEnv } from "./validation.js";
import { DiagnosticsError } from "./types.js";
import { gitHubContentCache } from "./cache.js";

async function runHandler(
  req: any,
  res: any,
  endpointName: string,
  action: () => Promise<any>
) {
  const isDev = process.env.NODE_ENV !== "production";
  console.log(`[${endpointName}] Request received`);

  try {
    console.log(`[${endpointName}] Reading environment variables`);
    validateEnv(`Initializing ${endpointName} request`);
    console.log(`[${endpointName}] GitHub token detected`);

    const result = await action();

    console.log(`[${endpointName}] Returning response`);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(result);

  } catch (err: any) {
    console.error(`[${endpointName} Error] Exception caught in API gateway wrapper:`, err);

    res.setHeader("Content-Type", "application/json");

    const message = err.message || String(err);
    const step = err instanceof DiagnosticsError ? err.step : "Executing handler";
    const details = err instanceof DiagnosticsError ? err.details : undefined;
    const stack = err.stack;

    if (isDev) {
      return res.status(500).json({
        success: false,
        step,
        message,
        stack,
        details
      });
    } else {
      return res.status(500).json({
        success: false,
        message,
        error: err.name || "Error"
      });
    }
  }
}

export async function handleProjects(req: any, res: any) {
  return runHandler(req, res, "Projects", async () => {
    return await gitHubContentCache.getProjects();
  });
}

export async function handleInternship(req: any, res: any) {
  return runHandler(req, res, "Internship", async () => {
    return await gitHubContentCache.getInternship();
  });
}

export async function handleProjectIdStandard(req: any, res: any) {
  return runHandler(req, res, "ProjectIDStandard", async () => {
    return await gitHubContentCache.getProjectIdStandard();
  });
}
