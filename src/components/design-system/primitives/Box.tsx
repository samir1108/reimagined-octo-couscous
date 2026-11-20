"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { motion, type MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type BoxConflicts = "style" | "transform" | "transition" | "children" | "onDrag" | "onDragStart" | "onDragEnd" | "onDragEnter" | "onDragExit" | "onDragLeave" | "onDragOver" | "onDrop" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration";

export interface BoxProps extends Omit<HTMLAttributes<HTMLDivElement>, BoxConflicts>, Omit<MotionProps, BoxConflicts> {
  as?: keyof JSX.IntrinsicElements;
  p?: number | string;
  px?: number | string;
  py?: number | string;
  pt?: number | string;
  pb?: number | string;
  pl?: number | string;
  pr?: number | string;
  m?: number | string;
  mx?: number | string;
  my?: number | string;
  mt?: number | string;
  mb?: number | string;
  ml?: number | string;
  mr?: number | string;
  w?: number | string;
  h?: number | string;
  minW?: number | string;
  maxW?: number | string;
  minH?: number | string;
  maxH?: number | string;
  flex?: number | string;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | string;
  display?: "flex" | "grid" | "block" | "inline-block" | "inline-flex" | "none";
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline";
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";
  flexDirection?: "row" | "col" | "row-reverse" | "col-reverse";
  flexWrap?: "wrap" | "nowrap" | "wrap-reverse";
  gap?: number | string;
  overflow?: "auto" | "hidden" | "visible" | "scroll";
  position?: "relative" | "absolute" | "fixed" | "sticky";
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  zIndex?: number | string;
  borderRadius?: number | string;
  border?: string;
  borderColor?: string;
  bg?: string;
  opacity?: number;
  transform?: string;
  transition?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
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

export const Box = forwardRef<HTMLDivElement, BoxProps>(
  (
    {
      as: Component = "div",
      p, px, py, pt, pb, pl, pr,
      m, mx, my, mt, mb, ml, mr,
      w, h, minW, maxW, minH, maxH,
      flex, flexGrow, flexShrink, flexBasis,
      display = "flex",
      alignItems, justifyContent, flexDirection, flexWrap, gap,
      overflow, position, top, right, bottom, left, zIndex,
      borderRadius, border, borderColor, bg, opacity, transform, transition,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const computedStyle: React.CSSProperties = {
      ...style,
      display,
      alignItems,
      justifyContent,
      flexDirection: flexDirection as React.CSSProperties["flexDirection"],
      flexWrap,
      gap: gap ? mapSpace(gap) : undefined,
      padding: p ? mapSpace(p) : undefined,
      paddingLeft: pl ? mapSpace(pl) : px ? mapSpace(px) : undefined,
      paddingRight: pr ? mapSpace(pr) : px ? mapSpace(px) : undefined,
      paddingTop: pt ? mapSpace(pt) : py ? mapSpace(py) : undefined,
      paddingBottom: pb ? mapSpace(pb) : py ? mapSpace(py) : undefined,
      margin: m ? mapSpace(m) : undefined,
      marginLeft: ml ? mapSpace(ml) : mx ? mapSpace(mx) : undefined,
      marginRight: mr ? mapSpace(mr) : mx ? mapSpace(mx) : undefined,
      marginTop: mt ? mapSpace(mt) : my ? mapSpace(my) : undefined,
      marginBottom: mb ? mapSpace(mb) : my ? mapSpace(my) : undefined,
      width: w ? (typeof w === "number" ? `${w}px` : w) : undefined,
      height: h ? (typeof h === "number" ? `${h}px` : h) : undefined,
      minWidth: minW ? (typeof minW === "number" ? `${minW}px` : minW) : undefined,
      maxWidth: maxW ? (typeof maxW === "number" ? `${maxW}px` : maxW) : undefined,
      minHeight: minH ? (typeof minH === "number" ? `${minH}px` : minH) : undefined,
      maxHeight: maxH ? (typeof maxH === "number" ? `${maxH}px` : maxH) : undefined,
      flex: flex ? (typeof flex === "number" ? `0 0 ${flex}%` : flex) : undefined,
      flexGrow,
      flexShrink,
      flexBasis: flexBasis ? (typeof flexBasis === "number" ? `${flexBasis}px` : flexBasis) : undefined,
      overflow,
      position,
      top: top ? (typeof top === "number" ? `${top}px` : top) : undefined,
      right: right ? (typeof right === "number" ? `${right}px` : right) : undefined,
      bottom: bottom ? (typeof bottom === "number" ? `${bottom}px` : bottom) : undefined,
      left: left ? (typeof left === "number" ? `${left}px` : left) : undefined,
      zIndex,
      borderRadius: borderRadius ? (typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius) : undefined,
      border,
      borderColor,
      background: bg,
      opacity,
      transform,
      transition,
    };

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        style={computedStyle}
        {...props}
      />
    );
  }
);

Box.displayName = "Box";