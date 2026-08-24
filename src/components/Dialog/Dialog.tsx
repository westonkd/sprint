import {
  type ComponentPropsWithRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { AgentControlGroup } from "@/agent/view/AgentText.tsx";
import { useAgentControls, useSprintView } from "@/agent/view/mode.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { afterCommit } from "@/agent/webmcp/afterCommit.ts";
import { commitSync } from "@/agent/webmcp/flush.ts";
import { AgentScopeProvider, useAgentScope } from "@/agent/webmcp/scope.ts";
import { useAgentTool } from "@/agent/webmcp/useAgentTool.ts";
import { dialogMeta } from "./meta.ts";
import { CLOSE_DIALOG_TOOL } from "./tool.ts";
import "./Dialog.css";

export type DialogHeadingLevel = 2 | 3 | 4;

export interface DialogProps
  extends Omit<ComponentPropsWithRef<"dialog">, "onClose" | "open"> {
  label: string;
  open: boolean;
  onClose: () => void;
  headingLevel?: DialogHeadingLevel;
  owner?: string;
  agentName?: string;
  agentTool?: boolean;
}

export function Dialog(props: DialogProps) {
  const {
    label,
    open,
    onClose,
    headingLevel,
    owner,
    agentName,
    agentTool = true,
    children,
    ref,
    ...rest
  } = props;

  const view = useSprintView();
  const controls = useAgentControls();
  const parentScope = useAgentScope();

  const element = useRef<HTMLDialogElement | null>(null);
  const closeElement = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const openRef = useRef(open);
  openRef.current = open;

  const setRef = useCallback(
    (target: HTMLDialogElement | null) => {
      element.current = target;
      if (typeof ref === "function") ref(target);
      else if (ref !== null && ref !== undefined) ref.current = target;
    },
    [ref],
  );

  useEffect(() => {
    if (!open) return;
    const target = element.current;
    if (target === null) return;
    if (!target.open) {
      if (typeof target.showModal === "function") target.showModal();
      else target.open = true;
    }
    return () => {
      if (!target.open) return;
      if (typeof target.close === "function") target.close();
      else target.open = false;
    };
  }, [open]);

  const execute = useCallback(async () => {
    const target = closeElement.current;
    if (target !== null) target.click();
    else commitSync(() => onCloseRef.current());

    await afterCommit();
    if (openRef.current) return "The page kept the dialog open.";
    return "Closed. The dialog is gone from the page.";
  }, []);

  const toolName = useAgentTool({
    spec: CLOSE_DIALOG_TOOL,
    label: agentName ?? label,
    enabled: agentTool && open,
    execute,
  });

  const scopeValue = useMemo(
    () => ({ path: [...parentScope, label] }),
    [parentScope, label],
  );

  if (!open) return null;

  const node = buildAgentNode({
    component: dialogMeta.name,
    label,
    owner,
    state: { open: true },
    parts: [
      {
        part: "close",
        label: "Close",
        state: {},
        ...(toolName === undefined ? {} : { tool: toolName }),
      },
    ],
  });

  if (view === "agent") {
    return (
      <AgentControlGroup
        node={node}
        isActionable={() => controls !== "never"}
        onActivate={() => onClose()}
      >
        <AgentScopeProvider value={scopeValue}>{children}</AgentScopeProvider>
      </AgentControlGroup>
    );
  }

  const Label = headingLevel === undefined ? "span" : (`h${headingLevel}` as const);

  return (
    <dialog
      {...rest}
      {...agentAttributesFor(node)}
      aria-label={label}
      ref={setRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header>
        <Label>{label}</Label>
        <button
          {...agentPartAttributesFor({
            part: "close",
            state: {},
            ...(toolName === undefined ? {} : { tool: toolName }),
          })}
          type="button"
          aria-label="Close"
          ref={closeElement}
          onClick={() => onClose()}
        >
          ×
        </button>
      </header>
      <div>
        <AgentScopeProvider value={scopeValue}>{children}</AgentScopeProvider>
      </div>
    </dialog>
  );
}
