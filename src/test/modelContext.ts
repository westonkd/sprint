import type {
  ModelContext,
  RegisterToolOptions,
  ToolDescriptor,
} from "@/agent/webmcp/types.ts";

export interface MockTool {
  descriptor: ToolDescriptor;
  signal: AbortSignal | undefined;
  exposedTo: readonly string[] | undefined;
  active: boolean;
}

export interface MockModelContext {
  tools: () => MockTool[];
  history: MockTool[];
  names: () => string[];
  find: (name: string) => MockTool | undefined;
  call: (name: string, inputs?: Record<string, unknown>) => Promise<string | null>;
  uninstall: () => void;
}

export function installMockModelContext(): MockModelContext {
  const history: MockTool[] = [];

  const context: ModelContext = {
    registerTool(descriptor: ToolDescriptor, options?: RegisterToolOptions) {
      const entry: MockTool = {
        descriptor,
        signal: options?.signal,
        exposedTo: options?.exposedTo,
        active: true,
      };
      history.push(entry);
      options?.signal?.addEventListener("abort", () => {
        entry.active = false;
      });
    },
  };

  Object.defineProperty(document, "modelContext", {
    configurable: true,
    writable: true,
    value: context,
  });

  const tools = (): MockTool[] => history.filter((entry) => entry.active);

  const find = (name: string): MockTool | undefined =>
    tools().find((entry) => entry.descriptor.name === name);

  const mock: MockModelContext = {
    tools,
    history,
    names: () => tools().map((entry) => entry.descriptor.name),
    find,
    async call(name, inputs = {}) {
      const entry = find(name);
      if (entry === undefined) {
        throw new Error(
          `No active tool named "${name}". Active tools: ${mock.names().join(", ") || "none"}`,
        );
      }
      const controller = new AbortController();
      return await entry.descriptor.execute(inputs, { signal: controller.signal });
    },
    uninstall() {
      history.length = 0;
      Reflect.deleteProperty(document, "modelContext");
    },
  };

  return mock;
}
