import { clamp } from "../view/truncate.ts";
import type {
  JsonSchemaObject,
  ModelContext,
  ToolDescriptor,
  ToolExecuteContext,
} from "./types.ts";

export const TOOL_OUTPUT_LIMIT = 1500;
export const TOOL_DESCRIPTION_LIMIT = 500;
export const PARAM_DESCRIPTION_LIMIT = 150;

export function getModelContext(): ModelContext | null {
  if (typeof document === "undefined") return null;
  return document.modelContext ?? null;
}

export function isModelContextAvailable(): boolean {
  return getModelContext() !== null;
}

function assertDescriptorLimits(descriptor: ToolDescriptor): void {
  if (descriptor.description.length > TOOL_DESCRIPTION_LIMIT) {
    throw new Error(
      `Tool "${descriptor.name}" description is ${descriptor.description.length} characters; the platform limit is ${TOOL_DESCRIPTION_LIMIT}.`,
    );
  }

  for (const [key, property] of Object.entries(descriptor.inputSchema.properties)) {
    const description = property.description ?? "";
    if (description.length > PARAM_DESCRIPTION_LIMIT) {
      throw new Error(
        `Tool "${descriptor.name}" parameter "${key}" description is ${description.length} characters; the platform limit is ${PARAM_DESCRIPTION_LIMIT}.`,
      );
    }
  }
}

export function validateInputs(
  schema: JsonSchemaObject,
  inputs: Record<string, unknown>,
): string | null {
  for (const key of schema.required ?? []) {
    if (inputs[key] === undefined) {
      const known = Object.keys(schema.properties).join(", ");
      return `Missing required parameter "${key}". Expected parameters: ${known || "none"}.`;
    }
  }

  for (const [key, value] of Object.entries(inputs)) {
    if (value === undefined) continue;
    const property = schema.properties[key];
    if (property === undefined) {
      const known = Object.keys(schema.properties).join(", ");
      return `Unknown parameter "${key}". Expected parameters: ${known || "none"}.`;
    }

    const actual = typeof value;
    const wantsNumber = property.type === "number" || property.type === "integer";
    const matches =
      (property.type === "string" && actual === "string") ||
      (wantsNumber && actual === "number") ||
      (property.type === "boolean" && actual === "boolean");

    if (!matches) {
      return `Parameter "${key}" must be a ${property.type}, received ${actual}.`;
    }

    if (property.enum !== undefined && !property.enum.includes(String(value))) {
      return `Parameter "${key}" must be one of: ${property.enum.join(", ")}.`;
    }
  }

  return null;
}

function harden(descriptor: ToolDescriptor): ToolDescriptor {
  const execute = async (
    inputs: Record<string, unknown>,
    context: ToolExecuteContext,
  ): Promise<string | null> => {
    const invalid = validateInputs(descriptor.inputSchema, inputs ?? {});
    if (invalid !== null) return invalid;

    try {
      const result = await descriptor.execute(inputs ?? {}, context);
      return result === null ? null : clamp(result, TOOL_OUTPUT_LIMIT);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      return clamp(`Tool "${descriptor.name}" failed: ${reason}`, TOOL_OUTPUT_LIMIT);
    }
  };

  return { ...descriptor, execute };
}

export function registerTool(descriptor: ToolDescriptor, signal: AbortSignal): boolean {
  assertDescriptorLimits(descriptor);

  const context = getModelContext();
  if (context === null) return false;
  if (signal.aborted) return false;

  const result = context.registerTool(harden(descriptor), { signal });
  if (result instanceof Promise) {
    result.catch((error: unknown) => {
      console.warn(`Sprint could not register tool "${descriptor.name}"`, error);
    });
  }

  return true;
}
