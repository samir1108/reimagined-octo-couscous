precision mediump float;uniform float uPts;varying vec3 vC,vP;varying float vS,vPh;
void main(){vec3 c;
 if(uPts>.5){float d=length(gl_PointCoord-.5);c=(vC*3.+vec3(.3))*smoothstep(.5,0.,d);}
 else{float pk=exp(-pow((vS-vPh)*9.,2.));c=vC+vP*pk*.9;}
 gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}