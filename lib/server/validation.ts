import { DiagnosticsError } from "./types.js";

/**
 * Validates that all required environment variables are present.
 * If any are missing, logs and throws a descriptive DiagnosticsError.
 */
export function validateEnv(step: string): void {
  const required = [
    "GITHUB_TOKEN",
    "GITHUB_REPO_OWNER",
    "GITHUB_REPO_NAME",
    "GITHUB_PROJECTS_PATH"
  ];

  for (const varName of required) {
    if (!process.env[varName]) {
      const errorMsg = `Environment validation failed: Required environment variable "${varName}" is missing.`;
      console.error(`[Env Validation Error] ${errorMsg}`);
      throw new DiagnosticsError(errorMsg, step, {
        missingVariable: varName,
        validatedVariables: required.reduce((acc, curr) => {
          acc[curr] = !!process.env[curr];
          return acc;
        }, {} as Record<string, boolean>)
      });
    }
  }
}
