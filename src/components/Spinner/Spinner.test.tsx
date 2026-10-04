import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { Spinner } from "./Spinner.tsx";

describe("Spinner", () => {
  it("is a status named by its label", () => {
    render(<Spinner label="Saving note" />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Saving note");
    expect(status).toHaveAttribute("data-sprint-loading", "");
    expect(screen.getByText("Saving note")).toHaveAttribute(
      "data-sprint-visually-hidden",
    );
  });

  it("prints the label when asked and publishes a small size", () => {
    render(<Spinner label="Saving note" size="small" showLabel />);
    expect(screen.getByText("Saving note")).not.toHaveAttribute(
      "data-sprint-visually-hidden",
    );
    expect(screen.getByRole("status")).toHaveAttribute("data-sprint-size", "small");
  });

  it("reads as a loading line for agents", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Spinner label="Saving note" />
      </SprintProvider>,
    );
    expect(container.textContent).toContain('- **Spinner** "Saving note" [loading]');
  });
});
