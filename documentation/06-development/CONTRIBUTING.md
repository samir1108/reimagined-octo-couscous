# Contributing to ConsciousOS

Thank you for your interest in contributing to ConsciousOS! This document provides guidelines and workflows for contributing to this consciousness evolution platform.

---

## Code of Conduct

### Our Standards

- **Be respectful** - Treat everyone with respect and consideration
- **Be inclusive** - Welcome contributors from all backgrounds
- **Be constructive** - Provide helpful feedback and suggestions
- **Be patient** - Remember that contributors have varying experience levels
- **Be collaborative** - Work together toward the best solutions

### Unacceptable Behavior

- Harassment, discrimination, or intimidation of any kind
- Trolling, insulting/derogatory comments, or personal attacks
- Public or private harassment
- Publishing others' private information without permission

---

## Development Workflow

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/conscious-os.git
cd conscious-os
```

### 2. Set Up Development Environment

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
bun run dev
```

### 3. Create a Feature Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/improvements

### 4. Make Your Changes

- Write clean, maintainable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 5. Run Validation

Before committing, ensure all checks pass:

```bash
# Run all validation checks
bun run validate

# Or run individually:
bun run lint          # Check code style
bun run typecheck     # TypeScript type checking
bun run test          # Run test suite
bun run format:check  # Check formatting
```

### 6. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear commit history:

```bash
# Format: type(scope): description

git commit -m "feat(profile): add streak freeze indicator"
git commit -m "fix(journal): resolve entry save error"
git commit -m "docs(api): update endpoint documentation"
git commit -m "refactor(machines): simplify journey flow"
git commit -m "test(button): add loading state tests"
```

Commit types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, semicolons, etc.)
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `test` - Adding or correcting tests
- `chore` - Changes to build process or auxiliary tools

### 7. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Then create a PR on GitHub
```

Pull Request guidelines:
- Provide a clear description of the changes
- Reference any related issues
- Include screenshots for UI changes
- Ensure all CI checks pass

---

## Code Standards

### TypeScript

- Enable strict mode - all code must pass strict type checking
- Use explicit return types on exported functions
- Prefer `interface` over `type` for object shapes
- Avoid `any` - use `unknown` if type is uncertain
- Document complex types with JSDoc comments

```typescript
// Good
interface UserProfile {
  id: string;
  displayName: string;
  level: number;
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  // implementation
}

// Avoid
function fetchProfile(id: any): any {
  // implementation
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused (under 200 lines)
- Use composition over inheritance
- Add `displayName` for debugging
- Use React.memo for expensive renders

```typescript
// Good
interface MeditationTimerProps {
  duration: number;
  onComplete?: () => void;
}

export const MeditationTimer = React.memo<MeditationTimerProps>(
  function MeditationTimer({ duration, onComplete }) {
    // Component logic
    return <div>{/* JSX */}</div>;
  }
);
```

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use CSS variables for theming (defined in `src/index.css`)
- Maintain consistent spacing (4px grid system)
- Use semantic color names (not arbitrary values)

```tsx
// Good
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
  Click me
</button>

// Avoid
<button className="bg-[#3b82f6] text-white px-[16px] py-[8px] rounded-[8px]">
  Click me
</button>
```

### State Management

- Use XState for client state (UI flows, forms)
- Use TanStack Query for server state (API data)
- Never mix server state into XState machines
- Keep state as close to where it's used as possible

### Testing

- Write tests for all new features
- Aim for 70%+ code coverage
- Test behavior, not implementation
- Use user-centric queries (getByRole)
- Mock external dependencies

```typescript
// Good test
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));
    
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

## Project Structure

When adding new code, follow the existing structure:

```
src/
├── api/              # Data fetching functions
│   └── *.ts          # One file per domain
├── components/       # React components
│   ├── ui/          # shadcn/ui base components
│   ├── guru/        # Guru-related components
│   └── [feature]/   # Feature-specific components
├── hooks/           # Custom React hooks
│   └── use*.ts
├── machines/        # XState state machines
│   └── *Machine.ts
├── lib/             # Utility functions
│   └── utils.ts
├── pages/           # Page/route components
└── types/           # TypeScript types
```

---

## Documentation

- Update README.md if adding new features
- Add JSDoc comments to public APIs
- Update API.md for new endpoints
- Include examples in documentation
- Keep ADRs up to date for architectural changes

---

## Review Process

1. **Automated Checks** - All PRs must pass CI checks
2. **Code Review** - At least one maintainer approval required
3. **Testing** - New features must include tests
4. **Documentation** - Update docs as needed

Review checklist:
- [ ] Code follows style guidelines
- [ ] Tests pass and coverage is adequate
- [ ] No TypeScript errors
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Performance implications considered

---

## Getting Help

- Check existing [documentation](./docs/)
- Search [GitHub Issues](https://github.com/your-org/conscious-os/issues)
- Ask in the #dev-help Slack channel
- Tag `@dev-team` for urgent issues

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in the application (with permission)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make ConsciousOS better! 🧘
