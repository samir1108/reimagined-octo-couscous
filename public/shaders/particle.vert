precision highp float;attribute vec4 aSeed;
uniform float uT,uAsp,uPulse,uPx,uS,uB,uPS,uWT,uWA,uBloom,uAud,uIn,uCh,uScan,uHue,uSpec,uGold,uSq,uGal,uFw,uMT;uniform vec2 uM,uPtr,uG,uT1,uT2;uniform vec3 uHit,uC0,uC1,uC2,uC3;varying vec3 vC;
#include "noise.glsl"
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
}