import {
  type ComponentPropsWithRef,
  useCallback,
  useEffect,
  useId,
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
import { useAgentTool } from "@/agent/webmcp/useAgentTool.ts";
import { disclosureMeta } from "./meta.ts";
import { EXPAND_DISCLOSURE_TOOL } from "./tool.ts";
import "./Disclosure.css";

export interface DisclosureProps extends ComponentPropsWithRef<"section"> {
  label: string;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  showLabel?: string;
  hideLabel?: string;
  agentName?: string;
  agentTool?: boolean;
}

function inSentence(label: string): string {
  return /^[A-Z][a-z]/.test(label)
    ? `${label[0]?.toLowerCase()}${label.slice(1)}`
    : label;
}

export function Disclosure(props: DisclosureProps) {
  const {
    label,
    expanded: controlled,
    defaultExpanded = false,
    onExpandedChange,
    showLabel = `Show ${inSentence(label)}`,
    hideLabel = `Hide ${inSentence(label)}`,
    agentName,
    agentTool = true,
    children,
    ...rest
  } = props;

  const view = useSprintView();
  const controls = useAgentControls();
  const formatter = useAgentFormat();
  const contentId = useId();

  const [uncontrolled, setUncontrolled] = useState(defaultExpanded);
  const expanded = controlled ?? uncontrolled;

  const toggle = useRef<HTMLButtonElement | null>(null);
  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;
  const controlledRef = useRef(controlled !== undefined);
  controlledRef.current = controlled !== undefined;
  const onChangeRef = useRef(onExpandedChange);
  onChangeRef.current = onExpandedChange;
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: disclosureMeta.name }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const change = useCallback((next: boolean) => {
    if (!controlledRef.current) setUncontrolled(next);
    onChangeRef.current?.(next);
  }, []);

  const press = () => change(!expanded);

  const execute = useCallback(
    async (inputs: Record<string, unknown>) => {
      const desired = inputs.expanded;
      if (typeof desired !== "boolean") {
        return 'Pass "expanded" as true or false; it states the end state.';
      }

      const already = desired === expandedRef.current;
      if (!already) {
        const target = toggle.current;
        if (target !== null) target.click();
        else commitSync(() => change(desired));
      }

      await afterCommit();
      if (!mounted.current) return "The change removed this disclosure from the page.";
      const outcome = already
        ? `Already ${desired ? "expanded" : "collapsed"}`
        : desired
          ? "Expanded"
          : "Collapsed";
      return `${outcome}. The disclosure is now:\n${formatRef.current([nodeRef.current])}`;
    },
    [change],
  );

  const toolName = useAgentTool({
    spec: EXPAND_DISCLOSURE_TOOL,
    label: agentName ?? label,
    enabled: agentTool,
    execute,
  });

  const part: AgentPart = {
    part: "toggle",
    label: expanded ? hideLabel : showLabel,
    state: expanded ? { expanded: true } : {},
  };

  const node = buildAgentNode({
    component: disclosureMeta.name,
    label,
    tool: toolName,
    region: true,
    state: { expanded },
    parts: [part],
  });
  nodeRef.current = node;

  if (view === "agent") {
    if (controls === "never") return <AgentLine node={node}>{children}</AgentLine>;
    return (
      <AgentControlGroup node={node} onActivate={press}>
        {children}
      </AgentControlGroup>
    );
  }

  return (
    <section {...rest} {...agentAttributesFor(node)} aria-label={label}>
      <button
        {...agentPartAttributesFor(part)}
        ref={toggle}
        type="button"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={press}
      >
        {part.label}
      </button>
      <div id={contentId}>{children}</div>
    </section>
  );
}
