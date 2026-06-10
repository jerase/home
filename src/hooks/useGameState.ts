// ============================================================
// FICHIER : useGameState.ts
// ============================================================

import { useReducer } from 'react';
import type { GameState, GameAction, Player, Pawn, Position, MoveResult, Color, PlayerConfig } from '../types.js';
import { START_CELLS, PLAYERS } from '../logic/constants.js';
import {
  getMovablePawns, computeNewPosition, getCapturedPawn,
  checkVictory, allInPlayOnProtected, getMostAdvancedUnprotected,
  isStartCellBlocked, pawnsWithStatus, pawnsOnCell, isBarrage,
} from '../logic/gameRules.js';
import { logError, logWarn } from '../logic/logger.js';

// ─── État initial ─────────────────────────────────────────────

export const initialState: GameState = {
  screen: 'setup',
  players: [],
  turnOrder: [],
  currentPlayerIndex: 0,
  phase: 'roll',
  diceValue: null,
  lastDiceValue: null,
  consecutiveSixes: 0,
  rollsWithoutMove: 0,
  movablePawns: [],
  winner: null,
  message: '',
  humanColor: null,
  errorMessage: null,
};

// ─── Helpers internes ─────────────────────────────────────────

function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function createPlayer(id: number, color: Color, isAI: boolean): Player {
  return {
    id, color, isAI,
    pawns: [0, 1, 2, 3].map(pid => ({ id: pid, status: 'home' as const, cellId: null })),
  };
}

function applyCapture(players: Player[], captured: { color: Color; id: number }): Player[] {
  return players.map(pl => {
    if (pl.color !== captured.color) return pl;
    return {
      ...pl,
      pawns: pl.pawns.map((p): Pawn =>
        p.id === captured.id ? { ...p, status: 'home', cellId: null } : p
      ),
    };
  });
}

function movePawnInState(
  players: Player[],
  playerColor: Color,
  pawnId: number,
  newPos: Position
): Player[] {
  return players.map(pl => {
    if (pl.color !== playerColor) return pl;
    return {
      ...pl,
      pawns: pl.pawns.map((p): Pawn =>
        p.id === pawnId ? { ...p, status: newPos.status, cellId: newPos.cellId } : p
      ),
    };
  });
}

type NextPlayerResult = Pick<GameState,
  'currentPlayerIndex' | 'consecutiveSixes' | 'rollsWithoutMove' |
  'diceValue' | 'movablePawns' | 'phase' | 'errorMessage'>;

function nextPlayerState(state: GameState, humanJustPlayed = false): NextPlayerResult {
  const nextIndex  = (state.currentPlayerIndex + 1) % state.turnOrder.length;
  const nextPlayer = state.players[state.turnOrder[nextIndex]];
  const nextPhase  = humanJustPlayed
    ? 'between_turns' as const
    : (nextPlayer.isAI ? 'ai_thinking' as const : 'roll' as const);
  return {
    currentPlayerIndex: nextIndex,
    consecutiveSixes: 0,
    rollsWithoutMove: 0,
    diceValue: null,
    movablePawns: [],
    phase: nextPhase,
    errorMessage: null,
  };
}

function errorState(
  state: GameState,
  context: string,
  message: string,
  data: Record<string, unknown> = {}
): GameState {
  logError(context, message, data);
  return {
    ...state,
    phase: 'error',
    errorMessage: `Erreur inattendue : ${message}. Lancez une nouvelle partie.`,
    movablePawns: [],
  };
}

function nextPhaseForHuman(movable: number[]): GameState['phase'] {
  return movable.length > 0 ? 'showing_result' : 'roll';
}

// ─── Handlers ROLL_DICE ───────────────────────────────────────

export function handleBarrageDepart(state: GameState, currentPlayer: Player, diceValue: number): GameState {
  return {
    ...state,
    diceValue,
    lastDiceValue: diceValue,
    message: `${currentPlayer.color} passe son tour (barrage sur sa case de départ).`,
    ...nextPlayerState(state),
  };
}

