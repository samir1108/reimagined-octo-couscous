// ─────────────────────────────────────────────────────────────────────────────
// DIRECTOR BRAIN — UI Components
// Visual interface for the Director Decision Model
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { answerWhy } from '@/lib/director-brain/why-engine';
import { getKnowledgeGraph } from '@/lib/director-brain/knowledge-graph';
import { interpretFeedback, emotionToTechnique } from '@/lib/director-brain/creative-interpreter';
import { simulateChange, simulateWideToCloseUp, simulateAddTension } from '@/lib/director-brain/simulation';
import { getDNASummary } from '@/lib/director-brain/film-dna';
import { titanicFilm, bowShots } from '@/lib/director-brain/data/titanic';
import type { Shot, WhyResponse, InterpretedFeedback, SimulationResult } from '@/lib/director-brain/types';

// ── Main Director Brain Panel ────────────────────────────────────────────────

export function DirectorBrainPanel() {
  const [activeTab, setActiveTab] = useState<'why' | 'graph' | 'interpreter' | 'simulate' | 'dna'>('why');
  const [selectedShot, setSelectedShot] = useState<Shot>(bowShots[3]); // The iconic wide shot

  return (
    <div className="w-full max-w-6xl mx-auto bg-black/95 border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-amber-900/20 to-rose-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">Director Brain</h2>
            <p className="text-sm text-white/50 mt-0.5">{titanicFilm.title} ({titanicFilm.year}) — {titanicFilm.director}</p>
          </div>
          <ShotSelector shots={bowShots} selected={selectedShot} onSelect={setSelectedShot} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {(['why', 'graph', 'interpreter', 'simulate', 'dna'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-400/5'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {tab === 'why' ? 'Why Engine' :
             tab === 'graph' ? 'Knowledge Graph' :
             tab === 'interpreter' ? 'Creative Interpreter' :
             tab === 'simulate' ? 'Simulate' : 'Film DNA'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 min-h-[400px]">
        {activeTab === 'why' && <WhyEnginePanel shot={selectedShot} />}
        {activeTab === 'graph' && <KnowledgeGraphPanel shot={selectedShot} />}
        {activeTab === 'interpreter' && <CreativeInterpreterPanel shot={selectedShot} />}
        {activeTab === 'simulate' && <SimulatePanel shot={selectedShot} />}
        {activeTab === 'dna' && <DNAPanel />}
      </div>
    </div>
  );
}

// ── Shot Selector ───────────────────────────────────────────────────────────

function ShotSelector({ shots, selected, onSelect }: { shots: Shot[]; selected: Shot; onSelect: (s: Shot) => void }) {
  return (
    <select
      value={selected.id}
      onChange={e => {
        const shot = shots.find(s => s.id === e.target.value);
        if (shot) onSelect(shot);
      }}
      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:border-amber-400/50"
    >
      {shots.map(shot => (
        <option key={shot.id} value={shot.id} className="bg-gray-900">
          Shot {shot.shotNumber}: {shot.technical.shotSize} — {shot.emotion.primary}
        </option>
      ))}
    </select>
  );
}

// ── Why Engine Panel ────────────────────────────────────────────────────────

function WhyEnginePanel({ shot }: { shot: Shot }) {
  const [question, setQuestion] = useState(`Why did the director use a ${shot.technical.shotSize} here?`);
  const [response, setResponse] = useState<WhyResponse | null>(null);

  const handleAsk = () => {
    const result = answerWhy({
      question,
      targetShotId: shot.id,
      targetFilmId: shot.sceneId.includes('titanic') ? 'film-titanic-1997' : undefined
    });
    setResponse(result);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50"
          placeholder="Ask why about this shot..."
          onKeyDown={e => e.key === 'Enter' && handleAsk()}
        />
        <button
          onClick={handleAsk}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg text-sm transition-colors"
        >
          Ask Why
        </button>
      </div>

      {response && (
        <div className="space-y-4 animate-in fade-in">
          {/* Answer */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <p className="text-white/90 leading-relaxed">{response.answer}</p>
            <div className="mt-3 flex items-center gap-2">
              <ConfidenceBadge level={response.confidence} />
              <span className="text-xs text-white/40">Confidence: {response.confidence}</span>
            </div>
          </div>

          {/* Evidence Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            {response.evidenceBreakdown.map((eb, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white/60">{eb.category}</span>
                  <span className="text-xs font-bold text-amber-400">{eb.score}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all"
                    style={{ width: `${eb.score}%` }}
                  />
                </div>
                <ul className="mt-2 space-y-1">
                  {eb.evidence.slice(0, 2).map((e, j) => (
                    <li key={j} className="text-xs text-white/40 truncate">{e}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Reasoning Chain */}
          {response.reasoningChain.length > 0 && (
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <h4 className="text-sm font-medium text-white/70 mb-3">Reasoning Chain</h4>
              <div className="space-y-3">
                {response.reasoningChain.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-amber-400">{step.step}</span>
                    </div>
                    <div>
                      <p className="text-sm text-white/70">{step.observation}</p>
                      <p className="text-sm text-amber-400/80 mt-0.5">→ {step.inference}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Counterfactual */}
          {response.counterfactual && (
            <div className="bg-rose-500/5 rounded-xl p-4 border border-rose-500/20">
              <h4 className="text-sm font-medium text-rose-400 mb-1">What if different?</h4>
              <p className="text-sm text-white/60">{response.counterfactual}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Knowledge Graph Panel ───────────────────────────────────────────────────

function KnowledgeGraphPanel({ shot }: { shot: Shot }) {
  const graph = useMemo(() => getKnowledgeGraph('film-titanic-1997'), []);
  const neighbors = useMemo(() => graph.getNeighbors(shot.id), [graph, shot.id]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Shot Node */}
        <div className="col-span-1 bg-white/5 rounded-xl p-4 border border-amber-500/30">
          <div className="text-xs text-amber-400 font-medium mb-2">CURRENT SHOT</div>
          <div className="space-y-2">
            <InfoRow label="Size" value={shot.technical.shotSize} />
            <InfoRow label="Movement" value={shot.technical.cameraMovement} />
            <InfoRow label="Lighting" value={shot.technical.lighting} />
            <InfoRow label="Duration" value={`${shot.duration}s`} />
            <InfoRow label="Emotion" value={shot.emotion.primary} />
          </div>
        </div>

        {/* Connections */}
        <div className="col-span-2 space-y-3">
          <div className="text-xs text-white/50 font-medium">GRAPH CONNECTIONS</div>
          {neighbors.map(node => {
            const edges = graph.getEdges(shot.id, 'out').filter(e => e.targetId === node.id);
            return (
              <div key={node.id} className="bg-white/5 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <NodeTypeBadge type={node.type} />
                  <span className="text-sm text-white/80">{node.label}</span>
                </div>
                <span className="text-xs text-amber-400/70">{edges[0]?.relationship}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emotion Flow */}
      <div className="bg-white/5 rounded-xl p-5 border border-white/10">
        <h4 className="text-sm font-medium text-white/70 mb-3">Emotion Flow in Scene</h4>
        <div className="flex items-end gap-1 h-24">
          {bowShots.map(s => (
            <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-gradient-to-t from-amber-500 to-rose-500 rounded-t opacity-80"
                style={{ height: `${s.emotion.intensity}%` }}
              />
              <span className="text-[10px] text-white/40">{s.shotNumber}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Creative Interpreter Panel ──────────────────────────────────────────────

function CreativeInterpreterPanel({ shot }: { shot: Shot }) {
  const [feedback, setFeedback] = useState("It feels too safe");
  const [interpretation, setInterpretation] = useState<InterpretedFeedback | null>(null);

  const handleInterpret = () => {
    const result = interpretFeedback({
      feedback,
      context: { shotId: shot.id, filmId: 'film-titanic-1997' }
    });
    setInterpretation(result);
  };

  const presets = ["It feels too safe", "Too chaotic", "Not emotional enough", "Too slow", "Needs more tension", "Claustrophobic"];

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50"
          placeholder="Describe what feels wrong..."
          onKeyDown={e => e.key === 'Enter' && handleInterpret()}
        />
        <button
          onClick={handleInterpret}
          className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-medium rounded-lg text-sm transition-colors"
        >
          Interpret
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map(p => (
          <button
            key={p}
            onClick={() => { setFeedback(p); }}
            className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {interpretation && (
        <div className="space-y-4">
          {/* Causes */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <h4 className="text-sm font-medium text-white/70 mb-3">Possible Causes</h4>
            <div className="space-y-2">
              {interpretation.possibleCauses.map((cause, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                  <div className="w-12 text-right">
                    <span className="text-xs font-bold text-rose-400">{cause.likelihood}%</span>
                  </div>
                  <div>
                    <p className="text-sm text-white/80">{cause.specific}</p>
                    <p className="text-xs text-white/40 mt-0.5">{cause.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {interpretation.recommendedChanges.length > 0 && (
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <h4 className="text-sm font-medium text-white/70 mb-3">Recommended Changes</h4>
              <div className="space-y-2">
                {interpretation.recommendedChanges.map((rec, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                    <PriorityBadge priority={rec.priority} />
                    <div className="flex-1">
                      <span className="text-sm text-white/80">{rec.parameter}</span>
                      <span className="text-xs text-white/40 ml-2">→ {rec.suggested}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Simulate Panel ──────────────────────────────────────────────────────────

function SimulatePanel({ shot }: { shot: Shot }) {
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  const runSimulation = (type: string) => {
    let result: SimulationResult;
    switch (type) {
      case 'wide-to-close': result = simulateWideToCloseUp(shot.id); break;
      case 'add-tension': result = simulateAddTension(shot.id); break;
      default: result = simulateWideToCloseUp(shot.id);
    }
    setSimulation(result);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button onClick={() => runSimulation('wide-to-close')} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:border-amber-400/50 transition-colors">
          Wide → Close-up
        </button>
        <button onClick={() => runSimulation('add-tension')} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:border-amber-400/50 transition-colors">
          Add Tension
        </button>
      </div>

      {simulation && (
        <div className="space-y-4">
          {/* Differences */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <h4 className="text-sm font-medium text-white/70 mb-3">Predicted Differences</h4>
            <div className="space-y-3">
              {simulation.differences.map((diff, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 items-center">
                  <div className="text-xs text-white/50 font-medium">{diff.aspect}</div>
                  <div className="text-xs text-rose-400/80 line-through">{diff.before}</div>
                  <div className="text-xs text-emerald-400/80">{diff.after}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Audience Impact */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <h4 className="text-sm font-medium text-white/70 mb-3">Audience Impact Prediction</h4>
            <div className="grid grid-cols-4 gap-4">
              <ImpactMeter label="Attention" value={simulation.audienceImpact.attentionChange} />
              <ImpactMeter label="Emotion" value={simulation.audienceImpact.emotionalEngagementChange} />
              <ImpactMeter label="Clarity" value={simulation.audienceImpact.comprehensionChange} />
              <ImpactMeter label="Memory" value={simulation.audienceImpact.memorabilityChange} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DNA Panel ───────────────────────────────────────────────────────────────

function DNAPanel() {
  const summary = useMemo(() => getDNASummary('film-titanic-1997'), []);

  return (
    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
      <h4 className="text-sm font-medium text-white/70 mb-4">Film DNA Profile</h4>
      <pre className="text-xs text-white/60 whitespace-pre-wrap font-mono leading-relaxed">{summary}</pre>
    </div>
  );
}

// ── Shared UI Components ────────────────────────────────────────────────────

function ConfidenceBadge({ level }: { level: string }) {
  const colors = {
    KNOWN: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    INFERRED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    SPECULATIVE: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[level as keyof typeof colors] || colors.SPECULATIVE}`}>
      {level}
    </span>
  );
}

function NodeTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    emotion: 'bg-rose-500/20 text-rose-400',
    camera: 'bg-blue-500/20 text-blue-400',
    lighting: 'bg-amber-500/20 text-amber-400',
    sound: 'bg-purple-500/20 text-purple-400',
    theme: 'bg-emerald-500/20 text-emerald-400',
    shot: 'bg-white/10 text-white/60'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${colors[type] || 'bg-white/10 text-white/60'}`}>
      {type}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors = { high: 'bg-rose-500/20 text-rose-400', medium: 'bg-amber-500/20 text-amber-400', low: 'bg-white/10 text-white/50' };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${colors[priority as keyof typeof colors]}`}>
      {priority}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-xs text-white/80 font-medium">{value}</span>
    </div>
  );
}

function ImpactMeter({ label, value }: { label: string; value: number }) {
  const isPositive = value >= 0;
  return (
    <div className="text-center">
      <div className="text-lg font-bold" style={{ color: isPositive ? '#34d399' : '#fb7185' }}>
        {isPositive ? '+' : ''}{value}
      </div>
      <div className="text-[10px] text-white/40 mt-1">{label}</div>
    </div>
  );
}

export default DirectorBrainPanel;
