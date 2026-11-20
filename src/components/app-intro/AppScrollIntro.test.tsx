import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MotionGlobalConfig } from "framer-motion";
import AppScrollIntro from "./AppScrollIntro";
import { SATYUG_INTRO } from "./satyugSections";

// Narration is covered by useStepNarration's own behavior; here we only need
// to know it is mounted, not to fire real TTS requests.
vi.mock("@/hooks/useStepNarration", () => ({ useStepNarration: vi.fn() }));

// jsdom lacks IntersectionObserver, which framer-motion's whileInView needs.
class IOStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IOStub;

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});

const props = { ...SATYUG_INTRO, onEnter: vi.fn() };

describe("AppScrollIntro", () => {
  it("renders the hero, every chapter and the outro CTA", () => {
    render(<AppScrollIntro {...props} />);
    expect(screen.getByText(/meets you where you are/i)).toBeInTheDocument();
    for (const section of SATYUG_INTRO.sections) {
      expect(screen.getByText(section.title)).toBeInTheDocument();
      // Only the first beat is mounted at scroll top; later beats swap in on scroll.
      // The heading also shows inside the phone placeholder screen.
      expect(screen.getAllByText(section.beats[0].heading).length).toBeGreaterThan(0);
    }
    expect(screen.getByRole("button", { name: /Enter the Temple/i })).toBeInTheDocument();
  });

  it("renders one rail jump button per section", () => {
    render(<AppScrollIntro {...props} />);
    const rail = screen.getByRole("navigation", { name: /tour sections/i });
    expect(rail.querySelectorAll("button")).toHaveLength(SATYUG_INTRO.sections.length);
  });

  it("renders desktop + mobile pairs, placeholders until captures are published", () => {
    const { container } = render(<AppScrollIntro {...props} />);
    // Only each section's first beat is mounted at scroll top.
    const firstBeats = SATYUG_INTRO.sections.map((s) => s.beats[0]);
    const pairs = firstBeats.filter((b) => b.pair);
    expect(pairs.length).toBeGreaterThan(0);
    // The pair points at the publish destination; until `npm run capture:publish`
    // creates the files, the labelled placeholders show through underneath.
    expect(
      container.querySelector('img[src="/app-captures/11-temple-desktop.png"]'),
    ).not.toBeNull();
    expect(screen.getAllByText("desktop capture").length).toBeGreaterThan(0);
    expect(screen.getAllByText("mobile").length).toBeGreaterThan(0);
  });

  it("renders both images when a pair's captures are published", () => {
    const cfg = {
      sections: [
        {
          id: "t",
          kicker: "The Temple",
          title: "T",
          beats: [
            {
              heading: "H",
              body: "B",
              narration: "N",
              pair: {
                desktop: { src: "/app-captures/x-desktop.png", alt: "d" },
                mobile: { src: "/app-captures/x-mobile.png", alt: "m" },
              },
            },
          ],
        },
      ],
      outro: { title: "O", cta: "Enter" },
    };
    const { container } = render(<AppScrollIntro {...cfg} onEnter={() => {}} />);
    expect(container.querySelector('img[src="/app-captures/x-desktop.png"]')).not.toBeNull();
    expect(container.querySelector('img[src="/app-captures/x-mobile.png"]')).not.toBeNull();
  });

  it("voice toggle flips aria-pressed and persists the preference", () => {
    localStorage.removeItem("app-intro-voice");
    render(<AppScrollIntro {...props} />);
    const toggle = screen.getByRole("button", { name: /^Voice/ });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(localStorage.getItem("app-intro-voice")).toBe("1");
  });

  it("skip calls onEnter", () => {
    const onEnter = vi.fn();
    render(<AppScrollIntro {...props} onEnter={onEnter} />);
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(onEnter).toHaveBeenCalledTimes(1);
  });
});
