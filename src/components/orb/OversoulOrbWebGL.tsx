"use client";

import { useEffect, useRef, useState } from "react";

interface OversoulOrbWebGLProps {
  className?: string;
  onActivate?: () => void;
  onHold?: () => void;
  onDouble?: () => void;
  onTriple?: () => void;
}

export default function OversoulOrbWebGL({
  className = "",
  onActivate,
  onHold,
  onDouble,
  onTriple,
}: OversoulOrbWebGLProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: true,
      premultipliedAlpha: true,
    });

    if (!gl) {
      setWebglSupported(false);
      setError("WebGL isn't available in this browser.");
      return;
    }

    setWebglSupported(true);

    const NOISE = `
float h(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<3;i++){s+=a*n3(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}
float rg(vec3 x){return pow(1.-abs(2.*n3(x)-1.),8.);}
vec3 hue(vec3 c,float a){vec3 k=vec3(.57735);float ca=cos(a),sa=sin(a);return c*ca+cross(k,c)*sa+k*dot(k,c)*(1.-ca);}
`;

    const PVS = `
precision highp float;attribute vec4 aSeed;
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

    const PFS = `
precision mediump float;varying vec3 vC;
void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.02,d)*.82+smoothstep(.13,0.,d)*.55;vec3 c=vC*a;gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}
`;

    const HVS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

    const HFS = `
precision highp float;uniform vec2 uRes,uM;uniform float uS,uB,uPulse,uAud,uT,uR,uCh,uHue,uSpec,uRing;uniform vec3 uC0,uC1,uC2,uC3;
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

    const LVS = `
precision highp float;attribute vec3 aD;attribute vec2 aS;
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

    const LFS = `
precision mediump float;uniform float uPts;varying vec3 vC,vP;varying float vS,vPh;
void main(){vec3 c;
 if(uPts>.5){float d=length(gl_PointCoord-.5);c=(vC*3.+vec3(.3))*smoothstep(.5,0.,d);}
 else{float pk=exp(-pow((vS-vPh)*9.,2.));c=vC+vP*pk*.9;}
 gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}
`;

    const QVS = `attribute vec2 p;varying vec2 vUv;void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;

    const BFS = `
precision mediump float;uniform sampler2D uTex;uniform vec2 uDir;varying vec2 vUv;
void main(){vec4 s=texture2D(uTex,vUv)*.227027;
 s+=(texture2D(uTex,vUv+uDir*1.3846)+texture2D(uTex,vUv-uDir*1.3846))*.316216;
 s+=(texture2D(uTex,vUv+uDir*3.2308)+texture2D(uTex,vUv-uDir*3.2308))*.070270;
 gl_FragColor=s;}`;

    const CFS = `
precision highp float;uniform sampler2D uS,uBl;uniform float uT,uAud,uBloomK,uGl;varying vec2 vUv;
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

    const TFS = `
