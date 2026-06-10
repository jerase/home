// ============================================================
// TESTS — Handlers extraits du reducer
// Teste chaque handler indépendamment :
//   handleBarrageDepart, handleTroisDoubles, handleRollSix,
//   handleRollNormal, applyPawnEntry, applyPawnMove
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  handleBarrageDepart,
  handleTroisDoubles,
  handleRollSix,
  handleRollNormal,
  applyPawnEntry,
  applyPawnMove,
} from '../useGameState.js';
import { START_CELLS } from '../../logic/constants.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePawn(id, status, cellId = null) {
  return { id, status, cellId };
}

function makePlayer(id, color, isAI = false, pawns = null) {
  return {
    id, color, isAI,
    pawns: pawns ?? [0,1,2,3].map(i => makePawn(i, 'home')),
  };
}

function makeBaseState(overrides = {}) {
  const jaune = makePlayer(0, 'jaune', false);
  const bleu  = makePlayer(1, 'bleu',  true);
  return {
    screen: 'game',
    players: [jaune, bleu],
    turnOrder: [0, 1],
    currentPlayerIndex: 0,
    phase: 'roll',
    diceValue: null,
    lastDiceValue: null,
    consecutiveSixes: 0,
    rollsWithoutMove: 0,
    movablePawns: [],
    winner: null,
    message: '',
    humanColor: 'jaune',
    errorMessage: null,
    ...overrides,
  };
}

// ── handleBarrageDepart ───────────────────────────────────────────────────────

describe('handleBarrageDepart', () => {
  it('passe le tour au joueur suivant', () => {
    const state         = makeBaseState();
    const currentPlayer = state.players[0];
    const next          = handleBarrageDepart(state, currentPlayer, 3);
    expect(next.currentPlayerIndex).toBe(1);
  });

  it('enregistre le diceValue et lastDiceValue', () => {
    const state         = makeBaseState();
    const currentPlayer = state.players[0];
    const next          = handleBarrageDepart(state, currentPlayer, 4);
    expect(next.diceValue).toBeNull();        // remis à null par nextPlayerState
    expect(next.lastDiceValue).toBe(4);       // conservé pour l'affichage
  });

  it('inclut la couleur du joueur dans le message', () => {
    const state         = makeBaseState();
    const currentPlayer = state.players[0];
    const next          = handleBarrageDepart(state, currentPlayer, 2);
    expect(next.message).toContain('jaune');
  });
});

// ── handleTroisDoubles ────────────────────────────────────────────────────────

describe('handleTroisDoubles', () => {
  it('renvoie le pion le plus avancé en zone de départ', () => {
    // Pion avancé sur h-m-g7 (index 3), pion peu avancé sur h-m-g5 (index 1)
    const jaune = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'board', 'h-m-g7'), // plus avancé, non protégé
      makePawn(2, 'home'),
      makePawn(3, 'home'),
    ]);
    const state = makeBaseState({ players: [jaune, makePlayer(1, 'bleu', true)] });
    const next  = handleTroisDoubles(state, jaune, 6);
    // Le pion 1 (h-m-g7, plus avancé) doit être retourné à la maison
    expect(next.players[0].pawns[1].status).toBe('home');
    expect(next.players[0].pawns[0].status).toBe('board'); // l'autre reste
  });

  it('ne fait rien si tous les pions sont protégés', () => {
    const jaune = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g4'), // protégée
      makePawn(1, 'home'),
      makePawn(2, 'home'),
      makePawn(3, 'home'),
    ]);
    const state = makeBaseState({ players: [jaune, makePlayer(1, 'bleu', true)] });
    const next  = handleTroisDoubles(state, jaune, 6);
    // Aucun pion ne doit avoir changé de statut
    expect(next.players[0].pawns[0].status).toBe('board');
    expect(next.message).toContain('protégés');
  });

  it('remet consecutiveSixes à 0', () => {
    const state = makeBaseState({ consecutiveSixes: 2 });
    const next  = handleTroisDoubles(state, state.players[0], 6);
    expect(next.consecutiveSixes).toBe(0);
  });

  it('passe au joueur suivant', () => {
    const state = makeBaseState();
    const next  = handleTroisDoubles(state, state.players[0], 6);
    expect(next.currentPlayerIndex).toBe(1);
  });
});

// ── handleRollSix ─────────────────────────────────────────────────────────────

describe('handleRollSix', () => {
  it('incrémente consecutiveSixes', () => {
    const jaune = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const state = makeBaseState({
      players: [jaune, makePlayer(1, 'bleu', true)],
      consecutiveSixes: 0,
    });
    const next = handleRollSix(state, jaune, 6, 1);
    expect(next.consecutiveSixes).toBe(1);
  });

  it('passe le tour si tous les pions sont finished', () => {
    const jaune = makePlayer(0, 'jaune', false, [
      makePawn(0, 'finished', 'centre'),
      makePawn(1, 'finished', 'centre'),
      makePawn(2, 'finished', 'centre'),
      makePawn(3, 'finished', 'centre'),
    ]);
    const state = makeBaseState({ players: [jaune, makePlayer(1, 'bleu', true)] });
    const next  = handleRollSix(state, jaune, 6, 1);
    expect(next.currentPlayerIndex).toBe(1); // tour passé
  });

  it('passe le tour après 3 relances sans mouvement (anti-boucle)', () => {
    // Pion en jeu mais bloqué → movable sera vide
    const jaune = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g4'), // case protégée, barrage potentiel
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    // Barrage adverse sur la case suivante pour forcer movable = []
    const bleu = makePlayer(1, 'bleu', true, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'board', 'h-m-g5'), // barrage bleu sur h-m-g5
      makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const state = makeBaseState({
      players: [jaune, bleu],
      rollsWithoutMove: 2, // déjà 2 relances sans mouvement
    });
    const next = handleRollSix(state, jaune, 6, 1);
    // Après 3 relances (2+1) → passer le tour
    expect(next.currentPlayerIndex).toBe(1);
    expect(next.rollsWithoutMove).toBe(0);
  });

  it('passe en showing_result pour un humain avec pions déplaçables', () => {
    const jaune = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const state = makeBaseState({ players: [jaune, makePlayer(1, 'bleu', true)] });
    const next  = handleRollSix(state, jaune, 6, 1);
    if (next.movablePawns.length > 0) {
      expect(next.phase).toBe('showing_result');
    }
  });
});