export function handleTroisDoubles(state: GameState, currentPlayer: Player, diceValue: number): GameState {
  let updatedPlayers = state.players;
  let msg = `${currentPlayer.color} : Trois Doubles ! `;

  const mostAdv = getMostAdvancedUnprotected(currentPlayer);
  if (mostAdv) {
    updatedPlayers = movePawnInState(updatedPlayers, currentPlayer.color, mostAdv.id, { status: 'home', cellId: null });
    msg += `Le pion le plus avancé retourne à la maison.`;
  } else if (allInPlayOnProtected(currentPlayer)) {
    msg += `Tous les pions sont protégés, rien ne se passe.`;
  } else {
    const homePawns = pawnsWithStatus(currentPlayer, 'home');
    if (homePawns.length > 0 && !isStartCellBlocked(currentPlayer, updatedPlayers)) {
      updatedPlayers = movePawnInState(updatedPlayers, currentPlayer.color, homePawns[0].id,
        { status: 'board', cellId: START_CELLS[currentPlayer.color] });
      msg += `Un pion rentre sur la case de départ.`;
    }
  }

  return {
    ...state,
    diceValue,
    lastDiceValue: diceValue,
    consecutiveSixes: 0,
    rollsWithoutMove: 0,
    players: updatedPlayers,
    message: msg,
    errorMessage: null,
    ...nextPlayerState({ ...state, players: updatedPlayers }),
  };
}

export function handleRollSix(state: GameState, currentPlayer: Player, diceValue: number, newConsec: number): GameState {
  const movable        = getMovablePawns(currentPlayer, 6, state.players, newConsec);
  const hasActivePawns = currentPlayer.pawns.some(p => p.status === 'board' || p.status === 'corridor');
  const hasHomePawns   = currentPlayer.pawns.some(p => p.status === 'home');

  if (movable.length === 0 && !hasActivePawns && !hasHomePawns) {
    return {
      ...state, diceValue, lastDiceValue: diceValue,
      consecutiveSixes: 0, rollsWithoutMove: 0, movablePawns: [], errorMessage: null,
      message: `${currentPlayer.color} lance 6 mais ne peut pas jouer.`,
      ...nextPlayerState(state),
    };
  }

  const newRollsWithoutMove = movable.length === 0 ? state.rollsWithoutMove + 1 : 0;
  if (newRollsWithoutMove >= 3) {
    logWarn('handleRollSix', `${currentPlayer.color} bloqué après 3 relances`, { consecutiveSixes: state.consecutiveSixes });
    return {
      ...state, diceValue, lastDiceValue: diceValue,
      consecutiveSixes: 0, rollsWithoutMove: 0, movablePawns: [], errorMessage: null,
      message: `${currentPlayer.color} ne peut pas jouer, tour passé.`,
      ...nextPlayerState(state),
    };
  }

  const nextPhase = currentPlayer.isAI ? 'ai_thinking' as const : nextPhaseForHuman(movable);
  return {
    ...state, diceValue, lastDiceValue: diceValue,
    consecutiveSixes: newConsec, rollsWithoutMove: newRollsWithoutMove,
    movablePawns: movable, phase: nextPhase, errorMessage: null,
    message: movable.length > 0
      ? `${currentPlayer.color} lance 6 ! Choisissez un pion à avancer de 12.`
      : `${currentPlayer.color} lance 6 ! Pas de pion en jeu, relance…`,
  };
}

export function handleRollNormal(state: GameState, currentPlayer: Player, diceValue: number): GameState {
  const movable = getMovablePawns(currentPlayer, diceValue, state.players, 0);

  if (movable.length === 0) {
    return {
      ...state, diceValue, lastDiceValue: diceValue,
      consecutiveSixes: 0, rollsWithoutMove: 0, movablePawns: [], errorMessage: null,
      message: `${currentPlayer.color} lance ${diceValue}. Aucun mouvement possible.`,
      ...nextPlayerState(state),
    };
  }

  const nextPhase = currentPlayer.isAI ? 'ai_thinking' as const : nextPhaseForHuman(movable);
  return {
    ...state, diceValue, lastDiceValue: diceValue,
    consecutiveSixes: 0, rollsWithoutMove: 0,
    movablePawns: movable, phase: nextPhase, errorMessage: null,
    message: `${currentPlayer.color} lance ${diceValue}. Choisissez un pion.`,
  };
}

