import { useEffect, useRef, useCallback, useState } from "react";

export type OrbVariant = "lite" | "balanced" | "vivid";
export type OrbMood = "calm" | "focus" | "fire";

/** Warm palette stand-in used when the device cannot create a WebGL context. */
const FALLBACK_TINTS: Record<OrbMood, [string, string, string, string]> = {
  calm: ["#00ffd0", "#00a2ff", "#8a00ff", "#ff2fa0"],
  focus: ["#ffb300", "#ffe66d", "#00ffc3", "#ffffff"],
  fire: ["#ff006e", "#ff4d00", "#ffd000", "#ff1f3d"],
};

let warnedNoWebGL = false;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * One orb, three densities. The tier is picked from the device on every app
 * load: phones get the lighter field, desktops get the full spectrum.
 */
function detectOrbVariant(): OrbVariant {
  if (typeof navigator === "undefined") return "balanced";
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const shortSide =
    typeof window !== "undefined"
      ? Math.min(window.screen?.width ?? 1024, window.screen?.height ?? 768)
      : 1024;
  if (nav.userAgent?.includes("Mobile") || shortSide < 720 || cores <= 4 || memory <= 4) {
    return "lite";
  }
  if (cores >= 8 && memory >= 8) return "vivid";
  return "balanced";
}

export function OversoulOrbPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">Ã°Å¸ÂªÂ</div>
        <h1 className="text-3xl font-bold mb-4">Oversoul Orb</h1>
        <p className="text-muted-foreground mb-8">The Orb experience is coming soon.</p>
      </div>
    </div>
  );
}

export function OversoulOrbLauncher() {
  return <div className="fixed bottom-6 right-6 z-50" />;
}

