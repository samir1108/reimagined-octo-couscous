import { describe, it, expect, beforeEach } from 'vitest';
import { buildConsciousnessGraph, resetGraphCache } from '@/data/graph';
import { resetMarkerCache } from '@/data/graph/behaviorMap';
import { GraphEngine } from '@/lib/graph/engine';
import { findGraphGaps } from '@/lib/graph/gaps';
import { matchSign, getSignGuidance } from '@/lib/graph/signMatcher';
import { buildStageBandContext, buildEnrichedAIPrompt, describeReportedSign } from '@/lib/graph/aiContext';
import { STAGE_HANDBOOK } from '@/data/stageHandbook';
import { GRANTHIS } from '@/data/granthis';
import { KUNDALINI_SIGNS } from '@/data/kundaliniSigns';
import { ENERGY_MARKERS } from '@/data/energyMarkers';

describe('Stage-Behavior Knowledge Graph', () => {
  beforeEach(() => {
    resetGraphCache();
    resetMarkerCache();
  });

  it('classifies every stage marker into a node', () => {
    const graph = buildConsciousnessGraph();
    const markerNodes = Array.from(graph.nodes.values()).filter(n => n.type === 'behavior-marker');
    const expected = STAGE_HANDBOOK.reduce((sum, s) => sum + s.markers.length, 0);

    expect(expected).toBeGreaterThan(200);
    expect(markerNodes.length).toBe(expected);
  });

  it('wires BAND_EXHIBITS_MARKER for all 8 handbook bands', () => {
    const engine = new GraphEngine();
    for (const stage of STAGE_HANDBOOK) {
      const markers = engine.markersForBand(stage.band);
      expect(markers.length).toBe(stage.markers.length);
      expect(markers.every(m => typeof m.data.confidence === 'number')).toBe(true);
    }
  });

  it('links sleeper markers to real loops (curated overrides)', () => {
    const engine = new GraphEngine();
    // "Reaches for phone within 60 seconds of waking" is curated → ATT168 + AVD147
    const loops = engine.loopsIndicatedByStage(0);
    const loopIds = loops.map(l => l.loop.id);
    expect(loopIds).toContain('loop::ATT168');
    expect(loopIds).toContain('loop::AVD147');
  });

  it('attaches a dimension edge to every marker', () => {
    const graph = buildConsciousnessGraph();
    const markers = Array.from(graph.nodes.values()).filter(n => n.type === 'behavior-marker');
    const withDimension = markers.filter(m =>
      graph.edges.some(e => e.from === m.id && e.type === 'MARKER_IN_DIMENSION')
    );
    expect(withDimension.length).toBe(markers.length);
  });

  it('produces high-precision chakra edges only', () => {
    const engine = new GraphEngine();
    // "Has not cried in over a year — or cries every day without knowing why" → heart
    const markers = engine.markersForBand(0);
    const cryMarker = markers.find(m => m.label.includes('not cried'));
    expect(cryMarker).toBeDefined();

    const chakraEdges = engine.getEdges(cryMarker!.id, undefined, 'MARKER_IN_CHAKRA');
    expect(chakraEdges.some(e => e.to === 'chakra::anahata')).toBe(true);

    // Not every marker gets a chakra edge — precision over recall
    const totalWithChakra = markers.filter(m =>
      engine.getEdges(m.id, undefined, 'MARKER_IN_CHAKRA').length > 0
    ).length;
    expect(totalWithChakra).toBeGreaterThan(0);
    expect(totalWithChakra).toBeLessThan(markers.length);
  });

  it('builds a full sleeper stage profile', () => {
    const engine = new GraphEngine();
    const profile = engine.stageProfile(0);

    expect(profile).not.toBeNull();
    expect(profile!.markerCount).toBe(STAGE_HANDBOOK[0].markers.length);
    expect(profile!.loops.length).toBeGreaterThan(3);
    expect(profile!.topDimensions.some(d => d.dimension.id === 'dimension::consciousness::body')).toBe(true);
    expect(profile!.granthis.map(g => g.id)).toContain('granthi::brahma');
    expect(profile!.nextBand?.id).toBe('band::1');
    expect(profile!.bridge).toBeTruthy();
    expect(profile!.paths.some(p => p.fit === 'primary')).toBe(true);
  });

  it('wires yoga path fit from the stage handbook (Karma primary, Jnana avoid at band 0)', () => {
    const engine = new GraphEngine();
    const paths = engine.pathsForBand(0);
    const karma = paths.find(p => p.path.id === 'path::karma');
    const jnana = paths.find(p => p.path.id === 'path::jnana');

    expect(karma?.fit).toBe('primary');
    expect(karma?.why).toContain('only language');
    expect(jnana?.fit).toBe('avoid');
  });

  it('wires the spiral: BAND_ADVANCES_TO chains bands 0→10', () => {
    const graph = buildConsciousnessGraph();
    const advanceEdges = graph.edges.filter(e => e.type === 'BAND_ADVANCES_TO');
    expect(advanceEdges.length).toBe(10);

    const engine = new GraphEngine();
    expect(engine.nextBand(0)?.band.id).toBe('band::1');
    expect(engine.nextBand(9)?.band.id).toBe('band::10');
    expect(engine.nextBand(10)).toBeNull();
  });

  it('models all three granthis at their correct centers', () => {
    const graph = buildConsciousnessGraph();
    expect(GRANTHIS.length).toBe(3);

    const expected: Record<string, string> = {
      brahma: 'chakra::muladhara',
      vishnu: 'chakra::anahata',
      rudra: 'chakra::ajna',
    };
    for (const [granthiId, chakraId] of Object.entries(expected)) {
      const has = graph.edges.some(e => e.type === 'GRANTHI_AT_CHAKRA' && e.from === `granthi::${granthiId}` && e.to === chakraId);
      expect(has).toBe(true);
    }

    // Each granthi has a dissolution practice
    for (const granthi of GRANTHIS) {
      const practices = graph.edges.filter(e => e.type === 'GRANTHI_DISSOLVED_BY_PRACTICE' && e.from === `granthi::${granthi.id}`);
      expect(practices.length).toBeGreaterThan(0);
    }
  });

  it('blocks bands with granthis', () => {
    const engine = new GraphEngine();
    const band0Granthis = engine.granthisForBand(0).map(g => g.id);
    expect(band0Granthis).toEqual(['granthi::brahma']);

    const band5Granthis = engine.granthisForBand(5).map(g => g.id);
    expect(band5Granthis).toEqual(['granthi::rudra']);
  });

  it('models kundalini signs with safety tiers and grounding', () => {
    const graph = buildConsciousnessGraph();
    const signs = Array.from(graph.nodes.values()).filter(n => n.type === 'kundalini-sign');
    expect(signs.length).toBe(KUNDALINI_SIGNS.length);

    for (const sign of signs) {
      expect(sign.data.grounding).toBeTruthy();
      expect(['normal', 'check-in', 'stop-and-support']).toContain(sign.data.safety);
    }

    const stopSign = signs.find(s => s.id === 'kundalini-sign::reality-contact-loss');
    expect(stopSign?.data.safety).toBe('stop-and-support');
  });

  it('connects kundalini signs to the loops they mimic', () => {
    const graph = buildConsciousnessGraph();
    const heatSign = 'kundalini-sign::spinal-heat';
    const mimics = graph.edges.filter(e => e.type === 'KUNDALINI_SIGN_MIMICS_LOOP' && e.from === heatSign);
    expect(mimics.some(e => e.to === 'loop::EMO009')).toBe(true);
  });

  it('attaches kundalini signs to bands with safety metadata', () => {
    const engine = new GraphEngine();
    const band3Signs = engine.signsForBand(3);
    expect(band3Signs.length).toBeGreaterThan(0);
    expect(band3Signs.every(s => !!s.sign)).toBe(true);
    expect(band3Signs.some(s => s.sign.id === 'kundalini-sign::kriya-movements')).toBe(true);
    expect(band3Signs.find(s => s.sign.id === 'kundalini-sign::kriya-movements')?.safety).toBe('check-in');
  });

  it('grows the graph past existing baselines', () => {
    const graph = buildConsciousnessGraph();
    expect(graph.nodes.size).toBeGreaterThan(1000);
    expect(graph.edges.length).toBeGreaterThan(500);

    const newEdges = graph.edges.filter(e =>
      ['BAND_EXHIBITS_MARKER', 'MARKER_INDICATES_LOOP', 'BAND_BLOCKED_BY_GRANTHI', 'BAND_MAY_SHOW_SIGN'].includes(e.type)
    );
    expect(newEdges.length).toBeGreaterThan(300);
  });

  it('reports its own gaps (bands 8–10 have no markers)', () => {
    const graph = buildConsciousnessGraph();
    const gaps = findGraphGaps(graph.nodes, graph.edges);

    const bandGap = gaps.find(g => g.kind === 'band-without-markers');
    expect(bandGap).toBeDefined();
    expect(bandGap!.count).toBe(3); // bands 8, 9, 10
    expect(bandGap!.samples.some(s => s.includes('JAGADGURU'))).toBe(true);
  });
});

