"use client";

import React, { forwardRef, type HTMLAttributes } from "react";
import { motion, type MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Box, type BoxProps } from "./Box";

export interface GridProps extends Omit<BoxProps, "children" | "as" | "display" | "alignItems" | "justifyContent" | "flexDirection" | "flexWrap" | "gap"> {
  columns?: number | string;
  rows?: number | string;
  gap?: number | string;
  rowGap?: number | string;
  colGap?: number | string;
  templateColumns?: string;
  templateRows?: string;
  autoFlow?: "row" | "column" | "dense" | "row dense" | "column dense";
  children: React.ReactNode;
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

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      columns,
      rows,
      gap,
      rowGap,
      colGap,
      templateColumns,
      templateRows,
      autoFlow,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const computedStyle: React.CSSProperties = {
      ...style,
      display: "grid",
      gridTemplateColumns: templateColumns || (columns ? `repeat(${columns}, 1fr)` : undefined),
      gridTemplateRows: templateRows || (rows ? `repeat(${rows}, 1fr)` : undefined),
      gap: gap ? mapSpace(gap) : undefined,
      rowGap: rowGap ? mapSpace(rowGap) : undefined,
      columnGap: colGap ? mapSpace(colGap) : undefined,
      gridAutoFlow: autoFlow,
    };

    return (
      <Box
        ref={ref}
        className={cn(className)}
        style={computedStyle}
        {...(props as any)}
      >
        {children}
      </Box>
    );
  }
);

Grid.displayName = "Grid";