// ── handleRollNormal ──────────────────────────────────────────────────────────

describe('handleRollNormal', () => {
  it('passe le tour si aucun pion en jeu (résultat 1-4)', () => {
    const state = makeBaseState(); // tous home
    const next  = handleRollNormal(state, state.players[0], 3);
    expect(next.currentPlayerIndex).toBe(1);
    expect(next.message).toContain('Aucun mouvement');
  });

  it('retourne les pions déplaçables si des pions sont en jeu', () => {
    const jaune = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const state = makeBaseState({ players: [jaune, makePlayer(1, 'bleu', true)] });
    const next  = handleRollNormal(state, jaune, 2);
    expect(next.movablePawns.length).toBeGreaterThan(0);
  });

  it('passe en showing_result pour un humain avec pions déplaçables', () => {
    const jaune = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const state = makeBaseState({ players: [jaune, makePlayer(1, 'bleu', true)] });
    const next  = handleRollNormal(state, jaune, 2);
    expect(next.phase).toBe('showing_result');
  });

  it('passe en ai_thinking pour une IA avec pions déplaçables', () => {
    // d-m-b5 est bien dans CIRCUIT_BAS (segment DROITE bas)
    const bleu = makePlayer(1, 'bleu', true, [
      makePawn(0, 'board', 'd-m-b5'),
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const state = makeBaseState({
      players: [makePlayer(0, 'jaune', false), bleu],
      turnOrder: [1, 0],
      currentPlayerIndex: 0,
    });
    const next = handleRollNormal(state, bleu, 2);
    expect(next.phase).toBe('ai_thinking');
  });

  it('remet consecutiveSixes à 0', () => {
    const state = makeBaseState({ consecutiveSixes: 2 });
    const next  = handleRollNormal(state, state.players[0], 3);
    expect(next.consecutiveSixes).toBe(0);
  });
});

// ── applyPawnEntry ────────────────────────────────────────────────────────────

describe('applyPawnEntry', () => {
  it('place le pion sur la case de départ', () => {
    const jaune = makePlayer(0, 'jaune', false);
    const { updatedPlayers } = applyPawnEntry([jaune], jaune, 0);
    expect(updatedPlayers[0].pawns[0].status).toBe('board');
    expect(updatedPlayers[0].pawns[0].cellId).toBe(START_CELLS.jaune);
  });

  it('capture un pion adverse seul sur la case de départ', () => {
    // La case de départ est protégée, mais l'entrée autorise quand même la capture
    // (règle spéciale : applyPawnEntry utilise une vérification directe)
    const jaune = makePlayer(0, 'jaune', false);
    const bleu  = makePlayer(1, 'bleu', true, [
      makePawn(0, 'board', START_CELLS.jaune), // seul sur la case de départ jaune
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const { updatedPlayers, msg } = applyPawnEntry([jaune, bleu], jaune, 0);
    // Le pion bleu doit être retourné à la maison
    expect(updatedPlayers[1].pawns[0].status).toBe('home');
    expect(msg).toContain('Capture');
  });

  it('inclut la couleur dans le message', () => {
    const jaune = makePlayer(0, 'jaune', false);
    const { msg } = applyPawnEntry([jaune], jaune, 0);
    expect(msg).toContain('jaune');
  });
});

// ── applyPawnMove ─────────────────────────────────────────────────────────────

describe('applyPawnMove', () => {
  it('déplace le pion du bon nombre de cases', () => {
    const jaune = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g4'), // index 0 dans CIRCUIT_HAUT
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const result = applyPawnMove([jaune], jaune.pawns[0], 2, jaune);
    expect(result).not.toBeNull();
    // Avancer de 2 depuis h-m-g4 (index 0) → h-m-g6 (index 2)
    expect(result.updatedPlayers[0].pawns[0].cellId).toBe('h-m-g6');
  });

  it('retourne null si le déplacement est impossible (chemin bloqué)', () => {
    const jaune = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g4'),
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    // Barrage bleu sur h-m-g5 (case intermédiaire si on avance de 2)
    const bleu = makePlayer(1, 'bleu', true, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'board', 'h-m-g5'), // barrage
      makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const result = applyPawnMove([jaune, bleu], jaune.pawns[0], 2, jaune);
    expect(result).toBeNull();
  });

  it('capture un pion adverse sur la case d\'arrivée', () => {
    const jaune = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g4'),
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const bleu = makePlayer(1, 'bleu', true, [
      makePawn(0, 'board', 'h-m-g5'), // seul sur case non protégée
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const result = applyPawnMove([jaune, bleu], jaune.pawns[0], 1, jaune);
    expect(result).not.toBeNull();
    expect(result.updatedPlayers[1].pawns[0].status).toBe('home'); // capturé
    expect(result.msg).toContain('Capture');
  });
});
