// ============================================================
// TESTS — gameRules.js
// Teste toutes les règles du jeu :
//   - Barrage, case protégée, atterrissage bloqué
//   - Déplacement (computeNewPosition)
//   - Capture (getCapturedPawn)
//   - Pions déplaçables (getMovablePawns)
//   - Victoire, Trois_Doubles, menaces
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  isBarrage, isProtected, pawnsOnCell, pawnsOnBoard, pawnsWithStatus,
  computeNewPosition, getCapturedPawn, getMovablePawns,
  checkVictory, allInPlayOnProtected, getMostAdvancedUnprotected,
  isThreatened, getPawnProgress,
} from '../gameRules.js';
import { START_CELLS, CIRCUIT_HAUT, COULOIR } from '../constants.js';

// ── Helpers pour construire des états de test ──────────────────────────────

function makePawn(id, status, cellId = null) {
  return { id, status, cellId };
}

function makePlayer(id, color, isAI = false, pawns = null) {
  return {
    id,
    color,
    isAI,
    pawns: pawns ?? [0,1,2,3].map(i => makePawn(i, 'home')),
  };
}

// ── TESTS : isBarrage ──────────────────────────────────────────────────────

describe('isBarrage', () => {
  it('retourne false si la case est vide', () => {
    const players = [makePlayer(0, 'jaune')];
    expect(isBarrage('h-m-g4', players)).toBe(false);
  });

  it('retourne false si 1 seul pion sur la case', () => {
    const players = [makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'home'),
      makePawn(2, 'home'),
      makePawn(3, 'home'),
    ])];
    expect(isBarrage('h-m-g5', players)).toBe(false);
  });

  it('retourne true si 2 pions de même couleur sur la même case', () => {
    const players = [makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'board', 'h-m-g5'),
      makePawn(2, 'home'),
      makePawn(3, 'home'),
    ])];
    expect(isBarrage('h-m-g5', players)).toBe(true);
  });

  it('retourne false si 2 pions de couleurs différentes', () => {
    const p1 = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const p2 = makePlayer(1, 'bleu', false, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    expect(isBarrage('h-m-g5', [p1, p2])).toBe(false);
  });
});

// ── TESTS : isProtected ────────────────────────────────────────────────────

describe('isProtected', () => {
  it('retourne true pour une case protégée', () => {
    expect(isProtected('h-m-g4')).toBe(true);
    expect(isProtected('b-m-m7')).toBe(true);
    expect(isProtected('g-m-m0')).toBe(true);
  });

  it('retourne false pour une case normale', () => {
    expect(isProtected('h-m-g5')).toBe(false);
    expect(isProtected('b-m-g0')).toBe(false);
  });
});

// ── TESTS : computeNewPosition ─────────────────────────────────────────────

