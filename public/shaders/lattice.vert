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
}