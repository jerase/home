// ============================================================
// FICHIER : constants.ts
// RÔLE    : Toutes les données statiques du jeu.
// ============================================================

import type { Color, Zone, CellCoords } from '../types.js';

// ─── Joueurs et couleurs ──────────────────────────────────────

export const PLAYERS: Color[] = ['jaune', 'vert', 'bleu', 'rouge'];

export const PLAYER_COLORS: Record<Color, string> = {
  jaune: '#FFD700',
  rouge: '#E74C3C',
  bleu:  '#2980B9',
  vert:  '#27AE60',
};

export const PLAYER_LABELS: Record<Color, string> = {
  jaune: 'Jaune',
  rouge: 'Rouge',
  bleu:  'Bleu',
  vert:  'Vert',
};

export const PLAYER_ZONE: Record<Color, Zone> = {
  jaune: 'haut',
  vert:  'gauche',
  bleu:  'bas',
  rouge: 'droite',
};

// ─── Circuits ────────────────────────────────────────────────

export const CIRCUIT_HAUT: string[] = [
  "h-m-g4","h-m-g5","h-m-g6","h-m-g7",
  "g-m-h7","g-m-h6","g-m-h5","g-m-h4","g-m-h3","g-m-h2","g-m-h1","g-m-h0",
  "g-m-m0",
  "g-m-b0","g-m-b1","g-m-b2","g-m-b3","g-m-b4","g-m-b5","g-m-b6","g-m-b7",
  "b-m-g0","b-m-g1","b-m-g2","b-m-g3","b-m-g4","b-m-g5","b-m-g6","b-m-g7",
  "b-m-m7",
  "b-m-d7","b-m-d6","b-m-d5","b-m-d4","b-m-d3","b-m-d2","b-m-d1","b-m-d0",
  "d-m-b0","d-m-b1","d-m-b2","d-m-b3","d-m-b4","d-m-b5","d-m-b6","d-m-b7",
  "d-m-m7",
  "d-m-h7","d-m-h6","d-m-h5","d-m-h4","d-m-h3","d-m-h2","d-m-h1","d-m-h0",
  "h-m-d7","h-m-d6","h-m-d5","h-m-d4","h-m-d3","h-m-d2","h-m-d1","h-m-d0",
  "h-m-m0","h-m-m1","h-m-m2","h-m-m3","h-m-m4","h-m-m5","h-m-m6","h-m-m7",
  "centre",
];

export const CIRCUIT_GAUCHE: string[] = [
  "g-m-b4","g-m-b5","g-m-b6","g-m-b7",
  "b-m-g0","b-m-g1","b-m-g2","b-m-g3","b-m-g4","b-m-g5","b-m-g6","b-m-g7",
  "b-m-m7",
  "b-m-d7","b-m-d6","b-m-d5","b-m-d4","b-m-d3","b-m-d2","b-m-d1","b-m-d0",
  "d-m-b0","d-m-b1","d-m-b2","d-m-b3","d-m-b4","d-m-b5","d-m-b6","d-m-b7",
  "d-m-m7",
  "d-m-h7","d-m-h6","d-m-h5","d-m-h4","d-m-h3","d-m-h2","d-m-h1","d-m-h0",
  "h-m-d7","h-m-d6","h-m-d5","h-m-d4","h-m-d3","h-m-d2","h-m-d1","h-m-d0",
  "h-m-m0",
  "h-m-g0","h-m-g1","h-m-g2","h-m-g3","h-m-g4","h-m-g5","h-m-g6","h-m-g7",
  "g-m-h7","g-m-h6","g-m-h5","g-m-h4","g-m-h3","g-m-h2","g-m-h1","g-m-h0",
  "g-m-m0","g-m-m1","g-m-m2","g-m-m3","g-m-m4","g-m-m5","g-m-m6","g-m-m7",
  "centre",
];

