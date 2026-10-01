import { type FormEvent, type ReactNode, useState } from "react";
import { ChoiceGrid, Stack, Text } from "../../src/index.ts";

const EMOJI = [
  { value: "fox", label: "Fox", glyph: "🦊" },
  { value: "rocket", label: "Rocket", glyph: "🚀" },
  { value: "cactus", label: "Cactus", glyph: "🌵" },
  { value: "anchor", label: "Anchor", glyph: "⚓" },
  { value: "pizza", label: "Pizza", glyph: "🍕" },
  { value: "comet", label: "Comet", glyph: "☄️" },
];

const REACTIONS = [
  { value: "up", label: "Thumbs up", glyph: "👍" },
  { value: "fire", label: "Fire", glyph: "🔥" },
  { value: "laugh", label: "Laughing", glyph: "😂" },
  { value: "sad", label: "Sad", glyph: "😢" },
];

const WINDOWS = [
  { value: "morning", label: "Morning", glyph: "☀" },
  { value: "evening", label: "Evening", glyph: "☾" },
];

function VerificationExample() {
  const [posted, setPosted] = useState<string | null>(null);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const native = event.nativeEvent as SubmitEvent;
    const submitter = native.submitter instanceof HTMLElement ? native.submitter : null;
    setPosted(
      new FormData(event.currentTarget, submitter).get("emoji")?.toString() ?? "",
    );
  };
  return (
    <form method="post" action="verify" onSubmit={submit}>
      <Stack>
        <ChoiceGrid
          label="Which emoji were you sent?"
          name="emoji"
          agentTool={false}
          options={EMOJI}
        />
        <Text tone="muted">
          {posted === null ? "Nothing posted yet" : `The form posted emoji=${posted}`}
        </Text>
      </Stack>
    </form>
  );
}

function ReactionExample() {
  const [reaction, setReaction] = useState("fire");
  return (
    <ChoiceGrid
      label="Pick a reaction"
      columns={4}
      name="reaction"
      value={reaction}
      onChange={setReaction}
      options={REACTIONS}
    />
  );
}

export const choiceGridSpecimens: Record<string, ReactNode> = {
  "An emoji verification check": <VerificationExample />,
  "Picking one with state": <ReactionExample />,
  "A disabled grid": (
    <ChoiceGrid
      label="Delivery window"
      columns={2}
      disabled
      value="morning"
      onChange={() => {}}
      options={WINDOWS}
    />
  ),
};

export const choiceGridGallery: ReactNode = (
  <Stack>
    <ChoiceGrid
      label="Two columns"
      columns={2}
      agentTool={false}
      value="morning"
      onChange={() => {}}
      options={WINDOWS}
    />
    <ChoiceGrid label="Three columns" agentTool={false} options={EMOJI} />
    <ChoiceGrid
      label="Four columns"
      columns={4}
      agentTool={false}
      value="up"
      onChange={() => {}}
      options={REACTIONS}
    />
    <ChoiceGrid
      label="Without glyphs"
      agentTool={false}
      options={[
        { value: "north", label: "North" },
        { value: "south", label: "South" },
        { value: "east", label: "East" },
      ]}
    />
  </Stack>
);
