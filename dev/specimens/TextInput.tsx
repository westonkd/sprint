import { type ReactNode, useRef, useState } from "react";
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

function ReadOnly() {
  return (
    <TextInput
      label="Station ID"
      value="KX-2209-ALPHA"
      onChange={() => {}}
      readOnly
      hint="Assigned at registration"
    />
  );
}

function NumberField() {
  const [days, setDays] = useState("14");
  const daysField = useRef<HTMLInputElement>(null);
  return (
    <TextInput
      label="Link expiry in days"
      type="number"
      value={days}
      onChange={setDays}
      inputRef={daysField}
      inputProps={{ min: 1, max: 90, step: 1 }}
    />
  );
}

export const textInputSpecimens: Record<string, ReactNode> = {
  "A labelled field": <LabelledField />,
  "A validation error": <ValidationError />,
  "A password": <Password />,
  "A read-only value": <ReadOnly />,
  "A number with field attributes": <NumberField />,
};
