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

const bundles = ["dist/index.js", "dist/index.cjs", "dist/index.d.ts"];
const aliasSpecifier = /from\s+["']@\//;

for (const relative of bundles) {
  const file = Bun.file(resolve(root, relative));
  if (!(await file.exists())) continue;
  if (aliasSpecifier.test(await file.text())) {
    failures.push(`${relative} still imports from "@/", which no consumer can resolve`);
  }
}

if (failures.length > 0) {
  console.error("Build output check failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`Build output check passed (${required.length} artifacts)`);
