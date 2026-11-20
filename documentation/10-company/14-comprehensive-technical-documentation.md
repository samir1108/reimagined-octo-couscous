    # ConsciousOS Complete Technical Documentation

## Table of Contents

1. [Introduction](#1-introduction)
2. [Project Architecture Overview](#2-project-architecture-overview)
3. [Page Components Documentation](#3-page-components-documentation)
4. [Component Library Documentation](#4-component-library-documentation)
5. [Custom Hooks Documentation](#5-custom-hooks-documentation)
6. [Context Providers Documentation](#6-context-providers-documentation)
7. [Data Files Documentation](#7-data-files-documentation)
8. [Routing and Navigation](#8-routing-and-navigation)
9. [State Management](#9-state-management)
10. [API Integrations](#10-api-integrations)
11. [Authentication System](#11-authentication-system)
12. [Adaptive System Documentation](#12-adaptive-system-documentation)
13. [Gamification System](#13-gamification-system)
14. [Space and Visual Components](#14-space-and-visual-components)
15. [Utilities and Helpers](#15-utilities-and-helpers)
16. [Configuration Files](#16-configuration-files)

---

## 1. Introduction

ConsciousOS is a comprehensive personal growth and mindfulness application built with React, TypeScript, and modern web technologies. The application is designed to guide users through a transformative journey of self-discovery, offering adaptive learning paths, gamification elements, AI-powered insights, and a deeply integrated spiritual development framework.

### 1.1 Purpose and Vision

The ConsciousOS platform aims to provide users with a personalized journey toward greater awareness, emotional intelligence, and inner peace. By combining ancient wisdom traditions with modern technology, the application creates a unique environment where users can explore their consciousness, identify and work through psychological patterns (referred to as "loops"), and develop capacities across multiple life domains.

### 1.2 Technology Stack

The application is built on a modern technology stack that ensures performance, maintainability, and scalability:

- **Frontend Framework**: React 18 with TypeScript for type-safe component development
- **Build Tool**: Vite for fast development and optimized production builds
- **State Management**: React Query (TanStack Query) for server state, React Context for application state
- **Routing**: React Router v6 for client-side navigation
- **Styling**: Tailwind CSS with custom design tokens and shadcn/ui components
- **Animation**: Framer Motion for complex animations and transitions
- **Database**: Supabase for backend services including authentication and data persistence
- **Icons**: Lucide React for consistent iconography

### 1.3 Application Modes

ConsciousOS operates in multiple modes to accommodate different user preferences and journeys:

- **Adaptive Mode**: The primary mode where AI personalizes the daily experience based on user state, patterns, and progress
- **Structured Mode**: A more traditional progression-based system with clear levels and linear advancement
- **Legacy Modes**: Historical modes (game, standard) that have been mapped to the current system for backward compatibility

---

## 2. Project Architecture Overview

### 2.1 Directory Structure

The ConsciousOS project follows a feature-based directory structure that organizes code by functionality rather than type. This approach promotes better code organization and makes it easier to locate and maintain related functionality.

```
consciousos-test/
├── src/
│   ├── assets/           # Static assets including images and media
│   ├── auth/             # Authentication-related code and providers
│   ├── components/       # Reusable UI components organized by feature
│   │   ├── adaptive/     # Adaptive system components
│   │   ├── analytics/    # Analytics and reporting components
│   │   ├── avatar/       # Avatar and user representation components
│   │   ├── celebrations/ # Gamification celebration components
│   │   ├── chat/         # Chat and messaging components
│   │   ├── feedback/     # User feedback collection components
│   │   ├── guru/         # AI guide and wisdom components
│   │   ├── home/         # Home page and dashboard components
│   │   ├── journey/       # Journey and progression components
│   │   ├── landing/       # Landing page components
│   │   ├── layout/        # Layout and shell components
│   │   ├── loops/         # Loop discovery and work components
│   │   ├── onboarding/    # User onboarding components
│   │   ├── practice/      # Practice and meditation components
│   │   ├── rituals/       # Ritual and integration components
│   │   ├── safety/        # Safety and crisis support components
│   │   ├── scheduling/     # Scheduling components
│   │   ├── session/        # Session and guided experience components
│   │   ├── settings/       # User settings components
│   │   ├── space/          # Cosmic and space visualization components
│   │   ├── tasks/          # Task management components
│   │   └── ui/             # Base UI component library (shadcn/ui)
│   ├── contexts/          # React Context providers for global state
│   ├── data/              # Static data files and configurations
│   ├── hooks/              # Custom React hooks organized by functionality
│   ├── integrations/       # External service integrations
│   ├── lib/                # Utility functions and helper modules
│   ├── pages/              # Page-level components (routes)
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── docs/                   # Documentation files
├── docs2/                  # Extended documentation
├── docs3/                  # Additional documentation
├── public/                 # Public static files
└── package.json            # Project dependencies and scripts
```

### 2.2 Core Application Entry Points

#### 2.2.1 Main Entry Point (src/main.tsx)

The main entry point initializes the React application with all necessary providers and configurations:

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

This file sets up the React root and renders the main App component within StrictMode for development checks.

#### 2.2.2 Application Root (src/App.tsx)

The App component establishes the application's provider hierarchy and routing structure:

```typescript
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <PreferencesProvider>
        <PerformanceProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>
              <GlobalCelebrations />
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  {/* Route definitions */}
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </TooltipProvider>
        </PerformanceProvider>
      </PreferencesProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
```

The provider hierarchy ensures that:

1. **QueryClientProvider**: Manages server state and caching with React Query
2. **ThemeProvider**: Handles light/dark mode and color theming
3. **PreferencesProvider**: Stores user preferences and settings
4. **PerformanceProvider**: Optimizes rendering for low-end devices
5. **TooltipProvider**: Enables tooltip functionality across components
6. **Toaster/Sonner**: Provides toast notifications
7. **AuthProvider**: Manages authentication state and user sessions
8. **GlobalCelebrations**: Handles gamification celebration overlays
9. **BrowserRouter**: Enables client-side routing
10. **ScrollToTop**: Resets scroll position on route changes

---

## 3. Page Components Documentation

### 3.1 Landing Page (src/pages/Landing.tsx)

The Landing page serves as the primary entry point for the application, designed to introduce new visitors to the ConsciousOS platform and convert them into registered users.

#### 3.1.1 Component Overview

**File**: `src/pages/Landing.tsx`

**Purpose**: Introduce ConsciousOS to potential users and provide authentication options

**Key Features**:
- Hero section with 3D space visualization
- Feature highlights and value proposition
- Authentication integration
- Responsive design for all device sizes

#### 3.1.2 Component Structure

The Landing page is organized into several key sections:

1. **Hero Section**: Features the Hero3DSpace component with cosmic background
2. **Value Proposition**: Explains the core benefits of the platform
3. **Authentication Section**: Integrates with Auth component for sign-up/sign-in
4. **Feature Highlights**: Showcases key functionality
5. **Call to Action**: Encourages user registration

#### 3.1.3 Dependencies

```typescript
import { Hero3DSpace } from "@/components/landing/Hero3DSpace";
import { FloatingGeometry } from "@/components/landing/FloatingGeometry";
import { AdaptiveDayDemo } from "@/components/landing/AdaptiveDayDemo";
import { LoopDiscoveryQuiz } from "@/components/landing/LoopDiscoveryQuiz";
```

#### 3.1.4 Routing Integration

The Landing page is accessible at the root route `/` and does not require authentication.

```typescript
<Route path="/" element={<Landing />} />
```

### 3.2 Authentication Page (src/pages/Auth.tsx)

The Auth page handles user authentication, including sign-up, sign-in, and password recovery.

#### 3.2.1 Component Overview

**File**: `src/pages/Auth.tsx`

**Purpose**: Provide secure user authentication with Supabase integration

**Key Features**:
- Email/password authentication
- Social authentication options
- Password recovery flow
- Session management

#### 3.2.2 Authentication Flow

The component integrates with the AuthProvider context to manage authentication state:

```typescript
const { signIn, signUp, resetPassword, user } = useAuth();
```

#### 3.2.3 Routing Integration

Accessible at `/auth` route without authentication requirement.

```typescript
<Route path="/auth" element={<Auth />} />
```

### 3.3 Onboarding Page (src/pages/Onboarding.tsx)

The Onboarding page guides new users through the initial setup and orientation process.

#### 3.3.1 Component Overview

**File**: `src/pages/Onboarding.tsx`

**Purpose**: Introduce new users to the ConsciousOS philosophy and gather initial preferences

**Key Features**:
- Welcome and orientation content
- Initial preference gathering
- Path selection (Adaptive vs Structured)
- Level-based journey initiation

#### 3.3.2 Onboarding Flow

The onboarding process includes multiple stages:

1. **Welcome Screen**: Introduction to the platform
2. **Three Bodies Introduction**: Core concept explanation
3. **Depth Revelation**: Initial teaching content
4. **Path Selection**: User chooses their preferred journey type
5. **Energy Assessment**: Initial energy and capacity evaluation
6. **Intention Setting**: User sets initial intentions
7. **Completion**: User enters the main application

#### 3.3.3 Routing Integration

Protected route requiring authentication:

```typescript
<Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
```

### 3.4 Home Page (src/pages/Home.tsx)

The Home page serves as the main dashboard, providing users with a personalized overview of their current journey status.

#### 3.4.1 Component Overview

**File**: `src/pages/Home.tsx`

**Purpose**: Display user's current journey status and provide quick access to daily activities

**Key Features**:
- Time-based greeting (morning/afternoon/evening)
- Consciousness Orb visualization
- Status bar with progress indicators
- Adaptive Home Section integration
- Loop Work Card for active patterns
- Presence Ping Card for midday check-ins

#### 3.4.2 Component Structure

```typescript
const Home = () => {
  const { profile, dayNumber, effectiveUserId } = useProfile();
  const { fetchTodayJourney, tasks } = useJourney();
  const { showGamification } = useGamification();
  const { getTotalXP } = useDayChain();
  const { getActiveLoops } = useLoops();
  const { isNightTime } = useAIDecision();
  const { isLowEnd } = usePerformance();
  const { shouldShowNightWelcome, completeNightWelcome } = useNightTimeFirstUser();
  
  // ... component implementation
};
```

#### 3.4.3 Time-Based Context

The Home page adapts to the time of day:

```typescript
const hour = new Date().getHours();
const timeContext = hour < 12 ? 'morning' : hour < 18 ? 'midday' : 'evening';
```

#### 3.4.4 Routing Integration

Protected route within the app layout:

```typescript
<Route path="/app" element={<RequireAuth><AppLayout /></RequireAuth>}>
  <Route index element={<ErrorBoundary><Home /></ErrorBoundary>} />
</Route>
```

### 3.5 Tasks Page (src/pages/Tasks.tsx)

The Tasks page provides access to daily tasks and activities.

#### 3.5.1 Component Overview

**File**: `src/pages/Tasks.tsx`

**Purpose**: Display and manage user's daily tasks and activities

**Key Features**:
- Task list with completion status
- Task categorization and prioritization
- XP tracking and rewards
- Task filtering and sorting

#### 3.5.2 Related Hooks

```typescript
import { useJourney } from "@/hooks/useJourney";
import { useDayChain } from "@/hooks/useDayChain";
import { useBlockXP } from "@/hooks/useBlockXP";
```

#### 3.5.3 Routing Integration

```typescript
<Route path="tasks" element={<ErrorBoundary><Tasks /></ErrorBoundary>} />
```

### 3.6 Master Page (src/pages/Master.tsx)

The Master page provides access to master-level sessions and advanced practices.

#### 3.6.1 Component Overview

**File**: `src/pages/Master.tsx`

**Purpose**: Deliver advanced sessions and practices based on user's level and journey progress

**Key Features**:
- Session library and selection
- Practice timer integration
- Progress tracking
- Guru session integration

#### 3.6.2 Session Types

The Master page supports multiple session types:

- **Morning Sessions**: Morning check-in and intention setting
- **Practice Sessions**: Meditation and breathing exercises
- **Learning Sessions**: Educational content and teachings
- **Reflection Sessions**: Journaling and integration activities

#### 3.6.3 Routing Integration

```typescript
<Route path="master" element={<ErrorBoundary><Master /></ErrorBoundary>} />
```

### 3.7 Journal Page (src/pages/Journal.tsx)

The Journal page provides a comprehensive journaling experience with AI-powered insights.

#### 3.7.1 Component Overview

**File**: `src/pages/Journal.tsx`

**Purpose**: Enable users to record reflections, insights, and daily experiences

**Key Features**:
- Journal entry creation and editing
- AI-powered writing assistance
- Entry categorization and tagging
- Pattern detection and insights
- Search and filtering capabilities

#### 3.7.2 Journal Modes

The journal supports multiple modes:

- **Free Write**: Unstructured journaling
- **Prompted**: AI-generated contextual prompts
- **Template**: Structured templates for specific purposes
- **Evening Reflection**: Guided end-of-day reflection

#### 3.7.3 Routing Integration

```typescript
<Route path="journal" element={<ErrorBoundary><Journal /></ErrorBoundary>} />
```

### 3.8 Analytics Page (src/pages/Analytics.tsx)

The Analytics page provides insights and reports on user progress.

#### 3.8.1 Component Overview

**File**: `src/pages/Analytics.tsx`

**Purpose**: Display comprehensive analytics and progress reports

**Key Features**:
- Progress over time visualization
- Capacity radar charts
- Loop dissolution tracking
- XP and level progression
- Comparative analytics

#### 3.8.2 Analytics Components

```typescript
import { AIInsights } from "@/components/analytics/AIInsights";
import { FeedbackAnalyticsDashboard } from "@/components/analytics/FeedbackAnalyticsDashboard";
import { MonthlyReport } from "@/components/analytics/MonthlyReport";
```

#### 3.8.3 Routing Integration

```typescript
<Route path="analytics" element={<ErrorBoundary><Analytics /></ErrorBoundary>} />
```

### 3.9 Practice Page (src/pages/Practice.tsx)

The Practice page provides access to meditation and practice libraries.

#### 3.9.1 Component Overview

**File**: `src/pages/Practice.tsx`

**Purpose**: Offer a library of practices including meditations, breathing exercises, and kriyas

**Key Features**:
- Practice library with categories
- Practice timer functionality
- Ambient sound selection
- Progress tracking
- Favorites and recommendations

#### 3.9.2 Practice Components

```typescript
import { PracticeLibrary } from "@/components/practice/PracticeLibrary";
import { PracticeTimer } from "@/components/practice/PracticeTimer";
import { AmbientSoundPicker } from "@/components/practice/AmbientSoundPicker";
import { DeepWorkSection } from "@/components/practice/DeepWorkSection";
```

#### 3.9.3 Routing Integration

```typescript
<Route path="practice" element={<ErrorBoundary><Practice /></ErrorBoundary>} />
```

### 3.10 Settings Page (src/pages/Settings.tsx)

The Settings page allows users to configure application preferences.

#### 3.10.1 Component Overview

**File**: `src/pages/Settings.tsx`

**Purpose**: Provide user interface for managing application settings

**Key Features**:
- Notification preferences
- Sound and audio settings
- Theme customization
- Privacy controls
- Data export options

#### 3.10.2 Settings Components

```typescript
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { SoundPreviewGrid } from "@/components/settings/SoundPreviewGrid";
import { VoiceSettings } from "@/components/settings/VoiceSettings";
```

#### 3.10.3 Routing Integration

```typescript
<Route path="settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
```

### 3.11 Explore Page (src/pages/Explore.tsx)

The Explore page provides access to additional content and features.

#### 3.11.1 Component Overview

**File**: `src/pages/Explore.tsx`

**Purpose**: Enable users to discover and access additional content

**Key Features**:
- Content discovery interface
- Featured content highlights
- Search functionality
- Category browsing

#### 3.11.2 Routing Integration

```typescript
<Route path="explore" element={<ErrorBoundary><Explore /></ErrorBoundary>} />
```

### 3.12 Profile Page (src/pages/Profile.tsx)

The Profile page displays user information and achievements.

#### 3.12.1 Component Overview

**File**: `src/pages/Profile.tsx`

**Purpose**: Show user profile information and journey progress

**Key Features**:
- User profile display
- Achievement badges
- Progress statistics
- Account management

#### 3.12.2 Related Components

```typescript
import { AchievementBadge } from "@/components/celebrations/AchievementBadge";
import { CapacityRadar } from "@/components/journey/CapacityRadar";
```

#### 3.12.3 Routing Integration

```typescript
<Route path="profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
```

### 3.13 Graduation Page (src/pages/Graduation.tsx)

The Graduation page celebrates user achievements and transitions between levels.

#### 3.13.1 Component Overview

**File**: `src/pages/Graduation.tsx`

**Purpose**: Celebrate level completions and transitions

**Key Features**:
- Level completion celebration
- Achievement display
- Transition ceremonies
- Progress summary

#### 3.13.2 Related Hooks

```typescript
import { useLevelProgression } from "@/hooks/useLevelProgression";
import { useLevelGate } from "@/hooks/useLevelGate";
```

#### 3.13.3 Routing Integration

```typescript
<Route path="graduation" element={<ErrorBoundary><Graduation /></ErrorBoundary>} />
```

### 3.14 Seed Data Page (src/pages/SeedData.tsx)

The Seed Data page provides development utilities for seeding test data.

#### 3.14.1 Component Overview

**File**: `src/pages/SeedData.tsx`

**Purpose**: Development tool for populating test data

**Key Features**:
- User data seeding
- Journey simulation
- Progress initialization

#### 3.14.2 Routing Integration

```typescript
<Route path="/seed" element={<SeedData />} />
```

### 3.15 DevTest Page (src/pages/DevTest.tsx)

The DevTest page provides development testing utilities.

#### 3.15.1 Component Overview

**File**: `src/pages/DevTest.tsx`

**Purpose**: Development testing interface

**Key Features**:
- Component testing
- State debugging
- Feature flags

#### 3.15.2 Routing Integration

```typescript
<Route path="dev-test" element={<ErrorBoundary><DevTest /></ErrorBoundary>} />
```

### 3.16 NotFound Page (src/pages/NotFound.tsx)

The NotFound page handles 404 errors and invalid routes.

#### 3.16.1 Component Overview

**File**: `src/pages/NotFound.tsx`

**Purpose**: Display friendly error page for invalid routes

#### 3.16.2 Routing Integration

```typescript
<Route path="*" element={<NotFound />} />
```

---

## 4. Component Library Documentation

### 4.1 UI Components (src/components/ui/)

The UI component library contains base components built on shadcn/ui with custom ConsciousOS styling.

#### 4.1.1 Button (button.tsx)

**File**: `src/components/ui/button.tsx`

**Purpose**: Primary interaction component with multiple variants

**Variants**:
- `default`: Primary button styling
- `destructive`: For destructive actions
- `outline`: Outlined button
- `secondary`: Secondary styling
- `ghost`: Minimal/ghost styling
- `link`: Link styling

**Sizes**:
- `default`: Standard size
- `sm`: Small size
- `lg`: Large size
- `icon`: Icon-only buttons

**Usage**:
```typescript
import { Button } from "@/components/ui/button";

<Button variant="default" size="default">
  Click me
</Button>
```

#### 4.1.2 Card (card.tsx)

**File**: `src/components/ui/card.tsx`

**Purpose**: Container component for grouping related content

**Subcomponents**:
- `Card`: Main card wrapper
- `CardHeader`: Card header section
- `CardTitle`: Card title
- `CardDescription`: Card description
- `CardContent`: Card content area
- `CardFooter`: Card footer section

**Usage**:
```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

#### 4.1.3 GlassCard (GlassCard.tsx)

**File**: `src/components/ui/GlassCard.tsx`

**Purpose**: Custom glassmorphic card component with depth levels

**Props**:
- `children`: Card content
- `depth`: Depth level (1-4) controlling blur and opacity
- `className`: Additional CSS classes

**Depth Levels**:
- `1`: Light glass effect
- `2`: Medium glass effect
- `3`: Heavy glass effect
- `4`: Maximum glass effect

**Usage**:
```typescript
import { GlassCard } from "@/components/ui/GlassCard";

<GlassCard depth={2}>
  Content with medium glass effect
</GlassCard>
```

#### 4.1.4 Dialog (dialog.tsx)

**File**: `src/components/ui/dialog.tsx`

**Purpose**: Modal dialog component for forms and confirmations

**Subcomponents**:
- `Dialog`: Dialog wrapper
- `DialogTrigger`: Trigger element
- `DialogContent`: Dialog content
- `DialogHeader`: Dialog header
- `DialogFooter`: Dialog footer
- `DialogTitle`: Dialog title
- `DialogDescription`: Dialog description

**Usage**:
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    Dialog content
  </DialogContent>
</Dialog>
```

#### 4.1.5 Input (input.tsx)

**File**: `src/components/ui/input.tsx`

**Purpose**: Text input component with various states

**States**:
- Default
- Disabled
- Error
- Focused

**Usage**:
```typescript
import { Input } from "@/components/ui/input";

<Input 
  type="text" 
  placeholder="Enter text..." 
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

#### 4.1.6 Textarea (textarea.tsx)

**File**: `src/components/ui/textarea.tsx`

**Purpose**: Multi-line text input for longer content

**Usage**:
```typescript
import { Textarea } from "@/components/ui/textarea";

<Textarea 
  placeholder="Write your thoughts..." 
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

#### 4.1.7 Progress (progress.tsx)

**File**: `src/components/ui/progress.tsx`

**Purpose**: Visual progress indicator

**Props**:
- `value`: Progress value (0-100)
- `max`: Maximum value (default: 100)
- `className`: Additional CSS classes

**Usage**:
```typescript
import { Progress } from "@/components/ui/progress";

<Progress value={75} />
```

#### 4.1.8 Tabs (tabs.tsx)

**File**: `src/components/ui/tabs.tsx`

**Purpose**: Tab navigation component

**Subcomponents**:
- `Tabs`: Wrapper component
- `TabsList`: Container for tabs
- `TabsTrigger`: Individual tab trigger
- `TabsContent`: Tab content panel

**Usage**:
```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

#### 4.1.9 Toast Components (toast.tsx, toaster.tsx, use-toast.ts)

**File**: `src/components/ui/toast.tsx`

**Purpose**: Notification toast system

**Usage**:
```typescript
import { useToast } from "@/components/ui/use-toast";

const { toast } = useToast();

toast({
  title: "Success",
  description: "Operation completed successfully",
});
```

### 4.2 Space Components (src/components/space/)

Space components create the cosmic and celestial visual elements throughout the application.

#### 4.2.1 CosmicBackground (CosmicBackground.tsx)

**File**: `src/components/space/CosmicBackground.tsx`

**Purpose**: Full-page cosmic background with animated stars and nebula effects

**Props**:
- `intensity`: Animation intensity level
- `showNebula`: Toggle nebula effects
- `children`: Content to overlay

**Features**:
- Animated star field
- Nebula cloud effects
- Comet animations
- Responsive performance optimization

**Usage**:
```typescript
import { CosmicBackground } from "@/components/space/CosmicBackground";

<CosmicBackground intensity="medium">
  Page content
</CosmicBackground>
```

#### 4.2.2 StarField (StarField.tsx)

**File**: `src/components/space/StarField.tsx`

**Purpose**: Star field visualization component

**Props**:
- `count`: Number of stars
- `speed`: Animation speed
- `size`: Star size range
- `color`: Star color theme

**Usage**:
```typescript
import { StarField } from "@/components/space/StarField";

<StarField count={200} speed={1} />
```

#### 4.2.3 SunCore (SunCore.tsx)

**File**: `src/components/space/SunCore.tsx`

**Purpose**: Central sun/orb visualization representing consciousness

**Props**:
- `size`: Orb size (sm, md, lg, xl)
- `energyLevel`: Energy visualization level
- `pulsing`: Enable/disable pulsing animation
- `colorTheme`: Color theme selection

**Usage**:
```typescript
import { SunCore } from "@/components/space/SunCore";

<SunCore size="lg" energyLevel={75} pulsing={true} />
```

#### 4.2.4 CelestialBody (CelestialBody.tsx)

**File**: `src/components/space/CelestialBody.tsx`

**Purpose**: Individual celestial body with orbit animation

**Props**:
- `type`: Body type (planet, moon, star)
- `orbitRadius`: Distance from center
- `speed`: Orbital speed
- `size`: Body size
- `color`: Body color

**Usage**:
```typescript
import { CelestialBody } from "@/components/space/CelestialBody";

<CelestialBody 
  type="planet" 
  orbitRadius={150} 
  speed={0.5} 
  size="medium"
/>
```

#### 4.2.5 Orb Components

**SolarOrb** (`SolarOrb.tsx`)
- Visual representation of consciousness energy
- Shows XP/level progression

**SolarOrbLite** (`SolarOrbLite.tsx`)
- Performance-optimized orb for low-end devices

**ConsciousnessOrb** (`ConsciousnessOrb.tsx`)
- Advanced orb with consciousness visualization

**EvolvingOrb** (`EvolvingOrb.tsx`)
- Orb that evolves based on user progress

**GoldenOrb** (`GoldenOrb.tsx`)
- Premium orb visualization

**UltimateOrb** (`UltimateOrb.tsx`)
- Highest-level orb visualization

#### 4.2.6 Space Index (index.ts)

**File**: `src/components/space/index.ts`

**Purpose**: Export all space components

```typescript
export { CosmicBackground } from './CosmicBackground';
export { StarField } from './StarField';
export { SunCore } from './SunCore';
export { CelestialBody } from './CelestialBody';
// ... other exports
```

### 4.3 Adaptive Components (src/components/adaptive/)

Adaptive components provide the AI-personalized experience throughout the application.

#### 4.3.1 AdaptiveHomeSection (AdaptiveHomeSection.tsx)

**File**: `src/components/adaptive/AdaptiveHomeSection.tsx`

**Purpose**: Main adaptive dashboard section on the Home page

**Props**: No props required (navigates directly)

**Features**:
- Day Journey Flow Card integration
- Day Package Blocks display
- Afternoon Ping Card
- Evening Reflection prompts
- Tomorrow Glimpse preview
- Journal Prompt Card
- Life Domains Grid
- Loop Prioritization display

**Related Hooks**:
```typescript
import { useAdaptiveDay } from "@/hooks/useAdaptiveDay";
import { useVLevel } from "@/hooks/useVLevel";
import { useAfternoonPing } from "@/hooks/useAfternoonPing";
import { useDayStatus } from "@/hooks/useDayStatus";
import { useLoopPrioritization } from "@/hooks/useLoopPrioritization";
```

#### 4.3.2 AdaptiveJourneyDashboard (AdaptiveJourneyDashboard.tsx)

**File**: `src/components/adaptive/AdaptiveJourneyDashboard.tsx`

**Purpose**: Comprehensive journey dashboard with adaptive features

**Features**:
- Capacity Radar visualization
- Loop progress tracking
- Level progression display
- Energy calibration display

#### 4.3.3 AdaptiveBackground (AdaptiveBackground.tsx)

**File**: `src/components/ui/AdaptiveBackground.tsx`

**Purpose**: Background that adapts to user state and time of day

**Props**:
- `userState`: Current user emotional/state indicator
- `timeOfDay`: Time-based theming
- `intensity`: Animation intensity

#### 4.3.4 CapacityRadarEnhanced (CapacityRadarEnhanced.tsx)

**File**: `src/components/adaptive/CapacityRadarEnhanced.tsx`

**Purpose**: Enhanced radar chart for displaying capacity development

**Props**:
- `capacities`: Array of capacity values
- `size`: Chart size
- `showLabels`: Toggle label display

**Capacity Domains**:
- Awareness
- Presence
- Equanimity
- Compassion
- Wisdom
- Courage
- Patience
- Discipline
- Humility
- Gratitude
- Acceptance
- Love

#### 4.3.5 DayPackageBlocks (DayPackageBlocks.tsx)

**File**: `src/components/adaptive/DayPackageBlocks.tsx`

**Purpose**: Display blocks from the daily AI-generated package

**Props**:
- `dayPackage`: Daily package data
- `onCompleteBlock`: Callback when block is completed
- `onStartBlock`: Callback when block is started

**Block Types**:
- `practice`: Meditation or breathing exercise
- `learn`: Educational content
- `reflect`: Journaling or reflection
- `integrate`: Integration activity

#### 4.3.6 DayJourneyFlowCard (DayJourneyFlowCard.tsx)

**File**: `src/components/adaptive/DayJourneyFlowCard.tsx`

**Purpose**: Visual flow card showing the day's journey stages

**Props**:
- `hasCheckedIn`: Whether morning check-in is complete
- `completedBlocks`: Number of completed blocks
- `totalBlocks`: Total number of blocks
- `hasEveningReflection`: Whether evening reflection is complete
- `onScrollToAfternoonPing`: Callback for midday ping
- `onStartCheckIn`: Callback for starting check-in

**Stages**:
1. Morning Check-in
2. Practice Blocks
3. Midday Presence
4. Evening Reflection
5. Night Mode

#### 4.3.7 EditCheckInModal (EditCheckInModal.tsx)

**File**: `src/components/adaptive/EditCheckInModal.tsx`

**Purpose**: Modal for editing morning check-in data

**Props**:
- `open`: Modal visibility
- `onClose`: Close handler
- `currentData`: Existing check-in data
- `onSave`: Save handler

**Data Fields**:
- Mood
- Intention
- Energy Level
- Time Available

#### 4.3.8 EveningReflectionModal (EveningReflectionModal.tsx)

**File**: `src/components/adaptive/EveningReflectionModal.tsx`

**Purpose**: Modal for evening reflection completion

**Features**:
- Guided reflection questions
- Insight capture
- Gratitude expression
- Tomorrow intention setting

#### 4.3.9 AfternoonPingCard (AfternoonPingCard.tsx)

**File**: `src/components/adaptive/AfternoonPingCard.tsx`

**Purpose**: Midday presence check-in card

**Props**:
- `onDismiss`: Dismiss handler
- `onComplete`: Completion handler

#### 4.3.10 AfternoonPresenceOverlay (AfternoonPresenceOverlay.tsx)

**File**: `src/components/adaptive/AfternoonPresenceOverlay.tsx`

**Purpose**: Full-screen overlay for midday presence practice

**Props**:
- `open`: Overlay visibility
- `onClose`: Close handler
- `onComplete`: Completion handler

### 4.4 Home Components (src/components/home/)

Home components provide the dashboard and widget functionality on the Home page.

#### 4.4.1 StatusBar (StatusBar.tsx)

**File**: `src/components/home/StatusBar.tsx`

**Purpose**: Display user's current status and progress

**Props**:
- `displayName`: User's display name
- `dayNumber`: Current day on the path
- `streak`: Current streak count
- `xpToday`: XP earned today
- `level`: Current level
- `isAdaptiveMode`: Mode indicator

#### 4.4.2 PresencePingCard (PresencePingCard.tsx)

**File**: `src/components/home/PresencePingCard.tsx`

**Purpose**: Prompt for presence/mindfulness practice

**Props**:
- `personalize`: Whether to personalize the prompt

#### 4.4.3 LoopWorkCard (LoopWorkCard.tsx)

**File**: `src/components/home/LoopWorkCard.tsx`

**Purpose**: Display active loops requiring attention

**Props**: No props required

#### 4.4.4 NightWelcomeCard (NightWelcomeCard.tsx)

**File**: `src/components/home/NightWelcomeCard.tsx`

**Purpose**: Welcome card for nighttime users

**Props**:
- `displayName`: User's display name
- `onSkipToTomorrow`: Skip handler
- `onContinueAnyway`: Continue handler

#### 4.4.5 TodaySnapshot (TodaySnapshot.tsx)

**File**: `src/components/home/TodaySnapshot.tsx`

**Purpose**: Quick overview of today's progress

**Props**:
- `tasksCompleted`: Number of completed tasks
- `tasksTotal`: Total tasks
- `xpEarned`: XP earned today
- `streak`: Current streak
- `level`: Current level
- `dayTheme`: Today's theme
- `intention`: Today's intention
- `isAdaptiveMode`: Mode indicator

#### 4.4.6 MorningGreeting (MorningGreeting.tsx)

**File**: `src/components/home/MorningGreeting.tsx`

**Purpose**: Time-appropriate morning greeting

#### 4.4.7 EveningReflection (EveningReflection.tsx)

**File**: `src/components/home/EveningReflection.tsx`

**Purpose**: Evening reflection component

#### 4.4.8 IntentionSetter (IntentionSetter.tsx)

**File**: `src/components/home/IntentionSetter.tsx`

**Purpose**: Interface for setting daily intentions

#### 4.4.9 QuickActions (QuickActions.tsx)

**File**: `src/components/home/QuickActions.tsx`

**Purpose**: Quick access to common actions

#### 4.4.10 QuickPracticeShortcuts (QuickPracticeShortcuts.tsx)

**File**: `src/components/home/QuickPracticeShortcuts.tsx`

**Purpose**: Shortcuts to common practices

#### 4.4.11 SessionEntryCard (SessionEntryCard.tsx)

**File**: `src/components/home/SessionEntryCard.tsx`

**Purpose**: Card for entering a session

#### 4.4.12 SessionSeedCard (SessionSeedCard.tsx)

**File**: `src/components/home/SessionSeedCard.tsx`

**Purpose**: Connection card from yesterday's session

#### 4.4.13 KnowledgeSessionCard (KnowledgeSessionCard.tsx)

**File**: `src/components/home/KnowledgeSessionCard.tsx`

**Purpose**: Pattern-triggered teachings card

#### 4.4.14 JournalPromptCard (JournalPromptCard.tsx)

**File**: `src/components/home/JournalPromptCard.tsx`

**Purpose**: AI-generated journaling prompt

#### 4.4.15 LessonThemeSummary (LessonThemeSummary.tsx)

**File**: `src/components/home/LessonThemeSummary.tsx`

**Purpose**: Summary of current lesson theme

#### 4.4.16 DreamJournalPrompt (DreamJournalPrompt.tsx)

**File**: `src/components/home/DreamJournalPrompt.tsx`

**Purpose**: Dream journaling prompt

#### 4.4.17 ActiveTaskCard (ActiveTaskCard.tsx)

**File**: `src/components/home/ActiveTaskCard.tsx`

**Purpose**: Display currently active task

#### 4.4.18 TransformationTracker (TransformationTracker.tsx)

**File**: `src/components/home/TransformationTracker.tsx`

**Purpose**: Track transformational progress

#### 4.4.19 NightModeCard (NightModeCard.tsx)

**File**: `src/components/home/NightModeCard.tsx`

**Purpose**: Night mode greeting and recommendations

#### 4.4.20 TomorrowGlimpseCard (TomorrowGlimpseCard.tsx)

**File**: `src/components/home/TomorrowGlimpseCard.tsx`

**Purpose**: Preview of tomorrow's journey

#### 4.4.21 StreakRecommendationCard (StreakRecommendationCard.tsx)

**File**: `src/components/home/StreakRecommendationCard.tsx`

**Purpose**: Recommendations to maintain streak

#### 4.4.22 PredictionInsightCard (PredictionInsightCard.tsx)

**File**: `src/components/home/PredictionInsightCard.tsx`

**Purpose**: AI prediction insights

**Props**:
- `variant`: Display variant (compact/full)

#### 4.4.23 AIDecisionWidget (AIDecisionWidget.tsx)

**File**: `src/components/home/AIDecisionWidget.tsx`

**Purpose**: AI-assisted decision making

#### 4.4.24 SufferingPatternCard (SufferingPatternCard.tsx)

**File**: `src/components/home/SufferingPatternCard.tsx`

**Purpose**: Display identified suffering patterns

#### 4.4.25 DayChainTimeline (DayChainTimeline.tsx)

**File**: `src/components/home/DayChainTimeline.tsx`

**Purpose**: Timeline view of day's activities

#### 4.4.26 DayChainPreview (DayChainPreview.tsx)

**File**: `src/components/home/DayChainPreview.tsx`

**Purpose**: Preview of day's chain

#### 4.4.27 TodayTheme (TodayTheme.tsx)

**File**: `src/components/home/TodayTheme.tsx`

**Purpose**: Display today's theme

#### 4.4.28 TodayTeachingCard (TodayTeachingCard.tsx)

**File**: `src/components/home/TodayTeachingCard.tsx`

**Purpose**: Today's teaching content

#### 4.4.29 LoopWorkCard (LoopWorkCard.tsx)

**File**: `src/components/home/LoopWorkCard.tsx`

**Purpose**: Active loop work display

### 4.5 Journey Components (src/components/journey/)

Journey components handle the user's progression through the journey levels.

#### 4.5.1 JourneyMap (JourneyMap.tsx)

**File**: `src/components/journey/JourneyMap.tsx`

**Purpose**: Visual map of the journey progression

**Features**:
- Level visualization
- Progress tracking
- Path highlighting
- Branch options

#### 4.5.2 CapacityRadar (CapacityRadar.tsx)

**File**: `src/components/journey/CapacityRadar.tsx`

**Purpose**: Radar chart for capacity visualization

**Props**:
- `capacities`: Capacity values object
- `size`: Chart size
- `animate`: Enable animations

**Capacity Dimensions**:
- Awareness
- Presence
- Equanimity
- Compassion
- Wisdom
- Courage

#### 4.5.3 LifeDomainsGrid (LifeDomainsGrid.tsx)

**File**: `src/components/journey/LifeDomainsGrid.tsx`

**Purpose**: Grid display of life domains

**Props**:
- `compact`: Use compact view
- `onDomainClick`: Domain click handler

**Life Domains**:
1. Physical Health
2. Mental Wellness
3. Relationships
4. Career/Work
5. Finances
6. Personal Growth
7. Fun/Recreation
8. Environment
9. Spirituality

#### 4.5.4 LevelGateCard (LevelGateCard.tsx)

**File**: `src/components/journey/LevelGateCard.tsx`

**Purpose**: Card for level transition requirements

**Props**:
- `level`: Target level
- `requirements`: Level requirements
- `onComplete`: Completion handler

#### 4.5.5 LevelUpCelebration (LevelUpCelebration.tsx)

**File**: `src/components/journey/LevelUpCelebration.tsx`

**Purpose**: Animation for level advancement

#### 4.5.6 DeepWorkPanel (DeepWorkPanel.tsx)

**File**: `src/components/journey/DeepWorkPanel.tsx`

**Purpose**: Panel for deep work sessions

#### 4.5.7 UltimateSpace (UltimateSpace.tsx)

**File**: `src/components/journey/UltimateSpace.tsx`

**Purpose**: Advanced journey space visualization

### 4.6 Celebration Components (src/components/celebrations/)

Celebration components provide gamification reward displays.

#### 4.6.1 GlobalCelebrations (GlobalCelebrations.tsx)

**File**: `src/components/celebrations/GlobalCelebrations.tsx`

**Purpose**: Global celebration overlay system

#### 4.6.2 AchievementBadge (AchievementBadge.tsx)

**File**: `src/components/celebrations/AchievementBadge.tsx`

**Purpose**: Display achievement badge

**Props**:
- `achievement`: Achievement data
- `size`: Badge size
- `earned`: Whether badge is earned

#### 4.6.3 AchievementPopup (AchievementPopup.tsx)

**File**: `src/components/celebrations/AchievementPopup.tsx`

**Purpose**: Popup notification for achievements

#### 4.6.4 XPPopup (XPPopup.tsx)

**File**: `src/components/celebrations/XPPopup.tsx`

**Purpose**: XP gain notification

#### 4.6.5 VLevelUpPopup (VLevelUpPopup.tsx)

**File**: `src/components/celebrations/VLevelUpPopup.tsx`

**Purpose**: V-Level advancement notification

#### 4.6.6 BreakthroughPopup (BreakthroughPopup.tsx)

**File**: `src/components/celebrations/BreakthroughPopup.tsx`

**Purpose**: Breakthrough moment notification

#### 4.6.7 StreakMilestonePopup (StreakMilestonePopup.tsx)

**File**: `src/components/celebrations/StreakMilestonePopup.tsx`

**Purpose**: Streak milestone celebration

#### 4.6.8 Confetti (Confetti.tsx)

**File**: `src/components/celebrations/Confetti.tsx`

**Purpose**: Confetti particle effect

### 4.7 Loop Components (src/components/loops/)

Loop components handle the identification and work on psychological patterns.

#### 4.7.1 LoopCard (LoopCard.tsx)

**File**: `src/components/loops/LoopCard.tsx`

**Purpose**: Display loop information

**Props**:
- `loop`: Loop data
- `onSelect`: Selection handler

**Loop Types**:
- Anxiety
- Fear
- Anger
- Sadness
- Shame
- Guilt
- Control
- Approval Seeking
- Perfectionism
- Avoidance

#### 4.7.2 LoopConstellation (LoopConstellation.tsx)

**File**: `src/components/loops/LoopConstellation.tsx`

**Purpose**: Visual constellation of active loops

#### 4.7.3 LoopDetailPanel (LoopDetailPanel.tsx)

**File**: `src/components/loops/LoopDetailPanel.tsx`

**Purpose**: Detailed view of a loop

#### 4.7.4 ShadowWorkSession (ShadowWorkSession.tsx)

**File**: `src/components/loops/ShadowWorkSession.tsx`

**Purpose**: Guided shadow work session

### 4.8 Guru Components (src/components/guru/)

Guru components provide AI-guided wisdom and session features.

#### 4.8.1 GuruContextBadge (GuruContextBadge.tsx)

**File**: `src/components/guru/GuruContextBadge.tsx`

**Purpose**: Badge showing guru context

#### 4.8.2 GuruNudgeCard (GuruNudgeCard.tsx)

**File**: `src/components/guru/GuruNudgeCard.tsx`

**Purpose**: AI-guided nudge card

#### 4.8.3 GuruSessionSelector (GuruSessionSelector.tsx)

**File**: `src/components/guru/GuruSessionSelector.tsx`

**Purpose**: Selector for guru-led sessions

### 4.9 Practice Components (src/components/practice/)

Practice components handle meditation and practice features.

#### 4.9.1 PracticeLibrary (PracticeLibrary.tsx)

**File**: `src/components/practice/PracticeLibrary.tsx`

**Purpose**: Library of available practices

**Categories**:
- Breathing
- Meditation
- Kriya
- Movement
- Visualization
- Journaling

#### 4.9.2 PracticeTimer (PracticeTimer.tsx)

**File**: `src/components/practice/PracticeTimer.tsx`

**Purpose**: Timer for practices

**Props**:
- `duration`: Practice duration
- `onComplete`: Completion handler
- `type`: Practice type

#### 4.9.3 AmbientSoundPicker (AmbientSoundPicker.tsx)

**File**: `src/components/practice/AmbientSoundPicker.tsx`

**Purpose**: Sound selection for practices

#### 4.9.4 DeepWorkSection (DeepWorkSection.tsx)

**File**: `src/components/practice/DeepWorkSection.tsx`

**Purpose**: Deep work practice section

### 4.10 Ritual Components (src/components/rituals/)

Ritual components handle daily integration rituals.

#### 4.10.1 RitualPicker (RitualPicker.tsx)

**File**: `src/components/rituals/RitualPicker.tsx`

**Purpose**: Selection interface for rituals

#### 4.10.2 IntegrationRitual (IntegrationRitual.tsx)

**File**: `src/components/rituals/IntegrationRitual.tsx`

**Purpose**: Integration ritual practice

### 4.11 Session Components (src/components/session/)

Session components handle guided sessions.

#### 4.11.1 EveningSession (EveningSession.tsx)

**File**: `src/components/session/EveningSession.tsx`

**Purpose**: Evening reflection session

**Props**:
- `onComplete`: Session completion handler
- `onCancel`: Session cancellation handler

**Modes**:
- `wizard`: Step-by-step wizard
- `conversation`: AI conversation mode

**Steps**:
1. Greeting
2. Day Review
3. Experience Harvesting
4. Integration
5. Gratitude
6. Complete

#### 4.11.2 Session Scheduler

See `src/components/scheduling/SessionScheduler.tsx`

### 4.12 Analytics Components (src/components/analytics/)

Analytics components provide progress insights and reports.

#### 4.12.1 AIInsights (AIInsights.tsx)

**File**: `src/components/analytics/AIInsights.tsx`

**Purpose**: AI-generated insights dashboard

#### 4.12.2 FeedbackAnalyticsDashboard (FeedbackAnalyticsDashboard.tsx)

**File**: `src/components/analytics/FeedbackAnalyticsDashboard.tsx`

**Purpose**: Analytics for user feedback

#### 4.12.3 MonthlyReport (MonthlyReport.tsx)

**File**: `src/components/analytics/MonthlyReport.tsx`

**Purpose**: Monthly progress report

### 4.13 Safety Components (src/components/safety/)

Safety components provide crisis support and wellbeing features.

#### 4.13.1 CrisisSupport (CrisisSupport.tsx)

**File**: `src/components/safety/CrisisSupport.tsx`

**Purpose**: Crisis support resources

#### 4.13.2 FollowUpPrompt (FollowUpPrompt.tsx)

**File**: `src/components/safety/FollowUpPrompt.tsx`

**Purpose**: Wellbeing follow-up prompts

### 4.14 Scheduling Components (src/components/scheduling/)

Scheduling components handle session scheduling.

#### 4.14.1 SessionScheduler (SessionScheduler.tsx)

**File**: `src/components/scheduling/SessionScheduler.tsx`

**Purpose**: Schedule practice sessions

### 4.15 Settings Components (src/components/settings/)

Settings components provide user preference management.

#### 4.15.1 NotificationSettings (NotificationSettings.tsx)

**File**: `src/components/settings/NotificationSettings.tsx`

**Purpose**: Notification preferences

#### 4.15.2 SoundPreviewGrid (SoundPreviewGrid.tsx)

**File**: `src/components/settings/SoundPreviewGrid.tsx`

**Purpose**: Preview available sounds

#### 4.15.3 VoiceSettings (VoiceSettings.tsx)

**File**: `src/components/settings/VoiceSettings.tsx`

**Purpose**: Voice and audio preferences

### 4.16 Feedback Components (src/components/feedback/)

Feedback components handle user feedback collection.

#### 4.16.1 DayFeedbackModal (DayFeedbackModal.tsx)

**File**: `src/components/feedback/DayFeedbackModal.tsx`

**Purpose**: Daily feedback collection

### 4.17 Chat Components (src/components/chat/)

Chat components provide chat functionality.

#### 4.17.1 PatternIndicator (PatternIndicator.tsx)

**File**: `src/components/chat/PatternIndicator.tsx`

**Purpose**: Display detected patterns in chat

#### 4.17.2 LoopInsightCard (LoopInsightCard.tsx)

**File**: `src/components/chat/LoopInsightCard.tsx`

**Purpose**: Display loop insights in chat

### 4.18 Avatar Components (src/components/avatar/)

Avatar components handle user representation.

#### 4.18.1 BuddhaAvatar3D (BuddhaAvatar3D.tsx)

**File**: `src/components/avatar/BuddhaAvatar3D.tsx`

**Purpose**: 3D Buddha avatar visualization

### 4.19 Layout Components (src/components/layout/)

Layout components provide the application shell structure.

#### 4.19.1 AppLayout (AppLayout.tsx)

**File**: `src/components/layout/AppLayout.tsx`

**Purpose**: Main application layout

**Features**:
- Navigation sidebar
- Header with status
- Responsive design
- Theme integration

#### 4.19.2 PageShell (PageShell.tsx)

**File**: `src/components/layout/PageShell.tsx`

**Purpose**: Page wrapper with common elements

#### 4.19.3 ScrollToTop (ScrollToTop.tsx)

**File**: `src/components/layout/ScrollToTop.tsx`

**Purpose**: Reset scroll position on navigation

### 4.20 Auth Components (src/components/auth/)

Auth components handle authentication flows.

#### 4.20.1 RequireAuth (RequireAuth.tsx)

**File**: `src/components/auth/RequireAuth.tsx`

**Purpose**: Route protection component

**Props**:
- `children`: Protected content
- `redirectPath`: Redirect path for unauthenticated users

### 4.21 Landing Components (src/components/landing/)

Landing components build the marketing homepage.

#### 4.21.1 Hero3DSpace (Hero3DSpace.tsx)

**File**: `src/components/landing/Hero3DSpace.tsx`

**Purpose**: 3D hero section with space visualization

#### 4.21.2 FloatingGeometry (FloatingGeometry.tsx)

**File**: `src/components/landing/FloatingGeometry.tsx`

**Purpose**: Floating sacred geometry animation

#### 4.21.3 AdaptiveDayDemo (AdaptiveDayDemo.tsx)

**File**: `src/components/landing/AdaptiveDayDemo.tsx`

**Purpose**: Demo of adaptive day functionality

#### 4.21.4 LoopDiscoveryQuiz (LoopDiscoveryQuiz.tsx)

**File**: `src/components/landing/LoopDiscoveryQuiz.tsx`

**Purpose**: Quiz to discover personal loops

### 4.22 Onboarding Components (src/components/onboarding/)

Onboarding components guide new users through setup.

#### 4.22.1 WelcomeScreen (WelcomeScreen.tsx)

**File**: `src/components/onboarding/WelcomeScreen.tsx`

**Purpose**: Welcome introduction

#### 4.22.2 ThreeBodiesVisual (ThreeBodiesVisual.tsx)

**File**: `src/components/onboarding/ThreeBodiesVisual.tsx`

**Purpose**: Visualization of the three bodies concept

#### 4.22.3 DepthRevelation (DepthRevelation.tsx)

**File**: `src/components/onboarding/DepthRevelation.tsx`

**Purpose**: Deep content revelation

#### 4.22.4 AwakeningTransition (AwakeningTransition.tsx)

**File**: `src/components/onboarding/AwakeningTransition.tsx`

**Purpose**: Transition animation for awakening

#### 4.22.5 EnergySwirlAnimation (EnergySwirlAnimation.tsx)

**File**: `src/components/onboarding/EnergySwirlAnimation.tsx`

**Purpose**: Energy visualization animation

#### 4.22.6 SkipOnboardingButton (SkipOnboardingButton.tsx)

**File**: `src/components/onboarding/SkipOnboardingButton.tsx`

**Purpose**: Skip onboarding option

### 4.23 Task Components (src/components/tasks/)

Task components manage task functionality.

#### 4.23.1 ChainedTab (ChainedTab.tsx)

**File**: `src/components/tasks/ChainedTab.tsx`

**Purpose**: Tab for task chains

---

## 5. Custom Hooks Documentation

### 5.1 Adaptive System Hooks

#### 5.1.1 useAdaptiveSystem

**File**: `src/hooks/useAdaptiveSystem.ts`

**Purpose**: Core hook for adaptive system functionality

**Returns**:
```typescript
{
  userState: UserState,
  dailyPackage: DailyPackage,
  recommendations: Recommendation[],
  adaptToUser: (updates: Partial<UserState>) => void
}
```

#### 5.1.2 useAdaptiveDay

**File**: `src/hooks/useAdaptiveDay.ts`

**Purpose**: Manage daily adaptive state

**Returns**:
```typescript
{
  today: AdaptiveDay | null,
  loading: boolean,
  completeBlock: (blockId: string) => Promise<void>,
  updateMorningCheckIn: (data: CheckInData) => Promise<void>,
  completeEveningReflection: (data: ReflectionData) => Promise<void>
}
```

#### 5.1.3 useAdaptiveCapacityGrowth

**File**: `src/hooks/useAdaptiveCapacityGrowth.ts`

**Purpose**: Track capacity development

#### 5.1.4 useAdaptiveCapacitySync

**File**: `src/hooks/useAdaptiveCapacitySync.ts`

**Purpose**: Sync capacity data across sessions

#### 5.1.5 useAdaptiveDayStatus

**File**: `src/hooks/useAdaptiveDayStatus.ts`

**Purpose**: Get current day status

**Returns**:
```typescript
{
  status: 'morning' | 'midday' | 'afternoon' | 'evening' | 'night',
  progress: number,
  nextMilestone: string
}
```

#### 5.1.6 useAdaptiveDayComplete

**File**: `src/hooks/useAdaptiveDayComplete.ts`

**Purpose**: Handle day completion logic

#### 5.1.7 useAdaptiveLoopPersistence

**File**: `src/hooks/useAdaptiveLoopPersistence.ts`

**Purpose**: Persist loop work across sessions

#### 5.1.8 useAdaptiveVLevelInit

**File**: `src/hooks/useAdaptiveVLevelInit.ts`

**Purpose**: Initialize V-Level tracking

#### 5.1.9 useAdaptiveXP

**File**: `src/hooks/useAdaptiveXP.ts`

**Purpose**: Track XP in adaptive mode

### 5.2 V-Level and Progression Hooks

#### 5.2.1 useVLevel

**File**: `src/hooks/useVLevel.ts`

**Purpose**: Manage V-Level (visibility level) state

**Returns**:
```typescript
{
  vLevel: number,
  vXP: number,
  nextLevelXP: number,
  levelProgress: number,
  isLoading: boolean
}
```

#### 5.2.2 useVLevelAutoProgression

**File**: `src/hooks/useVLevelAutoProgression.ts`

**Purpose**: Automatic V-Level progression

#### 5.2.3 useLevelProgression

**File**: `src/hooks/useLevelProgression.ts`

**Purpose**: Handle level progression logic

**Returns**:
```typescript
{
  currentLevel: number,
  xpToNextLevel: number,
  levelProgress: number,
  canLevelUp: boolean,
  levelUp: () => Promise<void>
}
```

#### 5.2.4 useLevelGate

**File**: `src/hooks/useLevelGate.ts`

**Purpose**: Check level gate requirements

### 5.3 XP and Gamification Hooks

#### 5.3.1 useGamification

**File**: `src/hooks/useGamification.ts`

**Purpose**: Manage gamification visibility

**Returns**:
```typescript
{
  visibility: {
    showXP: boolean,
    showLevel: boolean,
    showStreak: boolean,
    showBadges: boolean,
    opacity: number
  },
  isGameMode: boolean,
  showGamification: boolean,
  xpMultiplier: number
}
```

#### 5.3.2 useXPSystem

**File**: `src/hooks/useXPSystem.ts`

**Purpose**: Core XP tracking system

#### 5.3.3 useBlockXP

**File**: `src/hooks/useBlockXP.ts`

**Purpose**: Track XP for practice blocks

#### 5.3.4 usePracticeXP

**File**: `src/hooks/usePracticeXP.ts`

**Purpose**: XP for practice completion

#### 5.3.5 useJournalXP

**File**: `src/hooks/useJournalXP.ts`

**Purpose**: XP for journal entries

#### 5.3.6 useUnifiedXP

**File**: `src/hooks/useUnifiedXP.ts`

**Purpose**: Unified XP tracking across all activities

#### 5.3.7 useCompletionTracking

**File**: `src/hooks/useCompletionTracking.ts`

**Purpose**: Track completion rates

#### 5.3.8 useBlockCompletion

**File**: `src/hooks/useBlockCompletion.ts`

**Purpose**: Track block completion

### 5.4 Journey Hooks

#### 5.4.1 useJourney

**File**: `src/hooks/useJourney.ts`

**Purpose**: Core journey management

**Returns**:
```typescript
{
  journey: Journey | null,
  tasks: Task[],
  loading: boolean,
  fetchTodayJourney: () => Promise<void>,
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
}
```

#### 5.4.2 useDayChain

**File**: `src/hooks/useDayChain.ts`

**Purpose**: Manage daily chain of activities

**Returns**:
```typescript
{
  dayChain: DayChain | null,
  getTotalXP: () => number,
  completeActivity: (activityId: string) => Promise<void>
}
```

#### 5.4.3 useSessionFlow

**File**: `src/hooks/useSessionFlow.ts`

**Purpose**: Manage guided session flow

**Returns**:
```typescript
{
  session: Session | null,
  nextStep: () => void,
  prevStep: () => void,
  setSessionData: (key: string, value: any) => void,
  completeSession: () => Promise<void>,
  loading: boolean
}
```

#### 5.4.4 useSessionChain

**File**: `src/hooks/useSessionChain.ts`

**Purpose**: Chain sessions together

#### 5.4.5 useDayStatus

**File**: `src/hooks/useDayStatus.ts`

**Purpose**: Get day status information

#### 5.4.6 useLifeDomains

**File**: `src/hooks/useLifeDomains.ts`

**Purpose**: Manage life domain progress

**Returns**:
```typescript
{
  domains: LifeDomain[],
  updateDomain: (domainId: string, progress: number) => Promise<void>
}
```

#### 5.4.7 useDomainTasks

**File**: `src/hooks/useDomainTasks.ts`

**Purpose**: Get tasks for specific domains

#### 5.4.8 useDomainBalanceEngine

**File**: `src/hooks/useDomainBalanceEngine.ts`

**Purpose**: Balance domain attention

### 5.5 Loop Hooks

#### 5.5.1 useLoops

**File**: `src/hooks/useLoops.ts`

**Purpose**: Manage psychological loops

**Returns**:
```typescript
{
  loops: Loop[],
  activeLoops: Loop[],
  getActiveLoops: () => Loop[],
  updateLoop: (loopId: string, updates: Partial<Loop>) => Promise<void>
}
```

#### 5.5.2 useLoopPrioritization

**File**: `src/hooks/useLoopPrioritization.ts`

**Purpose**: Prioritize loops for work

**Returns**:
```typescript
{
  result: {
    primaryLoop: Loop | null,
    secondaryLoops: Loop[],
    suggestedOrder: string[]
  }
}
```

#### 5.5.3 useLoopDissolution

**File**: `src/hooks/useLoopDissolution.ts`

**Purpose**: Track loop dissolution progress

#### 5.5.4 usePatternDetection

**File**: `src/hooks/usePatternDetection.ts`

**Purpose**: Detect psychological patterns

#### 5.5.5 usePatternInsights

**File**: `src/hooks/usePatternInsights.ts`

**Purpose**: Generate pattern insights

#### 5.5.6 useShadowWork

**File**: `src/hooks/useShadowWork.ts`

**Purpose**: Manage shadow work sessions

### 5.6 Guru and AI Hooks

#### 5.6.1 useGuruChat

**File**: `src/hooks/useGuruChat.ts`

**Purpose**: AI guru chat interface

**Returns**:
```typescript
{
  messages: Message[],
  sendMessage: (content: string) => Promise<void>,
  isTyping: boolean
}
```

#### 5.6.2 useGuruMemory

**File**: `src/hooks/useGuruMemory.ts`

**Purpose**: Guru memory management

**Returns**:
```typescript
{
  memories: Memory[],
  addMemory: (type: string, content: string, metadata: object, importance: number) => Promise<void>,
  getMemories: (filter?: MemoryFilter) => Memory[]
}
```

#### 5.6.3 useGuruMemorySaver

**File**: `src/hooks/useGuruMemorySaver.ts`

**Purpose**: Save guru memories to persistence

#### 5.6.4 useGuruSessionIntelligence

**File**: `src/hooks/useGuruSessionIntelligence.ts`

**Purpose**: Session intelligence features

#### 5.6.5 useGuruToneAdapter

**File**: `src/hooks/useGuruToneAdapter.ts`

**Purpose**: Adapt guru tone to user state

#### 5.6.6 useAIDecision

**File**: `src/hooks/useAIDecision.ts`

**Purpose**: AI-assisted decision making

**Returns**:
```typescript
{
  recommendations: Decision[],
  isNightTime: boolean,
  getRecommendation: (context: DecisionContext) => Decision
}
```

#### 5.6.7 usePredictiveEngine

**File**: `src/hooks/usePredictiveEngine.ts`

**Purpose**: Predictive analytics engine

#### 5.6.8 useRegressionEngine

**File**: `src/hooks/useRegressionEngine.ts`

**Purpose**: Regression detection engine

#### 5.6.9 useRegressionProtocol

**File**: `src/hooks/useRegressionProtocol.ts`

**Purpose**: Handle user regression

#### 5.6.10 useTransformationEngine

**File**: `src/hooks/useTransformationEngine.ts`

**Purpose**: Transformation tracking engine

#### 5.6.11 useRealtimeAdaptation

**File**: `src/hooks/useRealtimeAdaptation.ts`

**Purpose**: Real-time adaptation to user state

#### 5.6.12 useEngineOrchestrator

**File**: `src/hooks/useEngineOrchestrator.ts`

**Purpose**: Orchestrate multiple engines

#### 5.6.13 useCapacityDetection

**File**: `src/hooks/useCapacityDetection.ts`

**Purpose**: Detect capacity levels

#### 5.6.14 useCapacityGrowthEngine

**File**: `src/hooks/useCapacityGrowthEngine.ts`

**Purpose**: Capacity growth engine

#### 5.6.15 useCapacities

**File**: `src/hooks/useCapacities.ts`

**Purpose**: Get capacity values

### 5.7 Time and Scheduling Hooks

#### 5.7.1 useScheduling

**File**: `src/hooks/useScheduling.ts`

**Purpose**: Schedule management

**Returns**:
```typescript
{
  sessions: ScheduledSession[],
  scheduleSession: (session: SessionData) => Promise<void>,
  cancelSession: (sessionId: string) => Promise<void>
}
```

#### 5.7.2 useTimezoneAwareDate

**File**: `src/hooks/useTimezoneAwareDate.ts`

**Purpose**: Timezone-aware date handling

#### 5.7.3 useTimezoneStreak

**File**: `src/hooks/useTimezoneStreak.ts`

**Purpose**: Timezone-aware streak tracking

#### 5.7.4 useNightMode

**File**: `src/hooks/useNightMode.ts`

**Purpose**: Night mode state

**Returns**:
```typescript
{
  isNightTime: boolean,
  shouldShowNightWelcome: boolean,
  enterNightMode: () => void,
  exitNightMode: () => void
}
```

#### 5.7.5 useNightTimeFirstUser

**File**: `src/hooks/useNightTimeFirstUser.ts`

**Purpose**: First-time user night check

#### 5.7.6 useAfternoonPing

**File**: `src/hooks/useAfternoonPing.ts`

**Purpose**: Manage afternoon ping state

**Returns**:
```typescript
{
  shouldShowPing: boolean,
  dismissPing: () => void,
  completePing: () => Promise<void>
}
```

### 5.8 Profile and User Hooks

#### 5.8.1 useProfile

**File**: `src/hooks/useProfile.ts`

**Purpose**: User profile management

**Returns**:
```typescript
{
  profile: Profile | null,
  loading: boolean,
  updateProfile: (updates: Partial<Profile>) => Promise<void>,
  dayNumber: number,
  effectiveUserId: string | null
}
```

### 5.9 Practice Hooks

#### 5.9.1 usePractices

**File**: `src/hooks/usePractices.ts`

**Purpose**: Practice library management

**Returns**:
```typescript
{
  practices: Practice[],
  favorites: string[],
  addToFavorites: (practiceId: string) => void,
  removeFromFavorites: (practiceId: string) => void
}
```

#### 5.9.2 usePracticeTimer

**File**: `src/hooks/usePracticeTimer.ts`

**Purpose**: Practice timer functionality

**Returns**:
```typescript
{
  timeRemaining: number,
  isRunning: boolean,
  start: () => void,
  pause: () => void,
  reset: () => void,
  complete: () => Promise<void>
}
```

#### 5.9.3 useMeditationVoiceGuide

**File**: `src/hooks/useMeditationVoiceGuide.ts`

**Purpose**: Voice guide for meditation

### 5.10 Analytics Hooks

#### 5.10.1 useAnalytics

**File**: `src/hooks/useAnalytics.ts`

**Purpose**: Analytics data management

**Returns**:
```typescript
{
  stats: AnalyticsStats,
  fetchAnalytics: (timeRange: TimeRange) => Promise<void>,
  exportData: () => Promise<void>
}
```

#### 5.10.2 useFeedbackAnalytics

**File**: `src/hooks/useFeedbackAnalytics.ts`

**Purpose**: Feedback analytics

### 5.11 Journal Hooks

#### 5.11.1 useJournal

**File**: `src/hooks/useJournal.ts`

**Purpose**: Journal management

**Returns**:
```typescript
{
  entries: JournalEntry[],
  createEntry: (content: string, metadata?: EntryMetadata) => Promise<void>,
  updateEntry: (entryId: string, content: string) => Promise<void>,
  deleteEntry: (entryId: string) => Promise<void>
}
```

#### 5.11.2 useDayFeedback

**File**: `src/hooks/useDayFeedback.ts`

**Purpose**: Daily feedback collection

#### 5.11.3 useBreakthroughDetection

**File**: `src/hooks/useBreakthroughDetection.ts`

**Purpose**: Detect breakthrough moments

### 5.12 Safety Hooks

#### 5.12.1 useSafetyMonitor

**File**: `src/hooks/useSafetyMonitor.ts`

**Purpose**: Safety monitoring

#### 5.12.2 useCrisisDetection

**File**: `src/hooks/useCrisisDetection.ts`

**Purpose**: Crisis detection

#### 5.12.3 useFollowUpSystem

**File**: `src/hooks/useFollowUpSystem.ts`

**Purpose**: Follow-up prompts

#### 5.12.4 useEdgeCaseHandler

**File**: `src/hooks/useEdgeCaseHandler.ts`

**Purpose**: Handle edge cases

### 5.13 Streak Hooks

#### 5.13.1 useStreakManager

**File**: `src/hooks/useStreakManager.ts`

**Purpose**: Streak management

**Returns**:
```typescript
{
  streak: number,
  longestStreak: number,
  streakHistory: StreakDay[],
  incrementStreak: () => Promise<void>,
  resetStreak: () => void
}
```

#### 5.13.2 useStreakGuardian

**File**: `src/hooks/useStreakGuardian.ts`

**Purpose**: Protect streak from loss

### 5.14 Integration Hooks

#### 5.14.1 useIntegrationRituals

**File**: `src/hooks/useIntegrationRituals.ts`

**Purpose**: Integration ritual management

#### 5.14.2 useEnergyWatcher

**File**: `src/hooks/useEnergyWatcher.ts`

**Purpose**: Energy level monitoring

### 5.15 Data and Persistence Hooks

#### 5.15.1 useDataExport

**File**: `src/hooks/useDataExport.ts`

**Purpose**: Export user data

#### 5.15.2 useOfflineSync

**File**: `src/hooks/useOfflineSync.ts`

**Purpose**: Offline data synchronization

#### 5.15.3 useProgressSync

**File**: `src/hooks/useProgressSync.ts`

**Purpose**: Sync progress across devices

### 5.16 Device and Utility Hooks

#### 5.16.1 useMobile

**File**: `src/hooks/use-mobile.tsx`

**Purpose**: Mobile device detection

**Returns**:
```typescript
{
  isMobile: boolean,
  isTablet: boolean,
  isDesktop: boolean
}
```

#### 5.16.2 useDeviceCapability

**File**: `src/hooks/useDeviceCapability.ts`

**Purpose**: Device capability detection

**Returns**:
```typescript
{
  canRender3D: boolean,
  supportsWebGL: boolean,
  performanceLevel: 'low' | 'medium' | 'high'
}
```

#### 5.16.3 useScrollToTop

**File**: `src/hooks/useScrollToTop.ts`

**Purpose**: Scroll to top functionality

#### 5.16.4 useNotifications

**File**: `src/hooks/useNotifications.ts`

**Purpose**: Notification management

#### 5.16.5 usePushNotifications

**File**: `src/hooks/usePushNotifications.ts`

**Purpose**: Push notification handling

#### 5.16.6 useAudio

**File**: `src/hooks/useAudio.ts`

**Purpose**: Audio playback management

#### 5.16.7 useSoundEffects

**File**: `src/hooks/useSoundEffects.ts`

**Purpose**: Sound effect playback

**Returns**:
```typescript
{
  playClick: () => void,
  playTransition: () => void,
  playSuccess: () => void,
  playError: () => void
}
```

#### 5.16.8 useVoiceJournal

**File**: `src/hooks/useVoiceJournal.ts`

**Purpose**: Voice journal recording

#### 5.16.9 useVoiceMode

**File**: `src/hooks/useVoiceMode.ts`

**Purpose**: Voice mode toggle

#### 5.16.10 useSubmitGuard

**File**: `src/hooks/useSubmitGuard.ts`

**Purpose**: Form submission guard

#### 5.16.11 useModeAwareTags

**File**: `src/hooks/useModeAwareTags.ts`

**Purpose**: Mode-aware tagging

#### 5.16.12 useSemanticMemory

**File**: `src/hooks/useSemanticMemory.ts`

**Purpose**: Semantic memory management

#### 5.16.13 useFirstDayDiscovery

**File**: `src/hooks/useFirstDayDiscovery.ts`

**Purpose**: First day experience

#### 5.16.14 useOnboardingFlow

**File**: `src/hooks/useOnboardingFlow.ts`

**Purpose**: Onboarding flow management

#### 5.16.15 useWisdom

**File**: `src/hooks/useWisdom.ts`

**Purpose**: Wisdom content access

#### 5.16.16 usePhaseGating

**File**: `src/hooks/usePhaseGating.ts`

**Purpose**: Phase gate checking

### 5.17 Progress Hooks

#### 5.17.1 useProgressSync

**File**: `src/hooks/useProgressSync.ts`

**Purpose**: Sync progress data

### 5.18 Session Hooks

#### 5.18.1 useSessionFlow

**File**: `src/hooks/useSessionFlow.ts`

**Purpose**: Manage session flow

**Returns**:
```typescript
{
  session: Session | null,
  step: string,
  nextStep: () => void,
  prevStep: () => void,
  setStepData: (data: any) => void,
  completeSession: () => Promise<void>
}
```

---

## 6. Context Providers Documentation

### 6.1 ThemeContext

**File**: `src/contexts/ThemeContext.tsx`

**Purpose**: Manage application theme (light/dark mode)

**Provides**:
```typescript
{
  theme: 'light' | 'dark' | 'system',
  setTheme: (theme: Theme) => void,
  resolvedTheme: 'light' | 'dark'
}
```

### 6.2 PreferencesContext

**File**: `src/contexts/PreferencesContext.tsx`

**Purpose**: Store user preferences

**Provides**:
```typescript
{
  preferences: UserPreferences,
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void
}
```

**Preference Categories**:
- Display preferences
- Notification preferences
- Sound preferences
- Privacy settings

### 6.3 PerformanceContext

**File**: `src/contexts/PerformanceContext.tsx`

**Purpose**: Optimize for device capabilities

**Provides**:
```typescript
{
  performanceLevel: 'low' | 'medium' | 'high',
  prefersReducedMotion: boolean,
  isLowEnd: boolean,
  shouldReduceAnimations: boolean
}
```

### 6.4 AuthContext (AuthProvider)

**File**: `src/auth/AuthProvider.tsx`

**Purpose**: Authentication state management

**Provides**:
```typescript
{
  user: User | null,
  session: Session | null,
  loading: boolean,
  signIn: (email: string, password: string) => Promise<void>,
  signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<void>,
  signOut: () => Promise<void>,
  resetPassword: (email: string) => Promise<void>
}
```

---

## 7. Data Files Documentation

### 7.1 Journey Data

#### 7.1.1 level0Teachings.ts

**File**: `src/data/journey/level0Teachings.ts`

**Purpose**: Level 0 (Depth Revelation) teaching content

**Data Structures**:
- `DEPTH_SLIDES`: Array of teaching slides
- `THREE_BODIES`: Three bodies concept data
- `UNDERSTANDING_QUIZ`: Assessment questions
- `JOURNEY_PATHS`: Path selection options

**Content Areas**:
1. "You Are More Programmed Than You Know"
2. "Why Mental Health is a Modern Epidemic"
3. "The Three Bodies"
4. "Why Your Intellect Works Against You"
5. "The Mechanism of Your Suffering"
6. "The Only Way Out"

### 7.2 Configuration Files

See `src/lib/` for configuration files

---

## 8. Routing and Navigation

### 8.1 Route Structure

The application uses React Router for navigation with the following structure:

```typescript
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<Landing />} />
  <Route path="/auth" element={<Auth />} />
  <Route path="/seed" element={<SeedData />} />
  
  {/* Protected Routes */}
  <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
  
  {/* App Layout Routes */}
  <Route path="/app" element={<RequireAuth><AppLayout /></RequireAuth>}>
    <Route index element={<Home />} />
    <Route path="tasks" element={<Tasks />} />
    <Route path="master" element={<Master />} />
    <Route path="journal" element={<Journal />} />
    <Route path="explore" element={<Explore />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="practice" element={<Practice />} />
    <Route path="settings" element={<Settings />} />
    <Route path="profile" element={<Profile />} />
    <Route path="graduation" element={<Graduation />} />
    <Route path="dev-test" element={<DevTest />} />
  </Route>
  
  {/* 404 */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

### 8.2 Navigation Hooks

The application uses React Router hooks for navigation:

```typescript
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const navigate = useNavigate();
const location = useLocation();
const params = useParams();
```

### 8.3 Custom Events

The application dispatches custom events for cross-component communication:

```typescript
// Presence ping event
window.dispatchEvent(new CustomEvent('consciousOS:presence_ping'));

// Day completion event
window.dispatchEvent(new CustomEvent('consciousOS:day_complete'));
```

---

## 9. State Management

### 9.1 Server State (React Query)

The application uses TanStack Query for server state management:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});
```

### 9.2 Client State (React Context)

Client state is managed through React Context providers:

- `ThemeContext`: Theme state
- `PreferencesContext`: User preferences
- `PerformanceContext`: Performance optimization
- `AuthContext`: Authentication state

### 9.3 Local State

Component-level state is managed with React hooks:

- `useState`: Simple state
- `useReducer`: Complex state logic
- `useRef`: Mutable references

---

## 10. API Integrations

### 10.1 Supabase Integration

**File**: `src/integrations/supabase/client.ts`

The application uses Supabase for:

- **Authentication**: User sign-up, sign-in, password recovery
- **Database**: User profiles, journey data, journal entries
- **Edge Functions**: AI-powered features
- **Real-time**: Live updates

### 10.2 API Functions

Common API patterns:

```typescript
// Fetch data
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);

// Invoke edge function
const { data, error } = await supabase.functions.invoke('function_name', {
  body: { key: 'value' }
});
```

---

## 11. Authentication System

### 11.1 AuthProvider

**File**: `src/auth/AuthProvider.tsx`

The AuthProvider manages the complete authentication lifecycle:

**Features**:
- Session persistence
- Token refresh
- User metadata management
- Protected route integration

### 11.2 Protected Routes

The `RequireAuth` component protects routes:

```typescript
<Route path="/protected" element={
  <RequireAuth>
    <ProtectedComponent />
  </RequireAuth>
} />
```

### 11.3 Auth Methods

```typescript
// Sign up
await signUp(email, password, { display_name });

// Sign in
await signIn(email, password);

// Sign out
await signOut();

// Reset password
await resetPassword(email);
```

---

## 12. Adaptive System Documentation

### 12.1 System Overview

The Adaptive System is the core AI-powered personalization engine that tailors the ConsciousOS experience to each user's unique journey.

### 12.2 Key Concepts

#### 12.2.1 V-Level (Visibility Level)

V-Level represents the user's progression through visibility layers:

- **Level 1-2**: Introduction phase
- **Level 3-4**: Pattern recognition
- **Level 5-6**: Deep work
- **Level 7-8**: Integration
- **Level 9-10**: Mastery

#### 12.2.2 H-Level (Health Level)

H-Levels track capacity development across 12 dimensions:

1. Awareness
2. Presence
3. Equanimity
4. Compassion
5. Wisdom
6. Courage
7. Patience
8. Discipline
9. Humility
10. Gratitude
11. Acceptance
12. Love

#### 12.2.3 Loops

Loops are recurring psychological patterns that users work through:

- Anxiety
- Fear
- Anger
- Sadness
- Shame
- Guilt
- Control
- Approval Seeking
- Perfectionism
- Avoidance

### 12.3 Daily Package System

The daily package is AI-generated and includes:

- **Theme**: Daily focus theme
- **Blocks**: Practice, learning, reflection blocks
- **Wisdom Seed**: Daily teaching
- **Evening Prompt**: Reflection prompt
- **Energy Calibration**: Energy level adjustment

### 12.4 Time-Based Phases

The system adapts to time of day:

- **Morning**: Check-in, intention setting
- **Midday**: Presence ping, block practice
- **Afternoon**: Deep work, learning
- **Evening**: Reflection, integration
- **Night**: Rest, preparation for tomorrow

---

## 13. Gamification System

### 13.1 XP System

The XP system tracks experience points across activities:

- **Practice XP**: Completed meditation sessions
- **Block XP**: Completed practice blocks
- **Journal XP**: Journal entries
- **Unified XP**: Combined XP tracking

### 13.2 Level Progression

Level progression follows the journey structure:

- Level 0: Depth Revelation
- Level 1: Witness Consciousness
- Level 2: Observing the Observer
- Level 3: The Observer Becomes the Observed
- Level 4: Pure Awareness
- Level 5: Non-Duality
- Level 6: Self-Realization
- Level 7: Liberation

### 13.3 Streak System

Streak tracking encourages consistent practice:

- Daily streak counter
- Streak milestones
- Streak recovery mechanisms
- Streak protection features

### 13.4 Achievements

Achievements recognize significant accomplishments:

- Level completions
- Loop dissolutions
- Streak milestones
- Practice streaks

### 13.5 Adaptive Mode

In Adaptive Mode, gamification is hidden but tracking continues for AI intelligence:

```typescript
const { visibility } = useGamification();
// All visibility values are false
// XP and level tracking continues silently
```

---

## 14. Space and Visual Components

### 14.1 Cosmic Background System

The cosmic background creates an immersive visual experience:

**Components**:
- StarField: Animated star field
- NebulaPillars: Nebula cloud effects
- Comet: Shooting comet animations
- SupernovaBurst: Energy burst effects

### 14.2 Orb System

Orbs represent consciousness and energy levels:

**Orb Types**:
- SolarOrb: Main energy orb
- ConsciousnessOrb: Advanced visualization
- EvolvingOrb: Progress-responsive orb
- GoldenOrb: Premium state
- UltimateOrb: Highest level

### 14.3 Animation System

The application uses Framer Motion for animations:

```typescript
import { motion, AnimatePresence } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
>
  Content
</motion.div>
```

### 14.4 Theme System

The application supports light and dark themes with custom design tokens:

```typescriptwind config extends colors with custom tokens
colors: {

// Tail  primary: { ... },
  secondary: { ... },
  accent: { ... },
  awareness: { ... },
  ethereal: { ... },
}
```

---

## 15. Utilities and Helpers

### 15.1 Utility Functions

**File**: `src/lib/utils.ts`

Common utility functions:

```typescript
import { cn } from "@/lib/utils";

// Class name merging
cn('base-class', condition && 'conditional-class');

// Format functions
formatDate(date: Date): string
formatDuration(seconds: number): string
formatNumber(num: number): string

// Validation functions
isValidEmail(email: string): boolean
isValidUrl(url: string): boolean
```

### 15.2 Type Definitions

**File**: `src/types/` (if present)

Common type definitions for the application:

```typescript
// User types
interface User {
  id: string;
  email: string;
  display_name: string;
  level: number;
  v_level: number;
  // ...
}

// Journey types
interface Journey {
  id: string;
  user_id: string;
  current_level: number;
  v_level: number;
  // ...
}

// Loop types
interface Loop {
  id: string;
  user_id: string;
  loop_type: LoopType;
  intensity: number;
  // ...
}
```

### 15.3 Constants

**File**: `src/lib/constants.ts`

Application constants:

```typescript
export const MAX_DAILY_XP = 1000;
export const XP_PER_PRACTICE = 50;
export const XP_PER_JOURNAL_ENTRY = 25;
export const STREAK_BONUS_MULTIPLIER = 1.5;
```

---

## 16. Configuration Files

### 16.1 TypeScript Configuration

#### tsconfig.json

TypeScript compiler configuration for the entire project:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### tsconfig.app.json

Application-specific TypeScript configuration:

```json
{
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

### 16.2 Vite Configuration

#### vite.config.ts

Vite build configuration:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
        },
      },
    },
  },
});
```

### 16.3 Tailwind Configuration

#### tailwind.config.ts

Tailwind CSS with custom design tokens:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        awareness: {
          DEFAULT: "hsl(var(--awareness))",
        },
        ethereal: {
          DEFAULT: "hsl(var(--ethereal))",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
```

### 16.4 ESLint Configuration

#### eslint.config.js

ESLint configuration for code quality:

```javascript
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];
```

### 16.5 Package.json

#### package.json

Project dependencies and scripts:

```json
{
  "name": "consciousos",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-alert-dialog": "^1.1.1",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-checkbox": "^1.1.1",
    "@radix-ui/react-collapsible": "^1.1.0",
    "@radix-ui/react-context-menu": "^2.2.1",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-hover-card": "^1.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-navigation-menu": "^1.2.0",
    "@radix-ui/react-popover": "^1.1.1",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.0",
    "@radix-ui/react-scroll-area": "^1.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.1",
    "@radix-ui/react-toggle": "^1.1.0",
    "@radix-ui/react-toggle-group": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.2",
    "@supabase/supabase-js": "^2.45.0",
    "@tanstack/react-query": "^5.59.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "date-fns": "^3.6.0",
    "framer-motion": "^11.3.0",
    "lucide-react": "^0.424.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.24.0",
    "recharts": "^2.12.7",
    "sonner": "^1.5.0",
    "tailwind-merge": "^2.4.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "eslint": "^9.9.0",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.9",
    "globals": "^15.9.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.5.3",
    "vite": "^5.4.1"
  }
}
```

### 16.6 Environment Variables

#### .env

Environment configuration:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Conclusion

This comprehensive documentation covers all aspects of the ConsciousOS application, including:

1. **15+ Page Components**: From Landing to Analytics pages
2. **200+ UI Components**: Including base shadcn/ui components and custom ConsciousOS components
3. **90+ Custom Hooks**: Covering all aspects of application functionality
4. **Context Providers**: For theme, preferences, performance, and authentication
5. **Data Files**: Static content and configuration
6. **Routing Structure**: Complete navigation system
7. **State Management**: React Query and Context patterns
8. **API Integrations**: Supabase backend
9. **Adaptive System**: AI-powered personalization
10. **Gamification System**: XP, levels, streaks, achievements
11. **Visual Components**: Space and animation system
12. **Configuration Files**: TypeScript, Vite, Tailwind, ESLint

This documentation provides a complete reference for understanding and working with the ConsciousOS codebase. For specific implementation details, refer to the individual component and hook files mentioned throughout this document.

---

*Document Version: 1.0*
*Last Updated: 2024*
*Total Components Documented: 200+*
*Total Hooks Documented: 90+*
*Total Pages Documented: 16*
