// Local design-system barrel.
// Merges the app primitives (Box/Stack/Grid/Container/Text/Icon/Orb) with the
// shared design-system components (Heading/Card/Button) and the shadcn ui
// primitives used by landing pages (Badge/Progress). Components that only ever
// existed in one of the two trees are re-exported explicitly so imports from
// "@/components/design-system" keep working.
export { Box, type BoxProps } from "./primitives/Box";
export { Stack, type StackProps } from "./primitives/Stack";
export { Grid, type GridProps } from "./primitives/Grid";
export { Container, type ContainerProps } from "./primitives/Container";
export { Text, type TextProps } from "./primitives/Text";
export { Icon, type IconProps, type IconName, type IconSize, type IconColor } from "./primitives/Icon";
export { Orb, HeroOrb } from "./Orb";
export { CircularProgress, ArcProgress, type CircularProgressProps, type ArcProgressProps } from "./ProgressRing";
export { ThemeProvider } from "./theme/ThemeProvider";
export { AIProvider } from "./ai/AIProvider";

export {
  Surface,
  surfaceVariants,
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  buttonVariants,
  Heading,
  headingVariants,
  Eyebrow,
  eyebrowVariants,
  Body,
  bodyVariants,
  Caption,
  captionVariants,
} from "@/design-system/primitives";

export { Badge, badgeVariants, type BadgeProps } from "@/components/ui/badge";
export { Progress } from "@/components/ui/progress";

