import{K as d}from"./knowledgeEssays-Xzv6TwPZ.js";import{L as l,a as h}from"./loops-BUmV0r3O.js";import{l as p}from"./seoUtils-DDoR2aY3.js";function o(e){return e.map(t=>`- ${t}`).join(`
`)}function g(e){const t=h[e.category];return`> **${e.id} · ${(t==null?void 0:t.emoji)??""} ${(t==null?void 0:t.label)??e.category}** — ${e.description}

## What this loop actually is

${e.description}. It is one of the ${l.length}+ behavioral loops mapped inside the HOPE engine, sitting in the **${(t==null?void 0:t.label)??e.category}** family — *${(t==null?void 0:t.description)??""}*.

You are not the loop. You are the awareness that can see it. But until you see it, the loop runs you.

## How it shows up in daily life

${o(e.manifestations)}

## What sets it off

${o(e.triggers)}

## Awareness markers — how to catch yourself inside it

${o(e.awareness_markers)}

## The dissolution path

**${e.dissolution_path}.**

This is the small, concrete move that begins to interrupt the loop. Not a fix. Not a cure. An interruption. Do it once and notice. Do it daily and the loop loses its grip.

## Where it lives in the body and the system

- **Dimension:** ${e.related_dimension}
- **Chakra resonance:** ${e.related_chakra.replace(/_/g," ")}
- **Default intensity:** ${e.severity_default}
- **Sub-pattern:** ${e.subcategory}

## Why we built a library for this

Most people think they have *problems*. They don't. They have **unmet loops** — 1 to 3 patterns running for years, generating what looks like a problem. Name the loop precisely and the problem starts to dissolve. That is the whole thesis behind the [Loop Library](/loops) and the engine that powers HOPE.

— HOPE Loop Atlas`}function r(){const e="2025-01-01T00:00:00.000Z";return l.map(t=>{const n=h[t.category],u=`loop-${p(t)}`,c=g(t);return{slug:u,title:`${t.name} — ${t.id} · The Loop Atlas`,keyword:t.keywords.join(", "),pillar:`Loops · ${(n==null?void 0:n.label)??t.category}`,metaDescription:`${t.description}. Triggers, manifestations, awareness markers, and the dissolution path for the ${t.name} loop (${t.id}).`,content:c,publishedAt:e}})}let i=null,s=null;function a(){return d.map(e=>({slug:e.slug,title:e.title,keyword:e.keywords,pillar:e.categoryLabel,metaDescription:e.metaDescription,content:e.content,publishedAt:e.publishedAt,subtitle:e.subtitle,citations:e.citations,practiceLinks:e.practiceLinks,isKnowledgeEssay:!0}))}async function b(){return i||s||(s=fetch("/blog-posts.json",{cache:"force-cache"}).then(e=>e.json()).then(e=>{const t=[...a(),...e,...r()];return i=t,s=null,t}).catch(e=>(s=null,console.warn("Failed to load blog posts",e),i=[...a(),...r()],i)),s)}export{b as l};
