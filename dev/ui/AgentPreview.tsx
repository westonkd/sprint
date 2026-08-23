import { type ReactNode, useEffect, useState } from "react";
import {
  Panel,
  SegmentedControl,
  SprintProvider,
  type SprintView,
} from "../../src/index.ts";

const OPTIONS = [
  { value: "human", label: "human" },
  { value: "agent", label: "agent" },
];

export interface ViewSwitchProps {
  view: SprintView;
  onChange: (view: SprintView) => void;
  label: string;
}

export function ViewSwitch(props: ViewSwitchProps) {
  const { view, onChange, label } = props;

  return (
    <SegmentedControl
      label={label}
      options={OPTIONS}
      value={view}
      agentTool={false}
      onChange={(next) => onChange(next === "agent" ? "agent" : "human")}
    />
  );
}

export interface AgentPreviewProps {
  children: ReactNode;
  pageView: SprintView;
}

export function AgentPreview(props: AgentPreviewProps) {
  const { children, pageView } = props;
  const [view, setView] = useState<SprintView>(pageView);

  useEffect(() => {
    setView(pageView);
  }, [pageView]);

  return (
    <Panel
      headingLevel={4}
      label={view === "human" ? "Human view" : "Agent view"}
      actions={<ViewSwitch view={view} onChange={setView} label="Preview view" />}
    >
      <div className={view === "agent" ? "stage as-text" : "stage"}>
        <SprintProvider view={view} pageTools={false}>
          {children}
        </SprintProvider>
      </div>
    </Panel>
  );
}
