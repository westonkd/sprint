import { type ComponentPropsWithRef, useCallback, useEffect, useRef } from "react";
import { AgentControl, AgentLine } from "@/agent/view/AgentText.tsx";
import { useAgentControls, useAgentFormat, useSprintView } from "@/agent/view/mode.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { afterCommit } from "@/agent/webmcp/afterCommit.ts";
import { commitSync } from "@/agent/webmcp/flush.ts";
import { useAgentTool } from "@/agent/webmcp/useAgentTool.ts";
import { switchMeta } from "./meta.ts";
import { SET_SWITCH_TOOL } from "./tool.ts";
import "./Switch.css";

export interface SwitchProps
  extends Omit<ComponentPropsWithRef<"button">, "onChange" | "children"> {
  label: string;
  on: boolean;
  onChange: (on: boolean) => void;
  agentName?: string;
  agentTool?: boolean;
}

export function Switch(props: SwitchProps) {
  const {
    label,
    on,
    onChange,
    disabled = false,
    agentName,
    agentTool = true,
    ref,
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

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onRef = useRef(on);
  onRef.current = on;
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: switchMeta.name }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const execute = useCallback(async (inputs: Record<string, unknown>) => {
    const desired = inputs.on;
    if (typeof desired !== "boolean") {
      return 'Pass "on" as true or false; it states the end state.';
    }

    const already = desired === onRef.current;
    if (!already) {
      const target = element.current;
      if (target !== null) target.click();
      else commitSync(() => onChangeRef.current(desired));
    }

    await afterCommit();
    if (!mounted.current) return "The change removed this switch from the page.";
    const outcome = already
      ? `Already ${desired ? "on" : "off"}`
      : `Switched ${desired ? "on" : "off"}`;
    return `${outcome}. The switch is now:\n${formatRef.current([nodeRef.current])}`;
  }, []);

  const toolName = useAgentTool({
    spec: SET_SWITCH_TOOL,
    label: agentName ?? label,
    enabled: agentTool && !disabled,
    execute,
  });

  const node = buildAgentNode({
    component: switchMeta.name,
    label,
    tool: toolName,
    state: { on, disabled },
  });
  nodeRef.current = node;

  if (view === "agent") {
    if (disabled || controls === "never") return <AgentLine node={node} />;
    return <AgentControl node={node} ref={setRef} onClick={() => onChange(!on)} />;
  }

  return (
    <button
      {...rest}
      {...agentAttributesFor(node)}
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      ref={setRef}
      onClick={() => onChange(!on)}
    >
      <span
        {...agentPartAttributesFor({ part: "track", state: {} })}
        aria-hidden="true"
      >
        <span {...agentPartAttributesFor({ part: "thumb", state: {} })} />
      </span>
      {label}
    </button>
  );
}
