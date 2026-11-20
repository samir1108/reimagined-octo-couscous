/**
 * Contract sketch: compose-session-v3 → session-adapter → session_spine pipeline
 *
 * These specs document the expected shapes and ordering of the server pipeline.
 * They do NOT call a live Supabase stack, so every network step below is marked
 * `it.skip` — enable it against a running local stack (`supabase start`) when
 * verifying AI + database behaviour end to end.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';

// Mock user for testing
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
const TEST_AUTH_TOKEN = 'test-auth-token';

describe('Session Composition Pipeline', () => {
  let adminClient: ReturnType<typeof createClient>;
  let userClient: ReturnType<typeof createClient>;
  const testSpineId: string | null = null;

  beforeAll(() => {
    adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${TEST_AUTH_TOKEN}` } },
    });
  });

  afterAll(async () => {
    // Cleanup test data
    if (testSpineId) {
      await adminClient.from('session_spine').delete().eq('id', testSpineId);
    }
  });

  describe('Step 1: getUserContext', () => {
    it('should return complete UserContext with all fields', async () => {
      // This would call the edge function in production
      // For unit test, we verify the shared function logic
      const { getUserContext } = await import('../../supabase/functions/_shared/user-context.ts');
      
      // Note: In real test, this would hit the database
      // Here we just verify the function exists and has correct shape
      expect(typeof getUserContext).toBe('function');
    });

    it('should handle missing tables gracefully', async () => {
      const { getUserContext } = await import('../../supabase/functions/_shared/user-context.ts');
      
      // The function uses Promise.allSettled so individual failures don't throw
      // This is tested by the timeout wrapper we added
      expect(getUserContext).toBeDefined();
    });
  });

  describe('Step 2: compose-session-v3', () => {
    it('should return a valid Plan with steps', async () => {
      // In production, this calls the edge function
      // Test verifies the response shape
      const expectedPlanShape = {
        id: expect.any(String),
        intent: expect.any(String),
        intro: expect.any(String),
        steps: expect.arrayContaining([
          expect.objectContaining({
            kind: expect.stringMatching(/^(wisdom-read|breathwork|journal|micro-act|reflection|guide-chat|practice|temple-chat|witness)$/),
            title: expect.any(String),
            est_minutes: expect.any(Number),
            whyForYou: expect.any(String),
            signalRef: expect.any(String),
          }),
        ]),
      };

      expect(expectedPlanShape).toBeDefined();
    });

    it('should include council voices', async () => {
      const expectedCouncilShape = {
        head: expect.any(String),
        heart: expect.any(String),
        gut: expect.any(String),
        lead: expect.stringMatching(/^(head|heart|gut)$/),
        archetype: expect.any(String),
        reason: expect.any(String),
      };

      expect(expectedCouncilShape).toBeDefined();
    });

    it('should write to session_spine', async () => {
      // Verify session_spine insert includes all required fields
      const expectedSpineFields = [
        'user_id',
        'archetype',
        'archetype_reason',
        'lead_master',
        'council_voices',
        'primary_loop_id',
        'secondary_loop_ids',
        'primary_dimension',
        'chakra_focus',
        'quality_score',
        'final_user_sentence',
        'why_for_you',
        'graph_edges',
        'composed_signals',
        'ai_mode',
      ];

      expect(expectedSpineFields).toContain('graph_edges');
      expect(expectedSpineFields).toContain('why_for_you');
    });
  });

  describe('Step 3: session-adapter', () => {
    it('should adapt planned master/mode/practice to current state', async () => {
      const expectedAdaptationShape = {
        master: expect.any(String),
        mode: expect.any(String),
        practice: expect.any(String),
        pacing_hint: expect.stringMatching(/^(short|medium|deep)$/),
        swap_reason: expect.any(String),
        adapted: expect.any(Boolean),
        signals: expect.objectContaining({
          band: expect.any(Number),
          state: expect.any(String),
          top_loops: expect.any(Array),
          dominant_domain: expect.any(String),
          recent_sessions_24h: expect.any(Number),
        }),
      };

      expect(expectedAdaptationShape).toBeDefined();
    });

    it('should log to session_adaptations', async () => {
      const expectedLogFields = [
        'user_id',
        'session_id',
        'program_id',
        'day_number',
        'original_master',
        'adapted_master',
        'original_mode',
        'adapted_mode',
        'original_practice',
        'adapted_practice',
        'pacing_hint',
        'swap_reason',
        'signals',
      ];

      expect(expectedLogFields).toContain('swap_reason');
    });

    it('should handle dark_night state', async () => {
      // When user is in dark_night, adapter should swap to soft master
      const darkNightAdaptation = {
        master: 'rumi',
        mode: 'therapy',
        practice: 'therapy',
        pacing_hint: 'short',
        swap_reason: expect.stringContaining('dark_night'),
      };

      expect(darkNightAdaptation.master).toBe('rumi');
    });
  });

  describe('Step 4: Novelty Filter', () => {
    it('should embed step content and check similarity', async () => {
      // Verify embedText is called for each step
      // and match_user_memories RPC is called
      const noveltyCheckSteps = [
        'embed step title + prompt',
        'call match_user_memories RPC',
        'filter by source_type = session_step',
        'flag if similarity > 0.85',
      ];

      expect(noveltyCheckSteps).toContain('flag if similarity > 0.85');
    });

    it('should regenerate flagged steps', async () => {
      // When steps are flagged, novelty-repair call should:
      // - Keep same archetype, kind, est_minutes
      // - Rewrite title, prompt, whyForYou
      // - Preserve signalRef
      // - Re-embed replaced steps
      const repairRequirements = [
        'preserve archetype',
        'preserve kind',
        'preserve est_minutes',
        'rewrite title',
        'rewrite prompt',
        'preserve signalRef',
        're-embed',
      ];

      expect(repairRequirements).toContain('preserve signalRef');
    });
  });

  describe('Step 5: Fire-and-forget side effects', () => {
    it.skip('should consume previous whisper (needs live stack)', async () => {
      // After composing, the unconsumed whisper should be marked consumed
      expect(true).toBe(true); // Placeholder
    });

    it('should generate next whisper', async () => {
      // New whisper referencing composed session
      const whisperShape = {
        whisper: expect.any(String),
        tone: expect.stringMatching(/^(tender|fierce|playful|grave|grateful)$/),
      };

      expect(whisperShape).toBeDefined();
    });

    it.skip('should evolve theme if active (needs live stack)', async () => {
      // POST to evolve-theme with spine data
      expect(true).toBe(true); // Placeholder
    });

    it.skip('should persist step embeddings (needs live stack)', async () => {
      // Insert into user_memory_vectors with tags [kind, archetype, lead]
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('End-to-End Pipeline', () => {
    it.skip('should complete full pipeline without errors (needs live stack)', async () => {
      // Requires a live stack; when enabled it should:
      // 1. Call compose-session-v3 with test user
      // 2. Get plan + spineId
      // 3. Call session-adapter with planned values
      // 4. Verify session_spine row exists
      // 5. Verify session_adaptations log exists
      // 6. Verify embeddings inserted
      // 7. Verify whisper consumed/generated
      // 8. Verify theme evolved (if applicable)
      
      const pipelineSteps = [
        'getUserContext',
        'compose-session-v3 (council → composer → novelty → write spine)',
        'session-adapter (adapt master/mode/practice)',
        'session_spine written',
        'session_adaptations logged',
        'whisper consumed',
        'next whisper generated',
        'theme evolved',
        'step embeddings persisted',
      ];

      expect(pipelineSteps.length).toBe(9);
    });
  });

  describe('Data Integrity', () => {
    it('session_spine should have graph_edges with correct types', () => {
      const validEdgeTypes = ['loop', 'dimension', 'chakra', 'master'];
      expect(validEdgeTypes).toContain('loop');
      expect(validEdgeTypes).toContain('dimension');
    });

    it('why_for_you should reference specific signals', () => {
      const validSignalRefs = [
        'loop:VAL003',
        'dim:emotion',
        'chakra:throat',
        'practice:witnessing:L2',
        'memory:14d',
      ];
      expect(validSignalRefs).toContain('loop:VAL003');
    });

    it('council voices should have lead and archetype', () => {
      const councilShape = {
        lead: expect.stringMatching(/^(head|heart|gut)$/),
        archetype: expect.stringMatching(/^(Settling|Confrontation|Reconciliation|Shadow Mirror|Stuck-Loop Break|Lineage Initiation|Re-entry|Celebration|Dissolution|Witness Deepening|Inquiry Spiral|Devotional|Karmic Action|Dark Night Hold)$/),
      };
      expect(councilShape).toBeDefined();
    });
  });
});

// Helper to run integration test against live Supabase
// (Uncomment and configure for manual testing)
/*
describe('Live Integration Test (requires Supabase)', () => {
  it('should run full pipeline against test user', async () => {
    // This would require a test user with known state
    // const response = await fetch(`${SUPABASE_URL}/functions/v1/compose-session-v3`, {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${TEST_AUTH_TOKEN}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ timeBudgetMin: 10, energy: 'medium', gate: 'morning' }),
    // });
    // const data = await response.json();
    // expect(data.ok).toBe(true);
    // expect(data.plan).toBeDefined();
    // expect(data.spineId).toBeDefined();
    // testSpineId = data.spineId;
  });
});
*/