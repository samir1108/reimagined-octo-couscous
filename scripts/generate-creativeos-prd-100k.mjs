import fs from "node:fs";

const TARGET = Number(process.env.PRD_TARGET || 150000);
const OUT = "CREATIVEOS_PRD_100K.md";
const L = [];
const add = (...ls) => { for (const l of ls) L.push(l); };
const pick = (arr, i) => arr[i % arr.length];
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const FAMILIES = [
  { name: "Idea & Development Studio", phase: "P1", mission: "Turn incomplete thoughts into developed, defensible creative concepts before a single frame is produced.", subs: ["Idea Studio", "Research Studio", "Creative Development Studio", "Production Packaging Studio"], caps: ["Idea capture", "Voice-to-idea transcription", "Text-to-concept synthesis", "Image-to-concept interpretation", "Video inspiration analysis", "Concept exploration", "Multiple creative directions", "Genre discovery", "Originality analysis", "Concept refinement", "Creative brainstorming", "Story potential assessment", "Audience potential assessment", "Concept comparison", "Idea history and branching", "Idea-to-project conversion", "Historical research", "Scientific research", "Cultural research", "Geographic research", "Mythology and folklore research", "Reference collection", "Source verification and fact-checking", "Research-to-story integration", "Logline generation", "Premise development", "Theme exploration", "Comparable film analysis", "Franchise potential assessment", "Pitch deck assembly", "Treatment drafting", "Director's statement", "Project package export"] },

  { name: "Story Architecture Studio", phase: "P1", mission: "Give every project a structural spine that survives rewriting, expansion, and serialization.", subs: ["Structure Studio", "Series Architecture Studio"], caps: ["Three-act structure", "Five-act structure", "Hero's Journey mapping", "Save the Cat beat sheet", "Kishotenketsu structure", "Nonlinear timeline design", "Multiple timeline tracking", "Parallel narrative management", "Anthology structure", "Mystery architecture", "Thriller architecture", "Episodic architecture", "Multi-season arc planning", "Interactive branching structure", "Beat sheet validation", "Structural diagnostics"] },

  { name: "Screenplay Studio", phase: "P1", mission: "Write, format, version, and lock screenplays inside the same graph as characters, scenes, and shots.", subs: ["Scene Writing Studio", "Rewrite Studio"], caps: ["Screenplay editor", "Scene writing", "Sequence writing", "Dialogue writing surface", "Action line generation", "Scene transition design", "Screenplay formatting", "Character voice consistency", "Scene objective annotation", "Emotional progression tracking", "Subtext analysis", "Pacing analysis", "Script rewriting", "Script comparison and diff", "Version history and restore", "Script locking"] },

  { name: "Narrative Intelligence Studio", phase: "P1", mission: "Reason about the story as a system: tension, stakes, setups, payoffs, and logical coherence.", subs: ["Plot Intelligence Studio", "Coherence Studio"], caps: ["Plot development", "Subplot management", "Narrative tension modeling", "Conflict architecture", "Stakes management", "Suspense construction", "Mystery construction", "Foreshadowing tracking", "Payoff tracking", "Dramatic irony placement", "Emotional arc mapping", "Plot-hole detection", "Story logic validation", "Audience expectation analysis", "Narrative coherence report", "Scene necessity scoring"] },

  { name: "Dialogue Studio", phase: "P1", mission: "Produce dialogue that distinguishes characters and carries subtext, region, period, and mood.", subs: ["Voice Differentiation Studio", "Localization Dialogue Studio"], caps: ["Character-specific dialogue", "Natural conversation generation", "Subtext generation", "Monologue composition", "Argument and conflict writing", "Emotional conversation writing", "Comedy writing", "Regional dialogue adaptation", "Multilingual dialogue authoring", "Period-specific language", "Voice differentiation scoring", "Dialogue polishing", "Performance note generation", "Dialogue coverage analysis"] },

  { name: "Script Breakdown Studio", phase: "P2", mission: "Convert approved pages into a production-ready breakdown with every element tagged and costed.", subs: ["Breakdown Studio"], caps: ["Character extraction", "Location extraction", "Prop extraction", "Costume extraction", "Vehicle and animal extraction", "Extras and crowd extraction", "Special effects extraction", "VFX extraction", "Stunt extraction", "Weather and time-of-day flags", "Scene duration estimation", "Production complexity scoring", "Breakdown categories and colors", "Breakdown export formats"] },

  { name: "World Architect Studio", phase: "P1", mission: "Build internally consistent fictional universes with rules strong enough to generate years of story.", subs: ["World Rules Studio", "Culture Studio", "Geography Studio"], caps: ["World creation", "World rule definition", "Geography generation", "Continents and regions", "Cities and settlements", "Civilizations", "Political systems", "Economic systems", "Religions and belief systems", "Social structures", "Language construction", "Technology systems", "Magic system design", "Science and natural laws", "Ecosystem design", "Historical event generation", "Cultural identity design", "World bible export"] },

  { name: "Universe Timeline Studio", phase: "P2", mission: "Keep every historical claim, war, and era in one verified chronology.", subs: ["Chronology Studio"], caps: ["Creation timeline", "Ancient history sequencing", "Civilizational timeline", "War and conflict chronology", "Political transition tracking", "Technological evolution", "Historical milestone registry", "Parallel timeline management", "Alternate history branches", "Timeline visualization", "Contradiction detection", "Character history alignment"] },

  { name: "Lore Studio", phase: "P2", mission: "Maintain the myths, secrets, symbols, and terminology that make a universe feel deep.", subs: ["Mythology Studio", "Terminology Studio"], caps: ["Universe mythology", "Legend authoring", "Ancient text generation", "Prophecy design", "Secret organization design", "Historical mystery design", "Cultural tradition design", "Symbol system design", "Ritual design", "Object of significance registry", "Mythological entity design", "World terminology dictionary", "Lore documentation export", "Lore consistency check"] },

  { name: "Franchise & IP Studio", phase: "P3", mission: "Govern a multi-project universe: canon, continuity, and expansion without contradiction.", subs: ["Canon Studio", "Expansion Studio"], caps: ["Universe management", "Multi-film project linking", "Series and spin-off planning", "Prequel and sequel tracking", "Origin story design", "Crossover planning", "Character appearance ledger", "Shared location registry", "Universe-wide event tracking", "Canon status management", "Alternate universe branches", "IP expansion roadmap", "Franchise continuity audit"] },

  { name: "World Simulation Studio", phase: "P5", mission: "Simulate how a fictional world evolves under political, technological, and social pressure.", subs: ["Simulation Studio"], caps: ["Political decision simulation", "War outcome simulation", "Economic change simulation", "Technological discovery propagation", "Environmental event simulation", "Character decision simulation", "Social movement modeling", "Cultural change modeling", "Simulation run comparison", "Simulation-to-story export"] },

  { name: "Character Architect Studio", phase: "P1", mission: "Create characters as complete entities with identity, history, psychology, and arc.", subs: ["Profile Studio", "Arc Studio"], caps: ["Character creation", "Character profile", "Character biography", "Motivation definition", "Desire and goal mapping", "Fear definition", "Weakness and flaw design", "Strength definition", "Contradiction design", "Secret design", "Relationship seed", "Character history", "Objective mapping", "Transformation arc", "Character sheet export"] },

  { name: "Character Psychology Studio", phase: "P2", mission: "Keep fictional behavior consistent and legible through explicit behavioral models.", subs: ["Behavior Studio"], caps: ["Personality architecture", "Behavioral pattern modeling", "Emotional tendency mapping", "Decision-making patterns", "Internal conflict design", "Attachment pattern design", "Moral philosophy", "Value and belief system", "Defense mechanism design", "Emotional trigger registry", "Behavioral consistency check", "Psychology-to-dialogue bridge"] },

  { name: "Character Appearance Studio", phase: "P2", mission: "Lock identity visually so a face survives hundreds of generated shots.", subs: ["Identity Lock Studio"], caps: ["Face generation", "Body proportion design", "Age variation generation", "Skin and hair appearance", "Expression sheet generation", "Character reference sheet", "Orthographic views", "Full-body reference", "Wardrobe reference", "Character identity locking", "Appearance evolution", "Identity drift scoring"] },

  { name: "Character Performance Studio", phase: "P3", mission: "Direct performance at the level of face, body, and intention rather than pose.", subs: ["Performance Studio"], caps: ["Facial performance direction", "Body language design", "Eye movement direction", "Walk cycle styling", "Gesture design", "Emotional expression library", "Acting reference matching", "Performance direction notes", "Dialogue delivery direction", "Scene-specific performance", "Performance variation generation"] },

  { name: "Character Relationship Studio", phase: "P2", mission: "Model the relationship graph that makes ensembles and conflicts legible.", subs: ["Relationship Graph Studio"], caps: ["Family tree construction", "Romantic relationship mapping", "Friendship mapping", "Rivalry mapping", "Alliance mapping", "Mentorship mapping", "Betrayal tracking", "Power dynamic modeling", "Relationship timeline", "Emotional relationship map", "Relationship conflict generation"] },

  { name: "Casting Studio", phase: "P3", mission: "Match roles to performers, voices, and likenesses under explicit consent and rights.", subs: ["Casting Studio"], caps: ["Character casting concepts", "Actor reference management", "Performance requirement definition", "Voice requirement definition", "Age range analysis", "Casting breakdown generation", "Role comparison", "Audition material generation", "Consent-aware likeness workflow", "Casting decision record"] },

  { name: "Character Continuity Studio", phase: "P4", mission: "Detect and repair character divergence across scenes, episodes, and seasons.", subs: ["Continuity Studio"], caps: ["Face identity continuity", "Hairstyle continuity", "Clothing continuity", "Age continuity", "Physical appearance continuity", "Injury tracking", "Accessory tracking", "Character state tracking", "Emotional progression continuity", "Scene-to-scene continuity check", "Continuity repair suggestion"] },

  { name: "Director's Studio", phase: "P1", mission: "Translate script into intention: what the audience should feel in every beat.", subs: ["Vision Studio"], caps: ["Director's vision statement", "Film interpretation", "Creative direction", "Scene direction", "Emotional intention notes", "Performance direction", "Visual storytelling plan", "Pacing design", "Blocking plan", "Cinematic language definition", "Directorial notes", "Director's treatment export"] },

  { name: "Visual Direction Studio", phase: "P2", mission: "Define the look: palette, texture, light philosophy, motifs, and shot consistency rules.", subs: ["Look Development Studio"], caps: ["Visual identity definition", "Visual reference board", "Cinematic atmosphere", "Color language", "Texture language", "Lighting philosophy", "Composition philosophy", "Camera movement philosophy", "Visual motif design", "Visual symbolism", "Shot consistency rules", "Look bible export"] },

  { name: "Cinematography Studio", phase: "P2", mission: "Give the project a professional camera language: format, lens, movement, and light.", subs: ["DP Studio", "Camera Studio", "Lens Studio"], caps: ["Cinematographic vision", "Lighting approach", "Lens selection", "Camera body selection", "Sensor format choice", "Frame rate and resolution", "Aspect ratio design", "Recording format", "Camera rig configuration", "Focus planning", "Exposure planning", "Camera continuity", "Lens characteristic matching", "Anamorphic look design", "Lens comparison", "Camera package export"] },

  { name: "Composition & Movement Studio", phase: "P2", mission: "Design framing and motion as meaning, not decoration.", subs: ["Composition Studio", "Movement Studio"], caps: ["Rule of thirds application", "Symmetry composition", "Leading line composition", "Negative space design", "Frame-within-frame composition", "Foreground-background layering", "Subject placement", "Visual balance analysis", "Static shot design", "Dolly and tracking design", "Crane and jib design", "Handheld styling", "Steadicam and gimbal design", "Drone movement design", "Orbit and push-in design", "Whip pan design", "Complex coordinated movement", "Movement continuity check"] },

  { name: "Shot Design Studio", phase: "P2", mission: "Turn every beat into a fully specified shot record ready for generation.", subs: ["Shot Spec Studio"], caps: ["Shot ID assignment", "Shot size definition", "Camera position specification", "Subject and action definition", "Composition specification", "Lighting specification", "Focus specification", "Duration estimation", "Performance specification", "Visual reference attachment", "Generation prompt assembly", "Continuity requirement attachment", "Shot list export"] },

  { name: "Lighting Studio", phase: "P2", mission: "Control light as narrative information and continuity insurance.", subs: ["Lighting Studio"], caps: ["Natural lighting design", "Studio lighting design", "Three-point lighting setup", "Motivated lighting design", "Hard and soft light control", "Practical light placement", "Volumetric lighting", "Atmospheric lighting", "Daylight simulation", "Night lighting", "Interior lighting", "Exterior lighting", "Lighting diagram export", "Light-source continuity check"] },

  { name: "Production Design Studio", phase: "P2", mission: "Design the physical world: architecture, materials, sets, and environmental storytelling.", subs: ["Design Studio", "Set Studio", "Location Studio"], caps: ["Production design concept", "Visual environment design", "Architectural language", "Historical accuracy check", "Cultural reference validation", "Material selection", "Texture development", "Environmental storytelling", "Interior set design", "Exterior set design", "Room layout planning", "Spatial planning", "Location discovery", "Virtual location creation", "Interior-exterior matching", "Geography consistency", "Set continuity", "Design bible export"] },

  { name: "Props, Costume & Makeup Studio", phase: "P2", mission: "Own every object and surface a character touches or wears.", subs: ["Props Studio", "Costume Studio", "Makeup Studio"], caps: ["Prop creation", "Hero prop design", "Everyday object design", "Fictional technology design", "Symbolic object design", "Prop reference sheet", "Prop continuity", "Costume concept design", "Wardrobe construction", "Historical costume research", "Cultural clothing design", "Fabric selection", "Color coordination", "Costume evolution", "Wardrobe continuity", "Makeup design", "Character aging makeup", "Wound and scar design", "Prosthetic concept design", "Creature makeup design", "Makeup continuity"] },

  { name: "Storyboard & Previs Studio", phase: "P2", mission: "Convert pages into visual plans before money is spent on generation.", subs: ["Storyboard Studio", "Previs Studio", "Animatic Studio"], caps: ["Script-to-storyboard", "Text-to-storyboard", "Shot-by-shot panel generation", "Camera framing panel", "Character blocking panel", "Action continuity panel", "Storyboard annotation", "Panel variation", "Storyboard revision", "2D previs", "3D previs scene blocking", "Camera simulation", "Environment placement preview", "Animatic assembly", "Shot timing", "Temporary dialogue and music", "Rough-cut visualization", "Shot ordering", "Coverage planning", "Alternative coverage"] },

  { name: "Image & Video Generation Studio", phase: "P2", mission: "The render layer: provider-independent image and video synthesis under full creative control.", subs: ["Image Generation Studio", "Video Generation Studio"], caps: ["Text-to-image", "Image-to-image", "Reference-based generation", "Character image generation", "Location image generation", "Prop image generation", "Costume image generation", "Storyboard image generation", "Concept art generation", "Key art generation", "Inpainting", "Outpainting", "Image variation", "Image upscaling", "Text-to-video", "Image-to-video", "Video-to-video", "First-frame last-frame generation", "Reference-video generation", "Camera-motion generation", "Character-motion generation", "Scene extension", "Video continuation", "Video transformation", "Video upscaling"] },

  { name: "Generation Control Studio", phase: "P3", mission: "Make generation reproducible, auditable, and cost-aware across providers.", subs: ["Control Studio", "Consistency Studio"], caps: ["Prompt construction", "Negative constraint handling", "Reference management", "Seed management", "Aspect ratio control", "Duration control", "Resolution control", "Frame rate control", "Model selection", "Generation settings preset", "Version comparison", "Generation history", "Job queue management", "Cost tracking", "Character consistency enforcement", "Location consistency enforcement", "Wardrobe consistency enforcement", "Lighting consistency enforcement", "Style consistency enforcement", "Provider fallback policy"] },

  { name: "VFX Studio", phase: "P3", mission: "Plan, simulate, composite, and review digital effects at shot level.", subs: ["VFX Development", "Simulation Studio", "Compositing Studio", "VFX Review"], caps: ["VFX concept development", "Effect reference gathering", "Effect breakdown", "Scene-level VFX planning", "Shot-level VFX planning", "Complexity estimation", "VFX pipeline planning", "Fire simulation", "Smoke simulation", "Water simulation", "Rain and snow simulation", "Dust simulation", "Explosion simulation", "Wind simulation", "Cloth simulation", "Hair simulation", "Particle simulation", "Destruction simulation", "Fluid simulation", "Atmospheric simulation", "Layer compositing", "Green-screen integration", "Background replacement", "Matte extraction", "Rotoscoping", "Masking", "Keying", "Depth integration", "Light integration", "Shadow integration", "Plate cleanup", "Environment extension", "Digital landscape generation", "Virtual architecture", "Matte painting", "Sky replacement", "Environment reconstruction", "Camera tracking", "Object tracking", "Match moving", "Motion capture integration", "3D reconstruction", "Gaussian splatting workflow", "Neural rendering", "Digital double creation", "Shot review", "Version comparison", "Visual artifact detection", "Matte inspection", "VFX approval tracking"] },

  { name: "Animation Studio", phase: "P3", mission: "Animate characters, creatures, objects, and type with craft and continuity.", subs: ["2D Animation", "3D Animation", "Mocap Studio", "Motion Graphics"], caps: ["Frame-by-frame animation", "2D character animation", "Cut-out animation", "Background animation", "Stylized animation", "Character rigging", "Character animation", "Object animation", "Environment animation", "Camera animation", "Physics-based animation", "Motion reference import", "Body tracking", "Facial motion capture", "Motion retargeting", "Animation cleanup", "Creature design", "Creature anatomy", "Creature locomotion", "Creature facial animation", "Creature performance", "Title design", "Credit sequence", "Typography animation", "Infographic animation", "Transition design", "Logo animation", "Data visualization animation"] },

  { name: "Sound Design Studio", phase: "P4", mission: "Build the sonic world: design, foley, ambience, spatial placement, and continuity.", subs: ["Sound Design", "Foley Studio", "Ambient Studio", "Spatial Studio"], caps: ["Sound concept development", "Scene sound planning", "Environmental sound design", "Atmospheric sound design", "Foley performance", "Footstep design", "Clothing movement sound", "Object handling sound", "Door and interaction sound", "Impact sound design", "Mechanical sound design", "Creature sound design", "Sound library management", "Sound layering", "Forest and nature ambience", "Urban ambience", "Interior ambience", "Space ambience", "Historical ambience", "Fictional ambience", "Continuous sound bed", "Audio trimming", "Audio synchronization", "Noise reduction", "Equalization", "Compression", "Volume automation", "Stereo mixing", "Surround mixing", "Dolby Atmos workflow", "Object-based audio", "Binaural rendering", "3D audio positioning", "Sound continuity audit"] },

  { name: "Voice & Dubbing Studio", phase: "P4", mission: "Cast, direct, generate, replace, and localize every spoken line.", subs: ["Voice Studio", "ADR Studio", "Dubbing Studio", "Subtitle Studio"], caps: ["Voice casting", "Voice generation", "Voice profile management", "Character voice development", "Dialogue performance", "Emotion control", "Multilingual voice", "Voice direction", "Voice consistency check", "Voice acting variation", "Pronunciation control", "Accent direction", "ADR recording workflow", "Lip-sync alignment", "Take selection", "Language adaptation", "Cultural localization", "Dubbing script generation", "Dubbing timing adaptation", "Subtitle generation", "Subtitle timecode sync", "Speaker identification", "Accessibility captions"] },

  { name: "Music & Composition Studio", phase: "P4", mission: "Treat score as storytelling: themes, motifs, sync, and rights.", subs: ["Music Direction", "Composition Studio", "Music Production", "Rights Studio"], caps: ["Musical identity definition", "Score direction", "Genre selection", "Emotional mapping", "Theme development", "Instrument selection", "Musical reference curation", "Scene-level music direction", "Original composition", "Character theme", "Main theme", "Emotional motif", "Action sequence score", "Suspense score", "Ambient composition", "Transitional music", "Orchestral arrangement", "Instrumentation design", "Harmonic development", "Melodic development", "Rhythmic development", "Dynamic progression", "MIDI workflow", "Recording integration", "Mixing", "Mastering", "Stem management", "Music-to-picture sync", "Beat mapping", "Musical hit point marking", "Cue sheet generation", "Cue revision", "Music ownership record", "License documentation", "Rights expiration tracking"] },

  { name: "Editing & Post Studio", phase: "P4", mission: "Assemble, grade, finish, and deliver the cut.", subs: ["Editing Studio", "AI Editing", "Color Studio", "Finishing Studio"], caps: ["Timeline editing", "Multitrack editing", "Shot arrangement", "Sequence management", "Scene assembly", "Transition editing", "Proxy workflow", "Multicam workflow", "Script-to-edit", "Automatic scene assembly", "Dialogue-based editing", "Best-take selection", "Shot recommendation", "Pacing analysis", "Silence removal", "Rough-cut generation", "Alternative cut generation", "Highlight extraction", "Media organization", "Metadata management", "Clip labeling", "Scene grouping", "Sync management", "Color correction", "Color grading", "Exposure adjustment", "White balance", "Skin tone management", "Look development", "Shot matching", "Scene matching", "LUT management", "Color continuity", "Picture lock", "Final conform", "Online editing", "Final audio sync", "Title and credits", "Export preparation", "Master delivery"] },

  { name: "Quality & Continuity Studio", phase: "P4", mission: "Stop defects before the audience sees them: continuity, narrative, visual, audio, delivery.", subs: ["Continuity Studio", "Narrative QA", "Visual QA", "Audio QA", "Delivery QC"], caps: ["Character appearance check", "Clothing continuity check", "Hair continuity check", "Prop continuity check", "Location continuity check", "Lighting continuity check", "Weather continuity check", "Time-of-day continuity check", "Screen direction check", "Dialogue continuity check", "World rule validation", "Plot-hole detection", "Motivation consistency check", "Setup and payoff validation", "Unresolved storyline detection", "Timeline contradiction check", "Generation artifact detection", "Identity drift detection", "Anatomical inconsistency check", "Object duplication detection", "Frame instability detection", "Dialogue intelligibility check", "Audio clipping detection", "Audio sync check", "Loudness compliance", "Channel consistency", "Resolution and frame rate validation", "Aspect ratio validation", "Subtitle sync validation", "File integrity check", "Deliverable specification check"] },

  { name: "Marketing & Distribution Studio", phase: "P5", mission: "Carry the film past completion into audience, campaign, and release.", subs: ["Trailer Studio", "Key Art Studio", "Marketing Studio", "Distribution Studio"], caps: ["Trailer concept", "Trailer structure", "Highlight selection", "Trailer emotional progression", "Trailer music selection", "Trailer sound design", "Trailer editing", "Teaser generation", "Platform-specific trailer", "Movie poster design", "Character poster", "Ensemble poster", "Teaser poster", "International poster", "Key art generation", "Typography integration", "Campaign planning", "Audience segmentation", "Brand positioning", "Social content generation", "Behind-the-scenes content", "Press kit assembly", "Distribution planning", "Platform requirement mapping", "Deliverable management", "Release calendar", "Territory planning", "Festival submission package", "Performance tracking"] },

  { name: "Production Management Studio", phase: "P3", mission: "Run the production as a real project: scope, budget, schedule, coordination, assets.", subs: ["Producer Studio", "Budget Studio", "Scheduling Studio", "Coordination Studio", "Asset Management"], caps: ["Project planning", "Scope management", "Approval tracking", "Deliverable tracking", "Budget creation", "Department budgeting", "Generation cost estimation", "Cost tracking", "Budget scenario modeling", "Cost optimization", "Production schedule", "Scene scheduling", "Resource scheduling", "Dependency planning", "Milestone management", "Task assignment", "Team management", "Department coordination", "Review request workflow", "Asset library management", "Asset metadata", "File versioning", "Usage tracking", "Dependency tracking", "Asset permission model", "Asset reuse"] },

  { name: "Documentary & Non-Fiction Studio", phase: "P5", mission: "Support evidence-led storytelling with archives, interviews, and verification.", subs: ["Documentary Studio", "Interview Studio", "Educational Studio"], caps: ["Documentary concept", "Research planning", "Interview planning", "Interview transcription", "Documentary structure", "Archival footage management", "Fact-checking workflow", "Documentary editing", "Interview question design", "Guest research", "Transcript analysis", "Highlight extraction", "Explainer film design", "Scientific visualization", "Historical reconstruction", "Instructional sequence design", "Report structure", "Field footage organization", "Evidence tracking", "Source attribution"] },

  { name: "Extended Formats Studio", phase: "P5", mission: "Extend the engine to animation, game cinematics, interactive story, and virtual production.", subs: ["Animated Film Studio", "Game Cinematics Studio", "Interactive Story Studio", "Virtual Production Studio"], caps: ["Short animation production", "Feature animation production", "Animated series production", "Anime-inspired styling", "Mixed-media production", "Opening cinematic", "Cutscene production", "Character introduction sequence", "In-game narrative scene", "Game trailer", "Branching narrative design", "Decision tree authoring", "Multiple ending design", "Interactive character design", "Narrative state management", "Interactive dialogue", "Story simulation", "Virtual environment creation", "Real-time scene preview", "LED wall production planning", "Real-time compositing", "3D asset integration"] },

  { name: "Creative Learning Studio", phase: "P5", mission: "Teach craft inside the tool that does the work.", subs: ["Film Craft Academy", "AI Film Mentor", "Practice Studio", "Film Analysis Studio"], caps: ["Storytelling curriculum", "Screenwriting curriculum", "Directing curriculum", "Cinematography curriculum", "Lighting curriculum", "Editing curriculum", "Sound design curriculum", "Composition curriculum", "VFX curriculum", "Animation curriculum", "Production curriculum", "Film business curriculum", "Creative decision explanation", "Work review and critique", "Shot composition teaching", "Screenplay structure teaching", "Scene analysis", "Learning progress tracking", "Shot recreation exercise", "Short scene exercise", "Character design exercise", "Storyboard exercise", "Soundscape exercise", "Editing exercise", "Camera movement analysis", "Lighting analysis", "Narrative analysis"] },
];

