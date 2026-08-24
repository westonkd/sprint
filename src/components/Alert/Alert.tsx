import { type ComponentPropsWithRef, useCallback, useEffect, useRef } from "react";
import { AgentControlGroup, AgentLine } from "@/agent/view/AgentText.tsx";
import { useAgentControls, useAgentFormat, useSprintView } from "@/agent/view/mode.ts";
import type { AgentPart } from "@/agent/view/node.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { reactText } from "@/agent/view/text.ts";
import { afterCommit } from "@/agent/webmcp/afterCommit.ts";
import { commitSync } from "@/agent/webmcp/flush.ts";
import { useAgentTool } from "@/agent/webmcp/useAgentTool.ts";
import { alertMeta } from "./meta.ts";
import { DISMISS_ALERT_TOOL } from "./tool.ts";
import "./Alert.css";

export type AlertTone = "neutral" | "info" | "warning" | "danger";

export interface AlertProps extends ComponentPropsWithRef<"div"> {
  tone?: AlertTone;
  label?: string;
  onDismiss?: () => void;
  agentName?: string;
  agentTool?: boolean;
}

export function Alert(props: AlertProps) {
  const {
    tone = "info",
    label,
    onDismiss,
    agentName,
    agentTool = true,
    children,
    ...rest
  } = props;

  const view = useSprintView();
  const controls = useAgentControls();
  const formatter = useAgentFormat();

  const element = useRef<HTMLButtonElement | null>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: alertMeta.name }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const dismissible = onDismiss !== undefined;

  const execute = useCallback(async () => {
    const target = element.current;
    if (target !== null) {
      target.click();
    } else {
      const handler = onDismissRef.current;
      if (handler === undefined) return "This alert cannot be dismissed.";
      commitSync(() => handler());
    }

    await afterCommit();
    if (!mounted.current) return "Dismissed. The alert is gone from the page.";
    return `Dismissed. The alert is now:\n${formatRef.current([nodeRef.current])}`;
  }, []);

  const toolName = useAgentTool({
    spec: DISMISS_ALERT_TOOL,
    label: agentName ?? label,
    enabled: agentTool && dismissible,
    execute,
  });

  const message = reactText(children);

  const parts: AgentPart[] = [];
  if (message !== undefined) {
    parts.push({ part: "message", label: message, state: {} });
  }
  if (dismissible) {
    parts.push({
      part: "dismiss",
      label: "Dismiss",
      state: {},
      ...(toolName === undefined ? {} : { tool: toolName }),
    });
  }

  const node = buildAgentNode({
    component: alertMeta.name,
    label,
    state: { tone, dismissible },
    parts,
  });
  nodeRef.current = node;

  if (view === "agent") {
    if (!dismissible || controls === "never") return <AgentLine node={node} />;
    return (
      <AgentControlGroup
        node={node}
        isActionable={(part) => part.part === "dismiss"}
        onActivate={() => onDismiss?.()}
      />
    );
  }

  const role = tone === "danger" || tone === "warning" ? "alert" : "status";

  return (
    <div
      {...rest}
      {...agentAttributesFor(node)}
      role={role}
      {...(label === undefined ? {} : { "aria-label": label })}
    >
      {label === undefined ? null : (
        <strong {...agentPartAttributesFor({ part: "title", state: {} })}>
          {label}
        </strong>
      )}
      <div {...agentPartAttributesFor({ part: "message", state: {} })}>{children}</div>
      {dismissible ? (
        <button
          {...agentPartAttributesFor({
            part: "dismiss",
            state: {},
            ...(toolName === undefined ? {} : { tool: toolName }),
          })}
          type="button"
          aria-label="Dismiss"
          ref={element}
          onClick={() => onDismiss?.()}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
