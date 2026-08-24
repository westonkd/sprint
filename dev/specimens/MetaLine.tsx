import type { ReactNode } from "react";
import { MetaLine } from "../../src/index.ts";

export const metaLineSpecimens: Record<string, ReactNode> = {
  "A build strip": (
    <MetaLine
      entries={[
        { term: "Serial", detail: "NU-TYPE-CORE-A1" },
        { term: "Issued", detail: "2744.07.22" },
      ]}
    />
  ),
  "Version chrome for a footer": (
    <MetaLine
      entries={[
        { term: "Sprint", detail: "v0.0.0" },
        { term: "Channel", detail: "dev" },
        { term: "WebMCP", detail: "chrome 149" },
      ]}
    />
  ),
};
