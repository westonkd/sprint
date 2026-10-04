import {
  type ComponentPropsWithRef,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
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
import { textInputMeta } from "./meta.ts";
import { FILL_TOOL } from "./tool.ts";
import "./TextInput.css";

export type TextInputType =
  | "text"
  | "email"
  | "url"
  | "search"
  | "password"
  | "number"
  | "tel";

export type TextInputFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | "id"
  | "type"
  | "value"
  | "defaultValue"
  | "onChange"
  | "placeholder"
  | "name"
  | "autoComplete"
  | "disabled"
  | "readOnly"
  | "required"
  | "aria-invalid"
  | "aria-describedby"
>;

export interface TextInputProps extends Omit<ComponentPropsWithRef<"div">, "onChange"> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: TextInputType;
  placeholder?: string;
  hint?: string;
  error?: string;
  name?: string;
  autoComplete?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  hideLabel?: boolean;
  icon?: ReactNode;
  trailing?: ReactNode;
  inputRef?: Ref<HTMLInputElement>;
  inputProps?: TextInputFieldProps;
  agentName?: string;
  agentTool?: boolean;
}

function messagePart(error: string | undefined, hint: string | undefined): AgentPart[] {
  if (error !== undefined) return [{ part: "error", label: error, state: {} }];
  if (hint !== undefined) return [{ part: "hint", label: hint, state: {} }];
  return [];
}

export function TextInput(props: TextInputProps) {
  const {
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    hint,
    error,
    name,
    autoComplete,
    disabled = false,
    readOnly = false,
    required = false,
    hideLabel = false,
    icon,
    trailing,
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

  const element = useRef<HTMLInputElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: textInputMeta.name }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const masked = type === "password";

  const execute = useCallback(async (inputs: Record<string, unknown>) => {
    const next = inputs.value;
    if (typeof next !== "string") {
      return 'Pass "value" as a string holding the full text the field should contain.';
    }

    const target = element.current;
    if (target !== null) setFieldValue(target, next);
    else commitSync(() => onChangeRef.current(next));

    await afterCommit();
    if (!mounted.current) return "The change removed this field from the page.";
    return `Filled. The field is now:\n${formatRef.current([nodeRef.current])}`;
  }, []);

  const toolName = useAgentTool({
    spec: FILL_TOOL,
    label: agentName ?? label,
    enabled: agentTool && !disabled && !readOnly,
    execute,
  });

  const node = buildAgentNode({
    component: textInputMeta.name,
    label,
    tool: toolName,
    state: {
      ...(masked ? { filled: value !== "" } : value === "" ? {} : { value }),
      empty: value === "",
      disabled,
      readonly: readOnly,
      required,
      invalid: error !== undefined,
    },
    parts: messagePart(error, hint),
  });
  nodeRef.current = node;

  if (view === "agent") {
    if (disabled || readOnly || controls === "never") return <AgentLine node={node} />;
    return (
      <AgentFieldControl
        node={node}
        value={value}
        masked={masked}
        onValueChange={onChange}
        ref={(target: HTMLInputElement | null) => {
          element.current = target;
          assignRef(inputRef, target);
        }}
      />
    );
  }

  const messageId =
    error !== undefined ? `${id}-error` : hint !== undefined ? `${id}-hint` : undefined;

  const field = (
    <input
      {...inputProps}
      id={id}
      {...agentPartAttributesFor({ part: "input", state: {} })}
      ref={(target) => {
        element.current = target;
        assignRef(inputRef, target);
      }}
      type={type}
      value={value}
      placeholder={placeholder}
      name={name}
      autoComplete={autoComplete}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      aria-invalid={error !== undefined || undefined}
      aria-describedby={messageId}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );

  return (
    <div {...rest} {...agentAttributesFor(node)}>
      <label htmlFor={id} {...(hideLabel ? { "data-sprint-visually-hidden": "" } : {})}>
        {label}
      </label>
      {icon === undefined && trailing === undefined ? (
        field
      ) : (
        <div>
          {icon === undefined ? null : (
            <span data-sprint-icon="" aria-hidden="true">
              {icon}
            </span>
          )}
          {field}
          {trailing === undefined ? null : <span>{trailing}</span>}
        </div>
      )}
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
