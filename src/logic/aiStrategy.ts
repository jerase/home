// ============================================================
// FICHIER : aiStrategy.ts
// ============================================================

import type { Color, Player, Pawn } from '../types.js';
import { MIN_PAWNS_TO_SKIP_ENTRY } from './constants.js';
import {
  pawnsOnBoard, pawnsWithStatus, computeNewPosition,
  getCapturedPawn, isProtected, isThreatened, getPawnProgress,
  getCircuit,
} from './gameRules.js';

export function chooseAIPawn(
  player: Player,
  movablePawnIds: number[],
  diceValue: number,
  allPlayers: Player[]
): number | null {
  if (movablePawnIds.length === 0) return null;
  if (movablePawnIds.length === 1) return movablePawnIds[0];

  const inPlay = pawnsOnBoard(player);
  const inHome = pawnsWithStatus(player, 'home');
  const steps  = diceValue === 6 ? 12 : diceValue;

  // Priorité 0 : entrée en jeu
  if (diceValue === 5 && inPlay.length < MIN_PAWNS_TO_SKIP_ENTRY && inHome.length > 0) {
    const homeId = inHome.find(p => movablePawnIds.includes(p.id));
    if (homeId) return homeId.id;
  }

  const playable      = player.pawns.filter(p => movablePawnIds.includes(p.id));
  const boardPlayable = playable.filter(p => p.status !== 'home');

  // Pré-calcul des positions
  const posMap = new Map<number, ReturnType<typeof computeNewPosition>>(
    boardPlayable.map(pawn => [
      pawn.id,
      computeNewPosition(pawn, steps, player.color, allPlayers),
    ])
  );

  // Priorité 1 : capturer
  for (const pawn of boardPlayable) {
    const newPos = posMap.get(pawn.id);
    if (!newPos || newPos.status === 'finished') continue;
    if (getCapturedPawn(newPos.cellId, player.color, allPlayers)) return pawn.id;
  }

  // Priorité 2 : fuir
  const threatened = boardPlayable.filter(p => isThreatened(p, player.color, allPlayers));
  if (threatened.length > 0) return getMostAdvancedId(threatened, player.color);

  // Priorité 3 : case protégée
  for (const pawn of boardPlayable) {
    const newPos = posMap.get(pawn.id);
    if (newPos && isProtected(newPos.cellId)) return pawn.id;
  }

  // Priorité 4 : barrage défensif
  for (const pawn of boardPlayable) {
    const newPos = posMap.get(pawn.id);
    if (!newPos) continue;
    const allyOnTarget = player.pawns.find(
      p => p.id !== pawn.id && p.cellId === newPos.cellId && p.status === 'board'
    );
    if (allyOnTarget && isThreatened(allyOnTarget, player.color, allPlayers)) return pawn.id;
  }

  // Priorité 5 : pion le plus avancé
  if (boardPlayable.length > 0) return getMostAdvancedId(boardPlayable, player.color);

  return movablePawnIds[0];
}

function getMostAdvancedId(pawns: Pawn[], color: Color): number | null {
  if (pawns.length === 0) return null;
  const withScore = pawns.map(p => ({ id: p.id, score: getPawnProgress(p, color) }));
  return withScore.reduce((best, cur) => cur.score >= best.score ? cur : best).id;
}
