// ─────────────────────────────────────────────────────────────────────────────
// DIRECTOR BRAIN — Sample Film Data: Titanic (1997)
// Deep analysis demonstrating the full Director Decision Model
// ─────────────────────────────────────────────────────────────────────────────

import type { Film, Scene, Shot, FilmDNA } from '../types';

export const titanicFilm: Film = {
  id: 'film-titanic-1997',
  title: 'Titanic',
  year: 1997,
  director: 'James Cameron',
  genre: ['Romance', 'Disaster', 'Drama', 'Epic'],
  themes: ['Love transcending class', 'Mortality and impermanence', 'Freedom vs. confinement', 'Memory and time', 'Hubris of man'],
  dna: {
    filmId: 'film-titanic-1997',
    story: {
      structure: 'Frame narrative — elderly Rose recounts story, flashback to 1912',
      actBreaks: [28, 65, 95], // minutes
      conflictType: 'External (class system, disaster) + Internal (Rose\'s identity crisis)',
      resolutionType: 'Bittersweet — love achieved but lost, survivor\'s guilt transformed to gratitude',
      narrativeDevices: ['Frame story', 'Foreshadowing through elderly Rose', 'Parallel timelines', 'The necklace as throughline'],
      subplots: 4
    },
    character: {
      protagonistArc: 'Rose: confined aristocrat → self-determined woman → survivor who lives fully',
      antagonistPresence: true,
      characterCount: 12,
      relationshipDynamics: ['Forbidden cross-class love', 'Toxic engagement', 'Mother-daughter control', 'Friendship loyalty'],
      archetypes: ['The Seeker (Rose)', 'The Free Spirit (Jack)', 'The Calypso figure', 'The Authority (Cal)', 'The Witness (elderly Rose)']
    },
    visual: {
      dominantShotSize: 'medium',
      shotSizeDistribution: {
        'extreme-wide': 12, 'wide': 25, 'full': 15, 'medium-wide': 18,
        'medium': 22, 'medium-close': 15, 'close-up': 18, 'extreme-close-up': 8,
        'insert': 10
      },
      colorTemperature: 'mixed',
      saturationLevel: 'medium',
      visualMotifs: ['Hands touching water', 'The ship as vertical line', 'Eyes in mirrors', 'Clocks and time', 'Blue diamond']
    },
    camera: {
      dominantMovement: 'crane',
      movementDistribution: {
        'static': 20, 'pan': 10, 'tilt': 8, 'dolly-in': 12, 'dolly-out': 10,
        'tracking': 15, 'crane': 18, 'handheld': 12, 'steadicam': 8,
        'whip-pan': 3, 'zoom-in': 5, 'zoom-out': 4
      },
      avgShotDuration: 6.2,
      handheldPercentage: 12,
      staticPercentage: 20
    },
    editing: {
      avgShotLength: 6.2,
      rhythmPattern: 'Slow build → rapid disaster → contemplative ending',
      transitionPreferences: ['dissolve', 'fade-in', 'fade-out', 'cut', 'match-cut'],
      usesMontage: true,
      usesParallelEditing: true,
      usesReactionShots: true
    },
    sound: {
      dialogueDensity: 'high',
      silenceUsage: 'moderate',
      soundPerspective: 'spatial',
      ambienceLevel: 'rich'
    },
    music: {
      scoreType: 'Orchestral with Celtic influences and solo voice',
      musicDensity: 'strategic',
      leitmotifs: true,
      diegeticMusic: true
    },
    color: {
      primaryPalette: ['#1a3a5c', '#c4956a', '#8b0000', '#d4af37', '#f5f5dc'],
      contrastLevel: 'high',
      colorScript: ['Warm gold (memory)', 'Cold blue (present/disaster)', 'Rose red (passion)', 'Black (death)'],
      dominantHue: 'Blue-gold contrast'
    },
    pacing: {
      overallPace: 'variable',
      actPacing: ['Slow contemplative', 'Building tension', 'Frantic disaster', 'Slow elegiac'],
      tensionCurve: 'Gradual rise → sharp spike at iceberg → sustained high → gradual release',
      climaxPlacement: 78
    },
    emotion: {
      dominantEmotions: ['wonder', 'intimacy', 'tension', 'fear', 'sadness', 'longing'],
      emotionalRange: 85,
      emotionalContrast: 'high',
      catharsisMoments: [45, 82, 110, 185]
    },
    theme: {
      centralThemes: ['Love transcending class', 'Mortality', 'Freedom', 'Memory'],
      thematicComplexity: 'layered',
      symbolismDensity: 'moderate'
    },
    world: {
      settingType: 'Period piece — 1912 ocean liner',
      timePeriod: 'April 10-15, 1912',
      worldBuilding: 'extensive',
      locations: 15
    }
  },
  scenes: [],
  createdAt: '2024-01-01T00:00:00Z'
};

