# ConsciousOS Performance Optimization Guide

## Overview

This document outlines the performance optimization strategies implemented in ConsciousOS to achieve sub-second initial load, 60 FPS interactions, and Lighthouse scores of 95+.

## Current Performance Metrics

| Metric | Before Phase 1 | After Phase 1 | Target |
|--------|---------------|---------------|--------|
| Initial Bundle | 2,977 KB | 220 KB | <150 KB |
| Lighthouse Performance | ~45 | ~78 | 95+ |
| First Contentful Paint | ~3.2s | ~1.4s | <1.0s |
| Time to Interactive | ~5.8s | ~2.1s | <1.5s |

## Optimization Strategies

### 1. Image Optimization

#### WebP Conversion
All images are automatically converted to WebP format with quality-optimized variants:
- **Standard**: 85% quality for primary images
- **Responsive**: 80% quality for smaller sizes

#### Responsive Images
Multiple sizes generated for each image:
- 320w (mobile)
- 640w (tablet)
- 960w (small desktop)
- 1280w (large desktop)

#### Usage
```typescript
import { OptimizedImage } from '@/components/ui/OptimizedImage';

<OptimizedImage
  src="/assets/hero-bg-dark.jpg"
  alt="Hero background"
  sizes="(max-width: 768px) 100vw, 50vw"
  loading="lazy"
/>
```

#### Running Image Optimization
```bash
npm run optimize:images
```

### 2. Code Splitting

#### Vendor Chunks
Our Vite configuration splits code into logical chunks:

| Chunk | Size | Description |
|-------|------|-------------|
| react-vendor | ~45 KB | React, ReactDOM, Router |
| ui-vendor | ~25 KB | Framer Motion, Lucide, utilities |
| radix-vendor | ~35 KB | Radix UI primitives |
| three-vendor | ~180 KB | Three.js, React Three Fiber |
| data-vendor | ~25 KB | React Query, Supabase |
| chart-vendor | ~65 KB | Recharts |
| animation-vendor | ~30 KB | XState |

#### Route-Based Splitting
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
```

### 3. Virtualization

For long lists, use the VirtualizedList component:

```typescript
import { VirtualizedList } from '@/components/ui/VirtualizedList';

<VirtualizedList
  items={tasks}
  renderItem={(task, index) => <TaskCard task={task} />}
  height={600}
  itemHeight={80}
/>
```

**When to use:**
- Lists with >50 items
- Tables with many rows
- Grids with >30 items

### 4. Performance Monitoring

#### Web Vitals Tracking
```typescript
import { initPerformanceMonitoring } from '@/lib/performance';

// Initialize in main.tsx
initPerformanceMonitoring();
```

Tracks:
- Core Web Vitals (LCP, FID, CLS, INP, TTFB)
- Long tasks (>50ms)
- Slow resources (>1s)
- Navigation timing

#### Component Render Performance
```typescript
import { usePerformanceMeasure } from '@/lib/performance';

function MyComponent() {
  const endMeasure = usePerformanceMeasure('MyComponent');
  
  useEffect(() => {
    return endMeasure();
  }, []);
  
  return <div>Content</div>;
}
```

### 5. Memoization

Heavy components use React.memo:

```typescript
import { memo } from 'react';

export const HeavyComponent = memo(function HeavyComponent(props) {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison if needed
  return prevProps.id === nextProps.id;
});
```

### 6. Resource Hints

#### Preconnect
```html
<link rel="preconnect" href="https://api.supabase.co" crossorigin>
```

#### Preload Critical Resources
```html
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
```

#### Prefetch Likely Navigation
```html
<link rel="prefetch" href="/src/pages/Dashboard.tsx">
```

## Performance Budgets

| Resource Type | Budget |
|---------------|--------|
| JavaScript (initial) | <150 KB |
| JavaScript (total) | <500 KB |
| CSS | <50 KB |
| Images | Use WebP, <100 KB each |
| Fonts | <40 KB |
| Total Page Weight | <1 MB |

## Testing Performance

### Lighthouse Audit
```bash
npm run build
npm run preview
# Run Lighthouse in Chrome DevTools
```

### Bundle Analysis
```bash
npm run build
# View dist/stats.html for bundle visualization
```

### Performance Monitoring
Check browser console for:
- Web Vitals metrics
- Slow render warnings
- Memory pressure alerts

## Best Practices

### Do's
- ✅ Use OptimizedImage for all images
- ✅ Virtualize lists with >50 items
- ✅ Memoize heavy components
- ✅ Lazy load below-the-fold content
- ✅ Use CSS transforms for animations
- ✅ Debounce scroll/resize handlers

### Don'ts
- ❌ Load entire libraries for one function
- ❌ Use unoptimized images
- ❌ Render all items in long lists
- ❌ Block main thread with heavy computations
- ❌ Load non-critical CSS/JS synchronously

## Debugging Performance

### Chrome DevTools
1. **Performance Tab**: Record and analyze main thread activity
2. **Lighthouse**: Run comprehensive audits
3. **Network Tab**: Check resource loading order
4. **Memory Tab**: Find memory leaks

### React DevTools Profiler
1. Record component render times
2. Identify unnecessary re-renders
3. Optimize render paths

## Future Optimizations

- [ ] Service Worker precaching
- [ ] HTTP/2 Server Push
- [ ] Critical CSS inlining
- [ ] Image CDN integration
- [ ] Edge function caching
- [ ] Web Workers for heavy computations

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/reference/react/memo)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
- [Lighthouse Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)