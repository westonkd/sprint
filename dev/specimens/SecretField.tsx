import type { ReactNode } from "react";
import { SecretField } from "../../src/index.ts";

export const secretFieldSpecimens: Record<string, ReactNode> = {
  "A key shown once": (
    <SecretField
      label="API key"
      value="sk_live_9f2ab41c77d05513"
      hint="Store it now. It is not shown again."
    />
  ),
  "Starting revealed": (
    <SecretField label="Recovery code" value="7HW4-XK92-QQ1D" defaultRevealed />
  ),
};