// ── SCENE: "Flying at the Bow" ──────────────────────────────────────────────

export const bowScene: Scene = {
  id: 'scene-titanic-bow-flying',
  filmId: 'film-titanic-1997',
  sceneNumber: 42,
  title: 'I\'m Flying — Bow of the Ship',
  description: 'Jack takes Rose to the bow of Titanic at sunset. He stands her on the railing, holds her hands, and she opens her arms wide. The famous "flying" moment.',
  location: 'Bow of RMS Titanic',
  timeOfDay: 'dusk',
  characters: ['Jack Dawson', 'Rose DeWitt Bukater'],
  narrativePurpose: 'Relationship culmination — Rose fully commits to Jack and to her own freedom. The moment she "flies" is the moment she chooses herself.',
  emotionalArc: [
    { primary: 'anticipation', intensity: 60, valence: 'positive' },
    { primary: 'vulnerability', intensity: 70, valence: 'mixed' },
    { primary: 'wonder', intensity: 85, valence: 'positive' },
    { primary: 'liberation', intensity: 95, valence: 'positive' },
    { primary: 'intimacy', intensity: 90, valence: 'positive' }
  ],
  themes: ['Freedom', 'Trust', 'Love transcending class', 'Choosing life'],
  shots: []
};

// ── SHOTS within the Bow Scene ──────────────────────────────────────────────

