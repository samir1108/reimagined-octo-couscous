import{r,j as e}from"./index-BaK7kk1c.js";function f({className:t}){return e.jsxs("div",{className:`absolute inset-0 overflow-hidden ${t||""}`,children:[e.jsx("div",{className:"absolute inset-0",style:{background:"radial-gradient(ellipse at 30% 20%, hsl(var(--primary) / 0.18) 0%, transparent 55%), radial-gradient(ellipse at 70% 60%, hsl(var(--accent) / 0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, hsl(var(--secondary) / 0.10) 0%, transparent 55%), linear-gradient(to bottom, hsl(var(--background) / 0.9), hsl(var(--background) / 0.95))"}}),e.jsx("div",{className:"absolute left-1/4 top-1/3 w-[40vmin] h-[40vmin] rounded-full opacity-40",style:{background:"radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)",filter:"blur(40px)",animation:"safe-video-float-1 12s ease-in-out infinite"}}),e.jsx("div",{className:"absolute right-1/4 bottom-1/3 w-[35vmin] h-[35vmin] rounded-full opacity-35",style:{background:"radial-gradient(circle, hsl(var(--accent) / 0.22) 0%, transparent 70%)",filter:"blur(50px)",animation:"safe-video-float-2 15s ease-in-out infinite"}}),e.jsx("div",{className:"absolute left-1/2 top-1/2 w-[25vmin] h-[25vmin] rounded-full opacity-30",style:{background:"radial-gradient(circle, hsl(var(--secondary) / 0.20) 0%, transparent 70%)",filter:"blur(35px)",animation:"safe-video-float-3 10s ease-in-out infinite"}}),e.jsx("div",{className:"absolute inset-0 opacity-60",children:Array.from({length:20}).map((n,a)=>e.jsx("span",{className:"absolute rounded-full bg-foreground/40",style:{top:`${a*47%100}%`,left:`${a*73%100}%`,width:a%3+1,height:a%3+1,animation:`safe-video-twinkle ${2+a%5}s ${a*.2}s ease-in-out infinite`}},a))}),e.jsx("style",{children:`
        @keyframes safe-video-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(3vw, -2vh) scale(1.08); }
          66% { transform: translate(-2vw, 1.5vh) scale(0.94); }
        }
        @keyframes safe-video-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-2.5vw, 2vh) scale(1.06); }
          66% { transform: translate(2vw, -1.5vh) scale(0.95); }
        }
        @keyframes safe-video-float-3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }
        @keyframes safe-video-twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.6); }
        }
      `})]})}const v=({src:t,poster:n,fallback:a,className:i,...d})=>{const[o,c]=r.useState(!1),[l,s]=r.useState(!1);return r.useEffect(()=>{c(!1),s(!1)},[t]),o||!t?e.jsx(e.Fragment,{children:a||e.jsx(f,{className:i})}):e.jsxs(e.Fragment,{children:[e.jsx("video",{poster:n,src:t,autoPlay:!0,muted:!0,loop:!0,playsInline:!0,preload:"metadata",onError:()=>c(!0),onCanPlay:()=>s(!0),className:`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${l?"opacity-80":"opacity-0"} ${i||""}`,...d}),!l&&!o&&e.jsx("div",{className:"absolute inset-0 bg-background/40",children:e.jsx(f,{})})]})},b=({src:t,poster:n,className:a,...i})=>{const d=r.useRef(null),[o,c]=r.useState(!1);return r.useEffect(()=>{const l=d.current;if(!l)return;const s=new IntersectionObserver(u=>{for(const m of u)if(m.isIntersecting){c(!0),s.disconnect();break}},{rootMargin:"200px"});return s.observe(l),()=>s.disconnect()},[]),o?e.jsx(v,{src:t,poster:n,className:a,...i}):e.jsx("div",{className:`${a||""}`,children:e.jsx("img",{src:n,alt:"",className:"w-full h-full object-cover",loading:"lazy"})})};export{b as L,v as S};
