// ============================================================
// FICHIER : logger.ts
// ============================================================

const IS_DEV = import.meta.env.DEV;

export function logError(context: string, message: string, data: Record<string, unknown> = {}): void {
  if (IS_DEV) {
    console.error(`[JeuHome][${context}] ${message}`, data);
  }
}

export function logWarn(context: string, message: string, data: Record<string, unknown> = {}): void {
  if (IS_DEV) {
    console.warn(`[JeuHome][${context}] ${message}`, data);
  }
}