describe('computeNewPosition', () => {
  it('retourne null si le pion est finished', () => {
    const pawn = makePawn(0, 'finished', 'centre');
    expect(computeNewPosition(pawn, 3, 'jaune', [])).toBeNull();
  });

  it('avance correctement sur le circuit', () => {
    // Pion jaune sur h-m-g4 (index 0 du circuit HAUT), avance de 2 → h-m-g6
    const pawn = makePawn(0, 'board', 'h-m-g4');
    const result = computeNewPosition(pawn, 2, 'jaune', []);
    expect(result).toEqual({ status: 'board', cellId: 'h-m-g6' });
  });

  it('retourne status corridor quand le pion entre dans le couloir', () => {
    // Le couloir jaune commence à h-m-m0 (index 62 du circuit HAUT)
    // On place le pion juste avant et on avance de 1
    const circuitIdx = CIRCUIT_HAUT.indexOf('h-m-m0');
    const cellBefore = CIRCUIT_HAUT[circuitIdx - 1];
    const pawn = makePawn(0, 'board', cellBefore);
    const result = computeNewPosition(pawn, 1, 'jaune', []);
    expect(result).toEqual({ status: 'corridor', cellId: 'h-m-m0' });
  });

  it('retourne finished quand le pion atteint centre exactement', () => {
    // Placer le pion sur la dernière case avant centre
    const lastCell = CIRCUIT_HAUT[CIRCUIT_HAUT.length - 2]; // avant "centre"
    const pawn = makePawn(0, 'corridor', lastCell);
    const result = computeNewPosition(pawn, 1, 'jaune', []);
    expect(result).toEqual({ status: 'finished', cellId: 'centre' });
  });

  it('retourne null si le pion dépasserait centre', () => {
    const lastCell = CIRCUIT_HAUT[CIRCUIT_HAUT.length - 2];
    const pawn = makePawn(0, 'corridor', lastCell);
    expect(computeNewPosition(pawn, 2, 'jaune', [])).toBeNull();
  });

  it('retourne null si un barrage bloque le chemin', () => {
    // Pion jaune sur h-m-g4, barrage de bleu sur h-m-g5 (case intermédiaire)
    const pawn = makePawn(0, 'board', 'h-m-g4');
    const blocker = makePlayer(1, 'bleu', false, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'board', 'h-m-g5'),
      makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    expect(computeNewPosition(pawn, 3, 'jaune', [blocker])).toBeNull();
  });

  it('retourne null si la case cible est protégée avec un pion adverse', () => {
    const pawn = makePawn(0, 'board', 'h-m-g5');
    // h-m-d4 est protégée (index dans le circuit)
    // On va simplement tester avec h-m-m0 qui est protégée
    const target = 'h-m-m0';
    const targetIdx = CIRCUIT_HAUT.indexOf(target);
    const srcIdx = targetIdx - 1;
    const srcCell = CIRCUIT_HAUT[srcIdx];
    const movingPawn = makePawn(0, 'board', srcCell);
    const enemy = makePlayer(1, 'bleu', false, [
      makePawn(0, 'board', target),
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    expect(computeNewPosition(movingPawn, 1, 'jaune', [enemy])).toBeNull();
  });
});

// ── TESTS : getCapturedPawn ────────────────────────────────────────────────

describe('getCapturedPawn', () => {
  it('retourne null sur une case protégée', () => {
    const enemy = makePlayer(1, 'bleu', false, [
      makePawn(0, 'board', 'h-m-g4'), // case protégée
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    expect(getCapturedPawn('h-m-g4', 'jaune', [enemy])).toBeNull();
  });

  it('retourne le pion adverse seul sur une case non protégée', () => {
    const enemy = makePlayer(1, 'bleu', false, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const captured = getCapturedPawn('h-m-g5', 'jaune', [enemy]);
    expect(captured).not.toBeNull();
    expect(captured.color).toBe('bleu');
  });

  it('retourne null si 2 pions adverses (barrage) sur la case', () => {
    const enemy = makePlayer(1, 'bleu', false, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'board', 'h-m-g5'),
      makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    expect(getCapturedPawn('h-m-g5', 'jaune', [enemy])).toBeNull();
  });

  it('retourne null si aucun pion adverse sur la case', () => {
    const players = [makePlayer(0, 'jaune')];
    expect(getCapturedPawn('h-m-g5', 'jaune', players)).toBeNull();
  });
});

// ── TESTS : getMovablePawns ────────────────────────────────────────────────

describe('getMovablePawns', () => {
  it('retourne [] si dé 1-4 et aucun pion en jeu', () => {
    const player = makePlayer(0, 'jaune');
    expect(getMovablePawns(player, 3, [player], 0)).toEqual([]);
  });

  it('retourne les pions home si dé = 5 et tous à la maison', () => {
    const player = makePlayer(0, 'jaune');
    const result = getMovablePawns(player, 5, [player], 0);
    expect(result).toEqual([0, 1, 2, 3]);
  });

  it('propose rentrer OU avancer si dé = 5 et pions en jeu', () => {
    const player = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g5'), // en jeu
      makePawn(1, 'home'),
      makePawn(2, 'home'),
      makePawn(3, 'home'),
    ]);
    const result = getMovablePawns(player, 5, [player], 0);
    // Doit contenir l'id du pion en jeu ET un pion home
    expect(result).toContain(0); // pion en jeu
    expect(result).toContain(1); // pion home
  });

  it('retourne [] pour Trois_Doubles (consecutiveSixes = 3)', () => {
    const player = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    expect(getMovablePawns(player, 6, [player], 3)).toEqual([]);
  });

  it('retourne pions déplaçables de 12 cases pour dé = 6', () => {
    const player = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g4'), // peut avancer de 12
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const result = getMovablePawns(player, 6, [player], 0);
    expect(result).toContain(0);
  });
});

// ── TESTS : checkVictory ───────────────────────────────────────────────────

describe('checkVictory', () => {
  it('retourne false si tous les pions sont home', () => {
    const player = makePlayer(0, 'jaune');
    expect(checkVictory(player)).toBe(false);
  });

  it('retourne false si certains pions ne sont pas finished', () => {
    const player = makePlayer(0, 'jaune', false, [
      makePawn(0, 'finished', 'centre'),
      makePawn(1, 'finished', 'centre'),
      makePawn(2, 'finished', 'centre'),
      makePawn(3, 'board', 'h-m-g5'),
    ]);
    expect(checkVictory(player)).toBe(false);
  });

  it('retourne true si les 4 pions sont finished', () => {
    const player = makePlayer(0, 'jaune', false, [
      makePawn(0, 'finished', 'centre'),
      makePawn(1, 'finished', 'centre'),
      makePawn(2, 'finished', 'centre'),
      makePawn(3, 'finished', 'centre'),
    ]);
    expect(checkVictory(player)).toBe(true);
  });
});

// ── TESTS : allInPlayOnProtected ───────────────────────────────────────────

describe('allInPlayOnProtected', () => {
  it('retourne false si aucun pion en jeu', () => {
    const player = makePlayer(0, 'jaune');
    expect(allInPlayOnProtected(player)).toBe(false);
  });

  it('retourne true si tous les pions en jeu sont sur des cases protégées', () => {
    const player = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g4'), // protégée
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    expect(allInPlayOnProtected(player)).toBe(true);
  });

  it('retourne false si au moins un pion n\'est pas protégé', () => {
    const player = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g4'), // protégée
      makePawn(1, 'board', 'h-m-g5'), // non protégée
      makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    expect(allInPlayOnProtected(player)).toBe(false);
  });
});

// ── TESTS : getMostAdvancedUnprotected ─────────────────────────────────────

describe('getMostAdvancedUnprotected', () => {
  it('retourne null si aucun pion en jeu', () => {
    const player = makePlayer(0, 'jaune');
    expect(getMostAdvancedUnprotected(player)).toBeNull();
  });

  it('retourne null si tous les pions sont sur des cases protégées', () => {
    const player = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g4'), // protégée
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    expect(getMostAdvancedUnprotected(player)).toBeNull();
  });

  it('retourne le pion le plus avancé non protégé', () => {
    // h-m-g5 est index 1, h-m-g7 est index 3 dans CIRCUIT_HAUT
    const player = makePlayer(0, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g5'), // index 1
      makePawn(1, 'board', 'h-m-g7'), // index 3 → le plus avancé
      makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const result = getMostAdvancedUnprotected(player);
    expect(result.cellId).toBe('h-m-g7');
  });
});

// ── TESTS : getPawnProgress ────────────────────────────────────────────────

describe('getPawnProgress', () => {
  it('retourne -1 pour un pion home', () => {
    const pawn = makePawn(0, 'home');
    expect(getPawnProgress(pawn, 'jaune')).toBe(-1);
  });

  it('retourne 10000 pour un pion finished', () => {
    const pawn = makePawn(0, 'finished', 'centre');
    expect(getPawnProgress(pawn, 'jaune')).toBe(10000);
  });

  it('retourne l\'index dans le circuit pour un pion board', () => {
    const pawn = makePawn(0, 'board', 'h-m-g4');
    expect(getPawnProgress(pawn, 'jaune')).toBe(0); // index 0 dans CIRCUIT_HAUT
  });

  it('le pion plus avancé a un score plus élevé', () => {
    const pawn1 = makePawn(0, 'board', 'h-m-g4'); // index 0
    const pawn2 = makePawn(1, 'board', 'h-m-g6'); // index 2
    expect(getPawnProgress(pawn2, 'jaune')).toBeGreaterThan(getPawnProgress(pawn1, 'jaune'));
  });
});

// ── TESTS : isThreatened ───────────────────────────────────────────────────

describe('isThreatened', () => {
  it('retourne false si le pion est home', () => {
    const pawn = makePawn(0, 'home');
    expect(isThreatened(pawn, 'jaune', [])).toBe(false);
  });

  it('retourne false si le pion est sur une case protégée', () => {
    const pawn = makePawn(0, 'board', 'h-m-g4'); // protégée
    expect(isThreatened(pawn, 'jaune', [])).toBe(false);
  });

  it('retourne true si un adversaire peut atteindre le pion', () => {
    // Pion jaune sur h-m-g6 (index 2 dans CIRCUIT_HAUT)
    // Pion bleu sur h-m-g5 (index 1 dans CIRCUIT_HAUT du point de vue bleu)
    // Pour que le test soit valide, les deux cases doivent être dans le même circuit adverse
    // On utilise des cases du circuit commun accessibles aux deux joueurs
    const defendingPawn = makePawn(0, 'board', 'g-m-h7');
    const attacker = makePlayer(1, 'jaune', false, [
      makePawn(0, 'board', 'h-m-g7'), // 1 case avant g-m-h7 dans CIRCUIT_HAUT
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    // g-m-h7 est index 4 dans CIRCUIT_HAUT, h-m-g7 est index 3
    // dist = 4 - 3 = 1 → menacé
    expect(isThreatened(defendingPawn, 'vert', [attacker])).toBe(true);
  });
});
