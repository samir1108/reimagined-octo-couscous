import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { PersonalKnowledgeGraphService } from "@/lib/knowledgeGraph";

const PersonalGraph = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id || null;
      setUserId(id);
      if (id) {
        const svc = new PersonalKnowledgeGraphService(id);
        svc.load().then((g) => setCount(g.nodes.size));
      }
    });
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-sm text-muted-foreground">Back</Link>
        <h1 className="text-3xl font-light mt-4 mb-2">Personal Knowledge Graph</h1>
        <p className="text-muted-foreground mb-4">
          {userId ? `Loaded ${count} personal nodes.` : "Sign in to view your personal graph."}
        </p>
      </div>
    </main>
  );
};

export default PersonalGraph;
