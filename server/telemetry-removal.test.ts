import { afterEach, expect, test } from "vitest";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { removeTelemetryState } from "./service";

const dirs: string[] = [];
afterEach(async () => {
  await Promise.all(dirs.splice(0).map((p) => rm(p, { recursive: true, force: true })));
});

test("removes the old install id and the host switch, nothing else", async () => {
  const home = await mkdtemp(join(tmpdir(), "flowly-telemetry-removal-"));
  dirs.push(home);
  const data = join(home, "plugin-data", "flowly");
  const settings = join(home, "plugin-settings", "flowly");
  await mkdir(data, { recursive: true });
  await mkdir(settings, { recursive: true });
  for (const name of ["telemetry.json", "telemetry.json.invalid-1761000000000", "board.json", "telemetry-notes.json"]) await writeFile(join(data, name), "{}");
  for (const name of ["telemetry.json", "performance.json"]) await writeFile(join(settings, name), "{}");
  await removeTelemetryState(data, home);
  expect((await readdir(data)).sort()).toEqual(["board.json", "telemetry-notes.json"]);
  expect(await readdir(settings)).toEqual(["performance.json"]);
  // A missing folder is not an error.
  await removeTelemetryState(join(home, "nowhere"), join(home, "nowhere"));
});