// ─── Marker polarity (behavioral vs maturity) ───

describe('Marker polarity', () => {
  beforeEach(() => {
    resetGraphCache();
    resetMarkerCache();
  });

  it('marks capacity signatures as maturity, dysfunction as behavioral', () => {
    const engine = new GraphEngine();
    const band6Maturity = engine.markersForBandByPolarity(6, 'maturity');
    const band0Maturity = engine.markersForBandByPolarity(0, 'maturity');

    // Higher bands describe more capacity, less dysfunction
    expect(band6Maturity.length).toBeGreaterThan(band0Maturity.length);
    expect(band6Maturity.some(m => m.label.includes('Holds opposites'))).toBe(true);
  });

  it('maturity markers carry no loop edges by design', () => {
    const graph = buildConsciousnessGraph();
    const markers = Array.from(graph.nodes.values()).filter(n => n.type === 'behavior-marker');
    const maturityMarkers = markers.filter(m => m.data.polarity === 'maturity');

    for (const m of maturityMarkers) {
      const loopEdges = graph.edges.filter(e => e.from === m.id && e.type === 'MARKER_INDICATES_LOOP');
      expect(loopEdges.length).toBe(0);
    }
  });

  it('stage profile reports the behavioral/maturity split', () => {
    const engine = new GraphEngine();
    const profile = engine.stageProfile(0)!;
    expect(profile.markerCount).toBe(STAGE_HANDBOOK[0].markers.length);
    expect(profile.maturityCount).toBeLessThan(profile.markerCount);
    expect(profile.markerCount - profile.maturityCount).toBeGreaterThan(20);
  });

  it('behavioral markers can no longer float unlinked (curation closed the band-0 gap)', () => {
    const graph = buildConsciousnessGraph();
    const gaps = findGraphGaps(graph.nodes, graph.edges);
    const markerGap = gaps.find(g => g.kind === 'marker-without-loops');
    // Every behavioral marker from the gap audit now has at least one loop
    expect(markerGap?.count ?? 0).toBe(0);
  });

  it('curates the gap-audit stragglers to the right loops', () => {
    const engine = new GraphEngine();
    const loops = engine.loopsIndicatedByStage(0).map(l => l.loop.id);
    expect(loops).toContain('loop::HAB013'); // cannot recall what was eaten
    expect(loops).toContain('loop::PRD001'); // no time for anything inward
  });
});

