"use client";

import React, { forwardRef, type HTMLAttributes } from "react";
import { motion, type MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Box, type BoxProps } from "./Box";

export interface StackProps extends Omit<BoxProps, "children" | "as" | "display" | "alignItems" | "justifyContent" | "flexDirection" | "flexWrap" | "gap"> {
  direction?: "row" | "col" | "row-reverse" | "col-reverse";
  align?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline";
  justify?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";
  gap?: number | string;
  wrap?: boolean;
  children: React.ReactNode;
  divider?: React.ReactNode;
}

const spaceMap: Record<number | string, string> = {
  0: "0",
  1: "var(--space-1)",
  2: "var(--space-2)",
  3: "var(--space-3)",
  4: "var(--space-4)",
  5: "var(--space-5)",
  6: "var(--space-6)",
  8: "var(--space-8)",
  10: "var(--space-10)",
  12: "var(--space-12)",
  16: "var(--space-16)",
  20: "var(--space-20)",
  24: "var(--space-24)",
  32: "var(--space-32)",
  40: "var(--space-40)",
};

function mapSpace(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const num = typeof value === "string" ? parseInt(value, 10) : value;
  return spaceMap[num] || `${value}px`;
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = "col",
      align = "stretch",
      justify = "flex-start",
      gap = 4,
      wrap = false,
      children,
      divider,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const childrenArray = React.Children.toArray(children).filter(Boolean);
    const childrenWithDividers = childrenArray.flatMap((child, index) => [
      child,
      index < childrenArray.length - 1 && divider ? (
        <Box key={`divider-${index}`} flex="none" />
      ) : null,
    ]).filter(Boolean);

    return (
      <Box
        ref={ref}
        display="flex"
        flexDirection={direction}
        alignItems={align}
        justifyContent={justify}
        flexWrap={wrap ? "wrap" : "nowrap"}
        gap={mapSpace(gap)}
        className={cn(className)}
        style={style}
        {...(props as any)}
      >
        {childrenWithDividers}
      </Box>
    );
  }
);

Stack.displayName = "Stack";