import ReactMarkdown from "react-markdown";
import { useMemo } from "react";
import { parseWidgetTags, renderWidget, type WidgetResult } from "./index";

interface Props {
  content: string;
  /** Stable key for this message — used to track widget completion state. */
  messageId: string | number;
  /** Called when a widget reports completion or skip. */
  onWidgetEvent: (messageId: string | number, result: WidgetResult | null, raw: string) => void;
  /** Already-completed widget raw tags for this message (so re-renders stay frozen). */
  completedRaws?: Set<string>;
  /** True while the assistant message is still streaming — defer rendering widgets
   *  until the closing ]] arrives so we don't mount half-parsed specs. */
  isStreaming?: boolean;
}

const PROSE_CLASSES = `prose prose-sm dark:prose-invert max-w-none text-sm font-body leading-relaxed
  prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5
  prose-headings:text-foreground prose-headings:font-display
  prose-strong:text-primary prose-em:text-primary/80
  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
  prose-code:text-primary/90 prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded`;

/** Render an assistant message as interleaved markdown text + inline widgets. */
export function GuideMessageBlocks({ content, messageId, onWidgetEvent, completedRaws, isStreaming }: Props) {
  // While streaming, hide any *unclosed* widget tag (rare partial like "[[widget:wit").
  const safeContent = useMemo(() => {
    if (!isStreaming) return content;
    const lastOpen = content.lastIndexOf("[[widget:");
    if (lastOpen === -1) return content;
    const after = content.slice(lastOpen);
    if (!after.includes("]]")) return content.slice(0, lastOpen);
    return content;
  }, [content, isStreaming]);

  const blocks = useMemo(() => parseWidgetTags(safeContent), [safeContent]);

  return (
    <div className={PROSE_CLASSES}>
      {blocks.map((b, i) => {
        if (b.kind === "text") {
          if (!b.text.trim()) return null;
          return <ReactMarkdown key={i}>{b.text}</ReactMarkdown>;
        }
        const isDone = completedRaws?.has(b.raw) ?? false;
        return (
          <div key={`${i}-${b.raw}`} className="not-prose">
            {renderWidget(b.spec, {
              done: isDone,
              onComplete: (r) => onWidgetEvent(messageId, r, b.raw),
              onSkip: () => onWidgetEvent(messageId, null, b.raw),
            })}
          </div>
        );
      })}
    </div>
  );
}
