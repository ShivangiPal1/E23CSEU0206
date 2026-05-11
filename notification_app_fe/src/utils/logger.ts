type FrontendPackage = "api" | "component" | "hook" | "page" | "utils";
type LogLevel = "info" | "warn" | "error";

type LoggerFunction = (
  stack: "frontend",
  level: "debug" | "info" | "warn" | "error" | "fatal",
  packageName: string,
  message: string
) => Promise<unknown>;

let loggerPromise: Promise<LoggerFunction | null> | null = null;

async function getLogger() {
  if (!loggerPromise) {
    // The shared middleware lives outside this Vite app and does not ship TS types.
    // @ts-expect-error Existing CommonJS middleware is imported as-is.
    loggerPromise = import("../../../logging_middleware/index.js")
      .then((module) => (module.default ?? module) as LoggerFunction)
      .catch(() => null);
  }

  return loggerPromise;
}

async function writeLog(level: LogLevel, packageName: FrontendPackage, message: string) {
  const logger = await getLogger();

  if (!logger) {
    return;
  }

  try {
    await logger("frontend", level, packageName, message);
  } catch {
    // Keep the UI quiet if logging fails.
  }
}

export function logInfo(packageName: FrontendPackage, message: string) {
  return writeLog("info", packageName, message);
}

export function logWarn(packageName: FrontendPackage, message: string) {
  return writeLog("warn", packageName, message);
}

export function logError(packageName: FrontendPackage, message: string) {
  return writeLog("error", packageName, message);
}
