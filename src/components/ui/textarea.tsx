import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[88px] w-full rounded-lg border border-border/70 bg-background/55 px-3.5 py-2.5 text-sm leading-relaxed shadow-[inset_0_1px_2px_hsl(0_0%_0%/0.06)] transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-muted-foreground/70 hover:border-border focus-visible:border-primary/60 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
