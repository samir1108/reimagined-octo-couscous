precision highp float;uniform vec2 uRes,uM;uniform float uS,uB,uPulse,uAud,uT,uR,uCh,uHue,uSpec,uRing;uniform vec3 uC0,uC1,uC2,uC3;
#include "noise.glsl"
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
}