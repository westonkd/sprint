import {
  type ComponentPropsWithRef,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
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
import { segmentedControlMeta } from "./meta.ts";
import { SELECT_TOOL } from "./tool.ts";
import "./SegmentedControl.css";

export interface SegmentedOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps
  extends Omit<ComponentPropsWithRef<"div">, "onChange"> {
  label: string;
  options: readonly SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  agentName?: string;
  agentTool?: boolean;
}

function optionSchema(options: readonly SegmentedOption[]): JsonSchemaObject {
  const option = SELECT_TOOL.inputSchema.properties.option;
  return {
    ...SELECT_TOOL.inputSchema,
    properties: {
      ...SELECT_TOOL.inputSchema.properties,
      ...(option === undefined
        ? {}
        : { option: { ...option, enum: options.map((entry) => entry.label) } }),
    },
  };
}

export function SegmentedControl(props: SegmentedControlProps) {
  const {
    label,
    options,
    value,
    onChange,
    disabled = false,
    agentName,
    agentTool = true,
    ...rest
  } = props;

  const view = useSprintView();
  const controls = useAgentControls();
  const formatter = useAgentFormat();

  const elements = useRef(new Map<string, HTMLButtonElement>());
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: segmentedControlMeta.name }));
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
      const requested = typeof inputs.option === "string" ? inputs.option.trim() : "";
      const available = optionsRef.current;
      const match = available.find(
        (entry) =>
          entry.label.toLowerCase() === requested.toLowerCase() ||
          entry.value.toLowerCase() === requested.toLowerCase(),
      );

      if (match === undefined) {
        return `No option named "${requested}". This control offers: ${available
          .map((entry) => `"${entry.label}"`)
          .join(", ")}.`;
      }

      select(match.value);
      await afterCommit();
      if (!mounted.current) return "The selection removed this control from the page.";
      return `Selected. The control is now:\n${formatRef.current([nodeRef.current])}`;
    },
    [select],
  );

  const schema = useMemo(() => optionSchema(options), [options]);

  const toolName = useAgentTool({
    spec: SELECT_TOOL,
    label: agentName ?? label,
    inputSchema: schema,
    enabled: agentTool && !disabled,
    execute,
  });

  const parts: AgentPart[] = options.map((option) => ({
    part: "option",
    label: option.label,
    state: {
      ...(option.value === value ? { checked: true as const } : {}),
      ...(disabled ? { disabled: true as const } : {}),
    },
  }));

  const node = buildAgentNode({
    component: segmentedControlMeta.name,
    label,
    tool: toolName,
    state: { value, disabled },
    parts,
  });
  nodeRef.current = node;

  const move = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key) || disabled) return;

    const current = options.findIndex((option) => option.value === value);
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? options.length - 1
          : (current + step + options.length) % options.length;

    const target = options[next];
    if (target === undefined) return;

    event.preventDefault();
    elements.current.get(target.value)?.focus();
    select(target.value);
  };

  if (view === "agent") {
    if (disabled || controls === "never") return <AgentLine node={node} />;
    return (
      <AgentControlGroup
        node={node}
        onActivate={(_part, index) => {
          const target = options[index];
          if (target !== undefined) select(target.value);
        }}
      />
    );
  }

  return (
    <div
      {...rest}
      {...agentAttributesFor(node)}
      role="radiogroup"
      aria-label={label}
      onKeyDown={move}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        const active = options.some((entry) => entry.value === value)
          ? selected
          : index === 0;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={active ? 0 : -1}
            disabled={disabled}
            ref={(element) => {
              if (element === null) elements.current.delete(option.value);
              else elements.current.set(option.value, element);
            }}
            {...agentPartAttributesFor(parts[index] ?? { part: "option", state: {} })}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