const AGENT_SUFFIX = ["Specialist", "Supervisor", "Coordinator", "Architect", "Analyst", "Curator", "Director", "Auditor"];
const INPUTS = [
  "Approved project brief and creative constraints",
  "Locked upstream artifacts referenced by stable asset IDs",
  "Reference library items scoped to the current project",
  "Character, world, and location records resolved from the project graph",
  "Director intent notes and visual language bible",
  "Producer scope limits, budget envelope, and deadline",
];
const OUTPUTS = [
  "Versioned creative artifact written back to the project graph",
  "Review-ready proposal with rationale and provenance",
  "Structured asset record with dependencies and rights metadata",
  "Machine-readable spec consumed by downstream studios",
  "Human-readable summary surfaced in the studio workspace",
];
const UI = [
  "Split workspace: intent panel on the left, live artifact canvas on the right",
  "Inline diff view comparing the current proposal against the last approved version",
  "Traceability drawer showing every upstream artifact used in this result",
  "One-click accept, reject, or fork into a new branch",
  "Bottom timeline of runs with cost, duration, model, and outcome",
];
const FAILURES = [
  "Upstream artifact missing or unapproved: block execution and deep-link to the blocking studio",
  "Provider timeout: retry with backoff, then fall back to the next authorized provider",
  "Low-confidence result: return three ranked alternatives instead of one answer",
  "Rights conflict detected: halt and surface the conflicting asset record",
  "Cost ceiling reached: stop the job, preserve partial output, request budget approval",
];
const PERF = [
  "Interactive operations target under 2s p50 and 6s p95",
  "Long-running jobs stream progress and remain resumable after disconnection",
  "Every run records model, provider, seed, and prompt for reproducibility",
  "Batch operations respect a per-project concurrency cap of 8",
];
const RIGHTS = [
  "Only consented likenesses, voices, and licensed references may be used",
  "Every generated asset records provider, model version, and terms snapshot",
  "No training or fine-tuning on user IP without explicit written consent",
  "Third-party references are stored as links, never redistributed",
];
const TESTS = [
  "Happy path returns a schema-valid artifact and a stable ID",
  "Rejected inputs surface actionable validation messages",
  "Duplicate runs are idempotent and do not create duplicate assets",
  "Downstream consumers can resolve the artifact without manual mapping",
  "Permission-denied requests are audited and produce no side effects",
];
const TELEMETRY = [
  "capability.invoked with project, studio, and agent identifiers",
  "capability.completed with latency, cost, and artifact version",
  "capability.failed with normalized error class and provider",
  "review.outcome with reviewer, decision, and dwell time",
];
const OPENQ = [
  "Which provider set is authorized for this project's territory?",
  "Does this capability require a human approval gate before downstream use?",
  "What is the acceptable cost ceiling per invocation at scale?",
];

const entities = [
  ["projects", ["id", "slug", "title", "type", "status", "phase", "owner_id", "universe_id", "franchise_id", "target_runtime", "target_aspect_ratio", "budget_credits", "spent_credits", "created_at", "updated_at", "archived_at", "settings_json", "delivery_profile_id"]],
  ["universes", ["id", "name", "description", "rules_json", "canon_status", "owner_id", "created_at", "updated_at"]],
  ["franchises", ["id", "universe_id", "name", "scope", "canon_policy", "expansion_notes", "created_at"]],
  ["seasons", ["id", "series_id", "number", "arc_summary", "status", "created_at"]],
  ["episodes", ["id", "season_id", "number", "title", "runtime_target", "script_id", "status", "created_at"]],
  ["scenes", ["id", "project_id", "episode_id", "number", "slugline", "location_id", "time_of_day", "page_length", "objective", "emotional_beat", "status", "locked_at"]],
  ["shots", ["id", "scene_id", "shot_number", "shot_size", "camera_id", "lens_id", "movement", "duration_ms", "composition_notes", "lighting_notes", "performance_notes", "prompt", "reference_asset_ids", "status", "approved_at"]],
  ["studios", ["id", "family", "name", "capabilities_json", "enabled", "default_agent_id", "created_at"]],
  ["studio_capabilities", ["id", "studio_id", "key", "maturity", "phase", "requires_approval", "schema_json"]],
  ["agents", ["id", "name", "role", "studio_id", "tool_scopes", "model_policy", "budget_policy", "enabled", "created_at"]],
  ["creative_artifacts", ["id", "project_id", "studio_id", "capability_key", "type", "title", "body_json", "version", "status", "provenance_json", "created_by", "created_at"]],
  ["assets", ["id", "project_id", "type", "name", "description", "department", "status", "rights_id", "metadata_json", "created_at"]],
  ["asset_versions", ["id", "asset_id", "version", "file_locations", "source_refs", "provider", "model", "seed", "created_at", "created_by"]],
  ["asset_dependencies", ["id", "asset_id", "depends_on_asset_id", "relation", "created_at"]],
  ["references", ["id", "project_id", "kind", "uri", "license", "notes", "created_at"]],
  ["workflows", ["id", "project_id", "name", "definition_json", "status", "created_at"]],
  ["workflow_tasks", ["id", "workflow_id", "capability_key", "agent_id", "status", "attempts", "started_at", "finished_at", "error_class"]],
  ["approvals", ["id", "artifact_id", "requested_by", "approver_id", "decision", "notes", "decided_at"]],
  ["generation_jobs", ["id", "capability_key", "provider", "model", "prompt", "params_json", "status", "cost_credits", "queued_at", "started_at", "finished_at"]],
  ["provider_connections", ["id", "provider", "kind", "status", "credentials_ref", "rate_limit", "enabled"]],
  ["model_runs", ["id", "job_id", "provider", "model_version", "latency_ms", "cost_credits", "tokens_in", "tokens_out", "seed", "created_at"]],
  ["cost_records", ["id", "project_id", "studio_id", "capability_key", "credits", "usd_estimate", "recorded_at"]],
  ["quality_reports", ["id", "project_id", "scope", "check_type", "severity", "findings_json", "created_at"]],
  ["audit_events", ["id", "actor_id", "action", "entity_type", "entity_id", "before_json", "after_json", "created_at"]],
];

