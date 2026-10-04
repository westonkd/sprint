import { type ComponentPropsWithRef, useCallback, useEffect, useRef } from "react";
import { AgentControlGroup, AgentLine } from "@/agent/view/AgentText.tsx";
import { useAgentControls, useSprintView } from "@/agent/view/mode.ts";
import type { AgentPart } from "@/agent/view/node.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { hideFloating, showFloating } from "@/floating/useFloating.ts";
import { Button } from "../Button/Button.tsx";
import { Kbd } from "../Kbd/Kbd.tsx";
import { toastMeta } from "./meta.ts";
import "./Toast.css";

export type ToastTone = "neutral" | "info" | "warning" | "danger";

export interface ToastAction {
  label: string;
  onSelect: () => void;
  shortcut?: string;
}

export interface ToastProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  open: boolean;
  message: string;
  onDismiss: () => void;
  label?: string;
  tone?: ToastTone;
  action?: ToastAction;
  duration?: number | null;
  dismissLabel?: string;
}

const DEFAULT_DURATION_MS = 6000;

export function Toast(props: ToastProps) {
  const {
    open,
    message,
    onDismiss,
    label,
    tone = "neutral",
    action,
    duration = DEFAULT_DURATION_MS,
    dismissLabel = "Dismiss",
    ...rest
  } = props;

  const view = useSprintView();
  const controls = useAgentControls();
  const element = useRef<HTMLDivElement | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const stop = useCallback(() => {
    if (timer.current !== undefined) window.clearTimeout(timer.current);
    timer.current = undefined;
  }, []);

  const start = useCallback(() => {
    stop();
    if (!open || duration === null) return;
    timer.current = window.setTimeout(() => onDismissRef.current(), duration);
  }, [open, duration, stop]);

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  useEffect(() => {
    const target = element.current;
    if (target === null || view === "agent") return;
    if (open) showFloating(target);
    else hideFloating(target);
  }, [open, view]);

  if (!open) return null;

  const parts: AgentPart[] = [
    { part: "message", label: message, state: {} },
    { part: "dismiss", label: dismissLabel, state: {} },
  ];

  const node = buildAgentNode({
    component: toastMeta.name,
    label,
    state: { tone },
    parts,
  });

  const actionButton =
    action === undefined ? null : (
      <Button
        size="small"
        tone={tone === "danger" ? "danger" : "action"}
        onClick={() => {
          stop();
          action.onSelect();
        }}
        aria-keyshortcuts={action.shortcut}
      >
        {action.label}
      </Button>
    );

  if (view === "agent") {
    if (controls === "never") {
      return (
        <>
          <AgentLine node={node} />
          {actionButton}
        </>
      );
    }
    return (
      <AgentControlGroup
        node={node}
        isActionable={(part) => part.part === "dismiss"}
        onActivate={() => onDismiss()}
      >
        {actionButton}
      </AgentControlGroup>
    );
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover and focus only pause the dismiss timer so a person can reach the action; nothing is activated
    <div
      {...rest}
      {...agentAttributesFor(node)}
      role={tone === "danger" ? "alert" : "status"}
      popover="manual"
      ref={element}
      onPointerEnter={stop}
      onPointerLeave={start}
      onFocus={stop}
      onBlur={start}
    >
      <div>
        {label === undefined ? null : <strong>{label}</strong>}
        <p {...agentPartAttributesFor({ part: "message", state: {} })}>{message}</p>
      </div>
      {action === undefined ? null : (
        <div>
          {actionButton}
          {action.shortcut === undefined ? null : <Kbd>{action.shortcut}</Kbd>}
        </div>
      )}
      <button
        type="button"
        aria-label={dismissLabel}
        {...agentPartAttributesFor({ part: "dismiss", state: {} })}
        onClick={() => onDismiss()}
      >
        ×
      </button>
    </div>
  );
}