precision mediump float;varying float vA;uniform vec3 uC;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,d)*vA;vec3 c=uC*1.6*a;gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}`;

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
    let mode = DEF;
    let flowI = 0;
    let clock = 0;
    let pulse = 0;
    let wt = 99;
    let wa = 1;
    const hit = [0, 0, 1];
    let asp = 1;
    let sc = .9;
    let aud = 0;

    const chord = () => MODES[mode].ch || FL[flowI].ch;

    const A = { ctx: null as AudioContext | null, on: false, touched: false, osc: [] as any[], an: null as AnalyserNode | null, buf: null as Uint8Array | null, fbuf: null as Uint8Array | null, master: null as GainNode | null, bus: null as GainNode | null, f: null as BiquadFilterNode | null, dg: null as GainNode | null, ng: null as GainNode | null, co: null as OscillatorNode | null, cg: null as GainNode | null, ho: null as OscillatorNode | null, hg: null as GainNode | null, bL: null as OscillatorNode | null, bR: null as OscillatorNode | null, beatP: 0, refr: 0, prev: 0, stream: null as MediaStream | null };

    function tune(ch: number[] | null | undefined, tc?: number) {
      if (!A.ctx || !ch) return;
      A.osc.forEach(([o, i]) => o.frequency.setTargetAtTime(ch[i], A.ctx!.currentTime, tc || 1.2));
      if (A.bL) {
        const BEATS: Record<string, number> = { Sleep: 2.5, Focus: 6, Calm: 4, Heal: 8, Awaken: 14, Aurora: 6, Ember: 10, Vaikuntha: 3, Flow: 6 };
        const b = BEATS[MODES[mode].n] || 6;
        const base = MODES[mode].n === 'Sleep' ? 82 : 110;
        A.bL.frequency.setTargetAtTime(base, A.ctx.currentTime, 1.5);
        A.bR.frequency.setTargetAtTime(base + b, A.ctx.currentTime, 1.5);
      }
    }

    function initAudio() {
      if (A.ctx) { A.ctx.resume && A.ctx.resume(); return }
      const C = window.AudioContext || (window as any).webkitAudioContext;
      if (!C) return;
      const c = A.ctx = new C();
      const master = A.master = c.createGain();
      master.gain.value = 0;
      master.connect(c.destination);
      const an = A.an = c.createAnalyser();
      an.fftSize = 256;
      A.buf = new Uint8Array(256);
      master.connect(an);
      const len = c.sampleRate * 3;
      const ir = c.createBuffer(2, len, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = ir.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
      }
      const rev = c.createConvolver();
      rev.buffer = ir;
      const rg = c.createGain();
      rg.gain.value = .55;
      rev.connect(rg);
      rg.connect(master);
      const bus = A.bus = c.createGain();
      bus.connect(master);
      bus.connect(rev);
      const f = A.f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 400;
      f.Q.value = .6;
      const dg = A.dg = c.createGain();
      dg.gain.value = .1;
      f.connect(dg);
      dg.connect(bus);
      A.osc = [];
      for (let i = 0; i < 4; i++) for (const dt of [-5, 5]) {
        const o = c.createOscillator(), g = c.createGain();
        o.type = i < 2 ? 'sine' : 'triangle';
        o.detune.value = dt;
        g.gain.value = .2;
        o.connect(g);
        g.connect(f);
        o.start();
        A.osc.push([o, i]);
      }
      const nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
      const nd = nb.getChannelData(0);
      for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      const ns = c.createBufferSource();
      ns.buffer = nb;
      ns.loop = true;
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 900;
      bp.Q.value = .7;
      const ng = A.ng = c.createGain();
      ng.gain.value = 0;
      ns.connect(bp);
      bp.connect(ng);
      ng.connect(bus);
      ns.start();
      const co = A.co = c.createOscillator();
      const cg = A.cg = c.createGain();
      co.type = 'triangle';
      cg.gain.value = 0;
      co.connect(cg);
      cg.connect(bus);
      co.start();
      const ho = c.createOscillator();
      const hg = c.createGain();
      ho.type = 'sine';
      ho.frequency.value = 55;
      hg.gain.value = 0;
      ho.connect(hg);
      hg.connect(bus);
      ho.start();
      A.ho = ho;
      A.hg = hg;
      A.bL = c.createOscillator();
      A.bR = c.createOscillator();
      A.bL.type = 'sine';
      A.bR.type = 'sine';
      A.bL.frequency.value = 110;
      A.bR.frequency.value = 116;
      const bg2 = c.createGain();
      bg2.gain.value = .045;
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
      tune(chord(), .01);
    }

    function setSound(on: boolean) {
      A.on = on;
      if (on) initAudio();
      if (A.ctx) A.master.gain.setTargetAtTime(on ? .8 : 0, A.ctx.currentTime, .4);
    }

    function chime(f: number, v: number) {
      if (!A.ctx || !A.on) return;
      const c = A.ctx, t0 = c.currentTime;
      [[1, 1, 3.6], [2.76, .45, 2.2], [5.4, .22, 1.3], [8.93, .1, .8]].forEach(([r, g, d]) => {
        const o = c.createOscillator(), e = c.createGain();
        o.type = 'sine';
        o.frequency.value = f * r;
        e.gain.setValueAtTime(0, t0);
        e.gain.linearRampToValueAtTime(.16 * g * v, t0 + .01);
        e.gain.exponentialRampToValueAtTime(.0001, t0 + d);
        o.connect(e);
        e.connect(A.bus);
        o.start(t0);
        o.stop(t0 + d + .1);
      });
    }

    function pluck(f: number, v?: number) {
      if (!A.ctx || !A.on) return;
      const c = A.ctx, t0 = c.currentTime;
      const o = c.createOscillator(), e = c.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      e.gain.setValueAtTime(0, t0);
      e.gain.linearRampToValueAtTime(.14 * (v || 1), t0 + .006);
      e.gain.exponentialRampToValueAtTime(.0001, t0 + .5);
      o.connect(e);
      e.connect(A.bus);
      o.start(t0);
      o.stop(t0 + .6);
    }

    function sweep() {
      if (!A.ctx || !A.on) return;
      const c = A.ctx, t0 = c.currentTime;
      chord().forEach((f, i) => {
        const o = c.createOscillator(), e = c.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f * .5, t0);
        o.frequency.exponentialRampToValueAtTime(f * 2, t0 + 1.1 + i * .14);
        e.gain.setValueAtTime(0, t0);
        e.gain.linearRampToValueAtTime(.09, t0 + .15 + i * .1);
        e.gain.exponentialRampToValueAtTime(.0001, t0 + 2.4 + i * .15);
        o.connect(e);
        e.connect(A.bus);
        o.start(t0);
        o.stop(t0 + 2.8);
      });
      chime(chord()[0] * 4, .9);
    }

    const prog = (v: string, f: string) => {
      const P = gl.createProgram();
      for (const [t, s] of [[gl.VERTEX_SHADER, v], [gl.FRAGMENT_SHADER, f]]) {
        const S = gl.createShader(t)!;
        gl.shaderSource(S, s);
        gl.compileShader(S);
        if (!gl.getShaderParameter(S, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(S));
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

    const N = 240000;
    const seed = new Float32Array(N * 4);
    for (let i = 0; i < N; i++) {
      const z = Math.random() * 2 - 1;
      const ph = Math.random() * 6.2831853;
      const s = Math.sqrt(1 - z * z);
      seed.set([s * Math.cos(ph), z, s * Math.sin(ph), Math.random()], i * 4);
    }
    const sb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sb);
    gl.bufferData(gl.ARRAY_BUFFER, seed, gl.STATIC_DRAW);

    const qb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, qb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
    const pu: Record<string, WebGLUniformLocation | null> = {};
    const hu: Record<string, WebGLUniformLocation | null> = {};
    ['uT', 'uAsp', 'uPulse', 'uPx', 'uS', 'uB', 'uPS', 'uWT', 'uWA', 'uBloom', 'uAud', 'uIn', 'uCh', 'uScan', 'uG', 'uHue', 'uSpec', 'uGold', 'uSq', 'uGal', 'uFw', 'uMT', 'uM', 'uPtr', 'uG', 'uT1', 'uT2', 'uHit', 'uC0', 'uC1', 'uC2', 'uC3'].forEach(n => pu[n] = U(PP, n));
    ['uRes', 'uM', 'uS', 'uB', 'uPulse', 'uAud', 'uT', 'uR', 'uCh', 'uHue', 'uSpec', 'uRing', 'uC0', 'uC1', 'uC2', 'uC3'].forEach(n => hu[n] = U(HP, n));
    const bu = { uTex: U(BP, 'uTex'), uDir: U(BP, 'uDir') };
    const cu = { uS: U(CP, 'uS'), uBl: U(CP, 'uBl'), uT: U(CP, 'uT'), uAud: U(CP, 'uAud'), uBloomK: U(CP, 'uBloomK'), uGl: U(CP, 'uGl') };

    const NN = 72;
    const points: { x: number; y: number; z: number }[] = [];
    const nd: number[] = [];
    for (let i = 0; i < NN; i++) {
      const y = 1 - 2 * (i + 0.5) / NN;
      const radius = Math.sqrt(1 - y * y);
      const angle = i * Math.PI * (3 - Math.sqrt(5));
      const x = Math.cos(angle) * radius * 0.91;
      const z = Math.sin(angle) * radius * 0.91;
      points.push({ x, y, z });
      nd.push(x, y, z);
    }
    const lv: number[] = [];
    let eid = 0;
    for (let i = 0; i < NN; i++) for (let j = i + 1; j < NN; j++) {
      const a = points[i];
      const b = points[j];
      if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < .56) {
        eid++;
        const id = eid * .137;
        const SG = 10;
        const om = Math.acos(Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z)));
        for (let q = 0; q < SG; q++) for (const u of [q / SG, (q + 1) / SG]) {
          const A1 = Math.sin((1 - u) * om) / Math.sin(om);
          const B1 = Math.sin(u * om) / Math.sin(om);
          lv.push(A1 * a.x + B1 * b.x, A1 * a.y + B1 * b.y, A1 * a.z + B1 * b.z, u, id);
        }
      }
    }
    const lines = new Float32Array(lv);
    const lcount = lines.length / 5;
    const npts = new Float32Array(NN * 5);
    for (let i = 0; i < NN; i++) {
      const p = points[i];
      npts.set([p.x, p.y, p.z, 0.5, i * 0.31 + 0.05], i * 5);
    }
    const lb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lb);
    gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STATIC_DRAW);
    const nb2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nb2);
    gl.bufferData(gl.ARRAY_BUFFER, npts, gl.STATIC_DRAW);

    const tb = gl.createBuffer();
    const TB = 48;
    const tdata = new Float32Array(TB * 3);
    const tu = { aP: gl.getAttribLocation(TP, 'aP'), aA: gl.getAttribLocation(TP, 'aA'), uAsp: U(TP, 'uAsp'), uS: U(TP, 'uS'), uC: U(TP, 'uC') };
    const lD = gl.getAttribLocation(LP, 'aD');
    const lS = gl.getAttribLocation(LP, 'aS');
    const lu: Record<string, WebGLUniformLocation | null> = {};
    ['uT', 'uAsp', 'uS', 'uB', 'uPulse', 'uAud', 'uIn', 'uWT', 'uWA', 'uCh', 'uScan', 'uPts', 'uPx', 'uPS', 'uHue', 'uSpec', 'uGal', 'uFw', 'uSq', 'uMT', 'uM', 'uPtr', 'uT1', 'uT2', 'uHit', 'uC1', 'uC3'].forEach(n => lu[n] = U(LP, n));

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr0 = Math.min(devicePixelRatio || 1, 2);
    let rs = 2.0;
    const T: Record<string, { t: WebGLTexture; f: WebGLFramebuffer; w: number; h: number }> = {};

    const mkTex = () => {
      const t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
      return t;
    };

    function target(name: string, w: number, h: number) {
      const o = T[name] || (T[name] = { t: mkTex(), f: gl.createFramebuffer()!, w, h });
      o.w = w; o.h = h;
      gl.bindTexture(gl.TEXTURE_2D, o.t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, o.f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, o.t, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    function resize() {
      const k = Math.min(dpr0 * rs, 4096 / Math.max(canvas.clientWidth, canvas.clientHeight, 1));
      const w = Math.floor(canvas.clientWidth * k);
      const h = Math.floor(canvas.clientHeight * k);
      if (w && h && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h);
        const bw = Math.max(2, w >> 2), bh = Math.max(2, h >> 2);
        target('s', w, h);
        target('a', bw, bh);
        target('b', bw, bh);
      }
    }

    new ResizeObserver(resize).observe(canvas);
    resize();

    const toNdc = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height * 2 - 1)];
    };

    let hover = [0, 0];
    const ptr = [0, 0];
    let inside = 0;
    let ps = 0;
    let down = false;
    let lx = 0, ly = 0;
    let ay = 0, ax = 0;
    let vy = 0, vx = 0;
    const pts = new Map<number, number[]>();
    let pinchD0 = 1;
    let wasPinch = false;
    let tapCount = 0;
    let tapTimer: number | null = null;
    let longPress = false;
    let pressStarted = 0;
    const trail: { x: number; y: number; a: number }[] = [];

    const cl = (v: number, m: number) => Math.max(-m, Math.min(m, v));

    const handlePointerMove = (e: PointerEvent) => {
      const p = toNdc(e);
      if (pts.has(e.pointerId)) pts.set(e.pointerId, p);
      hover = p;
      inside = Math.abs(p[0]) < 1.05 && Math.abs(p[1]) < 1.05 ? 1 : 0;
      if (down) {
        vy = cl(vy + (e.clientX - lx) * .012, 7);
        vx = cl(vx + (e.clientY - ly) * .012, 7);
      }
      lx = e.clientX;
      ly = e.clientY;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (activePointerRef.current !== null) return;
      activePointerRef.current = e.pointerId;
      down = true;
      hold = 0;
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
        initAudio();
        chime(chord()[Math.max(0, Math.min(3, Math.floor((p[0] + 1) / 2 * 4)))] * (p[1] > 0 ? 4 : 2), .65);
        pluck(220 + (p[0] + 1) * 220, .5);
        impact(p[0], p[1], .8);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      const held = (performance.now() - pressStarted) / 1000;
      const wasP = wasPinch;
      pts.delete(e.pointerId);
      if (pts.size < 2) wasPinch = false;
      if (wasP && pts.size === 1) {
        impact(0, 0, 1.2);
        pulse = 1;
        glitch = 1;
        chime(chord()[3] * 4, 1);
      }
      if (down && held > .65 && pts.size === 0) {
        longPress = true;
        if (tapTimer) clearTimeout(tapTimer);
        tapCount = 0;
        onHold?.();
      } else if (down) {
        tapCount++;
        if (tapTimer) clearTimeout(tapTimer);
        tapTimer = window.setTimeout(() => {
          if (tapCount >= 2) {
            // soul session - triple tap handled elsewhere
          }
          if (tapCount === 1) onActivate?.();
          else if (tapCount === 2) onDouble?.();
          else if (tapCount >= 3) onTriple?.();
          tapCount = 0;
        }, 430);
      }
      if (down && held > .3) {
        wt = 0; wa = .7; hit[0] = 0; hit[1] = 0; hit[2] = 1; pulse = 1; glitch = .6;
      }
      down = false;
      hold = 0;
    };

    const handlePointerCancel = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      if (pts.size < 2) wasPinch = false;
      down = false;
      hold = 0;
      if (tapTimer) clearTimeout(tapTimer);
      tapCount = 0;
    };

    const impact = (x: number, y: number, amp: number) => {
      const Rv = .58;
      const hx = x * asp / sc / Rv;
      const hy = y / sc / Rv;
      const l = hx * hx + hy * hy;
      hit[0] = l > 1 ? hx / Math.sqrt(l) : hx;
      hit[1] = l > 1 ? hy / Math.sqrt(l) : hy;
      hit[2] = l > 1 ? 0 : Math.sqrt(1 - l);
      wt = 0; wa = amp;
      if (amp > .9) pulse = 1;
    };

    const pal = MODES[mode].rgb.map(c => c.slice());
    const ease = (x: number) => x * x * x * (x * (x * 6. - 15.) + 10.);
    let last = performance.now();
    let time = 0;
    let slow = 0;
    let count = N;
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
    let specC = .03;
    let goldC = 1;
    let mtS = 0;
    let sqS = 0;
    let fw = 0;
    let gal = 0;
    let galT = -1;
    let ringT = 9;
    let drumT = 0;
    let resV = 0;
    let omCool = 0;
    let voice = 0;
    let activePointerRef = { current: null as number | null };

    function frame(now: number) {
      const dt = Math.max(0, Math.min((now - last) / 1000, .1));
      last = now;
      requestAnimationFrame(frame);

      slow = slow * .95 + dt * .05;
      if (slow > .03) {
        if (rs > 1.01) { rs = Math.max(1, rs - .1); resize(); slow = .02; }
        else if (count > 40000) count = Math.floor(count * .92);
      }

      const m = MODES[mode];
      spd += (m.sp - spd) * Math.min(dt * 2, 1);
      time += dt * spd * (still ? .2 : 1);
      clock += dt;
      wt += dt;

      vy *= Math.exp(-dt * 1.1);
      ay += (vy + .1 * spd) * dt;

      vx += ((hover[1] * .35 * inside - ax) * 6 - vx * 2.5) * dt;
      ax += vx * dt;

      ps += (inside - ps) * Math.min(dt * 4, 1);
      asp = canvas.width / canvas.height;
      sc = Math.min(.95, asp * .8);

      const tp = [hover[0] * asp / sc, hover[1] / sc];
      ptr[0] += (tp[0] - ptr[0]) * Math.min(dt * 10, 1);
      ptr[1] += (tp[1] - ptr[1]) * Math.min(dt * 10, 1);

      let mtT = 0, sqT = 0;
      const tA = [0, 0], tB = [0, 0];
      if (pts.size === 2) {
        const a = [...pts.values()];
        const d = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]) || 1;
        tA[0] = a[0][0] * asp / sc; tA[1] = a[0][1] / sc;
        tB[0] = a[1][0] * asp / sc; tB[1] = a[1][1] / sc;
        mtT = 1;
        sqT = Math.max(0, Math.min(1, (pinchD0 - d) / pinchD0 * 1.8));
      }
      mtS += (mtT - mtS) * Math.min(dt * 8, 1);
      sqS += (sqT - sqS) * Math.min(dt * 8, 1);

      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].a -= dt * .75;
        if (trail[i].a <= 0) trail.splice(i, 1);
      }

      pulse = Math.max(0, pulse - dt * .7);

      if (down) {
        hold += dt;
        charge = Math.min(1, Math.max(0, (hold - .25) / 2));
      } else charge = Math.max(0, charge - dt * 1.6);

      glitch = Math.max(0, glitch - dt * 3);

      if (galT >= 0) {
        galT += dt;
        gal = galT < 1 ? galT : galT < 5 ? 1 : galT < 7 ? 1 - (galT - 5) / 2 : 0;
        if (galT >= 7) { gal = 0; galT = -1; }
      }
      fw = Math.max(0, fw - dt * .7);

      if (down && hold > .3) {
        drumT += dt;
        if (drumT > 1.15) { drumT = 0; chime(chord()[Math.floor(hold + .5) % 4] * (hold > 3 ? 4 : 2), Math.min(1, .5 + hold * .1)); pulse = Math.max(pulse, .35); }
      } else drumT = 0;

      scanC += dt;
      { const sp = (scanC % 9) / 2.4; scan = sp < 1 ? -1.2 + 2.4 * sp : 9; }

      if (A.on && A.an) {
        A.an.getByteTimeDomainData(A.buf!);
        let s = 0;
        for (let i = 0; i < 256; i++) { const v = (A.buf![i] - 128) / 128; s += v * v; }
        aud += (Math.min(Math.sqrt(s / 256) * 5, 1) - aud) * Math.min(dt * 10, 1);
      } else aud *= .92;

      const ad = Math.min(1, aud + voice * 1.2);

      const specT = m.rgb ? (m.gold ? .04 : m.chakra ? .14 : .55) : 1;
      specC += (specT - specC) * Math.min(dt * 1.5, 1);
      goldC += ((m.gold ? 1 : 0) - goldC) * Math.min(dt * 2, 1);

      const hT = m.rgb ? Math.sin(time * .3) * .5 * specC : (time * .25) % 6.2831853;
      { const dh = ((hT - hueC + Math.PI) % 6.2831853 + 6.2831853) % 6.2831853 - Math.PI; hueC += dh * Math.min(dt * 2, 1); }

      const pl = pulse * pulse;

      if (!T.s) return;

      intro = Math.min(1, intro + dt / 2.4);
      const inn = 1 - Math.pow(1 - intro, 3);
      const Rr = (.52 + .105 * B + pl * .04 + ad * .03) * inn * (1 - charge * .12);

      gl.bindFramebuffer(gl.FRAMEBUFFER, T.s.f);
      gl.viewport(0, 0, T.s.w, T.s.h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      gl.useProgram(HP);
      gl.bindBuffer(gl.ARRAY_BUFFER, qb);
      const hl = gl.getAttribLocation(HP, 'p');
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

      gl.useProgram(PP);
      gl.bindBuffer(gl.ARRAY_BUFFER, sb);
      const sl = gl.getAttribLocation(PP, 'aSeed');
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
      const px = (1.2 * canvas.height / 1080) * Math.max(.8, Math.sqrt(N / count));
      gl.uniform1f(pu.uPx!, px);
      gl.uniform1f(pu.uBloom!, 0);
      gl.drawArrays(gl.POINTS, 0, count);
      gl.disableVertexAttribArray(sl);

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
      for (const [buf, cnt, mode_, pts_] of [[lb, lcount, gl.LINES, 0], [nb2, NN, gl.POINTS, 1]] as const) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.enableVertexAttribArray(lD);
        gl.enableVertexAttribArray(lS);
        gl.vertexAttribPointer(lD, 3, gl.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(lS, 2, gl.FLOAT, false, 20, 12);
        gl.uniform1f(lu.uPts!, pts_);
        gl.drawArrays(mode_, 0, cnt);
        gl.disableVertexAttribArray(lD);
        gl.disableVertexAttribArray(lS);
      }

      if (trail.length) {
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(TP);
        gl.bindBuffer(gl.ARRAY_BUFFER, tb);
        for (let i = 0; i < trail.length; i++) {
          tdata[i * 3] = trail[i].x;
          tdata[i * 3 + 1] = trail[i].y;
          tdata[i * 3 + 2] = trail[i].a;
        }
        gl.bufferData(gl.ARRAY_BUFFER, tdata, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(tu.aP);
        gl.vertexAttribPointer(tu.aP, 2, gl.FLOAT, false, 12, 0);
        gl.enableVertexAttribArray(tu.aA);
        gl.vertexAttribPointer(tu.aA, 1, gl.FLOAT, false, 12, 8);
        gl.uniform1f(tu.uAsp!, asp);
        gl.uniform1f(tu.uS!, sc);
        gl.uniform3fv(tu.uC!, pal[3]);
        gl.drawArrays(gl.POINTS, 0, trail.length);
        gl.disableVertexAttribArray(tu.aP);
        gl.disableVertexAttribArray(tu.aA);
        gl.disable(gl.BLEND);
      }

      gl.disable(gl.BLEND);
      gl.bindBuffer(gl.ARRAY_BUFFER, qb);

      const quad = (P: WebGLProgram, src: { t: WebGLTexture }, dst: { f: WebGLFramebuffer; w: number; h: number } | null, setup: () => void) => {
        gl.useProgram(P);
        const l = gl.getAttribLocation(P, 'p');
        gl.enableVertexAttribArray(l);
        gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, dst?.f || null);
        gl.viewport(0, 0, dst?.w || canvas.width, dst?.h || canvas.height);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, src.t);
        setup();
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.disableVertexAttribArray(l);
      };

      const blur = (src: { t: WebGLTexture }, dst: { f: WebGLFramebuffer; w: number; h: number }, dx: number, dy: number) =>
        quad(BP, src, dst, () => { gl.uniform1i(bu.uTex!, 0); gl.uniform2f(bu.uDir!, dx * 1.6 / dst.w, dy * 1.6 / dst.h); });

      blur(T.s, T.a, 1, 0);
      blur(T.a, T.b, 0, 1);
      blur(T.b, T.a, 1.8, 0);
      blur(T.a, T.b, 0, 1.8);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, T.b.t);
      gl.activeTexture(gl.TEXTURE0);
      quad(CP, T.s, null, () => {
        gl.uniform1i(cu.uS!, 0);
        gl.uniform1i(cu.uBl!, 1);
        gl.uniform1f(cu.uT!, time);
        gl.uniform1f(cu.uAud!, ad);
        gl.uniform1f(cu.uBloomK!, .62);
        gl.uniform1f(cu.uGl!, glitch);
      });
    }

    requestAnimationFrame(frame);

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerCancel);
    canvas.addEventListener('pointerleave', () => {
      if (down) {
        activePointerRef.current = null;
        down = false;
        hold = 0;
      }
    });

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerCancel);
      if (A.ctx) { A.ctx.close(); A.ctx = null; }
    };
  }, [onActivate, onHold, onDouble, onTriple]);

  if (!webglSupported) {
    return (
      <div className={`relative aspect-square w-full ${className}`} role="img" aria-label={error || "WebGL not supported"}>
        <div className="absolute inset-0 flex items-center justify-center bg-[#080908] rounded-full">
          <div className="text-center p-8">
            <p className="text-[#D6B36A]/80 text-sm font-medium">WebGL Required</p>
            <p className="mt-2 text-[#98958B] text-xs max-w-xs mx-auto">{error}</p>
          </div>
        </div>
        <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full text-[#D6B36A]/30" aria-hidden>
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`aspect-square w-full touch-none select-none ${className}`}
      aria-label="A living orb of particles that breathes, changes color, and reacts to touch like fluid."
      style={{ cursor: 'grab' }}
    />
  );
}