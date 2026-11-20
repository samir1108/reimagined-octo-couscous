"use client";

import { Suspense, useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Html, Stars } from "@react-three/drei";

// Extend Three.js objects for use in JSX
extend(THREE);

// ============================================
// Oversoul Orb - Core Shaders & Materials
// ============================================

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uBreathPhase;
  uniform vec3 uCoreColor;
  uniform vec3 uGlowColor;
  uniform vec3 uParticleColor;
  uniform float uIntensity;
  uniform float uPulseSpeed;
  uniform vec2 uResolution;
  uniform sampler2D uNoiseTexture;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  // Simplex noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
  
  // Fractal Brownian Motion
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }
  
  // Golden ratio constants
  const float PHI = 1.618033988749895;
  const float PI = 3.141592653589793;
  
  void main() {
    // Normalized position on sphere
    vec3 n = normalize(vWorldPosition);
    
    // Time-based animation
    float time = uTime * uPulseSpeed;
    
    // Breathing phase (0 to 1)
    float breath = uBreathPhase;
    
    // Multi-layer noise for organic surface
    float noise1 = fbm(n * 2.0 + time * 0.1);
    float noise2 = fbm(n * 4.0 - time * 0.05);
    float noise3 = fbm(n * 8.0 + time * 0.02);
    
    // Combine noise layers
    float surfaceNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
    
    // Breathing modulation
    float breathMod = 1.0 + breath * 0.08 * sin(time * 2.0);
    
    // Radial distance with noise displacement
    float radius = 1.0 + surfaceNoise * 0.15 * uIntensity;
    radius *= breathMod;
    
    // View direction
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
    
    // Core glow from center
    float coreGlow = pow(1.0 - length(vWorldPosition) / radius, 4.0);
    
    // Particle field
    float particles = 0.0;
    for (int i = 0; i < 3; i++) {
      float pTime = time * 0.3 + float(i) * 2.0;
      vec3 pPos = n * (1.2 + 0.3 * sin(pTime)) + vec3(
        sin(pTime * 1.3 + float(i) * 7.0),
        cos(pTime * 0.9 + float(i) * 3.0),
        sin(pTime * 0.7 + float(i) * 5.0)
      ) * 0.15;
      float dist = length(vWorldPosition - pPos * radius);
      particles += exp(-dist * 30.0) * 0.3;
    }
    
    // Golden spiral pattern
    float phi = atan(n.z, n.x);
    float theta = acos(n.y);
    float spiral = sin(phi * PHI * 3.0 + theta * 5.0 - time * 0.5) * 0.5 + 0.5;
    
    // Color composition
    vec3 color = vec3(0.0);
    
    // Base core
    color += uCoreColor * coreGlow * 0.8;
    
    // Surface with noise
    color += mix(uCoreColor, uGlowColor, surfaceNoise * 0.5 + 0.5) * (1.0 - coreGlow) * 0.6;
    
    // Fresnel glow
    color += uGlowColor * fresnel * 0.4 * uIntensity;
    
    // Breathing pulse
    color += uGlowColor * breath * 0.3 * sin(time * 3.0);
    
    // Spiral pattern
    color += uParticleColor * spiral * 0.15 * uIntensity;
    
    // Particles
    color += uParticleColor * particles;
    
    // Atmospheric rim
    float rim = pow(fresnel, 5.0);
    color += uGlowColor * rim * 0.5;
    
    // Alpha for transparency
    float alpha = 0.6 + coreGlow * 0.4 + fresnel * 0.3;
    alpha *= uIntensity;
    
    // Output
    gl_FragColor = vec4(color, alpha);
  }
