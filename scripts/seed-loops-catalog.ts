/**
 * Seed Loops Catalog — Populates loops_catalog table from source files
 * 
 * Run with: npx tsx scripts/seed-loops-catalog.ts
 * (requires tsx: npm install -g tsx)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SERVICE_ROLE_KEY) {
  console.error('SERVICE_ROLE_KEY environment variable required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Parse localLoopDetector.ts for LOOP_ENTRIES
function parseLoopEntries(): Array<{
  id: string;
  name: string;
  keywords: string[];
  phrases: string[];
  category: string;
}> {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'localLoopDetector.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  const entries: Array<{
    id: string;
    name: string;
    keywords: string[];
    phrases: string[];
    category: string;
  }> = [];

  // Match LOOP_ENTRIES array
  const loopEntriesMatch = content.match(/const LOOP_ENTRIES: LoopEntry\[\] = \[([\s\S]*?)\n\];/);
  if (!loopEntriesMatch) {
    console.warn('Could not find LOOP_ENTRIES in localLoopDetector.ts');
    return entries;
  }

  const entriesContent = loopEntriesMatch[1];
  
  // Match each entry
  const entryRegex = /\s*\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*keywords:\s*\[([^\]]+)\],\s*phrases:\s*\[([^\]]+)\]\s*\}/g;
  let match;
  while ((match = entryRegex.exec(entriesContent)) !== null) {
    const id = match[1];
    const name = match[2];
    const keywords = match[3].split(',').map(k => k.trim().replace(/"/g, ''));
    const phrases = match[4].split(',').map(p => p.trim().replace(/"/g, ''));
    const category = id.replace(/\d+/g, '');
    
    entries.push({ id, name, keywords, phrases, category });
  }

  return entries;
}

// Parse loopLibraryCatalog.ts for LOOP_CATALOG hints
function parseLoopHints(): Map<string, string> {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'loopLibraryCatalog.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  const hints = new Map<string, string>();

  // Match LOOP_CATALOG array
  const catalogMatch = content.match(/export const LOOP_CATALOG: LoopCatalogEntry\[\] = \[([\s\S]*?)\n\];/);
  if (!catalogMatch) {
    console.warn('Could not find LOOP_CATALOG in loopLibraryCatalog.ts');
    return hints;
  }

  const catalogContent = catalogMatch[1];
  
  // Match each entry
  const entryRegex = /\s*\{\s*id:\s*"([^"]+)",\s*name:\s*"[^"]+",\s*category:\s*"[^"]+",\s*hint:\s*"([^"]+)"\s*\}/g;
  let match;
  while ((match = entryRegex.exec(catalogContent)) !== null) {
    const id = match[1];
    const hint = match[2];
    hints.set(id, hint);
  }

  return hints;
}

// Consciousness-engine LOOP_CLUSTER_MAP for root_wound and chakras
function parseLoopClusterMap(): Map<string, { root_wound: string; chakras: string[] }> {
  const filePath = path.join(process.cwd(), 'supabase', 'functions', 'consciousness-engine', 'index.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  const clusters = new Map<string, { root_wound: string; chakras: string[] }>();

  const clusterMatch = content.match(/const LOOP_CLUSTER_MAP: Record<string, \{ root_wound: string; chakras: string\[\] \}> = \{([\s\S]*?)\n\};/);
  if (!clusterMatch) {
    console.warn('Could not find LOOP_CLUSTER_MAP in consciousness-engine');
    return clusters;
  }

  const clusterContent = clusterMatch[1];
  
  const entryRegex = /\s*(\w+):\s*\{\s*root_wound:\s*"([^"]+)",\s*chakras:\s*\[([^\]]+)\]\s*\}/g;
  let match;
  while ((match = entryRegex.exec(clusterContent)) !== null) {
    const id = match[1];
    const root_wound = match[2];
    const chakras = match[3].split(',').map(c => c.trim().replace(/"/g, ''));
    clusters.set(id, { root_wound, chakras });
  }

  return clusters;
}

// Guest master roster triggers
function parseGuestTriggers(): Map<string, Record<string, string[]>> {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'guestMasterRoster.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  const triggers = new Map<string, Record<string, string[]>>();

  const triggersMatch = content.match(/const GUEST_MASTERS: GuestMaster\[\] = \[([\s\S]*?)\n\];/);
  if (!triggersMatch) {
    console.warn('Could not find GUEST_MASTERS in guestMasterRoster.ts');
    return triggers;
  }

  const triggersContent = triggersMatch[1];
  
  // This is more complex - let's do a simpler regex for each master's triggers
  const masterRegex = /\s*\{\s*id:\s*"([^"]+)",[\s\S]*?triggers:\s*\[([^\]]+)\]/g;
  let match;
  while ((match = masterRegex.exec(triggersContent)) !== null) {
    const id = match[1];
    const triggerList = match[2].split(',').map(t => t.trim().replace(/"/g, ''));
    if (triggerList.length > 0 && triggerList[0] !== '') {
      triggers.set(id, { [id]: triggerList });
    }
  }

  return triggers;
}

async function seedLoopsCatalog() {
  console.log('Parsing source files...');
  
  const loopEntries = parseLoopEntries();
  console.log(`Found ${loopEntries.length} loop entries from localLoopDetector.ts`);
  
  const hints = parseLoopHints();
  console.log(`Found ${hints.size} hints from loopLibraryCatalog.ts`);
  
  const clusters = parseLoopClusterMap();
  console.log(`Found ${clusters.size} cluster mappings from consciousness-engine`);
  
  const guestTriggers = parseGuestTriggers();
  console.log(`Found ${guestTriggers.size} guest master triggers`);

  // Build complete loop records
  const loops = loopEntries.map(entry => {
    const cluster = clusters.get(entry.id.toLowerCase().replace('_loop', '')) || 
                   clusters.get(entry.id.toLowerCase());
    
    const triggerMap: Record<string, string[]> = {};
    for (const [masterId, t] of guestTriggers.entries()) {
      if (t[masterId]) {
        triggerMap[masterId] = t[masterId];
      }
    }

    return {
      id: entry.id,
      name: entry.name,
      category: entry.category,
      hint: hints.get(entry.id) || '',
      keywords: entry.keywords,
      phrases: entry.phrases,
      root_wound: cluster?.root_wound || null,
      chakras: cluster?.chakras || [],
      way_out: null, // Would need to be added manually
      triggers: triggerMap,
      severity_thresholds: { low: 0.3, medium: 0.5, high: 0.7 },
      is_active: true,
    };
  });

  console.log(`\nPreparing to insert ${loops.length} loops...`);

  // Batch insert (Supabase has a limit, so we'll batch)
  const batchSize = 100;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < loops.length; i += batchSize) {
    const batch = loops.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('loops_catalog')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`Batch ${i / batchSize + 1} error:`, error.message);
      errors += batch.length;
    } else {
      inserted += batch.length;
      console.log(`Batch ${i / batchSize + 1}: inserted ${batch.length} loops`);
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Errors: ${errors}`);
}

// Run
seedLoopsCatalog().catch(console.error);