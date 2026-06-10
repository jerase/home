// ============================================================
// TESTS — aiStrategy.js
// Teste les 5 priorités de décision de l'IA
// ============================================================

import { describe, it, expect } from 'vitest';
import { chooseAIPawn } from '../aiStrategy.js';
import { CIRCUIT_HAUT } from '../constants.js';

function makePawn(id, status, cellId = null) {
  return { id, status, cellId };
}

function makePlayer(id, color, isAI = true, pawns = null) {
  return {
    id, color, isAI,
    pawns: pawns ?? [0,1,2,3].map(i => makePawn(i, 'home')),
  };
}

// ── PRIORITÉ 0 : Entrée en jeu ────────────────────────────────────────────

describe('Priorité 0 — Entrée en jeu (dé = 5)', () => {
  it('rentre un pion si moins de 2 pions en jeu', () => {
    const player = makePlayer(0, 'jaune', true, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const result = chooseAIPawn(player, [0, 1], 5, [player]);
    expect(result).toBe(1); // choisit le pion home
  });

  it('avance un pion si déjà 2 pions en jeu', () => {
    const player = makePlayer(0, 'jaune', true, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'board', 'h-m-g6'),
      makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const result = chooseAIPawn(player, [0, 1, 2], 5, [player]);
    expect(result).not.toBe(2); // ne rentre pas un nouveau pion
  });
});

// ── PRIORITÉ 1 : Capture ──────────────────────────────────────────────────

describe('Priorité 1 — Capturer un pion adverse', () => {
  it('choisit le pion qui peut capturer un adverse', () => {
    const jaune = makePlayer(0, 'jaune', true, [
      makePawn(0, 'board', 'h-m-g4'), // avance 1 → h-m-g5 (capture bleu)
      makePawn(1, 'board', 'h-m-g6'), // avance ailleurs
      makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const bleu = makePlayer(1, 'bleu', false, [
      makePawn(0, 'board', 'h-m-g5'), // seul sur case non protégée
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const result = chooseAIPawn(jaune, [0, 1], 1, [jaune, bleu]);
    expect(result).toBe(0);
  });
});

// ── PRIORITÉ 3 : Case protégée ────────────────────────────────────────────

describe('Priorité 3 — Atterrir sur une case protégée', () => {
  it('préfère atterrir sur une case protégée plutôt qu\'avancer normalement', () => {
    // g-m-b3 (index 16) → avance de 1 → g-m-b4 (protégée, index 17)
    // h-m-g6 (index 2) → avance de 1 → h-m-g7 (non protégée)
    // Pion 0 est moins avancé (index 16) mais atteint une case protégée
    // Pion 1 est plus avancé (index 2... non, 2 < 16)
    // En fait h-m-g6 est index 2, g-m-b3 est index 16 → pion 0 est plus avancé
    // La priorité 3 (case protégée) doit l'emporter sur la priorité 4 (plus avancé)
    // Les deux sont éligibles à la priorité 4, mais le pion 0 touche une case protégée
    const player = makePlayer(0, 'jaune', true, [
      makePawn(0, 'board', 'g-m-b3'),  // → g-m-b4 protégée ✓
      makePawn(1, 'board', 'g-m-b4'),  // → g-m-b5 non protégée (plus avancé)
      makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    // Pion 1 est plus avancé (g-m-b4 = index 17) que pion 0 (g-m-b3 = index 16)
    // La priorité 3 doit quand même choisir le pion 0 (case protégée)
    const result = chooseAIPawn(player, [0, 1], 1, [player]);
    expect(result).toBe(0); // case protégée prime sur l'avancement
  });
});

// ── PRIORITÉ 4 : Pion le plus avancé ─────────────────────────────────────

describe('Priorité 4 — Avancer le pion le plus avancé', () => {
  it('choisit le pion avec l\'index le plus élevé', () => {
    const player = makePlayer(0, 'jaune', true, [
      makePawn(0, 'board', 'h-m-g5'), // index 1
      makePawn(1, 'board', 'h-m-g7'), // index 3 → plus avancé
      makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    const result = chooseAIPawn(player, [0, 1], 2, [player]);
    expect(result).toBe(1);
  });

  it('retourne null si movablePawnIds est vide', () => {
    const player = makePlayer(0, 'jaune');
    expect(chooseAIPawn(player, [], 3, [player])).toBeNull();
  });

  it('retourne directement le seul pion disponible', () => {
    const player = makePlayer(0, 'jaune', true, [
      makePawn(0, 'board', 'h-m-g5'),
      makePawn(1, 'home'), makePawn(2, 'home'), makePawn(3, 'home'),
    ]);
    expect(chooseAIPawn(player, [0], 2, [player])).toBe(0);
  });
});
