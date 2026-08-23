import { type ReactNode, useState } from "react";
import { Switch } from "../../src/index.ts";

function LiveSetting() {
  const [telemetry, setTelemetry] = useState(false);
  return <Switch label="Live telemetry" on={telemetry} onChange={setTelemetry} />;
}

export const switchSpecimens: Record<string, ReactNode> = {
  "A live setting": <LiveSetting />,
  "A disabled switch": <Switch label="Ground link" on disabled onChange={() => {}} />,
};
