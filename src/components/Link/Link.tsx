import { type ComponentPropsWithRef, useCallback, useRef } from "react";
import { AgentControl, AgentLine } from "@/agent/view/AgentText.tsx";
import { useAgentControls, useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { reactText } from "@/agent/view/text.ts";
import { useAgentTool } from "@/agent/webmcp/useAgentTool.ts";
import { linkMeta } from "./meta.ts";
import { OPEN_LINK_TOOL } from "./tool.ts";
import "./Link.css";

export interface LinkProps extends ComponentPropsWithRef<"a"> {
  href: string;
  active?: boolean;
  external?: boolean;
  agentTool?: boolean;
  agentName?: string;
}

export function Link(props: LinkProps) {
  const {
    href,
    active = false,
    external = false,
    agentTool = false,
    agentName,
    children,
    ref,
    ...rest
  } = props;

  const view = useSprintView();
  const controls = useAgentControls();
  const element = useRef<HTMLAnchorElement | null>(null);

  const setRef = useCallback(
    (target: HTMLAnchorElement | null) => {
      element.current = target;
      if (typeof ref === "function") ref(target);
      else if (ref !== null && ref !== undefined) ref.current = target;
    },
    [ref],
  );

  const label = agentName ?? reactText(children);

  const execute = useCallback(() => {
    const target = element.current;
    if (target === null) {
      return "This link renders no element in the current view. Navigate to its href instead.";
    }
    target.click();
    return `Following ${target.getAttribute("href") ?? href}.`;
  }, [href]);

  const toolName = useAgentTool({
    spec: OPEN_LINK_TOOL,
    label,
    enabled: agentTool,
    execute,
  });

  const node = buildAgentNode({
    component: linkMeta.name,
    label: reactText(children),
    tool: toolName,
    state: { href, active, external },
  });

  const outward = external
    ? { target: "_blank", rel: "noreferrer noopener" }
    : { target: undefined, rel: undefined };

  if (view === "agent") {
    if (controls === "never") return <AgentLine node={node} />;
    return (
      <AgentControl
        node={node}
        as="a"
        href={href}
        ref={setRef}
        target={outward.target}
        rel={outward.rel}
      />
    );
  }

  return (
    <a
      {...rest}
      {...agentAttributesFor(node)}
      href={href}
      ref={setRef}
      aria-current={active ? "page" : undefined}
      target={outward.target}
      rel={outward.rel}
    >
      {children}
    </a>
  );
}
