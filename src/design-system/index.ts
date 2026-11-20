/**
 * The single public design-system surface.
 *
 * Every screen imports from "@/design-system" and nothing else. Three trees
 * used to be imported directly (src/design-system, src/components/design-system,
 * src/components/ui); they are unified here:
 *
 *   L0 tokens      — CSS variables, the only theme source
 *   L1 primitives  — Button/Input/Card/Sheet/... (Radix + cva, token-bound)
 *   L2 patterns    — Orb, Text, Icon, progress rings, Sanctuary
 *
 * Deep imports into @/components/ui or @/components/design-system are blocked
 * by ESLint (eslint.config.js) so this stays the only door in.
 */

/* ── L0: tokens ───────────────────────────────────────────────────────── */
export * from "./tokens";

/* ── L1: app-specific primitives (names unique to this tree) ───────────── */
export { Surface, surfaceVariants } from "./primitives/Surface";
export { SectionHeading } from "./primitives/SectionHeading";
export { Container } from "./primitives/Container";
export {
  Heading,
  headingVariants,
  Eyebrow,
  eyebrowVariants,
  Body,
  bodyVariants,
  Caption,
  captionVariants,
} from "./primitives/Typography";

/* ── L2: patterns ─────────────────────────────────────────────────────── */
export * from "./components";

/* ── L1: the component layer (Radix + cva, token-bound) ────────────────── */
export { Button, buttonVariants, type ButtonProps } from "@/components/ui/button";
export { Textarea, type TextareaProps } from "@/components/ui/textarea";
export { Input } from "@/components/ui/input";
export { Label } from "@/components/ui/label";
export { Badge, badgeVariants, type BadgeProps } from "@/components/ui/badge";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
export { Separator } from "@/components/ui/separator";
export { Skeleton } from "@/components/ui/skeleton";
export { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
export { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
export { Progress, type ProgressProps } from "@/components/ui/progress";
export { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
export { CountUp } from "@/components/ui/CountUp";
export { Placeholder } from "@/components/ui/placeholder";
export { BottomSheet } from "@/components/ui/BottomSheet";

/* overlays */
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
export { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu";

/* controls */
export { Slider } from "@/components/ui/slider";
export { Switch } from "@/components/ui/switch";
export { Checkbox } from "@/components/ui/checkbox";
export { Toggle, toggleVariants } from "@/components/ui/toggle";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "@/components/ui/select";

/* feedback */
export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from "@/components/ui/toast";
export { Toaster } from "@/components/ui/toaster";
export { Toaster as SonnerToaster } from "@/components/ui/sonner";
