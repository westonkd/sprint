import { createContext, useContext } from "react";

export type SprintView = "human" | "agent";

export type SprintAgentControls = "always" | "never";

export interface SprintViewValue {
  view: SprintView;
  setView: (view: SprintView) => void;
  controls: SprintAgentControls;
  owned: boolean;
}

const ViewContext = createContext<SprintViewValue>({
  view: "human",
  setView: () => {},
  controls: "always",
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

const DepthContext = createContext(0);

export const AgentDepthProvider = DepthContext.Provider;

export function useAgentDepth(): number {
  return useContext(DepthContext);
}