`;

const particleVertexShader = `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vPhase;
  varying float vSize;
  
  void main() {
    vColor = aColor;
    vPhase = aPhase;
    vSize = aSize;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragmentShader = `
  uniform float uTime;
  varying vec3 vColor;
  varying float vPhase;
  varying float vSize;
  
  void main() {
    float dist = length(gl_PointCoord - 0.5);
    if (dist > 0.5) discard;
    
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha *= 0.5 + 0.5 * sin(uTime * 2.0 + vPhase * 10.0);
    
    vec3 color = vColor;
    gl_FragColor = vec4(color, alpha);
  }
`;

// ============================================
// Orb Core Component
// ============================================

interface OrbCoreProps {
  size: number;
  intensity: number;
  breathPhase: number;
  coreColor: THREE.Color;
  glowColor: THREE.Color;
  particleColor: THREE.Color;
  pulseSpeed: number;
}

const OrbCore = ({
  size,
  intensity,
  breathPhase,
  coreColor,
  glowColor,
  particleColor,
  pulseSpeed,
}: OrbCoreProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { scene, camera } = useThree();

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      materialRef.current.uniforms.uBreathPhase.value = breathPhase;
      materialRef.current.uniforms.uIntensity.value = intensity;
    }
  });

  useEffect(() => {
    if (meshRef.current) {
      // Add subtle rotation to the orb
      meshRef.current.rotation.y += 0.0001;
      meshRef.current.rotation.x += 0.00005;
    }
  }, []);

  return (
    <mesh
      ref={meshRef}
      geometry={new THREE.SphereGeometry(size, 128, 128)}
      material={
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uBreathPhase: { value: breathPhase },
            uCoreColor: { value: coreColor },
            uGlowColor: { value: glowColor },
            uParticleColor: { value: particleColor },
            uIntensity: { value: intensity },
            uPulseSpeed: { value: pulseSpeed },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      }
    />
  );
};

// ShaderMaterial helper
const shaderMaterial = (
  props: JSX.IntrinsicElements["shaderMaterial"] & { ref?: React.RefObject<THREE.ShaderMaterial> }
) => {
  const { ref, ...materialProps } = props;
  const material = useMemo(() => new THREE.ShaderMaterial(materialProps), []);
  useEffect(() => { if (ref) ref.current = material; }, [ref, material]);
  return <primitive object={material} />;
};

// ============================================
// Particle Field Component
// ============================================

interface ParticleFieldProps {
  count: number;
  size: number;
  colors: THREE.Color[];
  speed: number;
}

const ParticleField = ({ count, size, colors, speed }: ParticleFieldProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { scene } = useThree();

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += speed * 0.0001;
      pointsRef.current.rotation.x += speed * 0.00005;
    }
  });

  // Generate particle geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colorArray = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spherical distribution with golden ratio
      const phi = Math.acos(1 - 2 * (i + 0.5) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      
      const r = size * (0.8 + Math.random() * 0.4);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      sizes[i] = 1.0 + Math.random() * 2.0;
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      colorArray[i * 3] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;
      
      phases[i] = Math.random() * Math.PI * 2;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colorArray, 3));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    
    return geo;
  }, [count, size, colors]);

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={
        <shaderMaterial
          ref={materialRef}
          vertexShader={particleVertexShader}
          fragmentShader={particleFragmentShader}
          uniforms={{
            uTime: { value: 0 },
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      }
    />
  );
};

// ============================================
// Energy Ring Component
// ============================================

interface EnergyRingProps {
  radius: number;
  color: THREE.Color;
  opacity: number;
  rotationSpeed: number;
  segments: number;
}

const EnergyRing = ({ radius, color, opacity, rotationSpeed, segments }: EnergyRingProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.getElapsedTime() * rotationSpeed;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
      meshRef.current.rotation.y = Math.cos(clock.getElapsedTime() * 0.2) * 0.2;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(radius * 0.95, radius * 1.05, segments);
    return geo;
  }, [radius, segments]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={
        <meshBasicMaterial
          color={color}
          opacity={opacity}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      }
    />
  );
};

// ============================================
// Ambient Glow Layer
// ============================================

interface AmbientGlowProps {
  size: number;
  color: THREE.Color;
  intensity: number;
}

const AmbientGlow = ({ size, color, intensity }: AmbientGlowProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
      meshRef.current.scale.setScalar(scale);
      meshRef.current.material.opacity = intensity * (0.3 + 0.2 * Math.sin(clock.getElapsedTime() * 0.7));
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={new THREE.SphereGeometry(size * 1.4, 32, 32)}
      material={
        <meshBasicMaterial
          color={color}
          opacity={intensity * 0.15}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      }
    />
  );
};

// ============================================
// Consciousness State Colors
// ============================================

