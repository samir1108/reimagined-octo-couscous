"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { OrbPalette } from "./palettes";

const NOISE_GLSL = `
float h(vec3 p){ p = fract(p*0.3183099 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float n3(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(h(i), h(i+vec3(1.0,0.0,0.0)), f.x), mix(h(i+vec3(0.0,1.0,0.0)), h(i+vec3(1.0,1.0,0.0)), f.x), f.y),
             mix(mix(h(i+vec3(0.0,0.0,1.0)), h(i+vec3(1.0,0.0,1.0)), f.x), mix(h(i+vec3(0.0,1.0,1.0)), h(i+vec3(1.0,1.0,1.0)), f.x), f.y), f.z); }
float fbm(vec3 p){ float a = 0.5; float s = 0.0; for(int i = 0; i < 3; i++){ s += a*n3(p); p = p*2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }
float rg(vec3 x){ return pow(1.0-abs(2.0*n3(x)-1.0), 8.0); }
`;

const PARTICLE_VERTEX = `precision highp float;
uniform float uT, uAsp, uPulse, uPx, uS, uB, uPS, uWT, uWA, uBloom, uAud, uIn, uCh, uScan, uHue, uSpec, uGold, uSq, uGal, uFw, uMT;
uniform vec2 uM, uPtr, uG, uT1, uT2;
uniform vec3 uHit, uC0, uC1, uC2, uC3;
attribute vec4 aSeed;
varying vec3 vC;
${NOISE_GLSL}
vec3 grad(float x){ x=abs(fract(x)*2.0-1.0)*3.0; return x<1.0?mix(uC0,uC1,x):(x<2.0?mix(uC1,uC2,x-1.0):mix(uC2,uC3,x-2.0)); }
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
vec3 hue(vec3 c,float a){vec3 k=vec3(.57735);float ca=cos(a),sa=sin(a);return c*ca+cross(k,c)*sa+k*dot(k,c)*(1.-ca);}
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
}
`;

const PARTICLE_FRAGMENT = `precision mediump float;
varying vec3 vC;
void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.02,d)*.82+smoothstep(.13,0.,d)*.55;vec3 c=vC*a;gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}
`;

const HALO_VERTEX = `precision highp float;
attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}
`;

const HALO_FRAGMENT = `precision highp float;uniform vec2 uRes,uM;uniform float uS,uB,uPulse,uAud,uT,uR,uCh,uHue,uSpec,uRing;uniform vec3 uC0,uC1,uC2,uC3;
${NOISE_GLSL}
vec3 grad(float x){x=abs(fract(x)*2.-1.)*3.;return x<1.?mix(uC0,uC1,x):(x<2.?mix(uC1,uC2,x-1.):mix(uC2,uC3,x-2.));}
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
vec3 hue(vec3 c,float a){vec3 k=vec3(.57735);float ca=cos(a),sa=sin(a);return c*ca+cross(k,c)*sa+k*dot(k,c)*(1.-ca);}
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
}
`;

const LATTICE_VERTEX = `precision highp float;attribute vec3 aD;attribute vec2 aS;
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
 if(uFw>0.){bp*=1.+uFw*1.5;}
 vec3 pv=M*bp;vec3 nv=M*aD;
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
}
`;

const LATTICE_FRAGMENT = `precision mediump float;uniform float uPts;varying vec3 vC,vP;varying float vS,vPh;
void main(){vec3 c;
if(uPts>.5){float d=length(gl_PointCoord-.5);c=(vC*3.+vec3(.3))*smoothstep(.5,0.,d);}
else{float pk=exp(-pow((vS-vPh)*9.,2.));c=vC+vP*pk*.9;}
gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}
`;

const BLUR_VERTEX = `precision highp float;
attribute vec2 p;varying vec2 vUv;void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}
`;

const BLUR_FRAGMENT = `precision mediump float;uniform sampler2D uTex;uniform vec2 uDir;varying vec2 vUv;
void main(){vec4 s=texture2D(uTex,vUv)*.227027;
s+=(texture2D(uTex,vUv+uDir*1.3846)+texture2D(uTex,vUv-uDir*1.3846))*.316216;
s+=(texture2D(uTex,vUv+uDir*3.2308)+texture2D(uTex,vUv-uDir*3.2308))*.070270;
gl_FragColor=s;}
`;

const COMPOSITE_FRAGMENT = `precision highp float;uniform sampler2D uS,uBl;uniform float uT,uAud,uBloomK,uGl;varying vec2 vUv;
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
}
`;

const TRAIL_VERTEX = `precision highp float;
attribute vec2 aP;attribute float aA;uniform float uAsp,uS;varying float vA;void main(){vA=aA;gl_Position=vec4(aP.x*uS/uAsp,aP.y*uS,0.,1.);gl_PointSize=(10.+26.*aA)*uS;}
`;

