import { useState } from "react";
import { Link } from "react-router-dom";
import { getKnowledgeEngine } from "@/lib/knowledgeGraph";

const KnowledgeGraphExplorer = () => {
  const engine = getKnowledgeEngine();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [domainFilter, setDomainFilter] = useState<string>("all");
  const results = (query.trim() ? engine.search(query, 50) : []).filter((n) => domainFilter === "all" || n.domain === domainFilter);
  const selected = selectedId ? engine.getNode(selectedId) : null;
  const neighbors = selectedId ? engine.neighbors(selectedId, undefined, "both") : [];

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="text-sm text-muted-foreground">Back</Link>
        <h1 className="text-3xl font-light mt-4 mb-2">Knowledge Graph Explorer</h1>
        <p className="text-muted-foreground mb-6">Nodes: {engine.stats().nodeCount} · Edges: {engine.stats().edgeCount}</p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search concepts..."
          className="w-full p-2 border rounded mb-4 bg-background"
        />

        <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="mb-4 p-2 border rounded bg-background">
          <option value="all">All domains</option>
          {['consciousness','mind','psychology','yoga','spirituality','neuroscience','body','behaviour','life','transformation'].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-medium mb-2">Results</h2>
            <ul className="space-y-1 max-h-96 overflow-auto">
              {results.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => setSelectedId(n.id)}
                    className="text-left text-sm hover:underline"
                  >
                    {n.name} <span className="text-xs text-muted-foreground">({n.domain})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-medium mb-2">Selected</h2>
            {selected ? (
              <div>
                <h3 className="text-lg">{selected.name}</h3>
                <p className="text-sm text-muted-foreground">{selected.description}</p>
                <p className="text-xs mt-2">Domain: {selected.domain} · Type: {selected.nodeType}</p>
                <h4 className="mt-4 font-medium">Neighbors ({neighbors.length})</h4>
                <ul className="space-y-1 max-h-64 overflow-auto">
                  {neighbors.slice(0, 50).map((n) => (
                    <li key={n.id}>
                      <button onClick={() => setSelectedId(n.id)} className="text-sm hover:underline">
                        {n.name} <span className="text-xs text-muted-foreground">({n.domain})</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a concept.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default KnowledgeGraphExplorer;
