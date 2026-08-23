import type { ComponentPropsWithRef, ReactNode } from "react";
import { AgentDepthProvider, useAgentDepth, useAgentFormat } from "./mode.ts";
import type { AgentFormatter, AgentNode } from "./node.ts";
import { agentControlAttributes } from "./project.ts";

function format(node: AgentNode, formatter: AgentFormatter): string[] {
  return formatter([node]).split("\n");
}

export interface AgentLineProps {
  node: AgentNode;
  children?: ReactNode;
}

export function AgentLine(props: AgentLineProps) {
  const { node, children } = props;
  const depth = useAgentDepth();
  const formatter = useAgentFormat();
  const indent = "  ".repeat(depth);
  const lines = format(node, formatter).map((line) => `${indent}${line}`);

  return (
    <AgentDepthProvider value={depth + 1}>
      {`${lines.join("\n")}\n`}
      {children}
    </AgentDepthProvider>
  );
}

export type AgentControlProps = Omit<ComponentPropsWithRef<"button">, "children"> & {
  node: AgentNode;
  as?: "button" | "a";
  href?: string;
  children?: ReactNode;
};

export function AgentControl(props: AgentControlProps) {
  const { node, as = "button", href, children, ...rest } = props;
  const depth = useAgentDepth();
  const formatter = useAgentFormat();
  const indent = "  ".repeat(depth);
  const [head = "", ...rows] = format(node, formatter);
  const tail = rows.map((line) => `${indent}${line}`);
  const attributes = agentControlAttributes(node);

  const control =
    as === "a" ? (
      <a
        {...(rest as unknown as ComponentPropsWithRef<"a">)}
        {...attributes}
        href={href ?? "#"}
      >
        {head}
      </a>
    ) : (
      <button {...rest} {...attributes}>
        {head}
      </button>
    );

  return (
    <AgentDepthProvider value={depth + 1}>
      {indent}
      {control}
      {tail.length === 0 ? "\n" : `\n${tail.join("\n")}\n`}
      {children}
    </AgentDepthProvider>
  );
}
