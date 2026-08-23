import { describe, expect, it } from "vitest";
import { listAgentMeta } from "../agent/registry.ts";
import {
  PARAM_DESCRIPTION_LIMIT,
  TOOL_DESCRIPTION_LIMIT,
} from "../agent/webmcp/adapter.ts";
import { slug } from "../agent/webmcp/scope.ts";
import "./index.ts";

const catalog = listAgentMeta();

describe("catalog", () => {
  it("has at least one registered component", () => {
    expect(catalog.length).toBeGreaterThan(0);
  });

  it.each(catalog.map((meta) => [meta.name, meta] as const))(
    "%s documents itself for a reader who cannot see the source",
    (_name, meta) => {
      expect(meta.summary.length).toBeGreaterThan(20);
      expect(meta.whenToUse.length).toBeGreaterThan(20);
      expect(meta.examples.length).toBeGreaterThan(0);

      const titles = new Set<string>();
      for (const example of meta.examples) {
        expect(example.title).not.toBe("");
        expect(example.code).toContain(`<${meta.name}`);
        expect(titles.has(example.title), `duplicate example "${example.title}"`).toBe(
          false,
        );
        titles.add(example.title);
      }
    },
  );

  it.each(catalog.map((meta) => [meta.name, meta] as const))(
    "%s documents every prop",
    (_name, meta) => {
      for (const [prop, spec] of Object.entries(meta.props)) {
        expect(spec.description, `${prop} has no description`).not.toBe("");
        if (spec.kind === "enum") {
          expect(spec.values, `${prop} is an enum with no values`).toBeDefined();
        }
      }
    },
  );

  it.each(catalog.map((meta) => [meta.name, meta] as const))(
    "%s keeps every state attribute inside the convention",
    (_name, meta) => {
      for (const [key, spec] of Object.entries(meta.state ?? {})) {
        expect(spec.attribute, `${key} is outside the data-sprint- prefix`).toMatch(
          /^data-sprint-/,
        );
        expect(spec.description).not.toBe("");
      }
    },
  );

  it.each(catalog.map((meta) => [meta.name, meta] as const))(
    "%s keeps tool text within the platform limits",
    (_name, meta) => {
      for (const [key, tool] of Object.entries(meta.tools ?? {})) {
        expect(
          tool.description.length,
          `${key} description exceeds the platform limit`,
        ).toBeLessThanOrEqual(TOOL_DESCRIPTION_LIMIT);
        expect(tool.description.length).toBeGreaterThan(20);
        expect(tool.registeredWhen).not.toBe("");
        expect(slug(tool.verb)).toBe(tool.verb);

        for (const [param, property] of Object.entries(tool.inputSchema.properties)) {
          expect(
            (property.description ?? "").length,
            `${key}.${param} description exceeds the platform limit`,
          ).toBeLessThanOrEqual(PARAM_DESCRIPTION_LIMIT);
        }

        for (const required of tool.inputSchema.required ?? []) {
          expect(
            tool.inputSchema.properties[required],
            `${key} requires "${required}" but does not declare it`,
          ).toBeDefined();
        }
      }
    },
  );

  it.each(catalog.map((meta) => [meta.name, meta] as const))(
    "%s serializes cleanly into the manifest",
    (_name, meta) => {
      expect(JSON.parse(JSON.stringify(meta))).toEqual(meta);
    },
  );
});
