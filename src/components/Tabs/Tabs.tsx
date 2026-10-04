import {
  type ComponentPropsWithRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
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
import { tabsMeta } from "./meta.ts";
import { SELECT_TAB_TOOL } from "./tool.ts";
import "./Tabs.css";

export interface TabItem {
  value: string;
  label: string;
  panel: ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps extends Omit<ComponentPropsWithRef<"div">, "onChange"> {
  label: string;
  tabs: readonly TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  actions?: ReactNode;
  agentName?: string;
  agentTool?: boolean;
}

function tabSchema(labels: readonly string[]): JsonSchemaObject {
  const tab = SELECT_TAB_TOOL.inputSchema.properties.tab;
  return {
    ...SELECT_TAB_TOOL.inputSchema,
    properties: {
      ...SELECT_TAB_TOOL.inputSchema.properties,
      ...(tab === undefined ? {} : { tab: { ...tab, enum: [...labels] } }),
    },
  };
}

function firstEnabled(tabs: readonly TabItem[]): string | undefined {
  return tabs.find((tab) => tab.disabled !== true)?.value;
}

export function Tabs(props: TabsProps) {
  const {
    label,
    tabs,
    value: controlled,
    defaultValue,
    onChange,
    actions,
    agentName,
    agentTool = true,
    ...rest
  } = props;

  const view = useSprintView();
  const controls = useAgentControls();
  const formatter = useAgentFormat();
  const id = useId();

  const [held, setHeld] = useState(defaultValue ?? firstEnabled(tabs));
  const requested = controlled ?? held;
  const active =
    tabs.find((tab) => tab.value === requested && tab.disabled !== true)?.value ??
    firstEnabled(tabs);

  const elements = useRef(new Map<string, HTMLButtonElement>());
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: tabsMeta.name }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const change = useCallback((next: string) => {
    setHeld(next);
    onChangeRef.current?.(next);
  }, []);

  const select = useCallback(
    (next: string) => {
      const element = elements.current.get(next);
      if (element !== undefined) {
        element.click();
        return;
      }
      commitSync(() => change(next));
    },
    [change],
  );

  const execute = useCallback(
    async (inputs: Record<string, unknown>) => {
      const requestedLabel = typeof inputs.tab === "string" ? inputs.tab : "";
      const available = tabsRef.current;
      const match = available.find((tab) => tab.label === requestedLabel);
      if (match === undefined || match.disabled === true) {
        return `No tab named "${requestedLabel}" can be shown. These tabs offer: ${available
          .filter((tab) => tab.disabled !== true)
          .map((tab) => `"${tab.label}"`)
          .join(", ")}.`;
      }
      select(match.value);
      await afterCommit();
      if (!mounted.current) return "Switching tabs removed them from the page.";
      return `Selected. The tabs are now:\n${formatRef.current([nodeRef.current])}`;
    },
    [select],
  );

  const labels = useMemo(
    () => tabs.filter((tab) => tab.disabled !== true).map((tab) => tab.label),
    [tabs],
  );
  const schema = useMemo(() => tabSchema(labels), [labels]);

  const toolName = useAgentTool({
    spec: SELECT_TAB_TOOL,
    label: agentName ?? label,
    inputSchema: schema,
    enabled: agentTool && labels.length > 0,
    execute,
  });

  const parts: AgentPart[] = tabs.map((tab) => ({
    part: "tab",
    label: tab.label,
    state: {
      ...(tab.value === active ? { selected: true as const } : {}),
      ...(tab.count === undefined ? {} : { count: String(tab.count) }),
      ...(tab.disabled === true ? { disabled: true as const } : {}),
    },
  }));

  const node = buildAgentNode({
    component: tabsMeta.name,
    label,
    tool: toolName,
    region: true,
    state: { value: tabs.find((tab) => tab.value === active)?.label },
    parts,
  });
  nodeRef.current = node;

  const current = tabs.find((tab) => tab.value === active);

  if (view === "agent") {
    if (controls === "never") {
      return (
        <>
          <AgentLine node={node} />
          {current?.panel}
        </>
      );
    }
    return (
      <AgentControlGroup
        node={node}
        isActionable={(part) =>
          part.state.disabled !== true && part.state.selected !== true
        }
        onActivate={(_part, index) => {
          const target = tabs[index];
          if (target !== undefined) select(target.value);
        }}
      >
        {current?.panel}
      </AgentControlGroup>
    );
  }

  const tabId = (value: string) => `${id}-tab-${value}`;
  const panelId = `${id}-panel`;
  const enabled = tabs.filter((tab) => tab.disabled !== true);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key) || enabled.length === 0) return;
    const position = enabled.findIndex((tab) => tab.value === active);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? enabled.length - 1
          : (position + (event.key === "ArrowRight" ? 1 : -1) + enabled.length) %
            enabled.length;
    const target = enabled[next];
    if (target === undefined) return;
    event.preventDefault();
    elements.current.get(target.value)?.focus();
    change(target.value);
  };

  return (
    <div {...rest} {...agentAttributesFor(node)}>
      <div>
        <div role="tablist" aria-label={label} onKeyDown={onKeyDown}>
          {tabs.map((tab, index) => {
            const selected = tab.value === active;
            return (
              <button
                key={tab.value}
                id={tabId(tab.value)}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={selected ? panelId : undefined}
                tabIndex={selected ? 0 : -1}
                disabled={tab.disabled === true}
                ref={(element) => {
                  if (element === null) elements.current.delete(tab.value);
                  else elements.current.set(tab.value, element);
                }}
                {...agentPartAttributesFor(parts[index] ?? { part: "tab", state: {} })}
                onClick={() => change(tab.value)}
              >
                <span>{tab.label}</span>
                {tab.count === undefined ? null : (
                  <span aria-hidden="true">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>
        {actions === undefined ? null : <div>{actions}</div>}
      </div>
      {current === undefined ? null : (
        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={tabId(current.value)}
          tabIndex={0}
        >
          {current.panel}
        </div>
      )}
    </div>
  );
}