// ─── Loop × band affinity ───

describe('Loop band affinity', () => {
  beforeEach(() => {
    resetGraphCache();
    resetMarkerCache();
  });

  it('claims every loop with at least one band', () => {
    const graph = buildConsciousnessGraph();
    const loops = Array.from(graph.nodes.values()).filter(n => n.type === 'loop');
    const orphans = loops.filter(l => !graph.edges.some(e => e.to === l.id && e.type === 'BAND_COMMON_LOOP'));
    expect(orphans.length).toBe(0);
  });

  it('keeps curated overrides narrower than category affinity', () => {
    const engine = new GraphEngine();
    // VAL001 people-pleasing: override bands 0–3, not the full validation 0–4
    const bands = engine.bandsForLoop('VAL001').map(b => b.id);
    expect(bands).toContain('band::0');
    expect(bands).toContain('band::3');
    expect(bands).not.toContain('band::4');
  });
});

// ─── Energy (ki) layer ───

describe('Energy markers (prana / nadi)', () => {
  beforeEach(() => {
    resetGraphCache();
    resetMarkerCache();
  });

  it('models all 5 pranas and 3 nadis as marker-bearing channels', () => {
    const engine = new GraphEngine();
    for (const channel of ['prana', 'apana', 'samana', 'udana', 'vyana']) {
      expect(engine.energyMarkersForChannel(channel).length).toBe(1);
    }
    for (const channel of ['ida', 'pingala', 'sushumna']) {
      expect(engine.energyMarkersForChannel(channel).length).toBe(1);
    }
  });

  it('groups the energy profile into prana / nadi / sushumna', () => {
    const engine = new GraphEngine();
    const profile = engine.energyProfile();
    expect(profile.prana.length).toBe(5);
    expect(profile.nadi.length).toBe(2);
    expect(profile.sushumna?.id).toBe('energy-marker::sushumna-open');
  });

  it('wires energy markers to dimensions, mimicking loops, and balancing practices', () => {
    const graph = buildConsciousnessGraph();
    const pingala = 'energy-marker::pingala-dominant';

    expect(graph.edges.some(e => e.type === 'ENERGY_MARKER_IN_DIMENSION' && e.from === pingala)).toBe(true);
    expect(graph.edges.some(e => e.type === 'ENERGY_MARKER_MIMICS_LOOP' && e.from === pingala && e.to === 'loop::PRD001')).toBe(true);
    expect(graph.edges.some(e => e.type === 'ENERGY_MARKER_BALANCED_BY_PRACTICE' && e.from === pingala)).toBe(true);
  });

  it('every energy marker states a balancing method and a practice', () => {
    for (const marker of ENERGY_MARKERS) {
      expect(marker.balancing.length).toBeGreaterThan(10);
      expect(marker.balancedBy.length).toBeGreaterThan(0);
    }
  });
});

