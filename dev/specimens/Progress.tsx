import { type ReactNode, useEffect, useState } from "react";
import { Progress } from "../../src/index.ts";

function CountedImport() {
  const [imported, setImported] = useState(96);
  const total = 240;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setImported((current) => (current >= total ? 0 : current + 12));
    }, 400);
    return () => window.clearInterval(timer);
  }, []);

  return <Progress label="Importing manifest" value={imported} max={total} />;
}

export const progressSpecimens: Record<string, ReactNode> = {
  "Indeterminate load": <Progress label="Loading flight plan" />,
  "Counted progress": <CountedImport />,
  Complete: <Progress label="Importing manifest" value={240} max={240} />,
  "A bare goal bar": (
    <Progress label="Notes this week" value={3} max={5} tone="action" hideLabel />
  ),
};

export const progressGallery: ReactNode = (
  <>
    <Progress label="Loading flight plan" />
    <Progress label="Uploading telemetry" value={0} />
    <Progress label="Importing manifest" value={40} />
    <Progress label="Syncing loadouts" value={100} />
    <Progress label="Fuel reserve" value={30} tone="warning" />
    <Progress label="Hull integrity" value={12} tone="danger" />
  </>
);
