// ============================================================
// FICHIER : useGameState.js
// RÔLE    : État global du jeu et toutes les actions (reducer).
// ============================================================

import { useReducer } from 'react';
import { PLAYERS, START_CELLS } from '../logic/constants.js';
import {
  getMovablePawns, computeNewPosition, getCapturedPawn,
  checkVictory, allInPlayOnProtected, getMostAdvancedUnprotected,
  isStartCellBlocked, pawnsWithStatus, pawnsInPlay,
} from '../logic/gameRules.js';

const initialState = {
  screen: 'setup',
  players: [],
  turnOrder: [],
  currentPlayerIndex: 0,
  // 'roll' | 'showing_result' | 'move' | 'between_turns' | 'ai_thinking' | 'ended'
  // 'between_turns' : délai de 2s après le tour d'un humain avant le tour suivant
  phase: 'roll',
  diceValue: null,
  // Dernier résultat de dé — persiste entre les tours pour l'affichage dans Dice
  lastDiceValue: null,
  consecutiveSixes: 0,
  rollsWithoutMove: 0,
  movablePawns: [],
  winner: null,
  message: '',
  humanColor: null,
};

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

function gameReducer(state, action) {
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

      // Règle : si tous les pions sont à la maison ET barrage sur case de départ → passer
      const allHome = currentPlayer.pawns.every(p => p.status === 'home');
      if (allHome && isStartCellBlocked(currentPlayer, state.players)) {
        return {
          ...state,
          diceValue,
          lastDiceValue: diceValue,
          message: `${currentPlayer.color} passe son tour (barrage sur sa case de départ).`,
          ...nextPlayerState(state),
        };
      }

      // ── Résultat = 6 ──────────────────────────────────────────────────
      if (diceValue === 6) {
        const newConsec = state.consecutiveSixes + 1;

        // ── Trois_Doubles (3 fois 6 consécutifs) ─────────────────────────
        if (newConsec === 3) {
          let updatedPlayers = state.players;
          let msg = `${currentPlayer.color} : Trois Doubles ! `;

          const mostAdv = getMostAdvancedUnprotected(currentPlayer);
          if (mostAdv) {
            // Cas 1 : pion le plus avancé non protégé → zone de départ
            updatedPlayers = movePawnInState(
              updatedPlayers, currentPlayer.color, mostAdv.id,
              { status: 'home', cellId: null }
            );
            msg += `Le pion le plus avancé retourne à la maison.`;
          } else if (allInPlayOnProtected(currentPlayer)) {
            // Cas 2 : tous les pions protégés → rien
            msg += `Tous les pions sont protégés, rien ne se passe.`;
          } else {
            // Cas 3 : aucun pion en jeu → rentrer un pion si case de départ libre
            const homePawns = pawnsWithStatus(currentPlayer, 'home');
            if (homePawns.length > 0 && !isStartCellBlocked(currentPlayer, updatedPlayers)) {
              updatedPlayers = movePawnInState(
                updatedPlayers, currentPlayer.color, homePawns[0].id,
                { status: 'board', cellId: START_CELLS[currentPlayer.color] }
              );
              msg += `Un pion rentre sur la case de départ.`;
            }
          }

          // Trois_Doubles terminé → passer au joueur suivant
          return {
            ...state,
            diceValue,
          lastDiceValue: diceValue,
            consecutiveSixes: 0,
            rollsWithoutMove: 0,
            players: updatedPlayers,
            message: msg,
            ...nextPlayerState({ ...state, players: updatedPlayers }),
          };
        }

        // ── 1er ou 2ème 6 → avancer de 12 cases ─────────────────────────
        const movable = getMovablePawns(currentPlayer, 6, state.players, newConsec);

        const hasActivePawns = currentPlayer.pawns.some(
          p => p.status === 'board' || p.status === 'corridor'
        );
        const hasHomePawns = currentPlayer.pawns.some(p => p.status === 'home');

        // Tous les pions sont 'finished' → passer le tour
        if (movable.length === 0 && !hasActivePawns && !hasHomePawns) {
          return {
            ...state,
            diceValue,
          lastDiceValue: diceValue,
            consecutiveSixes: 0,
            rollsWithoutMove: 0,
            movablePawns: [],
            message: `${currentPlayer.color} lance 6 mais ne peut pas jouer.`,
            ...nextPlayerState(state),
          };
        }

        // Protection anti-boucle infinie : pions bloqués par un barrage
        const newRollsWithoutMove = movable.length === 0
          ? state.rollsWithoutMove + 1
          : 0;

        if (newRollsWithoutMove >= 3) {
          return {
            ...state,
            diceValue,
          lastDiceValue: diceValue,
            consecutiveSixes: 0,
            rollsWithoutMove: 0,
            movablePawns: [],
            message: `${currentPlayer.color} ne peut pas jouer, tour passé.`,
            ...nextPlayerState(state),
          };
        }

        const isAI = currentPlayer.isAI;
        // Pour l'humain avec pions déplaçables : passer par 'showing_result'
        const nextPhase = isAI
          ? 'ai_thinking'
          : (movable.length > 0 ? 'showing_result' : 'roll');

        return {
          ...state,
          diceValue,
          lastDiceValue: diceValue,
          consecutiveSixes: newConsec,
          rollsWithoutMove: newRollsWithoutMove,
          movablePawns: movable,
          phase: nextPhase,
          message: movable.length > 0
            ? `${currentPlayer.color} lance 6 ! Choisissez un pion à avancer de 12.`
            : `${currentPlayer.color} lance 6 ! Pas de pion en jeu, relance…`,
        };
      }

      // ── Résultats 1 à 5 ───────────────────────────────────────────────
      const movable = getMovablePawns(currentPlayer, diceValue, state.players, 0);

      if (movable.length === 0) {
        return {
          ...state,
          diceValue,
          lastDiceValue: diceValue,
          consecutiveSixes: 0,
          rollsWithoutMove: 0,
          movablePawns: [],
          message: `${currentPlayer.color} lance ${diceValue}. Aucun mouvement possible.`,
          ...nextPlayerState(state),
        };
      }

      // Pour l'humain : passer par 'showing_result' pour laisser voir le résultat
      // avant d'activer les pions cliquables (~800ms, géré dans useAI/GameScreen)
      const nextPhase = currentPlayer.isAI ? 'ai_thinking' : 'showing_result';
      return {
        ...state,
        diceValue,
          lastDiceValue: diceValue,
        consecutiveSixes: 0,
        rollsWithoutMove: 0,
        movablePawns: movable,
        phase: nextPhase,
        message: `${currentPlayer.color} lance ${diceValue}. Choisissez un pion.`,
      };
    }

    case 'MOVE_PAWN': {
      const { pawnId } = action.payload;
      const currentPlayer = state.players[state.turnOrder[state.currentPlayerIndex]];
      const pawn = currentPlayer.pawns.find(p => p.id === pawnId);
      const steps = state.diceValue === 6 ? 12 : state.diceValue;

      let updatedPlayers = state.players;
      let msg = '';

      if (pawn.status === 'home') {
        // Rentrer un pion depuis la zone de départ (dé = 5)
        const startCell = START_CELLS[currentPlayer.color];
        const captured = getCapturedPawn(startCell, currentPlayer.color, updatedPlayers);
        if (captured) {
          updatedPlayers = applyCapture(updatedPlayers, captured);
          msg += `Capture de ${captured.color} ! `;
        }
        updatedPlayers = movePawnInState(
          updatedPlayers, currentPlayer.color, pawnId,
          { status: 'board', cellId: startCell }
        );
        msg += `${currentPlayer.color} rentre un pion.`;
      } else {
        // Déplacer un pion en jeu
        const newPos = computeNewPosition(pawn, steps, currentPlayer.color, updatedPlayers);
        if (!newPos) return state;
        const captured = getCapturedPawn(newPos.cellId, currentPlayer.color, updatedPlayers);
        if (captured) {
          updatedPlayers = applyCapture(updatedPlayers, captured);
          msg += `Capture de ${captured.color} ! `;
        }
        updatedPlayers = movePawnInState(
          updatedPlayers, currentPlayer.color, pawnId, newPos
        );
        msg += `${currentPlayer.color} avance de ${steps}.`;
      }

      // Vérifier la victoire
      const updatedCurrentPlayer = updatedPlayers[state.turnOrder[state.currentPlayerIndex]];
      if (checkVictory(updatedCurrentPlayer)) {
        return {
          ...state,
          players: updatedPlayers,
          phase: 'ended',
          screen: 'victory',
          winner: currentPlayer.id,
          movablePawns: [],
          message: `${currentPlayer.color} a gagné !`,
        };
      }

      // ── BUG CORRIGÉ : Relancer après un 6 ────────────────────────────
      // On conserve consecutiveSixes tel quel pour que le compteur
      // continue correctement vers les Trois_Doubles.
      // Avant ce fix, consecutiveSixes était remis à 0 ici, ce qui
      // empêchait d'atteindre 3 et déclenchait une boucle infinie.
      if (state.diceValue === 6 && state.consecutiveSixes < 3) {
        const isAI = currentPlayer.isAI;
        return {
          ...state,
          players: updatedPlayers,
          movablePawns: [],
          // consecutiveSixes est conservé (pas remis à 0) pour compter correctement
          phase: isAI ? 'ai_thinking' : 'roll',
          message: msg + ` Relance !`,
        };
      }

      // Mouvement normal → joueur suivant
      // Si c'était un humain qui jouait → délai de 2s avant le tour suivant
      const wasHuman = !currentPlayer.isAI;
      return {
        ...state,
        players: updatedPlayers,
        movablePawns: [],
        message: msg,
        ...nextPlayerState({ ...state, players: updatedPlayers }, wasHuman),
      };
    }

    // Transition showing_result → move (800ms après le lancer humain)
    case 'SHOW_RESULT_DONE': {
      if (state.phase !== 'showing_result') return state;
      return { ...state, phase: 'move' };
    }

    // Transition between_turns → tour suivant (2s après la fin du tour humain)
    case 'BETWEEN_TURNS_DONE': {
      if (state.phase !== 'between_turns') return state;
      const nextPlayer = state.players[state.turnOrder[state.currentPlayerIndex]];
      return {
        ...state,
        phase: nextPlayer.isAI ? 'ai_thinking' : 'roll',
      };
    }

    case 'NEXT_PLAYER': {
      return { ...state, ...nextPlayerState(state) };
    }

    case 'NEW_GAME': {
      return { ...initialState };
    }

    default:
      return state;
  }
}

function nextPlayerState(state, humanJustPlayed = false) {
  const nextIndex = (state.currentPlayerIndex + 1) % state.turnOrder.length;
  const nextPlayer = state.players[state.turnOrder[nextIndex]];
  // Si un humain vient de jouer → phase 'between_turns' (délai 2s dans GameScreen)
  // Sinon → démarrer directement le tour suivant
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

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return { state, dispatch };
}
