import { buildAgentManifest, version } from "../src/index.ts";
import "../src/components/index.ts";

export function agentManifest() {
  return buildAgentManifest(version);
}
