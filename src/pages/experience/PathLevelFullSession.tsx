/**
 * PathLevelFullSession
 * ────────────────────
 * Runs a path level as the SAME full multi-step session paid users get
 * inside the app — teaching read, breathwork, reflection, practice, journal,
 * witness, micro-act, close — powered by the app's UniversalSessionShell.
 *
 * No auth. No credits. The plan is built client-side from the level's
 * teaching + practices, so the whole flow runs without a backend composer.
 *
 * Route: /experience/paths/:slug/level/:level/session
 */
import { useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { getPathBySlug } from "@/data/experiencePaths";
import { buildLevelSessionPlan } from "@/lib/experience/buildLevelPlan";
import { SessionShellProvider } from "@/lib/session-shell/SessionShellContext";
import { UniversalSessionShell } from "@/components/session-shell/UniversalSessionShell";

const PathLevelFullSession = () => {
  useForceDarkMode();
  const { slug, level } = useParams<{ slug: string; level: string }>();
  const levelNum = level ? parseInt(level, 10) : NaN;
  const path = slug ? getPathBySlug(slug) : undefined;
  const lvl = path && !isNaN(levelNum) ? path.levels.find(l => l.level === levelNum) : undefined;

  const built = useMemo(() => (path && lvl ? buildLevelSessionPlan(path, lvl) : null), [path, lvl]);

  if (slug && (!path || !lvl)) return <Navigate to="/experience/paths" replace />;
  if (!path || !lvl || !built) return null;

  return (
    <>
      <Seo
        title={`${path.name} Level ${lvl.level} · ${lvl.title} — full session with ${path.guru}`}
        description={`${lvl.promise} Walk the full multi-step session for level ${lvl.level} of ${path.name} — teaching, breath, reflection, practice, witness, close. Free, no signup.`}
        canonicalPath={`/experience/paths/${path.slug}/level/${lvl.level}/session`}
      />
      <SessionShellProvider sessionId={built.sessionId} plan={built.plan}>
        <UniversalSessionShell />
      </SessionShellProvider>
    </>
  );
};

export default PathLevelFullSession;