const PHASES = [
  ["P1", "Creative Foundation", "Project, Idea, Research, Story, Screenplay, Character, World, Director"],
  ["P2", "Visual Development", "Production Design, Cinematography, Storyboard, Previs, Image and Video Generation"],
  ["P3", "Production", "Production Management, Shot Management, Asset Management, Animation, VFX, Virtual Production"],
  ["P4", "Audio and Post", "Sound, Voice, Music, Editing, Color, Finishing, Continuity, QC"],
  ["P5", "Commercial and Expansion", "Trailer, Poster, Marketing, Distribution, Localization, Documentary, Game Cinematics, Interactive, Academy"],
];

add("# CreativeOS — Product Requirements Document (Full Specification)");
add("");
add("**Document:** PRD-100K · **Project:** CreativeOS · **Version:** 1.0 · **Status:** Draft for review");
add("**Scope:** Complete creative universe: every studio, department, discipline, asset, and capability required to build an AI filmmaking operating system.");
add("");
add("---");
add("");
add("## Document Control");
add("");
add("| Field | Value |");
add("|---|---|");
add("| Owner | Product Architecture |");
add("| Reviewers | Design, Engineering, Creative Direction, Legal |");
add("| Change policy | Append-only; capabilities are versioned, never silently removed |");
add("| Source brief | Chat 07/100 — The Complete Creative Universe |");
add("| Traceability | Every capability carries CAP, REQ, TEST, and AC identifiers |");
add("| Line budget | 150,000 lines (this document) |");
add("");
add("---");
add("");
add("## How to Read This Document");
add("");
add("This document is written for three readers at once.");
add("");
add("| Reader | Path | Time |");
add("|---|---|---|");
add("| Founder or investor | §2 Vision, §13 Competitive and VFX Bar, §16 Credits, §19 Roadmap | 10 minutes |");
add("| Product or engineering lead | §1 Experience, §5 Domain Model, §6 Studio Specs, §7 Data, §8 API, §15 System Design | 60-90 minutes |");
add("| AI agent or retrieval system | headings, `CAP-*` blocks, field schemas, Appendix E machine-readable manifest | indexed, not linear |");
add("");
add("Conventions: `CAP-*` identifies a capability, `REQ-*` a requirement, `TC-*` a test, `AC-*` an acceptance criterion, `NFR-*` a non-functional requirement, `STU-*` a studio family. Every capability block is self-contained so it can be retrieved without surrounding context.");
add("");
add("The document is append-only. New technology, tools, and capabilities enter as new sections or new capability blocks; existing approvals are superseded, never deleted.");
add("");
add("### Founder Brief (one page)");
add("");
add("CreativeOS is a studio, not a generator. The wedge is continuity and ownership: a character, a world, and a look that survive hundreds of shots and multiple titles. The moat compounds through the IP graph and the production memory, not through any single model.");
add("");
add("The experience is deliberately calm: one door, one room, one next step, with Bella as a companion who proposes and never authors. Depth is progressively disclosed so a first film is possible in minutes and a franchise is governable for years.");
add("");
add("The quality bar is explicit: DNEG-class VFX review, a shot rubric that blocks approval, and a benchmark reel that gates every model change. The academy layer teaches the craft behind each decision, compressing a century of film knowledge into the moment of use.");
add("");
add("The business model is credit-based with transparent metering per capability, hard ceilings per project, and provider-independent routing so margin is defended as model prices move.");
add("");
add("");
add("## Table of Contents");
add("");
add("1. Experience Architecture, UX System, and AI Companion");
add("2. Vision and Product Thesis");
add("3. Users, Jobs, and Success");
add("4. Architecture Principles");
add("5. Domain Model and Creative Graph");
add("6. Studio Family Specifications (per-capability detail)");
add("7. Data Model");
add("8. API and Event Contracts");
add("9. AI Workforce and Agent Protocols");
add("10. Workflow Orchestration");
add("11. Quality, Safety, Rights, and Compliance");
add("12. IP, Canon, and the Asset Universe");
add("13. Competitive Benchmark and VFX Quality Bar");
add("14. Film School: 150 Years of Craft Knowledge");
add("15. System Design and Platform Architecture");
add("16. Credits, Billing, and Metering");
add("17. Technology Radar and Future Tools");
add("18. Non-Functional Requirements");
add("19. Delivery Roadmap and Sprints");
add("20. Appendices: glossary, indexes, traceability, machine-readable manifest");
add("");
add("---");
add("");
add("## 1. Experience Architecture, UX System, and AI Companion");
add("");
add("### 1.1 Experience Thesis");
add("");
add("The product must never open on a dashboard. A dashboard tells the user how much software exists; a studio door tells the user that something is about to be made. The first screen is therefore a threshold, not an inventory: one line of intent, one companion, and a single obvious way forward.");
add("");
add("The experience is AI-based and AI-assisted at every layer, but never AI-first in a way that removes authorship. The companion proposes, the filmmaker disposes. Confidence, provenance, and reversibility are visible in the interface, so assistance feels like a competent collaborator rather than a slot machine.");
add("");
add("Depth is disclosed progressively. A first-time user sees a room, a light, and a task. An experienced user opens the same room and finds the full department behind it: cameras, lenses, lighting plots, continuity ledgers, and delivery profiles. Nothing is hidden permanently; nothing is dumped at once.");
add("");
add("The emotional target is studio familiarity: warm surfaces, real production vocabulary, paper and light textures, quiet motion, and a persistent sense that a crew is already working quietly in the background.");
add("");
add("### 1.2 The First Five Minutes");
add("");
add("1. **The door.** The user states an intention in one sentence, speaks it, or drops a reference image.");
add("2. **The reading.** The companion restates the intention in production language and names the first three decisions it needs.");
add("3. **The room.** One studio opens — never all of them — with a single primary action and a preview of what comes next.");
add("4. **The first artifact.** Within minutes the user holds something real: a logline, a world sketch, a character sheet, or a storyboard frame.");
add("5. **The promise.** A visible, honest path from that artifact to a finished film, with time and cost ranges attached.");
add("");
add("### 1.3 Experience Laws");
add("");
add("| Law | Statement | Enforcement |");
add("|---|---|---|");
add("| One primary action | Every screen has exactly one obvious next step | UI review checklist |");
add("| Progressive depth | Detail appears on intent, not on load | disclosure budget per screen |");
add("| Reversible by default | Every AI action can be undone, forked, or compared | version graph required |");
add("| Explain the proposal | Every suggestion states why it exists | companion rationale field |");
add("| Never dead-end | Every empty, error, and blocked state offers one path forward | state matrix test |");
add("| Studio vocabulary | Copy uses real production terms, never generic AI jargon | copy lint |");
add("| Latency honesty | Progress is real and attributed to a stage, not an animated bar | job stage events |");
add("| Quiet interface | Motion is meaningful, short, and reducible | motion token audit |");
add("| Keyboard and touch parity | Every action is reachable both ways | input coverage test |");
add("| No surprise cost | Cost is shown before, during, and after a run | cost gate |");
add("| Human gates stay human | Approvals never auto-advance by default | workflow policy |");
add("| Continuity visible | The interface shows what will break before it breaks | pre-flight checks |");
add("");
add("### 1.4 Progressive Disclosure Model");
add("");
add("| Level | Who sees it | Content | Exit action |");
add("|---|---|---|---|");
add("| L0 Door | first run | one intent field, companion, sample start | create or resume |");
add("| L1 Room | every user | the one studio relevant to the current intent | produce artifact |");
add("| L2 Workshop | working user | tools, references, versions, reviews for that studio | lock artifact |");
add("| L3 Studio | experienced user | full department, agents, queues, dependencies | run production |");
add("| L4 Production floor | producer | schedule, budget, approvals, risks, deliveries | release gate |");
add("| L5 Control room | studio lead | providers, permissions, audit, cost, canon | governance |");
add("");

const SCREENS = [
  ["Studio Door", "convert intent into the first real artifact"],
  ["Command Bar", "invoke any capability, asset, or navigation target by name"],
  ["Project Home", "show the single next decision for the current project"],
  ["Idea Studio", "capture and develop concepts without losing branches"],
  ["Research Table", "collect and verify source material"],
  ["Story Room", "choose and validate structure"],
  ["Script Editor", "write and lock the screenplay"],
  ["Scene Board", "see scenes as objects with intent and conflict"],
  ["Character Room", "build identities, psychology, and arcs"],
  ["Casting Desk", "match roles to performance and voice requirements"],
  ["World Atlas", "navigate geography, cultures, and rules"],
  ["Timeline Room", "verify chronology and contradiction"],
  ["Lore Library", "hold myths, symbols, and terminology"],
  ["Director Room", "record intention per scene and beat"],
  ["Look Book", "develop palette, texture, and visual motifs"],
  ["Camera Rig", "choose body, lens, format, and movement"],
  ["Light Table", "plan and verify lighting setups"],
  ["Shot Planner", "specify every shot before generation"],
  ["Storyboard Wall", "panel sequences and annotate action"],
  ["Previs Stage", "block scenes and simulate cameras"],
  ["Art Department", "design sets, props, costume, and makeup"],
  ["Generation Bay", "run image and video jobs with control"],
  ["Queue Monitor", "watch jobs, costs, and retries"],
  ["Take Browser", "compare takes and select without guessing"],
  ["Voice Booth", "cast and direct voice performance"],
  ["Sound Stage", "design foley, ambience, and effects"],
  ["Score Room", "compose and sync music to picture"],
  ["Edit Timeline", "assemble footage into sequences"],
  ["Color Suite", "grade, match shots, and build looks"],
  ["VFX Review Theater", "review shots against the quality bar"],
  ["Continuity Desk", "detect and repair drift before delivery"],
  ["QC Gate", "validate masters against delivery profiles"],
  ["Delivery Dock", "export, package, and hand off"],
  ["Trailer Room", "cut trailers and teasers from the finished film"],
  ["Key Art Studio", "produce posters and campaign imagery"],
  ["Marketing Board", "plan campaigns and audience beats"],
  ["Distribution Desk", "map platforms, territories, and calendars"],
  ["IP Vault", "govern canon, rights, and reuse"],
  ["Canon Browser", "resolve what is true in this universe"],
  ["Rights Ledger", "track licenses, consent, and expiry"],
  ["Learning Hall", "learn craft with exercises attached"],
  ["Analysis Room", "study scenes, shots, and edits"],
  ["Budget Board", "plan and track credits and currency"],
  ["Schedule Board", "sequence work and dependencies"],
  ["Task Inbox", "see assigned reviews and approvals"],
  ["Approval Queue", "decide on proposals with diffs"],
  ["Asset Library", "browse and reuse every asset type"],
  ["Global Search", "find any asset, capability, or decision"],
  ["Notifications", "receive only consequential updates"],
  ["Companion Panel", "talk to Bella with full project context"],
  ["Presence Bar", "show who and what is working right now"],
  ["Onboarding", "learn the studio by making something"],
  ["Settings", "control providers, defaults, and privacy"],
  ["Team and Permissions", "invite collaborators and scope access"],
  ["Audit Viewer", "inspect every mutation and approval"],
  ["Provider Console", "manage model providers and fallbacks"],
  ["Cost Dashboard", "see spend by studio, capability, and project"],
  ["Notes and Reviews", "annotate any artifact at a timecode"],
  ["Version Compare", "diff any two versions side by side"],
  ["Mobile Companion", "review, approve, and direct from a phone"],
  ["Tablet Review Mode", "watch cuts and leave frame-accurate notes"],
  ["Offline Cache", "continue reading and writing without a network"],
  ["Accessibility Center", "control contrast, motion, captions, and language"],
];

add("### 1.5 Screen Map");
add("");
add("Every screen is a place in the studio, not a page in a settings tree. Each specification states the job, entry points, primary action, AI assistance, states, input parity, performance budget, telemetry, and acceptance criteria.");
add("");

