// ============================================================
// FICHIER : types.ts
// RÔLE    : Définitions TypeScript centralisées pour tout le projet.
//           Importer depuis ici évite la duplication de types
//           et garantit la cohérence entre les modules.
// ============================================================

// ─── Primitives du jeu ──────────────────────────────────────

/** Les 4 couleurs de joueurs possibles */
export type Color = 'jaune' | 'vert' | 'bleu' | 'rouge';

/** Les 4 zones du plateau */
export type Zone = 'haut' | 'gauche' | 'bas' | 'droite';

/** Statut d'un pion à un instant donné */
export type PawnStatus = 'home' | 'board' | 'corridor' | 'finished';

/** Phase du tour en cours */
export type Phase =
  | 'roll'           // joueur humain doit lancer
  | 'showing_result' // résultat affiché 800ms avant 'move'
  | 'move'           // joueur humain choisit un pion
  | 'between_turns'  // pause 2s après tour humain
  | 'ai_thinking'    // IA joue
  | 'ended'          // partie terminée
  | 'error';         // erreur irrécupérable

/** Écran affiché */
export type Screen = 'setup' | 'game' | 'victory';

// ─── Structures de données ───────────────────────────────────

/** Un pion appartenant à un joueur */
export interface Pawn {
  id: number;
  status: PawnStatus;
  cellId: string | null;
}

/** Un joueur (humain ou IA) */
export interface Player {
  id: number;
  color: Color;
  isAI: boolean;
  pawns: Pawn[];
}

/** Configuration d'un joueur à la création de la partie */
export interface PlayerConfig {
  color: Color;
  isAI: boolean;
}

/**
 * Position retournée par computeNewPosition ou utilisée dans movePawnInState.
 * Type discriminant selon le statut :
 *   - 'board' | 'corridor' | 'finished' → cellId est une chaîne valide
 *   - 'home' → cellId est null (pion renvoyé en zone de départ)
 */
export type Position =
  | { status: 'board' | 'corridor'; cellId: string }
  | { status: 'finished'; cellId: 'centre' }
  | { status: 'home'; cellId: null };

/** Pion enrichi avec couleur et playerId (retourné par pawnsOnCell) */
export interface PawnOnCell extends Pawn {
  color: Color;
  playerId: number;
}

/** Résultat d'applyPawnEntry et applyPawnMove */
export interface MoveResult {
  updatedPlayers: Player[];
  msg: string;
}

// ─── État global ─────────────────────────────────────────────

/** État complet du jeu géré par useReducer */
export interface GameState {
  screen: Screen;
  players: Player[];
  turnOrder: number[];
  currentPlayerIndex: number;
  phase: Phase;
  diceValue: number | null;
  lastDiceValue: number | null;
  consecutiveSixes: number;
  rollsWithoutMove: number;
  movablePawns: number[];
  winner: number | null;
  message: string;
  humanColor: Color | null;
  errorMessage: string | null;
}

/** Actions dispatchables au reducer */
export type GameAction =
  | { type: 'SETUP_COMPLETE';    payload: { config: PlayerConfig[] } }
  | { type: 'ROLL_DICE' }
  | { type: 'MOVE_PAWN';         payload: { pawnId: number } }
  | { type: 'SHOW_RESULT_DONE' }
  | { type: 'BETWEEN_TURNS_DONE' }
  | { type: 'NEXT_PLAYER' }
  | { type: 'NEW_GAME' };

// ─── Coordonnées SVG ─────────────────────────────────────────

/** Centre d'une case sur le plateau SVG */
export interface CellCoords {
  cx: number;
  cy: number;
}