export const CIRCUIT_BAS: string[] = [
  "b-m-d3","b-m-d2","b-m-d1","b-m-d0",
  "d-m-b0","d-m-b1","d-m-b2","d-m-b3","d-m-b4","d-m-b5","d-m-b6","d-m-b7",
  "d-m-m7",
  "d-m-h7","d-m-h6","d-m-h5","d-m-h4","d-m-h3","d-m-h2","d-m-h1","d-m-h0",
  "h-m-d7","h-m-d6","h-m-d5","h-m-d4","h-m-d3","h-m-d2","h-m-d1","h-m-d0",
  "h-m-m0",
  "h-m-g0","h-m-g1","h-m-g2","h-m-g3","h-m-g4","h-m-g5","h-m-g6","h-m-g7",
  "g-m-h7","g-m-h6","g-m-h5","g-m-h4","g-m-h3","g-m-h2","g-m-h1","g-m-h0",
  "g-m-m0",
  "g-m-b0","g-m-b1","g-m-b2","g-m-b3","g-m-b4","g-m-b5","g-m-b6","g-m-b7",
  "b-m-g0","b-m-g1","b-m-g2","b-m-g3","b-m-g4","b-m-g5","b-m-g6","b-m-g7",
  "b-m-m7","b-m-m6","b-m-m5","b-m-m4","b-m-m3","b-m-m2","b-m-m1","b-m-m0",
  "centre",
];

export const CIRCUIT_DROITE: string[] = [
  "d-m-h3","d-m-h2","d-m-h1","d-m-h0",
  "h-m-d7","h-m-d6","h-m-d5","h-m-d4","h-m-d3","h-m-d2","h-m-d1","h-m-d0",
  "h-m-m0",
  "h-m-g0","h-m-g1","h-m-g2","h-m-g3","h-m-g4","h-m-g5","h-m-g6","h-m-g7",
  "g-m-h7","g-m-h6","g-m-h5","g-m-h4","g-m-h3","g-m-h2","g-m-h1","g-m-h0",
  "g-m-m0",
  "g-m-b0","g-m-b1","g-m-b2","g-m-b3","g-m-b4","g-m-b5","g-m-b6","g-m-b7",
  "b-m-g0","b-m-g1","b-m-g2","b-m-g3","b-m-g4","b-m-g5","b-m-g6","b-m-g7",
  "b-m-m7",
  "b-m-d7","b-m-d6","b-m-d5","b-m-d4","b-m-d3","b-m-d2","b-m-d1","b-m-d0",
  "d-m-b0","d-m-b1","d-m-b2","d-m-b3","d-m-b4","d-m-b5","d-m-b6","d-m-b7",
  "d-m-m7","d-m-m6","d-m-m5","d-m-m4","d-m-m3","d-m-m2","d-m-m1","d-m-m0",
  "centre",
];

export const CIRCUITS_BY_ZONE: Record<Zone, string[]> = {
  haut:   CIRCUIT_HAUT,
  gauche: CIRCUIT_GAUCHE,
  bas:    CIRCUIT_BAS,
  droite: CIRCUIT_DROITE,
};

// ─── Cases de départ ─────────────────────────────────────────

export const START_CELLS: Record<Color, string> = {
  jaune: 'h-m-g4',
  vert:  'g-m-b4',
  bleu:  'b-m-d3',
  rouge: 'd-m-h3',
};

// ─── Couloirs d'arrivée ──────────────────────────────────────

export const COULOIR: Record<Color, string[]> = {
  jaune: ['h-m-m0','h-m-m1','h-m-m2','h-m-m3','h-m-m4','h-m-m5','h-m-m6','h-m-m7'],
  vert:  ['g-m-m0','g-m-m1','g-m-m2','g-m-m3','g-m-m4','g-m-m5','g-m-m6','g-m-m7'],
  bleu:  ['b-m-m7','b-m-m6','b-m-m5','b-m-m4','b-m-m3','b-m-m2','b-m-m1','b-m-m0'],
  rouge: ['d-m-m7','d-m-m6','d-m-m5','d-m-m4','d-m-m3','d-m-m2','d-m-m1','d-m-m0'],
};

