import { createContext, useContext } from "react";
import { toMarkdown } from "./markdown.ts";
import type { AgentFormatter } from "./node.ts";

export type SprintView = "human" | "agent";

export type SprintAgentControls = "always" | "never";

export const defaultAgentFormat: AgentFormatter = (nodes) => toMarkdown(nodes);

export interface SprintViewValue {
  view: SprintView;
  setView: (view: SprintView) => void;
  controls: SprintAgentControls;
  format: AgentFormatter;
  owned: boolean;
}

const ViewContext = createContext<SprintViewValue>({
  view: "human",
  setView: () => {},
  controls: "always",
  format: defaultAgentFormat,
  owned: false,
});

export const SprintViewProvider = ViewContext.Provider;

export function useSprintView(): SprintView {
  return useContext(ViewContext).view;
}

export function useSprintViewControl(): SprintViewValue {
  return useContext(ViewContext);
}

export function useAgentControls(): SprintAgentControls {
  return useContext(ViewContext).controls;
}

export function useAgentFormat(): AgentFormatter {
  return useContext(ViewContext).format;
}

const DepthContext = createContext(0);

export const AgentDepthProvider = DepthContext.Provider;

export function useAgentDepth(): number {
  return useContext(DepthContext);
}
