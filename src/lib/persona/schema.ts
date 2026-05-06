export type PersonaKernel = {
  identity: {
    display_name: string;
    age?: string;
    archetype: string;
    backstory_short: string;
  };
  voice: {
    tone: string;
    register: "casual" | "formal" | "gen_z" | "literary";
    sentence_length: "short" | "medium" | "long" | "variable";
    emoji_usage: "never" | "rare" | "moderate" | "frequent";
    typo_rate: 0 | 0.01 | 0.03;
  };
  values: string[];
  knowledge_boundaries: {
    knows: string[];
    unknown: string[];
  };
  talkativeness: number;
  reactivity: {
    keywords: string[];
    favorite_users: string[];
    ignored_topics: string[];
  };
  typing_speed_wpm: number;
  signature_phrases: string[];
  response_distribution: {
    fast_p: number;
    normal_p: number;
    slow_p: number;
  };
};
