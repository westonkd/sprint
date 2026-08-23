import type { ReactNode } from "react";
import { Stack, Tag } from "../../src/index.ts";

export const tagSpecimens: Record<string, ReactNode> = {
  "A release status": (
    <Tag tone="warning" filled>
      experimental
    </Tag>
  ),
  "A category chip": <Tag>action</Tag>,
  "Read-only against changes-state": (
    <Stack direction="row" gap="tight">
      <Tag tone="info">read only</Tag>
      <Tag tone="danger">changes state</Tag>
    </Stack>
  ),
};

export const tagGallery: ReactNode = (
  <>
    <Tag>neutral</Tag>
    <Tag tone="action">action</Tag>
    <Tag tone="danger">danger</Tag>
    <Tag tone="info">info</Tag>
    <Tag tone="warning">warning</Tag>
    <Tag tone="inert">inert</Tag>
    <Tag filled>filled</Tag>
    <Tag tone="action" filled>
      filled action
    </Tag>
  </>
);
