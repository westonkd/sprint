import { type ReactNode, useEffect, useState } from "react";
import { SprintProvider, type SprintView } from "../../src/index.ts";

export interface ViewSwitchProps {
  view: SprintView;
  onChange: (view: SprintView) => void;
  label?: string;
}

export function ViewSwitch(props: ViewSwitchProps) {
  const { view, onChange, label } = props;

  return (
    <div className="switch-group">
      {label === undefined ? null : <span className="slug-inline">{label}</span>}
      <div className="switch">
        {(["human", "agent"] as const).map((option) => (
          <button
            key={option}
            type="button"
            className={option === view ? "switch-option active" : "switch-option"}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
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
    <div className="preview">
      <div className="preview-bar">
        <span className="slug-inline">{view === "human" ? "Human" : "Agent"} view</span>
        <ViewSwitch view={view} onChange={setView} />
      </div>
      <div className={view === "agent" ? "preview-stage as-text" : "preview-stage"}>
        <SprintProvider view={view} pageTools={false}>
          {children}
        </SprintProvider>
      </div>
    </div>
  );
}
