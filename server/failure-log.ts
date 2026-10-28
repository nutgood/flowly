/**
 * Logs a background failure: label, optional context (ids, paths) and the error's message.
 * Every daemon-side error log goes through here so the format stays uniform;
 * `server/failure-log.test.ts` fails on a bare `console.error` elsewhere.
 */
export function logFailure(label: string, error: unknown, context?: string) {
  const text = error instanceof Error ? error.message : String(error);
  if (context) console.error(label, context, text);
  else console.error(label, text);
}
