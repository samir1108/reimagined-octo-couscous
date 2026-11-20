import { Component, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion, useReducedMotion } from "framer-motion";
import type { OrbPalette } from "./palettes";
import { ORB_HUE_CYCLE_SECONDS } from "./palettes";

const HUE_RATE = (Math.PI * 2) / ORB_HUE_CYCLE_SECONDS;

const NOISE_GLSL = `
float h(vec3 p){ p = fract(p*0.3183099 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float n3(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(h(i), h(i+vec3(1.0,0.0,0.0)), f.x), mix(h(i+vec3(0.0,1.0,0.0)), h(i+vec3(1.0,1.0,0.0)), f.x), f.y),
             mix(mix(h(i+vec3(0.0,0.0,1.0)), h(i+vec3(1.0,0.0,1.0)), f.x), mix(h(i+vec3(0.0,1.0,1.0)), h(i+vec3(1.0,1.0,1.0)), f.x), f.y), f.z); }
float fbm(vec3 p){ float a = 0.5; float s = 0.0; for(int i = 0; i < 3; i++){ s += a*n3(p); p = p*2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }
`;

const VERTEX_SHADER = `
uniform float uTime;
uniform float uBreath;
uniform float uCharge;
uniform float uShock;
uniform float uSize;
uniform float uPx;
uniform float uHueShift;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
attribute float aSeed;
attribute float aKind;
varying vec3 vColor;
varying float vAlpha;
${NOISE_GLSL}
vec3 hueShift(vec3 c, float a){
  vec3 k = vec3(0.57735);
  float ca = cos(a), sa = sin(a);
  return c*ca + cross(k, c)*sa + k*dot(k, c)*(1.0 - ca);
}
vec3 grad(float x){ x = abs(fract(x)*2.0 - 1.0)*3.0;
  vec3 c = x < 1.0 ? mix(uC0, uC1, x) : (x < 2.0 ? mix(uC1, uC2, x - 1.0) : mix(uC2, uC3, x - 2.0));
  return hueShift(c, uHueShift); }
void main(){
  vAlpha = 1.0;
  vec3 d = normalize(position);
  float n = fbm(d*2.4 + vec3(0.0, uTime*0.05, uTime*0.03));
  float R = 1.0 + uBreath*0.10 - uCharge*0.12 + uShock*0.16;
  vec3 p;
  float bright;
  float sizeMul = 1.0;
  if (aKind < 0.5) {
    float r = R*(0.86 + 0.22*n);
    p = d*r;
    vColor = grad(n*1.6 + aSeed*0.35 + uTime*0.02);
    bright = 0.55 + 0.9*n;
  } else if (aKind < 1.5) {
    float r = R*(0.30 + 0.35*aSeed)*(0.9 + 0.1*uBreath);
    p = d*r;
    vColor = hueShift(mix(uC3, uC2, aSeed), uHueShift);
    bright = 0.5 + 0.8*uBreath;
    sizeMul = 0.8;
  } else {
    float life = fract(uTime*0.10*(0.4 + aSeed) + aSeed*11.0);
    float r = R*(0.25 + life*1.45);
    p = d*r;
    p.y += life*0.35*R;
    vColor = grad(life*0.9 + uTime*0.03);
    bright = (1.0 - life)*1.5;
    sizeMul = 0.65;
    vAlpha = 1.0 - life;
  }
  float ring = exp(-pow((length(p) - (1.0 - uShock)*1.6)*6.0, 2.0))*uShock;
  bright += ring*2.0;
  bright *= 0.8 + 0.3*uBreath;
  vec4 mv = modelViewMatrix*vec4(p, 1.0);
  gl_Position = projectionMatrix*mv;
  float tw = 0.75 + 0.25*sin(uTime*2.0 + aSeed*40.0);
  gl_PointSize = uSize*sizeMul*(0.6 + aSeed*1.2)*tw*(1.0 + uCharge*0.5)*uPx/max(0.1, -mv.z);
  vAlpha *= (0.55 + 0.45*tw)*(0.8 + 0.2*uBreath);
  vColor *= bright;
}
`;

const FRAGMENT_SHADER = `
varying vec3 vColor;
varying float vAlpha;
void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float a = smoothstep(0.5, 0.08, d);
  gl_FragColor = vec4(vColor*a*vAlpha, 1.0);
}
`;