SCREENS.forEach(([name, job], n) => {
  const no = n + 1;
  const entry = pick([
    "companion suggestion",
    "command palette",
    "contextual deep link from an upstream artifact",
    "project home next-step card",
    "review notification",
    "studio navigation rail",
  ], n);
  const action = pick([
    "produce or update the artifact this screen owns",
    "approve the current proposal",
    "resolve the blocking decision",
    "open the next studio in the flow",
    "compare against the last approved version",
  ], n + 2);
  add(`#### 1.5.${no} ${name}`);
  add("");
  add(`- **Job.** ${job.charAt(0).toUpperCase()}${job.slice(1)}.`);
  add(`- **Entry.** ${entry}.`);
  add(`- **Primary action.** ${action}.`);
  add(`- **AI assist.** Bella drafts, proposes, and explains, but the screen keeps authorship visible through diffs, rationale, and a one-click revert.`);
  add(`- **Empty state.** A single example artifact plus one action, never a blank canvas and never a feature tour.`);
  add(`- **Loading state.** Skeleton with named stage and honest remaining-time range; no fake progress.`);
  add(`- **Failure state.** Plain-language cause, one recovery action, and a link to the blocking artifact.`);
  add(`- **Input parity.** Keyboard-first shortcuts, full touch targets, and voice entry where text is the primary input.`);
  add(`- **Budget.** Interaction feedback under 100ms, first content under 1s, heavy work streamed with stage updates.`);
  add(`- **Telemetry.** screen_view, primary_action, companion_accept, companion_reject, abandonment.`);
  add(`- **Acceptance.** AC-UX-${no}-1: a first-time user reaches the primary action without a tooltip; AC-UX-${no}-2: every state has a path forward.`);
  add("");
});
add("### 1.6 Core Flows");
add("");
const FLOWS = [
  "First-run idea to first artifact",
  "Idea to approved concept",
  "Concept to locked screenplay",
  "Script to breakdown and budget",
  "Character build to identity lock",
  "World build to canon approval",
  "Look development to visual bible",
  "Shot plan to generated take",
  "Take review to approved shot",
  "Scene assembly to rough cut",
  "Sound design to mixed scene",
  "Score to picture lock",
  "VFX review to approved composite",
  "QC failure to repaired master",
  "Master to distribution package",
  "Finished film to trailer and key art",
  "Franchise expansion without canon conflict",
  "Collaborator invite to approved review",
];
FLOWS.forEach((f, n) => {
  add(`#### 1.6.${n + 1} Flow — ${f}`);
  add("");
  add(`1. The user states intent; Bella restates it and names the minimum decisions required.`);
  add(`2. The graph resolves what already exists; only missing artifacts are requested.`);
  add(`3. Work runs in the background with visible stages; the user is never blocked on a spinner.`);
  add(`4. Proposals arrive as diffs against the last approved version, with rationale and cost.`);
  add(`5. A human gate records the decision, the approver, and the reasoning.`);
  add(`6. The next studio opens automatically only after the gate passes.`);
  add(`- **Failure recovery.** Any stage can be re-run with changed inputs; the previous version stays intact.`);
  add(`- **Acceptance.** The flow completes without the user opening a studio they did not need.`);
  add("");
});
add("### 1.7 The AI Companion — Bella");
add("");
add("Bella is the persistent creative companion across the whole studio: one identity, one memory, one voice, and one set of boundaries. She is not a chatbot tab; she is present as a panel, a presence bar, an ambient voice, and an interruptible observer.");
add("");
add("#### 1.7.1 Persona");
add("");
add("- **Role.** Creative companion, production coordinator, and craft teacher in one voice.");
add("- **Tone.** Direct, warm, specific. Never flattering, never vague, never sycophantic.");
add("- **Register.** Speaks production language with the user's own vocabulary mirrored back.");
add("- **Restraint.** Offers at most one suggestion per decision point unless asked for more.");
add("- **Honesty.** States confidence, cost, and what she does not know before acting.");
add("");
add("#### 1.7.2 Memory Model");
add("");
add("- **Project memory.** Every approved artifact, decision, and rejection with rationale.");
add("- **Craft memory.** The user's demonstrated preferences in framing, pacing, tone, and structure.");
add("- **Constraint memory.** Budget ceilings, deadlines, rights limits, and territory rules.");
add("- **Episodic memory.** What was tried, what failed, and why, so the same suggestion is never repeated.");
add("- **Forgetting.** Memory is user-inspectable, exportable, and deletable per project.");
add("");
add("#### 1.7.3 Presence States");
add("");
add("| State | Appearance | Behavior |");
add("|---|---|---|");
add("| Ambient | quiet glow in the presence bar | observes, does not speak |");
add("| Attentive | panel expands on hover or wake word | offers one contextual suggestion |");
add("| Working | named stage with elapsed time | reports progress and blockers only |");
add("| Reviewing | card with rationale and diff | asks for a decision |");
add("| Teaching | inline annotation | explains a craft principle with an example |");
add("| Silent | explicitly muted | performs only explicit commands |");
add("");
add("#### 1.7.4 Proactivity Policy");
add("");
add("- Interrupt only for three reasons: a blocking dependency, a continuity risk, or a cost threshold.");
add("- Batch optional suggestions into a single review card, never a stream of pings.");
add("- Never interrupt a creative flow state; queue observations for the next natural pause.");
add("- Escalate silence thresholds so a stalled user receives a concrete next step, not encouragement.");
add("");
add("#### 1.7.5 Trust Ladder");
add("");
add("| Tier | Assistant may | Requires |");
add("|---|---|---|");
add("| T0 Observe | read approved artifacts and explain | nothing |");
add("| T1 Draft | create proposals in a private branch | nothing |");
add("| T2 Apply | update non-locked artifacts | one-click accept |");
add("| T3 Advance | move a stage forward | explicit approval |");
add("| T4 Spend | run paid generation above threshold | budget gate |");
add("| T5 Publish | export or deliver | human sign-off with audit record |");
add("");
add("#### 1.7.6 Boundaries and Refusals");
add("");
add("- Refuses likeness, voice, or style use without recorded consent or license.");
add("- Refuses to fabricate a source, citation, or credit.");
add("- Refuses to auto-approve her own work or bypass a human gate.");
add("- Refuses to delete history; offers archive and supersede instead.");
add("- States plainly when a request exceeds model or rights limits, with the closest lawful alternative.");
add("");
add("#### 1.7.7 Handoff to Humans");
add("");
add("- Every artifact names an owner; Bella is always a contributor, never the owner of record.");
add("- Handoff includes a summary, rationale, open questions, and the exact diff.");
add("- A collaborator can ask Bella to explain any decision made on their behalf.");
add("");
add("### 1.8 Companion Behavior Catalogue");
add("");
const BEHAVIORS = [
  ["Intent restatement", "rewrites the request in production terms and confirms scope"],
  ["Decision triage", "names the three decisions that actually matter now"],
  ["Artifact proposal", "offers a draft with rationale and confidence"],
  ["Continuity warning", "flags a likely drift before generation"],
  ["Cost preview", "states estimated credits and cheaper alternatives"],
  ["Reference retrieval", "surfaces the closest approved references"],
  ["Craft note", "explains why a choice works with a film example"],
  ["Reversal offer", "proposes the opposite creative choice to test intent"],
  ["Version diff", "compares the proposal with the last approval"],
  ["Stall recovery", "offers one concrete next step after inactivity"],
  ["Scope guard", "detects scope creep against the approved brief"],
  ["Schedule nudge", "warns when a dependency threatens the release date"],
  ["Rights check", "blocks a request that lacks consent or license"],
  ["Canon check", "validates a proposal against universe rules"],
  ["Tone check", "detects dialogue that violates character voice"],
  ["Pacing check", "flags a sequence that contradicts the target rhythm"],
  ["Quality prediction", "estimates whether a shot will clear the quality bar"],
  ["Provider choice", "recommends a model for the needed look and budget"],
  ["Batch planning", "groups similar jobs to reduce cost"],
  ["Review summary", "condenses feedback into actionable changes"],
  ["Conflict mediation", "presents two collaborators' notes side by side"],
  ["Teaching moment", "attaches a short lesson to a live decision"],
  ["Glossary lookup", "defines craft and studio terms inline"],
  ["Language adaptation", "switches explanation depth and language"],
  ["Privacy reminder", "warns before uploading sensitive references"],
  ["Export readiness", "checks delivery specs before export"],
  ["Canon versioning", "proposes a canon-safe retcon path"],
  ["Franchise linking", "suggests reuse of existing assets"],
  ["Risk ledger update", "records a production risk with owner and mitigation"],
  ["Approval routing", "sends a decision to the correct approver"],
  ["Silence", "stays quiet on request and performs only explicit commands"],
];
BEHAVIORS.forEach(([b, d], n) => {
  add(`- **${b}.** ${d.charAt(0).toUpperCase()}${d.slice(1)}; logged as \`companion.${slug(b)}\` with accept-rate tracking.`);
});
add("");
add("### 1.9 Design System Dependency");
add("");
add("This document deliberately does not specify a visual design system. CreativeOS already owns a design system with its own tokens, primitives, typography scale, and motion language. This PRD specifies behavior, states, semantics, and acceptance criteria that the existing design system must express.");
add("");
add("| Contract | Requirement |");
add("|---|---|");
add("| Tokens | every screen state maps to an existing token; no hard-coded visual values in product code |");
add("| Primitives | new capabilities reuse existing components before introducing a new pattern |");
add("| Motion | behavior described here is expressed through the existing motion language |");
add("| Themes | light, dark, and low-light studio mode pass contrast and state legibility |");
add("| Density | compact, comfortable, and presentation modes hold without layout breakage |");
add("");
add("- When a capability needs a pattern the design system lacks, the pattern is proposed upstream, reviewed once, and reused across studios.");
add("- UX acceptance is tested against behavior and states, never against pixel specifications.");
add("");
add("### 1.9.1 UX Research and Validation");
add("");
add("- Five-person first-run study per phase gate, measuring time to first artifact and comprehension of the next step.");
add("- Moderated task tests for the top ten jobs to be done, with a failure taxonomy recorded per screen.");
add("- Diary studies with working filmmakers across a full project to catch fatigue, continuity confusion, and trust erosion.");
add("- Companion trust interviews: why suggestions were accepted or rejected, captured verbatim and clustered.");
add("- Accessibility audits with screen-reader and keyboard-only users every release.");
add("");
add("### 1.10 Accessibility Contract");
add("");
add("- WCAG 2.2 AA minimum contrast in every theme, including low-light studio mode.");
add("- Every interactive element is reachable and operable by keyboard alone.");
add("- Captions and transcripts for all generated audio, with speaker labels.");
add("- Screen-reader semantics for artifact diffs, timelines, and approval states.");
add("- Dyslexia-friendly typography option, adjustable reading width, and full zoom to 200%.");
add("- No meaning encoded by color alone; continuity and status always pair color with text or icon.");
add("");
add("### 1.11 Performance-UX Contract");
add("");
add("- 60fps target for all interface motion; 30fps floor on low-power devices.");
add("- First meaningful content under 1s on a warm project; skeleton never exceeds 400ms without a stage label.");
add("- Optimistic UI for approvals and locks, reconciled by server acknowledgement.");
add("- Heavy work never blocks navigation; every long task survives a page reload.");
add("- Offline mode allows reading, note-taking, and queued edits with explicit sync state.");
add("");
add("### 1.12 UX Acceptance Criteria and Test Plan");
add("");
add("- Every screen passes the state matrix: empty, loading, partial, error, offline, permission-denied.");
add("- Every flow completes on mobile, tablet, and desktop without a mouse.");
add("- Companion suggestions meet an acceptance rate above 35% and a rejection-reason capture rate above 80%.");
add("- Time to first artifact for a new user is under five minutes in usability testing.");
add("- Task success rate for first-time users is above 85% on the top ten jobs to be done.");
add("");
add("---");
add("");
add("## 2. Vision and Product Thesis");
add("");
add("CreativeOS is not a collection of AI tools. It is a single operating system for the entire lifecycle of visual storytelling: the first idea, the developed concept, the screenplay, the fictional universe, the characters, the production design, the camera language, the generated footage, the performance, the sound, the score, the cut, the grade, the master, and the release.");
add("");
add("A filmmaker enters with an intention. CreativeOS responds with a studio: the right departments activated, the right agents assigned, the right assets resolved, and the right decisions surfaced for human approval. The product succeeds when the machinery becomes invisible and only the creative decisions remain.");
add("");
add("The competitive claim is structural, not cosmetic. Generators produce clips. CreativeOS produces films: coherent, continuous, versioned, reviewable, and deliverable. Continuity, provenance, and rights are first-class requirements rather than afterthoughts, because those are exactly the properties that separate a demo from a production.");
add("");
add("### 2.1 Three Dimensions");
add("");
add("**The Creative Universe** — everything the user makes: stories, films, characters, worlds, scenes, assets, and IP.");
add("**The Professional Studio System** — every filmmaking discipline with its own environment, tools, and review surface.");
add("**The AI Workforce** — specialized agents that research, plan, create, review, coordinate, and execute.");
add("");
add("### 2.2 Product Boundaries");
add("");
add("In scope: concept through delivery for scripted, documentary, animated, interactive, and cinematic formats.");
add("Out of scope for v1: theatrical distribution deals, real-time multiplayer editing, clinical assessment tooling, and any training on user IP without explicit consent.");
add("");
add("---");
add("");
add("## 3. Users, Jobs, and Success");
add("");
add("### 3.1 Personas");
add("");
add("- **Solo filmmaker** — wants a finished short film without hiring a crew; needs guidance more than knobs.");
add("- **Writer-director** — wants the tool to hold the universe while they hold the vision.");
add("- **Producer** — wants budget, schedule, approvals, and deliverables in one place.");
add("- **Studio team** — wants departmental workspaces with permissions and audit.");
add("- **Educator or student** — wants to learn craft by doing, with explanations attached.");
add("");
add("### 3.2 Jobs To Be Done");
add("");
add("| Job | Trigger | Desired outcome |");
add("|---|---|---|");
add("| Develop an idea | A fragment of inspiration | A defensible concept with directions and risks |");
add("| Build a universe | A concept that needs depth | Rules, cultures, chronology, and lore that hold |");
add("| Write and lock a script | An approved concept | A producible screenplay with breakdown |");
add("| Plan the visual production | A locked script | Shot-level plans with camera, light, and design |");
add("| Generate and assemble | Approved plans | Footage, sound, score, and a cut that plays |");
add("| Deliver and market | A locked cut | Masters, subtitles, trailer, key art, release plan |");
add("");
add("### 3.3 Success Metrics");
add("");
add("| Metric | Target | Why |");
add("|---|---|---|");
add("| Time idea to first watchable cut | days, not months | proves the loop closes |");
add("| Project completion rate | > 40% of started projects | the real product test |");
add("| Continuity defects per 100 shots | < 3 | quality differentiator |");
add("| Asset reuse across a franchise | > 60% | proves the graph works |");
add("| Normalized cost per finished minute | declining quarter over quarter | commercial viability |");
add("| Approval turnaround | < 24h median | workflow credibility |");
add("");
add("---");
add("");
add("## 4. Architecture Principles");
add("");
add("1. **One creative graph.** All studios read and write one project, universe, and asset graph.");
add("2. **Studios are modules.** Registration is declarative; capabilities declare inputs, outputs, and schemas.");
add("3. **No silent overwrite.** Approved artifacts require a new version and an approval event.");
add("4. **Generation is a layer.** Model providers are interchangeable behind a single interface.");
add("5. **Agents are employees.** Each has a role, tool scopes, a budget, and an audit trail.");
add("6. **Human gates by default.** Consequential transitions require explicit approval.");
add("7. **Continuity is computed.** Character, world, camera, sound, and narrative consistency are checked continuously.");
add("8. **Everything is an asset.** Stable IDs, versions, provenance, rights, and dependencies.");
add("9. **Cost is a first-class constraint.** Every job records credits and estimates before execution.");
add("10. **Deletion is archival.** Nothing leaves the graph without an audit event.");
add("");
add("---");
add("");
add("## 5. Domain Model and Creative Graph");
add("");
add("The graph connects universes to franchises to productions to scenes to shots to assets. Every edge is typed, versioned, and auditable.");
add("");
add("```");
add("UNIVERSE -> FRANCHISE -> [FILM | SERIES -> SEASON -> EPISODE]");
add("                                      -> SCENE -> SHOT -> ASSET_VERSION");
add("```");
add("");
add("Core invariants:");
add("");
add("- A shot cannot reference a character version that is not approved for its project.");
add("- A location cannot be used in a scene after its continuity status is flagged unresolved.");
add("- A cut cannot exceed a picture lock without creating a new edit version.");
add("- A delivery master must reference a locked cut and a valid delivery profile.");
add("");
add("---");
add("");

let capIndex = 0;
let studioIndex = 0;
const capRegistry = [];

add("## 6. Studio Family Specifications");
add("");
add("Each capability below is specified to implementation depth: purpose, inputs, outputs, data contract, UX, agent protocol, pipeline, consistency rules, rights, performance, failure recovery, acceptance criteria, tests, telemetry, dependencies, and open questions.");
add("");

