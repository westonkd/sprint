#!/usr/bin/env bun
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildAgentManifest } from "../src/index.ts";
import "../src/components/index.ts";

const root = resolve(import.meta.dirname, "..");
const pkg = await Bun.file(resolve(root, "package.json")).json();
const manifest = buildAgentManifest(pkg.version);
const outfile = resolve(root, "agent-manifest.json");

await writeFile(outfile, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `agent-manifest.json written with ${manifest.components.length} component(s)`,
);
