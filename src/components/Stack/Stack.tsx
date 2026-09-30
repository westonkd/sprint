import type { ComponentPropsWithRef, CSSProperties } from "react";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { cssValue, StyleRule, useStyleNonce } from "@/provider/styleRule.tsx";
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
  const nonce = useStyleNonce();
  const length = min === undefined ? undefined : cssValue(min);

  const node = buildAgentNode({
    component: stackMeta.name,
    state: { direction, gap, align, justify, wrap, collapse, min: length },
  });

  if (view === "agent") return <>{children}</>;

  const inline = length !== undefined && nonce === undefined;
  const sizing = inline
    ? ({ ...style, "--sprint-stack-min": length } as CSSProperties)
    : style;

  return (
    <div {...rest} {...agentAttributesFor(node)} style={sizing}>
      {children}
      {length !== undefined && nonce !== undefined ? (
        <StyleRule
          selector={`[data-sprint="Stack"][data-sprint-min="${length}"]`}
          declarations={{ "--sprint-stack-min": length }}
        />
      ) : null}
    </div>
  );
}