const TRAIL_FRAGMENT = `precision mediump float;varying float vA;uniform vec3 uC;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,d)*vA;vec3 c=uC*1.6*a;gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}
`;

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0,2),16)/255, parseInt(c.slice(2,4),16)/255, parseInt(c.slice(4,6),16)/255];
}

interface OversoulOrbCanvasProps {
  palette: OrbPalette;
  charge: number;
  pointer: { x: number; y: number };
  pulseKey: number;
  breathSeconds?: number;
}

export default function OversoulOrbCanvas({
  palette,
  charge,
  pointer,
  pulseKey,
  breathSeconds = 8,
}: OversoulOrbCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const progRef = useRef<Record<string, WebGLProgram>>({});
  const texRef = useRef<Record<string, WebGLTexture>>({});
  const fbRef = useRef<Record<string, WebGLFramebuffer>>({});
  const bufRef = useRef<Record<string, WebGLBuffer>>({});
  const animRef = useRef<number>();
  const timeRef = useRef(0);
  const lastRef = useRef(performance.now());
  const chargeSmoothRef = useRef(0);
  const shockRef = useRef(0);
  const hueRef = useRef(0);
  const specRef = useRef(0.03);
  const goldRef = useRef(1);
  const scanRef = useRef(9);
  const pulseRef = useRef(0);
  const mtSRef = useRef(0);
  const sqSRef = useRef(0);
  const fwRef = useRef(0);
  const galRef = useRef(0);
  const galTRef = useRef(-1);
  const ringTRef = useRef(9);
  const hitRef = useRef([0, 0, 1]);
  const wtRef = useRef(99);
  const waRef = useRef(1);
  const countRef = useRef(240000);
  const rsRef = useRef(2.0);
  const modeIdxRef = useRef(13); // Vaikuntha default
  const flowIRef = useRef(0);
  const introRef = useRef(0);

  // Audio state
  const audioRef = useRef({
    ctx: null as AudioContext | null,
    on: false,
    osc: [] as Array<[OscillatorNode, number]>,
    master: null as GainNode | null,
    an: null as AnalyserNode | null,
    buf: new Uint8Array(256),
    fbuf: new Uint8Array(256),
    beatP: 0,
    refr: 0,
    prev: 0,
    ng: null as GainNode | null,
    co: null as OscillatorNode | null,
    cg: null as GainNode | null,
    ho: null as OscillatorNode | null,
    hg: null as GainNode | null,
    bL: null as OscillatorNode | null,
    bR: null as OscillatorNode | null,
  });

  // MODES from HTML orb
  const MODES = useMemo(() => {
    const tri = (r: number) => [r, r*1.5, r*2, r*2.5];
    const hex = (s: string) => [1,3,5].map(i => parseInt(s.slice(i,i+2),16)/255);
    return [
      {n:'Calm',  c:['#6f63ff','#45b4ff','#b05cff','#ff5ec4'],b:[4,2,6,0],sp:1,  ch:[146.83,220,293.66,369.99]},
      {n:'Focus', c:['#ff9d2e','#ff5a3c','#ffd27a','#fff2cf'],b:[4,4,4,4],sp:1.1,ch:[98,146.83,196,246.94]},
      {n:'Heal',  c:['#22e6a0','#18b4d0','#7dff9b','#e2ff72'],b:[5,0,5,0],sp:.9, ch:[174.61,261.63,349.23,440]},
      {n:'Awaken',c:['#ff3ea5','#9150ff','#3dd2ff','#ffd166'],b:[3,0,3,0],sp:1.7,ch:[164.81,246.94,329.63,415.3]},
      {n:'Sleep', c:['#3426b8','#7b3fd6','#2a62ff','#b894ff'],b:[4,7,8,0],sp:.5, ch:[65.41,98,130.81,155.56]},
      {n:'Aurora',c:['#19e6c2','#3aa0ff','#8a63ff','#ff7ad9'],b:[4,4,6,0],sp:1,  ch:[130.81,196,261.63,329.63]},
      {n:'Ember', c:['#ff4d5e','#ff8a3d','#ffc14d','#ff6fb1'],b:[4,2,6,0],sp:1.2,ch:[110,164.81,220,277.18]},
      {n:'Root',      c:['#7a0f1d','#e8213a','#ff6b4a','#ffb199'],b:[5,2,7,0],sp:.6, ch:tri(65.41),chakra:1},
      {n:'Sacral',    c:['#a8420a','#ff7a1a','#ffb347','#ffe0b0'],b:[4,2,6,0],sp:.8, ch:tri(73.42),chakra:1},
      {n:'Solar',     c:['#b8860b','#ffd23a','#fff08a','#fffbe0'],b:[4,4,4,4],sp:1.1,ch:tri(82.41),chakra:1},
      {n:'Heart',     c:['#0b7a45','#2fd06a','#8dffb0','#ff7ad9'],b:[5,0,5,0],sp:.9, ch:tri(87.31),chakra:1},
      {n:'Throat',    c:['#0a6f9e','#2fb8ff','#8ae6ff','#e0f8ff'],b:[4,2,6,0],sp:1,  ch:tri(98),chakra:1},
      {n:'Third Eye', c:['#2a1a9e','#5a4bff','#9a8bff','#e0d4ff'],b:[4,7,8,0],sp:.7, ch:tri(110),chakra:1},
      {n:'Crown',     c:['#6a1fb0','#c77dff','#f0d4ff','#ffffff'],b:[6,0,6,0],sp:.5, ch:tri(123.47),chakra:1},
      {n:'Vaikuntha',c:['#6b390b','#bd812d','#f3c66f','#fff0c4'],b:[6,2,8,0],sp:.6,ch:[65.41,98,130.81,196],gold:1},
      {n:'Flow',  c:null,b:[5,0,5,0],sp:1,ch:null}
    ].map(m => ({...m, rgb: m.c && m.c.map(hex)}));
  }, []);

  const m = MODES[modeIdxRef.current];

  const compileShader = (gl: WebGLRenderingContext, type: number, src: string): WebGLShader => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      throw new Error('Shader compile failed');
    }
    return s;
  };

  const createProgram = (gl: WebGLRenderingContext, vs: string, fs: string): WebGLProgram => {
    const p = gl.createProgram()!;
    gl.attachShader(p, compileShader(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compileShader(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(p));
      throw new Error('Program link failed');
    }
    return p;
  };

  const getUniforms = (gl: WebGLRenderingContext, prog: WebGLProgram, names: string[]) => {
    const u: Record<string, WebGLUniformLocation> = {};
    names.forEach(n => { u[n] = gl.getUniformLocation(prog, n)!; });
    return u;
  };

  const getAttribs = (gl: WebGLRenderingContext, prog: WebGLProgram, names: string[]) => {
    const a: Record<string, number> = {};
    names.forEach(n => { a[n] = gl.getAttribLocation(prog, n); });
    return a;
  };

  const mkTex = (gl: WebGLRenderingContext, w: number, h: number): WebGLTexture => {
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };

  const target = (name: string, w: number, h: number) => {
    const gl = glRef.current!;
    const t = mkTex(gl, w, h);
    const f = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    texRef.current[name] = t;
    fbRef.current[name] = f;
  };

  const resize = () => {
    const gl = glRef.current!;
    const cv = canvasRef.current!;
    const dpr = Math.min((window.devicePixelRatio || 1) * rsRef.current, 4096 / Math.max(cv.clientWidth, cv.clientHeight, 1));
    const w = Math.floor(cv.clientWidth * dpr);
    const h = Math.floor(cv.clientHeight * dpr);
    if (w && h && (cv.width !== w || cv.height !== h)) {
      cv.width = w; cv.height = h;
      gl.viewport(0, 0, w, h);
      const bw = Math.max(2, w >> 2), bh = Math.max(2, h >> 2);
      target('s', w, h);
      target('a', bw, bh);
      target('b', bw, bh);
    }
  };

  const initGL = () => {
    const cv = canvasRef.current!;
    const gl = cv.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true, depth: false, stencil: false, powerPreference: 'high-performance' });
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    glRef.current = gl;

    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Programs
    progRef.current.p = createProgram(gl, PARTICLE_VERTEX, PARTICLE_FRAGMENT);
    progRef.current.h = createProgram(gl, HALO_VERTEX, HALO_FRAGMENT);
    progRef.current.l = createProgram(gl, LATTICE_VERTEX, LATTICE_FRAGMENT);
    progRef.current.b = createProgram(gl, BLUR_VERTEX, BLUR_FRAGMENT);
    progRef.current.c = createProgram(gl, BLUR_VERTEX, COMPOSITE_FRAGMENT);
    progRef.current.t = createProgram(gl, TRAIL_VERTEX, TRAIL_FRAGMENT);

    // Uniforms
    progRef.current.pu = getUniforms(gl, progRef.current.p, [
      'uT','uAsp','uPulse','uPx','uS','uB','uPS','uWT','uWA','uBloom','uAud','uIn','uCh','uScan','uG','uHue','uSpec','uGold','uSq','uGal','uFw','uMT',
      'uM','uPtr','uG','uT1','uT2','uHit','uC0','uC1','uC2','uC3'
    ]);
    progRef.current.hu = getUniforms(gl, progRef.current.h, [
      'uRes','uM','uS','uB','uPulse','uAud','uT','uR','uCh','uHue','uSpec','uRing','uC0','uC1','uC2','uC3'
    ]);
    progRef.current.lu = getUniforms(gl, progRef.current.l, [
      'uT','uAsp','uS','uB','uPulse','uAud','uIn','uWT','uWA','uCh','uScan','uPts','uPx','uPS','uHue','uSpec','uGal','uFw','uSq','uMT',
      'uM','uPtr','uT1','uT2','uHit','uC1','uC3'
    ]);
    progRef.current.bu = getUniforms(gl, progRef.current.b, ['uTex','uDir']);
    progRef.current.cu = getUniforms(gl, progRef.current.c, ['uS','uBl','uT','uAud','uBloomK','uGl']);
    progRef.current.tu = getUniforms(gl, progRef.current.t, ['uAsp','uS','uC']);

    // Particle geometry
    const N = countRef.current;
    const seed = new Float32Array(N * 4);
    for (let i = 0; i < N; i++) {
      const z = Math.random() * 2 - 1;
      const phi = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - z * z);
      seed[i*4] = r * Math.cos(phi);
      seed[i*4+1] = z;
      seed[i*4+2] = r * Math.sin(phi);
      seed[i*4+3] = Math.random();
    }
    const sb = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, sb);
    gl.bufferData(gl.ARRAY_BUFFER, seed, gl.STATIC_DRAW);
    bufRef.current.seed = sb;
    progRef.current.sl = getAttribs(gl, progRef.current.p, ['aSeed']);

    // Quad geometry
    const qb = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, qb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    bufRef.current.quad = qb;
    progRef.current.hl = getAttribs(gl, progRef.current.h, ['p']);
    progRef.current.bl = getAttribs(gl, progRef.current.b, ['p']);
    progRef.current.cl = getAttribs(gl, progRef.current.c, ['p']);

    // Lattice geometry
    const NN = 72;
    const nd: number[] = [];
    for (let i = 0; i < NN; i++) {
      const y = 1 - 2 * (i + 0.5) / NN;
      const radius = Math.sqrt(1 - y * y);
      const angle = i * Math.PI * (3 - Math.sqrt(5));
      nd.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    }
    const lv: number[] = [];
    let eid = 0;
    for (let i = 0; i < NN; i++) for (let j = i + 1; j < NN; j++) {
      const a = [nd[i*3], nd[i*3+1], nd[i*3+2]];
      const b = [nd[j*3], nd[j*3+1], nd[j*3+2]];
      const dist = Math.hypot(a[0]-b[0], a[1]-b[1], a[2]-b[2]);
      if (dist < 0.56) {
        eid++; const id = eid * 0.137, SG = 10;
        const om = Math.acos(Math.max(-1, Math.min(1, a[0]*b[0]+a[1]*b[1]+a[2]*b[2])));
        for (let q = 0; q < SG; q++) for (const u of [q/SG, (q+1)/SG]) {
          const A1 = Math.sin((1-u)*om)/Math.sin(om), B1 = Math.sin(u*om)/Math.sin(om);
          lv.push(A1*a[0]+B1*b[0], A1*a[1]+B1*b[1], A1*a[2]+B1*b[2], u, id);
        }
      }
    }
    const lines = new Float32Array(lv);
    const lcount = lines.length / 5;
    const npts = new Float32Array(NN * 5);
    for (let i = 0; i < NN; i++) {
      const base = i * 3;
      npts.set([nd[base], nd[base + 1], nd[base + 2], 0.5, i * 0.31 + 0.05], i * 5);
    }
    const lb = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, lb);
    gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STATIC_DRAW);
    bufRef.current.lines = lb;
    const nb2 = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, nb2);
    gl.bufferData(gl.ARRAY_BUFFER, npts, gl.STATIC_DRAW);
    bufRef.current.nodes = nb2;
    progRef.current.ld = getAttribs(gl, progRef.current.l, ['aD', 'aS']);

    // Trail buffer
    const TB = 48;
    const tb = gl.createBuffer()!;
    bufRef.current.trail = tb;
    progRef.current.tl = getAttribs(gl, progRef.current.t, ['aP', 'aA']);

    resize();
    window.addEventListener('resize', resize);

    // Pointer events
    const toNdc = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height * 2 - 1)];
    };
    let down = false;
    let pressStart = 0;
    let tapCount = 0;
    let tapTimer: number | null = null;
    const pts = new Map<number, number[]>();
    let pinchD0 = 1, wasPinch = false;
    let hold = 0;

    const triggerTap = (n: number) => {
      if (n === 1) pulse();
      else if (n === 2) window.dispatchEvent(new CustomEvent('orb:double'));
      else if (n >= 3) window.dispatchEvent(new CustomEvent('orb:triple'));
    };

    cv.addEventListener('pointerdown', (e) => {
      down = true; hold = 0; pressStart = performance.now();
      const p = toNdc(e); pts.set(e.pointerId, p);
      if (pts.size === 2) {
        const a = [...pts.values()];
        pinchD0 = Math.hypot(a[0][0]-a[1][0], a[0][1]-a[1][1]) || 1;
        wasPinch = true; tapCount = 0; if (tapTimer) clearTimeout(tapTimer);
      }
      if (pts.size === 1) { ensureAudio(); chime(chord()[Math.max(0,Math.min(3,Math.floor((p[0]+1)/2*4)))]*(p[1]>0?4:2), .65); impact(p[0], p[1], .8); }
    });

    cv.addEventListener('pointerup', (e) => {
      const held = (performance.now() - pressStart) / 1000;
      const wasP = wasPinch;
      pts.delete(e.pointerId); if (pts.size < 2) wasPinch = false;
      if (wasP && pts.size === 1) { impact(0,0,1.2); pulse=1; glitch=1; chime(chord()[3]*4,1); }
      if (down && held > 0.65 && pts.size === 0) { clearTimeout(tapTimer!); tapCount = 0; window.dispatchEvent(new CustomEvent('orb:longpress')); }
      else if (down) { tapCount++; clearTimeout(tapTimer!); tapTimer = window.setTimeout(() => { triggerTap(tapCount); tapCount = 0 }, 430); }
      if (down && held > 0.3) { wtRef.current = 0; waRef.current = .7; hitRef.current = [0,0,1]; pulse=1; glitch=.6; }
      down = false; hold = 0;
    });

    cv.addEventListener('pointercancel', (e) => { pts.delete(e.pointerId); if (pts.size < 2) wasPinch = false; down = false; hold = 0; clearTimeout(tapTimer!); tapCount = 0; });
    cv.addEventListener('pointermove', (e) => {
      const p = toNdc(e);
      if (pts.has(e.pointerId)) pts.set(e.pointerId, p);
      pointer.x = p[0]; pointer.y = p[1];
      if (down) { hold += 1/60; }
    });

    requestAnimationFrame(renderLoop);
  };

  const chord = () => m.ch || MODES.filter(x => x.c && !x.chakra && !x.gold)[flowIRef.current]?.ch || [146.83,220,293.66,369.99];

  const pulse = () => { shockRef.current = 1; pulseRef.current = 1; };

  const glitch = 0; // placeholder

  const impact = (x: number, y: number, amp: number) => {
    const Rv = 0.58;
    const asp = canvasRef.current!.width / canvasRef.current!.height;
    const sc = Math.min(0.95, asp * 0.8);
    const hx = x * asp / sc / Rv;
    const hy = y / sc / Rv;
    const l = hx*hx + hy*hy;
    hitRef.current = l > 1 ? [hx/Math.sqrt(l), hy/Math.sqrt(l), 0] : [hx, hy, Math.sqrt(1-l)];
    wtRef.current = 0; waRef.current = amp; if (amp > 0.9) pulse();
  };

  const ensureAudio = () => {
    const A = audioRef.current;
    if (A.ctx) { A.ctx.resume && A.ctx.resume(); return; }
    const C = window.AudioContext || (window as any).webkitAudioContext;
    if (!C) return;
    const ctx = A.ctx = new C();
    const master = A.master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    A.an = ctx.createAnalyser(); A.an.fftSize = 256; master.connect(A.an);
    const bus = ctx.createGain(); bus.connect(master);
    const f = A.f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400; f.Q.value = 0.6;
    const dg = ctx.createGain(); dg.gain.value = 0.1; f.connect(dg); dg.connect(bus);
    for (let i = 0; i < 4; i++) for (const dt of [-5, 5]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = i < 2 ? 'sine' : 'triangle'; o.detune.value = dt; g.gain.value = 0.2;
      o.connect(g); g.connect(f); o.start(); A.osc.push([o, i]);
    }
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource(); ns.buffer = nb; ns.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.7;
    const ng = A.ng = ctx.createGain(); ng.gain.value = 0; ns.connect(bp); bp.connect(ng); ng.connect(bus); ns.start();
    const co = A.co = ctx.createOscillator(), cg = A.cg = ctx.createGain(); co.type = 'triangle'; cg.gain.value = 0; co.connect(cg); cg.connect(bus); co.start();
    const ho = A.ho = ctx.createOscillator(), hg = A.hg = ctx.createGain(); ho.type = 'sine'; ho.frequency.value = 55; hg.gain.value = 0; ho.connect(hg); hg.connect(bus); ho.start();
    A.bL = ctx.createOscillator(); A.bR = ctx.createOscillator(); A.bL.type = 'sine'; A.bR.type = 'sine'; A.bL.frequency.value = 110; A.bR.frequency.value = 116;
    const bg2 = ctx.createGain(); bg2.gain.value = 0.045;
    if (ctx.createStereoPanner) {
      const pl = ctx.createStereoPanner(); pl.pan.value = -1; A.bL.connect(pl); pl.connect(bg2);
      const pr = ctx.createStereoPanner(); pr.pan.value = 1; A.bR.connect(pr); pr.connect(bg2);
    } else { A.bL.connect(bg2); A.bR.connect(bg2); }
    bg2.connect(master); A.bL.start(); A.bR.start();
    tune(chord());
    A.on = true;
    master.gain.setTargetAtTime(0.8, ctx.currentTime, 0.4);
  };

  const tune = (ch: number[], tc = 1.2) => {
    const A = audioRef.current;
    if (!A.ctx || !ch) return;
    A.osc.forEach(([o, i]) => o.frequency.setTargetAtTime(ch[i], A.ctx.currentTime, tc));
  };

  const chime = (f: number, v: number) => {
    const A = audioRef.current;
    if (!A.ctx || !A.on) return;
    const c = A.ctx, t0 = c.currentTime;
    [[1,1,3.6],[2.76,.45,2.2],[5.4,.22,1.3],[8.93,.1,.8]].forEach(([r,g,d]) => {
      const o = c.createOscillator(), e = c.createGain(); o.type = 'sine'; o.frequency.value = f * r;
      e.gain.setValueAtTime(0, t0); e.gain.linearRampToValueAtTime(0.16 * g * v, t0 + 0.01); e.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(e); e.connect(A.bus); o.start(t0); o.stop(t0 + d + 0.1);
    });
  };

  const sweep = () => {
    const A = audioRef.current;
    if (!A.ctx || !A.on) return;
    const c = A.ctx, t0 = c.currentTime;
    chord().forEach((f, i) => {
      const o = c.createOscillator(), e = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f * 0.5, t0);
      o.frequency.exponentialRampToValueAtTime(f * 2, t0 + 1.1 + i * 0.14); e.gain.setValueAtTime(0, t0);
      e.gain.linearRampToValueAtTime(0.09, t0 + 0.15 + i * 0.1); e.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.4 + i * 0.15);
      o.connect(e); e.connect(A.bus); o.start(t0); o.stop(t0 + 2.8);
    });
    chime(chord()[0] * 4, 0.9);
  };

  const renderLoop = (now: number) => {
    const gl = glRef.current!;
    const cv = canvasRef.current!;
    if (!cv || !gl) return;

    const dt = Math.max(0, Math.min((now - lastRef.current) / 1000, 0.1));
    lastRef.current = now;
    timeRef.current += dt;

    const slow = 0.02; // simplified
    const spd = m.sp;
    timeRef.current += dt * spd;
    wtRef.current += dt;

    // Smooth charge
    chargeSmoothRef.current += (charge - chargeSmoothRef.current) * Math.min(1, dt * 10);
    shockRef.current = Math.max(0, shockRef.current - dt * 1.3);
    pulseRef.current = Math.max(0, pulseRef.current - dt * 0.7);

    // Palette interpolation
    const pal = m.rgb ? m.rgb.map(c => c.slice()) : MODES.filter(x => x.c && !x.chakra && !x.gold)[flowIRef.current]?.rgb.map(c => c.slice()) || MODES[13].rgb!.map(c => c.slice());
    const kc = Math.min(dt * 2.2, 1);

    // Breath phase
    const cyc = m.b.reduce((a,b) => a+b, 0);
    const tc = timeRef.current % cyc;
    let acc = 0, ph = 0;
    while (ph < 3 && tc >= acc + m.b[ph]) { acc += m.b[ph]; ph++; }
    while (m.b[ph] === 0 && ph < 3) ph++;
    const pd = m.b[ph], pt = Math.min(tc - acc, pd), p = pd ? pt / pd : 0;
    const bt = ph === 0 ? p * p * p * (p * (p * 6 - 15) + 10) : ph === 1 ? 1 : ph === 2 ? 1 - p * p * p * (p * (p * 6 - 15) + 10) : 0;
    const B = bt; // simplified

    // Audio
    let aud = 0;
    const A = audioRef.current;
    if (A.ctx && A.on) {
      const t = A.ctx.currentTime;
      A.co.frequency.setTargetAtTime(chord()[0] * 2 * (1 + chargeSmoothRef.current * 1.2), t, 0.05);
      A.cg.gain.setTargetAtTime(chargeSmoothRef.current * 0.05, t, 0.05);
      A.hg.gain.setTargetAtTime(0, t, 0.12);
      A.f.frequency.setTargetAtTime(260 + B * 1800, t, 0.2);
      A.dg.gain.setTargetAtTime(0.09 + B * 0.09, t, 0.2);
      A.ng.gain.setTargetAtTime(0.004 + B * 0.035, t, 0.3);
      A.an.getByteTimeDomainData(A.buf);
      let s = 0; for (let i = 0; i < 256; i++) { const v = (A.buf[i] - 128) / 128; s += v * v; }
      aud = Math.min(Math.sqrt(s / 256) * 5, 1);
    }

    // Visual uniforms
    const ad = Math.min(1, aud);
    const Rr = (0.52 + 0.105 * B + pulseRef.current * pulseRef.current * 0.04 + ad * 0.03) * (1 - chargeSmoothRef.current * 0.12);
    const asp = cv.width / cv.height;
    const sc = Math.min(0.95, asp * 0.8);

    // Halo uniforms
    gl.useProgram(progRef.current.h);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufRef.current.quad);
    gl.enableVertexAttribArray(progRef.current.hl.p);
    gl.vertexAttribPointer(progRef.current.hl.p, 2, gl.FLOAT, false, 0, 0);
    const hu = progRef.current.hu;
    gl.uniform2f(hu.uRes, cv.width, cv.height);
    gl.uniform1f(hu.uS, sc); gl.uniform1f(hu.uB, B); gl.uniform1f(hu.uPulse, pulseRef.current * pulseRef.current); gl.uniform1f(hu.uAud, ad);
    gl.uniform1f(hu.uT, timeRef.current); gl.uniform1f(hu.uR, Rr); gl.uniform1f(hu.uCh, chargeSmoothRef.current); gl.uniform1f(hu.uHue, hueRef.current); gl.uniform1f(hu.uSpec, specRef.current); gl.uniform1f(hu.uRing, Math.min(1, ringTRef.current / 2.5));
    gl.uniform2f(hu.uM, 0, 0); // tilt not implemented
    gl.uniform3fv(hu.uC0, pal[0]); gl.uniform3fv(hu.uC1, pal[1]); gl.uniform3fv(hu.uC2, pal[2]); gl.uniform3fv(hu.uC3, pal[3]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disableVertexAttribArray(progRef.current.hl.p);

    // Particles
    gl.useProgram(progRef.current.p);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufRef.current.seed);
    gl.enableVertexAttribArray(progRef.current.sl.aSeed);
    gl.vertexAttribPointer(progRef.current.sl.aSeed, 4, gl.FLOAT, false, 0, 0);
    const pu = progRef.current.pu;
    gl.uniform1f(pu.uIn, 1); gl.uniform1f(pu.uGold, goldRef.current); gl.uniform1f(pu.uHue, hueRef.current); gl.uniform1f(pu.uSpec, specRef.current); gl.uniform1f(pu.uCh, chargeSmoothRef.current); gl.uniform1f(pu.uScan, scanRef.current); gl.uniform1f(pu.uSq, sqSRef.current); gl.uniform1f(pu.uGal, galRef.current); gl.uniform1f(pu.uFw, fwRef.current); gl.uniform1f(pu.uMT, mtSRef.current);
    gl.uniform2f(pu.uT1, 0, 0); gl.uniform2f(pu.uT2, 0, 0); gl.uniform2f(pu.uG, 0, -1); gl.uniform1f(pu.uT, timeRef.current); gl.uniform1f(pu.uAsp, asp); gl.uniform1f(pu.uPulse, pulseRef.current * pulseRef.current); gl.uniform1f(pu.uS, sc); gl.uniform1f(pu.uB, B); gl.uniform1f(pu.uAud, ad);
    gl.uniform1f(pu.uPS, 0); gl.uniform1f(pu.uWT, wtRef.current); gl.uniform1f(pu.uWA, waRef.current); gl.uniform2f(pu.uM, 0, 0); gl.uniform2f(pu.uPtr, pointer.x, pointer.y);
    gl.uniform3fv(pu.uHit, hitRef.current);
    gl.uniform3fv(pu.uC0, pal[0]); gl.uniform3fv(pu.uC1, pal[1]); gl.uniform3fv(pu.uC2, pal[2]); gl.uniform3fv(pu.uC3, pal[3]);
    const px = (1.2 * cv.height / 1080) * Math.max(0.8, Math.sqrt(countRef.current / countRef.current));
    gl.uniform1f(pu.uPx, px); gl.uniform1f(pu.uBloom, 0); gl.drawArrays(gl.POINTS, 0, countRef.current);
    gl.disableVertexAttribArray(progRef.current.sl.aSeed);

    // Lattice
    gl.useProgram(progRef.current.l);
    const lu = progRef.current.lu;
    gl.uniform1f(lu.uT, timeRef.current); gl.uniform1f(lu.uAsp, asp); gl.uniform1f(lu.uS, sc); gl.uniform1f(lu.uB, B); gl.uniform1f(lu.uPulse, pulseRef.current * pulseRef.current); gl.uniform1f(lu.uAud, ad);
    gl.uniform1f(lu.uIn, 1); gl.uniform1f(lu.uWT, wtRef.current); gl.uniform1f(lu.uWA, waRef.current); gl.uniform1f(lu.uCh, chargeSmoothRef.current); gl.uniform1f(lu.uScan, scanRef.current); gl.uniform1f(lu.uHue, hueRef.current); gl.uniform1f(lu.uSpec, specRef.current); gl.uniform1f(lu.uGal, galRef.current); gl.uniform1f(lu.uFw, fwRef.current); gl.uniform1f(lu.uSq, sqSRef.current); gl.uniform1f(lu.uMT, mtSRef.current); gl.uniform1f(lu.uPx, px); gl.uniform1f(lu.uPS, 0);
    gl.uniform2f(lu.uT1, 0, 0); gl.uniform2f(lu.uT2, 0, 0); gl.uniform2f(lu.uM, 0, 0); gl.uniform2f(lu.uPtr, pointer.x, pointer.y); gl.uniform3fv(lu.uHit, hitRef.current); gl.uniform3fv(lu.uC1, pal[1]); gl.uniform3fv(lu.uC3, pal[3]);
    for (const [buf, cnt, mode] of [[bufRef.current.lines, lines.length / 5, gl.LINES], [bufRef.current.nodes, 72, gl.POINTS]] as const) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(progRef.current.ld.aD); gl.enableVertexAttribArray(progRef.current.ld.aS);
      gl.vertexAttribPointer(progRef.current.ld.aD, 3, gl.FLOAT, false, 20, 0); gl.vertexAttribPointer(progRef.current.ld.aS, 2, gl.FLOAT, false, 20, 12);
      gl.uniform1f(lu.uPts, mode === gl.POINTS ? 1 : 0); gl.drawArrays(mode, 0, cnt);
      gl.disableVertexAttribArray(progRef.current.ld.aD); gl.disableVertexAttribArray(progRef.current.ld.aS);
    }

    // Post: blur -> composite
    gl.disable(gl.BLEND);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufRef.current.quad);
    const quad = (P: WebGLProgram, src: string, dst: string | null, setup: () => void) => {
      gl.useProgram(P);
      const l = gl.getAttribLocation(P, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? fbRef.current[dst] : null);
      gl.viewport(0, 0, dst ? (dst === 'a' || dst === 'b' ? cv.width >> 2 : cv.width) : cv.width, dst ? (dst === 'a' || dst === 'b' ? cv.height >> 2 : cv.height) : cv.height);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texRef.current[src]); setup(); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.disableVertexAttribArray(l);
    };
    const blur = (src: string, dst: string, dx: number, dy: number) => quad(progRef.current.b, src, dst, () => { gl.uniform1i(progRef.current.bu.uTex, 0); gl.uniform2f(progRef.current.bu.uDir, dx * 1.6 / (dst === 'a' ? cv.width >> 2 : cv.width), dy * 1.6 / (dst === 'a' ? cv.height >> 2 : cv.height)); });
    blur('s', 'a', 1, 0); blur('a', 'b', 0, 1); blur('b', 'a', 1.8, 0); blur('a', 'b', 0, 1.8);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texRef.current.b); gl.activeTexture(gl.TEXTURE0);
    quad(progRef.current.c, 's', null, () => { gl.uniform1i(progRef.current.cu.uS, 0); gl.uniform1i(progRef.current.cu.uBl, 1); gl.uniform1f(progRef.current.cu.uT, timeRef.current); gl.uniform1f(progRef.current.cu.uAud, ad); gl.uniform1f(progRef.current.cu.uBloomK, 0.62); gl.uniform1f(progRef.current.cu.uGl, 0); });

    animRef.current = requestAnimationFrame(renderLoop);
  };

  useEffect(() => {
    if (canvasRef.current && !glRef.current) {
      initGL();
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Sync pulseKey
  useEffect(() => {
    pulse();
  }, [pulseKey]);

  // Sync charge
  useEffect(() => {
    chargeSmoothRef.current = charge;
  }, [charge]);

  // Sync pointer
  useEffect(() => {
    // pointer is passed by reference, just use it
  }, [pointer.x, pointer.y]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />;
}