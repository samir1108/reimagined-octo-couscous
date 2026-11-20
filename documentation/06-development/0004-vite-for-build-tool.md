# ADR 0004: Use Vite for Build Tool

## Status

**Accepted**

## Context

ConsciousOS needs a modern build tool that provides:
- Fast development server with HMR (Hot Module Replacement)
- Optimized production builds
- TypeScript support
- Code splitting and lazy loading
- PWA capabilities
- Plugin ecosystem

We evaluated several build tools:

| Option | Pros | Cons |
|--------|------|------|
| Create React App | Familiar, well-documented | Slow, deprecated |
| Next.js | SSR, image optimization | Overkill for SPA, complex |
| Vite | Fast, modern, simple | Newer ecosystem |
| Webpack | Flexible, mature | Complex config, slower |
| Parcel | Zero config | Less control, smaller community |
| esbuild | Extremely fast | Limited plugin ecosystem |

## Decision

We will use **Vite** as our build tool and development server.

### Rationale

1. **Speed** - Near-instant HMR, fast cold starts
2. **Simplicity** - Minimal configuration required
3. **Modern** - Native ESM, modern browser features
4. **Plugin Ecosystem** - Rich plugin ecosystem (PWA, etc.)
5. **TypeScript** - First-class TypeScript support
6. **Production Ready** - Optimized builds with Rollup
7. **Community** - Growing rapidly, good documentation

## Configuration

### Base Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(), // Fast React SWC compiler
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ConsciousOS',
        short_name: 'Conscious',
        theme_color: '#0f172a'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          xstate: ['xstate', '@xstate/react'],
          three: ['three', '@react-three/fiber']
        }
      }
    }
  }
});
```

### Environment Variables

```bash
# .env.development
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_API_URL=http://localhost:3001

# .env.production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_API_URL=https://api.consciousos.app
```

Access in code:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
```

### Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "build:analyze": "vite build --mode analyze",
    "preview": "vite preview"
  }
}
```

## Performance Optimizations

### Code Splitting

```typescript
// Lazy load heavy components
const Guru3D = lazy(() => import('./components/guru/Guru3D'));
const AnalyticsDashboard = lazy(() => import('./components/analytics/AnalyticsDashboard'));

// Use Suspense for loading states
<Suspense fallback={<Skeleton />}>
  <Guru3D />
</Suspense>
```

### Manual Chunks

Vite automatically splits vendor code, but we configure additional chunks:

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        // Core React - loaded on every page
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        
        // State management - loaded after initial render
        'state': ['xstate', '@xstate/react', '@tanstack/react-query'],
        
        // UI components - loaded as needed
        'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', ...],
        
        // 3D - only for guru pages
        'three': ['three', '@react-three/fiber', '@react-three/drei']
      }
    }
  }
}
```

### PWA Configuration

```typescript
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: { maxEntries: 100, maxAgeSeconds: 86400 }
        }
      }
    ]
  },
  manifest: {
    name: 'ConsciousOS',
    short_name: 'Conscious',
    description: 'Consciousness Evolution Platform',
    theme_color: '#0f172a',
    background_color: '#0f172a',
    display: 'standalone',
    icons: [
      { src: '/pwa-192x192.png', sizes: '192x192' },
      { src: '/pwa-512x512.png', sizes: '512x512' }
    ]
  }
})
```

## Consequences

### Positive

- **Fast development** - HMR updates in milliseconds
- **Quick builds** - Production builds are fast
- **Modern output** - Native ESM, optimized bundles
- **Simple config** - Convention over configuration
- **Great DX** - Clear error messages, helpful warnings
- **Plugin ecosystem** - Easy to extend functionality

### Negative

- **Smaller ecosystem** - Fewer plugins than Webpack
- **ESM only** - Some older packages need shim
- **Jest compatibility** - Needs configuration for testing
- **Newer tool** - Less Stack Overflow content

## Migration from CRA

If migrating from Create React App:

1. **Update imports** - Change `process.env` to `import.meta.env`
2. **Move index.html** - From `public/` to root
3. **Update scripts** - Change `react-scripts` to `vite`
4. **Add tsconfig paths** - For `@/` aliases
5. **Test configuration** - Update Jest/Vitest config

## Related Decisions

- [ADR 0003: Supabase for Backend](./0003-supabase-for-backend.md)
- [Performance Optimizations](../PERFORMANCE.md)

## References

- [Vite Documentation](https://vitejs.dev/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Migration from CRA](https://vitejs.dev/guide/migration.html)

## Date

2024-02-01

## Author

Development Team