export const CONSCIOUSNESS_COLORS = {
  observation: {
    core: new THREE.Color(0x3B82F6),
    glow: new THREE.Color(0x60A5FA),
    particle: new THREE.Color(0x93C5FD),
  },
  selfInquiry: {
    core: new THREE.Color(0x8B5CF6),
    glow: new THREE.Color(0xA78BFA),
    particle: new THREE.Color(0xC4B5FD),
  },
  meditation: {
    core: new THREE.Color(0xD6B46A),
    glow: new THREE.Color(0xF2D99A),
    particle: new THREE.Color(0xFDE68A),
  },
  healing: {
    core: new THREE.Color(0x10B981),
    glow: new THREE.Color(0x34D399),
    particle: new THREE.Color(0x6EE7B7),
  },
  focus: {
    core: new THREE.Color(0x06B6D4),
    glow: new THREE.Color(0x22D3EE),
    particle: new THREE.Color(0x67E8F9),
  },
  shadowWork: {
    core: new THREE.Color(0x5B21B6),
    glow: new THREE.Color(0x7C3AED),
    particle: new THREE.Color(0xA78BFA),
  },
  awakening: {
    core: new THREE.Color(0xFEF3C7),
    glow: new THREE.Color(0xFDE68A),
    particle: new THREE.Color(0xFEF08A),
  },
  sleep: {
    core: new THREE.Color(0x1E1B4B),
    glow: new THREE.Color(0x312E81),
    particle: new THREE.Color(0x4338CA),
  },
  integration: {
    core: new THREE.Color(0x86EFAC),
    glow: new THREE.Color(0x4ADE80),
    particle: new THREE.Color(0xBBF7D0),
  },
  gold: {
    core: new THREE.Color(0xD6B46A),
    glow: new THREE.Color(0xF2D99A),
    particle: new THREE.Color(0xFDE68A),
  },
} as const;

type ConsciousnessMode = keyof typeof CONSCIOUSNESS_COLORS;

// ============================================
// Main Oversoul Orb Component
// ============================================

interface OversoulOrbProps {
  size?: number;
  mode?: ConsciousnessMode;
  intensity?: number;
  breathPhase?: number;
  pulseSpeed?: number;
  particleCount?: number;
  showParticles?: boolean;
  showRings?: boolean;
  showAmbientGlow?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

const OversoulOrbCanvas = ({
  size = 280,
  mode = "gold",
  intensity = 1,
  breathPhase = 0,
  pulseSpeed = 1,
  particleCount = 120,
  showParticles = true,
  showRings = true,
  showAmbientGlow = true,
  interactive = true,
  onClick,
  onHover,
}: OversoulOrbProps) => {
  const colors = CONSCIOUSNESS_COLORS[mode];
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const handlePointerOver = () => {
    if (interactive) {
      setHovered(true);
      onHover?.(true);
    }
  };

  const handlePointerOut = () => {
    if (interactive) {
      setHovered(false);
      onHover?.(false);
    }
  };

  const handleClick = () => {
    if (interactive) onClick?.();
  };

  // Camera distance based on orb size
  const cameraDistance = size * 2.5;

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ width: size, height: size, ...style }}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <Canvas
        camera={{ position: [0, 0, cameraDistance], fov: 30 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: false }}
        style={{ width: "100%", height: "100%", display: "block" }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        <color attach="background" color="#000000" args={[0]} />
        
        {/* Fog for depth */}
        <fog attach="fog" args={["#08090D", cameraDistance * 0.5, cameraDistance * 2]} />
        
        {/* Stars background */}
        <Stars radius={cameraDistance * 3} count={2000} opacity={0.15} size={0.5} />
        
        {/* Ambient glow layer */}
        {showAmbientGlow && (
          <AmbientGlow size={size / 2} color={colors.glow} intensity={intensity} />
        )}
        
        {/* Energy rings */}
        {showRings && (
          <>
            <EnergyRing
              radius={size / 2 * 1.1}
              color={colors.glow}
              opacity={0.15 * intensity}
              rotationSpeed={0.05}
              segments={64}
            />
            <EnergyRing
              radius={size / 2 * 1.25}
              color={colors.particle}
              opacity={0.08 * intensity}
              rotationSpeed={-0.03}
              segments={48}
            />
            <EnergyRing
              radius={size / 2 * 1.4}
              color={colors.core}
              opacity={0.05 * intensity}
              rotationSpeed={0.02}
              segments={32}
            />
          </>
        )}
        
        {/* Particle field */}
        {showParticles && (
          <ParticleField
            count={particleCount}
            size={size / 2 * 1.5}
            colors={[colors.core, colors.glow, colors.particle]}
            speed={0.5}
          />
        )}
        
        {/* Core orb */}
        <OrbCore
          size={size / 2}
          intensity={intensity * (hovered ? 1.3 : 1)}
          breathPhase={breathPhase}
          coreColor={colors.core}
          glowColor={colors.glow}
          particleColor={colors.particle}
          pulseSpeed={pulseSpeed}
        />
        
        {/* Interactive HTML overlay for click/touch */}
        {interactive && (
          <Html
            wrapperClass="oversoul-orb-interaction"
            style={{
              position: "absolute",
              inset: 0,
              cursor: "pointer",
              borderRadius: "50%",
              zIndex: 100,
            }}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          />
        )}
      </Canvas>
    </div>
  );
};

