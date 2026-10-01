import type { ReactNode } from "react";
import { Steps } from "../../src/index.ts";

export const stepsSpecimens: Record<string, ReactNode> = {
  "Send Tess two things": (
    <Steps
      label="Send Tess two things"
      steps={[{ title: "Copy the link" }, { title: "Pass on the emoji" }]}
    />
  ),
  "Partway through": (
    <Steps
      label="Connect a tool"
      steps={[
        {
          title: "Register the tool",
          body: "Give it a name and an input schema.",
          state: "done",
        },
        {
          title: "Drive the DOM",
          body: "Click the real element rather than calling a prop.",
          state: "current",
        },
        { title: "Return the new state", body: "Read it back from the page." },
      ]}
    />
  ),
  "Every step done": (
    <Steps
      label="Send Tess two things"
      steps={[
        { title: "Copy the link", state: "done" },
        { title: "Pass on the emoji", state: "done" },
      ]}
    />
  ),
};

export const stepsGallery: ReactNode = (
  <>
    <Steps
      label="Upcoming"
      steps={[
        { title: "Upcoming step", body: "No state: still to come." },
        { title: "Another upcoming step" },
      ]}
    />
    <Steps
      label="Every state"
      steps={[
        { title: "Done", body: "Finished, with the corner mark.", state: "done" },
        {
          title: "Current",
          body: "In progress, on the action field.",
          state: "current",
        },
        { title: "Upcoming", body: "Not started." },
      ]}
    />
    <Steps label="Empty" steps={[]} />
  </>
);
