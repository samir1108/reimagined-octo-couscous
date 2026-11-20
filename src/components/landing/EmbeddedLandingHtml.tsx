import { useEffect, useRef } from "react";

const EmbeddedLandingHtml = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    fetch("/consciousos-landing.html")
      .then((r) => r.text())
      .then((html) => {
        if (cancelled || !container) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Drop the hero/join sections so React controls hero placement and pricing can sit above join.
        doc.querySelectorAll("#cos-hero, #cos-join").forEach((n) => n.remove());
        // Drop the standalone nav/footer since the React page already has them.
        doc.querySelectorAll("header#cos-nav, footer#cos-foot").forEach((n) => n.remove());

        // Reorder sections into a narrative flow: everything reads after the
        // hero, from "how it works" through to the FAQ.
        const order = [
          "cos-how","cos-screens","cos-flow","cos-who","cos-spiral",
          "cos-model","cos-engines","cos-lenses","cos-deep","cos-lab",
          "cos-research","cos-trust","cos-orgs","cos-origin","cos-voices",
          "cos-founders","cos-roadmap","cos-faq",
        ];
        const parent = doc.body;
        const nodes = Array.from(parent.children);
        const sections = new Map();
        nodes.forEach((n) => {
          if (n.id && n.id.startsWith("cos-")) sections.set(n.id, n);
        });
        // Remove all section nodes from current positions.
        sections.forEach((n) => n.remove());
        // Re-append in desired order (any non-section content stays first).
        order.forEach((id) => {
          const n = sections.get(id);
          if (n) parent.appendChild(n);
        });
        // Append any remaining sections not in the list.
        sections.forEach((n, id) => {
          if (!order.includes(id)) parent.appendChild(n);
        });

        // Anchor jumps must clear the fixed navbar + section tab bar.
        sections.forEach((n) => {
          if (n instanceof HTMLElement) n.style.scrollMarginTop = "116px";
        });

        // The embedded "join" block is replaced by the React join section at
        // the bottom of the page, so retarget any links that pointed at it.
        doc.querySelectorAll('a[href="#cos-join"]').forEach((a) => {
          a.setAttribute("href", "#join");
        });

        // Move styles into the document head so they apply.
        doc.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => {
          if (node.tagName === "LINK") {
            const l = document.createElement("link");
            l.rel = "stylesheet";
            l.href = node.getAttribute("href") || "";
            document.head.appendChild(l);
          } else {
            const st = document.createElement("style");
            st.textContent = node.textContent || "";
            document.head.appendChild(st);
          }
        });

        // Inject body content.
        container.innerHTML = doc.body.innerHTML;

        // Re-execute inline scripts.
        const scripts = Array.from(doc.querySelectorAll("script"));
        scripts.forEach((old) => {
          const s = document.createElement("script");
          if (old.src) {
            s.src = old.src;
            s.async = false;
          } else {
            s.textContent = old.textContent || "";
          }
          document.body.appendChild(s);
        });

        // Let the section tab bar attach its scroll-spy now that the
        // sections are actually in the DOM.
        window.dispatchEvent(new Event("cos:landing-ready"));
      })
      .catch(() => {
        if (container) container.innerHTML = "";
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", display: "block" }} />;
};

export default EmbeddedLandingHtml;
