precision mediump float;varying vec3 vC;
void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.02,d)*.82+smoothstep(.13,0.,d)*.55;vec3 c=vC*a;gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}