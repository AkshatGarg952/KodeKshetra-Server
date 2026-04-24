const PERSONAS_BY_TOPIC = {
  array: [
    { key: 'array_monk', name: 'Array Monk', specialization: 'array', speedProfile: 'balanced', stability: 0.72 },
    { key: 'array_architect', name: 'Array Architect', specialization: 'array', speedProfile: 'fast', stability: 0.68 }
  ],
  string: [
    { key: 'string_weaver', name: 'String Weaver', specialization: 'string', speedProfile: 'balanced', stability: 0.7 }
  ],
  graph: [
    { key: 'graph_phantom', name: 'Graph Phantom', specialization: 'graph', speedProfile: 'analytical', stability: 0.75 }
  ],
  dfs: [
    { key: 'depth_raider', name: 'Depth Raider', specialization: 'dfs', speedProfile: 'analytical', stability: 0.69 }
  ],
  bfs: [
    { key: 'queue_hunter', name: 'Queue Hunter', specialization: 'bfs', speedProfile: 'balanced', stability: 0.67 }
  ],
  dp: [
    { key: 'dp_sentinel', name: 'DP Sentinel', specialization: 'dp', speedProfile: 'slow-and-steady', stability: 0.8 }
  ],
  greedy: [
    { key: 'greedy_raider', name: 'Greedy Raider', specialization: 'greedy', speedProfile: 'fast', stability: 0.64 }
  ],
  tree: [
    { key: 'tree_keeper', name: 'Tree Keeper', specialization: 'tree', speedProfile: 'balanced', stability: 0.71 }
  ],
  binarysearchtree: [
    { key: 'binary_sage', name: 'Binary Sage', specialization: 'binarysearchtree', speedProfile: 'analytical', stability: 0.77 }
  ],
  searching: [
    { key: 'binary_sage', name: 'Binary Sage', specialization: 'searching', speedProfile: 'fast', stability: 0.73 }
  ],
  math: [
    { key: 'number_oracle', name: 'Number Oracle', specialization: 'math', speedProfile: 'fast', stability: 0.69 }
  ],
  implementation: [
    { key: 'arena_tactician', name: 'Arena Tactician', specialization: 'implementation', speedProfile: 'balanced', stability: 0.66 }
  ],
  'data-structures': [
    { key: 'structure_guardian', name: 'Structure Guardian', specialization: 'data-structures', speedProfile: 'balanced', stability: 0.74 }
  ]
};

const DEFAULT_PERSONAS = {
  cp: [
    { key: 'cp_warlock', name: 'CP Warlock', specialization: 'cp', speedProfile: 'balanced', stability: 0.7 }
  ],
  dsa: [
    { key: 'logic_keeper', name: 'Logic Keeper', specialization: 'dsa', speedProfile: 'balanced', stability: 0.71 }
  ],
  default: [
    { key: 'code_sentinel', name: 'Code Sentinel', specialization: 'general', speedProfile: 'balanced', stability: 0.7 }
  ]
};

const normalizeTopicKey = (topic) => String(topic || '').trim().toLowerCase();

export const getPersonaForTopic = ({ mode, topic, index = 0 }) => {
  const topicKey = normalizeTopicKey(topic);
  const personas =
    PERSONAS_BY_TOPIC[topicKey] ||
    DEFAULT_PERSONAS[mode] ||
    DEFAULT_PERSONAS.default;

  return personas[index % personas.length];
};

export default PERSONAS_BY_TOPIC;