export const ALL_COULOIR_CELLS = new Set<string>(Object.values(COULOIR).flat());

export const COULOIR_SETS: Record<Color, Set<string>> = Object.fromEntries(
  Object.entries(COULOIR).map(([color, cells]) => [color, new Set(cells)])
) as Record<Color, Set<string>>;

// ─── Cases protégées ─────────────────────────────────────────

export const PROTECTED_CELLS = new Set<string>([
  'h-m-g4','h-m-m0','h-m-d4',
  'b-m-g3','b-m-m7','b-m-d3',
  'g-m-h4','g-m-m0','g-m-b4',
  'd-m-h3','d-m-m7','d-m-b3',
]);

// ─── Coordonnées SVG ─────────────────────────────────────────

export const CELL_COORDINATES: Record<string, CellCoords> = {
  'h-m-g0':{ cx:145,cy:12  }, 'h-m-g1':{ cx:145,cy:27  }, 'h-m-g2':{ cx:145,cy:42  },
  'h-m-g3':{ cx:145,cy:57  }, 'h-m-g4':{ cx:145,cy:72  }, 'h-m-g5':{ cx:145,cy:87  },
  'h-m-g6':{ cx:145,cy:102 }, 'h-m-g7':{ cx:145,cy:117 },
  'h-m-m0':{ cx:185,cy:12  }, 'h-m-m1':{ cx:185,cy:27  }, 'h-m-m2':{ cx:185,cy:42  },
  'h-m-m3':{ cx:185,cy:57  }, 'h-m-m4':{ cx:185,cy:72  }, 'h-m-m5':{ cx:185,cy:87  },
  'h-m-m6':{ cx:185,cy:102 }, 'h-m-m7':{ cx:185,cy:117 },
  'h-m-d0':{ cx:225,cy:12  }, 'h-m-d1':{ cx:225,cy:27  }, 'h-m-d2':{ cx:225,cy:42  },
  'h-m-d3':{ cx:225,cy:57  }, 'h-m-d4':{ cx:225,cy:72  }, 'h-m-d5':{ cx:225,cy:87  },
  'h-m-d6':{ cx:225,cy:102 }, 'h-m-d7':{ cx:225,cy:117 },
  'b-m-g0':{ cx:145,cy:252 }, 'b-m-g1':{ cx:145,cy:267 }, 'b-m-g2':{ cx:145,cy:282 },
  'b-m-g3':{ cx:145,cy:297 }, 'b-m-g4':{ cx:145,cy:312 }, 'b-m-g5':{ cx:145,cy:327 },
  'b-m-g6':{ cx:145,cy:342 }, 'b-m-g7':{ cx:145,cy:357 },
  'b-m-m0':{ cx:185,cy:252 }, 'b-m-m1':{ cx:185,cy:267 }, 'b-m-m2':{ cx:185,cy:282 },
  'b-m-m3':{ cx:185,cy:297 }, 'b-m-m4':{ cx:185,cy:312 }, 'b-m-m5':{ cx:185,cy:327 },
  'b-m-m6':{ cx:185,cy:342 }, 'b-m-m7':{ cx:185,cy:357 },
  'b-m-d0':{ cx:225,cy:252 }, 'b-m-d1':{ cx:225,cy:267 }, 'b-m-d2':{ cx:225,cy:282 },
  'b-m-d3':{ cx:225,cy:297 }, 'b-m-d4':{ cx:225,cy:312 }, 'b-m-d5':{ cx:225,cy:327 },
  'b-m-d6':{ cx:225,cy:342 }, 'b-m-d7':{ cx:225,cy:357 },
  'g-m-h0':{ cx:12, cy:145 }, 'g-m-h1':{ cx:27, cy:145 }, 'g-m-h2':{ cx:42, cy:145 },
  'g-m-h3':{ cx:57, cy:145 }, 'g-m-h4':{ cx:72, cy:145 }, 'g-m-h5':{ cx:87, cy:145 },
  'g-m-h6':{ cx:102,cy:145 }, 'g-m-h7':{ cx:117,cy:145 },
  'g-m-m0':{ cx:12, cy:185 }, 'g-m-m1':{ cx:27, cy:185 }, 'g-m-m2':{ cx:42, cy:185 },
  'g-m-m3':{ cx:57, cy:185 }, 'g-m-m4':{ cx:72, cy:185 }, 'g-m-m5':{ cx:87, cy:185 },
  'g-m-m6':{ cx:102,cy:185 }, 'g-m-m7':{ cx:117,cy:185 },
  'g-m-b0':{ cx:12, cy:225 }, 'g-m-b1':{ cx:27, cy:225 }, 'g-m-b2':{ cx:42, cy:225 },
  'g-m-b3':{ cx:57, cy:225 }, 'g-m-b4':{ cx:72, cy:225 }, 'g-m-b5':{ cx:87, cy:225 },
  'g-m-b6':{ cx:102,cy:225 }, 'g-m-b7':{ cx:117,cy:225 },
  'd-m-h0':{ cx:252,cy:145 }, 'd-m-h1':{ cx:267,cy:145 }, 'd-m-h2':{ cx:282,cy:145 },
  'd-m-h3':{ cx:297,cy:145 }, 'd-m-h4':{ cx:312,cy:145 }, 'd-m-h5':{ cx:327,cy:145 },
  'd-m-h6':{ cx:342,cy:145 }, 'd-m-h7':{ cx:357,cy:145 },
  'd-m-m0':{ cx:252,cy:185 }, 'd-m-m1':{ cx:267,cy:185 }, 'd-m-m2':{ cx:282,cy:185 },
  'd-m-m3':{ cx:297,cy:185 }, 'd-m-m4':{ cx:312,cy:185 }, 'd-m-m5':{ cx:327,cy:185 },
  'd-m-m6':{ cx:342,cy:185 }, 'd-m-m7':{ cx:357,cy:185 },
  'd-m-b0':{ cx:252,cy:225 }, 'd-m-b1':{ cx:267,cy:225 }, 'd-m-b2':{ cx:282,cy:225 },
  'd-m-b3':{ cx:297,cy:225 }, 'd-m-b4':{ cx:312,cy:225 }, 'd-m-b5':{ cx:327,cy:225 },
  'd-m-b6':{ cx:342,cy:225 }, 'd-m-b7':{ cx:357,cy:225 },
  'centre': { cx:185,cy:185 },
};

// ─── Positions dans les zones de départ ──────────────────────

export const HOME_POSITIONS: Record<Color, CellCoords[]> = {
  jaune: [{ cx:45, cy:45 },{ cx:85, cy:45 },{ cx:45, cy:85 },{ cx:85, cy:85 }],
  rouge: [{ cx:285,cy:45 },{ cx:325,cy:45 },{ cx:285,cy:85 },{ cx:325,cy:85 }],
  bleu:  [{ cx:285,cy:285},{ cx:325,cy:285},{ cx:285,cy:325},{ cx:325,cy:325}],
  vert:  [{ cx:45, cy:285},{ cx:85, cy:285},{ cx:45, cy:325},{ cx:85, cy:325}],
};

// ─── Constantes d'interface ───────────────────────────────────

export const APP_NAME     = 'Jeu Home';
export const APP_SUBTITLE = 'Home Haïtien';

export const SHOW_RESULT_DELAY_MS   = 800;
export const BETWEEN_TURNS_DELAY_MS = 2000;

// ─── Paramètres IA ───────────────────────────────────────────

export const AI_DELAY_MS            = 1200;
export const MIN_PAWNS_TO_SKIP_ENTRY = 2;
