import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import AutoTranslateRoot from "@/components/AutoTranslateRoot";
import { clearLangCache } from "@/lib/translateCache";
import { segmentText } from "@/lib/textSegments";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getSession: async () => ({ data: { session: null } }) },
  },
}));

vi.mock("@/lib/i18n", () => ({
  getStatic: () => undefined,
  preloadLanguage: async () => ({}),
}));

/** Every requested string comes back prefixed so we can see what was sent. */
function mockTranslateFetch() {
  const calls: string[][] = [];
  const fn = vi.fn(async (_url: string, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? "{}"));
    const strings: string[] = Array.isArray(body.strings) ? body.strings : [];
    calls.push(strings);
    return {
      ok: true,
      json: async () => ({ translations: strings.map((s) => `HI:${s}`) }),
    } as Response;
  });
  vi.stubGlobal("fetch", fn);
  return calls;
}

beforeEach(() => {
  clearLangCache("hi");
  window.requestIdleCallback = ((cb: IdleRequestCallback) => {
    return window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 0);
  }) as unknown as typeof window.requestIdleCallback;
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("AutoTranslateRoot", () => {
  it("translates text, placeholders and select options", async () => {
    mockTranslateFetch();
    const { container } = render(
      <div>
        <AutoTranslateRoot language="hi" />
        <p>Start your practice</p>
        <input placeholder="Search sessions" />
        <select defaultValue="1">
          <option value="1">Morning ritual</option>
          <option value="2">Evening wind-down</option>
        </select>
      </div>,
    );

    await waitFor(() => {
      expect(container.querySelector("p")?.textContent).toBe("HI:Start your practice");
      expect(container.querySelector("input")?.getAttribute("placeholder")).toBe(
        "HI:Search sessions",
      );
      const options = Array.from(container.querySelectorAll("option")).map((o) => o.textContent);
      expect(options).toEqual(["HI:Morning ritual", "HI:Evening wind-down"]);
    });
  });

  it("segments long-form paragraphs instead of skipping them", async () => {
    const calls = mockTranslateFetch();
    const sentence = "Breathe in slowly, hold gently, and release with a long exhale. ";
    const longText = sentence.repeat(40).trim();
    expect(segmentText(longText).length).toBeGreaterThan(1);

    const { container } = render(
      <div>
        <AutoTranslateRoot language="hi" />
        <article>{longText}</article>
      </div>,
    );

    await waitFor(() => {
      const text = container.querySelector("article")?.textContent ?? "";
      expect(text.startsWith("HI:")).toBe(true);
      expect(text.match(/HI:/g)?.length ?? 0).toBeGreaterThan(1);
    });

    // The whole paragraph was sent, not dropped for exceeding the length gate.
    const sent = calls.flat();
    expect(sent.join("").length).toBeGreaterThan(1000);
  });

  it("translates attributes on embedded frames", async () => {
    mockTranslateFetch();
    const { container } = render(
      <div>
        <AutoTranslateRoot language="hi" />
        <iframe title="Oversoul orb" srcDoc="<html><body><p>Hold for time</p></body></html>" />
      </div>,
    );

    await waitFor(() => {
      expect(container.querySelector("iframe")?.getAttribute("title")).toBe("HI:Oversoul orb");
    });
  });

  it("restores English when the language is switched back", async () => {
    mockTranslateFetch();
    const ui = (lang: string) => (
      <div>
        <AutoTranslateRoot language={lang} />
        <p>Continue</p>
      </div>
    );

    const { container, rerender } = render(ui("hi"));
    await waitFor(() => {
      expect(container.querySelector("p")?.textContent).toBe("HI:Continue");
    });

    rerender(ui("en"));
    await waitFor(() => {
      expect(container.querySelector("p")?.textContent).toBe("Continue");
    });
  });
});
