import { useEffect, useRef, useState } from "react";
import type { AgentToolSpec } from "../types.ts";
import { registerTool } from "./adapter.ts";
import {
  claimToolName,
  holdsToolName,
  toolName,
  toolNameHolderCount,
  useAgentScope,
} from "./scope.ts";
import type { ToolExecuteContext } from "./types.ts";

export interface UseAgentToolOptions {
  spec: AgentToolSpec;
  label: string | undefined;
  nameOverride?: string | undefined;
  enabled?: boolean;
  execute: (
    inputs: Record<string, unknown>,
    context: ToolExecuteContext,
  ) => Promise<string | null> | string | null;
}

export function useAgentTool(options: UseAgentToolOptions): string | undefined {
  const { spec, label, nameOverride, enabled = true, execute } = options;
  const scope = useAgentScope();

  const holderRef = useRef<symbol | null>(null);
  if (holderRef.current === null) holderRef.current = Symbol("sprint-tool");

  const executeRef = useRef(execute);
  useEffect(() => {
    executeRef.current = execute;
  });

  const resolved =
    nameOverride === undefined
      ? label === undefined
        ? null
        : toolName(scope, spec.verb, label)
      : toolName(scope, spec.verb, nameOverride);

  const [held, setHeld] = useState(false);

  useEffect(() => {
    const holder = holderRef.current;
    if (resolved === null || !enabled || holder === null) {
      setHeld(false);
      return;
    }

    const release = claimToolName(resolved, holder, () => {
      setHeld(holdsToolName(resolved, holder));
    });

    if (toolNameHolderCount(resolved) > 1) {
      console.warn(
        `Sprint tool name "${resolved}" is claimed by more than one component. None of them will register a tool. Set agentName on all but one, or label them distinctly.`,
      );
    }

    setHeld(holdsToolName(resolved, holder));

    return () => {
      release();
      setHeld(false);
    };
  }, [resolved, enabled]);

  useEffect(() => {
    if (!held || resolved === null) return;

    const controller = new AbortController();
    registerTool(
      {
        name: resolved,
        description: spec.description,
        inputSchema: spec.inputSchema,
        annotations: {
          readOnlyHint: spec.readOnly,
          untrustedContentHint: spec.untrustedContent,
        },
        execute: (inputs, context) => executeRef.current(inputs, context),
      },
      controller.signal,
    );

    return () => {
      controller.abort();
    };
  }, [held, resolved, spec]);

  return held && resolved !== null ? resolved : undefined;
}
