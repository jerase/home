// ============================================================
// FICHIER : useGameState.test.helpers.js
// Exporte le reducer pur pour permettre les tests unitaires
// sans avoir à monter un composant React complet.
// ============================================================

import { PLAYERS, START_CELLS } from '../logic/constants.js';
import {
  getMovablePawns, computeNewPosition, getCapturedPawn,
  checkVictory, allInPlayOnProtected, getMostAdvancedUnprotected,
  isStartCellBlocked, pawnsWithStatus,
} from '../logic/gameRules.js';

// ── Helpers internes (dupliqués ici pour éviter les imports circulaires) ──

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function createPlayer(id, color, isAI) {
  return {
    id, color, isAI,
    pawns: [0, 1, 2, 3].map(pid => ({ id: pid, status: 'home', cellId: null })),
  };
}

function applyCapture(players, captured) {
  return players.map(pl => {
    if (pl.color !== captured.color) return pl;
    return {
      ...pl,
      pawns: pl.pawns.map(p =>
        p.id === captured.id ? { ...p, status: 'home', cellId: null } : p
      ),
    };
  });
}

function movePawnInState(players, playerColor, pawnId, newPos) {
  return players.map(pl => {
    if (pl.color !== playerColor) return pl;
    return {
      ...pl,
      pawns: pl.pawns.map(p =>
        p.id === pawnId ? { ...p, status: newPos.status, cellId: newPos.cellId } : p
      ),
    };
  });
}

function nextPlayerState(state, humanJustPlayed = false) {
  const nextIndex = (state.currentPlayerIndex + 1) % state.turnOrder.length;
  const nextPlayer = state.players[state.turnOrder[nextIndex]];
  const nextPhase = humanJustPlayed
    ? 'between_turns'
    : (nextPlayer.isAI ? 'ai_thinking' : 'roll');
  return {
    currentPlayerIndex: nextIndex,
    consecutiveSixes: 0,
    rollsWithoutMove: 0,
    diceValue: null,
    movablePawns: [],
    phase: nextPhase,
  };
}

const initialState = {
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
};

// ── Reducer exporté pour les tests ────────────────────────────────────────

