import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { Avatar, initialsOf } from "./Avatar.tsx";

describe("Avatar", () => {
  it("takes first and last initials", () => {
    expect(initialsOf("ada okafor")).toBe("AO");
    expect(initialsOf("Sister Mary-Jo Amaral")).toBe("SA");
    expect(initialsOf("Lind")).toBe("L");
    expect(initialsOf("  ")).toBe("");
  });

  it("shows a photo named by the person", () => {
    render(<Avatar name="Ada Okafor" src="/ada.png" />);
    const avatar = screen.getByRole("img", { name: "Ada Okafor" });
    expect(avatar).toHaveAttribute("data-sprint-photo", "");
    expect(avatar.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("falls back to initials when the photo fails", () => {
    render(<Avatar name="Ada Okafor" src="/missing.png" />);
    const avatar = screen.getByRole("img", { name: "Ada Okafor" });
    fireEvent.error(avatar.querySelector("img") as HTMLImageElement);
    expect(avatar).not.toHaveAttribute("data-sprint-photo");
    expect(avatar).toHaveTextContent("AO");
  });

  it("is silent when decorative", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Avatar name="Ada Okafor" decorative />
        <Avatar name="Brother Lind" />
      </SprintProvider>,
    );
    expect(container.textContent).not.toContain("Ada Okafor");
    expect(container.textContent).toContain('- **Avatar** "Brother Lind"');
  });
});
