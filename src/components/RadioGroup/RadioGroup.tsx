import {
  type ComponentPropsWithRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react";
import { AgentControlGroup, AgentLine } from "@/agent/view/AgentText.tsx";
import { useAgentControls, useAgentFormat, useSprintView } from "@/agent/view/mode.ts";
import type { AgentPart } from "@/agent/view/node.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { afterCommit } from "@/agent/webmcp/afterCommit.ts";
import { commitSync } from "@/agent/webmcp/flush.ts";
import type { JsonSchemaObject } from "@/agent/webmcp/types.ts";
import { useAgentTool } from "@/agent/webmcp/useAgentTool.ts";
import { radioGroupMeta } from "./meta.ts";
import { SELECT_RADIO_TOOL } from "./tool.ts";
import "./RadioGroup.css";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps
  extends Omit<ComponentPropsWithRef<"fieldset">, "onChange"> {
  label: string;
  options: readonly RadioOption[];
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  agentName?: string;
  agentTool?: boolean;
}

function optionSchema(labels: readonly string[]): JsonSchemaObject {
  const option = SELECT_RADIO_TOOL.inputSchema.properties.option;
  return {
    ...SELECT_RADIO_TOOL.inputSchema,
    properties: {
      ...SELECT_RADIO_TOOL.inputSchema.properties,
      ...(option === undefined ? {} : { option: { ...option, enum: [...labels] } }),
    },
  };
}

function messagePart(error: string | undefined, hint: string | undefined): AgentPart[] {
  if (error !== undefined) return [{ part: "error", label: error, state: {} }];
  if (hint !== undefined) return [{ part: "hint", label: hint, state: {} }];
  return [];
}

export function RadioGroup(props: RadioGroupProps) {
  const {
    label,
    options,
    value,
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
  const groupName = name ?? id;

  const elements = useRef(new Map<string, HTMLInputElement>());
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: radioGroupMeta.name }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const select = useCallback((next: string) => {
    const element = elements.current.get(next);
    if (element !== undefined) {
      element.click();
      return;
    }
    commitSync(() => onChangeRef.current(next));
  }, []);

  const execute = useCallback(
    async (inputs: Record<string, unknown>) => {
      const requested = typeof inputs.option === "string" ? inputs.option : "";
      const available = optionsRef.current;
      const match = available.find((option) => option.label === requested);
      if (match === undefined || match.disabled === true) {
        return `No option named "${requested}" can be selected. This group offers: ${available
          .filter((option) => option.disabled !== true)
          .map((option) => `"${option.label}"`)
          .join(", ")}.`;
      }
      select(match.value);
      await afterCommit();
      if (!mounted.current) return "The selection removed this group from the page.";
      return `Selected. The group is now:\n${formatRef.current([nodeRef.current])}`;
    },
    [select],
  );

  const labels = useMemo(
    () =>
      options
        .filter((option) => option.disabled !== true)
        .map((option) => option.label),
    [options],
  );
  const schema = useMemo(() => optionSchema(labels), [labels]);

  const toolName = useAgentTool({
    spec: SELECT_RADIO_TOOL,
    label: agentName ?? label,
    inputSchema: schema,
    enabled: agentTool && !disabled && labels.length > 0,
    execute,
  });

  const optionParts: AgentPart[] = options.map((option) => ({
    part: "option",
    label: option.label,
    state: {
      ...(option.value === value ? { checked: true as const } : {}),
      ...(option.description === undefined ? {} : { description: option.description }),
      ...(disabled || option.disabled === true ? { disabled: true as const } : {}),
    },
  }));

  const chosen = options.find((option) => option.value === value);

  const node = buildAgentNode({
    component: radioGroupMeta.name,
    label,
    tool: toolName,
    state: {
      value: chosen?.label,
      empty: chosen === undefined,
      disabled,
      required,
      invalid: error !== undefined,
    },
    parts: [...optionParts, ...messagePart(error, hint)],
  });
  nodeRef.current = node;

  if (view === "agent") {
    if (disabled || controls === "never") return <AgentLine node={node} />;
    return (
      <AgentControlGroup
        node={node}
        isActionable={(part) => part.part === "option" && part.state.disabled !== true}
        onActivate={(_part, index) => {
          const target = options[index];
          if (target !== undefined) select(target.value);
        }}
      />
    );
  }

  const messageId =
    error !== undefined ? `${id}-error` : hint !== undefined ? `${id}-hint` : undefined;

  return (
    <fieldset
      {...rest}
      {...agentAttributesFor(node)}
      disabled={disabled}
      aria-describedby={messageId}
      aria-invalid={error !== undefined || undefined}
      aria-required={required || undefined}
    >
      <legend>{label}</legend>
      {options.map((option, index) => {
        const inputId = `${id}-${index}`;
        const descriptionId = `${inputId}-description`;
        const labelId = `${inputId}-label`;
        return (
          <label key={option.value} htmlFor={inputId}>
            <input
              id={inputId}
              type="radio"
              name={groupName}
              value={option.value}
              checked={option.value === value}
              disabled={option.disabled === true}
              required={required}
              aria-labelledby={labelId}
              aria-describedby={
                option.description === undefined ? undefined : descriptionId
              }
              ref={(element) => {
                if (element === null) elements.current.delete(option.value);
                else elements.current.set(option.value, element);
              }}
              onChange={() => onChange(option.value)}
            />
            <span aria-hidden="true" />
            <span>
              <span
                id={labelId}
                {...agentPartAttributesFor(
                  optionParts[index] ?? { part: "option", state: {} },
                )}
              >
                {option.label}
              </span>
              {option.description === undefined ? null : (
                <span id={descriptionId}>{option.description}</span>
              )}
            </span>
          </label>
        );
      })}
      {error !== undefined ? (
        <p id={messageId} {...agentPartAttributesFor({ part: "error", state: {} })}>
          {error}
        </p>
      ) : hint !== undefined ? (
        <p id={messageId} {...agentPartAttributesFor({ part: "hint", state: {} })}>
          {hint}
        </p>
      ) : null}
    </fieldset>
  );
}
