import re, os
from collections import defaultdict, deque

mig_dir = 'D:/final/sat-yug/supabase/migrations'

# Find all tables referenced in code
code_tables = set()
for root in ['src', 'supabase/functions']:
    base = os.path.join('D:/final/sat-yug', root)
    for dirpath, dirnames, filenames in os.walk(base):
        for f in filenames:
            if f.endswith(('.ts', '.tsx')):
                path = os.path.join(dirpath, f)
                with open(path, 'r', encoding='utf-8') as fh:
                    content = fh.read()
                    matches = re.findall(r'\.from\([\'"]([^\'"]+)[\'"]\)', content)
                    code_tables.update(m.lower() for m in matches)

print(f"Tables in code: {len(code_tables)}")

# Parse migration files
all_table_blocks = {}
all_policies = []
all_indexes = []
all_triggers = []
all_grants = []
all_functions = []
all_extensions = set()

for f in sorted(os.listdir(mig_dir)):
    if not f.endswith('.sql'):
        continue
    p = os.path.join(mig_dir, f)
    with open(p, 'r', encoding='utf-8') as fh:
        text = fh.read()
    
    # Extract extensions
    for m in re.finditer(r'CREATE EXTENSION IF NOT EXISTS (\w+)', text):
        all_extensions.add(m.group(1))
    
    # Extract only basic helper functions - skip complex ones that reference tables
    # Basic functions: update_updated_at_column, touch_updated_at
    basic_functions = {
        'public.update_updated_at_column': """CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;""",
        'public.touch_updated_at': """CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;"""
    }
    
    for func_name, func_text in basic_functions.items():
        all_functions.append((func_name, func_text))
    
    # Extract table blocks - add IF NOT EXISTS to all tables
    for m in re.finditer(r'(?i)(CREATE\s+TABLE\s+)(public\.(\w+)\s*\()', text):
        full_match = m.group(0)
        table_name = m.group(3).lower()
        start = m.start()
        
        depth = 0
        for i in range(start, len(text)):
            if text[i] == '(':
                depth += 1
            elif text[i] == ')':
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        
        stmt_end = text.find(';', end)
        if stmt_end == -1:
            stmt_end = len(text)
        else:
            stmt_end += 1
        
        block = text[start:stmt_end]
        
        # Ensure IF NOT EXISTS is present
        if not re.search(r'CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS', block, re.IGNORECASE):
            block = re.sub(r'CREATE\s+TABLE\s+', 'CREATE TABLE IF NOT EXISTS ', block, count=1, flags=re.IGNORECASE)
        
        if table_name not in all_table_blocks:
            all_table_blocks[table_name] = []
        all_table_blocks[table_name].append((f, block))
    
    # Extract policies
    for m in re.finditer(r'(?i)DROP POLICY IF EXISTS .*?;\s*CREATE POLICY .*?;', text, re.DOTALL):
        policy_text = m.group(0)
        policy_name = re.search(r'CREATE POLICY\s+([^\s]+)', policy_text, re.IGNORECASE)
        if policy_name:
            all_policies.append((policy_name.group(1), policy_text))
    
    # Extract indexes - add IF NOT EXISTS
    for m in re.finditer(r'(?i)CREATE(?:\s+UNIQUE)?\s+INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?\S+\s+ON\s+public\.\w+.*?;', text):
        idx_text = m.group(0)
        if not re.search(r'CREATE\s+(?:UNIQUE\s+)?INDEX\s+IF\s+NOT\s+EXISTS', idx_text, re.IGNORECASE):
            idx_text = re.sub(r'CREATE\s+(UNIQUE\s+)?INDEX\s+', r'CREATE \1INDEX IF NOT EXISTS ', idx_text, count=1, flags=re.IGNORECASE)
        all_indexes.append(idx_text)
    
    # Extract triggers
    for m in re.finditer(r'(?i)CREATE(?:\s+OR\s+REPLACE)?\s+TRIGGER\s+\S+\s+.*?EXECUTE\s+FUNCTION\s+\S+;', text, re.DOTALL):
        all_triggers.append(m.group(0))
    
    # Extract grants
    for m in re.finditer(r'(?i)GRANT\s+.*?ON\s+.*?TO\s+.*?;', text):
        grant_text = m.group(0)
        all_grants.append(grant_text)

# Deduplicate
all_functions = list(dict(all_functions).items())
all_policies = list(dict(all_policies).items())
all_indexes = list(dict.fromkeys(all_indexes))
all_triggers = list(dict.fromkeys(all_triggers))
all_grants = list(dict.fromkeys(all_grants))

# Filter to code tables
filtered_tables = {t: blocks for t, blocks in all_table_blocks.items() if t in code_tables}

# Build dependency order
def extract_fks(create_table_text):
    fks = set()
    for m in re.finditer(r'REFERENCES\s+public\.(\w+)', create_table_text, re.IGNORECASE):
        fks.add(m.group(1).lower())
    return fks

table_deps = {}
for t, sources in filtered_tables.items():
    first_source = sources[0][1]
    table_deps[t] = extract_fks(first_source)

in_degree = defaultdict(int)
graph = defaultdict(list)
all_tables = set(table_deps.keys())

for t, deps in table_deps.items():
    for dep in deps:
        if dep in all_tables:
            graph[dep].append(t)
            in_degree[t] += 1

queue = deque([t for t in all_tables if in_degree[t] == 0])
sorted_tables = []
while queue:
    t = queue.popleft()
    sorted_tables.append(t)
    for neighbor in graph[t]:
        in_degree[neighbor] -= 1
        if in_degree[neighbor] == 0:
            queue.append(neighbor)

for t in sorted(all_tables):
    if t not in sorted_tables:
        sorted_tables.append(t)

# Write migration
out_path = 'D:/final/sat-yug/supabase/migrations/20260926000003_recreate_all_missing_tables.sql'

with open(out_path, 'w', encoding='utf-8') as out:
    out.write('-- ============================================================\n')
    out.write('-- Migration: 20260926000003_recreate_all_missing_tables.sql\n')
    out.write('-- Purpose: Recreate all tables + policies/indexes/triggers/grants\n')
    out.write('-- ============================================================\n\n')
    
    out.write('-- ============================================================\n')
    out.write('-- EXTENSIONS\n')
    out.write('-- ============================================================\n')
    for ext in sorted(all_extensions):
        out.write(f'CREATE EXTENSION IF NOT EXISTS {ext};\n')
    out.write('\n')
    
    out.write('-- ============================================================\n')
    out.write('-- HELPER FUNCTIONS\n')
    out.write('-- ============================================================\n')
    for func_name, func_text in all_functions:
        out.write(func_text)
        out.write('\n\n')
    
    out.write('-- ============================================================\n')
    out.write('-- TABLE DEFINITIONS\n')
    out.write('-- ============================================================\n\n')
    
    table_counter = 0
    for t in sorted_tables:
        table_counter += 1
        sources = filtered_tables[t]
        source_file, block = sources[0]
        out.write(f'-- {table_counter}. {t} (source: {source_file})\n')
        out.write(block)
        out.write('\n\n')
    
    out.write('-- ============================================================\n')
    out.write('-- INDEXES, TRIGGERS, POLICIES, AND GRANTS\n')
    out.write('-- ============================================================\n\n')
    
    out.write('-- NOTE: Indexes, triggers, policies, and grants are skipped\n')
    out.write('-- because they may reference columns/tables with different schemas\n')
    out.write('-- in the remote database. Apply them manually if needed.\n')

print('Migration regenerated successfully')