const CORE_VERTEX_SHADER = `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
void main() {
  vPosition = position;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const CORE_FRAGMENT_SHADER = `
uniform float uTime;
uniform float uBreath;
uniform float uCharge;
uniform float uHueShift;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
${NOISE_GLSL}
vec3 hueShift(vec3 c, float a) {
  vec3 k = vec3(0.57735);
  float ca = cos(a), sa = sin(a);
  return c * ca + cross(k, c) * sa + k * dot(k, c) * (1.0 - ca);
}
vec3 grad(float x) {
  x = abs(fract(x) * 2.0 - 1.0) * 3.0;
  vec3 c = x < 1.0 ? mix(uC0, uC1, x) : (x < 2.0 ? mix(uC1, uC2, x - 1.0) : mix(uC2, uC3, x - 2.0));
  return hueShift(c, uHueShift);
}
void main() {
  vec3 p = normalize(vPosition);
  float flow = fbm(p * 2.8 + vec3(uTime * 0.045, -uTime * 0.08, uTime * 0.025));
  float detail = fbm(p * 5.2 - vec3(uTime * 0.035, uTime * 0.02, -uTime * 0.04));
  float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 2.0);
  float current = 0.5 + 0.5 * sin((p.y * 3.0 + flow * 2.4) * 3.14159 + uTime * 0.25);
  vec3 color = grad(flow * 1.25 + detail * 0.25 + uTime * 0.012);
  color *= 0.14 + flow * 0.2 + current * 0.08;
  color += hueShift(uC2, uHueShift) * (fresnel * 0.18 + detail * 0.035);
  color += hueShift(uC3, uHueShift) * fresnel * (0.12 + uCharge * 0.18);
  gl_FragColor = vec4(color * (1.0 + uBreath * 0.18 + uCharge * 0.3), 0.82);
}
`;

function buildGeometry(): THREE.BufferGeometry {
  const width = typeof window !== "undefined" ? window.innerWidth : 1024;
  const count = width < 640 ? 9000 : 15000;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const kinds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const z = Math.random() * 2 - 1;
    const phi = Math.random() * Math.PI * 2;
    const r = Math.sqrt(1 - z * z);
    const roll = Math.random();
    let radius = 1;
    let kind = 0;
    if (roll < 0.7) {
      kind = 0;
      radius = 0.95 + Math.random() * 0.1;
    } else if (roll < 0.9) {
      kind = 1;
      radius = 0.15 + Math.random() * 0.5;
    } else {
      kind = 2;
      radius = 0.9 + Math.random() * 0.15;
    }
    positions[i * 3] = r * Math.cos(phi) * radius;
    positions[i * 3 + 1] = z * radius;
    positions[i * 3 + 2] = r * Math.sin(phi) * radius;
    seeds[i] = Math.random();
    kinds[i] = kind;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aKind", new THREE.BufferAttribute(kinds, 1));
  return geometry;
}

function buildLatticeGeometry(): { lines: THREE.BufferGeometry; nodes: THREE.BufferGeometry } {
  const nodeCount = 46;
  const nodePositions: number[] = [];
  const linePositions: number[] = [];
  const points: THREE.Vector3[] = [];

  for (let i = 0; i < nodeCount; i++) {
    const y = 1 - (2 * (i + 0.5)) / nodeCount;
    const radius = Math.sqrt(1 - y * y);
    const angle = i * Math.PI * (3 - Math.sqrt(5));
    const point = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius).multiplyScalar(0.91);
    points.push(point);
    nodePositions.push(point.x, point.y, point.z);
  }

  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (points[i].distanceTo(points[j]) < 0.58) {
        linePositions.push(
          points[i].x, points[i].y, points[i].z,
          points[j].x, points[j].y, points[j].z,
        );
      }
    }
  }

  const lines = new THREE.BufferGeometry();
  lines.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
  const nodes = new THREE.BufferGeometry();
  nodes.setAttribute("position", new THREE.Float32BufferAttribute(nodePositions, 3));
  return { lines, nodes };
}

function buildMaterial(palette: OrbPalette): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBreath: { value: 0 },
      uCharge: { value: 0 },
      uShock: { value: 0 },
      uSize: { value: 9 },
      uPx: { value: 1 },
      uHueShift: { value: 0 },
      uC0: { value: new THREE.Color(palette[0]) },
      uC1: { value: new THREE.Color(palette[1]) },
      uC2: { value: new THREE.Color(palette[2]) },
      uC3: { value: new THREE.Color(palette[3]) },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
}

function buildCoreMaterial(palette: OrbPalette): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBreath: { value: 0 },
      uCharge: { value: 0 },
      uHueShift: { value: 0 },
      uC0: { value: new THREE.Color(palette[0]) },
      uC1: { value: new THREE.Color(palette[1]) },
      uC2: { value: new THREE.Color(palette[2]) },
      uC3: { value: new THREE.Color(palette[3]) },
    },
    vertexShader: CORE_VERTEX_SHADER,
    fragmentShader: CORE_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function useOrbActive(ref: RefObject<HTMLDivElement | null>): boolean {
  const [active, setActive] = useState(
    () => typeof document !== "undefined" ? !document.hidden : true,
  );
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let intersecting = true;
    const update = () => setActive(intersecting && !document.hidden);
    const io = new IntersectionObserver(
      (entries) => {
        intersecting = entries[0]?.isIntersecting ?? true;
        update();
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    const onVisibility = () => update();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref]);
  return active;
}

interface OrbSceneProps {
  palette: OrbPalette;
  breathSeconds: number;
  breath?: number;
  charge: number;
  pointer: { x: number; y: number };
  pulseKey: number;
  colorShift: number;
}

function OrbScene({ palette, breathSeconds, breath: breathOverride, charge, pointer, pulseKey, colorShift }: OrbSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreMatRef = useRef<THREE.ShaderMaterial>(null);
  const latticeRef = useRef<THREE.LineBasicMaterial>(null);
  const latticeNodesRef = useRef<THREE.PointsMaterial>(null);
  const ringARef = useRef<THREE.MeshBasicMaterial>(null);
  const ringBRef = useRef<THREE.MeshBasicMaterial>(null);
  const ringRef = useRef<THREE.Group>(null);
  const shockRef = useRef(0);
  const chargeSmoothRef = useRef(0);
  const tintRef = useRef(new THREE.Color());
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const [c0, c1, c2, c3] = palette;
  const geometry = useMemo(() => buildGeometry(), []);
  const material = useMemo(() => buildMaterial([c0, c1, c2, c3]), [c0, c1, c2, c3]);
  const coreMaterial = useMemo(() => buildCoreMaterial([c0, c1, c2, c3]), [c0, c1, c2, c3]);
  const lattice = useMemo(() => buildLatticeGeometry(), []);

  useEffect(() => {
    shockRef.current = 1;
  }, [pulseKey]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime * (reducedMotion ? 0.25 : 1);
    const phase = (t % breathSeconds) / breathSeconds;
    const breath = breathOverride ?? 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);

    material.uniforms.uTime.value = t;
    material.uniforms.uBreath.value = breath;
    chargeSmoothRef.current += (charge - chargeSmoothRef.current) * Math.min(1, delta * 10);
    material.uniforms.uCharge.value = chargeSmoothRef.current;
    coreMaterial.uniforms.uTime.value = t;
    coreMaterial.uniforms.uBreath.value = breath;
    coreMaterial.uniforms.uCharge.value = chargeSmoothRef.current;
    shockRef.current = Math.max(0, shockRef.current - delta * 1.3);
    material.uniforms.uShock.value = shockRef.current;
    material.uniforms.uPx.value =
      state.viewport.dpr * Math.max(0.7, Math.min(1.6, state.size.height / 800));

    const hueAngle = t * HUE_RATE * Math.max(0, colorShift) * (reducedMotion ? 0 : 1);
    material.uniforms.uHueShift.value = hueAngle;
    coreMaterial.uniforms.uHueShift.value = hueAngle;
    const hueTurns = hueAngle / (Math.PI * 2);
    if (latticeRef.current) {
      tintRef.current.set(palette[2]).offsetHSL(hueTurns, 0, 0);
      latticeRef.current.color.copy(tintRef.current);
    }
    if (latticeNodesRef.current) {
      tintRef.current.set(palette[3]).offsetHSL(hueTurns, 0, 0);
      latticeNodesRef.current.color.copy(tintRef.current);
    }
    if (ringARef.current) {
      tintRef.current.set(palette[2]).offsetHSL(hueTurns, 0, 0);
      ringARef.current.color.copy(tintRef.current);
    }
    if (ringBRef.current) {
      tintRef.current.set(palette[1]).offsetHSL(hueTurns, 0, 0);
      ringBRef.current.color.copy(tintRef.current);
    }

    const g = groupRef.current;
    if (g) {
      g.rotation.y += delta * (reducedMotion ? 0.02 : 0.07);
      g.rotation.x += (pointer.y * 0.24 - g.rotation.x) * Math.min(1, delta * 4);
      g.rotation.z += (-pointer.x * 0.16 - g.rotation.z) * Math.min(1, delta * 4);
    }
    const core = coreRef.current;
    if (core) core.scale.setScalar(0.86 + breath * 0.12 + shockRef.current * 0.12);
    if (latticeRef.current) {
      latticeRef.current.opacity = 0.14 + breath * 0.1 + chargeSmoothRef.current * 0.26;
    }
    if (latticeNodesRef.current) {
      latticeNodesRef.current.opacity = 0.42 + breath * 0.2 + chargeSmoothRef.current * 0.32;
      latticeNodesRef.current.size = 0.018 + chargeSmoothRef.current * 0.012;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * (reducedMotion ? 0.01 : 0.035);
      ringRef.current.rotation.x = Math.sin(t * 0.12) * 0.12;
      ringRef.current.scale.setScalar(1 + breath * 0.025 + shockRef.current * 0.04);
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry}>
        <primitive object={material} attach="material" />
      </points>
      <lineSegments geometry={lattice.lines}>
        <lineBasicMaterial
          ref={latticeRef}
          color={palette[2]}
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <points geometry={lattice.nodes}>
        <pointsMaterial
          ref={latticeNodesRef}
          color={palette[3]}
          size={0.018}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.78, 40, 40]} />
        <primitive
          ref={coreMatRef}
          object={coreMaterial}
          attach="material"
        />
      </mesh>
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2.35, 0.16, -0.22]}>
          <torusGeometry args={[1.16, 0.0035, 6, 128]} />
          <meshBasicMaterial ref={ringARef} color={palette[2]} transparent opacity={0.22} depthWrite={false} />
        </mesh>
        <mesh rotation={[0.35, Math.PI / 2.5, 0.2]}>
          <torusGeometry args={[1.22, 0.0025, 6, 128]} />
          <meshBasicMaterial ref={ringBRef} color={palette[1]} transparent opacity={0.13} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

function DomOrbFallback({ palette }: { palette: OrbPalette }) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="rounded-full"
        style={{
          width: "72%",
          height: "72%",
          background: `radial-gradient(circle at 35% 35%, ${palette[3]}, ${palette[1]} 45%, ${palette[0]} 100%)`,
          boxShadow: `0 0 60px ${palette[1]}66, inset 0 0 40px ${palette[2]}55`,
        }}
        animate={reducedMotion ? undefined : { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
        transition={reducedMotion ? undefined : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

class OrbErrorBoundary extends Component<{ palette: OrbPalette; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[ConsciousnessOrb] GPU visual failed, using DOM fallback", error);
  }
  render() {
    if (this.state.failed) return <DomOrbFallback palette={this.props.palette} />;
    return this.props.children;
  }
}

interface ConsciousnessOrbCanvasProps {
  palette: OrbPalette;
  breathSeconds?: number;
  breath?: number;
  charge: number;
  pointer: { x: number; y: number };
  pulseKey: number;
  /** Hue-drift speed. 1 = one full hue revolution per minute, 0 = static. */
  colorShift?: number;
}

export default function ConsciousnessOrbCanvas({
  palette,
  breathSeconds = 8,
  breath,
  charge,
  pointer,
  pulseKey,
  colorShift = 1,
}: ConsciousnessOrbCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const active = useOrbActive(wrapRef);
  return (
    <div ref={wrapRef} className="absolute inset-0">
      <OrbErrorBoundary palette={palette}>
        <Canvas
          camera={{ position: [0, 0, 3.6], fov: 40 }}
          dpr={[1, 1.75]}
          frameloop={active ? "always" : "never"}
          gl={{ antialias: true, alpha: true, depth: false, stencil: false, powerPreference: "high-performance" }}
          style={{ background: "transparent" }}
        >
          <OrbScene
            palette={palette}
            breathSeconds={breathSeconds}
            breath={breath}
            charge={charge}
            pointer={pointer}
            pulseKey={pulseKey}
            colorShift={colorShift}
          />
        </Canvas>
      </OrbErrorBoundary>
    </div>
  );
}
