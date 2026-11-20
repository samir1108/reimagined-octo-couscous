# ConsciousOS Knowledge Graph

## Layers
1. Canonical Knowledge Graph: general concepts, traditions, practices, sources.
2. Personal Knowledge Graph: user-specific observations/experiences with provenance.
3. Intelligence Graph: connects both to suggest next developmental steps.

## Domains
10 domains: consciousness, mind, psychology, yoga, spirituality, neuroscience, body, behaviour, life, transformation.

## Database
Tables: knowledge_domains, knowledge_nodes, knowledge_edges, knowledge_sources, knowledge_claims, user_knowledge_nodes, user_knowledge_edges, user_knowledge_observations.

## Code
- Types: src/types/knowledgeGraph.ts
- Seed data: src/data/knowledge/*
- Engine: src/lib/knowledgeGraph/engine.ts
- Personal: src/lib/knowledgeGraph/personalGraph.ts
- Intelligence: src/lib/knowledgeGraph/intelligence.ts
- Ingestion: src/lib/knowledgeGraph/ingestion.ts
- Persistence: src/lib/knowledgeGraph/persistence.ts

## Provenance
Personal nodes track provenance: reported, measured, inferred, demonstrated. Never treat inference as fact.
Temporal history preserved in user_knowledge_observations.