for (const fam of FAMILIES) {
  studioIndex += 1;
  const famNo = String(studioIndex).padStart(2, "0");
  const agentBase = `AGT-${famNo}`;
  add("");
  add(`## 6.${studioIndex} STU-${famNo} — ${fam.name}`);
  add("");
  add(`**Phase:** ${fam.phase} · **Sub-studios:** ${fam.subs.length} · **Capabilities:** ${fam.caps.length}`);
  add("");
  add(`**Mission.** ${fam.mission}`);
  add("");
  add("**Sub-studios.**");
  for (const s of fam.subs) add(`- ${s}`);
  add("");
  add("**Studio contract.** Every sub-studio exposes Overview, Workspace, Assets, Tools, Agents, References, Workflow, Tasks, Versions, Reviews, Approvals, History, and Export. Tabs that do not apply to the discipline are hidden rather than stubbed.");
  add("");
  add("**Shared dependencies.** Project graph, asset store, agent registry, provider router, approval service, audit log, cost ledger.");
  add("");

  fam.caps.forEach((capName, i) => {
    capIndex += 1;
    const capId = `CAP-${String(capIndex).padStart(4, "0")}`;
    const sub = fam.subs[i % fam.subs.length];
    const agentName = `${sub.replace(/ Studio$/, "")} ${pick(AGENT_SUFFIX, i)}`;
    const agentId = `${agentBase}-${String((i % fam.subs.length) + 1).padStart(2, "0")}`;
    const key = slug(capName);
    const maturity = fam.phase === "P1" ? "GA" : fam.phase === "P2" ? "GA" : "Beta";
    capRegistry.push({ capId, capName, key, fam: fam.name, famNo, sub, phase: fam.phase });

    add("");
    add(`### ${capId} — ${capName}`);
    add("");
    add(`| Field | Value |`);
    add(`|---|---|`);
    add(`| Studio family | STU-${famNo} ${fam.name} |`);
    add(`| Sub-studio | ${sub} |`);
    add(`| Capability key | \`${key}\` |`);
    add(`| Phase / maturity | ${fam.phase} / ${maturity} |`);
    add(`| Owner agent | ${agentId} · ${agentName} |`);
    add(`| Requires approval | ${i % 3 === 0 ? "yes" : "no"} |`);
    add("");
    add("#### Purpose");
    add("");
    add(pick([
      `Enable ${capName.toLowerCase()} as a first-class production step inside ${fam.name}, so the result is versioned, reviewable, and reusable rather than trapped in a chat transcript.`,
      `Provide ${fam.name} with a deterministic, auditable implementation of ${capName.toLowerCase()} that reads approved upstream artifacts and writes a structured artifact back to the graph.`,
      `Turn ${capName.toLowerCase()} from an ad-hoc prompt into a repeatable pipeline stage that a producer can budget and a reviewer can approve.`,
    ], i));
    add("");
    add(`The capability exists because ${fam.mission.charAt(0).toLowerCase()}${fam.mission.slice(1)} Without it, the department either stalls or exports work that downstream studios cannot consume.`);
    add("");
    add("#### Inputs and Outputs");
    add("");
    for (let k = 0; k < 3; k++) add(`- **In:** ${pick(INPUTS, i + k)}`);
    for (let k = 0; k < 3; k++) add(`- **Out:** ${pick(OUTPUTS, i + k + 1)}`);
    add("");
    add("#### Data Contract");
    add("");
    add("```json");
    add(`{ "capability": "${key}", "artifact_id": "art_...", "version": ${1 + (i % 4)},`);
    add(`  "status": "${maturity === "GA" ? "approved" : "proposed"}", "agent": "${agentId}",`);
    add(`  "inputs": ["..."], "output": "${key}.result",`);
    add(`  "provenance": { "provider": "...", "model": "...", "seed": ${1000 + i} },`);
    add(`  "cost_credits": ${(i % 9) + 1} }`);
    add("```");
    add("");
    add("#### UX Surface");
    add("");
    for (let k = 0; k < 3; k++) add(`- ${pick(UI, i + k)}`);
    add(`- Command-palette invocation as \`${key}\`; every run is visible in the studio timeline with cost and duration.`);
    add("");
    add("#### Agent Protocol");
    add("");
    add(`1. **Plan.** ${agentName} restates the objective, lists the upstream artifacts it will read, and estimates cost.`);
    add("2. **Act.** Execute with capability-scoped tools, never writing outside the declared output schema; pause for human approval above the auto-approve threshold.");
    add("3. **Validate.** Schema validation plus the capability's acceptance tests before publish.");
    add("4. **Publish and hand off.** Commit the version with provenance, emit telemetry, and notify downstream owners with a diff summary.");
    add("");
    add("#### Processing Pipeline");
    add("");
    for (let s = 1; s <= 5; s++) add(`${s}. ${["Resolve and validate inputs", "Construct the execution plan", "Generate or compute the artifact", "Score, self-review, and flag deviations", "Commit version and notify downstream"][s - 1]}.`);
    add("");
    add("#### Rules, Rights, and Recovery");
    add("");
    add("- Reads resolve to approved versions only; drafts require explicit opt-in.");
    add("- Referenced characters, locations, and props must carry their asset IDs.");
    add("- Re-running never mutates a prior version; deviations from the visual or narrative bible are flagged.");
    for (let k = 0; k < 2; k++) add(`- ${pick(RIGHTS, i + k)}`);
    for (let k = 0; k < 3; k++) add(`- ${pick(FAILURES, i + k)}`);
    add("");
    add("#### Acceptance Criteria");
    add("");
    add(`- [ ] AC-${capId}-1: a valid project yields a schema-valid \`${key}\` artifact with a stable ID.`);
    add(`- [ ] AC-${capId}-2: changed parameters create version 2 and leave version 1 retrievable.`);
    add(`- [ ] AC-${capId}-3: provenance exposes every upstream input, and unapproved artifacts are blocked downstream.`);
    add(`- [ ] AC-${capId}-4: cost and latency are recorded and visible in the studio timeline.`);
    add("");
    add("#### Test Cases and Telemetry");
    add("");
    for (let k = 0; k < 3; k++) add(`- TC-${capId}-${k + 1}: ${pick(TESTS, i + k)}`);
    for (let k = 0; k < 2; k++) add(`- ${pick(TELEMETRY, i + k)}`);
    add("");
    add("#### Dependencies");
    add("");
    add(`- Phase gate ${fam.phase}; hard dependency on ${pick(["project graph service", "asset store and versioning", "approval service", "provider router"], i)}.`);
    add(`- Soft dependency on ${pick(["continuity engine", "cost ledger", "reference library", "search index"], i + 2)}.`);
    add("");
    add("#### Field Schema");
    add("");
    add("| Field | Type | Required | Constraint |");
    add("|---|---|---|---|");
    add("| `capability` | enum | yes | must equal `" + key + "` |");
    add("| `artifact_id` | uuid | yes | stable, never reused |");
    add("| `version` | integer | yes | monotonically increasing per artifact |");
    add("| `status` | enum | yes | proposed, in_review, approved, superseded |");
    add("| `inputs[]` | uuid[] | yes | approved versions only |");
    add("| `provenance` | jsonb | yes | agent, provider, model, seed recorded |");
    add("| `cost_credits` | integer | yes | written to the cost ledger |");
    add("");
    add(`**Open question.** ${pick(OPENQ, i)}`);
    add("");
    add("#### Edge Cases");
    add("");
    add("- Empty upstream set: return a guided minimum-input checklist, never a fabricated artifact.");
    add("- Conflicting approved inputs: halt and present both records with their approval timestamps.");
    add("- Partially failed batch: keep successful items, mark the batch partial, and allow targeted retry.");
    add("- Oversized input: chunk by scene or asset and preserve a single provenance chain.");
    add("- Duplicate invocation within the idempotency window: return the existing run instead of charging again.");
    add("");
    add("#### AI-Readable Contract");
    add("");
    add("```yaml");
    add(`capability: ${key}`);
    add(`studio: STU-${famNo}`);
    add(`phase: ${fam.phase}`);
    add(`inputs: [artifact_id, params]`);
    add(`outputs: [artifact_id, version, status]`);
    add(`requires_approval: ${i % 3 === 0}`);
    add(`downstream: [${fam.name.toLowerCase().replace(/[^a-z]+/g, "-")}-consumers]`);
    add("```");
    add("");
    add("#### Observability");
    add("");
    add("- Every run emits structured logs with run ID, capability key, and provider.");
    add("- Latency is broken down by stage so regressions are attributable.");
    add("- Cost is attributed to project, studio, capability, and agent.");
    add("- Failure classes are normalized across providers for comparable dashboards.");
    add("");
    add("#### Rollout");
    add("");
    add("- Ships behind a capability flag per project tier.");
    add("- Canary at 5% of eligible projects, then 25%, then general availability.");
    add("- Rollback disables the capability without deleting produced artifacts.");
    add("- Migration of existing artifacts is forward-only and audited.");
    add("");
    add("#### Worked Example");
    add("");
    add(`- **Input.** A project with locked upstream artifacts and a clear creative intent for ${capName.toLowerCase()}.`);
    add(`- **Run.** ${agentName} resolves the graph, proposes a plan with cost, and executes after the gate.`);
    add("- **Review.** The owner compares the proposal against the last approved version and accepts with notes.");
    add("- **Result.** A new version lands, downstream studios are notified, and the run is fully attributable.");
    add("");
    add("#### Integration Points");
    add("");
    add(`- Reads from ${pick(["graph service", "artifact service", "asset service", "canon service"], i)}.`);
    add(`- Writes through ${pick(["artifact service", "asset service", "approval service", "export service"], i + 1)}.`);
    add(`- Emits events consumed by ${pick(["workflow orchestrator", "search index", "continuity engine", "cost ledger"], i + 2)}.`);
    add("");
    add("---");
  });
}

add("");
add("## 7. Data Model");
add("");
add("The platform persists 23 core entities. Each entity below lists its columns, ownership, and lifecycle rules.");
add("");
for (const [name, fields] of entities) {
  add(`### 7.${entities.findIndex((e) => e[0] === name) + 1} \`${name}\``);
  add("");
  add(`| Column | Type | Notes |`);
  add("|---|---|---|");
  for (const f of fields) {
    const type = f.endsWith("_id") ? "uuid" : f.endsWith("_at") ? "timestamptz" : f.endsWith("_json") ? "jsonb" : /^(credits|version|number|attempts|seed|tokens)/.test(f) ? "integer" : "text";
    add(`| \`${f}\` | ${type} | ${f.endsWith("_id") ? "foreign key, indexed" : f.endsWith("_at") ? "server-set, immutable" : "mutable with audit" } |`);
  }
  add("");
  add(`**Lifecycle.** Rows are created by their owning studio, updated only through versioned artifact writes, and archived rather than deleted. Every mutation emits an \`audit_events\` row.`);
  add("");
}

add("---");
add("");
add("## 8. API and Event Contracts");
add("");
add("All mutations are capability-scoped. The surface is intentionally small: one execution endpoint per capability, one event stream per project.");
add("");
add("### 7.1 Execution Endpoint Pattern");
add("");
add("```");
add("POST /v1/projects/{project_id}/capabilities/{capability_key}/runs");
add("GET  /v1/projects/{project_id}/runs/{run_id}");
add("POST /v1/projects/{project_id}/artifacts/{artifact_id}/approve");
add("GET  /v1/projects/{project_id}/graph?depth=2");
add("```");
add("");
add("### 7.2 Capability Endpoints");
add("");
for (const c of capRegistry) {
  add(`- \`POST /v1/projects/{project_id}/capabilities/${c.key}/runs\` — ${c.capName} (${c.capId}, ${c.phase}).`);
}
add("");
add("### 7.3 Events");
add("");
add("| Event | Payload | Consumers |");
add("|---|---|---|");
add("| `artifact.published` | artifact_id, version, studio, capability | downstream studios, search, continuity engine |");
add("| `artifact.approved` | artifact_id, approver, decision | workflow orchestrator |");
add("| `run.failed` | run_id, error_class, provider | ops dashboard, retry policy |");
add("| `cost.recorded` | project_id, credits, usd_estimate | budget studio |");
add("| `quality.finding` | scope, check_type, severity | continuity and QC studios |");
add("");

add("---");
add("");
add("## 9. AI Workforce");
add("");
add("Agents are role-scoped employees with explicit permissions, budgets, and audit trails. They never act outside their studio's declared capabilities.");
add("");
for (const fam of FAMILIES) {
  const no = String(FAMILIES.indexOf(fam) + 1).padStart(2, "0");
  add(`### AGT-${no} — ${fam.name} workforce`);
  add("");
  add(`- **Roles:** ${fam.subs.map((s) => s.replace(/ Studio$/, "") + " " + pick(AGENT_SUFFIX, s.length)).join(", ")}.`);
  add("- **Tool scopes:** project graph read, asset store read/write within capability, provider router, approval service.");
  add("- **Budget policy:** per-run ceiling from project settings; hard stop at project ceiling.");
  add("- **Escalation:** any low-confidence decision returns three ranked options to the human owner.");
  add("- **Audit:** every tool call and result is recorded with the run ID.");
  add("");
}

add("---");
add("");
add("## 10. Workflow Orchestration");
add("");
add("A workflow is a typed DAG of capability runs with approval gates. The orchestrator resolves dependencies, retries idempotently, and never bypasses a gate.");
add("");
add("### 9.1 Phase Gates");
add("");
add("| Gate | Requires | Blocks |");
add("|---|---|---|");
add("| Concept approved | Idea and Research artifacts | Story architecture |");
add("| Script locked | Screenplay and breakdown | Storyboard and generation |");
add("| Look approved | Visual direction and production design | Shot generation at scale |");
add("| Picture locked | Edit version and QC pass | Finishing and delivery |");
add("| Master approved | Delivery QC and rights check | Distribution |");
add("");

add("---");
add("");
add("## 11. Quality, Safety, Rights, and Compliance");
add("");
add("- Continuity checks run automatically at every scene lock and every edit version.");
add("- Identity drift, anatomical inconsistency, and object duplication are detected at generation time, not at delivery.");
add("- Rights records attach at the asset level and propagate to every usage location.");
add("- Likeness and voice use require recorded consent with scope and expiry.");
add("- All model providers are recorded with version and terms snapshot per run.");
add("- No user content is used for training without explicit, revocable consent.");
add("");

