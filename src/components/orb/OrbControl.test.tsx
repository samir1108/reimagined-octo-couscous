import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import OrbControl from "./OrbControl";

function renderOrb(props: Partial<Parameters<typeof OrbControl>[0]> = {}) {
  const utils = render(
    <OrbControl {...props}>
      {(state) => (
        <div data-testid="orb-state" data-charge={state.charge} data-holding={String(state.holding)} />
      )}
    </OrbControl>,
  );
  const el = utils.container.firstChild as HTMLElement;
  return { ...utils, el };
}

describe("OrbControl", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame", "performance", "Date"],
    });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("exposes an accessible button surface", () => {
    const { el } = renderOrb();
    expect(el.getAttribute("role")).toBe("button");
    expect(el.getAttribute("tabindex")).toBe("0");
    expect(el.getAttribute("aria-label")).toBeTruthy();
  });

  it("fires onActivate on a quick tap", () => {
    const onActivate = vi.fn();
    const { el } = renderOrb({ onActivate });
    fireEvent.pointerDown(el);
    act(() => { vi.advanceTimersByTime(60); });
    fireEvent.pointerUp(el);
    act(() => { vi.advanceTimersByTime(400); });
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("fires onHold when the charge completes and suppresses the tap", () => {
    const onHold = vi.fn();
    const onActivate = vi.fn();
    const { el } = renderOrb({ onHold, onActivate });
    fireEvent.pointerDown(el);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onHold).toHaveBeenCalledTimes(1);
    fireEvent.pointerUp(el);
    act(() => { vi.advanceTimersByTime(500); });
    expect(onActivate).not.toHaveBeenCalled();
    expect(onHold).toHaveBeenCalledTimes(1);
  });

  it("rises the charge while holding and releases it after", () => {
    const { el, getByTestId } = renderOrb();
    fireEvent.pointerDown(el);
    act(() => { vi.advanceTimersByTime(450); });
    const mid = parseFloat(getByTestId("orb-state").getAttribute("data-charge") || "0");
    expect(mid).toBeGreaterThan(0.3);
    expect(mid).toBeLessThan(1);
    fireEvent.pointerUp(el);
    act(() => { vi.advanceTimersByTime(50); });
    expect(getByTestId("orb-state").getAttribute("data-charge")).toBe("0");
  });

  it("fires onDouble for two quick taps and not onActivate", () => {
    const onActivate = vi.fn();
    const onDouble = vi.fn();
    const { el } = renderOrb({ onActivate, onDouble });
    for (let i = 0; i < 2; i++) {
      fireEvent.pointerDown(el);
      act(() => { vi.advanceTimersByTime(60); });
      fireEvent.pointerUp(el);
      act(() => { vi.advanceTimersByTime(120); });
    }
    act(() => { vi.advanceTimersByTime(400); });
    expect(onDouble).toHaveBeenCalledTimes(1);
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("fires onTriple for three quick taps", () => {
    const onActivate = vi.fn();
    const onDouble = vi.fn();
    const onTriple = vi.fn();
    const { el } = renderOrb({ onActivate, onDouble, onTriple });
    for (let i = 0; i < 3; i++) {
      fireEvent.pointerDown(el);
      act(() => { vi.advanceTimersByTime(60); });
      fireEvent.pointerUp(el);
      act(() => { vi.advanceTimersByTime(120); });
    }
    act(() => { vi.advanceTimersByTime(400); });
    expect(onTriple).toHaveBeenCalledTimes(1);
    expect(onDouble).not.toHaveBeenCalled();
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("fires onActivate from the keyboard (Enter and Space)", () => {
    const onActivate = vi.fn();
    const { el } = renderOrb({ onActivate });
    fireEvent.keyDown(el, { key: "Enter" });
    fireEvent.keyDown(el, { key: " " });
    expect(onActivate).toHaveBeenCalledTimes(2);
  });

  it("cancels an incomplete hold without firing anything", () => {
    const onActivate = vi.fn();
    const onHold = vi.fn();
    const { el } = renderOrb({ onActivate, onHold });
    fireEvent.pointerDown(el);
    act(() => { vi.advanceTimersByTime(300); });
    fireEvent.pointerLeave(el);
    act(() => { vi.advanceTimersByTime(500); });
    fireEvent.pointerUp(el);
    act(() => { vi.advanceTimersByTime(500); });
    expect(onHold).not.toHaveBeenCalled();
    expect(onActivate).not.toHaveBeenCalled();
  });
});