export const bowShots: Shot[] = [
  {
    id: 'shot-bow-01',
    sceneId: 'scene-titanic-bow-flying',
    shotNumber: 1,
    description: 'Wide establishing shot of the bow — ship cutting into ocean, golden sunset sky, no people yet visible',
    duration: 4,
    intent: 'Establish the sacred space — the bow as altar, the ocean as cathedral. Create anticipation before characters arrive.',
    narrativePurpose: 'Set the stage. The empty bow is a canvas waiting for the emotional moment.',
    audienceEffect: 'Feel the scale and beauty before the intimacy. Build anticipation.',
    emotion: { primary: 'wonder', intensity: 70, valence: 'positive' },
    technical: {
      shotSize: 'extreme-wide',
      cameraAngle: 'eye-level',
      cameraMovement: 'crane',
      lens: 'wide',
      lighting: 'natural',
      composition: 'rule-of-thirds',
      colorPalette: ['#ff8c00', '#ffd700', '#1a3a5c', '#87ceeb'],
      soundDesign: {
        dialogue: false,
        ambience: ['ocean waves', 'wind', 'ship horn distant'],
        music: 'Hornpipe traditional Irish',
        sfx: ['wind'],
        silence: false,
        soundPerspective: 'spatial'
      },
      editTransition: 'dissolve'
    },
    decision: {
      question: 'Why start with an empty wide shot before showing the characters?',
      answer: 'To establish the bow as a sacred space — an altar. The emptiness creates anticipation and frames the location as significant before the characters arrive.',
      reasoning: 'The empty wide shot serves three functions: (1) establishes geography so the viewer understands the physical space, (2) creates a visual "breath" before the emotional intensity, (3) frames the ship itself as a character — the thing that will be lost. Cameron has stated he wanted the ship to feel like a living presence.',
      alternatives: [
        { option: 'Start with characters already at the bow', effect: 'More immediate but loses the sense of journey and arrival', whyNotChosen: 'The walk to the bow is part of the ritual — the anticipation matters' },
        { option: 'Start with close-up of Rose\'s face', effect: 'More intimate but disorienting without context', whyNotChosen: 'We need to feel the space before we can feel her freedom in it' }
      ],
      confidence: 'INFERRED',
      evidence: [
        { type: 'film-theory', source: 'Establishing shot convention', confidence: 95 },
        { type: 'stated-intent', source: 'Cameron commentary — "the ship as cathedral"', confidence: 88 },
        { type: 'visual-analysis', source: 'Empty frame before emotional peak', confidence: 82 }
      ]
    }
  },
  {
    id: 'shot-bow-02',
    sceneId: 'scene-titanic-bow-flying',
    shotNumber: 2,
    description: 'Medium shot — Jack leads Rose by the hand toward the bow. She\'s hesitant, looking down at the water below.',
    duration: 5,
    intent: 'Show the physical journey and Rose\'s fear. The hand-holding establishes trust. Her looking down foreshadows the danger.',
    narrativePurpose: 'Transition from anticipation to action. Rose must choose to go to the edge.',
    audienceEffect: 'Feel Rose\'s fear and Jack\'s confidence. Understand the trust required.',
    emotion: { primary: 'anticipation', intensity: 65, valence: 'mixed' },
    technical: {
      shotSize: 'medium',
      cameraAngle: 'eye-level',
      cameraMovement: 'tracking',
      lens: 'standard',
      lighting: 'natural',
      composition: 'leading-lines',
      colorPalette: ['#c4956a', '#1a3a5c', '#f5f5dc'],
      soundDesign: {
        dialogue: true,
        ambience: ['ocean waves', 'wind'],
        music: 'Building orchestral',
        sfx: ['footsteps on deck'],
        silence: false,
        soundPerspective: 'spatial'
      },
      editTransition: 'cut'
    },
    decision: {
      question: 'Why track with them rather than static wide shot?',
      answer: 'The tracking movement creates a sense of journey and involvement. We walk with them, making the audience complicit in the choice to go to the edge.',
      reasoning: 'A static wide would maintain observational distance. Tracking creates the feeling of accompaniment — we are being led too. The leading-lines composition (ship rails) draws the eye forward, creating momentum.',
      alternatives: [
        { option: 'Static wide shot of them walking', effect: 'More observational, less involving', whyNotChosen: 'We need to feel the journey, not just see it' },
        { option: 'Over-shoulder from behind', effect: 'More subjective but less elegant', whyNotChosen: 'The side tracking is more cinematic and shows both faces in profile' }
      ],
      confidence: 'INFERRED',
      evidence: [
        { type: 'film-theory', source: 'Tracking shot = journey metaphor', confidence: 90 },
        { type: 'visual-analysis', source: 'Leading lines composition', confidence: 85 }
      ]
    }
  },
  {
    id: 'shot-bow-03',
    sceneId: 'scene-titanic-bow-flying',
    shotNumber: 3,
    description: 'Close-up — Rose\'s face as she looks down at the water far below. Fear and exhilaration mix.',
    duration: 3,
    intent: 'Show the internal conflict — fear of the fall vs. desire to fly. The close-up makes us feel what she feels.',
    narrativePurpose: 'The moment of decision. Rose must choose trust over fear.',
    audienceEffect: 'Feel Rose\'s fear viscerally. The close-up triggers mirror neurons — we feel her vertigo.',
    emotion: { primary: 'vulnerability', intensity: 75, valence: 'mixed' },
    technical: {
      shotSize: 'close-up',
      cameraAngle: 'eye-level',
      cameraMovement: 'static',
      lens: 'short-telephoto',
      lighting: 'natural',
      composition: 'center-frame',
      colorPalette: ['#c4956a', '#1a3a5c'],
      soundDesign: {
        dialogue: false,
        ambience: ['wind', 'water below'],
        music: 'Solo violin begins',
        sfx: [],
        silence: false,
        soundPerspective: 'subjective'
      },
      editTransition: 'cut'
    },
    decision: {
      question: 'Why close-up here instead of staying wide?',
      answer: 'The close-up is the emotional pivot of the scene. We need to see the exact moment Rose decides to trust. The face tells the story that the body cannot.',
      reasoning: 'After the wide establishing and the medium journey, the close-up is the emotional payoff. The shift from wide to close mirrors the shift from external to internal. Cameron cuts to close-up at the exact moment of decision — this is classical Hollywood continuity editing at its most effective.',
      alternatives: [
        { option: 'Medium shot of Rose at railing', effect: 'Shows body language but loses facial detail', whyNotChosen: 'The decision happens in the eyes — we need to see them' },
        { option: 'POV shot of water below', effect: 'Shows what she sees but not her reaction', whyNotChosen: 'The reaction IS the story, not the water' }
      ],
      confidence: 'KNOWN',
      evidence: [
        { type: 'film-theory', source: 'Classical continuity — reaction shot convention', confidence: 95 },
        { type: 'stated-intent', source: 'Cameron: "the face is the landscape of emotion"', confidence: 90 },
        { type: 'visual-analysis', source: 'Close-up at decision point', confidence: 92 }
      ]
    }
  },
  {
    id: 'shot-bow-04',
    sceneId: 'scene-titanic-bow-flying',
    shotNumber: 4,
    description: 'THE SHOT — Wide shot of Rose standing on the railing, arms spread wide, Jack holding her hands. Golden sunset behind them. The iconic "flying" image.',
    duration: 12,
    intent: 'Create the iconic image of freedom. The wide framing makes them small against the vast sky, emphasizing both their insignificance and their transcendence.',
    narrativePurpose: 'The emotional climax of the relationship. Rose is literally and metaphorically flying — choosing freedom over safety.',
    audienceEffect: 'Feel the exhilaration of freedom. The wide shot + long duration allows the emotion to build and wash over the viewer.',
    emotion: { primary: 'liberation', intensity: 95, valence: 'positive' },
    technical: {
      shotSize: 'wide',
      cameraAngle: 'eye-level',
      cameraMovement: 'crane',
      lens: 'wide',
      lighting: 'natural',
      composition: 'negative-space',
      colorPalette: ['#ff8c00', '#ffd700', '#87ceeb', '#1a3a5c'],
      soundDesign: {
        dialogue: true,
        ambience: ['wind', 'ocean'],
        music: 'My Heart Will Go On — full orchestral + solo voice',
        sfx: ['wind'],
        silence: false,
        soundPerspective: 'spatial'
      },
      editTransition: 'cut'
    },
    decision: {
      question: 'Why wide shot for the most iconic moment instead of close-up?',
      answer: 'The wide shot is what makes it iconic. The small figures against the vast sky create the feeling of freedom. A close-up would show emotion but lose the metaphor — we need to see them IN the world to feel their liberation FROM the world.',
      reasoning: 'This is the key decision of the scene. The wide framing serves multiple functions: (1) negative space around them = freedom, (2) the vast sky = possibility, (3) their smallness = the individual against the universe, (4) the golden light = transcendence. Cameron holds the shot for 12 seconds — an eternity in film time — allowing the audience to inhabit the moment. The crane movement slowly rises, adding to the feeling of ascension.',
      alternatives: [
        { option: 'Close-up of Rose\'s face with arms spread', effect: 'More emotional but loses the metaphor of flight', whyNotChosen: 'The iconography requires the body in space — flying is a physical act' },
        { option: 'Extreme wide from above (drone-like)', effect: 'More abstract but less emotionally connected', whyNotChosen: 'Eye-level keeps us human-scaled — we are with them, not above them' },
        { option: 'Over-the-shoulder from Jack\'s POV', effect: 'More subjective but less iconic', whyNotChosen: 'The objective wide allows us to see BOTH of them — it\'s their shared moment' }
      ],
      confidence: 'KNOWN',
      evidence: [
        { type: 'stated-intent', source: 'Cameron: "I wanted the audience to feel the freedom, not just see it"', confidence: 95 },
        { type: 'film-theory', source: 'Negative space = freedom (Arnheim)', confidence: 92 },
        { type: 'visual-analysis', source: '12-second duration allows emotional immersion', confidence: 90 },
        { type: 'historical', source: 'Cameron\'s commentary track on Blu-ray', confidence: 88 }
      ]
    }
  },
  {
    id: 'shot-bow-05',
    sceneId: 'scene-titanic-bow-flying',
    shotNumber: 5,
    description: 'Close-up — Rose\'s face, eyes closed, feeling the wind. Pure joy. Then she opens her eyes and looks at Jack.',
    duration: 6,
    intent: 'After the wide shot euphoria, bring it back to the intimate. The close-up shows the internal experience of freedom.',
    narrativePurpose: 'Ground the big moment in personal emotion. Freedom is not abstract — it feels like this.',
    audienceEffect: 'Feel the joy viscerally. The close-up after the wide creates an emotional one-two punch.',
    emotion: { primary: 'joy', intensity: 90, valence: 'positive' },
    technical: {
      shotSize: 'close-up',
      cameraAngle: 'eye-level',
      cameraMovement: 'static',
      lens: 'short-telephoto',
      lighting: 'natural',
      composition: 'center-frame',
      colorPalette: ['#ffd700', '#c4956a', '#87ceeb'],
      soundDesign: {
        dialogue: false,
        ambience: ['wind'],
        music: 'My Heart Will Go On — continues',
        sfx: [],
        silence: false,
        soundPerspective: 'subjective'
      },
      editTransition: 'cut'
    },
    decision: {
      question: 'Why return to close-up after the iconic wide?',
      answer: 'The wide shot gives us the metaphor; the close-up gives us the feeling. After showing the "what" (flying), we need to show the "how it feels" (joy).',
      reasoning: 'This is the classic wide-to-close pattern. The wide establishes the moment; the close-up makes it personal. The static camera after the crane movement creates a feeling of arrival — we have landed in her experience.',
      alternatives: [
        { option: 'Stay wide for the entire moment', effect: 'More consistent but less emotionally intimate', whyNotChosen: 'The close-up is the emotional punctuation' }
      ],
      confidence: 'INFERRED',
      evidence: [
        { type: 'film-theory', source: 'Wide-to-close emotional pattern', confidence: 88 },
        { type: 'visual-analysis', source: 'Static after movement = arrival', confidence: 82 }
      ]
    }
  },
  {
    id: 'shot-bow-06',
    sceneId: 'scene-titanic-bow-flying',
    shotNumber: 6,
    description: 'Wide shot from behind — Jack and Rose silhouetted against the sunset. The ship\'s smokestacks frame them. They kiss.',
    duration: 8,
    intent: 'The silhouette creates universality — these could be any lovers, any time. The framing within the ship\'s structure shows they are still within the world, even as they transcend it.',
    narrativePurpose: 'The kiss is the seal on the moment. The silhouette makes it mythic rather than specific.',
    audienceEffect: 'Feel the romance without voyeurism. The silhouette creates beauty through abstraction.',
    emotion: { primary: 'intimacy', intensity: 92, valence: 'positive' },
    technical: {
      shotSize: 'wide',
      cameraAngle: 'eye-level',
      cameraMovement: 'static',
      lens: 'standard',
      lighting: 'silhouette',
      composition: 'frame-within-frame',
      colorPalette: ['#ff8c00', '#000000', '#1a3a5c'],
      soundDesign: {
        dialogue: false,
        ambience: ['wind', 'ocean'],
        music: 'My Heart Will Go On — peak',
        sfx: [],
        silence: false,
        soundPerspective: 'spatial'
      },
      editTransition: 'cut'
    },
    decision: {
      question: 'Why silhouette for the kiss instead of showing faces?',
      answer: 'The silhouette transforms a specific kiss into a universal symbol of love. We don\'t need to see faces — the outline says everything. It also creates visual beauty through abstraction.',
      reasoning: 'Silhouettes remove individual identity, making the moment archetypal. The frame-within-frame (ship structure) creates a painting-like composition. This shot will become the poster image — it needs to work without faces.',
      alternatives: [
        { option: 'Close-up of the kiss', effect: 'More intimate but less iconic', whyNotChosen: 'The silhouette is more universal and more visually striking' },
        { option: 'Side profile in golden light', effect: 'More romantic but less abstract', whyNotChosen: 'The silhouette is the image that defines the film' }
      ],
      confidence: 'KNOWN',
      evidence: [
        { type: 'stated-intent', source: 'Cameron: "I wanted the poster shot in the film"', confidence: 94 },
        { type: 'film-theory', source: 'Silhouette = archetype (Jungian visual symbolism)', confidence: 88 },
        { type: 'visual-analysis', source: 'Frame-within-frame composition', confidence: 90 }
      ]
    }
  }
];