// ─── Kundalini sign matcher + safety layer ───

describe('Sign matcher', () => {
  it('matches a spine-heat report to the right sign and protocol', () => {
    const guidance = getSignGuidance('during the sit I felt heat rising up my spine and my back was hot');
    expect(guidance.match?.sign.id).toBe('spinal-heat');
    expect(guidance.protocol).toContain('exhale');
    expect(guidance.escalate).toBe(false);
  });

  it('escalates reality-contact reports to stop-and-support', () => {
    const guidance = getSignGuidance("I can't tell what's real anymore and I feel unreal since the practice");
    expect(guidance.match?.sign.id).toBe('reality-contact-loss');
    expect(guidance.escalate).toBe(true);
    expect(guidance.protocol).toContain('STOP');
  });

  it('puts the safest match first when reports are ambiguous', () => {
    const matches = matchSign('unreal heat and tingling, I cannot orient');
    expect(matches[0].sign.safety).toBe('stop-and-support');
  });

  it('returns an honest unknown for unmatched reports', () => {
    const guidance = getSignGuidance('my knee hurts');
    expect(guidance.match).toBeNull();
    expect(guidance.headline).toContain('Not in the sign library');
  });

  it('never diagnoses: sign framing stays traditional, not clinical', () => {
    const description = describeReportedSign('I felt heat rising in my spine');
    expect(description).toContain('graph recognises');
    expect(description).toContain('never as progress to chase');
  });
});

// ─── AI context wiring ───

describe('AI stage context', () => {
  beforeEach(() => {
    resetGraphCache();
    resetMarkerCache();
  });

  it('builds band-aware AI context for the sleeper band', () => {
    const ctx = buildStageBandContext(0);
    expect(ctx).not.toBeNull();
    expect(ctx!.archetypeLabel).toContain('SLEEPER');
    expect(ctx!.likelyLoops.length).toBeGreaterThan(3);
    expect(ctx!.granthis).toContain('Brahma Granthi');
    expect(ctx!.pathFits.some(p => p.path === 'Karma Yoga' && p.fit === 'primary')).toBe(true);
    expect(ctx!.bridge.length).toBeGreaterThan(10);
  });

  it('enriches the AI system prompt with stage context when a band is given', () => {
    const withBand = buildEnrichedAIPrompt('I keep reaching for my phone', 0);
    const withoutBand = buildEnrichedAIPrompt('I keep reaching for my phone');

    expect(withBand.systemPrompt).toContain('USER STAGE CONTEXT');
    expect(withBand.systemPrompt).toContain('Loops this band typically runs');
    expect(withBand.systemPrompt).toContain('NEVER cite the band number');
    expect(withoutBand.systemPrompt).not.toContain('USER STAGE CONTEXT');
  });

  it('attaches safe-sign framing to sensation-shaped queries', () => {
    const enriched = buildEnrichedAIPrompt('I felt a strange heat rising during meditation', 3);
    expect(enriched.signGuidance).toBeDefined();
    expect(enriched.signGuidance).toContain('graph recognises');
  });
});
