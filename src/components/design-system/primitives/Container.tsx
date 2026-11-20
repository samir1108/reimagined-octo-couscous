"use client";

import React, { forwardRef, type HTMLAttributes } from "react";
import { motion, type MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Box, type BoxProps } from "./Box";

export interface ContainerProps extends Omit<BoxProps, "children" | "as" | "display" | "alignItems" | "justifyContent" | "flexDirection" | "flexWrap" | "gap"> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg" | "xl" | "responsive";
  children: React.ReactNode;
}

const sizeMap = {
  xs: "var(--container-xs)",
  sm: "var(--container-sm)",
  md: "var(--container-md)",
  lg: "var(--container-lg)",
  xl: "var(--container-xl)",
  "2xl": "var(--container-2xl)",
  full: "100%",
};

const paddingMap = {
  none: "0",
  sm: "var(--space-4)",
  md: "var(--space-6)",
  lg: "var(--space-8)",
  xl: "var(--space-12)",
  responsive: "var(--pad)",
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      size = "xl",
      padding = "responsive",
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <Box
        ref={ref}
        display="block"
        w="100%"
        maxW={sizeMap[size]}
        mx="auto"
        px={paddingMap[padding]}
        className={cn(className)}
        style={style}
        {...(props as any)}
      >
        {children}
      </Box>
    );
  }
);

Container.displayName = "Container";