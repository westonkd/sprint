import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { Prose } from "./Prose.tsx";

describe("Prose", () => {
  it("is a named region around its content when labelled", () => {
    render(
      <Prose label="Member notes">
        <h2>Background</h2>
        <p>Plays the organ.</p>
      </Prose>,
    );
    const region = screen.getByRole("region", { name: "Member notes" });
    expect(region).toContainElement(
      screen.getByRole("heading", { name: "Background" }),
    );
  });

  it("adds no role without a label", () => {
    render(
      <Prose>
        <p>Plain.</p>
      </Prose>,
    );
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("gives agents the Markdown source when there is one", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Prose label="Notes" source="Plays the **organ**.">
          <p>
            Plays the <strong>organ</strong>.
          </p>
        </Prose>
      </SprintProvider>,
    );
    expect(container.textContent).toContain("Plays the **organ**.");
  });

  it("flattens the content for agents when there is no source", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Prose>
          <p>
            Plays the <strong>organ</strong>.
          </p>
        </Prose>
      </SprintProvider>,
    );
    expect(container.textContent).toContain('"Plays the organ."');
  });
});
