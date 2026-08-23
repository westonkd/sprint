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
import { setSelectValue } from "@/agent/webmcp/drive.ts";
import { commitSync } from "@/agent/webmcp/flush.ts";
import type { JsonSchemaObject } from "@/agent/webmcp/types.ts";
import { useAgentTool } from "@/agent/webmcp/useAgentTool.ts";
import { selectMeta } from "./meta.ts";
import { SELECT_OPTION_TOOL } from "./tool.ts";
import "./Select.css";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<ComponentPropsWithRef<"div">, "onChange"> {
  label: string;
  options: readonly SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  agentName?: string;
  agentTool?: boolean;
}

function optionSchema(options: readonly SelectOption[]): JsonSchemaObject {
  const option = SELECT_OPTION_TOOL.inputSchema.properties.option;
  return {
    ...SELECT_OPTION_TOOL.inputSchema,
    properties: {
      ...SELECT_OPTION_TOOL.inputSchema.properties,
      ...(option === undefined
        ? {}
        : { option: { ...option, enum: options.map((entry) => entry.label) } }),
    },
  };
}

function messagePart(error: string | undefined, hint: string | undefined): AgentPart[] {
  if (error !== undefined) return [{ part: "error", label: error, state: {} }];
  if (hint !== undefined) return [{ part: "hint", label: hint, state: {} }];
  return [];
}

export function Select(props: SelectProps) {
  const {
    label,
    options,
    value,
    onChange,
    placeholder,
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

  const element = useRef<HTMLSelectElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: selectMeta.name }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const choose = useCallback((next: string) => {
    const target = element.current;
    if (target !== null) {
      setSelectValue(target, next);
      return;
    }
    commitSync(() => onChangeRef.current(next));
  }, []);

  const execute = useCallback(
    async (inputs: Record<string, unknown>) => {
      const requested = typeof inputs.option === "string" ? inputs.option : "";
      const available = optionsRef.current;
      const match = available.find((entry) => entry.label === requested);

      if (match === undefined) {
        return `No option named "${requested}". This dropdown offers: ${available
          .map((entry) => `"${entry.label}"`)
          .join(", ")}.`;
      }

      choose(match.value);
      await afterCommit();
      if (!mounted.current) return "The selection removed this dropdown from the page.";
      return `Selected. The dropdown is now:\n${formatRef.current([nodeRef.current])}`;
    },
    [choose],
  );

  const schema = useMemo(() => optionSchema(options), [options]);

  const toolName = useAgentTool({
    spec: SELECT_OPTION_TOOL,
    label: agentName ?? label,
    inputSchema: schema,
    enabled: agentTool && !disabled,
    execute,
  });

  const chosen = options.find((option) => option.value === value);

  const optionParts: AgentPart[] = options.map((option) => ({
    part: "option",
    label: option.label,
    state: {
      ...(option.value === value ? { checked: true as const } : {}),
      ...(disabled ? { disabled: true as const } : {}),
    },
  }));

  const node = buildAgentNode({
    component: selectMeta.name,
    label,
    tool: toolName,
    state: {
      ...(chosen === undefined ? {} : { value }),
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
        isActionable={(part) => part.part === "option"}
        onActivate={(_part, index) => {
          const target = options[index];
          if (target !== undefined) choose(target.value);
        }}
      />
    );
  }

  const messageId =
    error !== undefined ? `${id}-error` : hint !== undefined ? `${id}-hint` : undefined;

  return (
    <div {...rest} {...agentAttributesFor(node)}>
      <label htmlFor={id}>{label}</label>
      <span {...agentPartAttributesFor({ part: "control", state: {} })}>
        <select
          id={id}
          {...agentPartAttributesFor({ part: "input", state: {} })}
          ref={(target) => {
            element.current = target;
          }}
          value={chosen === undefined ? "" : value}
          name={name}
          disabled={disabled}
          required={required}
          aria-invalid={error !== undefined || undefined}
          aria-describedby={messageId}
          onChange={(event) => onChange(event.currentTarget.value)}
        >
          {chosen === undefined ? (
            <option value="" disabled>
              {placeholder ?? "Choose"}
            </option>
          ) : null}
          {options.map((option, index) => (
            <option
              key={option.value}
              value={option.value}
              {...agentPartAttributesFor(
                optionParts[index] ?? { part: "option", state: {} },
              )}
            >
              {option.label}
            </option>
          ))}
        </select>
      </span>
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
