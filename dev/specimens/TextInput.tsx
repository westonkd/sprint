import { type ReactNode, useState } from "react";
import { TextInput } from "../../src/index.ts";

function LabelledField() {
  const [callsign, setCallsign] = useState("");
  return (
    <TextInput
      label="Callsign"
      value={callsign}
      onChange={setCallsign}
      hint="Uppercase, three to eight letters"
      placeholder="NOMAD"
    />
  );
}

function ValidationError() {
  const [frequency, setFrequency] = useState("212.550");
  return (
    <TextInput
      label="Frequency"
      value={frequency}
      onChange={setFrequency}
      required
      error="Out of band. Use 118.000 to 136.975."
    />
  );
}

function Password() {
  const [code, setCode] = useState("");
  return (
    <TextInput
      label="Access code"
      type="password"
      value={code}
      onChange={setCode}
      autoComplete="current-password"
    />
  );
}

export const textInputSpecimens: Record<string, ReactNode> = {
  "A labelled field": <LabelledField />,
  "A validation error": <ValidationError />,
  "A password": <Password />,
};
