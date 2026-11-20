"use client";

import { forwardRef, SVGAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Lucide icons (tree-shakable)
import {
  // Navigation
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Menu, X, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  
  // Actions
  Play, Pause, SkipForward, SkipBack, RotateCcw, RefreshCw,
  Heart, Bookmark, Share, Download, Settings, Search,
  Plus, Minus, Check, CheckCircle, AlertCircle, Info, HelpCircle,
  
  // States
  Sun, Moon, Flame, Sparkles, Zap, Leaf, Brain, HeartPulse,
  Eye, EyeOff, Shield, Lock, Unlock, Key, Fingerprint,
  
  // Time
  Clock, Timer, Hourglass, Calendar, CalendarDays,
  
  // Social
  Users, UserPlus, UserMinus, MessageSquare, MessageCircle,
  Gift, Award, Trophy, Medal,
  
  // Media
  Volume2, VolumeX, Mic, MicOff, Headphones, Music,
  
  // Layout
  Grid, List, Columns, Rows, Maximize, Minimize,
  
  // File
  FileText, FileAudio, FileVideo, Image, Folder, FolderOpen,
  
  // Arrows
  ExternalLink, Link, Link2, Unlink,
  
  // Editing
  Edit, Edit2, Edit3, Trash, Trash2, Copy, CopyCheck,
  
  // System
  Home, Menu as MenuIcon, MoreHorizontal, MoreVertical,
  ChevronsLeft, ChevronsRight, ChevronsUp, ChevronsDown,
} from "lucide-react";

// InternalLink is not in lucide-react, create a custom component
const InternalLink = forwardRef<SVGSVGElement, SVGAttributes<SVGSVGElement>>((props, ref) => (
  <svg ref={ref} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
));
InternalLink.displayName = "InternalLink";

export type LucideIconName = 
  | "ChevronLeft" | "ChevronRight" | "ChevronUp" | "ChevronDown"
  | "Menu" | "X" | "ArrowRight" | "ArrowLeft" | "ArrowUp" | "ArrowDown"
  | "Play" | "Pause" | "SkipForward" | "SkipBack" | "RotateCcw" | "RefreshCw"
  | "Heart" | "Bookmark" | "Share" | "Download" | "Settings" | "Search"
  | "Plus" | "Minus" | "Check" | "CheckCircle" | "AlertCircle" | "Info" | "HelpCircle"
  | "Sun" | "Moon" | "Flame" | "Sparkles" | "Zap" | "Leaf" | "Brain" | "HeartPulse"
  | "Eye" | "EyeOff" | "Shield" | "Lock" | "Unlock" | "Key" | "Fingerprint"
  | "Clock" | "Timer" | "Hourglass" | "Calendar" | "CalendarDays"
  | "Users" | "UserPlus" | "UserMinus" | "MessageSquare" | "MessageCircle"
  | "Gift" | "Award" | "Trophy" | "Medal"
  | "Volume2" | "VolumeX" | "Mic" | "MicOff" | "Headphones" | "Music"
  | "Grid" | "List" | "Columns" | "Rows" | "Maximize" | "Minimize"
  | "FileText" | "FileAudio" | "FileVideo" | "Image" | "Folder" | "FolderOpen"
  | "ExternalLink" | "InternalLink" | "Link" | "Link2" | "Unlink"
  | "Edit" | "Edit2" | "Edit3" | "Trash" | "Trash2" | "Copy" | "CopyCheck"
  | "Home" | "Menu" | "MoreHorizontal" | "MoreVertical"
  | "ChevronsLeft" | "ChevronsRight" | "ChevronsUp" | "ChevronsDown"
  | "InternalLink";

const lucideIcons: Record<LucideIconName, React.ComponentType<SVGAttributes<SVGSVGElement>>> = {
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Menu, X, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Play, Pause, SkipForward, SkipBack, RotateCcw, RefreshCw,
  Heart, Bookmark, Share, Download, Settings, Search,
  Plus, Minus, Check, CheckCircle, AlertCircle, Info, HelpCircle,
  Sun, Moon, Flame, Sparkles, Zap, Leaf, Brain, HeartPulse,
  Eye, EyeOff, Shield, Lock, Unlock, Key, Fingerprint,
  Clock, Timer, Hourglass, Calendar, CalendarDays,
  Users, UserPlus, UserMinus, MessageSquare, MessageCircle,
  Gift, Award, Trophy, Medal,
  Volume2, VolumeX, Mic, MicOff, Headphones, Music,
  Grid, List, Columns, Rows, Maximize, Minimize,
  FileText, FileAudio, FileVideo, Image, Folder, FolderOpen,
  ExternalLink, Link, Link2, Unlink,
  Edit, Edit2, Edit3, Trash, Trash2, Copy, CopyCheck,
  Home, MoreHorizontal, MoreVertical,
  ChevronsLeft, ChevronsRight, ChevronsUp, ChevronsDown,
  InternalLink,
};

// Placeholder components for custom icons
const Target = forwardRef<SVGSVGElement, SVGAttributes<SVGSVGElement>>((props, ref) => (
  <svg ref={ref} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
));
Target.displayName = "Target";

const Sliders = forwardRef<SVGSVGElement, SVGAttributes<SVGSVGElement>>((props, ref) => (
  <svg ref={ref} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
));
Sliders.displayName = "Sliders";

const User = forwardRef<SVGSVGElement, SVGAttributes<SVGSVGElement>>((props, ref) => (
  <svg ref={ref} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
));
User.displayName = "User";

const Seed = forwardRef<SVGSVGElement, SVGAttributes<SVGSVGElement>>((props, ref) => (
  <svg ref={ref} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
    <path d="M12 6v6l4 2" />
  </svg>
));
Seed.displayName = "Seed";

// Consciousness mode icons (custom - using lucide as placeholders)
const modeIcons = {
  observation: Eye,
  inquiry: HelpCircle,
  meditation: Brain,
  healing: HeartPulse,
  focus: Target,
  shadow: Moon,
  sleep: Moon,
  awakening: Sun,
  integration: Leaf,
};

// Ritual icons
const ritualIcons = {
  duration: Clock,
  reflect: Pause,
  voice: MessageSquare,
  intensity: Sliders,
  posture: User,
  practice: Play,
  precaution: AlertCircle,
  sankalpa: Seed,
  harvest: Leaf,
  blessing: Heart,
};

export type IconName = LucideIconName | keyof typeof modeIcons | keyof typeof ritualIcons;
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type IconColor = 
  | "primary" | "secondary" | "muted" | "faint" | "inverse" | "gold"
  | "observation" | "inquiry" | "meditation" | "healing" | "focus" | "shadow" | "sleep" | "awakening" | "integration";

const sizeStyles: Record<IconSize, string> = {
  xs: "w-4 h-4",
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-7 h-7",
  xl: "w-8 h-8",
  "2xl": "w-10 h-10",
};

const colorStyles: Record<IconColor, string> = {
  primary: "text-[var(--text-primary)]",
  secondary: "text-[var(--text-secondary)]",
  muted: "text-[var(--text-muted)]",
  faint: "text-[var(--text-faint)]",
  inverse: "text-[var(--text-inverse)]",
  gold: "text-[var(--text-gold)]",
  observation: "text-[var(--mode-observation-text)]",
  inquiry: "text-[var(--mode-inquiry-text)]",
  meditation: "text-[var(--mode-meditation-text)]",
  healing: "text-[var(--mode-healing-text)]",
  focus: "text-[var(--mode-focus-text)]",
  shadow: "text-[var(--mode-shadow-text)]",
  sleep: "text-[var(--mode-sleep-text)]",
  awakening: "text-[var(--mode-awakening-text)]",
  integration: "text-[var(--mode-integration-text)]",
};

const strokeWidthStyles = {
  1: "stroke-[1]",
  1.5: "stroke-[1.5]",
  2: "stroke-[2]",
  2.5: "stroke-[2.5]",
};

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, "color" | "size"> {
  name: IconName | (string & {});
  size?: IconSize;
  color?: IconColor;
  strokeWidth?: 1 | 1.5 | 2 | 2.5;
  animated?: "breathe" | "pulse" | "spin" | "float";
  className?: string;
}

const Icon = forwardRef<SVGSVGElement, IconProps>(
  (
    {
      name,
      size = "md",
      color = "primary",
      strokeWidth = 1.5,
      animated,
      className,
      ...rest
    },
    ref
  ) => {
    let IconComponent: React.ComponentType<SVGAttributes<SVGSVGElement>> | undefined;
    
    if (name in lucideIcons) {
      IconComponent = lucideIcons[name as LucideIconName];
    } else if (name in modeIcons) {
      IconComponent = modeIcons[name as keyof typeof modeIcons];
    } else if (name in ritualIcons) {
      IconComponent = ritualIcons[name as keyof typeof ritualIcons];
    }

    if (!IconComponent) {
      console.warn(`Icon "${name}" not found`);
      IconComponent = HelpCircle;
    }

    const animationClasses = animated
      ? animated === "breathe" && "animate-breathe"
        || animated === "pulse" && "animate-pulse-glow"
        || animated === "spin" && "animate-spin-slow"
        || animated === "float" && "animate-float"
      : "";

    const Comp: any = IconComponent;

    return (
      <Comp
        ref={ref}
        className={cn(
          sizeStyles[size],
          colorStyles[color],
          strokeWidthStyles[strokeWidth],
          animationClasses,
          className
        )}
        aria-hidden="true"
        focusable="false"
        {...rest}
      />
    );
  }
);

Icon.displayName = "Icon";

export { Icon };