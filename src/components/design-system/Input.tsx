import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, leadingIcon, trailingIcon, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-label text-muted mb-2 font-medium"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leadingIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              {leadingIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-surface border border-border text-primary placeholder:text-muted",
              "rounded-lg px-4 py-3 text-body",
              "transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
              "focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "hover:border-primary-gold/30",
              leadingIcon && "pl-10",
              trailingIcon && "pr-10",
              error && "border-error focus:ring-error",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {trailingIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              {trailingIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-2 text-caption text-error" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-2 text-caption text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-label text-muted mb-2 font-medium"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full bg-surface border border-border text-primary placeholder:text-muted",
            "rounded-xl px-4 py-3 text-body resize-none min-h-[100px]",
            "transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "hover:border-primary-gold/30",
            error && "border-error focus:ring-error",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-2 text-caption text-error" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="mt-2 text-caption text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";