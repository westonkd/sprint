import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { componentMarkdown, llmsText } from "./scripts/manifest-markdown.ts";
import type { AgentManifest } from "./src/agent/types.ts";

const root = import.meta.dirname;

function agentSurface(): Plugin {
  return {
    name: "sprint-agent-surface",
    generateBundle() {
      const source = readFileSync(resolve(root, "agent-manifest.json"), "utf8");
      const manifest = JSON.parse(source) as AgentManifest;

      this.emitFile({ type: "asset", fileName: "agent-manifest.json", source });
      this.emitFile({
        type: "asset",
        fileName: "llms.txt",
        source: llmsText(manifest),
      });
      this.emitFile({ type: "asset", fileName: ".nojekyll", source: "" });

      for (const component of manifest.components) {
        this.emitFile({
          type: "asset",
          fileName: `components/${component.name}.md`,
          source: componentMarkdown(component),
        });
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), agentSurface()],
  resolve: {
    alias: {
      "@": resolve(root, "src"),
    },
  },
  build: {
    target: "es2022",
    outDir: "dist-docs",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(root, "index.html"),
        workbench: resolve(root, "workbench.html"),
      },
    },
  },
});
