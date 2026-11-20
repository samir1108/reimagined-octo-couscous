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
}