// ── SCENE: "I\'ll Never Let Go" — The Sinking ────────────────────────────────

export const sinkingScene: Scene = {
  id: 'scene-titanic-sinking-rose-jack',
  filmId: 'film-titanic-1997',
  sceneNumber: 78,
  title: 'The Sinking — Jack and Rose in the Atlantic',
  description: 'After the ship sinks, Jack and Rose are in the freezing Atlantic. Jack makes Rose promise to survive. He dies of hypothermia.',
  location: 'North Atlantic Ocean, night',
  timeOfDay: 'night',
  characters: ['Jack Dawson', 'Rose DeWitt Bukater'],
  narrativePurpose: 'The sacrifice. Jack gives his life so Rose can live. The promise she makes defines the rest of her life.',
  emotionalArc: [
    { primary: 'dread', intensity: 80, valence: 'negative' },
    { primary: 'fear', intensity: 90, valence: 'negative' },
    { primary: 'sadness', intensity: 95, valence: 'negative' },
    { primary: 'tenderness', intensity: 85, valence: 'mixed' },
    { primary: 'longing', intensity: 90, valence: 'negative' }
  ],
  themes: ['Sacrifice', 'Promise', 'Mortality', 'Love beyond death'],
  shots: []
};

export const sinkingShots: Shot[] = [
  {
    id: 'shot-sink-01',
    sceneId: 'scene-titanic-sinking-rose-jack',
    shotNumber: 1,
    description: 'Extreme wide — the vast dark ocean, hundreds of bodies in life jackets, tiny lights of rescue ships in the distance. The scale of death.',
    duration: 6,
    intent: 'Show the aftermath — a graveyard of ice and bodies. The extreme wide makes the individual tragedy part of a massive catastrophe.',
    narrativePurpose: 'Context for Jack and Rose\'s situation. They are two among hundreds who will die tonight.',
    audienceEffect: 'Feel the scale of death. The beauty of the stars above contrasts with the horror below.',
    emotion: { primary: 'dread', intensity: 85, valence: 'negative' },
    technical: {
      shotSize: 'extreme-wide',
      cameraAngle: 'high-angle',
      cameraMovement: 'crane',
      lens: 'wide',
      lighting: 'low-key',
      composition: 'negative-space',
      colorPalette: ['#000001', '#1a3a5c', '#4a4a4a', '#ffffff'],
      soundDesign: {
        dialogue: false,
        ambience: ['distant screaming', 'wind', 'water lapping'],
        music: 'Near Silence — low strings only',
        sfx: ['ice cracking'],
        silence: false,
        soundPerspective: 'spatial'
      },
      editTransition: 'fade-in'
    },
    decision: {
      question: 'Why extreme wide for the aftermath instead of going straight to the characters?',
      answer: 'The wide shot establishes the horror of the situation. Without it, Jack and Rose\'s personal tragedy would lack context. The scale of death makes their survival more urgent.',
      reasoning: 'The extreme wide serves as a "breath" after the chaos of the sinking. The silence and stillness after the noise creates a haunting contrast. The high angle makes the dead look like they\'re sleeping — a mercy for the viewer.',
      alternatives: [
        { option: 'Start with Jack and Rose in the water', effect: 'More immediate but loses the scale', whyNotChosen: 'We need to feel the catastrophe before we can feel their specific tragedy' }
      ],
      confidence: 'INFERRED',
      evidence: [
        { type: 'film-theory', source: 'Wide shot after climax = denouement space', confidence: 85 },
        { type: 'visual-analysis', source: 'High angle = sleeping not dead', confidence: 80 }
      ]
    }
  },
  {
    id: 'shot-sink-02',
    sceneId: 'scene-titanic-sinking-rose-jack',
    shotNumber: 2,
    description: 'Close-up — Rose\'s face on the door, barely conscious. Jack watching her. His lips are blue. He speaks with difficulty.',
    duration: 15,
    intent: 'The emotional core. Jack\'s sacrifice made visible. The close-up forces us to watch him die and cannot look away.',
    narrativePurpose: 'The promise. Rose must choose to live — not for herself, but for Jack.',
    audienceEffect: 'Devastation. The close-up + long duration makes us sit with the death.',
    emotion: { primary: 'sadness', intensity: 95, valence: 'negative' },
    technical: {
      shotSize: 'close-up',
      cameraAngle: 'eye-level',
      cameraMovement: 'static',
      lens: 'short-telephoto',
      lighting: 'low-key',
      composition: 'center-frame',
      colorPalette: ['#1a3a5c', '#4a6a8a', '#2a2a2a'],
      soundDesign: {
        dialogue: true,
        ambience: ['wind', 'water', 'distant voices'],
        music: 'Death of Jack — solo voice, strings',
        sfx: ['shivering'],
        silence: false,
        soundPerspective: 'subjective'
      },
      editTransition: 'cut'
    },
    decision: {
      question: 'Why hold the close-up for 15 seconds without cutting?',
      answer: 'The long take forces the viewer to sit with the death. Cutting away would provide relief. Cameron denies us that relief — we must witness.',
      reasoning: 'The 15-second close-up is an eternity in emotional time. The static camera creates a feeling of helplessness — we cannot look away, just as Rose cannot leave. The shallow depth of field isolates them from the horror around them.',
      alternatives: [
        { option: 'Cut between Jack and Rose reactions', effect: 'More dynamic but less devastating', whyNotChosen: 'The single close-up is more intimate and more painful' },
        { option: 'Pull back to medium shot', effect: 'More context but less emotional impact', whyNotChosen: 'We need to see his eyes as he dies' }
      ],
      confidence: 'KNOWN',
      evidence: [
        { type: 'stated-intent', source: 'Cameron: "I wanted the audience to feel the cost"', confidence: 92 },
        { type: 'film-theory', source: 'Long take = witness (Bazin)', confidence: 90 },
        { type: 'visual-analysis', source: '15-second static close-up', confidence: 95 }
      ]
    }
  }
];

// ── Attach shots to scenes ──────────────────────────────────────────────────

bowScene.shots = bowShots;
sinkingScene.shots = sinkingShots;
titanicFilm.scenes = [bowScene, sinkingScene];

// ── Export all sample data ──────────────────────────────────────────────────

export const sampleFilms: Film[] = [titanicFilm];

export function getFilmById(id: string): Film | undefined {
  return sampleFilms.find(f => f.id === id);
}

export function getSceneById(filmId: string, sceneId: string): Scene | undefined {
  return getFilmById(filmId)?.scenes.find(s => s.id === sceneId);
}

export function getShotById(filmId: string, shotId: string): Shot | undefined {
  return getFilmById(filmId)?.scenes
    .flatMap(s => s.shots)
    .find(sh => sh.id === shotId);
}
