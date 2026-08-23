import type { ReactNode } from "react";
import { CodeBlock } from "../../src/index.ts";

const DESCRIPTOR = `{
  "name": "press-prepare-launch",
  "description": "Press this button.",
  "inputSchema": { "type": "object", "properties": {} }
}`;

export const codeBlockSpecimens: Record<string, ReactNode> = {
  "An example snippet": (
    <CodeBlock code={'<Button tone="action">Prepare launch</Button>'} />
  ),
  "A captioned descriptor": (
    <CodeBlock caption="descriptor" language="json" code={DESCRIPTOR} />
  ),
};
