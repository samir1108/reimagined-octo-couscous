precision mediump float;uniform sampler2D uTex;uniform vec2 uDir;varying vec2 vUv;
void main(){vec4 s=texture2D(uTex,vUv)*.227027;
 s+=(texture2D(uTex,vUv+uDir*1.3846)+texture2D(uTex,vUv-uDir*1.3846))*.316216;
 s+=(texture2D(uTex,vUv+uDir*3.2308)+texture2D(uTex,vUv-uDir*3.2308))*.070270;
 gl_FragColor=s;}