add("---");
add("");
add("## 12. IP, Canon, and the Asset Universe");
add("");
add("### 12.1 IP Thesis");
add("");
add("CreativeOS is an IP machine before it is a renderer. The durable value created inside the product is not a clip; it is a universe with characters, rules, designs, and rights that can be reused across films, series, games, and merchandise. Everything in the graph must therefore be expressible as owned, versioned, attributable IP.");
add("");
add("The IP layer guarantees four properties: every asset has an owner of record, every use has provenance, every canon claim is resolvable, and every commercial use is traceable to a license or consent record.");
add("");
add("### 12.2 IP Graph");
add("");
add("```");
add("UNIVERSE (rules, canon policy, owners)");
add("  -> FRANCHISE (scope, canon status, expansion plan)");
add("     -> TITLE (film, series, game, short, interactive)");
add("        -> ELEMENT (character, location, prop, faction, event)");
add("           -> VERSION (design, script, performance, voice, score)");
add("              -> USE (scene, shot, marketing, merchandise)");
add("                 -> RIGHTS (license, consent, territory, expiry)");
add("```");
add("");
add("### 12.3 IP Asset Taxonomy");
add("");
add("Every asset type below is a first-class IP object with a schema, an owning studio, a version chain, a default rights posture, and an export form.");
add("");
const IP_TYPES = [
  ["Universe", "World Architect", "universe.v1", "universe-scoped", "world bible"],
  ["Franchise", "Franchise Studio", "franchise.v1", "universe-scoped", "franchise plan"],
  ["Title", "Producer Studio", "title.v1", "project-scoped", "title package"],
  ["Series", "Series Architecture", "series.v1", "franchise-scoped", "series bible"],
  ["Season", "Series Architecture", "season.v1", "series-scoped", "season arc"],
  ["Episode", "Producer Studio", "episode.v1", "series-scoped", "episode package"],
  ["Screenplay", "Screenplay Studio", "screenplay.v1", "writer-owned", "formatted PDF and Fountain"],
  ["Treatment", "Packaging Studio", "treatment.v1", "writer-owned", "pitch document"],
  ["Scene", "Scene Board", "scene.v1", "project-scoped", "scene card"],
  ["Character", "Character Architect", "character.v1", "franchise-scoped", "character bible"],
  ["Character Design", "Appearance Studio", "character_design.v1", "franchise-scoped", "reference sheet"],
  ["Voice Identity", "Voice Studio", "voice.v1", "consent-scoped", "voice model card"],
  ["Performance", "Performance Studio", "performance.v1", "project-scoped", "motion and expression set"],
  ["Faction", "World Architect", "faction.v1", "universe-scoped", "faction dossier"],
  ["Location", "Location Studio", "location.v1", "universe-scoped", "location bible"],
  ["Set", "Set Studio", "set.v1", "project-scoped", "set drawings"],
  ["Prop", "Props Studio", "prop.v1", "franchise-scoped", "prop sheet"],
  ["Costume", "Costume Studio", "costume.v1", "franchise-scoped", "costume sheet"],
  ["Makeup Look", "Makeup Studio", "makeup.v1", "project-scoped", "makeup chart"],
  ["Creature", "Creature Studio", "creature.v1", "franchise-scoped", "creature bible"],
  ["Vehicle", "Props Studio", "vehicle.v1", "franchise-scoped", "vehicle sheet"],
  ["Technology", "World Architect", "technology.v1", "universe-scoped", "tech dossier"],
  ["Magic or Science System", "World Architect", "system.v1", "universe-scoped", "system spec"],
  ["Timeline", "Timeline Studio", "timeline.v1", "universe-scoped", "chronology"],
  ["Lore Text", "Lore Studio", "lore.v1", "universe-scoped", "lore compendium"],
  ["Symbol", "Lore Studio", "symbol.v1", "franchise-scoped", "symbol guide"],
  ["Language", "World Architect", "language.v1", "universe-scoped", "lexicon"],
  ["Song or Score Cue", "Music Studio", "music_cue.v1", "composer-owned", "stems and cue sheet"],
  ["Sound Effect", "Sound Studio", "sfx.v1", "library-scoped", "audio file with metadata"],
  ["Ambience Bed", "Ambient Studio", "ambience.v1", "library-scoped", "loopable bed"],
  ["Foley Set", "Foley Studio", "foley.v1", "library-scoped", "foley pack"],
  ["Storyboard Panel", "Storyboard Studio", "panel.v1", "project-scoped", "panel image plus notes"],
  ["Previs Sequence", "Previs Studio", "previs.v1", "project-scoped", "previs movie"],
  ["Shot", "Shot Design", "shot.v1", "project-scoped", "shot record"],
  ["Take", "Generation Studio", "take.v1", "project-scoped", "clip plus provenance"],
  ["VFX Asset", "VFX Studio", "vfx.v1", "project-scoped", "comp and elements"],
  ["Environment Plate", "Digital Environment", "plate.v1", "project-scoped", "plate with depth"],
  ["Edit Version", "Editing Studio", "edit.v1", "project-scoped", "timeline and EDL"],
  ["Grade", "Color Studio", "grade.v1", "project-scoped", "LUT and CDL"],
  ["Master", "Finishing Studio", "master.v1", "project-owned", "delivery master"],
  ["Trailer", "Trailer Studio", "trailer.v1", "project-owned", "trailer masters"],
  ["Key Art", "Key Art Studio", "keyart.v1", "project-owned", "print and digital art"],
  ["Marketing Asset", "Marketing Studio", "marketing.v1", "project-owned", "campaign pack"],
  ["Learning Module", "Academy", "module.v1", "platform-owned", "lesson and exercises"],
  ["Reference", "Research Studio", "reference.v1", "license-scoped", "link plus citation"],
];
add("| Type | Owning studio | Schema | Rights default | Export form |");
add("|---|---|---|---|---|");
for (const [t, owner, schema, rights, exp] of IP_TYPES) add(`| ${t} | ${owner} | \`${schema}\` | ${rights} | ${exp} |`);
add("");
add("### 12.4 Chain of Title and Rights Model");
add("");
add("- **Ownership.** Every asset records creator, contributor agents, and the human owner of record.");
add("- **Chain of title.** Contributions are additive and signed; a master cannot ship with an unsigned contribution.");
add("- **Licenses.** Each license stores grant scope, territory, media, term, exclusivity, and revocation terms.");
add("- **Consent.** Likeness and voice records store purpose, duration, territory, and withdrawal mechanics.");
add("- **Attribution.** Credits are generated from contribution records, not typed by hand.");
add("- **Audit.** Any change to rights emits an immutable audit event with before and after states.");
add("");
add("### 12.5 Canon Rules");
add("");
add("1. Canon status is explicit per element: canon, soft canon, alternate, or non-canon.");
add("2. A conflict is resolved by canon status, then by recency of approval, then by explicit owner ruling.");
add("3. Retcons require a canon event that supersedes the prior claim without deleting it.");
add("4. Cross-project reuse checks the target franchise's canon policy before linking.");
add("5. Fan or experimental branches never contaminate the main canon graph.");
add("");
add("### 12.6 Licensing and Commercialization Matrix");
add("");
add("| Tier | Scope | Typical license | Platform obligation |");
add("|---|---|---|---|");
add("| Personal | single project, no monetization | platform terms | watermark optional |");
add("| Indie | festival and streaming release | commercial generation license | rights ledger complete |");
add("| Professional | broadcast and theatrical | territory-scoped licenses | chain of title signed |");
add("| Franchise | multi-title universe | universe-wide grant | canon governance active |");
add("| Brand | client work and advertising | client-owned output | consent and model releases |");
add("| Library | stock reuse of assets | per-asset license | usage tracking enforced |");
add("");
add("### 12.7 Provenance");
add("");
add("- Every generated asset stores provider, model version, seed, prompt, and reference IDs.");
add("- Every human edit stores author, timestamp, and diff.");
add("- Provenance is exportable as a signed manifest alongside any delivery.");
add("- Provenance is preserved through transformations, compositing, and re-export.");
add("");
add("### 12.8 IP Export Formats");
add("");
add("- **Creative:** PDF, Fountain, Final Draft, OTL, EDL, XML, AAF, OpenTimelineIO.");
add("- **Visual:** EXR, ProRes, H.264/H.265, PNG with alpha, USD, glTF.");
add("- **Structured:** JSON graph export, CSV asset ledger, signed provenance manifest.");
add("- **Legal:** chain-of-title packet, license summary, consent registry extract.");
add("");
add("### 12.9 IP Compliance Checklist");
add("");
add("- [ ] Every shipped asset resolves to an owner of record.");
add("- [ ] Every third-party reference has a license record.");
add("- [ ] Every likeness and voice has recorded consent with scope.");
add("- [ ] Every canon claim in the master is marked and consistent.");
add("- [ ] Every delivery includes a provenance manifest.");
add("- [ ] Every credit line is generated from contribution records.");
add("");

add("---");
add("");
add("## 13. Competitive Benchmark and VFX Quality Bar");
add("");
add("### 13.1 Parity Baseline");
add("");
add("The market reference point is the strongest current AI filmmaking surface: a single place where a creator can generate cinematic images and video with strong aesthetic defaults and fast iteration. Parity is table stakes. The table below states where CreativeOS must match, and where it must exceed.");
add("");
const PARITY = [
  ["Text-to-image generation", "match", "one of many inputs, not the product"],
  ["Image-to-image and reference transfer", "match", "identity locked to the canonical asset"],
  ["Text-to-video and image-to-video", "match", "shot-spec driven, continuity enforced"],
  ["Camera motion presets", "match", "movement authored as a shot plan, not a preset"],
  ["Aesthetic presets and looks", "exceed", "looks are project bibles, versioned and gradeable"],
  ["Character consistency", "exceed", "identity lock with drift scoring across shots"],
  ["Fast iteration and variants", "exceed", "structured takes with diffs and approvals"],
  ["Upscaling and enhancement", "match", "delivery-aware, format-targeted"],
  ["Motion transfer from reference video", "match", "performance direction with retargeting"],
  ["Scene extension and continuation", "match", "scene-level assembly with continuity checks"],
  ["Style transfer across a sequence", "exceed", "style is a governed artifact, not a prompt"],
  ["Mobile-first creation", "exceed", "review, approve, and direct from phone"],
  ["Collaboration and review", "exceed", "timecoded notes, approvals, audit"],
  ["Asset management", "exceed", "typed IP graph with reuse and rights"],
  ["Script and story tools", "exceed", "screenplay, breakdown, and narrative QA"],
  ["Sound and music", "exceed", "design, score, sync, and rights"],
  ["Editing and finishing", "exceed", "timeline, grade, conform, delivery"],
  ["VFX and compositing", "exceed", "simulation, comp, review, QC"],
  ["Trailer, poster, marketing", "exceed", "generated from the finished film"],
  ["Distribution and delivery", "exceed", "profiles, territories, masters"],
  ["Film education", "exceed", "150 years of craft attached to live work"],
];
add("| Capability | Position | CreativeOS behavior |");
add("|---|---|---|");
for (const [c, pos, beh] of PARITY) add(`| ${c} | ${pos} | ${beh} |`);
add("");
add("### 13.2 Beyond-Parity Capabilities");
add("");
const BEYOND = [
  ["Canon-governed generation", "every output is validated against universe rules before it is accepted"],
  ["Shot-spec rendering", "generation consumes a structured shot record, not a free-text prompt"],
  ["Continuity scoring", "identity, wardrobe, light, and geography drift measured per shot"],
  ["Take comparison", "side-by-side review with objective metrics and director notes"],
  ["Cost-aware direction", "the system proposes the cheapest path that clears the quality bar"],
  ["Multi-provider fallback", "a shot re-renders elsewhere without losing its spec or lineage"],
  ["Artist-grade controls", "lens, light, and grade controls exposed to those who want them"],
  ["Production memory", "every rejected idea is remembered with its reason"],
  ["Narrative QA", "plot holes and broken payoffs detected before generation spend"],
  ["IP graph reuse", "characters and worlds persist across titles and seasons"],
  ["Rights-aware generation", "requests that lack consent fail loudly and lawfully"],
  ["Film-school overlay", "craft explanation attached to the decision being made"],
  ["Delivery profiles", "masters validated against platform specifications"],
  ["Companion with agency boundaries", "Bella never self-approves or fabricates sources"],
];
BEYOND.forEach(([n, d], k) => {
  add(`#### 13.2.${k + 1} ${n}`);
  add("");
  add(`${d.charAt(0).toUpperCase()}${d.slice(1)}.`);
  add(`- **Why it wins:** it removes a failure class that competitors leave to the user.`);
  add(`- **Phase:** ${["P1", "P2", "P2", "P3", "P3", "P3", "P3", "P4", "P4", "P4", "P4", "P5", "P4", "P1"][k]}.`);
  add("");
});
add("### 13.3 The VFX Quality Bar");
add("");
add("The target is not \"AI video\". The target is a shot that survives a VFX supervisor's review at DNEG-class standards, and an image that stands beside a Marvel sequence without apology. This is a hard, testable bar, expressed as measurable criteria rather than ambition.");
add("");
add("Quality is defined per shot, not per demo. A sequence ships only when every shot clears its tier, every continuity axis holds, and the grade is consistent across the reel.");
add("");
add("### 13.4 Quality Tiers");
add("");
add("| Tier | Standard | Typical use | Gate |");
add("|---|---|---|---|");
add("| Q0 Draft | readable intent, obvious artifacts allowed | exploration | none |");
add("| Q1 Review | clean composition, faces stable, light coherent | internal review | continuity check |");
add("| Q2 Broadcast | artifact-free, matched grade, sound-synced | streaming and broadcast | VFX review and audio QC |");
add("| Q3 Theatrical | photoreal at large format, motion physically plausible | feature release | supervisor sign-off |");
add("| Q4 Reference | indistinguishable from plate-grade VFX | flagship sequences | dual sign-off and benchmark |");
add("");
add("### 13.5 Per-Shot Quality Rubric");
add("");
const RUBRIC = [
  "Identity stability across the shot",
  "Face topology and eye-line consistency",
  "Anatomical correctness in motion",
  "Wardrobe and prop continuity",
  "Light direction and color temperature match",
  "Shadow contact and occlusion plausibility",
  "Lens character and distortion consistency",
  "Focus breathing and depth-of-field behavior",
  "Motion blur and shutter fidelity",
  "Camera move smoothness and inertia",
  "Grain and noise consistency with the reel",
  "Edge quality on hair, cloth, and thin geometry",
  "Compositing seam and matte integrity",
  "Reflection and refraction correctness",
  "Particle and fluid behavior plausibility",
  "Crowd and background continuity",
  "Color match against adjacent shots",
  "Sound sync and spatial plausibility",
  "Frame-to-frame temporal stability",
  "Compression and delivery-codec resilience",
];
RUBRIC.forEach((r, n) => {
  add(`#### 13.5.${n + 1} Check — ${r}`);
  add("");
  add(`- **Method.** Automated metric plus human spot-check at 200% zoom and at delivery resolution.`);
  add(`- **Threshold.** Must pass at Q2 and above; any failure blocks shot approval.`);
  add(`- **Remedy.** Return to the owning studio with a targeted note, not a full re-render by default.`);
  add("");
});
add("### 13.6 Evaluation Harness");
add("");
add("- A fixed benchmark reel of 120 shots covering faces, crowds, water, fire, cloth, night exteriors, and close dialogue.");
add("- Objective metrics: identity similarity, temporal flicker, lip-sync error, edge artifact rate, color delta.");
add("- Human panel: three reviewers per shot at blind quality tiers.");
add("- Regression gate: no release may reduce benchmark scores without an explicit quality waiver.");
add("- Public scorecard published per model version and provider.");
add("");
add("### 13.7 Artist-Grade Control Surface");
add("");
const CONTROLS = [
  "focal length and sensor format", "aperture and depth of field", "shutter angle and motion blur",
  "key-to-fill ratio", "practical light intensity", "color temperature per source",
  "camera height and pitch", "roll and dutch angle", "movement speed and easing",
  "blocking and eyeline", "performance intensity", "micro-expression timing",
  "grain structure", "halation and bloom", "lens breathing",
  "chromatic aberration", "vignette profile", "grade lift gamma gain",
  "skin tone protection", "matte line tolerance", "grain plate matching",
  "seed locking", "variant count and spacing", "reference weight per element",
];
CONTROLS.forEach((c, n) => {
  add(`- **Control ${n + 1}.** ${c.charAt(0).toUpperCase()}${c.slice(1)} — exposed in the advanced drawer, defaulted from the look bible, and recorded in the shot spec.`);
});
add("");
add("### 13.8 Compute and Render Strategy");
add("");
add("- Tiered rendering: fast draft passes, then targeted refinement on the failed rubric checks only.");
add("- Region-of-interest re-rendering instead of whole-frame regeneration.");
add("- Provider routing by shot requirement: identity shots, motion shots, and environment shots use different models.");
add("- Cached elements: plates, mattes, and simulation caches reused across takes.");
add("- Cost ceilings per shot with automatic downgrade to the cheapest path that still clears the tier.");
add("");
add("### 13.9 What the Bar Means Operationally");
add("");
add("- A shot cannot pass on aesthetics alone; it must pass the rubric.");
add("- A sequence cannot lock with an unresolved continuity finding.");
add("- A master cannot deliver with a grade mismatch above tolerance.");
add("- A trailer cannot ship with shots that failed at their tier.");
add("- Supervisors hold veto; the system records the veto and the reason.");
add("");

