import { expect, test, vi } from "vitest";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { logFailure } from "./failure-log";

test("logFailure: label, then the optional context, then the message", () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
  logFailure("Kanban project folder not saved:", new Error("EACCES /Users/alice"), "project-123");
  expect(log).toHaveBeenCalledWith("Kanban project folder not saved:", "project-123", "EACCES /Users/alice");
  logFailure("Kanban auto wrap-up failed:", "boom");
  expect(log).toHaveBeenLastCalledWith("Kanban auto wrap-up failed:", "boom");
  log.mockRestore();
});

test("daemon code logs failures only through logFailure", async () => {
  const root = join(__dirname, "..");
  const files = ["index.server.ts", ...(await readdir(join(root, "server"), { recursive: true })).map((f) => join("server", String(f)))].filter(
    (f) => f.endsWith(".ts") && !f.endsWith(".test.ts") && f !== join("server", "failure-log.ts"),
  );
  const offenders: string[] = [];
  for (const file of files) {
    const text = await readFile(join(root, file), "utf8");
    text.split("\n").forEach((line, i) => {
      if (line.includes("console.error(")) offenders.push(`${file}:${i + 1}`);
    });
  }
  expect(offenders, "use logFailure(label, error, context?) from server/failure-log.ts").toEqual([]);
});