// ─── Handlers MOVE_PAWN ───────────────────────────────────────

export function applyPawnEntry(players: Player[], currentPlayer: Player, pawnId: number): MoveResult {
  const startCell = START_CELLS[currentPlayer.color];
  let updatedPlayers = players;
  let msg = '';

  if (!isBarrage(startCell, updatedPlayers)) {
    const occupants = pawnsOnCell(startCell, updatedPlayers);
    const enemy = occupants.find(p => p.color !== currentPlayer.color);
    if (enemy && occupants.length === 1) {
      updatedPlayers = applyCapture(updatedPlayers, enemy);
      msg += `Capture de ${enemy.color} ! `;
    }
  }

  updatedPlayers = movePawnInState(updatedPlayers, currentPlayer.color, pawnId,
    { status: 'board', cellId: startCell });
  msg += `${currentPlayer.color} rentre un pion.`;
  return { updatedPlayers, msg };
}

export function applyPawnMove(
  players: Player[],
  pawn: Pawn,
  steps: number,
  currentPlayer: Player
): MoveResult | null {
  const newPos = computeNewPosition(pawn, steps, currentPlayer.color, players);
  if (!newPos) return null;

  let updatedPlayers = players;
  let msg = '';

  const captured = getCapturedPawn(newPos.cellId, currentPlayer.color, updatedPlayers);
  if (captured) {
    updatedPlayers = applyCapture(updatedPlayers, captured);
    msg += `Capture de ${captured.color} ! `;
  }
  updatedPlayers = movePawnInState(updatedPlayers, currentPlayer.color, pawn.id, newPos);
  msg += `${currentPlayer.color} avance de ${steps}.`;
  return { updatedPlayers, msg };
}

