import {
  type ComponentPropsWithRef,
  Fragment,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from "react";
import { AgentDepthProvider, useAgentDepth, useAgentFormat } from "./mode.ts";
import type { AgentFormatter, AgentNode, AgentPart } from "./node.ts";
import { agentControlAttributes, agentPartControlAttributes } from "./project.ts";

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

export interface AgentControlGroupProps {
  node: AgentNode;
  onActivate: (part: AgentPart, index: number) => void;
  isActionable?: (part: AgentPart, index: number) => boolean;
  children?: ReactNode;
}

export function AgentControlGroup(props: AgentControlGroupProps) {
  const { node, onActivate, isActionable, children } = props;
  const depth = useAgentDepth();
  const formatter = useAgentFormat();
  const indent = "  ".repeat(depth);
  const lines = format(node, formatter);
  const offset = lines.length - node.parts.length;
  const head = lines.slice(0, offset).map((line) => `${indent}${line}`);

  return (
    <AgentDepthProvider value={depth + 1}>
      {`${head.join("\n")}\n`}
      {node.parts.map((part, index) => {
        const line = lines[offset + index] ?? "";
        const body = line.trimStart();
        const lead = `${indent}${line.slice(0, line.length - body.length)}`;
        const key = `${part.part}-${part.label ?? index}`;

        if (isActionable !== undefined && !isActionable(part, index)) {
          return <Fragment key={key}>{`${lead}${body}\n`}</Fragment>;
        }

        return (
          <Fragment key={key}>
            {lead}
            <button
              type="button"
              {...agentPartControlAttributes(node.component, part)}
              onClick={() => onActivate(part, index)}
            >
              {body}
            </button>
            {"\n"}
          </Fragment>
        );
      })}
      {children}
    </AgentDepthProvider>
  );
}

export type AgentFieldControlProps = {
  node: AgentNode;
  value: string;
  onValueChange: (value: string) => void;
  multiline?: boolean;
  masked?: boolean;
  ref?: Ref<HTMLInputElement> | Ref<HTMLTextAreaElement> | undefined;
};

export function AgentFieldControl(props: AgentFieldControlProps) {
  const { node, value, onValueChange, multiline = false, masked = false, ref } = props;
  const depth = useAgentDepth();
  const formatter = useAgentFormat();
  const indent = "  ".repeat(depth);
  const lines = format(node, formatter).map((line) => `${indent}${line}`);
  const attributes = agentControlAttributes(node);

  const control = multiline ? (
    <textarea
      {...attributes}
      aria-label={node.label}
      value={value}
      onChange={(event) => onValueChange(event.currentTarget.value)}
      ref={ref as Ref<HTMLTextAreaElement>}
    />
  ) : (
    <input
      {...attributes}
      aria-label={node.label}
      type={masked ? "password" : "text"}
      value={value}
      onChange={(event) => onValueChange(event.currentTarget.value)}
      ref={ref as Ref<HTMLInputElement>}
    />
  );

  return (
    <AgentDepthProvider value={depth + 1}>
      {`${lines.join("\n")}\n`}
      {indent}
      {control}
      {"\n"}
    </AgentDepthProvider>
  );
}

export type AgentControlProps = Omit<
  ComponentPropsWithRef<"button">,
  "children" | "ref" | "onClick"
> & {
  node: AgentNode;
  as?: "button" | "a" | undefined;
  href?: string | undefined;
  target?: string | undefined;
  rel?: string | undefined;
  onClick?:
    | MouseEventHandler<HTMLButtonElement>
    | MouseEventHandler<HTMLAnchorElement>
    | undefined;
  ref?: Ref<HTMLButtonElement> | Ref<HTMLAnchorElement> | undefined;
  children?: ReactNode;
};

export function AgentControl(props: AgentControlProps) {
  const { node, as = "button", href, children, ref, ...rest } = props;
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
        ref={ref as Ref<HTMLAnchorElement>}
      >
        {head}
      </a>
    ) : (
      <button
        {...(rest as unknown as ComponentPropsWithRef<"button">)}
        {...attributes}
        ref={ref as Ref<HTMLButtonElement>}
      >
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
