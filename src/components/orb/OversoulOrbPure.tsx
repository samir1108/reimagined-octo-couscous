"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface OversoulOrbPureProps {
  onActivate: () => void;
  onDoubleTap?: () => void;
  onTripleTap?: () => void;
  onHoldComplete?: () => void;
  className?: string;
}

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
 if(uFw>0.){p*=1.+uFw*1.5;I*=1.+uFw;col=mix(col,vec3(1.,.9,.6),uFw*.7);}
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

const hex = (s: string) => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16) / 255);
const tri = (r: number) => [r, r * 1.5, r * 2, r * 2.5];

const MODES = [
  { n: 'Calm', c: ['#6f63ff', '#45b4ff', '#b05cff', '#ff5ec4'], b: [4, 2, 6, 0], sp: 1, ch: [146.83, 220, 293.66, 369.99] },
  { n: 'Focus', c: ['#ff9d2e', '#ff5a3c', '#ffd27a', '#fff2cf'], b: [4, 4, 4, 4], sp: 1.1, ch: [98, 146.83, 196, 246.94] },
  { n: 'Heal', c: ['#22e6a0', '#18b4d0', '#7dff9b', '#e2ff72'], b: [5, 0, 5, 0], sp: .9, ch: [174.61, 261.63, 349.23, 440] },
  { n: 'Awaken', c: ['#ff3ea5', '#9150ff', '#3dd2ff', '#ffd166'], b: [3, 0, 3, 0], sp: 1.7, ch: [164.81, 246.94, 329.63, 415.3] },
  { n: 'Sleep', c: ['#3426b8', '#7b3fd6', '#2a62ff', '#b894ff'], b: [4, 7, 8, 0], sp: .5, ch: [65.41, 98, 130.81, 155.56] },
  { n: 'Aurora', c: ['#19e6c2', '#3aa0ff', '#8a63ff', '#ff7ad9'], b: [4, 4, 6, 0], sp: 1, ch: [130.81, 196, 261.63, 329.63] },
  { n: 'Ember', c: ['#ff4d5e', '#ff8a3d', '#ffc14d', '#ff6fb1'], b: [4, 2, 6, 0], sp: 1.2, ch: [110, 164.81, 220, 277.18] },
  { n: 'Root', c: ['#7a0f1d', '#e8213a', '#ff6b4a', '#ffb199'], b: [5, 2, 7, 0], sp: .6, ch: tri(65.41), chakra: 1 },
  { n: 'Sacral', c: ['#a8420a', '#ff7a1a', '#ffb347', '#ffe0b0'], b: [4, 2, 6, 0], sp: .8, ch: tri(73.42), chakra: 1 },
  { n: 'Solar', c: ['#b8860b', '#ffd23a', '#fff08a', '#fffbe0'], b: [4, 4, 4, 4], sp: 1.1, ch: tri(82.41), chakra: 1 },
  { n: 'Heart', c: ['#0b7a45', '#2fd06a', '#8dffb0', '#ff7ad9'], b: [5, 0, 5, 0], sp: .9, ch: tri(87.31), chakra: 1 },
  { n: 'Throat', c: ['#0a6f9e', '#2fb8ff', '#8ae6ff', '#e0f8ff'], b: [4, 2, 6, 0], sp: 1, ch: tri(98), chakra: 1 },
  { n: 'Third Eye', c: ['#2a1a9e', '#5a4bff', '#9a8bff', '#e0d4ff'], b: [4, 7, 8, 0], sp: .7, ch: tri(110), chakra: 1 },
  { n: 'Crown', c: ['#6a1fb0', '#c77dff', '#f0d4ff', '#ffffff'], b: [6, 0, 6, 0], sp: .5, ch: tri(123.47), chakra: 1 },
  { n: 'Vaikuntha', c: ['#6b390b', '#bd812d', '#f3c66f', '#fff0c4'], b: [6, 2, 8, 0], sp: .6, ch: [65.41, 98, 130.81, 196], gold: 1 },
  { n: 'Flow', c: null, b: [5, 0, 5, 0], sp: 1, ch: null }
].map(m => ({ ...m, rgb: m.c && m.c.map(hex) }));

