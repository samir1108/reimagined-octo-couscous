import { Suspense, lazy, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { OrbMood, OrbVariant } from '@/components/OversoulOrb.heavy';
import { useOrbPersonalization } from '@/hooks/useOrbPersonalization';

const LazyOversoulOrbEmbed = lazy(() => 
  import('@/components/OversoulOrb.heavy').then(module => ({
    default: module.OversoulOrbEmbed
  }))
);

const LazyOversoulOrbLauncher = lazy(() => 
  import('@/components/OversoulOrb.heavy').then(module => ({
    default: module.OversoulOrbLauncher
  }))
);

const LazyOversoulOrbPage = lazy(() => 
  import('@/components/OversoulOrb.heavy').then(module => ({
    default: module.OversoulOrbPage
  }))
);

interface OversoulOrbEmbedProps {
  currentGate: string;
  variant?: OrbVariant;
  mood?: OrbMood;
  onActivate: () => void;
  onHold: () => void;
  onTriple: () => void;
  onHaptic?: (pattern: number | number[]) => void;
  className?: string;
}

export function OversoulOrbEmbedWrapper({
  currentGate,
  variant,
  mood,
  onActivate,
  onHold,
  onTriple,
  onHaptic,
  className,
}: OversoulOrbEmbedProps) {
  // Saved practice/energy preferences tint the real WebGL orb when the caller
  // has not pinned a mood explicitly. Defaults keep the original palette.
  const { mood: personalizationMood } = useOrbPersonalization();
  return (
    <Suspense fallback={<OrbSkeleton />}>
      <div className={className}>
        <LazyOversoulOrbEmbed
          currentGate={currentGate}
          variant={variant}
          mood={mood ?? personalizationMood ?? undefined}
          onActivate={onActivate}
          onHold={onHold}
          onTriple={onTriple}
          onHaptic={onHaptic}
        />
      </div>
    </Suspense>
  );
}

export function OversoulOrbLauncherWrapper({ className }: { className?: string }) {
  return (
    <Suspense fallback={null}>
      <div className={className}>
        <LazyOversoulOrbLauncher />
      </div>
    </Suspense>
  );
}

export function OversoulOrbPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background" />}>
      <LazyOversoulOrbPage />
    </Suspense>
  );
}

function OrbSkeleton() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let time = 0;

    const resize = () => {
      width = canvas.clientWidth * dpr;
      height = canvas.clientHeight * dpr;
      canvas.width = width;
      canvas.height = height;
    };

    const animate = () => {
      time += 0.016;
      resize();

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.3;

      // Pulsing orb
      const pulse = 1 + Math.sin(time * 0.5) * 0.1;
      const radius = baseRadius * pulse;

      // Gradient background
      const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
      grad.addColorStop(0, 'rgba(64, 100, 8, 0.15)');
      grad.addColorStop(0.5, 'rgba(60, 80, 6, 0.08)');
      grad.addColorStop(1, 'rgba(40, 50, 4, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Orb ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 215, 100, ${0.3 + Math.sin(time) * 0.1})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner glow
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 215, 100, ${0.15 + Math.sin(time * 1.5) * 0.05})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className={cn('relative w-full h-full min-h-[300px]', 'sm:min-h-[400px]')}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-muted-foreground/50">
          <div className="animate-pulse text-4xl sm:text-6xl mb-2">✨</div>
          <p className="text-sm">Loading orb...</p>
        </div>
      </div>
    </div>
  );
}

export { OversoulOrbPageWrapper as OversoulOrbPage };
export { OversoulOrbLauncherWrapper as OversoulOrbLauncher };
export { OversoulOrbEmbedWrapper as OversoulOrbEmbed };
