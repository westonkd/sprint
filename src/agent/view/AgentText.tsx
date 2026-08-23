import type { ComponentPropsWithRef, ReactNode } from "react";
import { nodeLine } from "./markdown.ts";
import { AgentDepthProvider, useAgentDepth } from "./mode.ts";
import type { AgentNode } from "./node.ts";
import { agentControlAttributes } from "./project.ts";

function partLines(node: AgentNode, indent: string): string[] {
  return node.parts.map(
    (part) =>
      `${indent}  - part \`${part.part}\`${
        part.label === undefined ? "" : ` "${part.label}"`
      }`,
  );
}

export interface AgentLineProps {
  node: AgentNode;
  children?: ReactNode;
}

export function AgentLine(props: AgentLineProps) {
  const { node, children } = props;
  const depth = useAgentDepth();
  const indent = "  ".repeat(depth);
  const lines = [`${indent}${nodeLine(node)}`, ...partLines(node, indent)];

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
  const indent = "  ".repeat(depth);
  const tail = partLines(node, indent);
  const attributes = agentControlAttributes(node);

  const control =
    as === "a" ? (
      <a
        {...(rest as unknown as ComponentPropsWithRef<"a">)}
        {...attributes}
        href={href ?? "#"}
      >
        {nodeLine(node)}
      </a>
    ) : (
      <button {...rest} {...attributes}>
        {nodeLine(node)}
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