const FL = MODES.filter(m => m.c && !m.chakra && !m.gold);
const CHK = MODES.filter(m => m.chakra);
const DEF = MODES.findIndex(m => m.gold);

export default function OversoulOrbPure({
  onActivate,
  onDoubleTap,
  onTripleTap,
  onHoldComplete,
  className = ""
}: OversoulOrbPureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gcRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  
  const [mode, setModeState] = useState(DEF);
  const [pulse, setPulse] = useState(0);
  const [charge, setCharge] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [holdStartTime, setHoldStartTime] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [tapTimer, setTapTimer] = useState<NodeJS.Timeout | null>(null);
  
  const HOLD_DURATION = 4500; // 4.5 seconds

  const compileShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Failed to create shader");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const err = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(err || "Shader compile failed");
    }
    return shader;
  };

  const createProgram = (gl: WebGLRenderingContext, vs: string, fs: string) => {
    const program = gl.createProgram();
    if (!program) throw new Error("Failed to create program");
    const vShader = compileShader(gl, gl.VERTEX_SHADER, vs);
    const fShader = compileShader(gl, gl.FRAGMENT_SHADER, fs);
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "Program link failed");
    }
    return program;
  };

  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    const gc = gcRef.current;
    if (!canvas || !gc) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true });
    if (!gl) return;
    glRef.current = gl;

    // Create programs
    const PP = createProgram(gl, PVS, PFS);
    const HP = createProgram(gl, HVS, HFS);
    const BP = createProgram(gl, QVS, BFS);
    const CP = createProgram(gl, QVS, CFS);
    const LP = createProgram(gl, LVS, LFS);
    const TP = createProgram(gl, TVS, TFS);

    // Particle seed buffer
    const N = 240000;
    const seed = new Float32Array(N * 4);
    for (let i = 0; i < N; i++) {
      const z = Math.random() * 2 - 1;
      const ph = Math.random() * 6.2831853;
      const s = Math.sqrt(1 - z * z);
      seed[i * 4] = s * Math.cos(ph);
      seed[i * 4 + 1] = z;
      seed[i * 4 + 2] = s * Math.sin(ph);
      seed[i * 4 + 3] = Math.random();
    }
    const sb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sb);
    gl.bufferData(gl.ARRAY_BUFFER, seed, gl.STATIC_DRAW);

    // Quad buffer
    const qb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, qb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    // Lattice geometry
    const NN = 72;
    const nd: number[][] = [];
    for (let i = 0; i < NN; i++) {
      const y = 1 - 2 * (i + 0.5) / NN;
      const r = Math.sqrt(1 - y * y);
      const a = i * 2.399963;
      nd.push([Math.cos(a) * r, y, Math.sin(a) * r]);
    }
    const lv: number[] = [];
    let eid = 0;
    for (let i = 0; i < NN; i++) for (let j = i + 1; j < NN; j++) {
      const a = nd[i], b = nd[j];
      if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 0.56) {
        eid++; const id = eid * 0.137, SG = 10;
        const om = Math.acos(Math.max(-1, Math.min(1, a[0]*b[0] + a[1]*b[1] + a[2]*b[2])));
        for (let q = 0; q < SG; q++) for (const u of [q/SG, (q+1)/SG]) {
          const A1 = Math.sin((1-u)*om)/Math.sin(om), B1 = Math.sin(u*om)/Math.sin(om);
          lv.push(A1*a[0]+B1*b[0], A1*a[1]+B1*b[1], A1*a[2]+B1*b[2], u, id);
        }
      }
    }
    const lines = new Float32Array(lv);
    const lcount = lines.length / 5;
    const npts = new Float32Array(NN * 5);
    nd.forEach((p, i) => npts.set([p[0], p[1], p[2], 0.5, i * 0.31 + 0.05], i * 5));
    const lb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lb);
    gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STATIC_DRAW);
    const nb2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nb2);
    gl.bufferData(gl.ARRAY_BUFFER, npts, gl.STATIC_DRAW);

    // Trail buffer
    const TB = 48;
    const tb = gl.createBuffer();
    const tdata = new Float32Array(TB * 3);

    // Uniform/attribute locations
    const pu: Record<string, WebGLUniformLocation | null> = {};
    const hu: Record<string, WebGLUniformLocation | null> = {};
    const bu: Record<string, WebGLUniformLocation | null> = {};
    const cu: Record<string, WebGLUniformLocation | null> = {};
    const lu: Record<string, WebGLUniformLocation | null> = {};
    const tu: Record<string, WebGLUniformLocation | number | null> = {};

    const getUL = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
    const getAL = (p: WebGLProgram, n: string) => gl.getAttribLocation(p, n);

    ['uT','uAsp','uPulse','uPx','uS','uB','uPS','uWT','uWA','uBloom','uAud','uIn','uCh','uScan','uG','uHue','uSpec','uGold','uSq','uGal','uFw','uMT','uM','uPtr','uG','uT1','uT2','uHit','uC0','uC1','uC2','uC3'].forEach(n => pu[n] = getUL(PP, n));
    ['uRes','uM','uS','uB','uPulse','uAud','uT','uR','uCh','uHue','uSpec','uRing','uC0','uC1','uC2','uC3'].forEach(n => hu[n] = getUL(HP, n));
    bu.uTex = getUL(BP, 'uTex'); bu.uDir = getUL(BP, 'uDir');
    cu.uS = getUL(CP, 'uS'); cu.uBl = getUL(CP, 'uBl'); cu.uT = getUL(CP, 'uT'); cu.uAud = getUL(CP, 'uAud'); cu.uBloomK = getUL(CP, 'uBloomK'); cu.uGl = getUL(CP, 'uGl');
    ['uT','uAsp','uS','uB','uPulse','uAud','uIn','uWT','uWA','uCh','uScan','uPts','uPx','uPS','uHue','uSpec','uGal','uFw','uSq','uMT','uM','uPtr','uT1','uT2','uHit','uC1','uC3'].forEach(n => lu[n] = getUL(LP, n));
    tu.aP = getAL(TP, 'aP'); tu.aA = getAL(TP, 'aA'); tu.uAsp = getUL(TP, 'uAsp'); tu.uS = getUL(TP, 'uS'); tu.uC = getUL(TP, 'uC');

    // Textures/framebuffers
    const T: Record<string, { t: WebGLTexture; f: WebGLFramebuffer; w: number; h: number }> = {};
    const mkTex = () => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]
        .forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, k, v)); return t; };
    const target = (name: string, w: number, h: number) => {
      const o = T[name] || (T[name] = { t: mkTex(), f: gl.createFramebuffer()!, w, h });
      o.w = w; o.h = h;
      gl.bindTexture(gl.TEXTURE_2D, o.t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, o.f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, o.t, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const pal = MODES[mode].rgb.map(c => c.slice());
    let time = 0, clock = 0, wt = 99, wa = 1, hit = [0, 0, 1];
    let B = 0, spd = 1, lastPh = 0, intro = 0, scan = 9, scanC = 0, hueC = 0, specC = 0.03, goldC = 1, mtS = 0, sqS = 0, fw = 0, gal = 0, galT = -1, ringT = 9, drumT = 0, resV = 0, omCool = 0;
    let ptr = [0, 0], hover = [0, 0], inside = 0, ps = 0, ay = 0, ax = 0, vy = 0, vx = 0;
    let tA = [0, 0], tB = [0, 0], mtT = 0, sqT = 0;
    const trail: { x: number; y: number; a: number }[] = [];

    const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
    const ease = (x: number) => x*x*x*(x*(x*6-15)+10);

    const resize = () => {
      const k = Math.min((window.devicePixelRatio || 1) * 2, 4096 / Math.max(canvas.clientWidth, canvas.clientHeight, 1));
      const w = Math.floor(canvas.clientWidth * k), h = Math.floor(canvas.clientHeight * k);
      if (w && h && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w; canvas.height = h;
        gc.width = canvas.clientWidth; gc.height = canvas.clientHeight;
        gl.viewport(0, 0, w, h);
        const bw = Math.max(2, w >> 2), bh = Math.max(2, h >> 2);
        target('s', w, h); target('a', bw, bh); target('b', bw, bh);
      }
    };

    const toNdc = (e: MouseEvent | Touch) => {
      const r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height * 2 - 1)];
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const event = e instanceof TouchEvent ? e.touches[0] : e;
      const p = toNdc(event);
      setIsHolding(true);
      setHoldStartTime(performance.now());
      setHoldProgress(0);
      
      if (tapTimer) { clearTimeout(tapTimer); setTapTimer(null); }
      setTapCount(c => c + 1);
      const newTapCount = tapCount + 1;
      setTapTimer(setTimeout(() => {
        if (newTapCount >= 3 && onTripleTap) onTripleTap();
        else if (newTapCount >= 2 && onDoubleTap) onDoubleTap();
        setTapCount(0);
      }, 400));

      // Impact feedback
      wt = 0; wa = 1; hit = [0, 0, 1];
      setPulse(1);
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      const held = (performance.now() - holdStartTime) / 1000;
      setIsHolding(false);
      
      if (held >= HOLD_DURATION / 1000) {
        if (onHoldComplete) onHoldComplete();
        if (onActivate) onActivate();
      }
      
      setHoldProgress(0);
      wt = 0; wa = 0.7; hit = [0, 0, 1];
      setPulse(1);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    new ResizeObserver(resize).observe(canvas);
    resize();

    const frame = (now: number) => {
      const dt = Math.max(0, Math.min((now - lastTimeRef.current) / 1000, 0.1));
      lastTimeRef.current = now;
      
      const m = MODES[mode];
      spd += (m.sp - spd) * Math.min(dt * 2, 1);
      time += dt * spd;
      clock += dt;
      wt += dt;

      // Slow colour drift: the palette hue keeps turning so the orb visibly
      // changes colour even while the user is only watching it.
      hueC = (hueC + dt * 0.12) % 6.2831853;
      
      // Hold progress
      if (isHolding) {
        const progress = Math.min(1, (performance.now() - holdStartTime) / HOLD_DURATION);
        setHoldProgress(progress);
        if (progress >= 1) {
          setIsHolding(false);
          setHoldProgress(0);
          if (onHoldComplete) onHoldComplete();
          if (onActivate) onActivate();
        }
      }

      // Breath cycle
      const cyc = m.b.reduce((a, b) => a + b, 0);
      let tc = clock % cyc, acc = 0, ph = 0;
      while (ph < 3 && tc >= acc + m.b[ph]) { acc += m.b[ph]; ph++; }
      while (m.b[ph] === 0 && ph < 3) ph++;
      const pd = m.b[ph], pt = Math.min(tc - acc, pd), p = pd ? pt / pd : 0;
      const bt = ph === 0 ? ease(p) : ph === 1 ? 1 : ph === 2 ? 1 - ease(p) : 0;
      B += (bt - B) * (1 - Math.exp(-dt * 3.2));
      if (lastPh === 0 && ph !== 0) { wt = 0; wa = 1; hit = [0, 0, 1]; setPulse(1); }
      if (ph === 2 && lastPh !== 2) ringT = 0;
      lastPh = ph; ringT += dt;

      // Palette interpolation
      let tgt = m.rgb;
      if (!tgt) {
        const f = clock / 9, i = ((Math.floor(f) % FL.length) + FL.length) % FL.length, j = (i + 1) % FL.length, e = ease(f % 1);
        tgt = FL[i].rgb.map((c, k) => c.map((v, x) => v + (FL[j].rgb[k][x] - v) * e));
      }
      const kc = Math.min(dt * 2.2, 1);
      for (let k = 0; k < 4; k++) for (let x = 0; x < 3; x++) pal[k][x] += (tgt[k][x] - pal[k][x]) * kc;

      // Pulse decay
      setPulse(p => Math.max(0, p - dt * 0.7));
      
      // Charge
      if (isHolding) setCharge(Math.min(1, Math.max(0, (dt - 0.25) / 2)));
      else setCharge(c => Math.max(0, c - dt * 1.6));

      // Scan plane
      scanC += dt;
      scan = (scanC % 9) / 2.4 < 1 ? -1.2 + 2.4 * ((scanC % 9) / 2.4) : 9;

      // Trail decay
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].a -= dt * 0.75;
        if (trail[i].a <= 0) trail.splice(i, 1);
      }

      // Render
      if (!T.s) return;
      
      intro = Math.min(1, intro + dt / 2.4);
      const inn = 1 - Math.pow(1 - intro, 3);
      const Rr = (0.52 + 0.105 * B + pulse * pulse * 0.04 + 0 * 0.03) * inn * (1 - charge * 0.12);
      const pl = pulse * pulse;

      gl.bindFramebuffer(gl.FRAMEBUFFER, T.s.f); gl.viewport(0, 0, T.s.w, T.s.h);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      // Halo/body
      gl.useProgram(HP); gl.bindBuffer(gl.ARRAY_BUFFER, qb);
      const hl = gl.getAttribLocation(HP, 'p');
      gl.enableVertexAttribArray(hl); gl.vertexAttribPointer(hl, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(hu.uRes!, T.s.w, T.s.h); gl.uniform1f(hu.uS!, 1); gl.uniform1f(hu.uB!, B); gl.uniform1f(hu.uPulse!, pl); gl.uniform1f(hu.uAud!, 0);
      gl.uniform1f(hu.uT!, time); gl.uniform1f(hu.uR!, Rr); gl.uniform1f(hu.uCh!, charge); gl.uniform1f(hu.uHue!, hueC); gl.uniform1f(hu.uSpec!, specC); gl.uniform1f(hu.uRing!, Math.min(1, ringT / 2.5)); gl.uniform2f(hu.uM!, ay, ax);
      gl.uniform3fv(hu.uC0!, pal[0]); gl.uniform3fv(hu.uC1!, pal[1]); gl.uniform3fv(hu.uC2!, pal[2]); gl.uniform3fv(hu.uC3!, pal[3]);
      gl.drawArrays(gl.TRIANGLES, 0, 3); gl.disableVertexAttribArray(hl);

      // Particles
      gl.useProgram(PP); gl.bindBuffer(gl.ARRAY_BUFFER, sb);
      const sl = gl.getAttribLocation(PP, 'aSeed');
      gl.enableVertexAttribArray(sl); gl.vertexAttribPointer(sl, 4, gl.FLOAT, false, 0, 0);
      gl.uniform1f(pu.uIn!, inn); gl.uniform1f(pu.uGold!, goldC); gl.uniform1f(pu.uHue!, hueC); gl.uniform1f(pu.uSpec!, specC); gl.uniform1f(pu.uCh!, charge); gl.uniform1f(pu.uScan!, scan); gl.uniform1f(pu.uSq!, sqS); gl.uniform1f(pu.uGal!, gal); gl.uniform1f(pu.uFw!, fw); gl.uniform1f(pu.uMT!, mtS); gl.uniform2f(pu.uT1!, tA[0], tA[1]); gl.uniform2f(pu.uT2!, tB[0], tB[1]); gl.uniform2f(pu.uG!, 0, -1); gl.uniform1f(pu.uT!, time); gl.uniform1f(pu.uAsp!, canvas.width / canvas.height); gl.uniform1f(pu.uPulse!, pl); gl.uniform1f(pu.uS!, 1); gl.uniform1f(pu.uB!, B); gl.uniform1f(pu.uAud!, 0);
      gl.uniform1f(pu.uPS!, ps); gl.uniform1f(pu.uWT!, wt); gl.uniform1f(pu.uWA!, wa); gl.uniform2f(pu.uM!, ay, ax); gl.uniform2f(pu.uPtr!, ptr[0], ptr[1]);
      gl.uniform3fv(pu.uHit!, hit);
      gl.uniform3fv(pu.uC0!, pal[0]); gl.uniform3fv(pu.uC1!, pal[1]); gl.uniform3fv(pu.uC2!, pal[2]); gl.uniform3fv(pu.uC3!, pal[3]);
      const px = (1.2 * canvas.height / 1080) * Math.max(0.8, Math.sqrt(N / 240000));
      gl.uniform1f(pu.uPx!, px); gl.uniform1f(pu.uBloom!, 0); gl.drawArrays(gl.POINTS, 0, 240000);
      gl.disableVertexAttribArray(sl);

      // Lattice
      gl.useProgram(LP);
      gl.uniform1f(lu.uT!, time); gl.uniform1f(lu.uAsp!, canvas.width / canvas.height); gl.uniform1f(lu.uS!, 1); gl.uniform1f(lu.uB!, B); gl.uniform1f(lu.uPulse!, pl); gl.uniform1f(lu.uAud!, 0);
      gl.uniform1f(lu.uIn!, inn); gl.uniform1f(lu.uWT!, wt); gl.uniform1f(lu.uWA!, wa); gl.uniform1f(lu.uCh!, charge); gl.uniform1f(lu.uScan!, scan); gl.uniform1f(lu.uHue!, hueC); gl.uniform1f(lu.uSpec!, specC); gl.uniform1f(lu.uGal!, gal); gl.uniform1f(lu.uFw!, fw); gl.uniform1f(lu.uSq!, sqS); gl.uniform1f(lu.uMT!, mtS); gl.uniform1f(lu.uPx!, px); gl.uniform1f(lu.uPS!, ps);
      gl.uniform2f(lu.uT1!, tA[0], tA[1]); gl.uniform2f(lu.uT2!, tB[0], tB[1]); gl.uniform2f(lu.uM!, ay, ax); gl.uniform2f(lu.uPtr!, ptr[0], ptr[1]); gl.uniform3fv(lu.uHit!, hit); gl.uniform3fv(lu.uC1!, pal[1]); gl.uniform3fv(lu.uC3!, pal[3]);
      for (const [buf, cnt, mode2, pts] of [
        [lb, lcount, gl.LINES, 0],
        [nb2, NN, gl.POINTS, 1],
      ] as [WebGLBuffer, number, number, number][]) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.enableVertexAttribArray(lu.uPts! as number); gl.enableVertexAttribArray(lu.uPts! as number);
        const lD = gl.getAttribLocation(LP, 'aD'), lS = gl.getAttribLocation(LP, 'aS');
        gl.enableVertexAttribArray(lD); gl.enableVertexAttribArray(lS);
        gl.vertexAttribPointer(lD, 3, gl.FLOAT, false, 20, 0); gl.vertexAttribPointer(lS, 2, gl.FLOAT, false, 20, 12);
        gl.uniform1f(lu.uPts!, pts); gl.drawArrays(mode2, 0, cnt);
        gl.disableVertexAttribArray(lD); gl.disableVertexAttribArray(lS);
      }

      // Trail
      if (trail.length) {
        gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(TP); gl.bindBuffer(gl.ARRAY_BUFFER, tb);
        for (let i = 0; i < trail.length; i++) { tdata[i * 3] = trail[i].x; tdata[i * 3 + 1] = trail[i].y; tdata[i * 3 + 2] = trail[i].a; }
        gl.bufferData(gl.ARRAY_BUFFER, tdata, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(tu.aP as number); gl.vertexAttribPointer(tu.aP as number, 2, gl.FLOAT, false, 12, 0);
        gl.enableVertexAttribArray(tu.aA as number); gl.vertexAttribPointer(tu.aA as number, 1, gl.FLOAT, false, 12, 8);
        gl.uniform1f(tu.uAsp as WebGLUniformLocation, canvas.width / canvas.height); gl.uniform1f(tu.uS as WebGLUniformLocation, 1); gl.uniform3fv(tu.uC as WebGLUniformLocation, pal[3]);
        gl.drawArrays(gl.POINTS, 0, trail.length);
        gl.disableVertexAttribArray(tu.aP as number); gl.disableVertexAttribArray(tu.aA as number); gl.disable(gl.BLEND);
      }

      // Post-process: blur + composite
      gl.disable(gl.BLEND); gl.bindBuffer(gl.ARRAY_BUFFER, qb);
      const quad = (P: WebGLProgram, src: { t: WebGLTexture; w: number; h: number }, dst: { f: WebGLFramebuffer; w: number; h: number } | null, setup: () => void) => {
        gl.useProgram(P); const l = gl.getAttribLocation(P, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.f : null); gl.viewport(0, 0, dst ? dst.w : canvas.width, dst ? dst.h : canvas.height);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src.t); setup(); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.disableVertexAttribArray(l);
      };
      const blur = (src: { t: WebGLTexture; w: number; h: number }, dst: { f: WebGLFramebuffer; w: number; h: number }, dx: number, dy: number) => 
        quad(BP, src, dst, () => { gl.uniform1i(bu.uTex!, 0); gl.uniform2f(bu.uDir!, dx * 1.6 / dst.w, dy * 1.6 / dst.h); });
      
      blur(T.s, T.a, 1, 0); blur(T.a, T.b, 0, 1); blur(T.b, T.a, 1.8, 0); blur(T.a, T.b, 0, 1.8);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, T.b.t); gl.activeTexture(gl.TEXTURE0);
      quad(CP, T.s, null, () => { gl.uniform1i(cu.uS!, 0); gl.uniform1i(cu.uBl!, 1); gl.uniform1f(cu.uT!, time); gl.uniform1f(cu.uAud!, 0); gl.uniform1f(cu.uBloomK!, 0.62); gl.uniform1f(cu.uGl!, 0); });

      animationRef.current = requestAnimationFrame(frame);
    };

    animationRef.current = requestAnimationFrame(frame);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
      cancelAnimationFrame(animationRef.current);
    };
  }, [mode, onActivate, onDoubleTap, onTripleTap, onHoldComplete, tapCount]);

  useEffect(() => {
    const cleanup = initGL();
    return cleanup;
  }, [initGL]);

  return (
    <div className={`relative ${className}`} style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      <canvas ref={canvasRef} id="c" aria-label="Living consciousness orb" style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }} />
      <canvas ref={gcRef} id="gc" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
      
      {/* Hold progress ring */}
      {isHolding && holdProgress > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg className="w-full h-full max-w-[200px] max-h-[200px] -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={2 * Math.PI * 45 * (1 - holdProgress)}
              style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }}
            />
          </svg>
        </div>
      )}
      
      {/* Hold hint */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-4 text-center pointer-events-none">
        <p className="text-[9px] font-display tracking-[0.25em] uppercase text-muted-foreground">
          {isHolding ? `Hold... ${Math.round(holdProgress * 100)}%` : 'Hold to begin'}
        </p>
      </div>
    </div>
  );
}