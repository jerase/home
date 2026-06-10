// ============================================================
// FICHIER : gameRules.ts
// ============================================================

import type { Color, Zone, Pawn, Player, PawnOnCell, Position } from '../types.js';
import {
  CIRCUITS_BY_ZONE, COULOIR, COULOIR_SETS,
  START_CELLS, PROTECTED_CELLS, PLAYER_ZONE,
} from './constants.js';

// ─── Zone et circuit ──────────────────────────────────────────

export function getZone(color: Color): Zone {
  return PLAYER_ZONE[color];
}

export function getCircuit(color: Color): string[] {
  return CIRCUITS_BY_ZONE[getZone(color)];
}

// ─── Utilitaires pions ───────────────────────────────────────

export function pawnsWithStatus(player: Player, status: Pawn['status']): Pawn[] {
  return player.pawns.filter(p => p.status === status);
}

export function pawnsInPlay(player: Player): Pawn[] {
  return player.pawns.filter(
    p => p.status === 'board' || p.status === 'corridor' || p.status === 'finished'
  );
}

export function pawnsOnBoard(player: Player): Pawn[] {
  return player.pawns.filter(p => p.status === 'board' || p.status === 'corridor');
}

export function pawnsOnCell(cellId: string, allPlayers: Player[]): PawnOnCell[] {
  return allPlayers.flatMap(pl =>
    pl.pawns
      .filter(p => (p.status === 'board' || p.status === 'corridor') && p.cellId === cellId)
      .map(p => ({ ...p, color: pl.color, playerId: pl.id }))
  );
}

// ─── Règles sur les cases ─────────────────────────────────────

export function isBarrage(cellId: string, allPlayers: Player[]): boolean {
  const occupants = pawnsOnCell(cellId, allPlayers);
  if (occupants.length < 2) return false;
  return occupants[0].color === occupants[1].color;
}

export function isProtected(cellId: string): boolean {
  return PROTECTED_CELLS.has(cellId);
}

export function isCouloir(cellId: string, color: Color): boolean {
  return COULOIR_SETS[color]?.has(cellId) ?? false;
}

function isLandingBlocked(targetCellId: string, movingColor: Color, allPlayers: Player[]): boolean {
  if (isBarrage(targetCellId, allPlayers)) return true;
  if (isProtected(targetCellId)) {
    const occupants = pawnsOnCell(targetCellId, allPlayers);
    if (occupants.some(p => p.color !== movingColor)) return true;
  }
  return false;
}

export function isStartCellBlocked(player: Player, allPlayers: Player[]): boolean {
  return isBarrage(START_CELLS[player.color], allPlayers);
}

function isAdverseBarrageOnStart(player: Player, allPlayers: Player[]): boolean {
  const startCell = START_CELLS[player.color];
  const occupants = pawnsOnCell(startCell, allPlayers);
  return occupants.length >= 2 && occupants[0].color !== player.color;
}

// ─── Calcul de position ───────────────────────────────────────

export function computeNewPosition(
  pawn: Pawn,
  steps: number,
  playerColor: Color,
  allPlayers: Player[]
): Position | null {
  if (pawn.status === 'finished') return null;

  const circuit    = getCircuit(playerColor);
  const currentIdx = circuit.indexOf(pawn.cellId ?? '');
  if (currentIdx === -1) return null;

  const targetIdx = currentIdx + steps;
  if (targetIdx >= circuit.length) return null;

  const targetCell = circuit[targetIdx];

  for (let i = currentIdx + 1; i < targetIdx; i++) {
    if (isBarrage(circuit[i], allPlayers)) return null;
  }

  if (targetCell === 'centre') {
    return { status: 'finished', cellId: 'centre' };
  }

  if (isLandingBlocked(targetCell, playerColor, allPlayers)) return null;

  return {
    status: isCouloir(targetCell, playerColor) ? 'corridor' : 'board',
    cellId: targetCell,
  };
}

// ─── Capture ──────────────────────────────────────────────────

