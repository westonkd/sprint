import {
  type ComponentPropsWithRef,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
} from "react";
import { AgentFieldControl, AgentLine } from "@/agent/view/AgentText.tsx";
import { useAgentControls, useAgentFormat, useSprintView } from "@/agent/view/mode.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { afterCommit } from "@/agent/webmcp/afterCommit.ts";
import { setFieldValue } from "@/agent/webmcp/drive.ts";
import { commitSync } from "@/agent/webmcp/flush.ts";
import { useAgentTool } from "@/agent/webmcp/useAgentTool.ts";
import { searchFieldMeta } from "./meta.ts";
import { SEARCH_TOOL } from "./tool.ts";
import "./SearchField.css";

const EDITABLE =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

export interface SearchFieldProps
  extends Omit<ComponentPropsWithRef<"form">, "onChange" | "onSubmit"> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  hideLabel?: boolean;
  shortcut?: string | false;
  name?: string;
  disabled?: boolean;
  agentName?: string;
  agentTool?: boolean;
}

function isEditable(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(EDITABLE) !== null;
}

function useShortcut(
  key: string | undefined,
  target: { current: HTMLInputElement | null },
): void {
  useEffect(() => {
    if (key === undefined) return;
    const listener = (event: globalThis.KeyboardEvent) => {
      if (event.key !== key || event.defaultPrevented) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditable(event.target) || isEditable(document.activeElement)) return;
      const field = target.current;
      if (field === null) return;
      event.preventDefault();
      field.focus();
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [key, target]);
}

export function SearchField(props: SearchFieldProps) {
  const {
    label,
    value,
    onChange,
    onSubmit,
    placeholder,
    hideLabel = false,
    shortcut,
    name,
    disabled = false,
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
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: searchFieldMeta.name }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const key =
    shortcut === undefined || shortcut === false || shortcut === "" || disabled
      ? undefined
      : shortcut;
  useShortcut(key, element);

  const execute = useCallback(async (inputs: Record<string, unknown>) => {
    const query = inputs.query;
    if (typeof query !== "string") {
      return 'Pass "query" as a string holding the full search text.';
    }

    const target = element.current;
    if (target !== null) setFieldValue(target, query);
    else commitSync(() => onChangeRef.current(query));

    const submit = onSubmitRef.current;
    if (submit !== undefined) commitSync(() => submit(query));

    await afterCommit();
    if (!mounted.current) return "The search removed this field from the page.";
    const verb = submit === undefined ? "Filtered" : "Searched";
    return `${verb}. The field is now:\n${formatRef.current([nodeRef.current])}`;
  }, []);

  const toolName = useAgentTool({
    spec: SEARCH_TOOL,
    label: agentName ?? label,
    enabled: agentTool && !disabled,
    execute,
  });

  const empty = value === "";

  const node = buildAgentNode({
    component: searchFieldMeta.name,
    label,
    tool: toolName,
    state: {
      ...(empty ? {} : { value }),
      empty,
      shortcut: key,
      disabled,
    },
  });
  nodeRef.current = node;

  if (view === "agent") {
    if (disabled || controls === "never") return <AgentLine node={node} />;
    return (
      <AgentFieldControl
        node={node}
        value={value}
        onValueChange={onChange}
        ref={(target: HTMLInputElement | null) => {
          element.current = target;
        }}
      />
    );
  }

  const labelId = `${id}-label`;

  const clear = () => {
    onChange("");
    element.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape" || empty) return;
    event.preventDefault();
    event.stopPropagation();
    onChange("");
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: a form carrying the search role is the landmark every screen reader recognises, and the form is what makes Enter submit
    <form
      {...rest}
      {...agentAttributesFor(node)}
      role="search"
      aria-labelledby={labelId}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!disabled) onSubmit?.(value);
      }}
    >
      <label
        id={labelId}
        htmlFor={id}
        {...agentPartAttributesFor({
          part: "label",
          state: hideLabel ? { "visually-hidden": true } : {},
        })}
      >
        {label}
      </label>
      <div {...agentPartAttributesFor({ part: "control", state: {} })}>
        <input
          id={id}
          {...agentPartAttributesFor({ part: "input", state: {} })}
          ref={(target) => {
            element.current = target;
          }}
          type="search"
          value={value}
          placeholder={placeholder}
          name={name}
          disabled={disabled}
          autoComplete="off"
          aria-keyshortcuts={key}
          enterKeyHint="search"
          onChange={(event) => onChange(event.currentTarget.value)}
          onKeyDown={onKeyDown}
        />
        {empty || disabled ? null : (
          <button
            {...agentPartAttributesFor({ part: "clear", state: {} })}
            type="button"
            aria-label={`Clear ${label} search`}
            onClick={clear}
          >
            Clear
          </button>
        )}
        {key === undefined || !empty ? null : (
          <span
            {...agentPartAttributesFor({ part: "shortcut", state: {} })}
            aria-hidden="true"
          >
            <kbd>{key}</kbd>
          </span>
        )}
      </div>
    </form>
  );
}