// ============================================
// Exported Oversoul Orb Component
// ============================================

export const OversoulOrb = ({
  size = 280,
  mode = "gold",
  intensity = 1,
  breathPhase = 0,
  pulseSpeed = 1,
  particleCount = 120,
  showParticles = true,
  showRings = true,
  showAmbientGlow = true,
  interactive = true,
  onClick,
  onHover,
  className,
  style,
}: OversoulOrbProps) => {
  return (
    <Suspense fallback={
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, ${CONSCIOUSNESS_COLORS[mode].glow.getStyle()} 0%, ${CONSCIOUSNESS_COLORS[mode].core.getStyle()} 40%, transparent 70%)`,
          boxShadow: `0 0 ${size / 4}px ${CONSCIOUSNESS_COLORS[mode].glow.getStyle()}`,
          ...style,
        }}
      />
    }>
      <OversoulOrbCanvas
        size={size}
        mode={mode}
        intensity={intensity}
        breathPhase={breathPhase}
        pulseSpeed={pulseSpeed}
        particleCount={particleCount}
        showParticles={showParticles}
        showRings={showRings}
        showAmbientGlow={showAmbientGlow}
        interactive={interactive}
        onClick={onClick}
        onHover={onHover}
        className={className}
        style={style}
      />
    </Suspense>
  );
};

// ============================================
// Orb Controller Hook
// ============================================

export interface OrbControllerOptions {
  mode?: ConsciousnessMode;
  breathDuration?: number;
  pulseDuration?: number;
  autoBreathe?: boolean;
}

export function useOrbController(options: OrbControllerOptions = {}) {
  const {
    mode = "gold",
    breathDuration = 4000,
    pulseDuration = 8000,
    autoBreathe = true,
  } = options;

  const [breathPhase, setBreathPhase] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [currentMode, setCurrentMode] = useState<ConsciousnessMode>(mode);
  const [intensity, setIntensity] = useState(1);

  // Breathing animation
  useEffect(() => {
    if (!autoBreathe) return;
    
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const phase = (elapsed % breathDuration) / breathDuration;
      // Smooth ease-in-out breathing curve
      const breathValue = Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
      setBreathPhase(breathValue);
      
      const pulsePhaseVal = (elapsed % pulseDuration) / pulseDuration;
      setPulsePhase(Math.sin(pulsePhaseVal * Math.PI * 2) * 0.5 + 0.5);
      
      requestAnimationFrame(animate);
    };
    
    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [breathDuration, pulseDuration, autoBreathe]);

  const setMode = (newMode: ConsciousnessMode) => {
    setCurrentMode(newMode);
  };

  const triggerPulse = (duration = 500) => {
    setIntensity(1.5);
    setTimeout(() => setIntensity(1), duration);
  };

  const triggerBreath = (depth = 1) => {
    // Manual breath trigger for interactions
    setBreathPhase(1);
    setTimeout(() => setBreathPhase(0), 500 * depth);
  };

  return {
    mode: currentMode,
    setMode,
    breathPhase,
    pulsePhase,
    intensity,
    setIntensity,
    triggerPulse,
    triggerBreath,
    colors: CONSCIOUSNESS_COLORS[currentMode],
  };
}

// ============================================
// Responsive Orb Wrapper
// ============================================

export interface ResponsiveOversoulOrbProps extends Omit<OversoulOrbProps, "size"> {
  sizeMobile?: number;
  sizeTablet?: number;
  sizeDesktop?: number;
  sizeLarge?: number;
}

export const ResponsiveOversoulOrb = ({
  sizeMobile = 200,
  sizeTablet = 240,
  sizeDesktop = 280,
  sizeLarge = 320,
  ...props
}: ResponsiveOversoulOrbProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Determine size based on container width
  const size = useMemo(() => {
    if (containerWidth >= 1440) return sizeLarge;
    if (containerWidth >= 1024) return sizeDesktop;
    if (containerWidth >= 768) return sizeTablet;
    return sizeMobile;
  }, [containerWidth, sizeMobile, sizeTablet, sizeDesktop, sizeLarge]);

  return (
    <div ref={containerRef} className="oversoul-orb-container">
      <OversoulOrb size={size} {...props} />
    </div>
  );
};

export default OversoulOrb;