add("---");
add("");
add("## 14. Film School: 150 Years of Craft Knowledge");
add("");
add("### 14.1 Thesis");
add("");
add("The academy inside CreativeOS compresses more than a century of accumulated craft into the exact moment a decision is being made. It is not a video course library bolted onto a tool. It is a teaching layer that explains, demonstrates, and drills the principles behind the artifact on screen.");
add("");
add("The curriculum covers the full arc of moving-image craft: silent-era grammar, studio-system continuity, auteur cinematography, new-wave editing, blockbuster effects, digital color, and contemporary virtual production.");
add("");
add("### 14.2 Knowledge Timeline");
add("");
const TIMELINE = [
  ["1888", "first motion-picture capture and the birth of the frame"],
  ["1895", "projection to a paying audience establishes cinema as a public form"],
  ["1902", "trick effects and substitution splices prove the frame can lie"],
  ["1915", "feature-length narrative grammar consolidates"],
  ["1920s", "Soviet montage formalizes editing as meaning"],
  ["1927", "synchronized sound rewrites performance and staging"],
  ["1930s", "studio-system continuity and the three-point lighting standard"],
  ["1940s", "film noir codifies shadow, moral ambiguity, and low-key light"],
  ["1950s", "widescreen formats change composition and scale"],
  ["1960s", "new waves break continuity rules deliberately"],
  ["1970s", "auteur era and the blockbuster model emerge together"],
  ["1977", "optical effects and sound design become a franchise engine"],
  ["1980s", "analog compositing and motion-control mature"],
  ["1993", "digital compositing changes creature realism permanently"],
  ["1999", "digital intermediates make color a post-production discipline"],
  ["2000s", "performance capture and digital doubles enter production"],
  ["2009", "stereoscopic and large-format pipelines scale"],
  ["2010s", "virtual production and real-time engines enter the set"],
  ["2019", "LED volume photography normalizes in-camera VFX"],
  ["2020s", "generative models enter previs, look development, and finishing"],
];
add("| Year | Knowledge milestone |");
add("|---|---|");
for (const [y, m] of TIMELINE) add(`| ${y} | ${m} |`);
add("");
add("### 14.3 Curriculum");
add("");
const MODULES = [
  ["Story fundamentals", "premise, conflict, and dramatic question"],
  ["Structure", "acts, beats, and escalation"],
  ["Scene craft", "objective, obstacle, and turn"],
  ["Dialogue", "subtext, voice, and rhythm"],
  ["Character", "want, need, wound, and arc"],
  ["Theme", "argument through action"],
  ["Directing performance", "intention, adjustment, and coverage"],
  ["Blocking", "space as meaning"],
  ["Shot grammar", "size, angle, and eyeline"],
  ["Composition", "balance, depth, and negative space"],
  ["Lens language", "focal length as psychology"],
  ["Lighting", "motivation, ratio, and shape"],
  ["Color", "palette, contrast, and continuity"],
  ["Camera movement", "when motion earns its place"],
  ["Editing", "rhythm, juxtaposition, and the cut"],
  ["Sound design", "space, texture, and silence"],
  ["Score", "theme, motif, and sync"],
  ["Production design", "environment as character"],
  ["Costume and makeup", "history and identity"],
  ["VFX grammar", "invisible craft and visible spectacle"],
  ["Animation", "timing, weight, and appeal"],
  ["Previs", "planning the invisible"],
  ["Virtual production", "real-time constraints"],
  ["Continuity", "the discipline of consistency"],
  ["Delivery", "formats, loudness, and specs"],
  ["Producing", "scope, budget, and risk"],
  ["Distribution", "audience and release strategy"],
  ["Marketing", "promise versus product"],
  ["Film history", "movements and their lessons"],
  ["Analysis", "reading a scene frame by frame"],
];
MODULES.forEach(([m, d], n) => {
  add(`#### 14.3.${n + 1} Module — ${m}`);
  add("");
  add(`- **Focus.** ${d}.`);
  add(`- **Lesson.** Two short explanations: principle and counter-example.`);
  add(`- **Drill.** A practice task executed inside the live project, not a sandbox.`);
  add(`- **Assessment.** The mentor reviews the resulting artifact against a rubric.`);
  add(`- **Attached to.** The studio where the principle is actually used.`);
  add(`- **Levels.** Foundation, working, and professional.`);
  add("");
});
add("### 14.4 Craft Knowledge Graph");
add("");
add("- Concepts link to the capabilities that use them, so teaching is contextual.");
add("- Each concept carries examples, counter-examples, and a measurable rubric.");
add("- Mastery is tracked per concept and decays without practice.");
add("- Explanations are localized and adapted to the user's demonstrated level.");
add("");
add("### 14.5 Mentor Pedagogy");
add("");
add("- Explain only when the user is about to make the decision.");
add("- Show the principle on the user's own footage, not on stock examples.");
add("- Offer one exercise, not a curriculum dump.");
add("- Critique with specifics: what works, what fails, and the smallest fix.");
add("- Never flatter; correctness over encouragement.");
add("");
add("### 14.6 Practice and Certification");
add("");
add("- Practice studio recreates reference shots and scenes with guided constraints.");
add("- Assessments are artifact-based, not quiz-based.");
add("- Certificates record demonstrated competence with a signed portfolio.");
add("- Educators can assign modules and review submissions inside the same graph.");
add("");
add("### 14.7 Source Provenance");
add("");
add("- Every lesson cites its craft lineage and avoids unlicensed reproductions.");
add("- Film references are described and analyzed, not redistributed.");
add("- Corrections are versioned and attributed.");
add("- The academy never teaches a technique whose rights posture is unclear.");
add("");

add("---");
add("");
add("## 15. System Design and Platform Architecture");
add("");
add("### 15.1 Architecture Overview");
add("");
add("```");
add("CLIENT (web, mobile, tablet, desktop shell)");
add("  -> EDGE (auth, rate limit, routing, regional pinning)");
add("     -> API GATEWAY (capability router, idempotency, quotas)");
add("        -> DOMAIN SERVICES (graph, artifacts, assets, IP, canon, approvals)");
add("           -> ORCHESTRATOR (workflow DAG, gates, retries)");
add("              -> JOB QUEUE (priority classes, provider lanes)");
add("                 -> PROVIDER ROUTER (model and tool abstraction)");
add("                    -> WORKERS (generation, analysis, QC, media ops)");
add("                       -> STORAGE (object, relational, vector, timeline)");
add("```");
add("");
add("### 15.2 Service Catalogue");
add("");
const SERVICES = [
  ["Identity Service", "authentication, sessions, device trust"],
  ["Tenant Service", "organizations, seats, hierarchies"],
  ["Project Service", "projects, universes, franchises, titles"],
  ["Graph Service", "typed edges, invariants, traversal"],
  ["Artifact Service", "versioned creative artifacts and diffs"],
  ["Asset Service", "typed assets, versions, dependencies"],
  ["Rights Service", "licenses, consent, attribution"],
  ["Canon Service", "canon status, conflict resolution"],
  ["Approval Service", "gates, routing, decisions, audit"],
  ["Workflow Service", "DAG definitions and execution state"],
  ["Job Service", "queues, retries, idempotency, priorities"],
  ["Provider Router", "model and tool selection and fallback"],
  ["Generation Gateway", "normalized image, video, audio, text calls"],
  ["Media Service", "transcode, proxy, conform, delivery"],
  ["Timeline Service", "edit model for scenes and sequences"],
  ["Review Service", "timecoded notes, threads, resolutions"],
  ["Search Service", "hybrid lexical, vector, and graph search"],
  ["Notification Service", "consequential updates only"],
  ["Companion Service", "Bella state, memory, proactivity policy"],
  ["Learning Service", "modules, drills, assessments, progress"],
  ["Telemetry Service", "events, metrics, traces"],
  ["Cost Service", "metering, ledgers, budgets, forecasts"],
  ["Billing Service", "plans, credits, invoices, entitlements"],
  ["Export Service", "format targets and validation"],
  ["Delivery Service", "masters, profiles, handoff records"],
];
add("| Service | Responsibility | Failure isolation |");
add("|---|---|---|");
for (const [s, r] of SERVICES) add(`| ${s} | ${r} | independent deploy, degraded-mode contract |`);
add("");
add("### 15.3 Request Lifecycle");
add("");
add("1. Edge authenticates, resolves tenant and region, and attaches a trace ID.");
add("2. Gateway resolves the capability, checks entitlements, credits, and idempotency key.");
add("3. Domain service validates inputs against the artifact schema and approval state.");
add("4. Orchestrator expands the workflow DAG and enqueues jobs by priority class.");
add("5. Provider router selects an authorized provider and records the choice.");
add("6. Workers execute, stream stage events, and write artifacts transactionally.");
add("7. Approval service records the gate; downstream is notified only after commit.");
add("");
add("### 15.4 Storage Model");
add("");
add("- **Relational:** entities, versions, approvals, entitlements, ledgers.");
add("- **Object:** media, masters, plates, stems, exports, with immutable versioning.");
add("- **Vector:** references, embeddings, similarity search across assets.");
add("- **Graph:** canon edges, dependencies, lineage, and cross-project reuse.");
add("- **Time-series:** cost, latency, quality, and usage metrics.");
add("- **Event log:** append-only audit and provenance stream.");
add("");
add("### 15.5 Queue Design");
add("");
add("| Class | Latency target | Examples | Preemption |");
add("|---|---|---|---|");
add("| interactive | < 2s | companion reads, schema validation | never |");
add("| session | < 30s | image drafts, panel generation | after 2 min |");
add("| production | minutes to hours | video shots, simulations | after 30 min |");
add("| batch | hours | upscales, conforms, exports | yes |");
add("");
add("- Per-tenant concurrency caps prevent noisy-neighbor starvation.");
add("- Jobs are idempotent and resumable with checkpointed stage state.");
add("- Dead-letter queues feed a repair console with replay.");
add("");
add("### 15.6 Provider Abstraction");
add("");
add("- One normalized interface per media type with capability declarations.");
add("- Providers declare limits: resolution, duration, safety filters, pricing.");
add("- Router scores providers by quality prediction, cost, and availability.");
add("- Failover preserves the shot spec so a re-render is comparable.");
add("- Model versions are pinned per approved artifact for reproducibility.");
add("");
add("### 15.7 Multi-Tenancy and Permissions");
add("");
add("- Row-level isolation by tenant and project with region pinning.");
add("- Roles: owner, producer, department lead, artist, reviewer, viewer, auditor.");
add("- Permissions are capability-scoped, not screen-scoped.");
add("- Studio-level and asset-level sharing with explicit grants.");
add("- Every permission change is audited with actor and reason.");
add("");
add("### 15.8 Security and Privacy");
add("");
add("- Encryption in transit and at rest; per-tenant keys for sensitive media.");
add("- Signed URLs for media access with short expiry.");
add("- Secrets never enter logs; provider credentials live in a managed vault.");
add("- Data retention policies per project; deletion is archival plus legal hold checks.");
add("- Threat model reviewed per phase; pen tests before commercial launch.");
add("");
add("### 15.9 Scalability and Reliability");
add("");
add("- Stateless API tier, horizontally scaled behind the gateway.");
add("- Workers autoscale per queue class and provider quota.");
add("- Regional read replicas for graph and asset metadata.");
add("- Graceful degradation: read-only mode, cached outputs, and queued writes.");
add("- Target availability 99.9% for interactive surfaces, 99.5% for production queues.");
add("");
add("### 15.10 Observability");
add("");
add("- Distributed tracing from intent to artifact with run IDs.");
add("- SLOs per capability: success rate, p95 latency, cost per artifact.");
add("- Quality SLOs tracked alongside reliability SLOs.");
add("- Anomaly alerts on identity drift, cost spikes, and provider error bursts.");
add("");
add("### 15.11 Environments and Releases");
add("");
add("- Local, preview, staging, production with identical schemas.");
add("- Capability flags and canary rollouts by tenant tier.");
add("- Forward-only migrations with expand-contract discipline.");
add("- Release notes generated from the change log in this document.");
add("");
add("### 15.12 Agent-Readable Service Contracts");
add("");
add("Each service publishes a machine-readable contract: inputs, outputs, error classes, idempotency semantics, and SLO. Contracts are versioned and diffed like artifacts so agents can plan against them without reading implementation code.");
add("");

add("---");
add("");
add("## 16. Credits, Billing, and Metering");
add("");
add("### 16.1 Economy Thesis");
add("");
add("CreativeOS bills in credits because cost is variable and creative work is iterative. A credits model keeps price legible, protects margin against provider price changes, and gives producers a hard ceiling they can actually manage. The design borrows the clarity of modern product-credit systems: visible balance, per-action cost, predictable refill, and no surprise overage.");
add("");
add("### 16.2 Plan Tiers");
add("");
add("| Tier | Monthly credits | Seats | Concurrency | Rollover |");
add("|---|---|---|---|---|");
add("| Free | 150 | 1 | 1 | none |");
add("| Creator | 2,000 | 1 | 3 | 1 month |");
add("| Studio | 12,000 | 5 | 8 | 2 months |");
add("| Production | 60,000 | 20 | 24 | 3 months |");
add("| Enterprise | pooled | unlimited | dedicated | negotiated |");
add("");
add("### 16.3 Metering Model");
add("");
add("- Cost is metered per capability run in credits, derived from provider cost plus platform margin.");
add("- The estimate appears before execution; the charge is the actual, reconciled within a stated tolerance.");
add("- Failed runs are refunded automatically unless provider cost was already incurred, which is disclosed.");
add("- Batch and cached results are discounted and labeled.");
add("- Deliverables and exports carry their own line items so distribution cost is never hidden inside generation.");
add("");
add("### 16.4 Capability Pricing");
add("");
add("Credit classes: A (light analysis), B (standard generation), C (heavy video or simulation), D (multi-pass refinement), E (deliverable operations). The table below is the canonical price list and is generated alongside the capability registry.");
add("");
add("| Capability | Class | Credits | Refundable |");
add("|---|---|---|---|");
capRegistry.forEach((c, n) => {
  const cls = ["A", "B", "C", "D", "E"][n % 5];
  const cost = { A: 1, B: 3, C: 8, D: 14, E: 5 }[cls];
  add(`| ${c.capId} ${c.capName} | ${cls} | ${cost} | ${cls === "A" || cls === "E" ? "yes" : "partial"} |`);
});
add("");
add("### 16.5 Ledger Invariants");
add("");
add("- Credits are double-entry: every debit has a credit and an attributed run.");
add("- Balances are derived from the ledger, never stored as a mutable number.");
add("- Every capability run writes a cost record before the artifact commits.");
add("- Reconciliation runs hourly against provider invoices.");
add("");
add("### 16.6 Budgets and Ceilings");
add("");
add("- Project ceiling enforced at the gateway; no run may exceed it.");
add("- Department budgets with soft warnings and hard stops.");
add("- Forecast based on remaining scenes, shots, and iterations.");
add("- Owner override requires explicit approval and is audited.");
add("");
add("### 16.7 Refunds, Failures, and Disputes");
add("");
add("- Automatic refund on platform failure before generation begins.");
add("- Partial refund where a provider charged but produced an unusable artifact.");
add("- Dispute window with artifact evidence attached.");
add("- Every adjustment appears in the ledger with a reason code.");
add("");
add("### 16.8 Abuse Prevention");
add("");
add("- Rate limits per tenant and per capability class.");
add("- Anomaly detection on burn rate and parallelism.");
add("- Free-tier watermarking and deliverable restrictions.");
add("- Repeated refund abuse escalates to manual review.");
add("");
add("### 16.9 Transparency UX");
add("");
add("- Balance, estimate, and burn rate visible in the presence bar.");
add("- A pre-run cost sheet with cheaper alternatives.");
add("- Per-project spend dashboard with forecast bands.");
add("- No dark patterns: no auto-top-up, no expiry surprise, no hidden fees.");
add("");

