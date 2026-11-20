import { chromium } from "playwright";
const browser = await chromium.launch({channel:"chrome",headless:true,args:["--use-gl=angle","--enable-unsafe-swiftshader"]});
const page = await browser.newPage({viewport:{width:420,height:820},deviceScaleFactor:1});
await page.goto("http://localhost:8081/app?debughome=1",{waitUntil:"domcontentloaded",timeout:90000});
await page.waitForTimeout(15000);
const r = await page.evaluate(()=>{
  const canvases = Array.from(document.querySelectorAll("canvas"));
  const frames = Array.from(document.querySelectorAll("div")).filter(d=>getComputedStyle(d).borderRadius==="50%" && getComputedStyle(d).borderTopWidth!=="0px");
  return {canvasCount:canvases.length, frameCount:frames.length,
    canvases: canvases.map(c=>{const r=c.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),cx:Math.round(r.x+r.width/2),cy:Math.round(r.y+r.height/2)};}),
    frames: frames.map(f=>{const r=f.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),cx:Math.round(r.x+r.width/2),cy:Math.round(r.y+r.height/2)};}).slice(0,5)
  };
});
console.log(JSON.stringify(r));
await page.screenshot({path:"C:/Users/SAMIR/AppData/Local/Temp/kilo/home-debug.png"});
await browser.close();
