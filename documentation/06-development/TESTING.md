# ConsciousOS Testing Guide

Comprehensive testing documentation for the ConsciousOS application.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Test Structure](#test-structure)
4. [Writing Tests](#writing-tests)
5. [Mocking](#mocking)
6. [Coverage](#coverage)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

ConsciousOS uses a world-class testing stack built on:

- **Vitest** - Fast unit testing framework with Vite integration
- **React Testing Library** - Component testing with user-centric queries
- **MSW (Mock Service Worker)** - API mocking for network requests
- **@testing-library/jest-dom** - Custom matchers for DOM assertions

### Testing Philosophy

1. **Test behavior, not implementation** - Focus on what users see and do
2. **Write tests that act as documentation** - Tests should explain the "why"
3. **Keep tests independent** - Each test should set up its own state
4. **Use meaningful test names** - Test names should read like documentation

## Getting Started

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
src/
├── test/
│   ├── setup.ts              # Test environment setup
│   ├── utils/
│   │   ├── render.tsx        # Custom render with providers
│   │   └── factories.ts      # Test data factories
│   ├── mocks/
│   │   ├── server.ts         # MSW server setup
│   │   ├── handlers.ts       # API mock handlers
│   │   └── data/             # Mock data
│   └── integration/          # Integration tests
├── lib/
│   ├── utils.ts
│   └── utils.test.ts         # Unit tests
└── components/
    └── Button/
        ├── Button.tsx
        └── Button.test.tsx
```

## Writing Tests

### Unit Tests

```typescript
import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });
});
```

### Component Tests

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils/render";
import { Button } from "./Button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
```

## Mocking

### MSW - API Mocking

```typescript
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";

server.use(
  http.get("/api/users/:id", () => {
    return HttpResponse.json({ id: "1", name: "Test" });
  })
);
```

## Coverage

### Coverage Goals

- Lines: 70%
- Functions: 70%
- Branches: 60%
- Statements: 70%

```bash
npm run test:coverage
```

## Best Practices

1. **Use Descriptive Test Names** - `it("displays error message when API fails")`
2. **Follow AAA Pattern** - Arrange, Act, Assert
3. **Test Edge Cases** - Empty states, errors, boundaries
4. **Avoid Testing Implementation Details** - Test user-visible behavior
5. **Use Test Data Factories** - Consistent mock data

## Troubleshooting

### Common Issues

- **"Cannot find module"** - Check path aliases in vitest.config.ts
- **"window is not defined"** - Add mocks to setup.ts
- **Tests timing out** - Increase timeout in config or test
