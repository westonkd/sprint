#!/usr/bin/env bun
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

const required = [
  "dist/index.js",
  "dist/index.cjs",
  "dist/index.d.ts",
  "dist/sprint.css",
  "agent-manifest.json",
];

const failures: string[] = [];

for (const relative of required) {
  const file = Bun.file(resolve(root, relative));
  if (!(await file.exists())) {
    failures.push(`${relative} was not emitted`);
    continue;
  }
  if (file.size === 0) {
    failures.push(`${relative} is empty`);
  }
}

if (failures.length > 0) {
  console.error("Build output check failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`Build output check passed (${required.length} artifacts)`);
