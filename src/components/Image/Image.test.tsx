import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { Image } from "./Image.tsx";

const SRC = "/media/pad-39b.jpg";
const ALT = "Launch pad 39B under floodlights, gantry retracted";

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Image"));
  if (element === null) throw new Error("no Image root found");
  return element;
}

describe("Image rendering", () => {
  it("names itself from its alt text and publishes its source", () => {
    render(<Image src={SRC} alt={ALT} ratio="16:9" />);
    expect(root()).toHaveAttribute("aria-label", ALT);
    expect(root()).toHaveAttribute("data-sprint-src", SRC);
    expect(root()).toHaveAttribute("data-sprint-ratio", "16:9");
    expect(root()).toHaveAttribute("data-sprint-fit", "cover");
  });

  it("carries the alt text natively as well, so the fallback still reads", () => {
    render(<Image src={SRC} alt={ALT} />);
    expect(screen.getByAltText(ALT)).toHaveAttribute("src", SRC);
  });

  it("holds the slot and states its condition until the pixels arrive", () => {
    render(<Image src={SRC} alt={ALT} />);
    expect(root()).toHaveAttribute("data-sprint-status", "loading");
    expect(root().querySelector("span")?.textContent).toBe("Loading");

    fireEvent.load(screen.getByAltText(ALT));
    expect(root()).toHaveAttribute("data-sprint-status", "ready");
    expect(root().querySelector("span")).toBeNull();
  });

  it("shows the description in the frame when the file fails", () => {
    render(<Image src={SRC} alt={ALT} />);
    fireEvent.error(screen.getByAltText(ALT));
    expect(root()).toHaveAttribute("data-sprint-status", "error");
    expect(root().querySelector("span")?.textContent).toBe(ALT);
  });

  it("says so when a failed image had nothing to describe", () => {
    render(<Image src={SRC} alt="" />);
    fireEvent.error(root().querySelector("img") as HTMLImageElement);
    expect(root().querySelector("span")?.textContent).toBe("Image unavailable");
  });

  it("marks an empty alt with no caption as decorative", () => {
    render(<Image src={SRC} alt="" />);
    expect(root()).toHaveAttribute("data-sprint-decorative", "");
    expect(root()).not.toHaveAttribute("aria-label");
  });

  it("is not decorative once it carries a caption", () => {
    render(<Image src={SRC} alt="" caption="Pad 39B" />);
    expect(root()).not.toHaveAttribute("data-sprint-decorative");
  });

  it("renders a caption as a figcaption part", () => {
    render(<Image src={SRC} alt={ALT} caption="Pad 39B, T-minus 4h" />);
    const caption = root().querySelector('[data-sprint-part="caption"]');
    expect(caption?.tagName).toBe("FIGCAPTION");
    expect(caption?.textContent).toBe("Pad 39B, T-minus 4h");
  });

  it("registers no WebMCP tool, because there is nothing to do to a picture", () => {
    render(<Image src={SRC} alt={ALT} />);
    expect(root()).not.toHaveAttribute("data-sprint-tool");
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLElement>();
    render(<Image ref={ref} src={SRC} alt={ALT} id="pad" data-testid="spread" />);
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "pad");
    expect(screen.getByTestId("spread")).toBe(root());
  });
});

describe("Image agent view", () => {
  it("is its alt text, its source, and nothing else", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Image src={SRC} alt={ALT} ratio="16:9" caption="Pad 39B, T-minus 4h" />
      </SprintProvider>,
    );

    expect(container.querySelector(agentSelector("Image"))).toBeNull();
    expect(container.textContent).toBe(
      [
        `- **Image** "${ALT}" [fit=cover, ratio=16:9, src=${SRC}]`,
        '  - part `caption` "Pad 39B, T-minus 4h"',
        "",
      ].join("\n"),
    );
  });

  it("reports no load status, because in agent view nothing is fetched", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Image src={SRC} alt={ALT} />
      </SprintProvider>,
    );
    expect(container.textContent).not.toContain("status=");
  });

  it("renders nothing at all for a picture declared meaningless", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Image src={SRC} alt="" />
      </SprintProvider>,
    );
    expect(container.textContent).toBe("");
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(
      <Image src={SRC} alt={ALT} ratio="16:9" caption="Pad 39B, T-minus 4h" />,
    );

    const [node] = serializeWithin(container);
    expect(node?.label).toBe(ALT);
    expect(node?.state).toMatchObject({
      src: SRC,
      ratio: "16:9",
      fit: "cover",
      status: "loading",
    });
    expect(node?.parts.map((part) => [part.part, part.label])).toEqual([
      ["caption", "Pad 39B, T-minus 4h"],
    ]);
  });
});