export function getCapturedPawn(
  targetCellId: string,
  movingColor: Color,
  allPlayers: Player[]
): PawnOnCell | null {
  if (isProtected(targetCellId)) return null;
  if (targetCellId === 'centre') return null;
  const occupants = pawnsOnCell(targetCellId, allPlayers);
  const enemies   = occupants.filter(p => p.color !== movingColor);
  if (enemies.length === 1 && occupants.length === 1) return enemies[0];
  return null;
}

// ─── Pions déplaçables ────────────────────────────────────────

export function getMovablePawns(
  player: Player,
  diceValue: number,
  allPlayers: Player[],
  consecutiveSixes: number
): number[] {
  const inPlay = pawnsOnBoard(player);
  const inHome = pawnsWithStatus(player, 'home');

  if (consecutiveSixes === 3) return [];

  if (diceValue === 5) {
    const movable: number[]  = [];
    const startBlocked   = isStartCellBlocked(player, allPlayers);
    const adverseBarrage = isAdverseBarrageOnStart(player, allPlayers);
    if (inHome.length > 0 && !startBlocked && !adverseBarrage) {
      if (inPlay.length === 0) return inHome.map(p => p.id);
      movable.push(...inHome.map(p => p.id));
    }
    for (const p of inPlay) {
      if (computeNewPosition(p, 5, player.color, allPlayers)) movable.push(p.id);
    }
    return [...new Set(movable)];
  }

  if (diceValue === 6) {
    return inPlay
      .filter(p => computeNewPosition(p, 12, player.color, allPlayers))
      .map(p => p.id);
  }

  if (inPlay.length === 0) return [];
  return inPlay
    .filter(p => computeNewPosition(p, diceValue, player.color, allPlayers))
    .map(p => p.id);
}

// ─── Victoire ────────────────────────────────────────────────

export function checkVictory(player: Player): boolean {
  return player.pawns.every(p => p.status === 'finished');
}

// ─── Trois_Doubles ────────────────────────────────────────────

export function allInPlayOnProtected(player: Player): boolean {
  const inPlay = pawnsOnBoard(player);
  if (inPlay.length === 0) return false;
  return inPlay.every(p => isProtected(p.cellId ?? ''));
}

export function getMostAdvancedUnprotected(player: Player): Pawn | null {
  const circuit    = getCircuit(player.color);
  const candidates = pawnsOnBoard(player).filter(p => !isProtected(p.cellId ?? ''));
  if (candidates.length === 0) return null;
  const withIndex = candidates.map(p => ({ pawn: p, idx: circuit.indexOf(p.cellId ?? '') }));
  return withIndex.reduce((best, cur) => cur.idx >= best.idx ? cur : best).pawn;
}

// ─── Menace ───────────────────────────────────────────────────

export function isThreatened(pawn: Pawn, playerColor: Color, allPlayers: Player[]): boolean {
  if (pawn.status !== 'board') return false;
  if (isProtected(pawn.cellId ?? '')) return false;
  if (isCouloir(pawn.cellId ?? '', playerColor)) return false;

  for (const pl of allPlayers) {
    if (pl.color === playerColor) continue;
    const epCircuit = getCircuit(pl.color);
    const pawnIdx   = epCircuit.indexOf(pawn.cellId ?? '');
    if (pawnIdx === -1) continue;
    for (const ep of pl.pawns) {
      if (ep.status !== 'board') continue;
      const epIdx = epCircuit.indexOf(ep.cellId ?? '');
      if (epIdx === -1) continue;
      if (pawnIdx - epIdx > 0 && pawnIdx - epIdx <= 6) return true;
    }
  }
  return false;
}

// ─── Progression ─────────────────────────────────────────────

export function getPawnProgress(pawn: Pawn, color: Color): number {
  if (pawn.status === 'finished') return 10000;
  const circuit = getCircuit(color);
  const idx = circuit.indexOf(pawn.cellId ?? '');
  return idx >= 0 ? idx : -1;
}
