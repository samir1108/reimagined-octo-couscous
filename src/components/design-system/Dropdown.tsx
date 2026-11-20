"use client";

import { useState, useRef, useEffect, type ReactNode, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button, IconButton } from "./Button";
import { Portal } from "./Portal";
import { ChevronDown, X } from "lucide-react";

export interface DropdownProps {
  trigger: ReactNode;
  content: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom";
  offset?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnSelect?: boolean;
  className?: string;
}

export function Dropdown({
  trigger,
  content,
  align = "start",
  side = "bottom",
  offset = 4,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  closeOnSelect = true,
  className,
}: DropdownProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) setUncontrolledOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    },
    [setOpen]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  useEffect(() => {
    if (open) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          contentRef.current &&
          !contentRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, setOpen]);

  const alignStyles = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  const sideStyles = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div ref={triggerRef}>{trigger}</div>
      {open && (
        <Portal>
          <div
            ref={contentRef}
            className={cn(
              "fixed z-[var(--z-dropdown)] glass-card w-56 min-w-[200px] max-w-[320px]",
              "rounded-xl shadow-xl border border-glass-border",
              "animate-in fade-in-0 zoom-in-95 duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
              sideStyles[side],
              alignStyles[align]
            )}
            role="menu"
            onKeyDown={handleKeyDown}
          >
            <div className="py-1">{content}</div>
          </div>
        </Portal>
      )}
    </div>
  );
}

export interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelect?: () => void;
  disabled?: boolean;
  dangerous?: boolean;
  icon?: ReactNode;
  shortcut?: string;
}

export function DropdownItem({
  children,
  onSelect,
  disabled,
  dangerous,
  icon,
  shortcut,
  className,
  ...props
}: DropdownItemProps) {
  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === "Enter" || event.key === " ") && !disabled && onSelect) {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      className={cn(
        "flex items-center gap-3 px-4 py-2 text-body text-primary",
        "transition-colors duration-100",
        "focus:outline-none focus:bg-primary-gold/10",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
        dangerous && "text-error focus:bg-error/10",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0 w-5 h-5">{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && <span className="text-caption text-muted font-mono">{shortcut}</span>}
    </div>
  );
}

export interface DropdownSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DropdownSeparator({ className, ...props }: DropdownSeparatorProps) {
  return (
    <div role="separator" className={cn("h-px bg-border my-1", className)} {...props} />
  );
}

export interface DropdownLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DropdownLabel({ children, className, ...props }: DropdownLabelProps) {
  return (
    <div className={cn("px-4 py-2 text-metadata text-muted uppercase tracking-metadata", className)} {...props}>
      {children}
    </div>
  );
}

export interface DropdownTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  "aria-label"?: string;
}

export function DropdownTrigger({ children, "aria-label": ariaLabel, className, ...props }: DropdownTriggerProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("gap-1", className)}
      aria-label={ariaLabel}
      aria-haspopup="true"
      aria-expanded={false}
      {...props}
    >
      {children}
      <ChevronDown className="w-4 h-4 text-muted transition-transform duration-150" />
    </Button>
  );
}