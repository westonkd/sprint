import { type ReactNode, useState } from "react";
import { Textarea } from "../../src/index.ts";

function NotesArea() {
  const [notes, setNotes] = useState("");
  return (
    <Textarea
      label="Mission notes"
      value={notes}
      onChange={setNotes}
      hint="What the relief crew needs to know"
    />
  );
}

function RequiredArea() {
  const [reason, setReason] = useState("");
  return (
    <Textarea
      label="Abort reason"
      value={reason}
      onChange={setReason}
      required
      rows={3}
      error="State the reason before aborting."
    />
  );
}

export const textareaSpecimens: Record<string, ReactNode> = {
  "A notes area": <NotesArea />,
  "A required area with an error": <RequiredArea />,
};
