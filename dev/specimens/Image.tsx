import type { ReactNode } from "react";
import { Image, Stack } from "../../src/index.ts";

const PAD = "media/pad-39b.svg";
const CHART = "media/telemetry.svg";
const GRAIN = "media/grain.svg";

export const imageSpecimens: Record<string, ReactNode> = {
  "A described picture": (
    <Image
      src={PAD}
      alt="Launch pad 39B under floodlights, gantry retracted"
      ratio="16:9"
    />
  ),
  "A captioned figure": (
    <Image
      src={CHART}
      alt="Line chart of chamber pressure holding flat for nine minutes, then dropping"
      caption="Static fire 04, chamber pressure"
      ratio="3:2"
      fit="contain"
    />
  ),
  "A picture that means nothing": <Image src={GRAIN} alt="" ratio="1:1" />,
};

export const imageGallery: ReactNode = (
  <Stack direction="grid" min="14rem">
    <Image src={PAD} alt="Pad, square crop" ratio="1:1" />
    <Image src={PAD} alt="Pad, letterboxed" ratio="1:1" fit="contain" />
    <Image
      src={CHART}
      alt="Chamber pressure"
      caption="With a caption band"
      ratio="4:3"
    />
    <Image
      src="media/missing.png"
      alt="A source that will not resolve, so the slot keeps its border and says so"
      ratio="4:3"
    />
  </Stack>
);
