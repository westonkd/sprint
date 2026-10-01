import type { ComponentPropsWithRef, CSSProperties } from "react";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { stackMeta } from "./meta.ts";
import "./Stack.css";

export type StackDirection = "row" | "column" | "grid";
export type StackGap = "none" | "tight" | "normal" | "loose";
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify = "start" | "center" | "end" | "between";

export const STACK_MINS = [
  "10rem",
  "12rem",
  "14rem",
  "16rem",
  "18rem",
  "20rem",
  "22rem",
  "24rem",
  "28rem",
  "32rem",
] as const;

export type StackMin = (typeof STACK_MINS)[number];

export interface StackProps extends ComponentPropsWithRef<"div"> {
  direction?: StackDirection;
  gap?: StackGap;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  collapse?: boolean;
  min?: StackMin | (string & Record<never, never>);
}

function onScale(min: string): min is StackMin {
  return (STACK_MINS as readonly string[]).includes(min);
}

function offScaleSizing(
  min: string,
  style: CSSProperties | undefined,
): CSSProperties | undefined {
  if (onScale(min)) return style;
  return { ...style, "--sprint-stack-min": min } as CSSProperties;
}

export function Stack(props: StackProps) {
  const {
    direction = "column",
    gap = "normal",
    align,
    justify,
    wrap = false,
    collapse = false,
    min = "18rem",
    children,
    style,
    ...rest
  } = props;

  const view = useSprintView();
  const grid = direction === "grid";

  const node = buildAgentNode({
    component: stackMeta.name,
    state: {
      direction,
      gap,
      align,
      justify,
      wrap,
      collapse,
      min: grid ? min : undefined,
    },
  });

  if (view === "agent") return <>{children}</>;

  return (
    <div
      {...rest}
      {...agentAttributesFor(node)}
      style={grid ? offScaleSizing(min, style) : style}
    >
      {children}
    </div>
  );
}
