import {
  type ComponentPropsWithRef,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AgentControl, AgentLine } from "@/agent/view/AgentText.tsx";
import { useAgentControls, useAgentFormat, useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { accessibleText } from "@/agent/view/text.ts";
import { afterCommit } from "@/agent/webmcp/afterCommit.ts";
import { commitSync } from "@/agent/webmcp/flush.ts";
import { useAgentTool } from "@/agent/webmcp/useAgentTool.ts";
import { buttonMeta } from "./meta.ts";
import { PRESS_TOOL } from "./tool.ts";
import "./Button.css";

export type ButtonTone = "neutral" | "action" | "danger";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  tone?: ButtonTone;
  block?: boolean;
  loading?: boolean;
  agentName?: string;
  agentTool?: boolean;
}

function syntheticClick(): ReactMouseEvent<HTMLButtonElement> {
  const event = new MouseEvent("click", { bubbles: true, cancelable: true });
  return event as unknown as ReactMouseEvent<HTMLButtonElement>;
}

export function Button(props: ButtonProps) {
  const {
    tone = "neutral",
    block = false,
    loading = false,
    agentName,
    agentTool = true,
    disabled = false,
    type = "button",
    children,
    ref,
    onClick,
    ...rest
  } = props;

  const view = useSprintView();
  const controls = useAgentControls();
  const formatter = useAgentFormat();
  const element = useRef<HTMLButtonElement | null>(null);

  const setRef = useCallback(
    (target: HTMLButtonElement | null) => {
      element.current = target;
      if (typeof ref === "function") ref(target);
      else if (ref !== null && ref !== undefined) ref.current = target;
    },
    [ref],
  );

  const explicitLabel =
    agentName ?? (typeof children === "string" ? children : undefined);
  const [domLabel, setDomLabel] = useState<string | undefined>(undefined);

  useLayoutEffect(() => {
    if (explicitLabel !== undefined) return;
    const target = element.current;
    if (target === null) return;
    setDomLabel(accessibleText(target));
  });

  const inert = disabled || loading;
  const label = explicitLabel ?? domLabel;

  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  const nodeRef = useRef(buildAgentNode({ component: buttonMeta.name }));
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    const target = element.current;

    if (target !== null) {
      target.click();
    } else {
      const handler = onClickRef.current;
      if (handler === undefined) {
        return "This button renders no control in the current view and has no click handler.";
      }
      commitSync(() => handler(syntheticClick()));
    }

    await afterCommit();
    if (!mounted.current) return "The press removed this button from the page.";
    return `Pressed. The button is now:\n${formatRef.current([nodeRef.current])}`;
  }, []);

  const toolName = useAgentTool({
    spec: PRESS_TOOL,
    label,
    enabled: agentTool && !inert,
    execute,
  });

  const node = buildAgentNode({
    component: buttonMeta.name,
    label,
    tool: toolName,
    state: { tone, block, loading, disabled: inert },
  });
  nodeRef.current = node;

  if (view === "agent") {
    if (inert || controls === "never") return <AgentLine node={node} />;
    return (
      <AgentControl
        node={node}
        type={type}
        ref={setRef}
        onClick={onClick}
        aria-busy={loading || undefined}
      />
    );
  }

  return (
    <button
      {...rest}
      {...agentAttributesFor(node)}
      type={type}
      ref={setRef}
      onClick={onClick}
      disabled={inert}
      aria-busy={loading || undefined}
    >
      {children}
    </button>
  );
}
