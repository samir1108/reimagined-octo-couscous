import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MotionGlobalConfig } from "framer-motion";
import InstallPWI from "./InstallPWA";

type MatchMediaMock = (query: string) => { matches: boolean; media: string };

function setUserAgent(ua: string) {
  Object.defineProperty(window.navigator, "userAgent", {
    value: ua,
    configurable: true,
  });
}

function setMaxTouchPoints(n: number) {
  Object.defineProperty(window.navigator, "maxTouchPoints", {
    value: n,
    configurable: true,
  });
}

function setMatchMedia(matches: boolean) {
  (window.matchMedia as unknown as MatchMediaMock) = ((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  })) as unknown as typeof window.matchMedia;
}

const ANDROID =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";
const IOS_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const DESKTOP =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const originalUA = navigator.userAgent;

// Exit animations complete instantly so AnimatePresence unmounts synchronously.
beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});

beforeEach(() => {
  vi.useFakeTimers();
  setUserAgent(ANDROID);
  setMaxTouchPoints(0);
  setMatchMedia(false);
  delete (window as unknown as { Capacitor?: unknown }).Capacitor;
});

afterEach(() => {
  vi.useRealTimers();
  setUserAgent(originalUA);
});

describe("InstallPWA", () => {
  it("shows the card on mobile when the PWA is not installed", () => {
    render(<InstallPWI />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Add ConsciousOS to your home screen/)).toBeInTheDocument();
  });

  it("stays hidden when already installed (standalone display mode)", () => {
    setMatchMedia(true);
    render(<InstallPWI />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("stays hidden on desktop browsers", () => {
    setUserAgent(DESKTOP);
    render(<InstallPWI />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("stays hidden inside the native (Capacitor) app", () => {
    (window as unknown as { Capacitor?: unknown }).Capacitor = {
      isNativePlatform: () => true,
    };
    render(<InstallPWI />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows iOS Safari share instructions when no native prompt is available", () => {
    setUserAgent(IOS_SAFARI);
    render(<InstallPWI />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Share/)).toBeInTheDocument();
    expect(screen.getByText(/Add to Home Screen/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Install/ })).not.toBeInTheDocument();
  });

  it("shows the native Install button once beforeinstallprompt fires", async () => {
    render(<InstallPWI />);

    const evt = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(evt, {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: "accepted" }),
    });
    const preventDefault = vi.spyOn(evt, "preventDefault");

    act(() => {
      window.dispatchEvent(evt);
      vi.advanceTimersByTime(3000);
    });

    expect(preventDefault).toHaveBeenCalled();
    const button = screen.getByRole("button", { name: /Install/ });
    expect(button).toBeInTheDocument();

    await act(async () => {
      button.click();
    });
    expect((evt as unknown as { prompt: () => Promise<void> }).prompt).toHaveBeenCalled();
  });

  it("hides the card after dismissal for this page session", () => {
    render(<InstallPWI />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    act(() => {
      screen.getByRole("button", { name: "Dismiss" }).click();
    });
    // Let the exit animation run to completion.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
