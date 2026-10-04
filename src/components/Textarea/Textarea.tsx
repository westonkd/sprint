import {
  type ComponentPropsWithRef,
  type Ref,
  type TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
} from "react";
import { AgentFieldControl, AgentLine } from "@/agent/view/AgentText.tsx";
import { useAgentControls, useAgentFormat, useSprintView } from "@/agent/view/mode.ts";
import type { AgentPart } from "@/agent/view/node.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { afterCommit } from "@/agent/webmcp/afterCommit.ts";
import { setFieldValue } from "@/agent/webmcp/drive.ts";
import { commitSync } from "@/agent/webmcp/flush.ts";
import { useAgentTool } from "@/agent/webmcp/useAgentTool.ts";
import { assignRef } from "../refs.ts";
import { textareaMeta } from "./meta.ts";
import { FILL_TEXTAREA_TOOL } from "./tool.ts";
import "./Textarea.css";

export type TextareaFieldProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  | "id"
  | "rows"
  | "value"
  | "defaultValue"
  | "onChange"
  | "placeholder"
  | "name"
  | "disabled"
  | "required"
  | "aria-invalid"
  | "aria-describedby"
>;

function fitContent(field: HTMLTextAreaElement): void {
  field.style.setProperty("height", "auto");
  const edges = field.offsetHeight - field.clientHeight;
  field.style.setProperty("height", `${field.scrollHeight + edges}px`);
}

export interface TextareaProps extends Omit<ComponentPropsWithRef<"div">, "onChange"> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
  error?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  autoGrow?: boolean;
  hideLabel?: boolean;
  inputRef?: Ref<HTMLTextAreaElement>;
  inputProps?: TextareaFieldProps;
  agentName?: string;
  agentTool?: boolean;
}

function messagePart(error: string | undefined, hint: string | undefined): AgentPart[] {
  if (error !== undefined) return [{ part: "error", label: error, state: {} }];
  if (hint !== undefined) return [{ part: "hint", label: hint, state: {} }];
  return [];
}

export function Textarea(props: TextareaProps) {
  const {
    label,
    value,
    onChange,
    rows = 4,
    placeholder,
    hint,
    error,
    name,
    disabled = false,
    required = false,
    autoGrow = false,
    hideLabel = false,
    inputRef,
    inputProps,
    agentName,
    agentTool = true,
    ...rest
  } = props;

  const view = useSprintView();
  const controls = useAgentControls();
  const formatter = useAgentFormat();
  const id = useId();

  const element = useRef<HTMLTextAreaElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: textareaMeta.name }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the height is measured from the rendered value, so a new value has to re-run the fit
  useLayoutEffect(() => {
    const field = element.current;
    if (!autoGrow || view === "agent" || field === null) return;
    fitContent(field);
  }, [autoGrow, value, view]);

  useLayoutEffect(() => {
    const field = element.current;
    if (autoGrow || field === null) return;
    field.style.removeProperty("height");
  }, [autoGrow]);

  const execute = useCallback(async (inputs: Record<string, unknown>) => {
    const next = inputs.value;
    if (typeof next !== "string") {
      return 'Pass "value" as a string holding the full text the area should contain.';
    }

    const target = element.current;
    if (target !== null) setFieldValue(target, next);
    else commitSync(() => onChangeRef.current(next));

    await afterCommit();
    if (!mounted.current) return "The change removed this area from the page.";
    return `Filled. The area is now:\n${formatRef.current([nodeRef.current])}`;
  }, []);

  const toolName = useAgentTool({
    spec: FILL_TEXTAREA_TOOL,
    label: agentName ?? label,
    enabled: agentTool && !disabled,
    execute,
  });

  const node = buildAgentNode({
    component: textareaMeta.name,
    label,
    tool: toolName,
    state: {
      ...(value === "" ? {} : { value }),
      empty: value === "",
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
      <AgentFieldControl
        node={node}
        value={value}
        multiline
        onValueChange={onChange}
        ref={(target: HTMLTextAreaElement | null) => {
          element.current = target;
          assignRef(inputRef, target);
        }}
      />
    );
  }

  const messageId =
    error !== undefined ? `${id}-error` : hint !== undefined ? `${id}-hint` : undefined;

  return (
    <div {...rest} {...agentAttributesFor(node)}>
      <label htmlFor={id} {...(hideLabel ? { "data-sprint-visually-hidden": "" } : {})}>
        {label}
      </label>
      <textarea
        {...inputProps}
        id={id}
        {...agentPartAttributesFor({ part: "input", state: {} })}
        ref={(target) => {
          element.current = target;
          assignRef(inputRef, target);
        }}
        rows={rows}
        value={value}
        placeholder={placeholder}
        name={name}
        disabled={disabled}
        required={required}
        aria-invalid={error !== undefined || undefined}
        aria-describedby={messageId}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
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
