import type { ComponentPropsWithRef, CSSProperties } from "react";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { stackMeta } from "./meta.ts";
import "./Stack.css";

export type StackDirection = "row" | "column" | "grid";
export type StackGap = "none" | "tight" | "normal" | "loose";
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify = "start" | "center" | "end" | "between";

export interface StackProps extends ComponentPropsWithRef<"div"> {
  direction?: StackDirection;
  gap?: StackGap;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  collapse?: boolean;
  min?: string;
}

export function Stack(props: StackProps) {
  const {
    direction = "column",
    gap = "normal",
    align,
    justify,
    wrap = false,
    collapse = false,
    min,
    children,
    style,
    ...rest
  } = props;

  const view = useSprintView();

  const node = buildAgentNode({
    component: stackMeta.name,
    state: { direction, gap, align, justify, wrap, collapse },
  });

  if (view === "agent") return <>{children}</>;

  const sizing =
    min === undefined
      ? style
      : ({ ...style, "--sprint-stack-min": min } as CSSProperties);

  return (
    <div {...rest} {...agentAttributesFor(node)} style={sizing}>
      {children}
    </div>
  );
}
