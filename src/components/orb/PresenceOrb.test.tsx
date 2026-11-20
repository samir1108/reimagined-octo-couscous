import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitForElementToBeRemoved } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("./WitnessOrbStage", () => ({
  default: () => <div data-testid="witness-orb-stage" />,
}));

vi.mock("@/components/home/TimeAskSheet", () => ({
  TimeAskSheet: ({ open }: { open: boolean }) =>
    open ? <div data-testid="time-ask-sheet" /> : null,
}));

import PresenceOrb from "./PresenceOrb";
import { shouldMountGlobalOrb } from "./presenceRoute";

function renderOrb() {
  return render(
    <MemoryRouter>
      <PresenceOrb />
    </MemoryRouter>,
  );
}

function launcher() {
  return screen.getByRole("button", { name: /witness orb/i });
}

describe("PresenceOrb", () => {
  it("exposes one launcher on the screen", () => {
    renderOrb();
    expect(launcher()).toBeTruthy();
  });

  it("opens the orb overlay with the neti neti reminder", async () => {
    renderOrb();
    fireEvent.keyDown(launcher(), { key: "Enter" });

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(screen.getByText("I am not my mind.")).toBeTruthy();
    expect(await screen.findByTestId("witness-orb-stage")).toBeTruthy();
  });

  it("switches modes from the tab row", async () => {
    renderOrb();
    fireEvent.keyDown(launcher(), { key: "Enter" });
    await screen.findByRole("dialog");

    fireEvent.click(screen.getByRole("button", { name: "Neti neti" }));
    expect(screen.getByText("Neti. Neti.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Self-inquiry" }));
    expect(screen.getByText("Who is aware of this?")).toBeTruthy();
  });

  it("closes from the close control", async () => {
    renderOrb();
    fireEvent.keyDown(launcher(), { key: "Enter" });
    const dialog = await screen.findByRole("dialog");

    fireEvent.click(screen.getByRole("button", { name: /close the witness orb/i }));
    await waitForElementToBeRemoved(dialog, { timeout: 3000 });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens the time-ask card before a sitting", async () => {
    renderOrb();
    fireEvent.keyDown(launcher(), { key: "Enter" });
    await screen.findByRole("dialog");

    fireEvent.click(screen.getByRole("button", { name: "Begin a sitting · choose your time" }));
    expect(await screen.findByTestId("time-ask-sheet")).toBeTruthy();
  });
});

describe("shouldMountGlobalOrb", () => {
  it("leaves the signed-in shell and live sessions alone", () => {
    expect(shouldMountGlobalOrb("/app")).toBe(false);
    expect(shouldMountGlobalOrb("/app/library")).toBe(false);
    expect(shouldMountGlobalOrb("/experience/practices/breath/session")).toBe(false);
    expect(shouldMountGlobalOrb("/app-intro")).toBe(false);
  });

  it("mounts on public screens", () => {
    expect(shouldMountGlobalOrb("/")).toBe(true);
    expect(shouldMountGlobalOrb("/knowledge")).toBe(true);
    expect(shouldMountGlobalOrb("/experience/paths")).toBe(true);
  });
});
