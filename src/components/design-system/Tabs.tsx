"use client";

import { useState, type ReactNode, useRef, useEffect, useCallback, createContext, useContext, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TabsProps {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  variant?: "default" | "underline" | "pills" | "segmented" | "glass";
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
  className?: string;
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  className?: string;
}

const TabsContext = createContext<{
  value: string;
  onChange: (value: string) => void;
  variant: string;
  orientation: string;
} | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

export function Tabs({
  children,
  defaultValue,
  value: controlledValue,
  onChange,
  variant = "default",
  orientation = "horizontal",
  className,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || "");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleChange = useCallback(
    (newValue: string) => {
      if (!isControlled) setUncontrolledValue(newValue);
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  return (
    <TabsContext.Provider value={{ value, onChange: handleChange, variant, orientation }}>
      <div className={cn("flex flex-col", orientation === "horizontal" ? "w-full" : "", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className, ...props }, ref) => {
    const { variant, orientation } = useTabsContext();

    const baseStyles = "inline-flex items-center gap-1";
    const variantStyles = {
      default: "bg-elevated-surface rounded-xl p-1 glass-subtle",
      underline: "border-b border-border pb-1",
      pills: "gap-2",
      segmented: "bg-elevated-surface rounded-xl p-1 glass-subtle",
      glass: "glass rounded-xl p-1",
    };

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
);

TabsList.displayName = "TabsList";

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, disabled, className, children, ...props }, ref) => {
    const { value: currentValue, onChange, variant, orientation } = useTabsContext();
    const isActive = currentValue === value;

    const baseStyles = "relative flex items-center justify-center font-interface font-medium transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:opacity-40 disabled:cursor-not-allowed select-none whitespace-nowrap";

    const variantStyles = {
      default: isActive
        ? "bg-primary-gold text-void rounded-lg shadow-[0_2px_8px_rgba(214,180,106,0.3)]"
        : "text-secondary hover:text-primary hover:bg-elevated-surface rounded-lg",
      underline: isActive
        ? "text-primary-gold border-b-2 border-primary-gold pb-1"
        : "text-secondary hover:text-primary border-b-2 border-transparent pb-1",
      pills: isActive
        ? "bg-primary-gold text-void rounded-lg shadow-[0_2px_8px_rgba(214,180,106,0.3)] px-4 py-2"
        : "text-secondary hover:text-primary hover:bg-elevated-surface rounded-lg px-4 py-2",
      segmented: isActive
        ? "bg-primary-gold text-void rounded-lg shadow-[0_2px_8px_rgba(214,180,106,0.3)]"
        : "text-secondary hover:text-primary hover:bg-elevated-surface rounded-lg",
      glass: isActive
        ? "glass-gold text-primary-gold rounded-lg"
        : "glass text-secondary hover:text-primary rounded-lg",
    };

    const orientationStyles = orientation === "vertical" ? "w-full justify-start" : "";

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        aria-controls={`tabs-content-${value}`}
        id={`tabs-trigger-${value}`}
        tabIndex={isActive ? 0 : -1}
        className={cn(baseStyles, variantStyles[variant], orientationStyles, className)}
        onClick={() => !disabled && onChange(value)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
);

TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, children, ...props }, ref) => {
    const { value: currentValue } = useTabsContext();
    const isActive = currentValue === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`tabs-content-${value}`}
        aria-labelledby={`tabs-trigger-${value}`}
        className={cn("animate-in fade-in-0 duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
);

TabsContent.displayName = "TabsContent";