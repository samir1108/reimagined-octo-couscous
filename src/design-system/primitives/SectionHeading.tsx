import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps
  extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow: string;
  title: string;
  subtitle?: string;
  id?: string;
  align?: "left" | "center";
}

const SectionHeading = React.forwardRef<HTMLDivElement, SectionHeadingProps>(
  ({ className, eyebrow, title, subtitle, id, align = "left", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mb-6",
        align === "center" && "text-center",
        className
      )}
      {...props}
    >
      <p className={cn(
        "text-[9px] font-medium uppercase tracking-[0.28em] text-primary/75",
        align === "center" && "mx-auto max-w-2xl"
      )}>
        {eyebrow}
      </p>
      <h2
        id={id}
        className={cn(
          "mt-1.5 text-2xl font-light tracking-wide text-foreground sm:text-3xl",
          "font-editorial",
          align === "center" && "mx-auto max-w-3xl"
        )}
        style={{ fontFamily: "var(--font-editorial)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          "mt-3 max-w-2xl text-sm leading-7 text-muted-foreground",
          align === "center" && "mx-auto"
        )}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  ),
);
SectionHeading.displayName = "SectionHeading";

export { SectionHeading };