export function gameReducerForTest(state, action) {
  switch (action.type) {

    case 'SETUP_COMPLETE': {
      const { config } = action.payload;
      const activePlayers = config.map((cfg, i) => createPlayer(i, cfg.color, cfg.isAI));
      const firstHuman = config.find(c => !c.isAI);
      const humanColor = firstHuman ? firstHuman.color : null;
      const ANTICLOCKWISE_ORDER = ['jaune', 'vert', 'bleu', 'rouge'];
      const order = activePlayers
        .slice()
        .sort((a, b) => ANTICLOCKWISE_ORDER.indexOf(a.color) - ANTICLOCKWISE_ORDER.indexOf(b.color))
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
      const diceValue = rollDie();
      const currentPlayer = state.players[state.turnOrder[state.currentPlayerIndex]];
      const allHome = currentPlayer.pawns.every(p => p.status === 'home');
      if (allHome && isStartCellBlocked(currentPlayer, state.players)) {
        return {
          ...state,
          diceValue,
          lastDiceValue: diceValue,
          message: `${currentPlayer.color} passe son tour.`,
          ...nextPlayerState(state),
        };
      }
      if (diceValue === 6) {
        const newConsec = state.consecutiveSixes + 1;
        if (newConsec === 3) {
          let updatedPlayers = state.players;
          let msg = `${currentPlayer.color} : Trois Doubles ! `;
          const mostAdv = getMostAdvancedUnprotected(currentPlayer);
          if (mostAdv) {
            updatedPlayers = movePawnInState(updatedPlayers, currentPlayer.color, mostAdv.id, { status: 'home', cellId: null });
            msg += `Pion retourne à la maison.`;
          } else if (allInPlayOnProtected(currentPlayer)) {
            msg += `Tous protégés.`;
          } else {
            const homePawns = pawnsWithStatus(currentPlayer, 'home');
            if (homePawns.length > 0 && !isStartCellBlocked(currentPlayer, updatedPlayers)) {
              updatedPlayers = movePawnInState(updatedPlayers, currentPlayer.color, homePawns[0].id, { status: 'board', cellId: START_CELLS[currentPlayer.color] });
              msg += `Un pion rentre.`;
            }
          }
          return { ...state, diceValue, lastDiceValue: diceValue, consecutiveSixes: 0, rollsWithoutMove: 0, players: updatedPlayers, message: msg, ...nextPlayerState({ ...state, players: updatedPlayers }) };
        }
        const movable = getMovablePawns(currentPlayer, 6, state.players, newConsec);
        const hasActivePawns = currentPlayer.pawns.some(p => p.status === 'board' || p.status === 'corridor');
        const hasHomePawns = currentPlayer.pawns.some(p => p.status === 'home');
        if (movable.length === 0 && !hasActivePawns && !hasHomePawns) {
          return { ...state, diceValue, lastDiceValue: diceValue, consecutiveSixes: 0, rollsWithoutMove: 0, movablePawns: [], ...nextPlayerState(state) };
        }
        const newRollsWithoutMove = movable.length === 0 ? state.rollsWithoutMove + 1 : 0;
        if (newRollsWithoutMove >= 3) {
          return { ...state, diceValue, lastDiceValue: diceValue, consecutiveSixes: 0, rollsWithoutMove: 0, movablePawns: [], ...nextPlayerState(state) };
        }
        const isAI = currentPlayer.isAI;
        const nextPhase = isAI ? 'ai_thinking' : (movable.length > 0 ? 'showing_result' : 'roll');
        return { ...state, diceValue, lastDiceValue: diceValue, consecutiveSixes: newConsec, rollsWithoutMove: newRollsWithoutMove, movablePawns: movable, phase: nextPhase };
      }
      const movable = getMovablePawns(currentPlayer, diceValue, state.players, 0);
      if (movable.length === 0) {
        return { ...state, diceValue, lastDiceValue: diceValue, consecutiveSixes: 0, rollsWithoutMove: 0, movablePawns: [], ...nextPlayerState(state) };
      }
      const nextPhase = currentPlayer.isAI ? 'ai_thinking' : 'showing_result';
      return { ...state, diceValue, lastDiceValue: diceValue, consecutiveSixes: 0, rollsWithoutMove: 0, movablePawns: movable, phase: nextPhase };
    }

    case 'MOVE_PAWN': {
      const { pawnId } = action.payload;
      const currentPlayer = state.players[state.turnOrder[state.currentPlayerIndex]];
      const pawn = currentPlayer.pawns.find(p => p.id === pawnId);
      const steps = state.diceValue === 6 ? 12 : state.diceValue;
      let updatedPlayers = state.players;
      let msg = '';
      if (pawn.status === 'home') {
        const startCell = START_CELLS[currentPlayer.color];
        const captured = getCapturedPawn(startCell, currentPlayer.color, updatedPlayers);
        if (captured) { updatedPlayers = applyCapture(updatedPlayers, captured); msg += `Capture ! `; }
        updatedPlayers = movePawnInState(updatedPlayers, currentPlayer.color, pawnId, { status: 'board', cellId: startCell });
        msg += `Pion rentré.`;
      } else {
        const newPos = computeNewPosition(pawn, steps, currentPlayer.color, updatedPlayers);
        if (!newPos) return state;
        const captured = getCapturedPawn(newPos.cellId, currentPlayer.color, updatedPlayers);
        if (captured) { updatedPlayers = applyCapture(updatedPlayers, captured); msg += `Capture ! `; }
        updatedPlayers = movePawnInState(updatedPlayers, currentPlayer.color, pawnId, newPos);
        msg += `Avancé de ${steps}.`;
      }
      const updatedCurrentPlayer = updatedPlayers[state.turnOrder[state.currentPlayerIndex]];
      if (checkVictory(updatedCurrentPlayer)) {
        return { ...state, players: updatedPlayers, phase: 'ended', screen: 'victory', winner: currentPlayer.id, movablePawns: [], message: `${currentPlayer.color} gagne !` };
      }
      if (state.diceValue === 6 && state.consecutiveSixes < 3) {
        return { ...state, players: updatedPlayers, movablePawns: [], phase: currentPlayer.isAI ? 'ai_thinking' : 'roll', message: msg + ` Relance !` };
      }
      const wasHuman = !currentPlayer.isAI;
      return { ...state, players: updatedPlayers, movablePawns: [], message: msg, ...nextPlayerState({ ...state, players: updatedPlayers }, wasHuman) };
    }

    case 'SHOW_RESULT_DONE':
      if (state.phase !== 'showing_result') return state;
      return { ...state, phase: 'move' };

    case 'BETWEEN_TURNS_DONE': {
      if (state.phase !== 'between_turns') return state;
      const nextPlayer = state.players[state.turnOrder[state.currentPlayerIndex]];
      return { ...state, phase: nextPlayer.isAI ? 'ai_thinking' : 'roll' };
    }

    case 'NEXT_PLAYER':
      return { ...state, ...nextPlayerState(state) };

    case 'NEW_GAME':
      return { ...initialState };

    default:
      return state;
  }
}
