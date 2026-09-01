import type { ServerResponse } from "node:http";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import type { Plugin, ViteDevServer } from "vite";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";
import { componentMarkdown, llmsText } from "./scripts/manifest-markdown.ts";
import type { AgentManifest } from "./src/agent/types.ts";

const COMPONENT_MD = /^\/components\/([A-Za-z]+)\.md$/;

async function serveAgentSurface(
  server: ViteDevServer,
  rawUrl: string,
  res: ServerResponse,
): Promise<boolean> {
  const url = rawUrl.split("?")[0] ?? "";
  const match = COMPONENT_MD.exec(url);
  if (url !== "/agent-manifest.json" && url !== "/llms.txt" && match === null) {
    return false;
  }

  const data = (await server.ssrLoadModule("/scripts/manifest-data.ts")) as {
    agentManifest: () => AgentManifest;
  };
  const manifest = data.agentManifest();

  if (url === "/agent-manifest.json") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(`${JSON.stringify(manifest, null, 2)}\n`);
    return true;
  }

  if (url === "/llms.txt") {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(llmsText(manifest));
    return true;
  }

  const component = manifest.components.find((entry) => entry.name === match?.[1]);
  if (component === undefined) return false;
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.end(componentMarkdown(component));
  return true;
}

function agentSurface(): Plugin {
  return {
    name: "sprint-agent-surface",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        serveAgentSurface(server, req.url ?? "", res).then((handled) => {
          if (!handled) next();
        }, next);
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    agentSurface(),
    dts({
      include: ["src"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/test"],
      rollupTypes: true,
      tsconfigPath: "./tsconfig.json",
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  build: {
    target: "es2022",
    sourcemap: true,
    copyPublicDir: false,
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      name: "Sprint",
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
      formats: ["es", "cjs"],
      cssFileName: "sprint",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}", "dev/**/*.{test,spec}.{ts,tsx}"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.{test,spec}.{ts,tsx}", "src/test/**", "src/index.ts"],
    },
  },
});
