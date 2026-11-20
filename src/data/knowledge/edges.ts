import type { KnowledgeEdgeType } from '@/types/knowledgeGraph';

export interface KnowledgeEdgeSpec {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: KnowledgeEdgeType;
  weight?: number;
  confidence?: number;
  sourceIds?: string[];
}

export const KNOWLEDGE_EDGES: KnowledgeEdgeSpec[] = [
  // Consciousness internal
  { id: 'e1', sourceId: 'concept::consciousness::self-awareness', targetId: 'concept::consciousness::awareness', relationshipType: 'IS_A' },
  { id: 'e2', sourceId: 'concept::consciousness::meta-awareness', targetId: 'concept::consciousness::awareness', relationshipType: 'IS_A' },
  { id: 'e3', sourceId: 'concept::consciousness::present-awareness', targetId: 'concept::consciousness::awareness', relationshipType: 'IS_A' },
  { id: 'e4', sourceId: 'concept::consciousness::bodily-awareness', targetId: 'concept::consciousness::awareness', relationshipType: 'IS_A' },
  { id: 'e5', sourceId: 'concept::consciousness::emotional-awareness', targetId: 'concept::consciousness::awareness', relationshipType: 'IS_A' },
  { id: 'e6', sourceId: 'concept::consciousness::thought-awareness', targetId: 'concept::consciousness::awareness', relationshipType: 'IS_A' },
  { id: 'e7', sourceId: 'concept::consciousness::focused-attention', targetId: 'concept::consciousness::attention', relationshipType: 'IS_A' },
  { id: 'e8', sourceId: 'concept::consciousness::sustained-attention', targetId: 'concept::consciousness::attention', relationshipType: 'IS_A' },
  { id: 'e9', sourceId: 'concept::consciousness::selective-attention', targetId: 'concept::consciousness::attention', relationshipType: 'IS_A' },
  { id: 'e10', sourceId: 'concept::consciousness::open-monitoring', targetId: 'concept::consciousness::attention', relationshipType: 'IS_A' },
  { id: 'e11', sourceId: 'concept::consciousness::focused-attention', targetId: 'concept::consciousness::attention-regulation', relationshipType: 'SUPPORTS' },
  { id: 'e12', sourceId: 'concept::consciousness::open-monitoring', targetId: 'concept::consciousness::attention-regulation', relationshipType: 'SUPPORTS' },
  { id: 'e13', sourceId: 'concept::consciousness::thought-observation', targetId: 'concept::consciousness::self-awareness', relationshipType: 'DEVELOPS' },
  { id: 'e14', sourceId: 'concept::consciousness::emotional-observation', targetId: 'concept::consciousness::emotional-awareness', relationshipType: 'DEVELOPS' },
  { id: 'e15', sourceId: 'concept::consciousness::self-inquiry', targetId: 'concept::consciousness::ego-identification', relationshipType: 'EXPLORED_THROUGH' },
  { id: 'e16', sourceId: 'concept::consciousness::self-inquiry', targetId: 'concept::consciousness::thought-identification', relationshipType: 'EXPLORED_THROUGH' },
  { id: 'e17', sourceId: 'concept::consciousness::witness', targetId: 'concept::consciousness::non-identification', relationshipType: 'SUPPORTS' },
  { id: 'e18', sourceId: 'concept::consciousness::thought-identification', targetId: 'concept::consciousness::self-awareness', relationshipType: 'ASSOCIATED_WITH' },
  { id: 'e19', sourceId: 'concept::consciousness::presence', targetId: 'concept::consciousness::embodiment', relationshipType: 'ASSOCIATED_WITH' },
  { id: 'e20', sourceId: 'concept::consciousness::mindfulness', targetId: 'concept::consciousness::present-awareness', relationshipType: 'SUPPORTS' },

  // Mind
  { id: 'e21', sourceId: 'concept::mind::rumination', targetId: 'concept::mind::thought', relationshipType: 'IS_A' },
  { id: 'e22', sourceId: 'concept::mind::worry', targetId: 'concept::mind::thought', relationshipType: 'IS_A' },
  { id: 'e23', sourceId: 'concept::mind::mind-wandering', targetId: 'concept::mind::thought', relationshipType: 'IS_A' },
  { id: 'e24', sourceId: 'concept::mind::cognitive-bias', targetId: 'concept::mind::cognition', relationshipType: 'PART_OF' },
  { id: 'e25', sourceId: 'concept::mind::mental-model', targetId: 'concept::mind::cognition', relationshipType: 'PART_OF' },
  { id: 'e26', sourceId: 'concept::behaviour::recurring-thought-pattern', targetId: 'concept::mind::cognitive-bias', relationshipType: 'ASSOCIATED_WITH' },

  // Psychology
  { id: 'e27', sourceId: 'concept::psychology::fear', targetId: 'concept::psychology::emotion', relationshipType: 'IS_A' },
  { id: 'e28', sourceId: 'concept::psychology::anger', targetId: 'concept::psychology::emotion', relationshipType: 'IS_A' },
  { id: 'e29', sourceId: 'concept::psychology::sadness', targetId: 'concept::psychology::emotion', relationshipType: 'IS_A' },
  { id: 'e30', sourceId: 'concept::psychology::joy', targetId: 'concept::psychology::emotion', relationshipType: 'IS_A' },
  { id: 'e31', sourceId: 'concept::psychology::shame', targetId: 'concept::psychology::emotion', relationshipType: 'IS_A' },
  { id: 'e32', sourceId: 'concept::psychology::emotional-regulation', targetId: 'concept::psychology::emotion', relationshipType: 'SUPPORTS' },
  { id: 'e33', sourceId: 'concept::psychology::attachment', targetId: 'concept::psychology::identity', relationshipType: 'MAY_INFLUENCE' },
  { id: 'e34', sourceId: 'concept::psychology::shadow', targetId: 'concept::psychology::identity', relationshipType: 'PART_OF' },
  { id: 'e35', sourceId: 'concept::psychology::emotional-maturity', targetId: 'concept::psychology::emotional-regulation', relationshipType: 'DEVELOPS' },
  { id: 'e36', sourceId: 'concept::psychology::psychological-integration', targetId: 'concept::psychology::shadow', relationshipType: 'SUPPORTS' },

  // Yoga
  { id: 'e37', sourceId: 'concept::yoga::ashtanga', targetId: 'concept::yoga::yama', relationshipType: 'PART_OF' },
  { id: 'e38', sourceId: 'concept::yoga::ashtanga', targetId: 'concept::yoga::niyama', relationshipType: 'PART_OF' },
  { id: 'e39', sourceId: 'concept::yoga::ashtanga', targetId: 'concept::yoga::asana', relationshipType: 'PART_OF' },
  { id: 'e40', sourceId: 'concept::yoga::ashtanga', targetId: 'concept::yoga::pranayama', relationshipType: 'PART_OF' },
  { id: 'e41', sourceId: 'concept::yoga::ashtanga', targetId: 'concept::yoga::pratyahara', relationshipType: 'PART_OF' },
  { id: 'e42', sourceId: 'concept::yoga::ashtanga', targetId: 'concept::yoga::dharana', relationshipType: 'PART_OF' },
  { id: 'e43', sourceId: 'concept::yoga::ashtanga', targetId: 'concept::yoga::dhyana', relationshipType: 'PART_OF' },
  { id: 'e44', sourceId: 'concept::yoga::ashtanga', targetId: 'concept::yoga::samadhi', relationshipType: 'PART_OF' },
  { id: 'e45', sourceId: 'concept::yoga::dharana', targetId: 'concept::yoga::dhyana', relationshipType: 'PRECEDES' },
  { id: 'e46', sourceId: 'concept::yoga::dhyana', targetId: 'concept::yoga::samadhi', relationshipType: 'PRECEDES' },
  { id: 'e47', sourceId: 'concept::yoga::pranayama', targetId: 'concept::yoga::pratyahara', relationshipType: 'PRECEDES' },
  { id: 'e48', sourceId: 'concept::yoga::viveka', targetId: 'concept::yoga::jnana-yoga', relationshipType: 'PART_OF' },
  { id: 'e49', sourceId: 'concept::yoga::vairagya', targetId: 'concept::yoga::jnana-yoga', relationshipType: 'PART_OF' },
  { id: 'e50', sourceId: 'concept::yoga::atma-vichara', targetId: 'concept::yoga::jnana-yoga', relationshipType: 'PART_OF' },
  { id: 'e51', sourceId: 'concept::yoga::atma-vichara', targetId: 'concept::consciousness::self-inquiry', relationshipType: 'SIMILAR_TO' },
  { id: 'e52', sourceId: 'concept::yoga::nishkama-karma', targetId: 'concept::yoga::karma-yoga', relationshipType: 'PART_OF' },
  { id: 'e53', sourceId: 'concept::yoga::surrender', targetId: 'concept::yoga::bhakti-yoga', relationshipType: 'PART_OF' },
  { id: 'e54', sourceId: 'concept::yoga::raja-yoga', targetId: 'concept::yoga::ashtanga', relationshipType: 'DESCRIBED_IN', sourceIds: ['source::yoga-sutras'] },

  // Spirituality
  { id: 'e55', sourceId: 'concept::spirituality::vedanta', targetId: 'concept::spirituality::upanishads', relationshipType: 'DERIVED_FROM' },
  { id: 'e56', sourceId: 'concept::spirituality::advaita', targetId: 'concept::spirituality::vedanta', relationshipType: 'PART_OF' },
  { id: 'e57', sourceId: 'concept::spirituality::atman', targetId: 'concept::spirituality::brahman', relationshipType: 'SIMILAR_TO' },
  { id: 'e58', sourceId: 'concept::spirituality::maya', targetId: 'concept::spirituality::atman', relationshipType: 'ASSOCIATED_WITH' },
  { id: 'e59', sourceId: 'concept::spirituality::moksha', targetId: 'concept::spirituality::samsara', relationshipType: 'FOLLOWS' },
  { id: 'e60', sourceId: 'concept::spirituality::nirvana', targetId: 'concept::spirituality::samsara', relationshipType: 'FOLLOWS' },
  { id: 'e61', sourceId: 'concept::spirituality::bhagavad-gita', targetId: 'concept::yoga::karma-yoga', relationshipType: 'DESCRIBED_IN' },
  { id: 'e62', sourceId: 'concept::spirituality::yoga-sutras', targetId: 'concept::yoga::dharana', relationshipType: 'DESCRIBED_IN' },

  // Neuroscience
  { id: 'e63', sourceId: 'concept::neuroscience::autonomic-nervous-system', targetId: 'concept::neuroscience::sympathetic', relationshipType: 'PART_OF' },
  { id: 'e64', sourceId: 'concept::neuroscience::autonomic-nervous-system', targetId: 'concept::neuroscience::parasympathetic', relationshipType: 'PART_OF' },
  { id: 'e65', sourceId: 'concept::neuroscience::vagus-nerve', targetId: 'concept::neuroscience::parasympathetic', relationshipType: 'SUPPORTS' },
  { id: 'e66', sourceId: 'concept::neuroscience::neuroplasticity', targetId: 'concept::neuroscience::prefrontal-cortex', relationshipType: 'MAY_INFLUENCE' },
  { id: 'e67', sourceId: 'concept::neuroscience::default-mode-network', targetId: 'concept::mind::mind-wandering', relationshipType: 'ASSOCIATED_WITH' },
  { id: 'e68', sourceId: 'concept::neuroscience::amygdala', targetId: 'concept::psychology::fear', relationshipType: 'ASSOCIATED_WITH' },
  { id: 'e69', sourceId: 'concept::neuroscience::interoception-ns', targetId: 'concept::consciousness::bodily-awareness', relationshipType: 'SIMILAR_TO' },
  { id: 'e70', sourceId: 'concept::neuroscience::attention-ns', targetId: 'concept::consciousness::attention', relationshipType: 'SIMILAR_TO' },

  // Body
  { id: 'e71', sourceId: 'concept::body::diaphragmatic-breathing', targetId: 'concept::body::breath', relationshipType: 'IS_A' },
  { id: 'e72', sourceId: 'concept::body::nadi-shodhana', targetId: 'concept::body::breath', relationshipType: 'IS_A' },
  { id: 'e73', sourceId: 'concept::body::box-breathing', targetId: 'concept::body::breath', relationshipType: 'IS_A' },
  { id: 'e74', sourceId: 'concept::body::bhramari', targetId: 'concept::body::breath', relationshipType: 'IS_A' },
  { id: 'e75', sourceId: 'concept::body::nadi-shodhana', targetId: 'concept::yoga::pranayama', relationshipType: 'PRACTICED_THROUGH' },
  { id: 'e76', sourceId: 'concept::body::box-breathing', targetId: 'concept::neuroscience::parasympathetic', relationshipType: 'SUPPORTS' },
  { id: 'e77', sourceId: 'concept::body::sleep', targetId: 'concept::neuroscience::nervous-system', relationshipType: 'ASSOCIATED_WITH' },
  // Behaviour
  { id: 'e79', sourceId: 'concept::behaviour::behavioural-loop', targetId: 'concept::behaviour::habit', relationshipType: 'ASSOCIATED_WITH' },
  { id: 'e80', sourceId: 'concept::behaviour::avoidance', targetId: 'concept::behaviour::behavioural-loop', relationshipType: 'PART_OF' },
  { id: 'e81', sourceId: 'concept::behaviour::conditioning', targetId: 'concept::behaviour::habit', relationshipType: 'CAUSES' },
  { id: 'e82', sourceId: 'concept::behaviour::recurring-thought-pattern', targetId: 'concept::behaviour::behavioural-loop', relationshipType: 'ASSOCIATED_WITH' },
  { id: 'e83', sourceId: 'concept::behaviour::pattern-recognition', targetId: 'concept::consciousness::meta-awareness', relationshipType: 'SUPPORTS' },

  // Life
  { id: 'e84', sourceId: 'concept::life::work-stress', targetId: 'concept::life::career', relationshipType: 'APPLIES_TO' },


  // Transformation practices
  { id: 'e86', sourceId: 'concept::transformation::witness-meditation', targetId: 'concept::consciousness::witness', relationshipType: 'PRACTICED_THROUGH' },
  { id: 'e87', sourceId: 'concept::transformation::open-awareness-practice', targetId: 'concept::consciousness::open-monitoring', relationshipType: 'PRACTICED_THROUGH' },
  { id: 'e88', sourceId: 'concept::transformation::focused-attention-practice', targetId: 'concept::consciousness::focused-attention', relationshipType: 'PRACTICED_THROUGH' },
  { id: 'e89', sourceId: 'concept::transformation::body-scan', targetId: 'concept::consciousness::bodily-awareness', relationshipType: 'PRACTICED_THROUGH' },
  { id: 'e90', sourceId: 'concept::transformation::self-inquiry-practice', targetId: 'concept::consciousness::self-inquiry', relationshipType: 'PRACTICED_THROUGH' },
  { id: 'e91', sourceId: 'concept::transformation::meditation', targetId: 'concept::yoga::dhyana', relationshipType: 'SIMILAR_TO' },
  { id: 'e92', sourceId: 'concept::transformation::breathwork', targetId: 'concept::yoga::pranayama', relationshipType: 'SIMILAR_TO' },
  { id: 'e93', sourceId: 'concept::transformation::integration', targetId: 'concept::psychology::psychological-integration', relationshipType: 'SIMILAR_TO' },
  { id: 'e94', sourceId: 'concept::transformation::reflection', targetId: 'concept::yoga::manana', relationshipType: 'SIMILAR_TO' },
  { id: 'e95', sourceId: 'concept::transformation::contemplation', targetId: 'concept::yoga::nididhyasana', relationshipType: 'SIMILAR_TO' },
  { id: 'e96', sourceId: 'concept::transformation::grounding', targetId: 'concept::consciousness::presence', relationshipType: 'SUPPORTS' },
  { id: 'e97', sourceId: 'concept::transformation::evening-reflection', targetId: 'concept::transformation::reflection', relationshipType: 'IS_A' },
  { id: 'e98', sourceId: 'concept::transformation::emotional-reflection', targetId: 'concept::transformation::reflection', relationshipType: 'IS_A' },
  { id: 'e99', sourceId: 'concept::transformation::gratitude', targetId: 'concept::psychology::joy', relationshipType: 'SUPPORTS' },
  { id: 'e100', sourceId: 'concept::transformation::journey', targetId: 'concept::transformation::progression', relationshipType: 'ASSOCIATED_WITH' },
];