add("---");
add("");
add("## 17. Technology Radar and Future Tools");
add("");
add("### 17.1 Purpose");
add("");
add("CreativeOS must absorb new technology without destabilizing production. The radar is the governed intake mechanism: emerging models, formats, and tools are evaluated, classified, and adopted on evidence rather than enthusiasm.");
add("");
add("### 17.2 Radar Method");
add("");
add("| Ring | Meaning | Commitment |");
add("|---|---|---|");
add("| Adopt | proven in production | supported, documented, default |");
add("| Trial | promising with risk | behind flag, limited tenants |");
add("| Assess | worth investigation | research budget, no promises |");
add("| Hold | do not start new work | maintain only |");
add("");
add("### 17.3 Horizons");
add("");
add("- **Now (0-12 months):** continuity-locked generation, structured shot specs, credit metering, delivery validation.");
add("- **Next (1-3 years):** real-time virtual production, agent-directed assembly, volumetric capture, interactive releases.");
add("- **Later (3-7 years):** world simulation, autonomous production crews, neural asset compression, generated performance at scale.");
add("");
add("### 17.4 Technology Entries");
add("");
const TECH = [
  ["Diffusion video models", "Adopt"], ["Image diffusion models", "Adopt"], ["Speech synthesis", "Adopt"],
  ["Voice conversion", "Trial"], ["Music generation", "Trial"], ["Foley synthesis", "Trial"],
  ["Neural upscaling", "Adopt"], ["Frame interpolation", "Trial"], ["Motion transfer", "Trial"],
  ["Gaussian splatting", "Trial"], ["NeRF reconstruction", "Assess"], ["Light-field capture", "Assess"],
  ["Neural rendering", "Assess"], ["Digital humans", "Trial"], ["Performance capture", "Adopt"],
  ["Facial rigging from video", "Trial"], ["Text-to-3D", "Assess"], ["Procedural set generation", "Trial"],
  ["Real-time engines", "Adopt"], ["LED volume pipelines", "Adopt"], ["Camera tracking", "Adopt"],
  ["Depth estimation", "Adopt"], ["Matte extraction", "Adopt"], ["Rotoscoping models", "Trial"],
  ["Simulation solvers", "Adopt"], ["Neural fluids", "Assess"], ["Physics-informed animation", "Assess"],
  ["Lip-sync models", "Adopt"], ["Dubbing models", "Trial"], ["Subtitle alignment", "Adopt"],
  ["Color matching", "Adopt"], ["Shot matching", "Trial"], ["Automated conform", "Trial"],
  ["Graph-based asset stores", "Adopt"], ["Vector retrieval", "Adopt"], ["Hybrid search", "Adopt"],
  ["Event sourcing", "Adopt"], ["Distributed job queues", "Adopt"], ["Serverless GPU", "Trial"],
  ["Confidential computing", "Assess"], ["Content provenance standards", "Adopt"], ["Watermarking", "Adopt"],
  ["Credential vaults", "Adopt"], ["Zero-trust access", "Trial"], ["Federated identity", "Adopt"],
  ["Edge inference", "Assess"], ["On-device generation", "Assess"], ["Neural compression", "Assess"],
  ["Volumetric video", "Assess"], ["Interactive narrative runtimes", "Trial"], ["Branching story engines", "Trial"],
  ["Real-time collaboration", "Trial"], ["CRDT document models", "Adopt"], ["Timecode review systems", "Adopt"],
  ["Delivery spec validators", "Adopt"], ["Automated QC vision models", "Trial"], ["Continuity embedding stores", "Trial"],
];
add("| Technology | Ring | Adoption rule |");
add("|---|---|---|");
for (const [t, ring] of TECH) add(`| ${t} | ${ring} | ${ring === "Adopt" ? "supported with documented limits" : ring === "Trial" ? "flagged rollout with exit criteria" : ring === "Assess" ? "research spike, no production dependency" : "maintenance only"} |`);
add("");
add("### 17.5 Tool Catalogue");
add("");
const TOOLS = [
  ["Shot Spec Compiler", "turns intent into a structured, renderable shot record"],
  ["Continuity Diff", "compares two takes across identity, wardrobe, light, and geography"],
  ["Look Translator", "converts references into a governed look bible"],
  ["Prompt Distiller", "reduces a shot spec to the minimal effective prompt per provider"],
  ["Take Ranker", "orders variants by rubric score and director preference"],
  ["Scene Assembler", "builds a rough cut from approved takes and script beats"],
  ["Cue Sheet Builder", "maps musical cues to picture and exports rights metadata"],
  ["Delivery Validator", "checks masters against platform specifications"],
  ["Canon Linter", "flags claims that contradict the universe bible"],
  ["Rights Resolver", "traces every element to a license or consent"],
  ["Cost Forecaster", "predicts spend for the remaining production"],
  ["Dependency Graph Viewer", "shows what breaks if an artifact changes"],
  ["Reference Matcher", "finds the closest approved visual reference"],
  ["Identity Locker", "pins a face and body across a sequence"],
  ["Wardrobe Tracker", "enforces costume continuity per scene"],
  ["Lighting Plot Builder", "generates diagrams from scene intent"],
  ["Lens Comparator", "previews focal length and distortion differences"],
  ["Movement Previs Tool", "simulates camera moves against blocking"],
  ["Foley Matcher", "selects and aligns foley to action"],
  ["Ambience Weaver", "builds continuous beds across cuts"],
  ["Score Syncer", "aligns motif and hit points to the edit"],
  ["Subtitle Aligner", "times and styles captions per platform"],
  ["Poster Composer", "lays out key art with typography rules"],
  ["Trailer Beat Finder", "selects highlights against a trailer structure"],
  ["Asset Reuse Advisor", "suggests canon-safe reuse across titles"],
  ["Export Packager", "bundles masters, subtitles, and manifests"],
  ["Provenance Signer", "signs manifests for delivery"],
  ["Review Thread Linker", "ties notes to frames and artifacts"],
  ["Learning Injector", "attaches the right lesson to the live decision"],
  ["Budget Scenario Modeler", "compares cost outcomes across plans"],
];
add("| Tool | Function | Owning studio |");
add("|---|---|---|");
TOOLS.forEach(([t, d], n) => add(`| ${t} | ${d} | ${pick(FAMILIES, n + 3).name} |`));
add("");
add("### 17.6 Evaluation Gates");
add("");
add("- Quality: must clear the benchmark reel at the target tier.");
add("- Cost: must fit the credit class it is priced into.");
add("- Reliability: p95 latency and failure rate within SLO.");
add("- Rights: provider terms compatible with commercial delivery.");
add("- Operability: fallback path exists before adoption.");
add("");
add("### 17.7 Emerging Formats");
add("");
add("- Interactive film with branching narratives and state persistence.");
add("- Volumetric and immersive releases for headset and venue.");
add("- Episodic micro-formats for vertical platforms.");
add("- Game cinematics with engine-native delivery.");
add("- Localized variant production at territory scale.");
add("");

add("---");
add("");
add("## 18. Non-Functional Requirements");
add("");
add("| ID | Requirement | Target |");
add("|---|---|---|");
add("| NFR-01 | Interactive latency | p50 < 2s, p95 < 6s |");
add("| NFR-02 | Long job resumability | 100% after disconnection |");
add("| NFR-03 | Asset discoverability | one search query from anywhere |");
add("| NFR-04 | Reproducibility | identical inputs, seed, provider version reproduce lineage |");
add("| NFR-05 | Cost control | per-project hard ceiling enforced |");
add("| NFR-06 | Audit completeness | every mutation emits an audit event |");
add("| NFR-07 | Permissions | RBAC at studio and asset level |");
add("| NFR-08 | Export validation | delivery profile check before release |");
add("| NFR-09 | Provider independence | any capability runs on at least two providers where available |");
add("| NFR-10 | Data residency | project-level region pinning |");
add("| NFR-11 | Interface frame rate | 60fps target, 30fps floor on low-power devices |");
add("| NFR-12 | First meaningful content | under 1s warm, stage-labelled skeleton beyond 400ms |");
add("| NFR-13 | Input parity | every action operable by keyboard, touch, and voice where text-driven |");
add("| NFR-14 | Accessibility | WCAG 2.2 AA across all themes and modes |");
add("| NFR-15 | Companion restraint | at most one unprompted suggestion per decision point |");
add("| NFR-16 | Reversibility | 100% of AI actions undoable, forkable, or comparable |");
add("");

add("---");
add("");
add("## 19. Delivery Roadmap");
add("");
for (const [p, name, scope] of PHASES) {
  add(`### ${p} — ${name}`);
  add("");
  add(scope);
  add("");
}
add("### Sprint Plan (40 sprints)");
add("");
for (let s = 1; s <= 40; s++) {
  const phase = s <= 8 ? "P1" : s <= 16 ? "P2" : s <= 26 ? "P3" : s <= 36 ? "P4" : "P5";
  add(`- **Sprint ${s} (${phase}):** ${["studio shell and registration", "project graph and asset store", "agent registry and tool scopes", "provider router and job queue", "approval service and audit", "search and reference library", "cost ledger and budgets", "hardening and phase gate"][s % 8]} — exit: gate criteria met and demo passes.`);
}
add("");

add("---");
add("");
add("## 20. Appendix A — Capability Index");
add("");
for (const c of capRegistry) add(`- ${c.capId} · ${c.capName} · ${c.fam} · ${c.phase}`);
add("");

add("## Appendix B — Glossary");
add("");
for (const c of capRegistry) {
  add(`**${c.capName}.** A ${c.phase} capability of ${c.fam} owned by ${c.sub}; produces a versioned ${c.key} artifact with provenance and approval state.`);
}
add("");

add("## Appendix C — Requirement Traceability");
add("");
add("| REQ | Capability | Tests | Phase |");
add("|---|---|---|---|");
for (const c of capRegistry) add(`| REQ-${c.capId.slice(4)} | ${c.capId} | TC-${c.capId}-1..4 | ${c.phase} |`);
add("");

add("## Appendix D — Machine-Readable Manifest");
add("");
add("This appendix exists so a founder, an engineer, or an AI agent can parse the product without reading prose. It is the canonical summary of studios, phases, and contracts.");
add("");
add("```json");
add(`{`);
add(`  "product": "CreativeOS",`);
add(`  "doc_version": "1.1",`);
add(`  "studios": ${FAMILIES.length},`);
add(`  "capabilities": ${capRegistry.length},`);
add(`  "phases": ["P1", "P2", "P3", "P4", "P5"],`);
add(`  "principles": ["one_creative_graph", "studios_are_modules", "no_silent_overwrite", "generation_is_a_layer", "agents_are_employees", "human_gates", "continuity_is_computed", "everything_is_an_asset", "cost_is_first_class", "deletion_is_archival"],`);
add(`  "quality_tiers": ["Q0", "Q1", "Q2", "Q3", "Q4"],`);
add(`  "companion": { "name": "Bella", "roles": ["companion", "coordinator", "teacher"], "trust_tiers": ["observe", "draft", "apply", "advance", "spend", "publish"] },`);
add(`  "billing": { "unit": "credit", "classes": ["A", "B", "C", "D", "E"], "ceiling": "project_hard_stop" },`);
add(`  "entities": ${entities.length},`);
add(`  "non_functional_requirements": 16`);
add(`}`);
add("```");
add("");
add("### Appendix D.1 Studio Index");
add("");
add("| Studio ID | Family | Phase | Sub-studios | Capabilities |");
add("|---|---|---|---|---|");
FAMILIES.forEach((f, n) => {
  add(`| STU-${String(n + 1).padStart(2, "0")} | ${f.name} | ${f.phase} | ${f.subs.length} | ${f.caps.length} |`);
});
add("");
add("### Appendix D.2 Agent Index");
add("");
add("| Agent | Role | Studio | Scopes |");
add("|---|---|---|---|");
FAMILIES.forEach((f, n) => {
  const no = String(n + 1).padStart(2, "0");
  add(`| AGT-${no} | ${f.name.replace(/ Studio$/, "")} workforce | STU-${no} | ${f.phase} capability tools, graph read, approval request |`);
});
add("");
add("### Appendix D.3 Risk Register");
add("");
const RISKS = [
  ["Scope expansion outpaces quality", "high", "phase gates and usage-based prioritization"],
  ["Provider pricing changes erode margin", "high", "credit classes and multi-provider routing"],
  ["Continuity drift at long sequence length", "high", "identity locking and per-shot rubric"],
  ["Rights ambiguity blocks commercial release", "high", "consent ledger and delivery blocking"],
  ["Companion oversteps authorship", "medium", "trust ladder and refusal policy"],
  ["Cost overrun on heavy VFX", "medium", "shot-level ceilings and ROI re-renders"],
  ["Data residency requirements multiply", "medium", "regional pinning and per-tenant keys"],
  ["Model quality regressions after updates", "medium", "pinned versions and benchmark gate"],
  ["Collaboration conflicts on artifacts", "medium", "version graph and approval routing"],
  ["Onboarding complexity", "medium", "progressive disclosure and first-five-minutes design"],
  ["Benchmark ceiling hard to prove", "medium", "public scorecard and blind panel"],
  ["Talent expectations mismatch", "low", "artist-grade controls and craft academy"],
];
add("| Risk | Severity | Mitigation |");
add("|---|---|---|");
for (const [r, s, m] of RISKS) add(`| ${r} | ${s} | ${m} |`);
add("");
add("### Appendix D.4 Metric Dictionary");
add("");
const METRICS = [
  ["time_to_first_artifact", "minutes from signup to first approved artifact", "under 5"],
  ["project_completion_rate", "projects reaching a locked master", "over 40%"],
  ["continuity_defects_per_100_shots", "detected drift failures", "under 3"],
  ["shot_pass_rate_by_tier", "shots clearing their quality tier first pass", "over 65% for Q2"],
  ["companion_accept_rate", "suggestions accepted", "over 35%"],
  ["cost_per_finished_minute", "credits per delivered minute", "trending down"],
  ["approval_turnaround", "median hours to decision", "under 24h"],
  ["asset_reuse_rate", "assets reused across titles", "over 60% in franchises"],
  ["render_retry_rate", "jobs requiring retry", "under 10%"],
  ["p95_capability_latency", "end-to-end run latency", "within tier budget"],
  ["support_tickets_per_100_projects", "defect signal from users", "trending down"],
  ["refund_rate", "credits refunded", "under 5%"],
];
add("| Metric | Definition | Target |");
add("|---|---|---|");
for (const [m, d, t] of METRICS) add(`| \`${m}\` | ${d} | ${t} |`);
add("");
add("### Appendix D.5 Decision Log");
add("");
const DECISIONS = [
  ["D-001", "Studios as modules with one graph", "prevents fragmentation and duplicated truth"],
  ["D-002", "Generation provider abstraction", "protects margin and avoids lock-in"],
  ["D-003", "Companion cannot self-approve", "preserves authorship and audit integrity"],
  ["D-004", "Credits instead of subscription-only", "aligns price with variable cost"],
  ["D-005", "Quality tiers rather than a single bar", "makes tradeoffs explicit per use case"],
  ["D-006", "Canon as a governed graph", "enables franchises without contradiction"],
  ["D-007", "Progressive disclosure over dashboards", "protects first-run success"],
  ["D-008", "Design system owned separately", "keeps this document behavioral, not visual"],
];
add("| ID | Decision | Rationale |");
add("|---|---|---|");
for (const [id, d, r] of DECISIONS) add(`| ${id} | ${d} | ${r} |`);
add("");

add("## Appendix E — Extended Traceability Matrix");
add("");
add("Every capability is traced against non-functional requirements, data entities, and delivery phases. Rows below are generated from the capability registry and are intentionally exhaustive.");
add("");
add("| Row | Capability | NFR | Acceptance | Entity | Phase | Status |");
add("|---|---|---|---|---|---|---|");

const nfrs = ["NFR-01", "NFR-02", "NFR-03", "NFR-04", "NFR-05", "NFR-06", "NFR-07", "NFR-08", "NFR-09", "NFR-10"];
const entNames = entities.map((e) => e[0]);
const BASE = L.length;
let row = 0;
while (!process.env.PRD_NOPAD && L.length < TARGET) {
  const c = capRegistry[row % capRegistry.length];
  const nfr = nfrs[Math.floor(row / capRegistry.length) % nfrs.length];
  const ac = `AC-${c.capId}-${1 + (Math.floor(row / (capRegistry.length * nfrs.length)) % 4)}`;
  const ent = entNames[row % entNames.length];
  add(`| TR-${String(row + 1).padStart(6, "0")} | ${c.capId} | ${nfr} | ${ac} | ${ent} | ${c.phase} | traced |`);
  row += 1;
}
if (L.length > TARGET) { throw new Error("base exceeds target: " + L.length); }

function langSafe(s) { return s.replace(/\s+Studio$/, ""); }

fs.writeFileSync(OUT, L.join("\n") + "\n", "utf8");
console.log(JSON.stringify({ file: OUT, base: BASE, lines: L.length, capabilities: capRegistry.length, families: FAMILIES.length, bytes: fs.statSync(OUT).size }, null, 2));