export function OversoulOrbEmbed({
  currentGate,
  variant,
  mood = "calm",
  onActivate,
  onHold,
  onTriple,
  onHaptic,
  hideWebglFallback,
}: {
  currentGate: string;
  /** Optional override. By default the orb chooses its tier from the device. */
  variant?: OrbVariant;
  mood?: OrbMood;
  onActivate: () => void;
  onHold: () => void;
  onTriple: () => void;
  onHaptic?: (pattern: number | number[]) => void;
  /** Render nothing instead of the flat tint disc if WebGL is unavailable. */
  hideWebglFallback?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gcRef = useRef<HTMLCanvasElement>(null);
  const [deviceVariant] = useState<OrbVariant>(() => detectOrbVariant());
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const activeVariant = variant ?? deviceVariant;
  const moodRef = useRef<OrbMood>(mood);
  const strobeRef = useRef(-1);
  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  const kickStrobe = useCallback(() => {
    strobeRef.current = performance.now();
  }, []);

  const handleActivate = useCallback(() => {
    kickStrobe();
    onHaptic?.([20, 30, 20, 30, 20]);
    onActivate();
  }, [kickStrobe, onActivate, onHaptic]);

  const handleHold = useCallback(() => {
    kickStrobe();
    onHaptic?.([40, 40, 40, 40, 60]);
    onHold();
  }, [kickStrobe, onHold, onHaptic]);

  const handleTriple = useCallback(() => {
    onHaptic?.([100, 50, 100, 50, 100]);
    onTriple();
  }, [onTriple, onHaptic]);

  // Gesture parity for the DOM fallback: hold activates, repeated taps cycle.
  const fallbackTapsRef = useRef(0);
  const fallbackTimerRef = useRef<number | null>(null);
  const fallbackDownAtRef = useRef(0);

  useEffect(
    () => () => {
      if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current);
    },
    [],
  );

  const handleFallbackPointerDown = useCallback(() => {
    fallbackDownAtRef.current = performance.now();
  }, []);

  const handleFallbackPointerUp = useCallback(() => {
    const held = (performance.now() - fallbackDownAtRef.current) / 1000;
    if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current);
    if (held > 0.65) {
      fallbackTapsRef.current = 0;
      handleHold();
      return;
    }
    fallbackTapsRef.current += 1;
    const taps = fallbackTapsRef.current;
    fallbackTimerRef.current = window.setTimeout(() => {
      fallbackTapsRef.current = 0;
      fallbackTimerRef.current = null;
      if (taps >= 2) handleTriple();
      else handleActivate();
    }, 430);
  }, [handleActivate, handleHold, handleTriple]);

  const handleFallbackPointerCancel = useCallback(() => {
    if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = null;
    fallbackTapsRef.current = 0;
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    const gc = gcRef.current;
    if (!cv || !gc) return;

    const gl = cv.getContext("webgl", {
      antialias: false,
      alpha: true,
      premultipliedAlpha: true,
    });

    if (!gl) {
      if (!warnedNoWebGL) {
        warnedNoWebGL = true;
        console.warn("WebGL not available — rendering the DOM orb fallback");
      }
      setWebglUnavailable(true);
      return;
    }

    // --- Shader sources (inlined from the HTML) ---
    const NOISE = `float h(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<3;i++){s+=a*n3(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}
float rg(vec3 x){return pow(1.-abs(2.*n3(x)-1.),8.);}
vec3 hue(vec3 c,float a){vec3 k=vec3(.57735);float ca=cos(a),sa=sin(a);return c*ca+cross(k,c)*sa+k*dot(k,c)*(1.-ca);}`;

    const PVS = `precision highp float;attribute vec4 aSeed;
uniform float uT,uAsp,uPulse,uPx,uS,uB,uPS,uWT,uWA,uBloom,uAud,uIn,uCh,uScan,uHue,uSpec,uGold,uSq,uGal,uFw,uMT;uniform vec2 uM,uPtr,uG,uT1,uT2;uniform vec3 uHit,uC0,uC1,uC2,uC3;varying vec3 vC;
${NOISE}
vec3 grad(float x){x=abs(fract(x)*2.-1.)*3.;return x<1.?mix(uC0,uC1,x):(x<2.?mix(uC1,uC2,x-1.):mix(uC2,uC3,x-2.));}
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
void main(){
 vec3 d=aSeed.xyz;float k=aSeed.w;
 float r2=fract(k*17.13),r3=fract(k*91.7),t=uT;
 float R=(.52+.105*uB+uPulse*.04+uAud*.03)*uIn*(1.-uCh*.12);
 vec3 q=d*1.5+vec3(0.,0.,t*.12);
 float n=fbm(q+fbm(q*1.3-t*.1));
 mat3 M=rx(uM.y)*ry(uM.x);
 vec3 p,col;float I,sz=1.+1.6*r3,br=.8+.5*uB;
 if(k<.34){
   float rad=R*.66*pow(r2,.4)*(.55+.9*n);
   float rd=rg(d*3.+t*.2);
   p=ry(t*1.1/(.3+rad*3.)+n*1.2)*(d*rad);
   col=grad(fbm(d*2.+t*.1+n)*1.5+t*.03);
   col+=pow(max(1.-rad/(R*.66),0.),3.)*.08;
   I=.17*br*(1.+rd*4.);
  }else if(k<.88){
   float tend=step(.93,r3);
   float rd=rg(d*2.8+vec3(0.,0.,t*.15)+n*.8);
   float rad=R*(1.+.03*(n-.5))+tend*(.02+.12*n*r2)+rd*.025+uPulse*.02*sin(d.y*6.-t*5.);
   p=d*rad;
   float rim=pow(1.-abs((M*d).z),2.5);
   col=mix(grad(n*1.4+d.y*.3+t*.04),uC3,rim);
   col=mix(col,grad(n*3.+t*.08),tend*.8);
   col=mix(col,mix(vec3(.8,.95,1.),vec3(1.,.92,.66),uGold),rd*.5);
   col=mix(col,.5+.5*cos(6.2832*(rim*1.1+n*.6+t*.03+vec3(0.,.33,.67))),.35*rim*min(1.,uSpec*3.));
   I=.22*(.45+rim*1.6)*(1.-tend*.4)*br*(1.+rd*5.);
  }else if(k<.95){
   float life=fract(t*.12*(1.+uPulse)+r2);
   vec3 dn=normalize(d+(vec3(n,fbm(q+3.),fbm(q+7.))-.5)*.8);
   p=dn*R*(.25+life*1.6);p.xy+=uG*life*life*.18;
   col=grad(life*.8+t*.04);
   I=.5*(1.-life)*(1.-life)*br;sz=.7+r3*.8;
  }else{
   float id=floor(r2*6.);
   float a=t*(.5+id*.13)*(1.+uPulse)+id*1.047-r3*.9;
   float orb=R*(1.15+.12*sin(t*.7+id));
   vec3 o=rx(id*.55+.3*sin(t*.2+id))*(ry(id*1.3)*vec3(cos(a)*orb,0.,sin(a)*orb));
   p=o+(vec3(n,fbm(q+3.),fbm(q+7.))-.5)*.04*r3;
   col=mix(grad(id*.17+t*.05),vec3(1.),pow(1.-r3,6.)*.6);
   I=.9*pow(1.-r3,2.5)*br;sz=.8+(1.-r3)*2.2;
  }
 if(uGal>0.){float rr=pow(fract(k*7.31),.55);float an=rr*4.2+mod(floor(k*23.7),3.)*2.094+n*.4+t*.05;vec3 gp=vec3(cos(an)*rr,sin(an)*rr*.35,(fract(k*3.7)-.5)*.3)*R*1.9;p=mix(p,gp,uGal);}
 if(uMT>.5){vec2 mid=(uT1+uT2)*.5;vec2 ax2=normalize(uT2-uT1+vec2(1e-4));float al=dot(p.xy,ax2),pe=dot(p.xy,vec2(-ax2.y,ax2.x));p.xy=mix(p.xy,mid+ax2*al*1.25+vec2(-ax2.y,ax2.x)*pe*.75,uMT);}
 p*=(1.-uSq*.22);
 if(uFw>0.){p*=1.+uFw*1.2;I*=1.+uFw*.6;col*=1.+uFw*.3;}
 vec3 pv=M*p;
 vec3 nv=normalize(pv+vec3(1e-4));
 vec3 dv=pv-vec3(uPtr,.45);
 float dl=length(dv);
 float f=exp(-dl*dl*7.)*uPS;
 pv+=dv/(dl+.001)*f*.12+vec3(-dv.y,dv.x,0.)*f*.5;
 float w=0.;
 if(uWT<6.){float ang=acos(clamp(dot(nv,uHit),-1.,1.));w=exp(-pow((ang-uWT*2.2)*4.5,2.))*exp(-uWT*.7)*uWA;}
 pv*=1.+w*.16;
 col=mix(col,vec3(1.),w*.35);
 I*=1.+w*2.5;
 I*=1.+pow(.5+.5*sin(t*2.5+k*631.),24.)*3.;
 I*=.65+.55*smoothstep(-.6,.6,pv.z);
 float sw=exp(-pow((pv.y/max(R,.05)-uScan)*7.,2.));
 I*=1.+sw*2.5+uCh*.45;col=mix(col,mix(vec3(.75,.95,1.),vec3(1.,.9,.6),uGold),sw*.55);
 if(uBloom>.5){sz*=6.;I*=.06;}
 col=hue(col,uHue+uSpec*(n*4.+d.y*1.5)+uSpec*k*.6);
 col*=1.+clamp(uCh,0.,1.)*.22;
 vC=col*I*uIn*(1.+uPulse*1.5+uAud*1.2);
 gl_Position=vec4(pv.x*uS/uAsp,pv.y*uS,pv.z*.3,1.-pv.z*.12);
 gl_PointSize=uPx*sz*(1.+pv.z*.25);
}`;

    const PFS = `precision mediump float;varying vec3 vC;
void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.02,d)*.82+smoothstep(.13,0.,d)*.55;vec3 c=vC*a;gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}`;

    const HVS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
    const HFS = `precision highp float;uniform vec2 uRes,uM;uniform float uS,uB,uPulse,uAud,uT,uR,uCh,uHue,uSpec,uRing;uniform vec3 uC0,uC1,uC2,uC3;
${NOISE}
vec3 grad(float x){x=abs(fract(x)*2.-1.)*3.;return x<1.?mix(uC0,uC1,x):(x<2.?mix(uC1,uC2,x-1.):mix(uC2,uC3,x-2.));}
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
void main(){
 vec2 uv=(gl_FragCoord.xy*2.-uRes)/uRes.y/uS;
 float r=length(uv);
 float g=exp(-max(r-.4,0.)*2.4);
 vec3 c=hue(mix(uC2,uC3,.45),uHue)*g*g*.22*(.8+.5*uB+uPulse+uAud);
 float ring=smoothstep(.014,0.,abs(r-uRing*1.45))*(1.-uRing);
 c+=(uC3*.9+uC1*.35)*ring*(.55+.45*uB+uPulse*.5);
 float ang=fract(atan(uv.x,uv.y)/6.2831853),on=smoothstep(0.,.1,uCh);
 c+=uC3*smoothstep(.006,0.,abs(r-.84))*on*(.12+1.1*step(ang,uCh)+exp(-pow((ang-uCh)*40.,2.)))*.55;
 c+=uC2*smoothstep(.005,0.,abs(r-.9))*on*step(.5,fract(ang*72.))*.18;
 if(r<uR){
   float z=sqrt(uR*uR-r*r)/uR;
   vec3 s=ry(-uM.x)*(rx(-uM.y)*vec3(uv/uR,z));
   vec3 p=s*1.8,q=vec3(fbm(p+uT*.1),fbm(p+vec3(5.2,1.3,2.8)-uT*.08),fbm(p+vec3(2.1,7.7,4.4)));
   float f=fbm(p+2.2*q);
   float fr=pow(1.-z,2.2);
   vec3 body=hue(grad(f*1.5+uT*.03)*(.014+.1*f*f)+uC3*fr*.14+uC1*pow(z,4.)*.03,uHue+uSpec*(f*4.+s.y*1.5));
    c+=body*smoothstep(uR,uR-.02,r)*(.8+.6*uB+uAud);
  }
  gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));
}`;

    const LVS = `precision highp float;attribute vec3 aD;attribute vec2 aS;
uniform float uT,uAsp,uS,uB,uPulse,uAud,uIn,uWT,uWA,uCh,uScan,uPx,uPS,uHue,uSpec,uGal,uFw,uSq,uMT;uniform vec2 uM,uPtr,uT1,uT2;uniform vec3 uHit,uC1,uC3;
varying vec3 vC,vP;varying float vS,vPh;
vec3 hue(vec3 c,float a){vec3 k=vec3(.57735);float ca=cos(a),sa=sin(a);return c*ca+cross(k,c)*sa+k*dot(k,c)*(1.-ca);}
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
void main(){
 float R=(.52+.105*uB+uPulse*.04+uAud*.03)*uIn*(1.-uCh*.12);
 mat3 M=rx(uM.y)*ry(uM.x);
 vec3 bp=aD*R*1.04;
 if(uGal>0.){float kk=fract(dot(aD,vec3(12.9,78.2,37.7))*43758.5);float rr=pow(fract(kk*7.31),.55);float an=rr*4.2+mod(floor(kk*23.7),3.)*2.094;vec3 gp=vec3(cos(an)*rr,sin(an)*rr*.35,(fract(kk*3.7)-.5)*.3)*R*1.9;bp=mix(bp,gp,uGal);}
 if(uMT>.5){vec2 mid=(uT1+uT2)*.5;vec2 ax2=normalize(uT2-uT1+vec2(1e-4));float al=dot(bp.xy,ax2),pe=dot(bp.xy,vec2(-ax2.y,ax2.x));bp.xy=mix(bp.xy,mid+ax2*al*1.25+vec2(-ax2.y,ax2.x)*pe*.75,uMT);}
 bp*=(1.-uSq*.22);
 vec3 pv=M*bp;pv*=1.+uFw*1.5;vec3 nv=M*aD;
 vec3 dv=pv-vec3(uPtr,.45);float dl=length(dv);float f=exp(-dl*dl*7.)*uPS;
 pv+=dv/(dl+.001)*f*.12+vec3(-dv.y,dv.x,0.)*f*.5;
 float w=0.;
 if(uWT<6.){float ang=acos(clamp(dot(nv,uHit),-1.,1.));w=exp(-pow((ang-uWT*2.2)*4.5,2.))*exp(-uWT*.7)*uWA;}
 pv*=1.+w*.16;
 float sw=exp(-pow((pv.y/max(R,.05)-uScan)*7.,2.));
 float k=aS.y;vS=aS.x;vPh=fract(uT*(.18+.12*fract(k*7.31))+fract(k*3.17));
 vec3 base=hue(mix(uC1,uC3,fract(k*5.3)),uHue+uSpec*(fract(k)*3.+aD.y*1.5));
 vC=base*(.34+.1*sin(uT*.8+k*9.)+w*1.3+sw*.9+uCh*.25)*uIn*(.65+.55*smoothstep(-.6,.6,pv.z))*(1.+uAud);
 vP=base*1.2+.35;
 gl_Position=vec4(pv.x*uS/uAsp,pv.y*uS,pv.z*.3,1.-pv.z*.12);
 gl_PointSize=uPx*(3.5+1.5*sin(uT*2.+k*3.)+w*4.)*(1.+pv.z*.25);
}`;

    const LFS = `precision mediump float;uniform float uPts;varying vec3 vC,vP;varying float vS,vPh;
void main(){vec3 c;
 if(uPts>.5){float d=length(gl_PointCoord-.5);c=(vC*3.+vec3(.3))*smoothstep(.5,0.,d);}
 else{float pk=exp(-pow((vS-vPh)*9.,2.));c=vC+vP*pk*.9;}
 gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}`;

    const QVS = `attribute vec2 p;varying vec2 vUv;void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
    const BFS = `precision mediump float;uniform sampler2D uTex;uniform vec2 uDir;varying vec2 vUv;
void main(){vec4 s=texture2D(uTex,vUv)*.227027;
 s+=(texture2D(uTex,vUv+uDir*1.3846)+texture2D(uTex,vUv-uDir*1.3846))*.316216;
 s+=(texture2D(uTex,vUv+uDir*3.2308)+texture2D(uTex,vUv-uDir*3.2308))*.070270;
 gl_FragColor=s;}`;

    const CFS = `precision highp float;uniform sampler2D uS,uBl;uniform float uT,uAud,uBloomK,uGl;varying vec2 vUv;
float hh(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
 vec2 c0=vUv-.5;float ab=.005*(1.+uAud*2.+uGl*8.)*dot(c0,c0);
 vec4 a=vec4(texture2D(uS,vUv+c0*ab).r,texture2D(uS,vUv).g,texture2D(uS,vUv-c0*ab).b,texture2D(uS,vUv).a);
 vec4 b=texture2D(uBl,vUv);
 vec3 c=1.-(1.-a.rgb)*(1.-b.rgb*uBloomK);c+=(a.rgb-b.rgb)*.35*step(.01,a.a);
 float l=dot(c,vec3(.3,.59,.11));c=mix(vec3(l),c,1.3);
 c+=(hh(gl_FragCoord.xy+uT)-.5)*.02*step(.02,c.r+c.g+c.b);
 c=clamp(c,0.,1.);
 gl_FragColor=vec4(c,max(max(c.r,max(c.g,c.b)),max(a.a,b.a*uBloomK)));
}`;

    const TVS = `attribute vec2 aP;attribute float aA;uniform float uAsp,uS;varying float vA;void main(){vA=aA;gl_Position=vec4(aP.x*uS/uAsp,aP.y*uS,0.,1.);gl_PointSize=(10.+26.*aA)*uS;}`;
    const TFS = `precision mediump float;varying float vA;uniform vec3 uC;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,d)*vA;vec3 c=uC*1.6*a;gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}`;

    // --- Shader compilation ---
    const prog = (v: string, f: string) => {
      const P = gl.createProgram()!;
      const sources: Array<[number, string]> = [[gl.VERTEX_SHADER, v], [gl.FRAGMENT_SHADER, f]];
      for (const [t, s] of sources) {
        const S = gl.createShader(t)!;
        gl.shaderSource(S, s);
        gl.compileShader(S);
        if (!gl.getShaderParameter(S, gl.COMPILE_STATUS)) {
          console.error(gl.getShaderInfoLog(S));
        }
        gl.attachShader(P, S);
      }
      gl.linkProgram(P);
      return P;
    };

    const PP = prog(PVS, PFS);
    const HP = prog(HVS, HFS);
    const BP = prog(QVS, BFS);
    const CP = prog(QVS, CFS);
    const LP = prog(LVS, LFS);
    const TP = prog(TVS, TFS);

    // --- Uniform locations ---
    const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
    const pu: Record<string, WebGLUniformLocation | null> = {};
    const hu: Record<string, WebGLUniformLocation | null> = {};
    const lu: Record<string, WebGLUniformLocation | null> = {};
    const bu: Record<string, WebGLUniformLocation | null> = {};
    const cu: Record<string, WebGLUniformLocation | null> = {};
    const tu: Record<string, WebGLUniformLocation | number> = {};

    [
      "uT", "uAsp", "uPulse", "uPx", "uS", "uB", "uPS", "uWT", "uWA", "uBloom",
      "uAud", "uIn", "uCh", "uScan", "uG", "uHue", "uSpec", "uGold", "uSq",
      "uGal", "uFw", "uMT", "uM", "uPtr", "uG", "uT1", "uT2", "uHit",
      "uC0", "uC1", "uC2", "uC3",
    ].forEach((n) => (pu[n] = U(PP, n)));

    [
      "uRes", "uM", "uS", "uB", "uPulse", "uAud", "uT", "uR", "uCh",
      "uHue", "uSpec", "uRing", "uC0", "uC1", "uC2", "uC3",
    ].forEach((n) => (hu[n] = U(HP, n)));

    [
      "uT", "uAsp", "uS", "uB", "uPulse", "uAud", "uIn", "uWT", "uWA",
      "uCh", "uScan", "uPts", "uPx", "uPS", "uHue", "uSpec", "uGal",
      "uFw", "uSq", "uMT", "uM", "uPtr", "uT1", "uT2", "uHit", "uC1", "uC3",
    ].forEach((n) => (lu[n] = U(LP, n)));

    bu.uTex = U(BP, "uTex");
    bu.uDir = U(BP, "uDir");

    cu.uS = U(CP, "uS");
    cu.uBl = U(CP, "uBl");
    cu.uT = U(CP, "uT");
    cu.uAud = U(CP, "uAud");
    cu.uBloomK = U(CP, "uBloomK");
    cu.uGl = U(CP, "uGl");

    tu.aP = gl.getAttribLocation(TP, "aP");
    tu.aA = gl.getAttribLocation(TP, "aA");
    tu.uAsp = U(TP, "uAsp");
    tu.uS = U(TP, "uS");
    tu.uC = U(TP, "uC");

    // --- Geometry ---
    // Three device tiers keep the scene lighter than the original 500k field.
    const N = activeVariant === "vivid" ? 120000 : activeVariant === "balanced" ? 80000 : 45000;
    const seed = new Float32Array(N * 4);
    for (let i = 0; i < N; i++) {
      const z = Math.random() * 2 - 1;
      const ph = Math.random() * 6.2831853;
      const s = Math.sqrt(1 - z * z);
      seed.set([s * Math.cos(ph), z, s * Math.sin(ph), Math.random()], i * 4);
    }
    const sb = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, sb);
    gl.bufferData(gl.ARRAY_BUFFER, seed, gl.STATIC_DRAW);

    const qb = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, qb);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    // Lattice geometry
    const NN = 120;
    const nd: number[][] = [];
    for (let i = 0; i < NN; i++) {
      const y = 1 - 2 * (i + 0.5) / NN;
      const r = Math.sqrt(1 - y * y);
      const a = i * 2.399963;
      nd.push([Math.cos(a) * r, y, Math.sin(a) * r]);
    }
    const lv: number[] = [];
    let eid = 0;
    for (let i = 0; i < NN; i++)
      for (let j = i + 1; j < NN; j++) {
        const a = nd[i],
          b = nd[j];
        if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 0.56) {
          eid++;
          const id = eid * 0.137;
          const SG = 16;
          const om = Math.acos(
            Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
          );
          for (let q = 0; q < SG; q++)
            for (const u of [q / SG, (q + 1) / SG]) {
              const A1 = Math.sin((1 - u) * om) / Math.sin(om);
              const B1 = Math.sin(u * om) / Math.sin(om);
              lv.push(
                A1 * a[0] + B1 * b[0],
                A1 * a[1] + B1 * b[1],
                A1 * a[2] + B1 * b[2],
                u,
                id
              );
            }
        }
      }
    const lines = new Float32Array(lv);
    const lcount = lines.length / 5;
    const npts = new Float32Array(NN * 5);
    nd.forEach((p, i) =>
      npts.set([p[0], p[1], p[2], 0.5, i * 0.31 + 0.05], i * 5)
    );
    const lb = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, lb);
    gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STATIC_DRAW);
    const nb2 = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, nb2);
    gl.bufferData(gl.ARRAY_BUFFER, npts, gl.STATIC_DRAW);

    const tb = gl.createBuffer()!;
    const TB = 128;
    const tdata = new Float32Array(TB * 3);

    const gc2 = gc;
    const gctx = gc2.getContext("2d")!;

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr0 = devicePixelRatio || 1;
    let rs = Math.min(devicePixelRatio || 1, 3);

    const T: Record<
      string,
      { t: WebGLTexture; f: WebGLFramebuffer; w: number; h: number }
    > = {};

    const mkTex = () => {
      const t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      for (const [k, v] of [
        [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
        [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
        [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
        [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
      ])
        gl.texParameteri(gl.TEXTURE_2D, k, v);
      return t;
    };

    function target(name: string, w: number, h: number) {
      const o = T[name] || (T[name] = { t: mkTex(), f: gl.createFramebuffer()!, w, h });
      o.w = w;
      o.h = h;
      gl.bindTexture(gl.TEXTURE_2D, o.t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, o.f);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        o.t,
        0
      );
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    function resize() {
      const k = Math.min(
        dpr0 * rs,
        4096 / Math.max(cv.clientWidth, cv.clientHeight, 1)
      );
      const w = Math.floor(cv.clientWidth * k);
      const h = Math.floor(cv.clientHeight * k);
      if (w && h && (cv.width !== w || cv.height !== h)) {
        cv.width = w;
        cv.height = h;
        if (gc2) {
          gc2.width = cv.clientWidth;
          gc2.height = cv.clientHeight;
        }
        gl.viewport(0, 0, w, h);
        const bw = Math.max(2, w >> 2);
        const bh = Math.max(2, h >> 2);
        target("s", w, h);
        target("a", bw, bh);
        target("b", bw, bh);
      }
    }
    new ResizeObserver(resize).observe(cv);
    resize();
    window.addEventListener("load", resize);

    const toNdc = (e: MouseEvent | Touch) => {
      const r = cv.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height * 2 - 1)];
    };

    let hover = [0, 0],
      // eslint-disable-next-line prefer-const -- grouped with mutable neighbor declarations
      ptr = [0, 0],
      inside = 0,
      ps = 0,
      down = false,
      lx = 0,
      ly = 0,
      ay = 0,
      ax = 0,
      vy = 0,
      vx = 0;
    const trail: { x: number; y: number; a: number }[] = [];
    const pts = new Map<number, number[]>();
    let pinchD0 = 1,
      wasPinch = false;
    const flies: {
      a: number;
      r: number;
      s: number;
      ph: number;
      fx: number;
      fy: number;
    }[] = [];

    let tapCount = 0,
      tapTimer: number | null = null,
      longPress = false,
      pressStarted = 0;

    // --- Palette & modes ---
    const hex = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
    const tri = (r: number) => [r, r * 1.5, r * 2, r * 2.5];
    const MODES = [
      {
        n: "Calm",
        c: ["#6f63ff", "#45b4ff", "#b05cff", "#ff5ec4"],
        b: [4, 2, 6, 0],
        sp: 1,
        ch: [146.83, 220, 293.66, 369.99],
      },
      {
        n: "Focus",
        c: ["#ff9d2e", "#ff5a3c", "#ffd27a", "#fff2cf"],
        b: [4, 4, 4, 4],
        sp: 1.1,
        ch: [98, 146.83, 196, 246.94],
      },
      {
        n: "Heal",
        c: ["#22e6a0", "#18b4d0", "#7dff9b", "#e2ff72"],
        b: [5, 0, 5, 0],
        sp: 0.9,
        ch: [174.61, 261.63, 349.23, 440],
      },
      {
        n: "Awaken",
        c: ["#ff3ea5", "#9150ff", "#3dd2ff", "#ffd166"],
        b: [3, 0, 3, 0],
        sp: 1.7,
        ch: [164.81, 246.94, 329.63, 415.3],
      },
      {
        n: "Sleep",
        c: ["#3426b8", "#7b3fd6", "#2a62ff", "#b894ff"],
        b: [4, 7, 8, 0],
        sp: 0.5,
        ch: [65.41, 98, 130.81, 155.56],
      },
      {
        n: "Aurora",
        c: ["#19e6c2", "#3aa0ff", "#8a63ff", "#ff7ad9"],
        b: [4, 4, 6, 0],
        sp: 1,
        ch: [130.81, 196, 261.63, 329.63],
      },
      {
        n: "Ember",
        c: ["#ff4d5e", "#ff8a3d", "#ffc14d", "#ff6fb1"],
        b: [4, 2, 6, 0],
        sp: 1.2,
        ch: [110, 164.81, 220, 277.18],
      },
      {
        n: "Root",
        c: ["#7a0f1d", "#e8213a", "#ff6b4a", "#ffb199"],
        b: [5, 2, 7, 0],
        sp: 0.6,
        ch: tri(65.41),
        chakra: 1,
      },
      {
        n: "Sacral",
        c: ["#a8420a", "#ff7a1a", "#ffb347", "#ffe0b0"],
        b: [4, 2, 6, 0],
        sp: 0.8,
        ch: tri(73.42),
        chakra: 1,
      },
      {
        n: "Solar",
        c: ["#b8860b", "#ffd23a", "#fff08a", "#fffbe0"],
        b: [4, 4, 4, 4],
        sp: 1.1,
        ch: tri(82.41),
        chakra: 1,
      },
      {
        n: "Heart",
        c: ["#0b7a45", "#2fd06a", "#8dffb0", "#ff7ad9"],
        b: [5, 0, 5, 0],
        sp: 0.9,
        ch: tri(87.31),
        chakra: 1,
      },
      {
        n: "Throat",
        c: ["#0a6f9e", "#2fb8ff", "#8ae6ff", "#e0f8ff"],
        b: [4, 2, 6, 0],
        sp: 1,
        ch: tri(98),
        chakra: 1,
      },
      {
        n: "Third Eye",
        c: ["#2a1a9e", "#5a4bff", "#9a8bff", "#e0d4ff"],
        b: [4, 7, 8, 0],
        sp: 0.7,
        ch: tri(110),
        chakra: 1,
      },
      {
        n: "Crown",
        c: ["#6a1fb0", "#c77dff", "#f0d4ff", "#ffffff"],
        b: [6, 0, 6, 0],
        sp: 0.5,
        ch: tri(123.47),
        chakra: 1,
      },
      {
        n: "Vaikuntha",
        c: ["#6b390b", "#bd812d", "#f3c66f", "#fff0c4"],
        b: [6, 2, 8, 0],
        sp: 0.6,
        ch: [65.41, 98, 130.81, 196],
        gold: 1,
      },
      { n: "Flow", c: null, b: [5, 0, 5, 0], sp: 1, ch: null },
    ].map((m) => ({ ...m, rgb: m.c && m.c.map(hex) }));

    const FL = MODES.filter((m) => m.c && !m.chakra && !m.gold);
    const CHK = MODES.filter((m) => m.chakra);
    const DEF = MODES.findIndex((m) => m.gold);

    // Bold mood palettes: calm cool, focus gold/cyan, fire magenta/ember.
    // Deep saturation so even the first frame is vivid.
    const MOOD_PALETTES: Record<OrbMood, number[][]> = {
      calm: ["#00ffd0", "#00a2ff", "#8a00ff", "#ff2fa0"].map(hex),
      focus: ["#ffb300", "#ffe66d", "#00ffc3", "#ffffff"].map(hex),
      fire: ["#ff006e", "#ff4d00", "#ffd000", "#ff1f3d"].map(hex),
    };
    // Fast colour shift: a full hue revolution every ~3-5 seconds.
    const vRate = activeVariant === "vivid" ? 2.2 : activeVariant === "balanced" ? 1.7 : 1.3;
    const vSpec = activeVariant === "vivid" ? 0.9 : activeVariant === "balanced" ? 0.65 : 0.45;
    const reducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let mode = DEF;
    const flowI = 0;
    let clock = 0;
    let pulse = 0;
    let wt = 99;
    let wa = 1;
    let hit = [0, 0, 1];
    let asp = 1;
    let sc = 0.9;
    let aud = 0;
    const voice = 0;

    // --- Audio ---
    const A: {
      ctx: AudioContext | null;
      on: boolean;
      touched: boolean;
      master: GainNode | null;
      bus: GainNode | null;
      f: BiquadFilterNode | null;
      dg: GainNode | null;
      ng: GainNode | null;
      osc: [OscillatorNode, number][];
      an: AnalyserNode | null;
      buf: Uint8Array | null;
      fbuf: Uint8Array | null;
      co: OscillatorNode | null;
      cg: GainNode | null;
      ho: OscillatorNode | null;
      hg: GainNode | null;
      bL: OscillatorNode | null;
      bR: OscillatorNode | null;
      rain: GainNode | null;
      ocean: GainNode | null;
      crickets: GainNode | null;
      beatP: number;
      refr: number;
      prev: number;
      stream: MediaStream | null;
    } = {
      ctx: null,
      on: false,
      touched: false,
      master: null,
      bus: null,
      f: null,
      dg: null,
      ng: null,
      osc: [],
      an: null,
      buf: null,
      fbuf: null,
      co: null,
      cg: null,
      ho: null,
      hg: null,
      bL: null,
      bR: null,
      rain: null,
      ocean: null,
      crickets: null,
      beatP: 0,
      refr: 0,
      prev: 0,
      stream: null,
    };

    const chord = () => MODES[mode].ch || FL[flowI].ch;

    function initAudio() {
      if (A.ctx) {
        A.ctx.resume?.();
        return;
      }
      const C = window.AudioContext || (window as any).webkitAudioContext;
      if (!C) return;
      const c = (A.ctx = new C());
      const master = (A.master = c.createGain());
      master.gain.value = 0;
      master.connect(c.destination);
      A.an = c.createAnalyser();
      A.an.fftSize = 256;
      A.buf = new Uint8Array(256);
      master.connect(A.an);
      const len = c.sampleRate * 3;
      const ir = c.createBuffer(2, len, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = ir.getChannelData(ch);
        for (let i = 0; i < len; i++)
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
      }
      const rev = c.createConvolver();
      rev.buffer = ir;
      const rg = c.createGain();
      rg.gain.value = 0.55;
      rev.connect(rg);
      rg.connect(master);
      const bus = (A.bus = c.createGain());
      bus.connect(master);
      bus.connect(rev);
      const f = (A.f = c.createBiquadFilter());
      f.type = "lowpass";
      f.frequency.value = 400;
      f.Q.value = 0.6;
      const dg = (A.dg = c.createGain());
      dg.gain.value = 0.1;
      f.connect(dg);
      dg.connect(bus);
      A.osc = [];
      for (let i = 0; i < 4; i++)
        for (const dt of [-5, 5]) {
          const o = c.createOscillator(),
            g = c.createGain();
          o.type = i < 2 ? "sine" : "triangle";
          o.detune.value = dt;
          g.gain.value = 0.2;
          o.connect(g);
          g.connect(f);
          o.start();
          A.osc.push([o, i]);
        }
      const nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
      const nd_ = nb.getChannelData(0);
      for (let i = 0; i < nd_.length; i++) nd_[i] = Math.random() * 2 - 1;
      const ns = c.createBufferSource();
      ns.buffer = nb;
      ns.loop = true;
      const bp = c.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 900;
      bp.Q.value = 0.7;
      A.ng = c.createGain();
      A.ng.gain.value = 0;
      ns.connect(bp);
      bp.connect(A.ng);
      A.ng.connect(bus);
      ns.start();
      const co = (A.co = c.createOscillator());
      const cg = (A.cg = c.createGain());
      co.type = "triangle";
      cg.gain.value = 0;
      co.connect(cg);
      cg.connect(bus);
      co.start();
      const ho = c.createOscillator();
      const hg = (A.hg = c.createGain());
      ho.type = "sine";
      ho.frequency.value = 55;
      hg.gain.value = 0;
      ho.connect(hg);
      hg.connect(bus);
      ho.start();
      A.ho = ho;
      A.bL = c.createOscillator();
      A.bR = c.createOscillator();
      A.bL.type = "sine";
      A.bR.type = "sine";
      A.bL.frequency.value = 110;
      A.bR.frequency.value = 116;
      const bg2 = c.createGain();
      bg2.gain.value = 0.045;
      if (c.createStereoPanner) {
        const pl = c.createStereoPanner();
        pl.pan.value = -1;
        A.bL.connect(pl);
        pl.connect(bg2);
        const pr = c.createStereoPanner();
        pr.pan.value = 1;
        A.bR.connect(pr);
        pr.connect(bg2);
      } else {
        A.bL.connect(bg2);
        A.bR.connect(bg2);
      }
      bg2.connect(master);
      A.bL.start();
      A.bR.start();
      const rn = c.createBufferSource();
      rn.buffer = nb;
      rn.loop = true;
      const rbp = c.createBiquadFilter();
      rbp.type = "bandpass";
      rbp.frequency.value = 2800;
      rbp.Q.value = 0.4;
      A.rain = c.createGain();
      A.rain.gain.value = 0;
      rn.connect(rbp);
      rbp.connect(A.rain);
      A.rain.connect(master);
      rn.start();
      const ocN = c.createBufferSource();
      ocN.buffer = nb;
      ocN.loop = true;
      const olp = c.createBiquadFilter();
      olp.type = "lowpass";
      olp.frequency.value = 320;
      const olfo = c.createOscillator();
      olfo.frequency.value = 0.09;
      const olg = c.createGain();
      olg.gain.value = 140;
      olfo.connect(olg);
      olg.connect(olp.frequency);
      olfo.start();
      A.ocean = c.createGain();
      A.ocean.gain.value = 0;
      ocN.connect(olp);
      olp.connect(A.ocean);
      A.ocean.connect(master);
      ocN.start();
      const cr = c.createOscillator();
      cr.type = "sine";
      cr.frequency.value = 4300;
      const crg = c.createGain();
      crg.gain.value = 0;
      A.crickets = c.createGain();
      A.crickets.gain.value = 0;
      const clfo = c.createOscillator();
      clfo.frequency.value = 11;
      const clg = c.createGain();
      clg.gain.value = 0.5;
      clfo.connect(clg);
      clg.connect(crg.gain);
      clfo.start();
      cr.connect(crg);
      crg.connect(A.crickets!);
      A.crickets!.connect(master);
      cr.start();
      tune(chord(), 0.01);
    }

    function setSound(on: boolean) {
      A.on = on;
      if (on) initAudio();
      if (A.ctx) A.master!.gain.setTargetAtTime(on ? 0.8 : 0, A.ctx.currentTime, 0.4);
    }

    function tune(ch: number[] | null, tc?: number) {
      if (!A.ctx || !ch) return;
      A.osc.forEach(([o, i]) =>
        o.frequency.setTargetAtTime(ch[i], A.ctx!.currentTime, tc || 1.2)
      );
      if (A.bL) {
        const BEATS: Record<string, number> = {
          Sleep: 2.5,
          Focus: 6,
          Calm: 4,
          Heal: 8,
          Awaken: 14,
          Aurora: 6,
          Ember: 10,
          Vaikuntha: 3,
          Flow: 6,
        };
        const b = BEATS[MODES[mode].n] || 6;
        const base = MODES[mode].n === "Sleep" ? 82 : 110;
        A.bL.frequency.setTargetAtTime(base, A.ctx.currentTime, 1.5);
        A.bR.frequency.setTargetAtTime(base + b, A.ctx.currentTime, 1.5);
      }
      if (A.rain) {
        const nm = MODES[mode].n;
        let rv = 0,
          oc = 0,
          ck = 0;
        if (nm === "Sleep") ck = 0.06;
        else if (nm === "Heal" || nm === "Aurora") oc = 0.07;
        else if (nm === "Calm" || nm === "Vaikuntha") oc = 0.04;
        else if (nm === "Ember" || nm === "Awaken") rv = 0.05;
        else rv = 0.03;
        const t2 = A.ctx.currentTime;
        A.rain.gain.setTargetAtTime(rv, t2, 3);
        A.ocean.gain.setTargetAtTime(oc, t2, 3);
        A.crickets.gain.setTargetAtTime(ck, t2, 3);
      }
    }

    function chime(f: number, v: number) {
      if (!A.ctx || !A.on) return;
      const c = A.ctx;
      const t0 = c.currentTime;
      [
        [1, 1, 3.6],
        [2.76, 0.45, 2.2],
        [5.4, 0.22, 1.3],
        [8.93, 0.1, 0.8],
      ].forEach(([r, g, d]) => {
        const o = c.createOscillator(),
          e = c.createGain();
        o.type = "sine";
        o.frequency.value = f * r;
        e.gain.setValueAtTime(0, t0);
        e.gain.linearRampToValueAtTime(0.16 * g * v, t0 + 0.01);
        e.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
        o.connect(e);
        e.connect(A.bus!);
        o.start(t0);
        o.stop(t0 + d + 0.1);
      });
    }

    function pluck(f: number, v?: number) {
      if (!A.ctx || !A.on) return;
      const c = A.ctx;
      const t0 = c.currentTime;
      const o = c.createOscillator(),
        e = c.createGain();
      o.type = "sine";
      o.frequency.value = f;
      e.gain.setValueAtTime(0, t0);
      e.gain.linearRampToValueAtTime(0.14 * (v || 1), t0 + 0.006);
      e.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
      o.connect(e);
      e.connect(A.bus!);
      o.start(t0);
      o.stop(t0 + 0.6);
    }

    function sweep() {
      if (!A.ctx || !A.on) return;
      const c = A.ctx;
      const t0 = c.currentTime;
      chord().forEach((f, i) => {
        const o = c.createOscillator(),
          e = c.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(f * 0.5, t0);
        o.frequency.exponentialRampToValueAtTime(f * 2, t0 + 1.1 + i * 0.14);
        e.gain.setValueAtTime(0, t0);
        e.gain.linearRampToValueAtTime(0.09, t0 + 0.15 + i * 0.1);
        e.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.4 + i * 0.15);
        o.connect(e);
        e.connect(A.bus!);
        o.start(t0);
        o.stop(t0 + 2.8);
      });
      chime(chord()[0] * 4, 0.9);
    }

    // --- Interaction handlers ---
    const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
    const ease = (x: number) =>
      x * x * x * (x * (x * 6.0 - 15.0) + 10.0);

    function impact(x: number, y: number, amp: number) {
      const Rv = 0.58;
      const hx = (x * asp) / sc / Rv;
      const hy = y / sc / Rv;
      const l = hx * hx + hy * hy;
      hit =
        l > 1
          ? [hx / Math.sqrt(l), hy / Math.sqrt(l), 0]
          : [hx, hy, Math.sqrt(1 - l)];
      wt = 0;
      wa = amp;
      if (amp > 0.9) pulse = 1;
    }

    function setModeIdx(i: number) {
      mode = i;
      clock = 0;
      tune(chord());
      chime(chord()[0] * 4, 0.7);
      pulse = 0.6;
    }

    // --- Pointer events ---
    cv.addEventListener("pointerdown", (e: PointerEvent) => {
      down = true;
      pressStarted = performance.now();
      longPress = false;
      lx = e.clientX;
      ly = e.clientY;
      const p = toNdc(e);
      pts.set(e.pointerId, p);
      if (pts.size === 2) {
        const a = [...pts.values()];
        pinchD0 = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]) || 1;
        wasPinch = true;
        tapCount = 0;
        if (tapTimer) clearTimeout(tapTimer);
      }
      if (pts.size === 1) {
        ensureAmbient();
        chime(
          chord()[Math.max(0, Math.min(3, Math.floor((p[0] + 1) / 2 * 4)))] *
            (p[1] > 0 ? 4 : 2),
          0.65
        );
        pluck(220 + (p[0] + 1) * 220, 0.5);
        impact(p[0], p[1], 0.8);
      }
    });

    cv.addEventListener("pointerup", (e: PointerEvent) => {
      const held = (performance.now() - pressStarted) / 1000;
      const wasP = wasPinch;
      pts.delete(e.pointerId);
      if (pts.size < 2) wasPinch = false;
      if (wasP && pts.size === 1) {
        impact(0, 0, 1.2);
        pulse = 1;
        chime(chord()[3] * 4, 1);
      }
      if (down && held > 0.65 && pts.size === 0) {
        longPress = true;
        if (tapTimer) clearTimeout(tapTimer);
        tapCount = 0;
        handleHold();
      } else if (down) {
        tapCount++;
        if (tapTimer) clearTimeout(tapTimer);
        tapTimer = window.setTimeout(() => {
          if (tapCount >= 5) {
            // fireflies game - not implemented in React version
          } else if (tapCount >= 2) {
            handleTriple();
          }
          tapCount = 0;
        }, 430);
      }
      if (down && held > 0.3) {
        wt = 0;
        wa = 0.7;
        hit = [0, 0, 1];
        pulse = 1;
      }
      if (held > 0.35) {
        // Release bloom: the stored charge flashes into a full-spectrum wash.
        specC = 1.6;
        fw = 0.6;
        pulse = 1;
      }
      down = false;
    });

    cv.addEventListener("pointercancel", (e: PointerEvent) => {
      pts.delete(e.pointerId);
      if (pts.size < 2) wasPinch = false;
      down = false;
      if (tapTimer) clearTimeout(tapTimer);
      tapCount = 0;
    });

    cv.addEventListener("pointermove", (e: PointerEvent) => {
      const p = toNdc(e);
      if (pts.has(e.pointerId)) pts.set(e.pointerId, p);
      hover = p;
      inside = Math.abs(p[0]) < 1.05 && Math.abs(p[1]) < 1.05 ? 1 : 0;
      if (down) {
        vy = Math.max(-7, Math.min(7, vy + (e.clientX - lx) * 0.012));
        vx = Math.max(-7, Math.min(7, vx + (e.clientY - ly) * 0.012));
      }
      lx = e.clientX;
      ly = e.clientY;
    });

    // --- Gate-based mode ---
    const GATE: Record<string, string> = {
      morning: "Awaken",
      midday: "Focus",
      evening: "Heal",
      night: "Sleep",
    };

    // --- Animation loop ---
    let last = performance.now();
    let time = 0;
    const count = N;
    let B = 0;
    let spd = 1;
    let lastPh = 0;
    let intro = still ? 1 : 0;
    let charge = 0;
    let glitch = 0;
    let hold = 0;
    let scan = 9;
    let scanC = 0;
    let hueC = 0;
    let specC = 0.03;
    let hueAcc = 0;
    let goldC = 1;
    let mtS = 0;
    let sqS = 0;
    let fw = 0;
    let gal = 0;
    let galT = -1;
    let ringT = 9;
    let drumT = 0;
    const resV = 0;
    const omCool = 0;
    rs = 2.0;
    const frameCount = 0;

    const pal: number[][] = MOOD_PALETTES[moodRef.current].map((c) => c.slice());

    let rafId = 0;
    let stopped = false;

    function frame(now: number) {
      if (stopped) return;
      const dt = Math.max(0, Math.min((now - last) / 1000, 0.1));
      last = now;
      rafId = requestAnimationFrame(frame);

      const m = MODES[mode];
      spd += (m.sp - spd) * Math.min(dt * 2, 1);
      time += dt * spd * (still ? 0.2 : 1);
      clock += dt;
      wt += dt;

      vy *= Math.exp(-dt * 1.1);
      ay += (vy + 0.1 * spd) * dt;
      vx += ((hover[1] * 0.35 * inside - ax) * 6 - vx * 2.5) * dt;
      ax += vx * dt;
      ps += (inside - ps) * Math.min(dt * 4, 1);
      asp = cv.width / cv.height;
      sc = Math.min(0.95, asp * 0.8);

      const tp = [hover[0] * asp / sc, hover[1] / sc];
      ptr[0] += (tp[0] - ptr[0]) * Math.min(dt * 10, 1);
      ptr[1] += (tp[1] - ptr[1]) * Math.min(dt * 10, 1);

      let mtT = 0,
        sqT = 0;
      const tA = [0, 0],
        tB = [0, 0];
      if (pts.size === 2) {
        const a = [...pts.values()];
        const d = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]) || 1;
        tA[0] = a[0][0] * asp / sc;
        tA[1] = a[0][1] / sc;
        tB[0] = a[1][0] * asp / sc;
        tB[1] = a[1][1] / sc;
        mtT = 1;
        sqT = Math.max(0, Math.min(1, (pinchD0 - d) / pinchD0 * 1.8));
      }
      mtS += (mtT - mtS) * Math.min(dt * 8, 1);
      sqS += (sqT - sqS) * Math.min(dt * 8, 1);

      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].a -= dt * 0.75;
        if (trail[i].a <= 0) trail.splice(i, 1);
      }
      if (trail.length > 200) trail.splice(0, trail.length - 200);

      pulse = Math.max(0, pulse - dt * 0.7);
      if (down) {
        hold += dt;
        charge = Math.min(1, Math.max(0, (hold - 0.25) / 2));
      } else charge = Math.max(0, charge - dt * 1.6);
      glitch = Math.max(0, glitch - dt * 3);
      if (galT >= 0) {
        galT += dt;
        gal = galT < 1 ? galT : galT < 5 ? 1 : galT < 7 ? 1 - (galT - 5) / 2 : 0;
        if (galT >= 7) {
          gal = 0;
          galT = -1;
        }
      }
      fw = Math.max(0, fw - dt * 0.7);
      if (down && hold > 0.3) {
        drumT += dt;
        if (drumT > 1.15) {
          drumT = 0;
          chime(chord()[Math.floor(hold + 0.5) % 4] * (hold > 3 ? 4 : 2), Math.min(1, 0.5 + hold * 0.1));
          pulse = Math.max(pulse, 0.35);
        }
      } else drumT = 0;

      scanC += dt;
      {
        const sp = (scanC % 9) / 2.4;
        scan = sp < 1 ? -1.2 + 2.4 * sp : 9;
      }

      const tgt = MOOD_PALETTES[moodRef.current];
      const kc = Math.min(dt * 3.5, 1);
      for (let k = 0; k < 4; k++)
        for (let x = 0; x < 3; x++)
          pal[k][x] += (tgt[k][x] - pal[k][x]) * kc;

      const cyc = m.b.reduce((a, b) => a + b, 0);
      const tc = clock % cyc;
      let acc = 0;
      let ph = 0;
      while (ph < 3 && tc >= acc + m.b[ph]) {
        acc += m.b[ph];
        ph++;
      }
      while (m.b[ph] === 0 && ph < 3) ph++;
      const pd = m.b[ph];
      const pt = Math.min(tc - acc, pd);
      const p = pd ? pt / pd : 0;
      const bt = ph === 0 ? ease(p) : ph === 1 ? 1 : ph === 2 ? 1 - ease(p) : 0;
      B += (bt - B) * (1 - Math.exp(-dt * 3.2));
      if (lastPh === 0 && ph !== 0) impact(0, 0, 0.45);
      if (ph === 2 && lastPh !== 2) ringT = 0;
      lastPh = ph;
      ringT += dt;

      if (A.ctx && A.on) {
        const t = A.ctx.currentTime;
        A.co!.frequency.setTargetAtTime(chord()[0] * 2 * (1 + charge * 1.2), t, 0.05);
        A.cg!.gain.setTargetAtTime(charge * 0.05, t, 0.05);
        A.hg!.gain.setTargetAtTime(down ? Math.min(0.06, hold * 0.025) : 0, t, 0.12);
        A.f!.frequency.setTargetAtTime(260 + B * 1800, t, 0.2);
        A.dg!.gain.setTargetAtTime(0.09 + B * 0.09, t, 0.2);
        A.ng!.gain.setTargetAtTime(0.004 + B * 0.035, t, 0.3);
        A.an!.getByteTimeDomainData(A.buf!);
        let s = 0;
        for (let i = 0; i < 256; i++) {
          const v = (A.buf![i] - 128) / 128;
          s += v * v;
        }
        aud += (Math.min(Math.sqrt(s / 256) * 5, 1) - aud) * Math.min(dt * 10, 1);
      } else aud *= 0.92;

      const ad = Math.min(1, aud + voice * 1.2);

      const specT = vSpec;
      specC += (specT - specC) * Math.min(dt * 1.5, 1);
      goldC += (0 - goldC) * Math.min(dt * 2, 1);

      // Strobe: one second of full-spectrum frenzy whenever a session is
      // activated from the orb. Reduced-motion users never get the strobe.
      const strobeAge = reducedMotion ? -1 : (performance.now() - strobeRef.current) / 1000;
      const strobeBoost = strobeAge >= 0 && strobeAge < 1 ? 1 - strobeAge : 0;

      const drift = reducedMotion ? 0.16 : 1;
      const wobble = reducedMotion ? 0 : Math.sin(time * 0.55) * 0.35;
      const hT = time * vRate * drift + wobble;
      {
        const dh =
          ((hT - hueC + Math.PI) % 6.2831853 + 6.2831853) % 6.2831853 - Math.PI;
        hueC += dh * Math.min(dt * 2, 1);
      }
      if (strobeBoost > 0) {
        hueC += dt * 26 * strobeBoost;
        specC = Math.max(specC, 0.4 + strobeBoost * 1.2);
      }

      // Mirror the live hue onto the page so buttons, borders and progress
      // can breathe in the same colour as the orb.
      hueAcc += dt;
      if (hueAcc > 0.08) {
        hueAcc = 0;
        const hueDeg = ((hueC * 57.29578) % 360 + 360) % 360;
        document.documentElement.style.setProperty("--orb-hue", hueDeg.toFixed(1));
      }
      const pl = pulse * pulse;

      if (!T.s) return;
      intro = Math.min(1, intro + dt / 2.4);
      const inn = 1 - Math.pow(1 - intro, 3);
      const Rr = (0.52 + 0.105 * B + pl * 0.04 + ad * 0.03) * inn * (1 - charge * 0.12);

      // --- Render passes ---
      gl.bindFramebuffer(gl.FRAMEBUFFER, T.s.f);
      gl.viewport(0, 0, T.s.w, T.s.h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(
        gl.ONE,
        gl.ONE_MINUS_SRC_COLOR,
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
      );

      // Halo pass
      gl.useProgram(HP);
      gl.bindBuffer(gl.ARRAY_BUFFER, qb);
      const hl = gl.getAttribLocation(HP, "p");
      gl.enableVertexAttribArray(hl);
      gl.vertexAttribPointer(hl, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(hu.uRes!, T.s.w, T.s.h);
      gl.uniform1f(hu.uS!, sc);
      gl.uniform1f(hu.uB!, B);
      gl.uniform1f(hu.uPulse!, pl);
      gl.uniform1f(hu.uAud!, ad);
      gl.uniform1f(hu.uT!, time);
      gl.uniform1f(hu.uR!, Rr);
      gl.uniform1f(hu.uCh!, charge);
      gl.uniform1f(hu.uHue!, hueC);
      gl.uniform1f(hu.uSpec!, specC);
      gl.uniform1f(hu.uRing!, Math.min(1, ringT / 2.5));
      gl.uniform2f(hu.uM!, ay, ax);
      gl.uniform3fv(hu.uC0!, pal[0]);
      gl.uniform3fv(hu.uC1!, pal[1]);
      gl.uniform3fv(hu.uC2!, pal[2]);
      gl.uniform3fv(hu.uC3!, pal[3]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.disableVertexAttribArray(hl);

      // Particle pass
      gl.useProgram(PP);
      gl.bindBuffer(gl.ARRAY_BUFFER, sb);
      const sl = gl.getAttribLocation(PP, "aSeed");
      gl.enableVertexAttribArray(sl);
      gl.vertexAttribPointer(sl, 4, gl.FLOAT, false, 0, 0);
      gl.uniform1f(pu.uIn!, inn);
      gl.uniform1f(pu.uGold!, goldC);
      gl.uniform1f(pu.uHue!, hueC);
      gl.uniform1f(pu.uSpec!, specC);
      gl.uniform1f(pu.uCh!, charge);
      gl.uniform1f(pu.uScan!, scan);
      gl.uniform1f(pu.uSq!, sqS);
      gl.uniform1f(pu.uGal!, gal);
      gl.uniform1f(pu.uFw!, fw);
      gl.uniform1f(pu.uMT!, mtS);
      gl.uniform2f(pu.uT1!, tA[0], tA[1]);
      gl.uniform2f(pu.uT2!, tB[0], tB[1]);
      gl.uniform2f(pu.uG!, 0, -1);
      gl.uniform1f(pu.uT!, time);
      gl.uniform1f(pu.uAsp!, asp);
      gl.uniform1f(pu.uPulse!, pl);
      gl.uniform1f(pu.uS!, sc);
      gl.uniform1f(pu.uB!, B);
      gl.uniform1f(pu.uAud!, ad);
      gl.uniform1f(pu.uPS!, ps * (still ? 0 : 1));
      gl.uniform1f(pu.uWT!, wt);
      gl.uniform1f(pu.uWA!, wa);
      gl.uniform2f(pu.uM!, ay, ax);
      gl.uniform2f(pu.uPtr!, ptr[0], ptr[1]);
      gl.uniform3fv(pu.uHit!, hit);
      gl.uniform3fv(pu.uC0!, pal[0]);
      gl.uniform3fv(pu.uC1!, pal[1]);
      gl.uniform3fv(pu.uC2!, pal[2]);
      gl.uniform3fv(pu.uC3!, pal[3]);
      const px = (1.85 * cv.height / 1080) * Math.max(0.8, Math.sqrt(N / count));
      gl.uniform1f(pu.uPx!, px);
      gl.uniform1f(pu.uBloom!, 0);
      gl.drawArrays(gl.POINTS, 0, count);
      gl.disableVertexAttribArray(sl);

      // Lattice pass
      gl.useProgram(LP);
      gl.uniform1f(lu.uT!, time);
      gl.uniform1f(lu.uAsp!, asp);
      gl.uniform1f(lu.uS!, sc);
      gl.uniform1f(lu.uB!, B);
      gl.uniform1f(lu.uPulse!, pl);
      gl.uniform1f(lu.uAud!, ad);
      gl.uniform1f(lu.uIn!, inn);
      gl.uniform1f(lu.uWT!, wt);
      gl.uniform1f(lu.uWA!, wa);
      gl.uniform1f(lu.uCh!, charge);
      gl.uniform1f(lu.uScan!, scan);
      gl.uniform1f(lu.uHue!, hueC);
      gl.uniform1f(lu.uSpec!, specC);
      gl.uniform1f(lu.uGal!, gal);
      gl.uniform1f(lu.uFw!, fw);
      gl.uniform1f(lu.uSq!, sqS);
      gl.uniform1f(lu.uMT!, mtS);
      gl.uniform1f(lu.uPx!, px);
      gl.uniform1f(lu.uPS!, ps * (still ? 0 : 1));
      gl.uniform2f(lu.uT1!, tA[0], tA[1]);
      gl.uniform2f(lu.uT2!, tB[0], tB[1]);
      gl.uniform2f(lu.uM!, ay, ax);
      gl.uniform2f(lu.uPtr!, ptr[0], ptr[1]);
      gl.uniform3fv(lu.uHit!, hit);
      gl.uniform3fv(lu.uC1!, pal[1]);
      gl.uniform3fv(lu.uC3!, pal[3]);
      const passes: Array<[WebGLBuffer, number, number, number]> = [
        [lb, lcount, gl.LINES, 0],
        [nb2, NN, gl.POINTS, 1],
      ];
      for (const [buf, cnt, modeGL, pts_] of passes) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        const lD = gl.getAttribLocation(LP, "aD");
        const lS = gl.getAttribLocation(LP, "aS");
        gl.enableVertexAttribArray(lD);
        gl.enableVertexAttribArray(lS);
        gl.vertexAttribPointer(lD, 3, gl.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(lS, 2, gl.FLOAT, false, 20, 12);
        gl.uniform1f(lu.uPts!, pts_);
        gl.drawArrays(modeGL, 0, cnt);
        gl.disableVertexAttribArray(lD);
        gl.disableVertexAttribArray(lS);
      }

      // Trail (cosmic ink)
      if (trail.length) {
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(
          gl.ONE,
          gl.ONE_MINUS_SRC_COLOR,
          gl.ONE,
          gl.ONE_MINUS_SRC_ALPHA
        );
        gl.useProgram(TP);
        gl.bindBuffer(gl.ARRAY_BUFFER, tb);
        for (let i = 0; i < trail.length; i++) {
          tdata[i * 3] = trail[i].x;
          tdata[i * 3 + 1] = trail[i].y;
          tdata[i * 3 + 2] = trail[i].a;
        }
        gl.bufferData(gl.ARRAY_BUFFER, tdata, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(tu.aP as number);
        gl.vertexAttribPointer(tu.aP as number, 2, gl.FLOAT, false, 12, 0);
        gl.enableVertexAttribArray(tu.aA as number);
        gl.vertexAttribPointer(tu.aA as number, 1, gl.FLOAT, false, 12, 8);
        gl.uniform1f(tu.uAsp!, asp);
        gl.uniform1f(tu.uS!, sc);
        gl.uniform3fv(tu.uC!, pal[3]);
        gl.drawArrays(gl.POINTS, 0, trail.length);
        gl.disableVertexAttribArray(tu.aP as number);
        gl.disableVertexAttribArray(tu.aA as number);
        gl.disable(gl.BLEND);
      }

      // Post: blur + color grade
      gl.disable(gl.BLEND);
      gl.bindBuffer(gl.ARRAY_BUFFER, qb);

      const quad = (
        P: WebGLProgram,
        src: { t: WebGLTexture; w: number; h: number },
        dst: { f: WebGLFramebuffer; w: number; h: number } | null,
        setup: () => void
      ) => {
        gl.useProgram(P);
        const l = gl.getAttribLocation(P, "p");
        gl.enableVertexAttribArray(l);
        gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, dst?.f || null);
        gl.viewport(0, 0, dst?.w || cv.width, dst?.h || cv.height);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, src.t);
        setup();
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.disableVertexAttribArray(l);
      };

      const blur = (
        src: { t: WebGLTexture; w: number; h: number },
        dst: { t: WebGLTexture; f: WebGLFramebuffer; w: number; h: number },
        dx: number,
        dy: number
      ) =>
        quad(BP, src, dst, () => {
          gl.uniform1i(bu.uTex!, 0);
          gl.uniform2f(bu.uDir!, (dx * 1.6) / dst.w, (dy * 1.6) / dst.h);
        });

      blur(T.s, T.a, 1, 0);
      blur(T.a, T.b, 0, 1);
      blur(T.b, T.a, 1.8, 0);
      blur(T.a, T.b, 0, 1.8);
      blur(T.b, T.a, 3.2, 0);
      blur(T.a, T.b, 0, 3.2);
      blur(T.b, T.a, 5.0, 0);
      blur(T.a, T.b, 0, 5.0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, T.b.t);
      gl.activeTexture(gl.TEXTURE0);
      quad(CP, T.s, null, () => {
        gl.uniform1i(cu.uS!, 0);
        gl.uniform1i(cu.uBl!, 1);
        gl.uniform1f(cu.uT!, time);
        gl.uniform1f(cu.uAud!, ad);
        gl.uniform1f(cu.uBloomK!, 0.85);
        gl.uniform1f(cu.uGl!, glitch);
      });
    }

    function ensureAmbient() {
      if (!A.on) {
        A.touched = true;
        setSound(true);
      } else if (A.ctx && A.ctx.state === "suspended") A.ctx.resume();
    }

    rafId = requestAnimationFrame(frame);

    // Expose API
    const orbApi = {
      pulse: () => {
        wt = 0;
        wa = 1;
        pulse = 1;
        chime(chord()[2] * 2, 0.8);
      },
      sound: setSound,
      setMode: (n: string) => {
        const i = MODES.findIndex(
          (m) => m.n.toLowerCase().replace(/[^a-z]/g, "") === n.toLowerCase().replace(/[^a-z]/g, "")
        );
        if (i >= 0) setModeIdx(i);
      },
      setGate: (g: string) => {
        const n = GATE[g.toLowerCase()];
        if (n) (window as any).OversoulOrb.setMode(n);
      },
    };
    (window as any).OversoulOrb = orbApi;

    // Cleanup
    return () => {
      stopped = true;
      if (rafId) cancelAnimationFrame(rafId);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      Object.values(T).forEach((t) => {
        if (t.t) gl.deleteTexture(t.t);
        if (t.f) gl.deleteFramebuffer(t.f);
      });
      [sb, qb, lb, nb2, tb].forEach((b) => b && gl.deleteBuffer(b));
      [PP, HP, BP, CP, LP, TP].forEach((p) => p && gl.deleteProgram(p));
      if (A.stream) {
        A.stream.getTracks().forEach((t) => t.stop());
      }
      if (A.ctx) A.ctx.close();
      // Hand the context back immediately. Without this, every open/close of a
      // second orb surface (e.g. the full-screen meditation) leaves a context
      // alive, and once the browser's context budget is exhausted the next orb
      // silently falls back to the flat gradient ball.
      try {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        /* not supported */
      }
      if ((window as any).OversoulOrb === orbApi) delete (window as any).OversoulOrb;
    };
  }, [activeVariant]);

  if (webglUnavailable) {
    if (hideWebglFallback) return null;
    const tint = FALLBACK_TINTS[mood];
    return (
      <div
        className="relative w-full h-full flex items-center justify-center"
        role="button"
        tabIndex={0}
        aria-label="A living orb of light. Hold to begin a session, tap twice to open today's practice."
        style={{ touchAction: "none", cursor: "pointer" }}
        onPointerDown={handleFallbackPointerDown}
        onPointerUp={handleFallbackPointerUp}
        onPointerCancel={handleFallbackPointerCancel}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleActivate();
          }
        }}
      >
        <div
          aria-hidden="true"
          className="rounded-full"
          style={{
            width: "74%",
            height: "74%",
            background: `radial-gradient(circle at 35% 32%, ${tint[3]} 0%, ${tint[2]} 38%, ${tint[1]} 68%, ${tint[0]} 100%)`,
            boxShadow: `0 0 80px ${tint[1]}55, inset 0 0 56px ${tint[2]}66`,
            opacity: 0.92,
            animation: prefersReducedMotion() ? undefined : "breathe 8s ease-in-out infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        id="c"
        aria-label="A living orb of particles that breathes, changes color, sings, and reacts to touch like fluid."
        style={{ width: "100%", height: "100%", display: "block", touchAction: "none", cursor: "grab" }}
      />
      <canvas
        ref={gcRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      />
    </div>
  );
}
