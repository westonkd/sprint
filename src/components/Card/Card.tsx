import {
  type ComponentPropsWithRef,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
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
import { reactText } from "@/agent/view/text.ts";
import { afterCommit } from "@/agent/webmcp/afterCommit.ts";
import { useAgentTool } from "@/agent/webmcp/useAgentTool.ts";
import { cardMeta } from "./meta.ts";
import { OPEN_CARD_TOOL } from "./tool.ts";
import "./Card.css";

export interface CardProps
  extends Omit<ComponentPropsWithRef<"button">, "ref" | "onClick" | "children"> {
  label: string;
  children?: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  agentTool?: boolean;
  agentName?: string;
  ref?: Ref<HTMLButtonElement> | Ref<HTMLAnchorElement>;
}

export function Card(props: CardProps) {
  const {
    label,
    children,
    href,
    onClick,
    disabled = false,
    agentTool,
    agentName,
    ref,
    ...rest
  } = props;

  const view = useSprintView();
  const controls = useAgentControls();
  const formatter = useAgentFormat();
  const navigates = href !== undefined;
  const element = useRef<HTMLElement | null>(null);

  const setRef = useCallback(
    (target: HTMLElement | null) => {
      element.current = target;
      if (typeof ref === "function") {
        (ref as (value: HTMLElement | null) => void)(target);
      } else if (ref !== null && ref !== undefined) {
        (ref as { current: HTMLElement | null }).current = target;
      }
    },
    [ref],
  );

  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: cardMeta.name }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    const target = element.current;
    if (target === null) return "This card renders no control in the current view.";

    target.click();
    await afterCommit();
    if (!mounted.current) return "Opening removed this card from the page.";
    return `Opened. The card is now:\n${formatRef.current([nodeRef.current])}`;
  }, []);

  const toolName = useAgentTool({
    spec: OPEN_CARD_TOOL,
    label: agentName ?? label,
    enabled: (agentTool ?? !navigates) && !disabled,
    execute,
  });

  const body = reactText(children);
  const parts: AgentPart[] = [
    { part: "title", label, state: {} },
    ...(body === undefined ? [] : [{ part: "body", label: body, state: {} }]),
  ];

  const node = buildAgentNode({
    component: cardMeta.name,
    label,
    tool: toolName,
    state: { href, disabled },
    parts,
  });
  nodeRef.current = node;

  if (view === "agent") {
    if (disabled || controls === "never") return <AgentLine node={node} />;
    return (
      <AgentControl
        node={node}
        as={navigates ? "a" : "button"}
        href={href}
        ref={setRef}
        onClick={navigates ? undefined : onClick}
      />
    );
  }

  const inner = (
    <>
      <span {...agentPartAttributesFor({ part: "title", state: {} })}>{label}</span>
      {children === undefined ? null : (
        <span {...agentPartAttributesFor({ part: "body", state: {} })}>{children}</span>
      )}
    </>
  );

  if (navigates) {
    return (
      <a
        {...(rest as unknown as ComponentPropsWithRef<"a">)}
        {...agentAttributesFor(node)}
        href={href}
        aria-label={label}
        ref={setRef as Ref<HTMLAnchorElement>}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      {...rest}
      {...agentAttributesFor(node)}
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      ref={setRef as Ref<HTMLButtonElement>}
    >
      {inner}
    </button>
  );
}
