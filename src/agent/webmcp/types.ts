export type JsonSchemaType = "string" | "number" | "integer" | "boolean";

export interface JsonSchemaProperty {
  type: JsonSchemaType;
  description?: string;
  enum?: readonly string[];
  minimum?: number;
  default?: string | number | boolean;
}

export interface JsonSchemaObject {
  type: "object";
  properties: Record<string, JsonSchemaProperty>;
  required?: readonly string[];
}

export interface ToolAnnotations {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
}

export interface ToolExecuteContext {
  signal: AbortSignal;
}

export interface ToolDescriptor {
  name: string;
  description: string;
  inputSchema: JsonSchemaObject;
  execute: (
    inputs: Record<string, unknown>,
    context: ToolExecuteContext,
  ) => Promise<string | null> | string | null;
  annotations?: ToolAnnotations;
}

export interface RegisterToolOptions {
  signal?: AbortSignal;
  exposedTo?: readonly string[];
}

export interface ModelContext {
  registerTool: (
    descriptor: ToolDescriptor,
    options?: RegisterToolOptions,
  ) => Promise<void> | void;
  getTools?: (options?: {
    fromOrigins?: readonly string[];
  }) => Promise<readonly ToolDescriptor[]>;
  executeTool?: (
    tool: ToolDescriptor,
    inputJson: string,
    options?: { signal?: AbortSignal },
  ) => Promise<string | null>;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
}
