import { type ReactNode, useState } from "react";
import { AgentRegion, Button } from "../../src/index.ts";

function BusyExample() {
  const [saving, setSaving] = useState(false);
  return (
    <>
      <Button loading={saving} onClick={() => setSaving(true)}>
        Save loadout
      </Button>
      <Button agentName="Clear busy" onClick={() => setSaving(false)}>
        Clear
      </Button>
    </>
  );
}

function CounterExample() {
  const [count, setCount] = useState(0);
  return (
    <Button agentName="Increment" onClick={() => setCount((value) => value + 1)}>
      Increment ({count})
    </Button>
  );
}

export const buttonSpecimens: Record<string, ReactNode> = {
  "Primary action": (
    <Button tone="action" block>
      Prepare launch
    </Button>
  ),
  "Destructive action": <Button tone="danger">Purge vault</Button>,
  "Busy state": <BusyExample />,
  "Disambiguating two identical labels": (
    <>
      <AgentRegion label="Billing">
        <Button>Save</Button>
      </AgentRegion>
      <AgentRegion label="Shipping">
        <Button>Save</Button>
      </AgentRegion>
    </>
  ),
  "Keeping the tool name stable under a changing label": <CounterExample />,
};

export const buttonGallery: ReactNode = (
  <>
    <Button>Neutral</Button>
    <Button tone="action">Action</Button>
    <Button tone="danger">Danger</Button>
    <Button disabled>Disabled</Button>
    <Button loading>Loading</Button>
    <Button agentTool={false}>No tool</Button>
  </>
);
