import { describe, expect, it, vi } from "vitest";
import { TRUNCATION_MARKER } from "@/agent/view/truncate.ts";
import { installMockModelContext } from "@/test/modelContext.ts";
import {
  getModelContext,
  isModelContextAvailable,
  PARAM_DESCRIPTION_LIMIT,
  registerTool,
  TOOL_DESCRIPTION_LIMIT,
  TOOL_OUTPUT_LIMIT,
  validateInputs,
} from "./adapter.ts";
import type { JsonSchemaObject, ToolDescriptor } from "./types.ts";

const emptySchema: JsonSchemaObject = { type: "object", properties: {} };

function descriptor(overrides: Partial<ToolDescriptor> = {}): ToolDescriptor {
  return {
    name: "press-go",
    description: "Press the Go button.",
    inputSchema: emptySchema,
    execute: () => "pressed",
    ...overrides,
  };
}

describe("getModelContext", () => {
  it("is null when the platform API is absent", () => {
    expect(getModelContext()).toBeNull();
    expect(isModelContextAvailable()).toBe(false);
  });

  it("finds the platform API when present", () => {
    const mock = installMockModelContext();
    expect(isModelContextAvailable()).toBe(true);
    mock.uninstall();
  });
});

describe("registerTool", () => {
  it("is inert and reports failure without a model context", () => {
    const controller = new AbortController();
    expect(registerTool(descriptor(), controller.signal)).toBe(false);
  });

  it("passes the signal through to the platform", () => {
    const mock = installMockModelContext();
    const controller = new AbortController();
    expect(registerTool(descriptor(), controller.signal)).toBe(true);
    expect(mock.find("press-go")?.signal).toBe(controller.signal);
    mock.uninstall();
  });

  it("unregisters when the signal aborts", () => {
    const mock = installMockModelContext();
    const controller = new AbortController();
    registerTool(descriptor(), controller.signal);
    expect(mock.names()).toEqual(["press-go"]);
    controller.abort();
    expect(mock.names()).toEqual([]);
    mock.uninstall();
  });

  it("does not register against an already-aborted signal", () => {
    const mock = installMockModelContext();
    const controller = new AbortController();
    controller.abort();
    expect(registerTool(descriptor(), controller.signal)).toBe(false);
    expect(mock.history).toHaveLength(0);
    mock.uninstall();
  });

  it("throws at registration when the description exceeds the platform limit", () => {
    const mock = installMockModelContext();
    expect(() =>
      registerTool(
        descriptor({ description: "x".repeat(TOOL_DESCRIPTION_LIMIT + 1) }),
        new AbortController().signal,
      ),
    ).toThrow(/description is 501 characters/);
    mock.uninstall();
  });

  it("throws at registration when a parameter description exceeds the limit", () => {
    const mock = installMockModelContext();
    expect(() =>
      registerTool(
        descriptor({
          inputSchema: {
            type: "object",
            properties: {
              region: {
                type: "string",
                description: "x".repeat(PARAM_DESCRIPTION_LIMIT + 1),
              },
            },
          },
        }),
        new AbortController().signal,
      ),
    ).toThrow(/parameter "region"/);
    mock.uninstall();
  });

  it("validates descriptor limits even without a model context", () => {
    expect(() =>
      registerTool(
        descriptor({ description: "x".repeat(TOOL_DESCRIPTION_LIMIT + 1) }),
        new AbortController().signal,
      ),
    ).toThrow();
  });
});

describe("hardened execute", () => {
  it("clamps output to the platform limit", async () => {
    const mock = installMockModelContext();
    registerTool(
      descriptor({ execute: () => "y".repeat(5000) }),
      new AbortController().signal,
    );
    const result = await mock.call("press-go");
    expect(result?.length).toBeLessThanOrEqual(TOOL_OUTPUT_LIMIT);
    expect(result?.endsWith(TRUNCATION_MARKER)).toBe(true);
    mock.uninstall();
  });

  it("resolves a throwing tool to a descriptive string rather than rejecting", async () => {
    const mock = installMockModelContext();
    registerTool(
      descriptor({
        execute: () => {
          throw new Error("network down");
        },
      }),
      new AbortController().signal,
    );
    await expect(mock.call("press-go")).resolves.toContain("network down");
    mock.uninstall();
  });

  it("preserves a null result", async () => {
    const mock = installMockModelContext();
    registerTool(descriptor({ execute: () => null }), new AbortController().signal);
    await expect(mock.call("press-go")).resolves.toBeNull();
    mock.uninstall();
  });

  it("rejects invalid input before calling the tool", async () => {
    const mock = installMockModelContext();
    const execute = vi.fn(() => "ran");
    registerTool(
      descriptor({
        execute,
        inputSchema: {
          type: "object",
          properties: { region: { type: "string" } },
          required: ["region"],
        },
      }),
      new AbortController().signal,
    );
    await expect(mock.call("press-go", {})).resolves.toContain("Missing required");
    expect(execute).not.toHaveBeenCalled();
    mock.uninstall();
  });

  it("passes an abort signal to the tool", async () => {
    const mock = installMockModelContext();
    let seen: AbortSignal | undefined;
    registerTool(
      descriptor({
        execute: (_inputs, context) => {
          seen = context.signal;
          return "ok";
        },
      }),
      new AbortController().signal,
    );
    await mock.call("press-go");
    expect(seen).toBeInstanceOf(AbortSignal);
    mock.uninstall();
  });
});

describe("validateInputs", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: {
      region: { type: "string" },
      page: { type: "integer" },
      mode: { type: "string", enum: ["short", "full"] },
    },
    required: ["region"],
  };

  it("accepts valid input", () => {
    expect(validateInputs(schema, { region: "main", page: 2 })).toBeNull();
  });

  it("names the missing parameter and lists the known ones", () => {
    const error = validateInputs(schema, {});
    expect(error).toContain('Missing required parameter "region"');
    expect(error).toContain("region, page, mode");
  });

  it("rejects an unknown parameter", () => {
    expect(validateInputs(schema, { region: "main", nope: 1 })).toContain(
      'Unknown parameter "nope"',
    );
  });

  it("rejects a wrong type and names what it wanted", () => {
    expect(validateInputs(schema, { region: 4 })).toBe(
      'Parameter "region" must be a string, received number.',
    );
  });

  it("rejects a value outside an enum", () => {
    expect(validateInputs(schema, { region: "main", mode: "loud" })).toContain(
      "short, full",
    );
  });
});