// ─── Reducer ──────────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'SETUP_COMPLETE': {
      const { config } = action.payload;
      if (!config || config.length < 2)
        return errorState(state, 'SETUP_COMPLETE', 'Configuration invalide (moins de 2 joueurs)', { config: config as unknown as Record<string, unknown> });
      if (!config.some(c => !c.isAI))
        return errorState(state, 'SETUP_COMPLETE', 'Aucun joueur humain', {});
      const invalid = config.find(c => !PLAYERS.includes(c.color));
      if (invalid)
        return errorState(state, 'SETUP_COMPLETE', `Couleur invalide : "${invalid.color}"`, {});

      const activePlayers = config.map((cfg: PlayerConfig, i: number) => createPlayer(i, cfg.color, cfg.isAI));
      const firstHuman    = config.find(c => !c.isAI);
      const humanColor    = firstHuman?.color ?? null;
      const order = activePlayers
        .slice()
        .sort((a, b) => PLAYERS.indexOf(a.color) - PLAYERS.indexOf(b.color))
        .map(p => p.id);
      return {
        ...initialState,
        screen: 'game',
        players: activePlayers,
        turnOrder: order,
        currentPlayerIndex: 0,
        humanColor,
        phase: activePlayers[order[0]].isAI ? 'ai_thinking' : 'roll',
        message: `C'est au joueur ${activePlayers[order[0]].color} de commencer !`,
      };
    }

    case 'ROLL_DICE': {
      const currentPlayer = state.players[state.turnOrder[state.currentPlayerIndex]];
      if (!currentPlayer)
        return errorState(state, 'ROLL_DICE', 'Joueur courant introuvable', { currentPlayerIndex: state.currentPlayerIndex });

      const diceValue = rollDie();
      const allHome = currentPlayer.pawns.every(p => p.status === 'home');
      if (allHome && isStartCellBlocked(currentPlayer, state.players))
        return handleBarrageDepart(state, currentPlayer, diceValue);

      if (diceValue === 6) {
        const newConsec = state.consecutiveSixes + 1;
        if (newConsec === 3) return handleTroisDoubles(state, currentPlayer, diceValue);
        return handleRollSix(state, currentPlayer, diceValue, newConsec);
      }
      return handleRollNormal(state, currentPlayer, diceValue);
    }

    case 'MOVE_PAWN': {
      const { pawnId } = action.payload;
      if (pawnId === undefined || pawnId === null)
        return errorState(state, 'MOVE_PAWN', 'pawnId manquant', {});

      const currentPlayer = state.players[state.turnOrder[state.currentPlayerIndex]];
      if (!currentPlayer)
        return errorState(state, 'MOVE_PAWN', 'Joueur courant introuvable', { currentPlayerIndex: state.currentPlayerIndex });

      const pawn = currentPlayer.pawns.find(p => p.id === pawnId);
      if (!pawn)
        return errorState(state, 'MOVE_PAWN', `Pion id=${pawnId} introuvable`, { pawnId });
      if (!state.movablePawns.includes(pawnId))
        return errorState(state, 'MOVE_PAWN', `Pion id=${pawnId} pas dans movablePawns`, { pawnId });
      if (!state.diceValue)
        return errorState(state, 'MOVE_PAWN', 'MOVE_PAWN sans diceValue', { diceValue: state.diceValue });

      const steps = state.diceValue === 6 ? 12 : state.diceValue;
      let updatedPlayers: Player[];
      let msg: string;

      if (pawn.status === 'home') {
        ({ updatedPlayers, msg } = applyPawnEntry(state.players, currentPlayer, pawnId));
      } else {
        const result = applyPawnMove(state.players, pawn, steps, currentPlayer);
        if (!result)
          return errorState(state, 'MOVE_PAWN', 'computeNewPosition null pour pion déplaçable',
            { pawnId, pawnCellId: pawn.cellId, steps });
        ({ updatedPlayers, msg } = result);
      }

      const updatedCurrentPlayer = updatedPlayers[state.turnOrder[state.currentPlayerIndex]];
      if (checkVictory(updatedCurrentPlayer)) {
        return { ...state, players: updatedPlayers, phase: 'ended', screen: 'victory',
          winner: currentPlayer.id, movablePawns: [], errorMessage: null,
          message: `${currentPlayer.color} a gagné !` };
      }

      if (state.diceValue === 6 && state.consecutiveSixes < 3) {
        return { ...state, players: updatedPlayers, movablePawns: [],
          phase: currentPlayer.isAI ? 'ai_thinking' : 'roll',
          errorMessage: null, message: msg + ` Relance !` };
      }

      return { ...state, players: updatedPlayers, movablePawns: [], errorMessage: null,
        message: msg, ...nextPlayerState({ ...state, players: updatedPlayers }, !currentPlayer.isAI) };
    }

    case 'SHOW_RESULT_DONE':
      if (state.phase !== 'showing_result') { logWarn('SHOW_RESULT_DONE', `Phase inattendue : "${state.phase}"`); return state; }
      return { ...state, phase: 'move' };

    case 'BETWEEN_TURNS_DONE': {
      if (state.phase !== 'between_turns') { logWarn('BETWEEN_TURNS_DONE', `Phase inattendue : "${state.phase}"`); return state; }
      const nextPlayer = state.players[state.turnOrder[state.currentPlayerIndex]];
      if (!nextPlayer) return errorState(state, 'BETWEEN_TURNS_DONE', 'Prochain joueur introuvable', {});
      return { ...state, phase: nextPlayer.isAI ? 'ai_thinking' : 'roll' };
    }

    case 'NEXT_PLAYER':
      return { ...state, ...nextPlayerState(state) };

    case 'NEW_GAME':
      return { ...initialState };

    default: {
      // TypeScript garantit l'exhaustivité — ce cas ne devrait jamais arriver
      const exhaustiveCheck: never = action;
      logWarn('gameReducer', `Action inconnue`, { action: exhaustiveCheck as unknown as Record<string, unknown> });
      return state;
    }
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return { state, dispatch };
}

export { handleBarrageDepart as _handleBarrageDepart };
