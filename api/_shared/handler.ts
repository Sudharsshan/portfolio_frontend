import { validateEnv } from "./validation";
import { DiagnosticsError } from "./types";

/**
 * Reusable wrapper to run serverless handlers with top-level try/catch,
 * environment validation, structured logging, consistent error response,
 * and detailed diagnostics in development mode.
 */
export async function handleRequest(
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
