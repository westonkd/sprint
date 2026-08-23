import {
  type ComponentPropsWithRef,
  useCallback,
  useEffect,
  useId,
  useRef,
} from "react";
import { AgentControl, AgentLine } from "@/agent/view/AgentText.tsx";
import { useAgentControls, useAgentFormat, useSprintView } from "@/agent/view/mode.ts";
import type { AgentPart } from "@/agent/view/node.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { afterCommit } from "@/agent/webmcp/afterCommit.ts";
import { commitSync } from "@/agent/webmcp/flush.ts";
import { useAgentTool } from "@/agent/webmcp/useAgentTool.ts";
import { checkboxMeta } from "./meta.ts";
import { SET_CHECKBOX_TOOL } from "./tool.ts";
import "./Checkbox.css";

export interface CheckboxProps extends Omit<ComponentPropsWithRef<"div">, "onChange"> {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
  error?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  agentName?: string;
  agentTool?: boolean;
}

function messagePart(error: string | undefined, hint: string | undefined): AgentPart[] {
  if (error !== undefined) return [{ part: "error", label: error, state: {} }];
  if (hint !== undefined) return [{ part: "hint", label: hint, state: {} }];
  return [];
}

export function Checkbox(props: CheckboxProps) {
  const {
    label,
    checked,
    onChange,
    hint,
    error,
    name,
    disabled = false,
    required = false,
    agentName,
    agentTool = true,
    ...rest
  } = props;

  const view = useSprintView();
  const controls = useAgentControls();
  const formatter = useAgentFormat();
  const id = useId();

  const element = useRef<HTMLElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const checkedRef = useRef(checked);
  checkedRef.current = checked;
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: checkboxMeta.name }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const execute = useCallback(async (inputs: Record<string, unknown>) => {
    const desired = inputs.checked;
    if (typeof desired !== "boolean") {
      return 'Pass "checked" as true or false; it states the end state.';
    }

    const already = desired === checkedRef.current;
    if (!already) {
      const target = element.current;
      if (target !== null) target.click();
      else commitSync(() => onChangeRef.current(desired));
    }

    await afterCommit();
    if (!mounted.current) return "The change removed this checkbox from the page.";
    const outcome = already
      ? `Already ${desired ? "checked" : "unchecked"}`
      : desired
        ? "Checked"
        : "Unchecked";
    return `${outcome}. The checkbox is now:\n${formatRef.current([nodeRef.current])}`;
  }, []);

  const toolName = useAgentTool({
    spec: SET_CHECKBOX_TOOL,
    label: agentName ?? label,
    enabled: agentTool && !disabled,
    execute,
  });

  const node = buildAgentNode({
    component: checkboxMeta.name,
    label,
    tool: toolName,
    state: {
      checked,
      disabled,
      required,
      invalid: error !== undefined,
    },
    parts: messagePart(error, hint),
  });
  nodeRef.current = node;

  if (view === "agent") {
    if (disabled || controls === "never") return <AgentLine node={node} />;
    return (
      <AgentControl
        node={node}
        ref={(target: HTMLButtonElement | null) => {
          element.current = target;
        }}
        onClick={() => onChange(!checked)}
      />
    );
  }

  const messageId =
    error !== undefined ? `${id}-error` : hint !== undefined ? `${id}-hint` : undefined;

  return (
    <div {...rest} {...agentAttributesFor(node)}>
      <label htmlFor={id}>
        <input
          id={id}
          {...agentPartAttributesFor({ part: "input", state: {} })}
          ref={(target) => {
            element.current = target;
          }}
          type="checkbox"
          checked={checked}
          name={name}
          disabled={disabled}
          required={required}
          aria-invalid={error !== undefined || undefined}
          aria-describedby={messageId}
          onChange={(event) => onChange(event.currentTarget.checked)}
        />
        <span
          {...agentPartAttributesFor({ part: "box", state: {} })}
          aria-hidden="true"
        />
        {label}
      </label>
      {error !== undefined ? (
        <p id={messageId} {...agentPartAttributesFor({ part: "error", state: {} })}>
          {error}
        </p>
      ) : hint !== undefined ? (
        <p id={messageId} {...agentPartAttributesFor({ part: "hint", state: {} })}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
