import {
  type ComponentPropsWithRef,
  type KeyboardEvent as ReactKeyboardEvent,
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
import { choiceGridMeta } from "./meta.ts";
import { CHOOSE_TOOL } from "./tool.ts";
import "./ChoiceGrid.css";

export interface ChoiceOption {
  value: string;
  label: string;
  glyph?: string;
}

export type ChoiceGridColumns = 2 | 3 | 4;

type ChoiceGridMode = "submit" | "select";

export interface ChoiceGridProps
  extends Omit<ComponentPropsWithRef<"fieldset">, "onChange"> {
  label: string;
  options: readonly ChoiceOption[];
  columns?: ChoiceGridColumns;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  agentName?: string;
  agentTool?: boolean;
}

const MOVE_KEYS = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];

function optionSchema(options: readonly ChoiceOption[]): JsonSchemaObject {
  const option = CHOOSE_TOOL.inputSchema.properties.option;
  return {
    ...CHOOSE_TOOL.inputSchema,
    properties: {
      ...CHOOSE_TOOL.inputSchema.properties,
      ...(option === undefined
        ? {}
        : { option: { ...option, enum: options.map((entry) => entry.label) } }),
    },
  };
}

function targetIndex(key: string, current: number, count: number): number {
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  const step = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1;
  return (current + step + count) % count;
}

function submitThrough(carrier: HTMLInputElement | null, value: string): boolean {
  const form = carrier?.form ?? null;
  if (carrier === null || form === null) return false;
  carrier.disabled = false;
  carrier.value = value;
  try {
    form.requestSubmit();
  } finally {
    carrier.disabled = true;
    carrier.value = "";
  }
  return true;
}

export function ChoiceGrid(props: ChoiceGridProps) {
  const {
    label,
    options,
    columns = 3,
    name,
    value,
    onChange,
    disabled = false,
    agentName,
    agentTool = true,
    ...rest
  } = props;

  const mode: ChoiceGridMode = onChange === undefined ? "submit" : "select";
  const view = useSprintView();
  const controls = useAgentControls();
  const formatter = useAgentFormat();
  const legendId = useId();

  const elements = useRef(new Map<string, HTMLButtonElement>());
  const carrier = useRef<HTMLInputElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: choiceGridMeta.name }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const choose = useCallback((next: string): boolean => {
    const element = elements.current.get(next);
    if (element !== undefined) {
      element.click();
      return modeRef.current === "select" || element.form !== null;
    }
    const handler = onChangeRef.current;
    if (modeRef.current === "select" && handler !== undefined) {
      commitSync(() => handler(next));
      return true;
    }
    return submitThrough(carrier.current, next);
  }, []);

  const execute = useCallback(
    async (inputs: Record<string, unknown>) => {
      const requested = typeof inputs.option === "string" ? inputs.option : "";
      const match = optionsRef.current.find((entry) => entry.label === requested);

      if (match === undefined) {
        return `No option named "${requested}". This grid offers: ${optionsRef.current
          .map((entry) => `"${entry.label}"`)
          .join(", ")}.`;
      }

      const acted = choose(match.value);
      if (!acted) {
        return `No form surrounds this grid, so choosing "${match.label}" had nothing to submit.`;
      }

      await afterCommit();
      const done =
        modeRef.current === "submit"
          ? `Chose "${match.label}" and submitted the form.`
          : `Chose "${match.label}".`;
      if (!mounted.current) return `${done} The grid is no longer on the page.`;
      return `${done} The grid is now:\n${formatRef.current([nodeRef.current])}`;
    },
    [choose],
  );

  const schema = useMemo(() => optionSchema(options), [options]);

  const toolName = useAgentTool({
    spec: CHOOSE_TOOL,
    label: agentName ?? label,
    inputSchema: schema,
    enabled: agentTool && !disabled,
    execute,
  });

  const selected = mode === "select" ? value : undefined;

  const parts: AgentPart[] = options.map((option) => ({
    part: "choice",
    label: option.label,
    state: {
      value: option.value,
      ...(option.value === selected ? { checked: true as const } : {}),
      ...(disabled ? { disabled: true as const } : {}),
    },
  }));

  const node = buildAgentNode({
    component: choiceGridMeta.name,
    label,
    tool: toolName,
    state: { mode, value: selected, columns: String(columns), disabled },
    parts,
  });
  nodeRef.current = node;

  const selectedField =
    mode === "select" && name !== undefined ? (
      <input type="hidden" name={name} value={selected ?? ""} />
    ) : null;

  if (view === "agent") {
    if (disabled || controls === "never") return <AgentLine node={node} />;
    return (
      <AgentControlGroup
        node={node}
        onActivate={(_part, index) => {
          const target = options[index];
          if (target !== undefined) choose(target.value);
        }}
      >
        {mode === "select" ? (
          selectedField
        ) : (
          <input type="hidden" name={name} disabled ref={carrier} />
        )}
      </AgentControlGroup>
    );
  }

  const move = (event: ReactKeyboardEvent<HTMLFieldSetElement>) => {
    if (!MOVE_KEYS.includes(event.key) || disabled || options.length === 0) return;
    const focused = options.findIndex(
      (option) => elements.current.get(option.value) === event.target,
    );
    if (focused === -1) return;

    const target = options[targetIndex(event.key, focused, options.length)];
    if (target === undefined) return;

    event.preventDefault();
    elements.current.get(target.value)?.focus();
    if (mode === "select") choose(target.value);
  };

  const hasSelection = options.some((option) => option.value === selected);

  return (
    <fieldset
      {...rest}
      {...agentAttributesFor(node)}
      role={mode === "select" ? "radiogroup" : undefined}
      aria-labelledby={legendId}
      disabled={disabled}
      onKeyDown={move}
    >
      <legend id={legendId}>{label}</legend>
      <div>
        {options.map((option, index) => {
          const checked = option.value === selected;
          const roving = hasSelection ? checked : index === 0;
          const radio =
            mode === "select"
              ? {
                  type: "button" as const,
                  role: "radio",
                  "aria-checked": checked,
                  tabIndex: roving ? 0 : -1,
                  onClick: () => onChange?.(option.value),
                }
              : { type: "submit" as const, name, value: option.value };
          return (
            <button
              key={option.value}
              {...radio}
              disabled={disabled}
              ref={(element) => {
                if (element === null) elements.current.delete(option.value);
                else elements.current.set(option.value, element);
              }}
              {...agentPartAttributesFor(parts[index] ?? { part: "choice", state: {} })}
            >
              {option.glyph === undefined ? null : (
                <span aria-hidden="true">{option.glyph}</span>
              )}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
      {selectedField}
    </fieldset>
  );
}
